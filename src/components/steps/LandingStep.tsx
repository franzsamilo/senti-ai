"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import {
  IconArrowRight,
  IconEdit,
  IconHistory,
  IconMusic,
  IconShare,
  IconTrophy,
} from "@/components/ui/icons";
import { headerVariants, itemVariants, listVariants } from "@/components/ui/motion";
import { generateFingerprint, getRemainingAnalyses } from "@/lib/fingerprint";
import { ANALYSIS_LIMITS_ENABLED, DAILY_ANALYSIS_LIMIT } from "@/lib/limits";
import { hasFinishedScan } from "@/lib/reportStore";

interface LandingStepProps {
  onStart: () => void;
  /** Present when a finished report is saved in this browser. */
  onOpenLastReport?: () => void;
  /** True when answers from an unfinished scan are waiting. */
  hasDraft?: boolean;
}

/** How it works, as a three-panel komiks strip. */
const PANELS: { Icon: typeof IconMusic; caption: string; body: string; says: string }[] = [
  {
    Icon: IconMusic,
    caption: "Una: ilista ang kanta",
    body: "The ones on repeat. Search the library or tap a quick pick.",
    says: "Paubaya lang, promise.",
  },
  {
    Icon: IconEdit,
    caption: "Pangalawa: sagutin ang lima",
    body: "Type, attachment, love language, sign — and, if you want, what happened.",
    says: "INFP. Anxious. Okay lang ako.",
  },
  {
    Icon: IconShare,
    caption: "Pangatlo: kilalanin ang sarili",
    body: "A full read on how you love — story-ready for IG, then pass it to a friend.",
    says: "Teka… paano nila nalaman?",
  },
];

function SpeechBubble({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block self-end max-w-[85%]">
      <span className="relative z-10 block rounded-[18px] border-2 border-ink bg-paper-light px-3 py-1.5 font-hand text-[17px] leading-tight text-ink">
        {children}
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 16"
        className="absolute -bottom-[12px] left-6 w-5 h-4 z-20"
      >
        <path d="M2 0 L7 14 L14 0" fill="#fffaf2" stroke="#1d1932" strokeWidth={2} strokeLinejoin="round" />
        <path d="M1 0 H15" stroke="#fffaf2" strokeWidth={3} />
      </svg>
    </span>
  );
}

/**
 * Clipping samples — labelled as samples; never a real user's result. They
 * tease the format (a slip, a score screen, a one-liner) without showing a
 * verdict: the roast is the reveal, so nothing before the results gives it
 * away.
 */
