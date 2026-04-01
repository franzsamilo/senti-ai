"use client";

import { MatchResult, UserProfile, ThreatLevel } from "@/lib/types";
import GlitchText from "@/components/GlitchText";

const THREAT_COLORS: Record<string, string> = {
  CRITICAL: "#ff0040",
  SEVERE: "#ff3252",
  ELEVATED: "#ff8c00",
  MODERATE: "#ffd000",
  LOW: "#00cc88",
};

function getThreatColor(level: string): string {
  return THREAT_COLORS[level] ?? "#ff3252";
}

const LOVE_LANGUAGE_LABELS: Record<string, string> = {
  words: "Words of Affirmation",
  acts: "Acts of Service",
  gifts: "Receiving Gifts",
  time: "Quality Time",
  touch: "Physical Touch",
};

const ATTACHMENT_LABELS: Record<string, string> = {
  anxious: "Anxious 😰",
  avoidant: "Avoidant 🚪",
  disorganized: "Disorganized 🌀",
  secure: "Secure 🧘",
};

interface ProfileCardProps {
  profile: UserProfile;
  label: string;
  isWinner: boolean;
}

function ProfileCard({ profile, label, isWinner }: ProfileCardProps) {
  const threatColor = getThreatColor(profile.result.threat_level);

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3 flex-1 min-w-0"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: isWinner ? "rgba(255,50,82,0.4)" : "rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-mono text-xs font-bold tracking-wider"
          style={{ color: "#555555" }}
        >
          {label}
        </span>
        {isWinner && (
          <span
            className="font-mono text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,50,82,0.15)", color: "#ff3252", border: "1px solid rgba(255,50,82,0.3)" }}
          >
            MORE SAWI
          </span>
        )}
      </div>

      {/* Threat level badge */}
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md w-fit font-mono text-xs font-bold"
        style={{
          background: `${threatColor}15`,
          border: `1px solid ${threatColor}40`,
          color: threatColor,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: threatColor }}
        />
        {profile.result.threat_level}
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-xs" style={{ color: "#555555" }}>Damage Score</span>
          <span
            className="font-mono text-sm font-bold"
            style={{ color: threatColor }}
          >
            {profile.result.emotional_damage_score.toFixed(1)}/10
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-xs" style={{ color: "#555555" }}>MBTI</span>
          <span className="font-mono text-xs font-bold" style={{ color: "#e8e8e8" }}>
            {profile.mbti}
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-xs shrink-0" style={{ color: "#555555" }}>Attachment</span>
          <span className="font-mono text-xs text-right" style={{ color: "#888888" }}>
            {ATTACHMENT_LABELS[profile.attachmentStyle] ?? profile.attachmentStyle}
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-xs shrink-0" style={{ color: "#555555" }}>Love Language</span>
          <span className="font-mono text-xs text-right leading-tight" style={{ color: "#888888" }}>
            {LOVE_LANGUAGE_LABELS[profile.loveLanguage] ?? profile.loveLanguage}
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-xs" style={{ color: "#555555" }}>Zodiac</span>
          <span className="font-mono text-xs capitalize" style={{ color: "#888888" }}>
            {profile.zodiac}
          </span>
        </div>
      </div>

      {/* Songs */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs" style={{ color: "#555555" }}>PLAYLIST</span>
        <div className="flex flex-wrap gap-1">
          {profile.songs.map((song, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#888888",
              }}
            >
              {song.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DetailCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

function DetailCard({ label, value, accent }: DetailCardProps) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-2"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: accent ? "rgba(255,50,82,0.25)" : "rgba(255,255,255,0.06)",
      }}
    >
      <span
        className="font-mono text-xs tracking-wider"
        style={{ color: accent ? "#ff3252" : "#555555" }}
      >
        {label}
      </span>
      <p className="text-sm leading-relaxed" style={{ color: "#e8e8e8" }}>
        {value}
      </p>
    </div>
  );
}

interface MatchReportProps {
  matchResult: MatchResult;
  profileA: UserProfile;
  profileB: UserProfile;
}

