"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Song, AttachmentStyle, LoveLanguage, ProfileResult } from "@/lib/types";
import RevealText from "@/components/ui/RevealText";
import ScoreRing from "@/components/ui/ScoreRing";
import StatBox from "@/components/ui/StatBox";
import ThreatMeter from "@/components/ui/ThreatMeter";
import SongChip from "@/components/ui/SongChip";
import Button from "@/components/ui/Button";
import ShareCard from "@/components/ShareCard";
import MatchChallenge from "@/components/MatchChallenge";
import { BarkadaCreate, BarkadaJoin, LeaderboardSubmit } from "@/components/ResultActions";
import {
  IconArrowLeft,
  IconDownload,
  IconEdit,
  IconFlag,
  IconHeart,
  IconHistory,
  IconMusic,
  IconRefresh,
  IconSearch,
  IconShare,
  IconSignal,
  IconSparkle,
  IconTarget,
} from "@/components/ui/icons";
import { itemVariants, listVariants, popSpring } from "@/components/ui/motion";
import { captureCard, downloadBlob, shareOrDownload } from "@/lib/shareImage";
import { legacyMetrics, METRIC_KEYS, METRIC_LABELS, painStats } from "@/lib/scoring";
import { ATTACHMENT_LABELS, threatTone } from "@/lib/theme";

/** Songs shown in the evidence list before it collapses. */
const SONG_PREVIEW_COUNT = 10;

