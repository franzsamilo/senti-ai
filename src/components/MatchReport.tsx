"use client";

import { motion } from "framer-motion";
import type { MatchResult, UserProfile } from "@/lib/types";
import RevealText from "@/components/ui/RevealText";
import ScoreRing from "@/components/ui/ScoreRing";
import { itemVariants, listVariants } from "@/components/ui/motion";
import { ATTACHMENT_LABELS, LOVE_LANGUAGE_SHORT, threatTone } from "@/lib/theme";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function ProfileCard({ profile, label, isWinner }: { profile: UserProfile; label: string; isWinner: boolean }) {
  const tone = threatTone(profile.result.threat_level);
  const languages = Array.isArray(profile.loveLanguage) ? profile.loveLanguage : [profile.loveLanguage];

  return (
    <motion.div
      variants={itemVariants}
      className="glass rounded-3xl p-4 flex flex-col gap-3 flex-1 min-w-0"
      style={isWinner ? { boxShadow: "var(--shadow-lift), inset 0 0 0 1.5px rgba(224,48,107,0.45)" } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-text-muted">{label}</span>
        {isWinner && (
          <span className="text-[11px] font-bold rounded-full px-2 py-0.5 text-white" style={{ background: "var(--dusk-button)" }}>
            More sawi 🏆
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="font-display text-[34px] font-extrabold leading-none" style={{ color: tone.ink }}>
          {profile.result.emotional_damage_score.toFixed(1)}
          <span className="text-[14px] text-text-muted font-semibold">/10</span>
        </span>
        <span className="text-[11px] font-semibold rounded-full px-2 py-0.5" style={{ color: tone.ink, background: tone.soft }}>
          {tone.label}
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px]">
        <dt className="text-text-muted">Type</dt>
        <dd className="text-text-primary font-medium text-right">{profile.mbti}</dd>
        <dt className="text-text-muted">Attachment</dt>
        <dd className="text-text-primary text-right">{ATTACHMENT_LABELS[profile.attachmentStyle] ?? profile.attachmentStyle}</dd>
        <dt className="text-text-muted">Love</dt>
        <dd className="text-text-primary text-right">{languages.map((l) => LOVE_LANGUAGE_SHORT[l] ?? l).join(", ")}</dd>
        <dt className="text-text-muted">Sign</dt>
        <dd className="text-text-primary text-right">{cap(profile.zodiac)}</dd>
      </dl>

      <div className="flex flex-wrap gap-1">
        {profile.songs.slice(0, 8).map((song, i) => (
          <span key={i} className="text-[11.5px] px-2 py-0.5 rounded-lg bg-white border border-border-subtle text-text-secondary truncate max-w-full">
            {song.title}
          </span>
        ))}
        {profile.songs.length > 8 && (
          <span className="text-[11.5px] px-2 py-0.5 text-text-muted">+{profile.songs.length - 8}</span>
        )}
      </div>
    </motion.div>
  );
}

function DetailCard({ emoji, label, value, accent }: { emoji: string; label: string; value: string; accent?: boolean }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-3xl p-5 flex flex-col gap-2 ${accent ? "" : "glass"}`}
      style={accent ? { background: "#ffe6ee", border: "1px solid rgba(224,48,107,0.25)" } : undefined}
    >
      <span className={`text-[13px] font-semibold ${accent ? "text-accent-ink" : "text-text-muted"}`}>
        {emoji} {label}
      </span>
      <p className="text-[15px] leading-relaxed text-text-primary">{value}</p>
    </motion.div>
  );
}

interface MatchReportProps {
  matchResult: MatchResult;
  profileA: UserProfile;
  profileB: UserProfile;
}

export default function MatchReport({ matchResult, profileA, profileB }: MatchReportProps) {
  const aIsMoreSawi = profileA.result.emotional_damage_score >= profileB.result.emotional_damage_score;
  const combined = threatTone(matchResult.combined_threat_level);
  const compat = matchResult.compatibility_score;

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 px-4 py-8 max-w-[680px] mx-auto w-full"
    >
      {/* Hero */}
      <motion.header
        variants={itemVariants}
        className="relative overflow-hidden rounded-[28px] px-5 py-7 sm:px-7 text-white text-center flex flex-col items-center gap-4 shadow-[var(--shadow-lift)]"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(224,48,107,0.55) 0%, transparent 55%), radial-gradient(90% 70% at 0% 100%, rgba(139,63,217,0.5) 0%, transparent 60%), linear-gradient(160deg, #3b1d4a 0%, #2a1834 60%, #1f1228 100%)",
        }}
      >
        <span className="text-[13px] font-medium text-white/70">Senti.AI match report</span>
        <RevealText text={matchResult.match_headline} as="h1" className="text-[24px] sm:text-[30px] font-extrabold leading-[1.15]" />
        <ScoreRing value={compat} max={100} color={combined.color} label="Compatibility" delay={0.5} />
        <p className="text-[14px] text-white/80">
          Compatibility ·{" "}
          {compat >= 70 ? "Suspiciously okay. Mag-ingat." : compat >= 40 ? "Mabubuhay kayo. Barely." : "God help you both."}
        </p>
        <span
          className="text-[12px] font-extrabold uppercase tracking-wide rounded-lg px-2.5 py-1 border-2"
          style={{ color: combined.color, borderColor: combined.color, background: `${combined.color}1f` }}
        >
          Combined threat: {combined.label}
        </span>
      </motion.header>

      <div className="flex flex-col sm:flex-row gap-3">
        <ProfileCard profile={profileA} label="Person A" isWinner={aIsMoreSawi} />
        <ProfileCard profile={profileB} label="Person B" isWinner={!aIsMoreSawi} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DetailCard emoji="📱" label="Who texts first" value={matchResult.who_texts_first} />
        <DetailCard emoji="👻" label="Who ghosts first" value={matchResult.who_ghosts_first} />
      </div>
      <DetailCard emoji="⏳" label="Talking stage duration" value={matchResult.talking_stage_duration} />
      <DetailCard emoji="🚩" label="Biggest red flag combo" value={matchResult.biggest_red_flag_combo} accent />
      <DetailCard emoji="🎵" label="Playlist analysis" value={matchResult.song_overlap_roast} />
      <DetailCard emoji="🔮" label="Relationship prediction" value={matchResult.relationship_prediction} />

      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-5 flex flex-col gap-2 text-white"
        style={{ background: "var(--dusk-button)", boxShadow: "var(--shadow-glow)" }}
      >
        <span className="text-[13px] font-semibold text-white/80">Final match verdict</span>
        <p className="font-display text-[18px] font-semibold leading-snug">{matchResult.final_match_verdict}</p>
      </motion.div>
    </motion.div>
  );
}