export default function MatchReport({ matchResult, profileA, profileB }: MatchReportProps) {
  const scoreA = profileA.result.emotional_damage_score;
  const scoreB = profileB.result.emotional_damage_score;
  const aIsMoreSawi = scoreA >= scoreB;

  const combinedThreatColor = getThreatColor(matchResult.combined_threat_level);

  const compatScore = matchResult.compatibility_score;
  const compatColor =
    compatScore >= 70 ? "#ffd000" : compatScore >= 40 ? "#ff8c00" : "#ff3252";

  return (
    <div className="flex flex-col gap-5 sm:gap-6 px-4 py-8 max-w-[680px] mx-auto w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className="font-mono text-xs tracking-[0.2em] px-3 py-1 rounded-full"
          style={{
            background: "rgba(255,50,82,0.08)",
            border: "1px solid rgba(255,50,82,0.2)",
            color: "#ff3252",
          }}
        >
          SENTI.AI MATCH REPORT
        </span>
        <GlitchText
          text={matchResult.match_headline}
          as="h1"
          className="text-xl md:text-2xl font-bold leading-tight"
        />
        {/* Combined threat level */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold"
          style={{
            background: `${combinedThreatColor}12`,
            border: `1px solid ${combinedThreatColor}35`,
            color: combinedThreatColor,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: combinedThreatColor }}
          />
          COMBINED THREAT: {matchResult.combined_threat_level}
        </div>
      </div>

      {/* Compatibility score */}
      <div
        className="rounded-xl border p-5 flex flex-col items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <span className="font-mono text-xs tracking-wider" style={{ color: "#555555" }}>
          COMPATIBILITY SCORE
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold" style={{ color: compatColor }}>
            {compatScore}
          </span>
          <span className="text-xl" style={{ color: "#555555" }}>
            /100
          </span>
        </div>
        {/* Progress bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${compatScore}%`,
              background: `linear-gradient(90deg, #ff0040, ${compatColor})`,
              boxShadow: `0 0 8px ${compatColor}60`,
            }}
          />
        </div>
        <p className="text-xs text-center" style={{ color: "#555555" }}>
          {compatScore >= 70
            ? "Suspiciously okay. Mag-ingat."
            : compatScore >= 40
            ? "Mabubuhay kayo. Barely."
            : "God help you both."}
        </p>
      </div>

      {/* Side-by-side profiles — stacked on mobile, side-by-side on sm+ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <ProfileCard profile={profileA} label="PERSON A" isWinner={aIsMoreSawi} />
        <ProfileCard profile={profileB} label="PERSON B" isWinner={!aIsMoreSawi} />
      </div>

      {/* Detail cards: who texts / who ghosts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailCard label="📱 WHO TEXTS FIRST" value={matchResult.who_texts_first} />
        <DetailCard label="👻 WHO GHOSTS FIRST" value={matchResult.who_ghosts_first} />
      </div>

      {/* Talking stage + red flag */}
      <DetailCard
        label="⏳ TALKING STAGE DURATION"
        value={matchResult.talking_stage_duration}
      />
      <DetailCard
        label="🚩 BIGGEST RED FLAG COMBO"
        value={matchResult.biggest_red_flag_combo}
        accent
      />

      {/* Song overlap roast */}
      <div
        className="rounded-xl border p-5 flex flex-col gap-2"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <span className="font-mono text-xs tracking-wider" style={{ color: "#555555" }}>
          🎵 PLAYLIST ANALYSIS
        </span>
        <p className="text-sm leading-relaxed" style={{ color: "#e8e8e8" }}>
          {matchResult.song_overlap_roast}
        </p>
      </div>

      {/* Relationship prediction */}
      <div
        className="rounded-xl border p-5 flex flex-col gap-2"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <span className="font-mono text-xs tracking-wider" style={{ color: "#555555" }}>
          🔮 RELATIONSHIP PREDICTION
        </span>
        <p className="text-sm leading-relaxed" style={{ color: "#e8e8e8" }}>
          {matchResult.relationship_prediction}
        </p>
      </div>

      {/* Final match verdict */}
      <div
        className="rounded-xl border p-5 flex flex-col gap-3"
        style={{
          background: "rgba(255,8,68,0.05)",
          borderColor: "rgba(255,50,82,0.3)",
        }}
      >
        <span className="font-mono text-xs tracking-wider" style={{ color: "#ff3252" }}>
          FINAL MATCH VERDICT
        </span>
        <p className="text-sm leading-relaxed font-medium" style={{ color: "#e8e8e8" }}>
          {matchResult.final_match_verdict}
        </p>
        <p className="font-mono text-xs text-center pt-1" style={{ color: "#555555" }}>
          —— SENTI.AI MATCH SYSTEM ——
        </p>
      </div>
    </div>
  );
}
