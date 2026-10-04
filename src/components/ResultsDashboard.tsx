"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import type { Song, AttachmentStyle, LoveLanguage, ProfileResult } from "@/lib/types";
import RevealText from "@/components/ui/RevealText";
import VideokeScore from "@/components/ui/VideokeScore";
import { useCountUp } from "@/components/ui/StatBox";
import ThreatMeter from "@/components/ui/ThreatMeter";
import SongChip from "@/components/ui/SongChip";
import Button from "@/components/ui/Button";
import ShareCard from "@/components/ShareCard";
import MatchChallenge from "@/components/MatchChallenge";
import { LeaderboardSubmit } from "@/components/ResultActions";
import {
  IconArrowLeft,
  IconDownload,
  IconEdit,
  IconFlag,
  IconHistory,
  IconRefresh,
  IconShare,
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
  /** Re-run the real analysis with the same answers (shown on degraded reports). */
  onRetry?: () => void;
  onHome?: () => void;
}

/**
 * A section of the report, headed like a newspaper section: a heavy rule,
 * the name in signage caps, and an optional pencilled aside.
 */
function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={itemVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="flex flex-col gap-3.5"
    >
      <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-t-[3px] border-ink pt-2">
        <span className="font-display font-black uppercase text-[28px] sm:text-[32px] leading-none tracking-[0.005em] text-ink">
          {title}
        </span>
        {aside && <span className="font-hand text-[18px] text-pink-ink leading-none">{aside}</span>}
      </h3>
      {children}
    </motion.section>
  );
}

/** A number that counts up the first time it scrolls into view. */
function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const counted = useCountUp(value, decimals, inView, 1200);
  return (
    <span ref={ref} className="tabular-nums">
      {counted.toFixed(decimals)}
    </span>
  );
}

