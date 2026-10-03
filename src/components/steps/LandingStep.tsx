"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import {
  IconArrowRight,
  IconHistory,
  IconMusic,
  IconShare,
  IconSparkle,
  IconTrophy,
} from "@/components/ui/icons";
import { headerVariants, itemVariants, listVariants } from "@/components/ui/motion";
import { generateFingerprint, getRemainingAnalyses } from "@/lib/fingerprint";
import { ANALYSIS_LIMITS_ENABLED, DAILY_ANALYSIS_LIMIT } from "@/lib/limits";
import { THREAT } from "@/lib/theme";

interface LandingStepProps {
  onStart: () => void;
  /** Present when a finished report is saved in this browser. */
  onOpenLastReport?: () => void;
  /** True when answers from an unfinished scan are waiting. */
  hasDraft?: boolean;
}

const STEPS = [
  { Icon: IconMusic, title: "Add your songs", body: "The ones on repeat. Search the library or tap a quick pick." },
  { Icon: IconSparkle, title: "Answer five things", body: "Type, attachment, love language, sign — and, if you want, what happened." },
  { Icon: IconShare, title: "Get read. Share it.", body: "A full report, story-ready for IG — then dare a friend to beat it." },
];

/** Decorative sample cards. Labelled as samples; never a real user's result. */
const SAMPLES = [
  {
    level: "CRITICAL" as const,
    score: "8.7",
    line: "“Paubaya on repeat pero ‘okay ka na’ raw. Pick one.”",
    tilt: -6,
    x: -10,
  },
  {
    level: "ELEVATED" as const,
    score: "6.1",
    line: "“May spreadsheet ka ng reply time niya. Standard deviation: 47 minutes.”",
    tilt: 5,
    x: 18,
  },
];

export default function LandingStep({
  onStart,
  onOpenLastReport,
  hasDraft = false,
}: LandingStepProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!ANALYSIS_LIMITS_ENABLED) return;
    // Browser-only read: the count comes from a fingerprint plus
    // localStorage, so it can't be resolved during render without a
    // hydration mismatch. Syncing after mount is the intended behaviour.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(getRemainingAnalyses(generateFingerprint()));
  }, []);

  const locked = remaining !== null && remaining <= 0;

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-[100dvh] px-4 sm:px-6 max-w-[1080px] mx-auto w-full"
    >
      {/* ── Nav ── */}
      <motion.nav variants={headerVariants} className="flex items-center justify-between py-5">
        <span className="inline-flex items-center gap-2.5">
          <BrandMark size={34} />
          <span className="font-display font-bold text-[19px] tracking-tight text-text-primary">Senti.AI</span>
        </span>
        <span className="flex items-center gap-1">
          {[
            { href: "/leaderboard", label: "Leaderboard", Icon: IconTrophy },
            { href: "/history", label: "History", Icon: IconHistory },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] text-text-secondary hover:text-text-primary hover:bg-white/60 transition-colors"
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </span>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="flex-1 grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 lg:gap-6 py-8 sm:py-12">
        <div className="flex flex-col items-start gap-6">
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-white px-3.5 py-1.5 text-[13px] text-text-secondary"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Emotional Damage Assessment · v6.9
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="text-[42px] leading-[1.02] sm:text-[60px] font-extrabold text-text-primary"
          >
            Ano&apos;ng sinasabi ng <span className="text-shimmer">playlist mo</span>{" "}tungkol sa&apos;yo?
          </motion.h1>

          <motion.p variants={itemVariants} className="text-[17px] text-text-secondary leading-relaxed max-w-[46ch]">
            Add the songs you have on repeat, answer five quick things about how you love, and get a
            brutally honest, very Filipino read of your love life. Taglish roast included.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <Button onClick={onStart} disabled={locked} className="text-[16px] py-4 px-7 sm:min-w-[220px]">
              {hasDraft ? "Continue my scan" : "Start my scan"}
              {!locked && <IconArrowRight size={19} />}
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-text-muted">
            <span>≈ 2 minutes</span>
            <span aria-hidden>·</span>
            <span>Free</span>
            {remaining !== null && Number.isFinite(remaining) && (
              <>
                <span aria-hidden>·</span>
                <span className={locked ? "text-accent-ink font-medium" : ""}>
                  {locked
                    ? "No scans left today — balik bukas"
                    : `${remaining}/${DAILY_ANALYSIS_LIMIT} scans left today`}
                </span>
              </>
            )}
            {onOpenLastReport && (
              <>
                <span aria-hidden>·</span>
                <button onClick={onOpenLastReport} className="text-accent-ink font-medium hover:underline cursor-pointer">
                  See your last report →
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* Sample report cards — show the payoff before asking for anything */}
        <motion.div variants={itemVariants} className="relative h-[380px] sm:h-[390px] w-full max-w-[420px] mx-auto" aria-hidden="true">
          {SAMPLES.map((sample, i) => {
            const tone = THREAT[sample.level];
            return (
              <motion.div
                key={sample.level}
                className="absolute left-1/2 w-[86%] glass rounded-3xl p-5 flex flex-col gap-3"
                style={{ top: i === 0 ? 0 : 172, x: "-50%", marginLeft: sample.x, rotate: sample.tilt, zIndex: i }}
                animate={{ y: [0, i === 0 ? -8 : 8, 0] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[12px] font-semibold rounded-full px-2.5 py-1"
                    style={{ color: tone.ink, background: tone.soft }}
                  >
                    Threat level: {tone.label}
                  </span>
                  <span className="text-[11px] text-text-muted">Sample</span>
                </div>
                <p className="font-display text-[17px] font-semibold leading-snug text-text-primary">{sample.line}</p>
                <div className="flex items-end justify-between">
                  <span className="text-[12px] text-text-muted">Emotional damage</span>
                  <span className="font-display text-[26px] font-bold leading-none" style={{ color: tone.ink }}>
                    {sample.score}
                    <span className="text-[13px] text-text-muted font-semibold">/10</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <motion.section variants={itemVariants} className="grid sm:grid-cols-3 gap-3 pb-6">
        {STEPS.map(({ Icon, title, body }, i) => (
          <div key={title} className="glass rounded-2xl p-4 flex gap-3.5 items-start">
            <span className="grid place-items-center w-10 h-10 rounded-xl text-white shrink-0" style={{ background: "var(--dusk-button)" }}>
              <Icon size={19} />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[12px] text-text-muted">Step {i + 1}</span>
              <span className="font-display text-[16px] font-semibold text-text-primary">{title}</span>
              <span className="text-[14px] text-text-secondary leading-relaxed">{body}</span>
            </span>
          </div>
        ))}
      </motion.section>

      {/* ── Footer ── */}
      <motion.footer
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 border-t border-border-subtle text-[13px] text-text-muted"
      >
        <p>Warning: brutally honest. Proceed at your own emotional risk.</p>
        <Link href="/leaderboard" className="inline-flex items-center gap-1.5 hover:text-accent-ink transition-colors">
          <IconTrophy size={15} /> Most damaged leaderboard
        </Link>
      </motion.footer>
    </motion.div>
  );
}
