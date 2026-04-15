"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

const MBTI_TYPES = [
  "INFP","INFJ","INTP","INTJ","ISFP","ISFJ","ISTP","ISTJ",
  "ENFP","ENFJ","ENTP","ENTJ","ESFP","ESFJ","ESTP","ESTJ",
];
const ATTACHMENT_STYLES = ["anxious", "avoidant", "disorganized", "secure"];
const ZODIACS = [
  "aries","taurus","gemini","cancer","leo","virgo",
  "libra","scorpio","sagittarius","capricorn","aquarius","pisces",
];
const THREAT_LEVELS: ThreatLevel[] = ["CRITICAL","SEVERE","ELEVATED","MODERATE","LOW"];

function getFunnyTitle(entry: LeaderboardEntry): string {
  const feelers = ["INFP","INFJ","ISFP","ISFJ","ENFP","ENFJ","ESFP","ESFJ"];
  const thinkers = ["INTP","INTJ","ISTP","ISTJ","ENTP","ENTJ","ESTP","ESTJ"];

  if (entry.score >= 9.5) return "Emotional Damage Speedrunner";
  if (entry.attachmentStyle === "anxious" && feelers.includes(entry.mbti)) return "Certified Sawi";
  if (entry.attachmentStyle === "avoidant" && thinkers.includes(entry.mbti)) return "Professional Ghoster";
  if (entry.attachmentStyle === "disorganized") return "Push-Pull Champion";
  if (entry.attachmentStyle === "secure" && entry.threat_level === "LOW") return "Suspiciously Healthy";
  if (entry.score >= 9.0) return "Walking Emotional Hazard";

  const fallbacks: Record<ThreatLevel, string> = {
    CRITICAL: "Walking Red Flag",
    SEVERE: "Therapy Candidate",
    ELEVATED: "Emotionally Suspicious",
    MODERATE: "Healing Era Claimant",
    LOW: "Allegedly Fine",
  };
  return fallbacks[entry.threat_level];
}

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(1)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function FilterPill({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-medium transition-all duration-150 shrink-0 cursor-pointer border capitalize"
      style={{
        color: active ? (color ?? "#ff3252") : "#888",
        borderColor: active ? (color ?? "#ff3252") : "rgba(255,255,255,0.1)",
        backgroundColor: active ? `${color ?? "#ff3252"}18` : "transparent",
      }}
    >
      {label}
    </button>
  );
}

function PodiumCard({
  entry,
  rank,
  delay,
}: {
  entry: LeaderboardEntry;
  rank: number;
  delay: number;
}) {
  const color = RANK_COLORS[rank]!;
  const threatColor = THREAT_COLORS[entry.threat_level];
  const score = useCountUp(entry.score);
  const isFirst = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 24 }}
      className={`flex flex-col items-center gap-2 rounded-xl p-4 sm:p-5 text-center ${isFirst ? "sm:order-2 order-1" : rank === 2 ? "sm:order-1 order-2" : "sm:order-3 order-3"}`}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${color}55`,
        boxShadow: `0 0 20px ${color}22`,
        flex: isFirst ? "1.2" : "1",
      }}
    >
      <div
        className={`inline-flex items-center justify-center rounded-full border-2 font-bold font-mono ${isFirst ? "w-12 h-12 text-lg" : "w-10 h-10 text-sm"}`}
        style={{
          color,
          borderColor: color,
          boxShadow: `0 0 12px ${color}44`,
        }}
      >
        #{rank}
      </div>

      <p
        className={`font-bold font-mono ${isFirst ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}
        style={{ color: threatColor }}
      >
        {score}
      </p>
      <p className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
        Emotional Damage
      </p>

      <p className="text-xs font-mono font-medium" style={{ color }}>
        {getFunnyTitle(entry)}
      </p>

      <div className="flex flex-wrap gap-1 justify-center">
        <Chip label={entry.mbti} />
        <Chip label={entry.attachmentStyle} />
        <Chip label={entry.zodiac} />
      </div>

      <span
        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
        style={{
          color: threatColor,
          borderColor: `${threatColor}55`,
          backgroundColor: `${threatColor}18`,
        }}
      >
        {entry.threat_level}
      </span>
    </motion.div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full capitalize border border-white/10 text-[#aaa] bg-white/[0.02]">
      {label}
    </span>
  );
}

