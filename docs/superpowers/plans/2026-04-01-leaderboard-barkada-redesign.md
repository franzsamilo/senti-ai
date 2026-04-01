# Leaderboard & Barkada UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the leaderboard page with podium + filters + richer cards, upgrade the barkada component with 5 awards + animated stats + richer member cards, and add nav links on the landing page.

**Architecture:** Three independent file rewrites — leaderboard page, barkada component, landing step. All reuse existing UI primitives (StatBox, ThreatMeter, Button, GlitchText). No API changes. Framer Motion for animations.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, existing UI components.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/leaderboard/page.tsx` | Rewrite | Podium, filter bar, ranked cards, empty state |
| `src/components/BarkadaGroup.tsx` | Rewrite | 5 awards, animated stats, richer member cards |
| `src/components/steps/LandingStep.tsx` | Modify | Add leaderboard + barkada nav links |

---

## Task 1: Rewrite Leaderboard Page

**Files:**
- Rewrite: `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Write the leaderboard page with filter state, podium, and card list**

Replace `src/app/leaderboard/page.tsx` entirely with:

```tsx
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

/* ---------- deterministic funny titles ---------- */
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

/* ---------- animated counter hook ---------- */
function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
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

/* ---------- filter pill ---------- */
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

/* ---------- podium card ---------- */
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
      {/* Rank badge */}
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

      {/* Score */}
      <p
        className={`font-bold font-mono ${isFirst ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}
        style={{ color: threatColor }}
      >
        {score}
      </p>
      <p className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
        Emotional Damage
      </p>

      {/* Funny title */}
      <p className="text-xs font-mono font-medium" style={{ color }}>
        {getFunnyTitle(entry)}
      </p>

      {/* Chips */}
      <div className="flex flex-wrap gap-1 justify-center">
        <Chip label={entry.mbti} />
        <Chip label={entry.attachmentStyle} />
        <Chip label={entry.zodiac} />
      </div>

      {/* Threat badge */}
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

/* ---------- entry card (ranks 4+) ---------- */
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
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg group transition-all duration-200"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${threatColor}44`;
        e.currentTarget.style.boxShadow = `0 0 12px ${threatColor}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Rank */}
      <span className="w-8 text-center text-sm font-bold font-mono shrink-0 text-[#555]">
        {rank}
      </span>

      {/* Info */}
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

      {/* Score */}
      <span
        className="text-base sm:text-lg font-bold font-mono shrink-0"
        style={{ color: threatColor }}
      >
        {entry.score.toFixed(1)}
      </span>
    </motion.div>
  );
}

/* ========== MAIN PAGE ========== */
export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
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
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[#555] font-mono text-xs tracking-[0.3em] uppercase mb-3">
            SENTI.AI — CLASSIFIED DATABASE
          </p>
          <GlitchText
            text="MOST EMOTIONALLY DAMAGED"
            as="h1"
            className="text-3xl sm:text-5xl font-bold text-[#e8e8e8] mb-3"
          />
          <p className="text-[#888] font-mono text-xs tracking-[0.2em] uppercase">
            {entries.length} profile{entries.length !== 1 ? "s" : ""} in the database
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 space-y-3">
          {/* MBTI row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider shrink-0 w-12">MBTI</span>
            {MBTI_TYPES.map((t) => (
              <FilterPill
                key={t}
                label={t}
                active={filterMbti === t}
                onClick={() => setFilterMbti(filterMbti === t ? null : t)}
              />
            ))}
          </div>
          {/* Attachment row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider shrink-0 w-12">Attach</span>
            {ATTACHMENT_STYLES.map((a) => (
              <FilterPill
                key={a}
                label={a}
                active={filterAttachment === a}
                onClick={() => setFilterAttachment(filterAttachment === a ? null : a)}
              />
            ))}
          </div>
          {/* Zodiac row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider shrink-0 w-12">Zodiac</span>
            {ZODIACS.map((z) => (
              <FilterPill
                key={z}
                label={z}
                active={filterZodiac === z}
                onClick={() => setFilterZodiac(filterZodiac === z ? null : z)}
              />
            ))}
          </div>
          {/* Threat row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider shrink-0 w-12">Threat</span>
            {THREAT_LEVELS.map((t) => (
              <FilterPill
                key={t}
                label={t}
                active={filterThreat === t}
                color={THREAT_COLORS[t]}
                onClick={() => setFilterThreat(filterThreat === t ? null : t)}
              />
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-mono text-[#ff3252] hover:text-white transition-colors shrink-0 ml-2 cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
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

        <AnimatePresence mode="wait">
          {!loading && !error && filtered.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <GlitchText
                text="No emotional damage detected..."
                as="p"
                className="text-lg font-bold text-[#e8e8e8] mb-2"
              />
              <p className="text-[#555] font-mono text-sm">...suspicious.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Podium — top 3 */}
            {top3.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {top3.map((entry, i) => (
                  <PodiumCard
                    key={`${entry.timestamp}-${i}`}
                    entry={entry}
                    rank={i + 1}
                    delay={i === 0 ? 0 : i === 1 ? 0.15 : 0.3}
                  />
                ))}
              </div>
            )}

            {/* Rest — ranks 4+ */}
            {rest.length > 0 && (
              <div className="flex flex-col gap-2">
                {rest.map((entry, i) => (
                  <EntryCard
                    key={`${entry.timestamp}-${i}`}
                    entry={entry}
                    rank={i + 4}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
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
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd "C:/Users/Franz Samilo/Desktop/random ahh/senti-ai" && npm run build 2>&1 | head -30`
Expected: No TypeScript errors in `src/app/leaderboard/page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/app/leaderboard/page.tsx
git commit -m "feat: redesign leaderboard with podium, filters, animated cards"
```

