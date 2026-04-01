export function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() ?? "unknown",
  ];
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function getRemainingAnalyses(fingerprint: string): number {
  // No limits on localhost
  if (typeof window !== "undefined" && window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return 999;
  }

  const key = `senti_usage_${fingerprint}`;
  const today = new Date().toDateString();
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) return Math.max(0, 2 - data.count);
    }
  } catch {}
  return 2;
}

export function recordAnalysis(fingerprint: string): void {
  const key = `senti_usage_${fingerprint}`;
  const today = new Date().toDateString();
  try {
    const stored = localStorage.getItem(key);
    let count = 1;
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) count = data.count + 1;
    }
    localStorage.setItem(key, JSON.stringify({ date: today, count }));
  } catch {}
}
