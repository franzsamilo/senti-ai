"use client";

/** Keep in sync with MAX_CHARS in PersonalContextStep and the server-side cap. */
export const MAX_CONTEXT_CHARS = 2000;

export function sanitizePersonalContext(input: string): string {
  let sanitized = input;
  // Strip PH phone numbers
  sanitized = sanitized.replace(/(\+?63|0)[\d\s-]{9,12}/g, "[redacted]");
  // Strip email addresses
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, "[redacted]");
  // Strip social media handles
  sanitized = sanitized.replace(/@[\w.]+/g, "[redacted]");
  return sanitized.trim().slice(0, MAX_CONTEXT_CHARS);
}
