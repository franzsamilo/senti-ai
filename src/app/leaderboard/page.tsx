"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NeuralNetworkBg from "@/components/NeuralNetworkBg";
import GlitchText from "@/components/GlitchText";
import type { ThreatLevel } from "@/lib/types";
import type { LeaderboardEntry } from "@/app/api/leaderboard/route";

const THREAT_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: "#ff0040",
  SEVERE: "#ff3252",
  ELEVATED: "#ff8c00",
  MODERATE: "#ffd000",
  LOW: "#00cc88",
};

const RANK_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

function RankBadge({ rank }: { rank: number }) {
  const color = RANK_COLORS[rank];
  if (color) {
    return (
      <span
        style={{ color, borderColor: color }}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold font-mono flex-shrink-0"
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-xs font-bold font-mono flex-shrink-0 text-[#888]">
      {rank}
    </span>
  );
}

function ThreatBadge({ level }: { level: ThreatLevel }) {
  return (
    <span
      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
      style={{
        color: THREAT_COLORS[level],
        borderColor: THREAT_COLORS[level],
        backgroundColor: `${THREAT_COLORS[level]}18`,
      }}
    >
      {level}
    </span>
  );
}

function EntryCard({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  const accentColor = RANK_COLORS[rank];
  const date = new Date(entry.timestamp).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-lg"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: accentColor
          ? `1px solid ${accentColor}55`
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: accentColor ? `0 0 12px ${accentColor}22` : undefined,
      }}
    >
      <RankBadge rank={rank} />

      <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 items-center">
        <div>
          <p className="text-[#888] text-[10px] font-mono uppercase tracking-widest">MBTI</p>
          <p className="text-[#e8e8e8] text-sm font-bold font-mono">{entry.mbti}</p>
        </div>
        <div>
          <p className="text-[#888] text-[10px] font-mono uppercase tracking-widest">Attachment</p>
          <p className="text-[#e8e8e8] text-sm font-mono capitalize">{entry.attachmentStyle}</p>
        </div>
        <div>
          <p className="text-[#888] text-[10px] font-mono uppercase tracking-widest">Zodiac</p>
          <p className="text-[#e8e8e8] text-sm font-mono capitalize">{entry.zodiac}</p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <ThreatBadge level={entry.threat_level} />
          <p className="text-[#555] text-[10px] font-mono">{date}</p>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-[#888] text-[10px] font-mono uppercase tracking-widest">Score</p>
        <p
          className="text-lg font-bold font-mono"
          style={{ color: THREAT_COLORS[entry.threat_level] }}
        >
          {entry.score.toFixed(1)}
        </p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setEntries(data.entries ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-[#e8e8e8] overflow-x-hidden">
      <NeuralNetworkBg />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#555] font-mono text-xs tracking-[0.3em] uppercase mb-3">
            SENTI.AI — CLASSIFIED DATABASE
          </p>

          <GlitchText
            text="LEADERBOARD"
            as="h1"
            className="text-4xl sm:text-5xl font-bold text-[#e8e8e8] mb-3"
          />

          <p className="text-[#888] font-mono text-xs tracking-[0.2em] uppercase">
            EMOTIONAL DAMAGE RANKINGS — TOP 50
          </p>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-20 text-[#555] font-mono text-sm">
            <span className="animate-pulse">▶ LOADING RANKINGS...</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-[#ff3252] font-mono text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#555] font-mono text-sm">
              No entries yet. Be the first to submit your score.
            </p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="flex flex-col gap-2">
            {entries.map((entry, idx) => (
              <EntryCard key={`${entry.timestamp}-${idx}`} entry={entry} rank={idx + 1} />
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-[#888] hover:text-[#ff3252] font-mono text-sm transition-colors duration-200"
          >
            ← Take your scan
          </Link>
        </div>
      </div>
    </div>
  );
}
