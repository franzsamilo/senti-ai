interface Analytics {
  totalAnalyses: number;
  totalShareCardGenerated: number;
  totalShareTapped: number;
  totalMatchesCreated: number;
  totalMatchesCompleted: number;
  totalBarkadaGroups: number;
  totalLeaderboardEntries: number;
  totalRateLimitHits: number;
  totalSpotifyConnects: number;
  totalWithPersonalContext: number;
  totalSongRequests: number;
  avgEmotionalDamageScore: number;
  totalDamageScoreSum: number;
  threatLevelDistribution: Record<string, number>;
  topMBTI: Record<string, number>;
  topAttachment: Record<string, number>;
  topZodiac: Record<string, number>;
  topSongs: Record<string, number>; // key: "title:::artist", value: count
}

const analytics: Analytics = {
  totalAnalyses: 0,
  totalShareCardGenerated: 0,
  totalShareTapped: 0,
  totalMatchesCreated: 0,
  totalMatchesCompleted: 0,
  totalBarkadaGroups: 0,
  totalLeaderboardEntries: 0,
  totalRateLimitHits: 0,
  totalSpotifyConnects: 0,
  totalWithPersonalContext: 0,
  totalSongRequests: 0,
  avgEmotionalDamageScore: 0,
  totalDamageScoreSum: 0,
  threatLevelDistribution: {},
  topMBTI: {},
  topAttachment: {},
  topZodiac: {},
  topSongs: {},
};

export function trackEvent(type: string, metadata?: Record<string, unknown>) {
  switch (type) {
    case "analysis":
      analytics.totalAnalyses++;
      if (metadata?.score && typeof metadata.score === "number") {
        analytics.totalDamageScoreSum += metadata.score;
        analytics.avgEmotionalDamageScore =
          analytics.totalDamageScoreSum / analytics.totalAnalyses;
      }
      if (metadata?.threatLevel && typeof metadata.threatLevel === "string") {
        analytics.threatLevelDistribution[metadata.threatLevel] =
          (analytics.threatLevelDistribution[metadata.threatLevel] || 0) + 1;
      }
      if (metadata?.mbti && typeof metadata.mbti === "string") {
        analytics.topMBTI[metadata.mbti] =
          (analytics.topMBTI[metadata.mbti] || 0) + 1;
      }
      if (metadata?.attachment && typeof metadata.attachment === "string") {
        analytics.topAttachment[metadata.attachment] =
          (analytics.topAttachment[metadata.attachment] || 0) + 1;
      }
      if (metadata?.zodiac && typeof metadata.zodiac === "string") {
        analytics.topZodiac[metadata.zodiac] =
          (analytics.topZodiac[metadata.zodiac] || 0) + 1;
      }
      if (metadata?.songs && Array.isArray(metadata.songs)) {
        for (const s of metadata.songs as { title: string; artist: string }[]) {
          const key = `${s.title}:::${s.artist}`;
          analytics.topSongs[key] = (analytics.topSongs[key] || 0) + 1;
        }
      }
      break;
    case "share_card":
      analytics.totalShareCardGenerated++;
      break;
    case "share_tap":
      analytics.totalShareTapped++;
      break;
    case "match_created":
      analytics.totalMatchesCreated++;
      break;
    case "match_completed":
      analytics.totalMatchesCompleted++;
      break;
    case "barkada_created":
      analytics.totalBarkadaGroups++;
      break;
    case "leaderboard_entry":
      analytics.totalLeaderboardEntries++;
      break;
    case "rate_limit_hit":
      analytics.totalRateLimitHits++;
      break;
    case "spotify_connect":
      analytics.totalSpotifyConnects++;
      break;
    case "personal_context":
      analytics.totalWithPersonalContext++;
      break;
    case "song_request":
      analytics.totalSongRequests++;
      break;
  }
}

export interface TopSongEntry {
  title: string;
  artist: string;
  count: number;
}

export interface AnalyticsSnapshot extends Omit<Analytics, "topSongs"> {
  topSongs: TopSongEntry[];
}

export function getAnalytics(): AnalyticsSnapshot {
  const topSongsArray: TopSongEntry[] = Object.entries(analytics.topSongs)
    .map(([key, count]) => {
      const [title, artist] = key.split(":::");
      return { title, artist, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return { ...analytics, topSongs: topSongsArray };
}
