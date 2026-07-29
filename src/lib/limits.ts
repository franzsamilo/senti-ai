/**
 * Master switch for the per-browser / per-IP analysis limit.
 *
 * Turned OFF for the private testing period — the app isn't public yet and
 * running the full flow repeatedly against prod is the point. The limiting
 * code is intact on both sides (localStorage + fingerprint on the client,
 * IP window on the server) and gated behind this one constant, so re-enabling
 * before launch is a one-line change.
 *
 * ⚠️ Turn this back on before the app is shared publicly. Every analysis is a
 * paid Claude API call, and with limits off a single visitor can run them in
 * a loop.
 */
export const ANALYSIS_LIMITS_ENABLED = false;

/** Analyses allowed per browser per day when limits are enabled. */
export const DAILY_ANALYSIS_LIMIT = 2;
