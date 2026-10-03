"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GlitchText from "@/components/GlitchText";
import { popSpring } from "@/components/ui/motion";

/** The "'D ako bobo" screen — built to be screenshotted. */
export default function RateLimitBlock() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center gap-6">
      <motion.span
        initial={{ scale: 2.2, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: -6, opacity: 1 }}
        transition={popSpring}
        className="text-[13px] font-extrabold tracking-[0.2em] uppercase rounded-lg px-3 py-1.5 border-2"
        style={{ color: "#be123c", borderColor: "#e11d48", background: "#ffe4ea" }}
      >
        Access denied
      </motion.span>

      <GlitchText
        text="Hanggang dito na lang."
        as="h1"
        className="text-[34px] sm:text-5xl font-extrabold text-text-primary"
      />

      <div className="glass rounded-3xl p-6 max-w-sm flex flex-col gap-2 text-left">
        <p className="font-display text-[19px] font-semibold text-text-primary leading-snug">
          &ldquo;The creator of Senti.AI believed in second chances...
        </p>
        <p className="font-display text-[19px] font-semibold text-text-primary leading-snug">
          ...not a third though. &apos;D ako bobo.&rdquo;
        </p>
        <p className="text-text-muted text-[14px] mt-1">— Management</p>
      </div>

      <div className="flex flex-col gap-1 text-[13px] text-text-muted">
        <p>[Your emotional damage has been noted.]</p>
        <p>[Come back tomorrow or use a different browser idc]</p>
      </div>

      <Link href="/history" className="text-[14px] font-medium text-accent-ink hover:underline">
        Revisit your past reports →
      </Link>
    </div>
  );
}
