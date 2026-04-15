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

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    setValue(0);
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
      className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg p-3 sm:p-4 text-center flex-1 min-w-0"
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

function Chip({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full capitalize border border-white/10 text-[#aaa] bg-white/[0.02]">
      {label}
    </span>
  );
}

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

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#e8e8e8] truncate">
            {member.nickname}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            <Chip label={member.profile.mbti} />
            <Chip label={member.profile.attachmentStyle} />
            <Chip label={member.profile.zodiac} />
          </div>
        </div>

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

interface BarkadaGroupProps {
  members: BarkadaMember[];
  groupId: string;
}

function computeDominant(members: BarkadaMember[], getter: (m: BarkadaMember) => string): string {
  const counts: Record<string, number> = {};
  for (const m of members) {
    const val = getter(m);
    counts[val] = (counts[val] ?? 0) + 1;
  }
  let dominant = "";
  let max = 0;
  for (const [val, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      dominant = val;
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
    return mostDelulu;
  }, [members, mostDelulu]);

  const walkingRedFlag = useMemo(() => {
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

  const dominantAttachment = computeDominant(members, (m) => m.profile.attachmentStyle);
  const dominantZodiac = computeDominant(members, (m) => m.profile.zodiac);
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              key={`${member.nickname}-${member.profile.mbti}-${index}`}
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