function EntryCard({
  entry,
  rank,
  index,
}: {
  entry: LeaderboardEntry;
  rank: number;
  index: number;
}) {
  const threatColor = THREAT_COLORS[entry.threat_level];
  const date = new Date(entry.timestamp).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 28 }}
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,50,82,0.08)]"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span className="w-8 text-center text-sm font-bold font-mono shrink-0 text-[#555]">
        {rank}
      </span>

      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
        <Chip label={entry.mbti} />
        <Chip label={entry.attachmentStyle} />
        <Chip label={entry.zodiac} />
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
          style={{
            color: threatColor,
            borderColor: `${threatColor}55`,
            backgroundColor: `${threatColor}18`,
          }}
        >
          {entry.threat_level}
        </span>
        <span className="text-[10px] font-mono text-[#444]">{date}</span>
      </div>

      <span
        className="text-base sm:text-lg font-bold font-mono shrink-0"
        style={{ color: threatColor }}
      >
        {entry.score.toFixed(1)}
      </span>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterMbti, setFilterMbti] = useState<string | null>(null);
  const [filterAttachment, setFilterAttachment] = useState<string | null>(null);
  const [filterZodiac, setFilterZodiac] = useState<string | null>(null);
  const [filterThreat, setFilterThreat] = useState<ThreatLevel | null>(null);

  const hasFilters = filterMbti || filterAttachment || filterZodiac || filterThreat;

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterMbti && e.mbti !== filterMbti) return false;
      if (filterAttachment && e.attachmentStyle !== filterAttachment) return false;
      if (filterZodiac && e.zodiac !== filterZodiac) return false;
      if (filterThreat && e.threat_level !== filterThreat) return false;
      return true;
    });
  }, [entries, filterMbti, filterAttachment, filterZodiac, filterThreat]);

  const clearFilters = () => {
    setFilterMbti(null);
    setFilterAttachment(null);
    setFilterZodiac(null);
    setFilterThreat(null);
  };

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

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-[#e8e8e8] overflow-x-hidden">
      <NeuralNetworkBg />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-6">
          <p className="text-[#555] font-mono text-xs tracking-[0.3em] uppercase mb-3">
            SENTI.AI — CLASSIFIED DATABASE
          </p>
          <GlitchText
            text="MOST EMOTIONALLY DAMAGED"
            as="h1"
            className="text-2xl sm:text-5xl font-bold text-[#e8e8e8] mb-3"
          />
          <p className="text-[#888] font-mono text-xs tracking-[0.2em] uppercase">
            {entries.length} profile{entries.length !== 1 ? "s" : ""} in the database
          </p>
        </div>

        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider shrink-0 w-12">MBTI</span>
            {MBTI_TYPES.map((t) => (
              <FilterPill key={t} label={t} active={filterMbti === t} onClick={() => setFilterMbti(filterMbti === t ? null : t)} />
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider shrink-0 w-12">Attach</span>
            {ATTACHMENT_STYLES.map((a) => (
              <FilterPill key={a} label={a} active={filterAttachment === a} onClick={() => setFilterAttachment(filterAttachment === a ? null : a)} />
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider shrink-0 w-12">Zodiac</span>
            {ZODIACS.map((z) => (
              <FilterPill key={z} label={z} active={filterZodiac === z} onClick={() => setFilterZodiac(filterZodiac === z ? null : z)} />
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider shrink-0 w-12">Threat</span>
            {THREAT_LEVELS.map((t) => (
              <FilterPill key={t} label={t} active={filterThreat === t} color={THREAT_COLORS[t]} onClick={() => setFilterThreat(filterThreat === t ? null : t)} />
            ))}
            {hasFilters && (
              <button onClick={clearFilters} className="text-[10px] font-mono text-[#ff3252] hover:text-white transition-colors shrink-0 ml-2 cursor-pointer">
                Clear All
              </button>
            )}
          </div>
        </div>

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

        <AnimatePresence mode="wait">
          {!loading && !error && filtered.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <GlitchText text="No emotional damage detected..." as="p" className="text-lg font-bold text-[#e8e8e8] mb-2" />
              <p className="text-[#555] font-mono text-sm">...suspicious.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !error && filtered.length > 0 && (
          <>
            {top3.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {top3.map((entry, i) => (
                  <PodiumCard key={`podium-${entry.timestamp}-${entry.score}-${entry.mbti}`} entry={entry} rank={i + 1} delay={i === 0 ? 0 : i === 1 ? 0.15 : 0.3} />
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <div className="flex flex-col gap-2">
                {rest.map((entry, i) => (
                  <EntryCard key={`entry-${entry.timestamp}-${entry.score}-${entry.mbti}`} entry={entry} rank={i + 4} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="text-[#888] hover:text-[#ff3252] font-mono text-sm transition-colors duration-200">
            ← Take your scan
          </Link>
        </div>
      </div>
    </div>
  );
}
