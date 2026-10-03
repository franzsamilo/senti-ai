"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BrandMark from "@/components/ui/BrandMark";
import { LinkButton } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";
import { useCountUp } from "@/components/ui/StatBox";
import type { ThreatLevel } from "@/lib/types";
import type { LeaderboardEntry } from "@/app/api/leaderboard/route";
import { ATTACHMENT_LABELS, RANK_COLORS, THREAT, threatTone } from "@/lib/theme";

const MBTI_TYPES = [
  "INFP", "INFJ", "INTP", "INTJ", "ISFP", "ISFJ", "ISTP", "ISTJ",
  "ENFP", "ENFJ", "ENTP", "ENTJ", "ESFP", "ESFJ", "ESTP", "ESTJ",
];
const ATTACHMENT_STYLES = ["anxious", "avoidant", "disorganized", "secure"];
const ZODIACS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];
const THREAT_LEVELS: ThreatLevel[] = ["CRITICAL", "SEVERE", "ELEVATED", "MODERATE", "LOW"];

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function getFunnyTitle(entry: LeaderboardEntry): string {
  const feeler = entry.mbti.includes("F");
  if (entry.score >= 9.5) return "Emotional Damage Speedrunner";
  if (entry.attachmentStyle === "anxious" && feeler) return "Certified Sawi";
  if (entry.attachmentStyle === "avoidant" && !feeler) return "Professional Ghoster";
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

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors cursor-pointer border ${
        active ? "text-white border-transparent" : "text-text-secondary bg-white/70 border-white hover:bg-white"
      }`}
      style={active ? { background: "var(--dusk-button)" } : undefined}
    >
      {label}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5">
      <span className="text-[12px] font-medium text-text-muted shrink-0 w-[68px]">{label}</span>
      {children}
    </div>
  );
}

function PodiumCard({ entry, rank, delay }: { entry: LeaderboardEntry; rank: number; delay: number }) {
  const medal = RANK_COLORS[rank]!;
  const tone = threatTone(entry.threat_level);
  const score = useCountUp(entry.score, 1, true);
  const first = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 24 }}
      className={`glass rounded-3xl flex flex-col items-center gap-2 p-4 sm:p-5 text-center ${
        first ? "sm:order-2 order-1 sm:-translate-y-3" : rank === 2 ? "sm:order-1 order-2" : "sm:order-3 order-3"
      }`}
      style={{ flex: first ? "1.2" : "1", boxShadow: `var(--shadow-lift), inset 0 0 0 1.5px ${medal}66` }}
    >
      <span
        className={`grid place-items-center rounded-full font-bold text-white ${first ? "w-12 h-12 text-lg" : "w-10 h-10 text-sm"}`}
        style={{ background: medal }}
      >
        #{rank}
      </span>
      <p className={`font-display font-extrabold tabular-nums ${first ? "text-[40px]" : "text-[32px]"} leading-none`} style={{ color: tone.ink }}>
        {score.toFixed(1)}
      </p>
      <p className="text-[12px] text-text-muted">Emotional damage</p>
      <p className="font-display text-[15px] font-semibold text-text-primary">{getFunnyTitle(entry)}</p>
      <p className="text-[12px] text-text-secondary">
        {entry.mbti} · {ATTACHMENT_LABELS[entry.attachmentStyle] ?? entry.attachmentStyle} · {cap(entry.zodiac)}
      </p>
    </motion.div>
  );
}

function EntryRow({ entry, rank, index }: { entry: LeaderboardEntry; rank: number; index: number }) {
  const tone = threatTone(entry.threat_level);
  const date = new Date(entry.timestamp).toLocaleDateString("en-PH", { month: "short", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.04, type: "spring", stiffness: 300, damping: 28 }}
      className="glass rounded-2xl flex items-center gap-3 px-4 py-3"
    >
      <span className="w-7 text-center text-[14px] font-bold text-text-muted tabular-nums shrink-0">{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-text-primary truncate">
          {entry.mbti} · {ATTACHMENT_LABELS[entry.attachmentStyle] ?? entry.attachmentStyle} · {cap(entry.zodiac)}
        </p>
        <p className="text-[12px] text-text-muted">
          <span className="font-semibold" style={{ color: tone.ink }}>{tone.label}</span>{" "}· {date}
        </p>
      </div>
      <span className="font-display text-[20px] font-bold tabular-nums shrink-0" style={{ color: tone.ink }}>
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
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = Boolean(filterMbti || filterAttachment || filterZodiac || filterThreat);

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) =>
          (!filterMbti || e.mbti === filterMbti) &&
          (!filterAttachment || e.attachmentStyle === filterAttachment) &&
          (!filterZodiac || e.zodiac === filterZodiac) &&
          (!filterThreat || e.threat_level === filterThreat)
      ),
    [entries, filterMbti, filterAttachment, filterZodiac, filterThreat]
  );

  const clearFilters = () => {
    setFilterMbti(null);
    setFilterAttachment(null);
    setFilterZodiac(null);
    setFilterThreat(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!res.ok) throw new Error("Couldn't load the leaderboard");
        const data = await res.json();
        setEntries(data.entries ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 pb-16 flex flex-col gap-6">
      <nav className="py-5">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <BrandMark size={32} />
          <span className="font-display font-bold text-[18px] text-text-primary">Senti.AI</span>
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="text-[34px] sm:text-[44px] font-extrabold leading-[1.05] text-text-primary">
          Most <span className="text-dusk">emotionally damaged</span>
        </h1>
        <p className="text-[15px] text-text-secondary">
          {entries.length} anonymous profile{entries.length !== 1 ? "s" : ""} · no names, just damage
        </p>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="rounded-full px-4 py-2 text-[14px] font-medium bg-white/80 border border-white text-text-primary cursor-pointer hover:bg-white"
          >
            {showFilters ? "Hide filters" : "Filter"}
            {hasFilters ? " · on" : ""}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="text-[13px] font-medium text-accent-ink hover:underline cursor-pointer">
              Clear all
            </button>
          )}
        </div>
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col gap-2 overflow-hidden"
            >
              <FilterRow label="Type">
                {MBTI_TYPES.map((t) => (
                  <FilterPill key={t} label={t} active={filterMbti === t} onClick={() => setFilterMbti(filterMbti === t ? null : t)} />
                ))}
              </FilterRow>
              <FilterRow label="Attachment">
                {ATTACHMENT_STYLES.map((a) => (
                  <FilterPill key={a} label={ATTACHMENT_LABELS[a]} active={filterAttachment === a} onClick={() => setFilterAttachment(filterAttachment === a ? null : a)} />
                ))}
              </FilterRow>
              <FilterRow label="Sign">
                {ZODIACS.map((z) => (
                  <FilterPill key={z} label={cap(z)} active={filterZodiac === z} onClick={() => setFilterZodiac(filterZodiac === z ? null : z)} />
                ))}
              </FilterRow>
              <FilterRow label="Threat">
                {THREAT_LEVELS.map((t) => (
                  <FilterPill key={t} label={THREAT[t].label} active={filterThreat === t} onClick={() => setFilterThreat(filterThreat === t ? null : t)} />
                ))}
              </FilterRow>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <BrandMark size={44} />
          <p className="text-[14px] text-text-secondary">Loading the rankings…</p>
        </div>
      )}

      {!loading && error && <p className="text-center py-16 text-[15px] text-accent-ink">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="glass rounded-3xl p-8 text-center flex flex-col items-center gap-3">
          <p className="font-display text-[20px] font-bold text-text-primary">No emotional damage detected…</p>
          <p className="text-[14px] text-text-secondary">…suspicious. Be the first on the board.</p>
          <LinkButton href="/">
            Take your scan <IconArrowRight size={18} />
          </LinkButton>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          {top3.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 pt-2">
              {top3.map((entry, i) => (
                <PodiumCard key={`podium-${entry.timestamp}-${entry.score}-${entry.mbti}`} entry={entry} rank={i + 1} delay={i * 0.12} />
              ))}
            </div>
          )}
          {rest.length > 0 && (
            <div className="flex flex-col gap-2">
              {rest.map((entry, i) => (
                <EntryRow key={`entry-${entry.timestamp}-${entry.score}-${entry.mbti}`} entry={entry} rank={i + 4} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