/** Bunting strung across the top of the red-flag card. */
function Banderitas() {
  const colors = ["#e2402b", "#ffd23a", "#2b4ee0", "#ff4f9a"];
  const flags = 11;
  return (
    <svg viewBox="0 0 330 54" preserveAspectRatio="none" className="w-full h-[54px]" aria-hidden="true">
      <path d="M0 6 Q165 30 330 6" fill="none" stroke="#1d1932" strokeWidth={1.6} />
      {Array.from({ length: flags }, (_, i) => {
        const x = 15 + i * 30;
        const t = x / 330;
        const y = 6 + 4 * 24 * t * (1 - t) - 1;
        return (
          <g key={i} className="sway" style={{ animationDelay: `${(i % 4) * -0.7}s` }}>
            <path
              d={`M${x - 12} ${y} L${x + 12} ${y} L${x} ${y + 30} Z`}
              fill={colors[i % colors.length]}
              stroke="#1d1932"
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Headline size steps down as the model's line gets longer. */
function headlineSize(text: string) {
  if (text.length > 95) return "text-[32px] sm:text-[44px]";
  if (text.length > 65) return "text-[37px] sm:text-[52px]";
  return "text-[44px] sm:text-[62px]";
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
  onRetry,
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

  // Frozen at mount: the profile shared with a challenge should carry when
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

  const receiptLines: { label: string; value: number; decimals?: number; suffix: string }[] = [
    { label: "Drunk text probability", value: result.drunk_text_probability, suffix: "%" },
    { label: "Pain index (top-heavy)", value: painIndex, decimals: 1, suffix: "/10" },
    { label: "Delulu index", value: metrics.delulu.value, suffix: "%" },
    { label: "Tracks scanned", value: songs.length, suffix: "" },
  ];

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-[680px] mx-auto px-4 pt-4 pb-36 flex flex-col gap-9"
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
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3 -mb-4">
        {onHome ? (
          <button
            onClick={onHome}
            className="inline-flex items-center gap-1.5 min-h-[44px] -ml-1 px-1 font-display font-extrabold uppercase tracking-[0.04em] text-[15px] text-text-secondary hover:text-ink cursor-pointer"
          >
            <IconArrowLeft size={18} /> Home
          </button>
        ) : (
          <span />
        )}
        <span className="font-mono text-[11px] text-text-muted tabular-nums" style={{ fontStretch: "87.5%" }}>
          {caseId}
        </span>
      </motion.div>

      {/* The offline template is generic by nature. Say so up front — above
          the front page, where it can't be missed — rather than passing it off
          as a real read of this specific person. */}
      {result.degraded && (
        <motion.div
          variants={itemVariants}
          className="relative bg-yellow-soft border-2 border-ink px-4 py-3 text-[14px] leading-relaxed text-ink"
        >
          <span className="font-display font-black uppercase tracking-[0.06em]">Paunawa:</span> The analysis
          engine couldn&apos;t be reached, so this is the generic profile — not a full read of your answers.
          <span className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            {result.degraded_reason && (
              <span className="font-mono text-[11px] text-text-muted" style={{ fontStretch: "87.5%" }}>
                code: {result.degraded_reason}
              </span>
            )}
            {onRetry && (
              <Button variant="secondary" onClick={onRetry} className="min-h-[42px] py-2 px-4 text-[15px]">
                <IconRefresh size={17} /> Try the real read again
              </Button>
            )}
          </span>
        </motion.div>
      )}

      {/* ── Hero: the front page ── */}
      <motion.header variants={itemVariants} className="paper overflow-hidden" style={{ borderRadius: 4 }}>
        <div className="px-4 sm:px-6 pt-3.5">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b-2 border-ink font-display font-extrabold uppercase tracking-[0.06em] text-[13px] text-ink">
            <span>
              Senti<span className="text-pink">.</span>AI
            </span>
            <span className="text-center">Emotional Damage Report</span>
            <span className="hidden sm:inline">Libre</span>
          </div>
          <div className="mt-[3px] border-t-[5px] border-double border-ink" />

          <div className="flex items-center justify-between gap-3 pt-4">
            <span className="bg-red text-paper-light font-display font-black uppercase tracking-[0.06em] text-[14px] leading-none px-2 py-1.5 -rotate-1">
              Breaking
            </span>
            <motion.span
              initial={{ scale: 2.6, rotate: -24, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ ...popSpring, delay: 1.0 }}
              className="stamp text-[24px] sm:text-[28px]"
              style={{ color: tone.color }}
              aria-label={`Threat level: ${tone.label}`}
            >
              {tone.label}
            </motion.span>
          </div>

          <RevealText
            text={result.headline}
            as="h1"
            delay={0.15}
            stagger={0.05}
            className={`mt-3 font-display font-black uppercase leading-[0.9] tracking-[-0.005em] text-ink ${headlineSize(result.headline)}`}
          />
        </div>

        <div className="mt-5 grid sm:grid-cols-[1.05fr_1fr] gap-5 px-4 sm:px-6 pb-5 sm:items-center">
          <VideokeScore value={result.emotional_damage_score} delay={0.6} />
          <div className="flex flex-col gap-3">
            {result.score_reason && (
              <p className="font-serif italic text-[18px] leading-snug text-ink">
                <span className="not-italic font-display font-black uppercase text-[14px] tracking-[0.06em] text-pink-ink mr-1.5">
                  Dahil:
                </span>
                {result.score_reason}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {[mbti, ATTACHMENT_LABELS[attachmentStyle] ?? attachmentStyle, cap(zodiac), `${songs.length} tracks`].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-[5px] border-[1.5px] border-ink px-2 py-1 font-display font-extrabold uppercase tracking-[0.04em] text-[13px] leading-none text-ink"
                  >
                    {chip}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── The receipt ── */}
      <motion.div variants={itemVariants} className="lift">
        <div className="receipt px-5 sm:px-7 pt-8 pb-9 max-w-[440px] mx-auto">
          <p className="text-center font-display font-black uppercase text-[24px] tracking-[0.08em] leading-none text-ink">
            Senti<span className="text-pink">.</span>AI
          </p>
          <p className="text-center font-mono text-[10px] leading-relaxed text-text-muted mt-1.5" style={{ fontStretch: "87.5%" }}>
            OFFICIAL RESIBO · {caseId.replace("Case ", "")}
            <br />
            THIS DOCUMENT IS NOT VALID FOR CLAIM OF EMOTIONAL SUPPORT
          </p>
          <div className="my-3 border-t-2 border-dashed border-ink/35" />
          {receiptLines.map((line) => (
            <p
              key={line.label}
              className="flex items-baseline gap-2 font-mono text-[12.5px] leading-[2.1] text-ink"
              style={{ fontStretch: "87.5%" }}
            >
              <span className="shrink-0">{line.label}</span>
              <span className="leader" />
              <span className="shrink-0">
                <CountUp value={line.value} decimals={line.decimals} />
                {line.suffix}
              </span>
            </p>
          ))}
          <div className="my-3 border-t-2 border-dashed border-ink/35" />
          <p className="flex items-baseline gap-2 font-mono text-[15px] font-bold text-ink" style={{ fontStretch: "87.5%" }}>
            <span className="shrink-0">TOTAL DAMAGE</span>
            <span className="leader" />
            <span className="shrink-0 text-[20px]">
              <CountUp value={result.emotional_damage_score} decimals={1} />
            </span>
          </p>
          <div className="my-3 border-t-2 border-dashed border-ink/35" />
          <div
            aria-hidden
            className="h-[46px] mx-auto w-[80%]"
            style={{
              background:
                "repeating-linear-gradient(90deg, #1d1932 0 2px, transparent 2px 4px, #1d1932 4px 5px, transparent 5px 8px, #1d1932 8px 11px, transparent 11px 12px, #1d1932 12px 13px, transparent 13px 16px)",
            }}
          />
          <p className="text-center font-mono text-[11px] text-ink mt-2" style={{ fontStretch: "87.5%" }}>
            Salamat po! Balik kayo. (&apos;Wag na.)
          </p>
        </div>
      </motion.div>

      <Section title="Final verdict" aside="walang awa">
        <blockquote className="relative paper px-5 sm:px-6 pt-9 pb-5">
          <span aria-hidden className="absolute -top-2 left-3 font-serif font-black text-[104px] leading-none text-pink">
            &ldquo;
          </span>
          <p className="relative font-serif italic text-[22px] sm:text-[26px] leading-[1.25] text-ink">
            {result.final_verdict}
          </p>
          <footer className="mt-3 font-display font-extrabold uppercase tracking-[0.05em] text-[14px] text-text-muted">
            — Senti.AI
          </footer>
        </blockquote>
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Prescription pad */}
          <div className="paper px-4 pt-3 pb-4 flex flex-col" style={{ borderRadius: 4 }}>
            <div className="flex items-end justify-between gap-3 border-b-2 border-ink pb-2">
              <span className="font-serif font-black italic text-[44px] leading-[0.8] text-ink">Rx</span>
              <span className="text-right font-display font-extrabold uppercase tracking-[0.05em] text-[12px] leading-tight text-ink">
                Klinika ng mga Sawi
                <br />
                <span className="text-text-muted">Recommended action</span>
              </span>
            </div>
            <p className="pt-3 text-[15px] text-ink leading-relaxed flex-1">{result.recommended_action}</p>
            <p className="mt-3 self-end border-t border-ink/50 pt-1 font-hand text-[17px] text-blue-ink">
              Dr. Senti, MD (Master of Drama)
            </p>
          </div>
          {/* Government warning */}
          <div className="border-[3px] border-ink bg-paper-light px-4 py-3.5 flex flex-col gap-2">
            <p className="font-display font-black uppercase tracking-[0.04em] text-[20px] leading-none text-ink">
              Government warning:
            </p>
            <p className="text-[15px] font-semibold text-ink leading-snug">{result.compatibility_warning}</p>
            <p className="text-[11.5px] text-text-muted leading-snug">
              Para sa sinumang magbabalak i-date ang taong ito.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Threat assessment" aside="levels, live">
        <div className="paper p-4 sm:p-5 flex flex-col gap-5">
          {METRIC_KEYS.map((key, i) => (
            <ThreatMeter
              key={key}
              label={METRIC_LABELS[key]}
              value={metrics[key].value}
              note={metrics[key].note}
              delay={i * 0.06}
            />
          ))}
        </div>
      </Section>

      <Section title="Surveillance log">
        <div className="paper overflow-hidden" style={{ borderRadius: 4 }}>
          <p
            className="flex justify-between gap-3 px-4 py-2 bg-ink font-mono text-[10.5px] text-paper-light"
            style={{ fontStretch: "87.5%" }}
          >
            <span>BARANGAY BLOTTER</span>
            <span>ENTRY {caseId.slice(-4)}</span>
          </p>
          <p className="px-4 py-4 text-[16px] text-ink leading-relaxed">{result.ex_stalking_frequency}</p>
        </div>
      </Section>

      <Section title="Liner notes" aside="what your playlist says">
        <div className="paper overflow-hidden" style={{ borderRadius: 4 }}>
          <div className="flex items-center justify-between gap-3 px-4 py-2 bg-pink border-b-2 border-ink">
            <span className="font-hand text-[19px] leading-none text-ink">Side A — the evidence</span>
            <span className="font-mono text-[11px] text-ink" style={{ fontStretch: "87.5%" }}>
              {songs.length} TRACKS
            </span>
          </div>
          <p className="px-4 pt-4 text-[16px] text-ink leading-relaxed">{result.song_diagnosis}</p>
          {songs.length > 0 && (
            <div className="flex flex-col gap-3 px-4 pb-4 mt-4 pt-3 border-t-2 border-dashed border-ink/20">
              <div className="flex flex-wrap gap-2">
                {(showAllSongs ? songs : songs.slice(0, SONG_PREVIEW_COUNT)).map((s, i) => (
                  <SongChip key={`${s.title}-${s.artist}-${i}`} song={s} showPainIndex />
                ))}
              </div>
              {songs.length > SONG_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllSongs((v) => !v)}
                  className="self-start min-h-[40px] font-display font-extrabold uppercase tracking-[0.04em] text-[14px] text-pink-ink underline decoration-2 underline-offset-4 cursor-pointer"
                >
                  {showAllSongs ? "Show less" : `Show ${songs.length - SONG_PREVIEW_COUNT} more`}
                </button>
              )}
            </div>
          )}
        </div>
      </Section>

      <Section title={`${result.behavioral_predictions.length} hula para sa'yo`} aside="mangyayari 'to">
        <ol className="paper px-4 sm:px-5 py-1">
          {result.behavioral_predictions.map((pred, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 260, damping: 26, delay: i * 0.05 }}
              className="grid grid-cols-[46px_1fr] gap-3 py-4 border-b-2 border-dashed border-ink/15 last:border-b-0"
            >
              <span className="signpaint font-display font-black text-[52px] leading-[0.82] text-center" style={{ color: "var(--pink)" }}>
                {i + 1}
              </span>
              <p className="text-[16px] text-ink leading-relaxed">{pred}</p>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section title="Risk factors">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {/* Toxic Facts — a nutrition label */}
          <div className="border-[3px] border-ink bg-paper-light px-3 pt-2 pb-3 text-ink">
            <p className="font-body font-black text-[38px] leading-[0.95] tracking-[-0.02em]" style={{ fontStretch: "75%" }}>
              Toxic Facts
            </p>
            <p className="text-[13px] border-b border-ink pb-1">Serving size: 1 situationship</p>
            <div className="h-[10px] bg-ink my-1" />
            <p className="flex justify-between text-[12px] font-bold border-b border-ink pb-1">
              <span>Amount per serving</span>
              <span>% Daily Value*</span>
            </p>
            {result.toxic_traits.map((trait, i) => (
              <div key={i} className="flex justify-between gap-3 py-2 border-b border-ink/70 text-[14px] leading-snug">
                <span>{trait}</span>
                <span className="font-black shrink-0">{["180%", "250%", "999%"][i] ?? "∞"}</span>
              </div>
            ))}
            <div className="h-[6px] bg-ink mt-1" />
            <p className="text-[11px] mt-1.5 leading-snug">
              *Percent Daily Values are based on a 2,000-overthink diet.
            </p>
          </div>

          {/* Red flags under banderitas */}
          <div className="paper overflow-hidden">
            <Banderitas />
            <div className="px-4 pb-4">
              <p className="font-display font-black uppercase text-[26px] leading-none text-ink">Red flags</p>
              <p className="font-hand text-[17px] text-pink-ink">para sa future jowa</p>
              <ul className="mt-2 flex flex-col gap-3">
                {result.red_flags.map((flag, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] text-ink leading-snug">
                    <IconFlag size={20} className="shrink-0 mt-0.5 text-ink" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Pass it on" aside="i-share mo na">
        <div className="flex flex-col gap-4">
          <MatchChallenge profile={profile} />
          <LeaderboardSubmit result={result} mbti={mbti} attachmentStyle={attachmentStyle} zodiac={zodiac} />
        </div>
      </Section>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onRunAgain}>
          <IconRefresh size={19} /> New scan
        </Button>
        {onEditAnswers && (
          <Button variant="secondary" className="flex-1" onClick={onEditAnswers}>
            <IconEdit size={19} /> Tweak answers
          </Button>
        )}
        <Link
          href="/history"
          className="flex-1 inline-flex items-center justify-center gap-2 min-h-[50px] px-5 font-display font-extrabold uppercase tracking-[0.04em] text-[17px] text-text-secondary hover:text-ink transition-colors"
        >
          <IconHistory size={19} /> History
        </Link>
      </motion.div>

      {/* ── Share bar: pinned under the thumb ── */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28, delay: 1.4 }}
        className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-4"
        style={{
          background: "linear-gradient(180deg, rgba(244,237,224,0) 0%, rgba(244,237,224,0.94) 40%, #f4ede0 100%)",
        }}
      >
        <div className="max-w-[680px] mx-auto flex gap-2.5">
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
                  "Shared!"
                ) : sharing === "downloaded" ? (
                  "Saved — post it to your story"
                ) : (
                  <>
                    <IconShare size={20} /> Share to IG / FB story
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
            <IconDownload size={22} />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
