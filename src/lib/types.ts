export type Mood =
  | "yearning"
  | "heartbreak"
  | "letting_go"
  | "kilig"
  | "toxic"
  | "denial"
  | "nostalgia"
  | "devotion"
  | "infatuation"
  | "existential"
  | "hopeless_crush"
  | "forbidden"
  | "sweet_pining"
  | "loyalty"
  | "anxiety"
  | "lost_love"
  | "adoration"
  | "warmth"
  | "obsession"
  | "belonging"
  | "tragic_hope"
  | "jealousy"
  | "unknown";

export interface Song {
  title: string;
  artist: string;
  mood: Mood;
  painIndex: number;
}

export type AttachmentStyle = "anxious" | "avoidant" | "disorganized" | "secure";
export type LoveLanguage = "words" | "acts" | "gifts" | "time" | "touch";
export type ThreatLevel = "CRITICAL" | "SEVERE" | "ELEVATED" | "MODERATE" | "LOW";

/** The five threat meters on the results page. */
export type MetricKey = "instability" | "toxicity" | "delulu" | "sadness" | "healing";

/** 0–100 per meter, with the model's one-line read of why. */
export type Metrics = Record<MetricKey, { value: number; note: string }>;

export interface AnalysisRequest {
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage[];
  zodiac: string;
  fingerprint: string;
}

export interface ProfileResult {
  headline: string;
  threat_level: ThreatLevel;
  drunk_text_probability: number;
  ex_stalking_frequency: string;
  emotional_damage_score: number;
  behavioral_predictions: string[];
  toxic_traits: string[];
  red_flags: string[];
  song_diagnosis: string;
  final_verdict: string;
  recommended_action: string;
  compatibility_warning: string;
  /**
   * Per-meter scores. Optional because profiles stored before scoring was
   * split out (match partners, history entries) don't carry them.
   */
  metrics?: Metrics;
  /** One sentence naming what pushed the damage score to where it is. */
  score_reason?: string;
  /** Top-heavy pain index of the playlist (see lib/scoring.ts). */
  pain_index?: number;
  /**
   * True when this came from the offline template instead of the model.
   * Optional so results stored before this field existed still parse.
   */
  degraded?: boolean;
  /** Short machine reason for a degraded report (e.g. "network", "http_504", "api_529"). */
  degraded_reason?: string;
}

export interface MatchResult {
  match_headline: string;
  combined_threat_level: string;
  compatibility_score: number;
  who_texts_first: string;
  who_ghosts_first: string;
  talking_stage_duration: string;
  biggest_red_flag_combo: string;
  relationship_prediction: string;
  song_overlap_roast: string;
  final_match_verdict: string;
}

export interface UserProfile {
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage[];
  zodiac: string;
  result: ProfileResult;
  timestamp: number;
}
