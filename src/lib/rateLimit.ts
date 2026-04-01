const ipStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_REQUESTS = 2;
const isDev = process.env.NODE_ENV === "development";

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  // No limits in development
  if (isDev) return { allowed: true, remaining: 999 };

  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now > entry.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}
