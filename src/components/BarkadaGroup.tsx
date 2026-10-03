"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { BarkadaMember } from "@/app/api/barkada/route";
import { useCountUp } from "@/components/ui/StatBox";
import { IconCheck, IconLink } from "@/components/ui/icons";
import { legacyMetrics, threatFromScore } from "@/lib/scoring";
import { ATTACHMENT_LABELS, RANK_COLORS, threatTone } from "@/lib/theme";

function AnimatedNumber({ target, decimals = 1, suffix = "" }: { target: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const value = useCountUp(target, decimals, inView);
  return (
    <span ref={ref} className="tabular-nums">
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const deluluOf = (m: BarkadaMember) =>
  m.profile.result.metrics?.delulu.value ??
  legacyMetrics(m.profile.result.emotional_damage_score, 5.5).delulu.value;

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function AwardCard({
  emoji,
  label,
  subtitle,
  nickname,
  detail,
  color,
  delay,
}: {
  emoji: string;
  label: string;
  subtitle: string;
  nickname: string;
  detail: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 280, damping: 22 }}
      className="glass rounded-3xl p-4 text-center flex flex-col items-center gap-1.5"
    >
      <motion.span
        className="text-[34px] leading-none"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {emoji}
      </motion.span>
      <p className="text-[12px] font-semibold text-text-muted">{label}</p>
      <p className="font-display text-[17px] font-bold truncate max-w-full" style={{ color }}>
        {nickname}
      </p>
      <p className="text-[12px] text-text-secondary">{detail}</p>
      <p className="text-[11.5px] text-text-muted">{subtitle}</p>
    </motion.div>
  );
}

function GroupStat({ label, children, delay }: { label: string; children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 28 }}
      className="glass rounded-2xl p-3.5 text-center"
    >
      <p className="font-display text-[22px] font-bold text-accent-ink leading-tight">{children}</p>
      <p className="text-[12px] text-text-secondary mt-1">{label}</p>
    </motion.div>
  );
}

function MemberCard({ member, rank, index }: { member: BarkadaMember; rank: number; index: number }) {
  const tone = threatTone(member.profile.result.threat_level);
  const rankColor = RANK_COLORS[rank];
  const score = member.profile.result.emotional_damage_score;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 300, damping: 28 }}
      className="glass rounded-2xl px-4 py-3.5 flex flex-col gap-2.5"
      style={rankColor ? { boxShadow: `var(--shadow-card), inset 0 0 0 1.5px ${rankColor}66` } : undefined}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid place-items-center w-9 h-9 rounded-full text-[14px] font-bold shrink-0"
          style={{
            color: rankColor ? "#fff" : "#7b6987",
            background: rankColor ?? "rgba(74,30,82,0.06)",
          }}
        >
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] text-text-primary truncate">{member.nickname}</p>
          <p className="text-[12px] text-text-muted truncate">
            {member.profile.mbti} · {ATTACHMENT_LABELS[member.profile.attachmentStyle] ?? member.profile.attachmentStyle} ·{" "}
            {cap(member.profile.zodiac)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-[20px] font-bold leading-none" style={{ color: tone.ink }}>
            <AnimatedNumber target={score} />
          </p>
          <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 inline-block mt-1" style={{ color: tone.ink, background: tone.soft }}>
            {tone.label}
          </span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[rgba(74,30,82,0.07)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, score * 10)}%` }}
          transition={{ delay: index * 0.07 + 0.3, duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${tone.color}99, ${tone.color})` }}
        />
      </div>
    </motion.div>
  );
}

function dominant(members: BarkadaMember[], getter: (m: BarkadaMember) => string): string {
  const counts = new Map<string, number>();
  for (const m of members) counts.set(getter(m), (counts.get(getter(m)) ?? 0) + 1);
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [""];
  return cap(top);
}

interface BarkadaGroupProps {
  members: BarkadaMember[];
  groupId: string;
}

