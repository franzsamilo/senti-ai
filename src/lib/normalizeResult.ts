import type { ProfileResult, MatchResult, ThreatLevel } from "./types";

/**
 * Structured outputs guarantee the SHAPE of the model's response — the right
 * keys, the right primitive types, a valid threat_level enum. They do not
 * guarantee the things the dashboard actually depends on: exactly 5
 * predictions, exactly 3 traits, a score inside 0-10, non-empty strings.
 * The JSON-schema subset the API accepts has no minItems/minimum/maxLength.
 *
 * So the schema is the parser and this is the validator. Everything below
 * repairs rather than rejects — a user mid-flow should never see an error
 * screen because the model returned four predictions instead of five.
 */

const THREAT_LEVELS: ThreatLevel[] = [
  "CRITICAL",
  "SEVERE",
  "ELEVATED",
  "MODERATE",
  "LOW",
];

function str(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  // Models occasionally wrap a field in stray quotes or markdown emphasis
  const cleaned = value.trim().replace(/^["'`*_\s]+|["'`*_\s]+$/g, "");
  return cleaned.length > 0 ? cleaned : fallback;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Trim to at most `max` non-empty, de-duplicated entries.
 *
 * Deliberately does NOT pad. An earlier version topped short arrays up from a
 * fixed filler pool, which meant any two users whose reports came back short
 * received the exact same lines — the single worst thing this app can do,
 * since the first thing users do is compare results with friends. A report
 * with four sharp predictions beats one with five where the fifth is shared
 * with every other user.
 */
function upTo(value: unknown, max: number): string[] {
  const source = Array.isArray(value) ? value : [];
  const seen = new Set<string>();
  const items: string[] = [];

  for (const item of source) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue; // the model occasionally repeats itself
    seen.add(key);
    items.push(trimmed);
    if (items.length === max) break;
  }

  return items;
}

function threatLevel(value: unknown, score: number): ThreatLevel {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
  const match = THREAT_LEVELS.find((level) => level === raw);
  if (match) {
    // Guard the one contradiction users notice instantly: a 9.4/10 damage
    // score badged MODERATE. Only ever escalates, never softens the roast.
    if (score >= 9 && (match === "MODERATE" || match === "LOW")) return "CRITICAL";
    if (score >= 7.5 && match === "LOW") return "SEVERE";
    return match;
  }
  // Nothing usable — derive from the score
  if (score >= 9) return "CRITICAL";
  if (score >= 7.5) return "SEVERE";
  if (score >= 6) return "ELEVATED";
  if (score >= 4) return "MODERATE";
  return "LOW";
}

export function normalizeProfileResult(raw: unknown): ProfileResult {
  const data = (raw ?? {}) as Record<string, unknown>;

  const score = Number(
    clamp(data.emotional_damage_score, 0, 10, 7.5).toFixed(1)
  );

  return {
    headline: str(data.headline, "Diagnosis: hindi ka okay, pero alam mo na 'yan."),
    threat_level: threatLevel(data.threat_level, score),
    drunk_text_probability: Math.round(
      clamp(data.drunk_text_probability, 0, 100, 72)
    ),
    ex_stalking_frequency: str(
      data.ex_stalking_frequency,
      "Tuwing may bagong story. So, araw-araw."
    ),
    emotional_damage_score: score,
    behavioral_predictions: upTo(data.behavioral_predictions, 5),
    toxic_traits: upTo(data.toxic_traits, 3),
    red_flags: upTo(data.red_flags, 3),
    song_diagnosis: str(
      data.song_diagnosis,
      "Ang playlist mo, hindi taste — evidence 'yan."
    ),
    final_verdict: str(
      data.final_verdict,
      "Hindi ka pa move on. Ang na-move on lang, yung playlist mo — same songs, bagong pangalan ng folder."
    ),
    recommended_action: str(
      data.recommended_action,
      "Isara ang Spotify. Hawakan ang damo. Tawagan ang lola mo."
    ),
    compatibility_warning: str(
      data.compatibility_warning,
      "Handle with care. Reads 'k' as a personal attack."
    ),
  };
}

export function normalizeMatchResult(raw: unknown): MatchResult {
  const data = (raw ?? {}) as Record<string, unknown>;

  return {
    match_headline: str(
      data.match_headline,
      "Dalawang sawi, isang universe. Charot."
    ),
    combined_threat_level: threatLevel(data.combined_threat_level, 8),
    compatibility_score: Math.round(clamp(data.compatibility_score, 0, 100, 42)),
    who_texts_first: str(data.who_texts_first, "Yung mas anxious. Laging siya."),
    who_ghosts_first: str(data.who_ghosts_first, "Yung mas mabilis mag-'I need space'."),
    talking_stage_duration: str(
      data.talking_stage_duration,
      "8 months. Walang DTR. Walang closure."
    ),
    biggest_red_flag_combo: str(
      data.biggest_red_flag_combo,
      "Parehong naghihintay na yung isa ang unang magsalita."
    ),
    relationship_prediction: str(
      data.relationship_prediction,
      "Magiging maganda ang first two months. Pagkatapos, magiging project manager ang isa at unpaid intern ang isa."
    ),
    song_overlap_roast: str(
      data.song_overlap_roast,
      "Magkapareho kayo ng sad songs. Hindi 'yan compatibility, shared symptom 'yan."
    ),
    final_match_verdict: str(
      data.final_match_verdict,
      "Pwede kayo. Hindi ibig sabihin dapat."
    ),
  };
}
