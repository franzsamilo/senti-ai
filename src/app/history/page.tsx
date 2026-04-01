"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NeuralNetworkBg from "@/components/NeuralNetworkBg";
import GlitchText from "@/components/GlitchText";
import { ThreatLevel } from "@/lib/types";

interface HistoryEntry {
  score: number;
  threat_level: ThreatLevel;
  headline: string;
  mbti: string;
  timestamp: number;
}

const THREAT_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: "#ff0040",
  SEVERE: "#ff3252",
  ELEVATED: "#ff8c00",
  MODERATE: "#ffd000",
  LOW: "#00cc88",
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateLong(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScoreChangeBanner({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length < 2) return null;

  const latest = entries[entries.length - 1];
  const previous = entries[entries.length - 2];
  const diff = latest.score - previous.score;
  const pct = Math.abs(Math.round((diff / previous.score) * 100));

  let message: string;
  let color: string;

  if (diff > 0) {
    message = `Your emotional damage has increased ${pct}% since last time. Seek help.`;
    color = "#ff3252";
  } else if (diff < 0) {
    message = `Suspicious. Are you lying? Your score decreased ${pct}%.`;
    color = "#00cc88";
  } else {
    message = "Consistent emotional damage. At least you're stable.";
    color = "#ffd000";
  }

  return (
    <div
      className="rounded-xl p-4 border font-mono text-sm text-center"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        borderColor: color,
        color,
      }}
    >
      {message}
    </div>
  );
}

function BarChart({ entries }: { entries: HistoryEntry[] }) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5 border overflow-hidden"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <p className="font-mono text-xs text-[#555555] uppercase tracking-widest mb-5">
        DAMAGE OVER TIME
      </p>
      <div className="flex items-end gap-1.5 sm:gap-3 h-32 overflow-x-auto pb-1">
        {entries.map((entry, i) => {
          const heightPct = (entry.score / 10) * 100;
          const color = THREAT_COLORS[entry.threat_level];
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[24px]">
              <span
                className="font-mono text-[9px] sm:text-[10px] font-bold leading-none"
                style={{ color }}
              >
                {entry.score.toFixed(1)}
              </span>
              <div className="w-full flex items-end" style={{ height: "80px" }}>
                <div
                  className="w-full rounded-t transition-all duration-700"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: color,
                    opacity: 0.8,
                    minHeight: "4px",
                  }}
                />
              </div>
              <span className="font-mono text-[8px] sm:text-[10px] text-[#555555] truncate w-full text-center">
                {formatDate(entry.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EntryCard({ entry }: { entry: HistoryEntry }) {
  const color = THREAT_COLORS[entry.threat_level];
  const truncatedHeadline =
    entry.headline.length > 80
      ? entry.headline.slice(0, 77) + "..."
      : entry.headline;

  return (
    <div
      className="rounded-xl p-4 border flex flex-col gap-2"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <p className="text-[#e8e8e8] text-sm leading-snug">{truncatedHeadline}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="font-mono text-xs font-bold"
          style={{ color }}
        >
          {entry.score.toFixed(1)} / 10
        </span>
        <span
          className="font-mono text-[10px] px-2 py-0.5 rounded border"
          style={{ color, borderColor: color, backgroundColor: `${color}15` }}
        >
          {entry.threat_level}
        </span>
        {entry.mbti && (
          <span className="font-mono text-[10px] text-[#888888]">
            {entry.mbti}
          </span>
        )}
        <span className="font-mono text-[10px] text-[#555555]">
          {formatDateLong(entry.timestamp)}
        </span>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("senti_history");
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryEntry[];
        setEntries(parsed);
      }
    } catch {}
    setLoaded(true);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0a0a0f] text-[#e8e8e8] overflow-x-hidden">
      <NeuralNetworkBg />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <GlitchText
            text="HISTORY"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-[#e8e8e8]"
            as="h1"
          />
          <p className="font-mono text-xs text-[#888888] uppercase tracking-widest">
            EMOTIONAL DETERIORATION TRACKER
          </p>
        </div>

        {/* Content */}
        {!loaded ? null : entries.length === 0 ? (
          <div
            className="rounded-xl p-8 border text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <p className="font-mono text-sm text-[#555555]">
              No history yet. Complete your first scan.
            </p>
          </div>
        ) : (
          <>
            {/* Bar chart */}
            <BarChart entries={entries} />

            {/* Score change comparison */}
            <ScoreChangeBanner entries={entries} />

            {/* Entry list — reverse chronological */}
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs text-[#555555] uppercase tracking-widest">
                SCAN LOG — {entries.length} ENTR{entries.length === 1 ? "Y" : "IES"}
              </p>
              {[...entries].reverse().map((entry, i) => (
                <EntryCard key={i} entry={entry} />
              ))}
            </div>
          </>
        )}

        {/* Back link */}
        <div className="flex justify-center pt-2">
          <Link
            href="/"
            className="font-mono text-xs text-[#888888] hover:text-[#ff3252] transition-colors"
          >
            ← Take another scan
          </Link>
        </div>
      </div>
    </main>
  );
}
