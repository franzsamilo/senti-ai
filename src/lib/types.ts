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