function SampleClippings() {
  return (
    <div className="relative h-[400px] sm:h-[420px] w-full max-w-[420px] mx-auto" aria-hidden="true">
      {/* Order slip */}
      <motion.div
        className="absolute left-[2%] top-2 w-[66%] lift"
        style={{ rotate: -5 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="receipt px-4 pt-6 pb-7">
          <p className="text-center font-display font-black uppercase tracking-[0.08em] text-[17px] leading-none">
            Senti.AI
          </p>
          <p className="text-center font-mono text-[9.5px] text-text-muted mt-1" style={{ fontStretch: "87.5%" }}>
            ORDER SLIP · SAMPLE
          </p>
          <div className="my-2.5 border-t-2 border-dashed border-ink/30" />
          {[
            ["Paubaya", "x14"],
            ["Multo", "x9"],
            ["Tahanan", "x6"],
            ["Pantropiko", "x2"],
          ].map(([k, v]) => (
            <p key={k} className="flex items-baseline gap-1.5 font-mono text-[11px] leading-[1.9]" style={{ fontStretch: "87.5%" }}>
              {k}
              <span className="leader" />
              {v}
            </p>
          ))}
          <div className="my-2 border-t-2 border-dashed border-ink/30" />
          <p className="flex items-baseline gap-1.5 font-mono text-[11.5px] font-bold" style={{ fontStretch: "87.5%" }}>
            TOTAL <span className="leader" /> 1 read
          </p>
          <div className="mt-3 flex justify-start">
            <span className="stamp text-[18px] -rotate-[7deg] text-blue">Salamat</span>
          </div>
        </div>
      </motion.div>

      {/* Videoke, before anyone sings */}
      <motion.div
        className="absolute right-0 top-[190px] w-[60%]"
        style={{ rotate: 4 }}
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
        <div className="rounded-[14px] border-2 border-ink bg-ink p-2 shadow-[var(--shadow-hard)]">
          <div className="crt rounded-[8px] px-3 py-3 text-center">
            <p className="font-mono text-[9px] tracking-[0.12em] opacity-80" style={{ fontStretch: "87.5%" }}>
              YOUR SCORE
            </p>
            <p className="font-dot font-black text-[64px] leading-[0.9] crt-glow">
              ??<span className="blink">_</span>
            </p>
            <p className="font-display font-extrabold uppercase text-[14px] text-yellow leading-tight">
              Kanta muna.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quote clipping */}
      <motion.div
        className="absolute left-[6%] bottom-0 w-[58%] paper px-3.5 py-3"
        style={{ rotate: -2 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="font-serif italic text-[15px] leading-snug text-ink">
          &ldquo;Pisces ka, &rsquo;no? Halata sa playlist.&rdquo;
        </p>
      </motion.div>
    </div>
  );
}

export default function LandingStep({
  onStart,
  onOpenLastReport,
  hasDraft = false,
}: LandingStepProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  // Leaderboard and history links only appear once this browser has a
  // finished report — before that they'd give the roast away.
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // Browser-only reads (localStorage + fingerprint) can't be resolved
    // during render without a hydration mismatch. Syncing after mount is the
    // intended behaviour.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScanned(hasFinishedScan());
    if (!ANALYSIS_LIMITS_ENABLED) return;
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
      {/* ── Masthead ── */}
      <motion.header variants={headerVariants} className="pt-3">
        <nav className="flex items-center justify-between gap-3 pb-2 min-h-[54px] border-b-2 border-ink">
          <span className="font-display font-extrabold uppercase tracking-[0.06em] text-[13px] text-ink">
            3AM Edition
          </span>
          {scanned && (
            <span className="flex items-center gap-1">
              {[
                { href: "/leaderboard", label: "Leaderboard", Icon: IconTrophy },
                { href: "/history", label: "History", Icon: IconHistory },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-2 font-display font-extrabold uppercase tracking-[0.04em] text-[14px] text-ink hover:text-pink-ink transition-colors"
                >
                  <Icon size={22} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              ))}
            </span>
          )}
        </nav>

        <div className="flex items-center justify-center gap-3 sm:gap-4 py-3 sm:py-4">
          <BrandMark size={56} />
          <h1 className="font-display font-black uppercase leading-[0.82] text-[64px] sm:text-[96px] tracking-[-0.01em] text-ink misprint">
            Senti<span className="text-pink">.</span>AI
          </h1>
        </div>

        <div className="flex items-center justify-between gap-3 py-1.5 border-y-[5px] border-double border-ink font-display font-extrabold uppercase tracking-[0.05em] text-[13px] sm:text-[14px] text-ink">
          <span>Vol. VI · Blg. 9</span>
          <span className="text-center">Pahayagan ng mga puso</span>
          <span>Libre</span>
        </div>
      </motion.header>

      {/* ── Front page ── */}
      <section className="flex-1 grid lg:grid-cols-[1.15fr_0.85fr] items-center gap-10 lg:gap-8 py-8 sm:py-10">
        <div className="flex flex-col items-start gap-5">
          <motion.p variants={itemVariants} className="flex flex-wrap items-center gap-2.5">
            <span className="bg-red text-paper-light font-display font-black uppercase tracking-[0.06em] text-[15px] leading-none px-2.5 py-1.5 -rotate-1">
              Exclusive
            </span>
            <span className="font-display font-extrabold uppercase tracking-[0.04em] text-[14px] text-text-secondary">
              Playlist personality report
            </span>
          </motion.p>

          <motion.h2
            variants={itemVariants}
            className="font-display font-black uppercase leading-[0.86] text-[54px] sm:text-[84px] tracking-[-0.005em] text-ink"
          >
            Ano&apos;ng sinasabi ng <span className="hl">playlist mo</span>{" "}tungkol sa&apos;yo?
          </motion.h2>

          <motion.p variants={itemVariants} className="font-serif italic text-[19px] sm:text-[21px] text-ink/85 leading-snug max-w-[40ch]">
            Add the songs you have on repeat, answer five quick things about how you love, and get a
            very Filipino read on your love life — ready for your IG story.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-1">
            <Button onClick={onStart} disabled={locked} className="text-[20px] py-4 px-7 sm:min-w-[250px] min-h-[58px]">
              {hasDraft ? "Continue my scan" : "Start my scan"}
              {!locked && <IconArrowRight size={21} />}
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-text-secondary">
            <span>≈ 2 minutes</span>
            <span aria-hidden>·</span>
            <span>Free</span>
            {remaining !== null && Number.isFinite(remaining) && (
              <>
                <span aria-hidden>·</span>
                <span className={locked ? "text-pink-ink font-semibold" : ""}>
                  {locked
                    ? "No scans left today — balik bukas"
                    : `${remaining}/${DAILY_ANALYSIS_LIMIT} scans left today`}
                </span>
              </>
            )}
            {onOpenLastReport && (
              <>
                <span aria-hidden>·</span>
                <button
                  onClick={onOpenLastReport}
                  className="font-semibold text-pink-ink underline decoration-2 underline-offset-4 hover:text-ink cursor-pointer min-h-[44px]"
                >
                  See your last report
                </button>
              </>
            )}
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <SampleClippings />
        </motion.div>
      </section>

      {/* ── How it works: komiks strip ── */}
      <motion.section variants={itemVariants} className="grid sm:grid-cols-3 gap-3 pb-8" aria-label="How it works">
        {PANELS.map(({ Icon, caption, body, says }, i) => (
          <div
            key={caption}
            className="relative flex flex-col gap-3 border-2 border-ink bg-paper-light p-3 pb-4 overflow-hidden"
            style={{ rotate: `${[-0.6, 0.4, -0.3][i]}deg` }}
          >
            <span className="self-start bg-yellow border-2 border-ink px-2 py-1 font-display font-extrabold uppercase tracking-[0.03em] text-[14px] leading-none text-ink">
              {caption}
            </span>
            <div className="relative flex items-center justify-between gap-3 min-h-[86px]">
              <span className="halftone absolute inset-0 text-pink/30" aria-hidden />
              <Icon size={68} className="relative text-ink shrink-0" />
              <SpeechBubble>{says}</SpeechBubble>
            </div>
            <p className="text-[14.5px] text-text-secondary leading-snug pt-1">{body}</p>
          </div>
        ))}
      </motion.section>

      {/* ── Footer: a friendly reminder (the warnings come later) ── */}
      <motion.footer
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-8"
      >
        <p className="border-2 border-ink px-3 py-2 text-[13px] text-ink leading-snug bg-paper-light">
          <span className="font-display font-black uppercase tracking-[0.06em]">Paalala:</span> Sagutin nang
          totoo — mas tumpak ang basa kapag totoo.
        </p>
        {scanned && (
          <Link
            href="/leaderboard"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] font-display font-extrabold uppercase tracking-[0.04em] text-[14px] text-ink hover:text-pink-ink transition-colors"
          >
            <IconTrophy size={22} /> Leaderboard
          </Link>
        )}
      </motion.footer>
    </motion.div>
  );
}
