/**
 * JSON schemas passed to the Claude API via `output_config.format` so the
 * model's response is guaranteed to parse into our result types.
 *
 * Constraints supported by structured outputs are limited — basic types,
 * `enum`, `const`, `required`, and `additionalProperties: false`. Numeric and
 * length constraints (minimum/maximum/minItems) are NOT enforced, so any
 * count or range requirements live in the prompt text instead.
 */

export const PROFILE_RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "headline",
    "threat_level",
    "drunk_text_probability",
    "ex_stalking_frequency",
    "emotional_damage_score",
    "behavioral_predictions",
    "toxic_traits",
    "red_flags",
    "song_diagnosis",
    "final_verdict",
    "recommended_action",
    "compatibility_warning",
  ],
  properties: {
    headline: {
      type: "string",
      description: "Devastating Taglish one-liner, max 15 words.",
    },
    threat_level: {
      type: "string",
      enum: ["CRITICAL", "SEVERE", "ELEVATED", "MODERATE", "LOW"],
    },
    drunk_text_probability: {
      type: "number",
      description: "0 to 100.",
    },
    ex_stalking_frequency: {
      type: "string",
      description: "Funny, specific description of their stalking cadence.",
    },
    emotional_damage_score: {
      type: "number",
      description: "0.0 to 10.0, one decimal place.",
    },
    behavioral_predictions: {
      type: "array",
      items: { type: "string" },
      description:
        "Exactly 5 brutally specific predictions, 1-2 sentences each, Taglish.",
    },
    toxic_traits: {
      type: "array",
      items: { type: "string" },
      description: "Exactly 3 toxic traits.",
    },
    red_flags: {
      type: "array",
      items: { type: "string" },
      description: "Exactly 3 red flags for their future jowa.",
    },
    song_diagnosis: {
      type: "string",
      description:
        "Psychoanalysis of their specific song choices, 3-4 sentences, naming actual titles.",
    },
    final_verdict: {
      type: "string",
      description: "Devastating closing statement, 2-3 sentences, Taglish.",
    },
    recommended_action: {
      type: "string",
      description: "Absurd recommended action.",
    },
    compatibility_warning: {
      type: "string",
      description: "Warning label for anyone who might date them.",
    },
  },
} as const;

export const MATCH_RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "match_headline",
    "combined_threat_level",
    "compatibility_score",
    "who_texts_first",
    "who_ghosts_first",
    "talking_stage_duration",
    "biggest_red_flag_combo",
    "relationship_prediction",
    "song_overlap_roast",
    "final_match_verdict",
  ],
  properties: {
    match_headline: { type: "string" },
    combined_threat_level: {
      type: "string",
      enum: ["CRITICAL", "SEVERE", "ELEVATED", "MODERATE", "LOW"],
    },
    compatibility_score: { type: "number", description: "0 to 100." },
    who_texts_first: { type: "string" },
    who_ghosts_first: { type: "string" },
    talking_stage_duration: { type: "string" },
    biggest_red_flag_combo: { type: "string" },
    relationship_prediction: {
      type: "string",
      description: "2-3 sentences of savage fortune-telling.",
    },
    song_overlap_roast: { type: "string" },
    final_match_verdict: { type: "string" },
  },
} as const;