interface ResultsDashboardProps {
  result: ProfileResult;
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage[];
  zodiac: string;
  onRunAgain: () => void;
  onEditAnswers?: () => void;
  onHome?: () => void;
  /** Set when the user arrived from a barkada group link. */
  pendingBarkadaId?: string | null;
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={itemVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="flex flex-col gap-3"
    >
      <h3 className="flex items-center gap-2.5 text-[19px] font-bold text-text-primary">
        <span className="grid place-items-center w-8 h-8 rounded-xl bg-[rgba(139,63,217,0.1)] text-accent-secondary">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-3xl p-5 ${className}`}>{children}</div>;
}

/** Stable per-report identifier — deterministic so it survives re-renders. */
function makeCaseId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `Case #SA-${Math.abs(hash).toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function ResultsDashboard({
  result,
  songs,
  mbti,
  attachmentStyle,
  loveLanguage,
  zodiac,
  onRunAgain,
  onEditAnswers,
  onHome,
  pendingBarkadaId,
}: ResultsDashboardProps) {
  const tone = threatTone(result.threat_level);
  const painIndex = result.pain_index ?? painStats(songs).weighted;
  const metrics = result.metrics ?? legacyMetrics(result.emotional_damage_score, painStats(songs).average);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState<"idle" | "busy" | "shared" | "downloaded">("idle");
  const [showAllSongs, setShowAllSongs] = useState(false);

  const caseId = useMemo(
    () => makeCaseId(`${mbti}${attachmentStyle}${zodiac}${result.headline}`),
    [mbti, attachmentStyle, zodiac, result.headline]
  );

  // Frozen at mount: the profile shared to match/barkada should carry when
  // the report was viewed, not change on every render.
  const [timestamp] = useState(() => Date.now());
  const profile = { songs, mbti, attachmentStyle, loveLanguage, zodiac, result, timestamp };

  async function renderCard(): Promise<Blob | null> {
    if (!shareCardRef.current) return null;
    // Fonts must be ready or the capture falls back to a system face.
    await document.fonts?.ready;
    return captureCard(shareCardRef.current);
  }

  async function handleShare() {
    setSharing("busy");
    try {
      const blob = await renderCard();
      if (!blob) return setSharing("idle");
      const outcome = await shareOrDownload(
        blob,
        `senti-ai-${Date.now()}.png`,
        "My Senti.AI Emotional Damage Report"
      );
      setSharing(outcome === "cancelled" ? "idle" : outcome);
      if (outcome !== "cancelled") setTimeout(() => setSharing("idle"), 3200);
    } catch (err) {
      console.error("Share failed:", err);
      setSharing("idle");
    }
  }

  async function handleDownload() {
    setSharing("busy");
    try {
      const blob = await renderCard();
      if (blob) {
        downloadBlob(blob, `senti-ai-${Date.now()}.png`);
        setSharing("downloaded");
        setTimeout(() => setSharing("idle"), 3200);
      } else setSharing("idle");
    } catch (err) {
      console.error("Download failed:", err);
      setSharing("idle");
    }
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-[680px] mx-auto px-4 pt-5 pb-36 flex flex-col gap-7"
    >
      <ShareCard
        ref={shareCardRef}
        result={result}
        painIndex={painIndex}
        mbti={mbti}
        attachmentStyle={ATTACHMENT_LABELS[attachmentStyle] ?? attachmentStyle}
        zodiac={cap(zodiac)}
      />

      {/* ── Top bar ── */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
        {onHome ? (
          <button
            onClick={onHome}
            className="inline-flex items-center gap-1.5 rounded-full pl-2 pr-3.5 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary bg-white/60 hover:bg-white border border-white/90 cursor-pointer"
          >
            <IconArrowLeft size={16} /> Home
          </button>
        ) : (
          <span />
        )}
        <span className="text-[12px] text-text-muted tabular-nums">{caseId}</span>
      </motion.div>

      {/* ── Hero: the reveal ── */}
      <motion.header
        variants={itemVariants}
        className="relative overflow-hidden rounded-[28px] px-5 pt-6 pb-6 sm:px-7 sm:pt-8 text-white shadow-[var(--shadow-lift)]"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(224,48,107,0.55) 0%, transparent 55%), radial-gradient(90% 70% at 0% 100%, rgba(139,63,217,0.5) 0%, transparent 60%), linear-gradient(160deg, #3b1d4a 0%, #2a1834 60%, #1f1228 100%)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-white/70">Emotional Damage Report</span>
          <motion.span
            initial={{ scale: 2.4, rotate: -18, opacity: 0 }}
            animate={{ scale: 1, rotate: -4, opacity: 1 }}
            transition={{ ...popSpring, delay: 0.9 }}
            className="text-[12px] font-extrabold tracking-wide rounded-lg px-2.5 py-1 border-2 uppercase"
            style={{ color: tone.color, borderColor: tone.color, background: `${tone.color}1f` }}
          >
            {tone.label}
          </motion.span>
        </div>

        <RevealText
          text={result.headline}
          as="h1"
          delay={0.15}
          className="mt-4 text-[26px] sm:text-[32px] font-extrabold leading-[1.12] text-white"
        />

        <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <ScoreRing value={result.emotional_damage_score} color={tone.color} delay={0.6} />
          <div className="flex flex-col gap-3 text-center sm:text-left flex-1">
            <p className="text-[13px] text-white/60">
              Threat level <span className="font-semibold text-white">{tone.label}</span>{" "}· Emotional damage
            </p>
            {result.score_reason && (
              <p className="text-[15px] text-white/90 leading-relaxed">{result.score_reason}</p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
              {[mbti, ATTACHMENT_LABELS[attachmentStyle] ?? attachmentStyle, cap(zodiac), `${songs.length} tracks`].map(
                (chip) => (
                  <span key={chip} className="rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[12px] text-white/85">
                    {chip}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* The offline template is generic by nature. Say so rather than
          passing it off as a real read of this specific person. */}
      {result.degraded && (
        <motion.div
          variants={itemVariants}
          className="flex items-start gap-3 rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
          style={{ background: "#fff1d6", border: "1px solid rgba(180,83,9,0.25)", color: "#8a4407" }}
        >
          <IconTarget size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong className="font-semibold">Offline assessment.</strong> The analysis engine couldn&apos;t be
            reached, so this is the generic profile — not a full read of your answers. Try again in a moment.
          </span>
        </motion.div>
      )}

      {/* ── Quick stats ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2.5">
        <StatBox label="Drunk text chance" value={result.drunk_text_probability} suffix="%" animate />
        <StatBox label="Pain index" value={painIndex} suffix="/10" decimals={1} animate />
        <StatBox label="Delulu index" value={metrics.delulu.value} suffix="%" animate />
      </motion.div>

      <Section title="Final verdict" icon={<IconTarget size={16} />}>
        <Card className="!bg-white/85">
          <p className="font-display text-[19px] font-semibold leading-snug text-text-primary">{result.final_verdict}</p>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-accent-soft px-4 py-3">
              <p className="text-[12px] font-semibold text-accent-ink mb-1">Recommended action</p>
              <p className="text-[14px] text-text-primary leading-relaxed">{result.recommended_action}</p>
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ background: tone.soft }}>
              <p className="text-[12px] font-semibold mb-1" style={{ color: tone.ink }}>
                Warning for future jowa
              </p>
              <p className="text-[14px] text-text-primary leading-relaxed">{result.compatibility_warning}</p>
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Threat assessment" icon={<IconSignal size={16} />}>
        <Card className="flex flex-col gap-5">
          {METRIC_KEYS.map((key, i) => (
            <ThreatMeter
              key={key}
              label={METRIC_LABELS[key]}
              value={metrics[key].value}
              note={metrics[key].note}
              color={key === "healing" ? "#10b981" : i % 2 === 0 ? "#e0306b" : "#8b3fd9"}
              delay={i * 0.08}
            />
          ))}
        </Card>
      </Section>

      <Section title="Surveillance pattern" icon={<IconSearch size={16} />}>
        <Card>
          <p className="text-[15px] text-text-primary leading-relaxed">{result.ex_stalking_frequency}</p>
        </Card>
      </Section>

      <Section title="What your playlist says" icon={<IconMusic size={16} />}>
        <Card>
          <p className="text-[15px] text-text-primary leading-relaxed">{result.song_diagnosis}</p>
          {songs.length > 0 && (
            <div className="flex flex-col gap-3 mt-5 pt-4 border-t border-border-subtle">
              <p className="text-[13px] text-text-muted">Evidence · {songs.length} tracks · pain index</p>
              <div className="flex flex-wrap gap-2">
                {(showAllSongs ? songs : songs.slice(0, SONG_PREVIEW_COUNT)).map((s, i) => (
                  <SongChip key={`${s.title}-${s.artist}-${i}`} song={s} showPainIndex />
                ))}
              </div>
              {songs.length > SONG_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllSongs((v) => !v)}
                  className="self-start text-[13px] font-medium text-accent-ink hover:underline cursor-pointer"
                >
                  {showAllSongs ? "Show less" : `Show ${songs.length - SONG_PREVIEW_COUNT} more`}
                </button>
              )}
            </div>
          )}
        </Card>
      </Section>

      <Section title="Behavioral predictions" icon={<IconSparkle size={16} />}>
        <div className="flex flex-col gap-2.5">
          {result.behavioral_predictions.map((pred, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 260, damping: 26, delay: i * 0.06 }}
              className="glass rounded-2xl p-4 flex gap-3.5"
            >
              <span
                className="shrink-0 grid place-items-center w-7 h-7 rounded-full text-[13px] font-bold text-white"
                style={{ background: "var(--dusk-button)" }}
              >
                {i + 1}
              </span>
              <p className="text-[15px] text-text-primary leading-relaxed">{pred}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section title="Risk factors" icon={<IconFlag size={16} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <p className="text-[14px] font-semibold text-text-primary mb-3">Toxic traits</p>
            <ul className="flex flex-col gap-3">
              {result.toxic_traits.map((trait, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] text-text-primary leading-relaxed">
                  <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-accent" />
                  {trait}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <p className="text-[14px] font-semibold text-text-primary mb-3">Red flags for the future jowa</p>
            <ul className="flex flex-col gap-3">
              {result.red_flags.map((flag, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] text-text-primary leading-relaxed">
                  <IconFlag size={14} className="shrink-0 mt-1 text-threat-critical" />
                  {flag}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="Bring your barkada into this" icon={<IconHeart size={16} />}>
        <div className="flex flex-col gap-3">
          <MatchChallenge profile={profile} />
          {pendingBarkadaId && <BarkadaJoin groupId={pendingBarkadaId} profile={profile} />}
          <div className="grid sm:grid-cols-2 gap-3">
            <BarkadaCreate profile={profile} />
            <LeaderboardSubmit result={result} mbti={mbti} attachmentStyle={attachmentStyle} zodiac={zodiac} />
          </div>
        </div>
      </Section>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onRunAgain}>
          <IconRefresh size={17} /> New scan
        </Button>
        {onEditAnswers && (
          <Button variant="secondary" className="flex-1" onClick={onEditAnswers}>
            <IconEdit size={17} /> Tweak answers
          </Button>
        )}
        <Link
          href="/history"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl min-h-[48px] px-5 text-[15px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white/50 transition-colors"
        >
          <IconHistory size={17} /> History
        </Link>
      </motion.div>

      {/* ── Share bar: pinned under the thumb ── */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28, delay: 1.4 }}
        className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(241,235,251,0) 0%, rgba(241,235,251,0.9) 40%, rgba(241,235,251,0.98) 100%)",
        }}
      >
        <div className="max-w-[680px] mx-auto flex gap-2">
          <Button className="flex-1 py-4" disabled={sharing === "busy"} onClick={handleShare}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={sharing}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-2"
              >
                {sharing === "busy" ? (
                  "Packaging your damage…"
                ) : sharing === "shared" ? (
                  "Shared! 🔥"
                ) : sharing === "downloaded" ? (
                  "Saved — post it to your story 🔥"
                ) : (
                  <>
                    <IconShare size={18} /> Share to IG / FB story
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
          <Button
            variant="secondary"
            className="px-4 shrink-0"
            disabled={sharing === "busy"}
            onClick={handleDownload}
            aria-label="Save image"
            title="Save image"
          >
            <IconDownload size={19} />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
