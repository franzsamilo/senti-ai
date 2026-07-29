"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import GlitchText from "@/components/GlitchText";
import Button from "@/components/ui/Button";
import { IconArrowRight, IconSpotify, IconTarget } from "@/components/ui/icons";
import { headerVariants, itemVariants, listVariants, spring } from "@/components/ui/motion";
import { generateFingerprint, getRemainingAnalyses } from "@/lib/fingerprint";
import { initiateSpotifyAuth } from "@/lib/spotify";

interface LandingStepProps {
  onStart: () => void;
}

const DAILY_SCANS = 2;

/** Reads as system capability, not as a promise about tone. */
const CAPABILITIES = [
  "Listening history",
  "Attachment model",
  "Personality index",
  "Written context",
];

export default function LandingStep({ onStart }: LandingStepProps) {
  const [remaining, setRemaining] = useState<number>(2);

  useEffect(() => {
    // Browser-only read: the count comes from a canvas fingerprint plus
    // localStorage, so it cannot be resolved during render without a
    // hydration mismatch. Syncing after mount is the intended behaviour here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(getRemainingAnalyses(generateFingerprint()));
  }, []);

  const locked = remaining === 0;
  // Localhost bypasses the limit and returns a sentinel — don't render "999 of 2".
  const shownRemaining = Math.min(remaining, DAILY_SCANS);

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center min-h-screen px-5 text-center gap-6 sm:gap-7 py-16"
    >
      {/* Status badge */}
      <motion.div
        variants={headerVariants}
        className="inline-flex items-center gap-2.5 border border-accent/40 rounded-full px-4 py-1.5 text-[11px] font-mono text-accent tracking-[0.2em] uppercase"
        style={{ background: "rgba(255,50,82,0.05)" }}
      >
        <motion.span
          className="inline-block w-1.5 h-1.5 rounded-full bg-accent"
          animate={{ opacity: [1, 0.25, 1], scale: [1, 0.85, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        System online
      </motion.div>

      {/* Wordmark */}
      <motion.div variants={headerVariants} className="flex flex-col items-center gap-3">
        <GlitchText
          text="SENTI.AI"
          className="text-[54px] leading-none sm:text-8xl font-bold text-text-primary tracking-tight"
          as="h1"
        />
        <p className="font-mono text-[11px] sm:text-xs text-text-secondary tracking-[0.25em] uppercase">
          Emotional Damage Assessment System
        </p>
      </motion.div>

      {/* What it reads — sets up the method without previewing the verdict */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 max-w-[380px]"
      >
        {CAPABILITIES.map((item) => (
          <span
            key={item}
            className="font-mono text-[10px] tracking-wide uppercase text-text-muted border border-border-subtle rounded-full px-3 py-1.5"
          >
            {item}
          </span>
        ))}
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-sm text-text-secondary leading-relaxed max-w-[36ch]"
      >
        Six questions. One profile. The system builds a full psychological
        readout from what you listen to and how you love.
      </motion.p>

      {/* Actions */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center gap-3 w-full max-w-xs"
      >
        <Button
          onClick={onStart}
          disabled={locked}
          className="w-full text-base py-4 gap-2"
        >
          Begin assessment
          {!locked && <IconArrowRight size={19} />}
        </Button>

        <motion.button
          onClick={() => initiateSpotifyAuth()}
          disabled={locked}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          className="w-full inline-flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-mono border border-border-subtle hover:border-accent/40 rounded-lg py-3 cursor-pointer"
        >
          <IconSpotify size={17} />
          Import from Spotify
        </motion.button>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted pt-1">
          <IconTarget size={13} className={locked ? "text-accent" : "text-accent-success"} />
          {locked ? (
            <span className="text-accent">Assessment limit reached</span>
          ) : (
            <span>
              <span className="text-accent-success">{shownRemaining}</span> of{" "}
              {DAILY_SCANS} scans remaining today
            </span>
          )}
        </div>
      </motion.div>

      {/* Secondary nav */}
      <motion.div variants={itemVariants} className="flex items-center gap-2.5">
        {[
          { href: "/leaderboard", label: "Leaderboard" },
          { href: "/barkada", label: "Group scan" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-mono text-text-muted hover:text-accent transition-colors duration-200 border border-border-subtle hover:border-accent/40 rounded-lg px-4 py-2.5 min-h-[40px] inline-flex items-center"
          >
            {link.label}
          </Link>
        ))}
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-[11px] text-text-muted/70 max-w-[34ch] font-mono leading-relaxed"
      >
        The system does not flatter. Findings are final.
      </motion.p>
    </motion.div>
  );
}
