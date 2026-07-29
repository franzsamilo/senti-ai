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

/** Padding lines, kept in-voice so a repaired field never reads as an error. */
const PREDICTION_FILLER = [
  "Mag-o-open ka ng Notes app mamayang 2AM para mag-draft ng message. Hindi mo ise-send. Sa-save mo.",
  "Ise-screenshot mo 'to, isesend sa barkada GC, tapos sasabihin mong 'HAHAHA hindi naman totoo' habang tumatango ka.",
  "May isang tao na ipapa-check mo sa profile mamaya. Alam mo kung sino. Alam din namin.",
  "Mag-a-add ka ng bagong song sa 'healing' playlist mo. Same energy pa rin ng dati. Hindi 'yan healing, repackaging 'yan.",
  "Sasabihin mong busy ka. Ang totoo, three hours ka nang nakatitig sa isang chat na na-seen ka last week.",
];

const TRAIT_FILLER = [
  "Nagpapanggap na chill habang inaaral ang bawat punctuation ng reply nila.",
  "Nire-reward ang bare minimum na parang grand gesture.",
  "Pinapalitan ang confrontation ng cryptic na IG story.",
];

const FLAG_FILLER = [
  "Sasabihin nilang 'okay lang ako' hanggang sa hindi na.",
  "May naka-save pa ring conversation screenshots mula 2023.",
  "Ang tampo, silent film — walang subtitles, ikaw bahala mag-interpret.",
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

/** Coerce to exactly `size` non-empty entries, padding from `filler`. */
function exactly(value: unknown, size: number, filler: string[]): string[] {
  const source = Array.isArray(value) ? value : [];
  const items = source
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0)
    .slice(0, size);

  for (let i = 0; items.length < size; i++) {
    const candidate = filler[i % filler.length];
    // Avoid handing the user the same line twice
    if (!items.includes(candidate)) items.push(candidate);
    else if (i >= filler.length) break;
  }
  // If dedup left us short (tiny filler pools), top up regardless
  while (items.length < size) items.push(filler[items.length % filler.length]);

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
    behavioral_predictions: exactly(
      data.behavioral_predictions,
      5,
      PREDICTION_FILLER
    ),
    toxic_traits: exactly(data.toxic_traits, 3, TRAIT_FILLER),
    red_flags: exactly(data.red_flags, 3, FLAG_FILLER),
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
