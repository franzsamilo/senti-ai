import type { AttachmentStyle, LoveLanguage, ProfileResult, Song, ThreatLevel } from "./types";

/** A finished report plus the answers that produced it. */
export interface ReportSnapshot {
  result: ProfileResult;
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage[];
  zodiac: string;
  createdAt: number;
}

export interface HistoryEntry {
  score: number;
  threat_level: ThreatLevel;
  headline: string;
  mbti: string;
  timestamp: number;
  /** Absent on entries written before per-meter scoring. */
  delulu?: number;
  healing?: number;
}

const LAST_REPORT_KEY = "senti_last_report";
const HISTORY_KEY = "senti_history";
const HISTORY_LIMIT = 10;

export function saveLastReport(snapshot: ReportSnapshot): void {
  try {
    localStorage.setItem(LAST_REPORT_KEY, JSON.stringify(snapshot));
  } catch {}
}

export function loadLastReport(): ReportSnapshot | null {
  try {
    const raw = localStorage.getItem(LAST_REPORT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReportSnapshot;
    return parsed?.result?.headline ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Append to the deterioration tracker. Called once when a report arrives —
 * not when one is displayed — so reopening the last report doesn't log a
 * phantom second scan.
 */
export function appendHistory(snapshot: ReportSnapshot): void {
  try {
    const history = loadHistory();
    history.push({
      score: snapshot.result.emotional_damage_score,
      threat_level: snapshot.result.threat_level,
      headline: snapshot.result.headline,
      mbti: snapshot.mbti,
      timestamp: snapshot.createdAt,
      delulu: snapshot.result.metrics?.delulu.value,
      healing: snapshot.result.metrics?.healing.value,
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-HISTORY_LIMIT)));
  } catch {}
}

/**
 * True once this browser has a finished report. The leaderboard and history
 * stay hidden until then: they show damage scores and threat stamps, and the
 * roast is meant to be a surprise (see "Don't spoil the roast" in CLAUDE.md).
 */
export function hasFinishedScan(): boolean {
  return loadLastReport() !== null || loadHistory().length > 0;
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}
