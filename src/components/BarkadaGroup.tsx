"use client";

import { useMemo } from "react";
import { ThreatLevel } from "@/lib/types";
import { BarkadaMember } from "@/app/api/barkada/route";

const THREAT_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: "#ff0040",
  SEVERE: "#ff3252",
  ELEVATED: "#ff8c00",
  MODERATE: "#ffd000",
  LOW: "#00cc88",
};

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
  // Capitalise first letter
  return dominant.charAt(0).toUpperCase() + dominant.slice(1);
}

export default function BarkadaGroup({ members, groupId }: BarkadaGroupProps) {
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

  const avgDamage =
    members.length > 0
      ? (
          members.reduce(
            (sum, m) => sum + m.profile.result.emotional_damage_score,
            0
          ) / members.length
        ).toFixed(1)
      : "—";

  const dominantAttachment = computeDominantAttachment(members);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <p
          className="text-xs tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#888888" }}
        >
          SENTI.AI
        </p>
        <h1
          className="text-2xl font-bold tracking-widest uppercase"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: "#e8e8e8",
          }}
        >
          BARKADA REPORT
        </h1>
        <p
          className="text-sm"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: "#555555",
          }}
        >
          {members.length}/10 members
        </p>
      </div>

      {/* Awards */}
      <section className="space-y-3">
        <p
          className="text-xs tracking-[0.25em] uppercase"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#555555" }}
        >
          AWARDS
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <AwardCard
            emoji="🏆"
            label="Most Sawi"
            nickname={mostSawi?.nickname ?? "—"}
            detail={
              mostSawi
                ? `${mostSawi.profile.result.emotional_damage_score.toFixed(1)}/10`
                : ""
            }
          />
          <AwardCard
            emoji="💀"
            label="Most Delulu"
            nickname={mostDelulu?.nickname ?? "—"}
            detail={
              mostDelulu
                ? `${mostDelulu.profile.result.drunk_text_probability}% drunk text prob`
                : ""
            }
          />
          <AwardCard
            emoji="🧘"
            label="Healthiest (Boring)"
            nickname={healthiest?.nickname ?? "—"}
            detail={
              healthiest
                ? `${healthiest.profile.result.emotional_damage_score.toFixed(1)}/10`
                : ""
            }
          />
        </div>
      </section>

      {/* Group Stats */}
      <section
        className="rounded-xl p-5 space-y-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p
          className="text-xs tracking-[0.25em] uppercase"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#555555" }}
        >
          GROUP STATS
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <StatItem label="Avg Emotional Damage" value={`${avgDamage}/10`} />
          <StatItem label="Dominant Attachment" value={dominantAttachment} />
          <StatItem label="Members" value={`${members.length}`} />
        </div>
      </section>

      {/* Rankings */}
      <section className="space-y-3">
        <p
          className="text-xs tracking-[0.25em] uppercase"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#555555" }}
        >
          DAMAGE RANKINGS
        </p>
        <div className="space-y-2">
          {sorted.map((member, index) => (
            <RankRow key={`${member.nickname}-${index}`} rank={index + 1} member={member} />
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
        <p
          className="text-xs tracking-[0.25em] uppercase"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#555555" }}
        >
          INVITE YOUR BARKADA
        </p>
        <p
          className="text-xs break-all"
          style={{ color: "#ff3252", fontFamily: "var(--font-mono, monospace)" }}
        >
          {shareUrl}
        </p>
        <button
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(shareUrl);
            }
          }}
          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px]"
          style={{
            background: "rgba(255,50,82,0.12)",
            border: "1px solid rgba(255,50,82,0.3)",
            color: "#ff3252",
          }}
        >
          Copy Link
        </button>
      </section>
    </div>
  );
}

function AwardCard({
  emoji,
  label,
  nickname,
  detail,
}: {
  emoji: string;
  label: string;
  nickname: string;
  detail: string;
}) {
  return (
    <div
      className="rounded-xl p-4 text-center space-y-1"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="text-2xl">{emoji}</div>
      <p
        className="text-xs tracking-wider uppercase"
        style={{ color: "#555555", fontFamily: "var(--font-mono, monospace)" }}
      >
        {label}
      </p>
      <p className="font-bold text-sm" style={{ color: "#e8e8e8" }}>
        {nickname}
      </p>
      {detail && (
        <p className="text-xs" style={{ color: "#888888" }}>
          {detail}
        </p>
      )}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1">
      <p
        className="text-xs uppercase tracking-wider"
        style={{ color: "#555555", fontFamily: "var(--font-mono, monospace)" }}
      >
        {label}
      </p>
      <p className="text-lg font-bold mt-0.5" style={{ color: "#e8e8e8" }}>
        {value}
      </p>
    </div>
  );
}

function RankRow({ rank, member }: { rank: number; member: BarkadaMember }) {
  const threatLevel = member.profile.result.threat_level as ThreatLevel;
  const color = THREAT_COLORS[threatLevel] ?? "#888888";

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Rank number */}
      <span
        className="text-sm font-bold w-6 shrink-0"
        style={{
          color: rank <= 3 ? color : "#555555",
          fontFamily: "var(--font-mono, monospace)",
        }}
      >
        #{rank}
      </span>

      {/* Name + MBTI */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm truncate"
          style={{ color: "#e8e8e8" }}
        >
          {member.nickname}
        </p>
        <p
          className="text-xs"
          style={{
            color: "#555555",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {member.profile.mbti} · {member.profile.attachmentStyle}
        </p>
      </div>

      {/* Score */}
      <span
        className="text-sm font-bold shrink-0"
        style={{ color, fontFamily: "var(--font-mono, monospace)" }}
      >
        {member.profile.result.emotional_damage_score.toFixed(1)}/10
      </span>

      {/* Threat badge */}
      <span
        className="text-[10px] sm:text-xs font-bold shrink-0 px-1.5 sm:px-2 py-0.5 rounded"
        style={{
          color,
          background: `${color}18`,
          border: `1px solid ${color}40`,
          fontFamily: "var(--font-mono, monospace)",
        }}
      >
        {threatLevel}
      </span>
    </div>
  );
}