export default function BarkadaGroup({ members, groupId }: BarkadaGroupProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/barkada/${groupId}` : `/barkada/${groupId}`;

  const byScore = useMemo(
    () => [...members].sort((a, b) => b.profile.result.emotional_damage_score - a.profile.result.emotional_damage_score),
    [members]
  );
  const top = (score: (m: BarkadaMember) => number) => [...members].sort((a, b) => score(b) - score(a))[0];

  const mostSawi = byScore[0];
  const healthiest = byScore[byScore.length - 1];
  const mostDelulu = top(deluluOf);
  const mostDrunkText = top((m) => m.profile.result.drunk_text_probability);
  const redFlag = top((m) => m.profile.result.metrics?.toxicity.value ?? m.profile.result.emotional_damage_score * 9);

  const avgDamage = members.length
    ? members.reduce((sum, m) => sum + m.profile.result.emotional_damage_score, 0) / members.length
    : 0;
  const groupTone = threatTone(threatFromScore(avgDamage));

  async function share() {
    const text = `Barkada emotional damage check 😭 Sino pinaka-sawi sa atin? Join here → ${shareUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Senti.AI Barkada", text, url: shareUrl });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const awards = [
    { emoji: "🏆", label: "Most Sawi", subtitle: "Hindi na makaget over", m: mostSawi, detail: (m: BarkadaMember) => `${m.profile.result.emotional_damage_score.toFixed(1)}/10 damage`, color: "#b8860b" },
    { emoji: "💀", label: "Most Delulu", subtitle: "Main character syndrome", m: mostDelulu, detail: (m: BarkadaMember) => `${deluluOf(m)}% delulu`, color: "#c21f59" },
    { emoji: "📱", label: "Most Likely to Drunk Text", subtitle: "3AM warrior", m: mostDrunkText, detail: (m: BarkadaMember) => `${m.profile.result.drunk_text_probability}% chance tonight`, color: "#c2410c" },
    { emoji: "🚩", label: "Walking Red Flag", subtitle: "Jowa ng lahat, jowa ng wala", m: redFlag, detail: (m: BarkadaMember) => threatTone(m.profile.result.threat_level).label, color: "#be123c" },
    { emoji: "🧘", label: "Healthiest (Boring)", subtitle: "Touch grass champion", m: healthiest, detail: (m: BarkadaMember) => `${m.profile.result.emotional_damage_score.toFixed(1)}/10 damage`, color: "#047857" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-7 px-4 py-8">
      <header className="text-center flex flex-col items-center gap-2">
        <span className="text-[13px] font-medium text-text-muted">Senti.AI · Barkada report</span>
        <h1 className="text-[34px] sm:text-[42px] font-extrabold text-text-primary leading-tight">
          Sino ang <span className="text-dusk">pinaka-sawi</span>?
        </h1>
        <p className="text-[14px] text-text-secondary">{members.length}/10 members · updates as friends finish their scans</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-[19px] font-bold text-text-primary">Awards</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {awards.map((a, i) => (
            <AwardCard
              key={a.label}
              emoji={a.emoji}
              label={a.label}
              subtitle={a.subtitle}
              nickname={a.m?.nickname ?? "—"}
              detail={a.m ? a.detail(a.m) : ""}
              color={a.color}
              delay={i * 0.08}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[19px] font-bold text-text-primary">Group stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <GroupStat label="Avg damage" delay={0}>
            <AnimatedNumber target={avgDamage} suffix="/10" />
          </GroupStat>
          <GroupStat label="Group threat" delay={0.05}>
            <span style={{ color: groupTone.ink }}>{groupTone.label}</span>
          </GroupStat>
          <GroupStat label="Top attachment" delay={0.1}>
            {dominant(members, (m) => m.profile.attachmentStyle)}
          </GroupStat>
          <GroupStat label="Top sign" delay={0.15}>
            {dominant(members, (m) => m.profile.zodiac)}
          </GroupStat>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[19px] font-bold text-text-primary">Damage rankings</h2>
        <div className="flex flex-col gap-2">
          {byScore.map((member, index) => (
            <MemberCard key={`${member.nickname}-${member.profile.mbti}-${index}`} member={member} rank={index + 1} index={index} />
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-5 flex flex-col items-center gap-3 text-center">
        <p className="font-display text-[17px] font-semibold text-text-primary">Invite the rest of the barkada</p>
        <p className="text-[13px] text-accent-ink break-all">{shareUrl}</p>
        <button
          onClick={share}
          className="inline-flex items-center gap-2 rounded-2xl px-5 min-h-[46px] text-[14px] font-semibold text-white cursor-pointer"
          style={{ background: "var(--dusk-button)", boxShadow: "var(--shadow-glow)" }}
        >
          {copied ? (
            <>
              <IconCheck size={16} /> Copied
            </>
          ) : (
            <>
              <IconLink size={16} /> Share the group link
            </>
          )}
        </button>
        <p className="text-[12px] text-text-muted">Groups last 7 days, max 10 members.</p>
      </section>
    </div>
  );
}
