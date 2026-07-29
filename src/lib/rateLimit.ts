import { ANALYSIS_LIMITS_ENABLED, DAILY_ANALYSIS_LIMIT } from "./limits";

const ipStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_REQUESTS = DAILY_ANALYSIS_LIMIT;
const isDev = process.env.NODE_ENV === "development";

const UNLIMITED = { allowed: true, remaining: Number.POSITIVE_INFINITY };

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  // Disabled for the private testing period — see src/lib/limits.ts
  if (!ANALYSIS_LIMITS_ENABLED) return UNLIMITED;

  // No limits in development
  if (isDev) return UNLIMITED;

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