---

## Task 2: Rewrite Barkada Group Component

**Files:**
- Rewrite: `src/components/BarkadaGroup.tsx`

- [ ] **Step 1: Write the upgraded barkada component with 5 awards, animated stats, richer member cards**

Replace `src/components/BarkadaGroup.tsx` entirely with:

```tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ThreatLevel } from "@/lib/types";
import { BarkadaMember } from "@/app/api/barkada/route";

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

function getThreatLevelFromScore(score: number): ThreatLevel {
  if (score >= 8.5) return "CRITICAL";
  if (score >= 7.0) return "SEVERE";
  if (score >= 5.5) return "ELEVATED";
  if (score >= 3.5) return "MODERATE";
  return "LOW";
}

/* ---------- animated counter ---------- */
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1500;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(1)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return (
    <span>
      {value}{suffix}
    </span>
  );
}

/* ---------- award card ---------- */
function AwardCard({
  emoji,
  label,
  subtitle,
  nickname,
  detail,
  accentColor,
  delay,
}: {
  emoji: string;
  label: string;
  subtitle: string;
  nickname: string;
  detail: string;
  accentColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 280, damping: 24 }}
      className="rounded-xl p-4 text-center space-y-2"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderTopColor: accentColor,
        borderTopWidth: "2px",
      }}
    >
      <div
        className="text-3xl"
        style={{ filter: `drop-shadow(0 0 8px ${accentColor}44)` }}
      >
        {emoji}
      </div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-[#555]">
        {label}
      </p>
      <p className="font-bold text-sm" style={{ color: accentColor }}>
        {nickname}
      </p>
      <p className="text-[10px] font-mono text-[#888]">{detail}</p>
      <p className="text-[10px] font-mono text-[#444] italic">{subtitle}</p>
    </motion.div>
  );
}

/* ---------- stat box ---------- */
function GroupStatBox({
  label,
  children,
  delay,
}: {
  label: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 28 }}
      className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg p-3 sm:p-4 text-center min-w-[120px] shrink-0"
    >
      <p className="text-xl sm:text-2xl font-bold text-[#ff3252] font-mono">
        {children}
      </p>
      <p className="text-[10px] sm:text-xs text-[#555] uppercase tracking-wider font-mono mt-1">
        {label}
      </p>
    </motion.div>
  );
}

/* ---------- member rank card ---------- */
function MemberCard({
  member,
  rank,
  index,
}: {
  member: BarkadaMember;
  rank: number;
  index: number;
}) {
  const threatLevel = member.profile.result.threat_level as ThreatLevel;
  const threatColor = THREAT_COLORS[threatLevel] ?? "#888";
  const rankColor = RANK_COLORS[rank];
  const score = member.profile.result.emotional_damage_score;
  const meterPercent = Math.min(100, Math.max(0, score * 10));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 28 }}
      className="rounded-xl px-4 py-3 space-y-2"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: rankColor
          ? `1px solid ${rankColor}55`
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: rankColor ? `0 0 12px ${rankColor}15` : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Rank badge */}
        <div
          className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono shrink-0"
          style={{
            color: rankColor ?? "#555",
            borderColor: rankColor ?? "rgba(255,255,255,0.1)",
            boxShadow: rankColor ? `0 0 8px ${rankColor}33` : undefined,
          }}
        >
          {rank}
        </div>

        {/* Name + chips */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#e8e8e8] truncate">
            {member.nickname}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full capitalize border border-white/10 text-[#aaa] bg-white/[0.02]">
              {member.profile.mbti}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full capitalize border border-white/10 text-[#aaa] bg-white/[0.02]">
              {member.profile.attachmentStyle}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full capitalize border border-white/10 text-[#aaa] bg-white/[0.02]">
              {member.profile.zodiac}
            </span>
          </div>
        </div>

        {/* Score + threat */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold font-mono" style={{ color: threatColor }}>
            <AnimatedNumber target={score} />
          </p>
          <span
            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5"
            style={{
              color: threatColor,
              borderColor: `${threatColor}55`,
              backgroundColor: `${threatColor}18`,
            }}
          >
            {threatLevel}
          </span>
        </div>
      </div>

      {/* Mini threat meter */}
      <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${meterPercent}%` }}
          transition={{ delay: index * 0.08 + 0.3, duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            backgroundColor: threatColor,
            boxShadow: `0 0 6px ${threatColor}`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ========== MAIN COMPONENT ========== */
interface BarkadaGroupProps {
  members: BarkadaMember[];
  groupId: string;
}

function computeDominantAttachment(members: BarkadaMember[]): string {
  const counts: Record<string, number> = {};
  for (const m of members) {
    const style = m.profile.attachmentStyle;
    counts[style] = (counts[style] ?? 0) + 1;
  }
  let dominant = "";
  let max = 0;
  for (const [style, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      dominant = style;
    }
  }
  return dominant.charAt(0).toUpperCase() + dominant.slice(1);
}

function computeDominantZodiac(members: BarkadaMember[]): string {
  const counts: Record<string, number> = {};
  for (const m of members) {
    const z = m.profile.zodiac;
    counts[z] = (counts[z] ?? 0) + 1;
  }
  let dominant = "";
  let max = 0;
  for (const [z, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      dominant = z;
    }
  }
  return dominant.charAt(0).toUpperCase() + dominant.slice(1);
}

export default function BarkadaGroup({ members, groupId }: BarkadaGroupProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/barkada/${groupId}`
      : `/barkada/${groupId}`;

  const sorted = useMemo(
    () =>
      [...members].sort(
        (a, b) =>
          b.profile.result.emotional_damage_score -
          a.profile.result.emotional_damage_score
      ),
    [members]
  );

  const mostSawi = sorted[0];
  const healthiest = sorted[sorted.length - 1];

  const mostDelulu = useMemo(
    () =>
      [...members].sort(
        (a, b) =>
          b.profile.result.drunk_text_probability -
          a.profile.result.drunk_text_probability
      )[0],
    [members]
  );

  const mostLikelyDrunkText = useMemo(() => {
    // Anxious + high score combo
    const anxiousMembers = members.filter(
      (m) => m.profile.attachmentStyle === "anxious"
    );
    if (anxiousMembers.length > 0) {
      return [...anxiousMembers].sort(
        (a, b) =>
          b.profile.result.emotional_damage_score -
          a.profile.result.emotional_damage_score
      )[0];
    }
    return mostDelulu; // fallback
  }, [members, mostDelulu]);

  const walkingRedFlag = useMemo(() => {
    // Highest threat level, then by score
    const threatOrder: ThreatLevel[] = ["CRITICAL", "SEVERE", "ELEVATED", "MODERATE", "LOW"];
    return [...members].sort((a, b) => {
      const aIdx = threatOrder.indexOf(a.profile.result.threat_level);
      const bIdx = threatOrder.indexOf(b.profile.result.threat_level);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return b.profile.result.emotional_damage_score - a.profile.result.emotional_damage_score;
    })[0];
  }, [members]);

  const avgDamage =
    members.length > 0
      ? members.reduce(
          (sum, m) => sum + m.profile.result.emotional_damage_score,
          0
        ) / members.length
      : 0;

  const dominantAttachment = computeDominantAttachment(members);
  const dominantZodiac = computeDominantZodiac(members);
  const groupThreatLevel = getThreatLevelFromScore(avgDamage);
  const groupThreatColor = THREAT_COLORS[groupThreatLevel];

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-xs tracking-[0.3em] uppercase font-mono text-[#888]">
          SENTI.AI
        </p>
        <h1 className="text-2xl font-bold tracking-widest uppercase font-mono text-[#e8e8e8]">
          BARKADA REPORT
        </h1>
        <p className="text-sm font-mono text-[#555]">
          {members.length}/10 members
        </p>
      </div>

      {/* Awards — 5 cards */}
      <section className="space-y-3">
        <p className="text-xs tracking-[0.25em] uppercase font-mono text-[#555]">
          AWARDS
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AwardCard
            emoji="🏆"
            label="Most Sawi"
            subtitle="Hindi na makaget over"
            nickname={mostSawi?.nickname ?? "—"}
            detail={mostSawi ? `${mostSawi.profile.result.emotional_damage_score.toFixed(1)}/10` : ""}
            accentColor="#FFD700"
            delay={0}
          />
          <AwardCard
            emoji="💀"
            label="Most Delulu"
            subtitle="Main character syndrome"
            nickname={mostDelulu?.nickname ?? "—"}
            detail={mostDelulu ? `${mostDelulu.profile.result.drunk_text_probability}% drunk text prob` : ""}
            accentColor="#ff3252"
            delay={0.1}
          />
          <AwardCard
            emoji="📱"
            label="Most Likely to Drunk Text"
            subtitle="3AM warrior"
            nickname={mostLikelyDrunkText?.nickname ?? "—"}
            detail={mostLikelyDrunkText ? `${mostLikelyDrunkText.profile.attachmentStyle} + ${mostLikelyDrunkText.profile.result.emotional_damage_score.toFixed(1)}/10` : ""}
            accentColor="#ff8c00"
            delay={0.2}
          />
          <AwardCard
            emoji="🚩"
            label="Walking Red Flag"
            subtitle="Jowa ng lahat, jowa ng wala"
            nickname={walkingRedFlag?.nickname ?? "—"}
            detail={walkingRedFlag ? `${walkingRedFlag.profile.result.threat_level}` : ""}
            accentColor="#ff0040"
            delay={0.3}
          />
          <AwardCard
            emoji="🧘"
            label="Healthiest (Boring)"
            subtitle="Touch grass champion"
            nickname={healthiest?.nickname ?? "—"}
            detail={healthiest ? `${healthiest.profile.result.emotional_damage_score.toFixed(1)}/10` : ""}
            accentColor="#00cc88"
            delay={0.4}
          />
        </div>
      </section>

      {/* Group Stats */}
      <section className="space-y-3">
        <p className="text-xs tracking-[0.25em] uppercase font-mono text-[#555]">
          GROUP STATS
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
          <GroupStatBox label="Avg Emotional Damage" delay={0}>
            <AnimatedNumber target={parseFloat(avgDamage.toFixed(1))} suffix="/10" />
          </GroupStatBox>
          <GroupStatBox label="Dominant Attachment" delay={0.05}>
            {dominantAttachment}
          </GroupStatBox>
          <GroupStatBox label="Most Common Zodiac" delay={0.1}>
            {dominantZodiac}
          </GroupStatBox>
          <GroupStatBox label="Group Threat Level" delay={0.15}>
            <span style={{ color: groupThreatColor }}>{groupThreatLevel}</span>
          </GroupStatBox>
          <GroupStatBox label="Members" delay={0.2}>
            {members.length}/10
          </GroupStatBox>
        </div>
      </section>

      {/* Rankings */}
      <section className="space-y-3">
        <p className="text-xs tracking-[0.25em] uppercase font-mono text-[#555]">
          DAMAGE RANKINGS
        </p>
        <div className="space-y-2">
          {sorted.map((member, index) => (
            <MemberCard
              key={`${member.nickname}-${index}`}
              member={member}
              rank={index + 1}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Share Link */}
      <section
        className="rounded-xl p-5 space-y-3 text-center"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p className="text-xs tracking-[0.25em] uppercase font-mono text-[#555]">
          INVITE YOUR BARKADA
        </p>
        <p className="text-xs break-all font-mono text-[#ff3252]">
          {shareUrl}
        </p>
        <button
          onClick={handleCopy}
          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px]"
          style={{
            background: copied ? "rgba(34,170,85,0.12)" : "rgba(255,50,82,0.12)",
            border: copied ? "1px solid rgba(34,170,85,0.3)" : "1px solid rgba(255,50,82,0.3)",
            color: copied ? "#22aa55" : "#ff3252",
          }}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <p className="text-[10px] font-mono text-[#444]">
          Link expires in 7 days
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd "C:/Users/Franz Samilo/Desktop/random ahh/senti-ai" && npm run build 2>&1 | head -30`
Expected: No TypeScript errors in `src/components/BarkadaGroup.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/BarkadaGroup.tsx
git commit -m "feat: redesign barkada group with 5 awards, animated stats, richer member cards"
```

---

## Task 3: Add Nav Links to Landing Page

**Files:**
- Modify: `src/components/steps/LandingStep.tsx`

- [ ] **Step 1: Add leaderboard and barkada links below the existing CTAs**

In `src/components/steps/LandingStep.tsx`, add `import Link from "next/link";` at the top, then insert a nav section between the CTA div and the warning paragraph.

Add after the closing `</div>` of the CTA section (the one with `max-w-xs`) and before the warning `<p>`:

```tsx
      {/* Nav links */}
      <div className="flex items-center gap-4">
        <Link
          href="/leaderboard"
          className="text-xs font-mono text-text-muted hover:text-accent transition-colors duration-200 border border-border-subtle hover:border-accent/40 rounded-lg px-4 py-2 min-h-[36px] inline-flex items-center"
        >
          View the Leaderboard
        </Link>
        <Link
          href="/barkada"
          className="text-xs font-mono text-text-muted hover:text-accent transition-colors duration-200 border border-border-subtle hover:border-accent/40 rounded-lg px-4 py-2 min-h-[36px] inline-flex items-center"
        >
          Join a Barkada Group
        </Link>
      </div>
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd "C:/Users/Franz Samilo/Desktop/random ahh/senti-ai" && npm run build 2>&1 | head -30`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/steps/LandingStep.tsx
git commit -m "feat: add leaderboard and barkada nav links to landing page"
```
