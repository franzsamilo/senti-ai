"use client";

import { useEffect, useState, useCallback } from "react";
import NeuralNetworkBg from "@/components/NeuralNetworkBg";
import GlitchText from "@/components/GlitchText";
import StatBox from "@/components/ui/StatBox";

interface TopSongEntry {
  title: string;
  artist: string;
  count: number;
}

interface AnalyticsData {
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
  threatLevelDistribution: Record<string, number>;
  topMBTI: Record<string, number>;
  topAttachment: Record<string, number>;
  topZodiac: Record<string, number>;
  topSongs: TopSongEntry[];
}

const THREAT_COLORS: Record<string, string> = {
  CRITICAL: "#ff0040",
  SEVERE: "#ff3252",
  ELEVATED: "#ff8c00",
  MODERATE: "#ffd000",
  LOW: "#00cc88",
};

const ATTACHMENT_LABELS: Record<string, string> = {
  anxious: "Anxious",
  avoidant: "Avoidant",
  disorganized: "Disorganized",
  secure: "Secure",
};

function DistributionBar({
  label,
  count,
  max,
  color = "#ff3252",
}: {
  label: string;
  count: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="font-mono text-xs text-text-secondary w-28 shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-xs text-text-muted w-8 text-right shrink-0">
        {count}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border-subtle rounded-lg p-5 bg-bg-card">
      <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-4 border-b border-border-subtle pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState<string>("");
  const [authed, setAuthed] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAnalytics = useCallback(
    async (pw: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/analytics?key=${encodeURIComponent(pw)}`);
        if (res.status === 401) {
          setError("Access denied. Wrong password.");
          setAuthed(false);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("admin_key");
          }
          return;
        }
        if (!res.ok) {
          setError("Failed to fetch analytics.");
          return;
        }
        const json: AnalyticsData = await res.json();
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // On mount, check sessionStorage for saved key
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("admin_key");
    if (saved) {
      setPassword(saved);
      setAuthed(true);
      fetchAnalytics(saved);
    }
  }, [fetchAnalytics]);

  // Auto-refresh every 30 seconds when authed
  useEffect(() => {
    if (!authed || !password) return;
    const interval = setInterval(() => {
      fetchAnalytics(password);
    }, 30_000);
    return () => clearInterval(interval);
  }, [authed, password, fetchAnalytics]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const pw = inputVal.trim();
    setPassword(pw);
    setAuthed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_key", pw);
    }
    fetchAnalytics(pw);
  }

  // Compute max values for distribution bars
  const maxThreat = data
    ? Math.max(...Object.values(data.threatLevelDistribution), 1)
    : 1;
  const maxMBTI = data ? Math.max(...Object.values(data.topMBTI), 1) : 1;
  const maxAttachment = data
    ? Math.max(...Object.values(data.topAttachment), 1)
    : 1;
  const maxZodiac = data ? Math.max(...Object.values(data.topZodiac), 1) : 1;

  const sortedMBTI = data
    ? Object.entries(data.topMBTI).sort((a, b) => b[1] - a[1])
    : [];
  const sortedZodiac = data
    ? Object.entries(data.topZodiac).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary font-display">
      <NeuralNetworkBg />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <GlitchText
            text="ADMIN"
            as="h1"
            className="text-5xl font-bold tracking-tight mb-2"
          />
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
            Senti.AI — Analytics Dashboard
          </p>
          {authed && lastUpdated && (
            <p className="font-mono text-xs text-text-muted mt-1">
              Last updated: {lastUpdated}
              {loading && (
                <span className="ml-2 text-accent animate-pulse">
                  Refreshing...
                </span>
              )}
            </p>
          )}
        </div>

        {/* Login gate */}
        {!authed && (
          <div className="max-w-sm mx-auto mt-20">
            <div className="border border-border-subtle rounded-lg p-8 bg-bg-card text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-6">
                Clearance Required
              </p>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  type="password"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Admin password"
                  autoFocus
                  className="bg-white/5 border border-border-subtle rounded-lg px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  className="bg-accent text-white font-mono text-sm uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-accent-secondary transition-colors"
                >
                  Access Dashboard
                </button>
                {error && (
                  <p className="text-threat-critical font-mono text-xs mt-1">
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {authed && !data && !error && (
          <p className="text-center font-mono text-text-muted animate-pulse mt-20">
            Loading analytics...
          </p>
        )}

        {authed && error && (
          <p className="text-center font-mono text-threat-critical mt-20">
            {error}
          </p>
        )}

        {authed && data && (
          <div className="flex flex-col gap-8">
            {/* Hero stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox
                label="Total Analyses"
                value={data.totalAnalyses}
                animate
              />
              <StatBox
                label="Shares"
                value={data.totalShareTapped}
                animate
              />
              <StatBox
                label="Matches Created"
                value={data.totalMatchesCreated}
                animate
              />
              <StatBox
                label="Rate Limit Hits"
                value={data.totalRateLimitHits}
                animate
              />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox
                label="Share Cards"
                value={data.totalShareCardGenerated}
                animate
              />
              <StatBox
                label="Matches Completed"
                value={data.totalMatchesCompleted}
                animate
              />
              <StatBox
                label="Barkada Groups"
                value={data.totalBarkadaGroups}
                animate
              />
              <StatBox
                label="Leaderboard Entries"
                value={data.totalLeaderboardEntries}
                animate
              />
            </div>

            {/* Avg damage score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatBox
                label="Avg Emotional Damage"
                value={parseFloat(data.avgEmotionalDamageScore.toFixed(2))}
                suffix="/10"
                animate
              />
              <StatBox
                label="Spotify Connects"
                value={data.totalSpotifyConnects}
                animate
              />
              <StatBox
                label="Song Requests"
                value={data.totalSongRequests}
                animate
              />
            </div>

            {/* Distributions row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Threat level distribution */}
              <SectionCard title="Threat Level Distribution">
                {Object.keys(THREAT_COLORS).map((level) => (
                  <DistributionBar
                    key={level}
                    label={level}
                    count={data.threatLevelDistribution[level] ?? 0}
                    max={maxThreat}
                    color={THREAT_COLORS[level]}
                  />
                ))}
              </SectionCard>

              {/* Attachment styles */}
              <SectionCard title="Top Attachment Styles">
                {(["anxious", "avoidant", "disorganized", "secure"] as const).map(
                  (style) => (
                    <DistributionBar
                      key={style}
                      label={ATTACHMENT_LABELS[style]}
                      count={data.topAttachment[style] ?? 0}
                      max={maxAttachment}
                    />
                  )
                )}
              </SectionCard>
            </div>

            {/* MBTI + Zodiac row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SectionCard title="Top MBTI Types">
                <div className="max-h-72 overflow-y-auto pr-1 space-y-0.5">
                  {sortedMBTI.length === 0 ? (
                    <p className="font-mono text-xs text-text-muted">
                      No data yet.
                    </p>
                  ) : (
                    sortedMBTI.map(([mbti, count]) => (
                      <DistributionBar
                        key={mbti}
                        label={mbti}
                        count={count}
                        max={maxMBTI}
                        color="#ff8c00"
                      />
                    ))
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Top Zodiac Signs">
                <div className="max-h-72 overflow-y-auto pr-1 space-y-0.5">
                  {sortedZodiac.length === 0 ? (
                    <p className="font-mono text-xs text-text-muted">
                      No data yet.
                    </p>
                  ) : (
                    sortedZodiac.map(([zodiac, count]) => (
                      <DistributionBar
                        key={zodiac}
                        label={zodiac}
                        count={count}
                        max={maxZodiac}
                        color="#ffd000"
                      />
                    ))
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Top 20 songs table */}
            <SectionCard title="Top 20 Songs">
              {data.topSongs.length === 0 ? (
                <p className="font-mono text-xs text-text-muted">
                  No song data yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="font-mono text-xs text-text-muted uppercase tracking-wider pb-3 pr-4 w-8">
                          #
                        </th>
                        <th className="font-mono text-xs text-text-muted uppercase tracking-wider pb-3 pr-4">
                          Title
                        </th>
                        <th className="font-mono text-xs text-text-muted uppercase tracking-wider pb-3 pr-4">
                          Artist
                        </th>
                        <th className="font-mono text-xs text-text-muted uppercase tracking-wider pb-3 text-right">
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topSongs.map((song, i) => (
                        <tr
                          key={`${song.title}:::${song.artist}`}
                          className="border-t border-border-subtle hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="font-mono text-xs text-text-muted py-2.5 pr-4">
                            {i + 1}
                          </td>
                          <td className="py-2.5 pr-4 text-text-primary text-sm">
                            {song.title}
                          </td>
                          <td className="py-2.5 pr-4 text-text-secondary text-xs font-mono">
                            {song.artist}
                          </td>
                          <td className="py-2.5 text-right">
                            <span className="font-mono text-xs text-accent font-bold">
                              {song.count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* Footer */}
            <div className="text-center pt-2 pb-6">
              <p className="font-mono text-xs text-text-muted">
                Auto-refreshes every 30s &mdash; SENTI.AI ADMIN v1.0
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
