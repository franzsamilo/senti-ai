import type { ThreatLevel } from "./types";

/**
 * Threat colours for a light page. Each level has three tones:
 *   color — bars, dots, glows (bright, decorative)
 *   ink   — text and outlines (dark enough to read on white)
 *   soft  — tinted backgrounds behind the ink
 *
 * The old palette was tuned for #0a0a0f; on a light background the yellow and
 * green levels were unreadable as text, so text always uses `ink` now.
 */
export const THREAT: Record<ThreatLevel, { color: string; ink: string; soft: string; label: string }> = {
  CRITICAL: { color: "#e11d48", ink: "#be123c", soft: "#ffe4ea", label: "Critical" },
  SEVERE: { color: "#f2542d", ink: "#c2410c", soft: "#ffe9df", label: "Severe" },
  ELEVATED: { color: "#f59e0b", ink: "#b45309", soft: "#fff1d6", label: "Elevated" },
  MODERATE: { color: "#eab308", ink: "#a16207", soft: "#fef6cd", label: "Moderate" },
  LOW: { color: "#10b981", ink: "#047857", soft: "#dcf7eb", label: "Low" },
};

/** Tolerates stored/legacy values that aren't a known level. */
export function threatTone(level: string | undefined) {
  return THREAT[(level ?? "").toUpperCase() as ThreatLevel] ?? THREAT.SEVERE;
}

/** Gold / silver / bronze, tuned to sit on white. */
export const RANK_COLORS: Record<number, string> = {
  1: "#d4a017",
  2: "#8e98a8",
  3: "#b8733a",
};

export const ATTACHMENT_LABELS: Record<string, string> = {
  anxious: "Anxious",
  avoidant: "Avoidant",
  disorganized: "Disorganized",
  secure: "Secure",
};

export const LOVE_LANGUAGE_LABELS: Record<string, string> = {
  words: "Words of Affirmation",
  acts: "Acts of Service",
  gifts: "Receiving Gifts",
  time: "Quality Time",
  touch: "Physical Touch",
};

export const LOVE_LANGUAGE_SHORT: Record<string, string> = {
  words: "Words",
  acts: "Acts",
  gifts: "Gifts",
  time: "Time",
  touch: "Touch",
};

export const SITE_HOST = "senti-ai-sooty.vercel.app";
