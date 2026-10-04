"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "@/components/ui/StatBox";

/**
 * What the machine says after you sing — the praise every Filipino has
 * heard at a birthday videoke, aimed at the wrong achievement.
 */
export function videokePraise(score100: number): string {
  if (score100 >= 90) return "Perfect! (sa pagka-sawi)";
  if (score100 >= 80) return "Pang-champion na sawi!";
  if (score100 >= 70) return "Galing! Pero sa maling bagay.";
  if (score100 >= 55) return "Pwede na. Encore? 'Wag na.";
  if (score100 >= 35) return "Sakto lang. Sus.";
  return "Halos wala. Sinungaling.";
}

interface VideokeScoreProps {
  /** Emotional damage, 0–10. Shown ×10, the way the machine scores. */
  value: number;
  /** Seconds before the count starts — lets the headline land first. */
  delay?: number;
  compact?: boolean;
}

/**
 * The emotional damage score as a videoke score screen: an ink bezel, a
 * blue CRT with scanlines, dot-matrix digits that roll up to the score, and
 * the machine's verdict underneath.
 */
export default function VideokeScore({ value, delay = 0.5, compact = false }: VideokeScoreProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const score100 = Math.round(Math.min(10, Math.max(0, value)) * 10);
  const counted = useCountUp(score100, 0, inView, 1700);

  return (
    <div ref={ref} className="rounded-[16px] border-2 border-ink bg-ink p-2 sm:p-2.5 shadow-[var(--shadow-hard)]">
      <div className={`crt rounded-[10px] text-center ${compact ? "px-3 py-3" : "px-4 py-4 sm:py-5"}`}>
        <p className="font-mono text-[10px] tracking-[0.16em] text-white/75" style={{ fontStretch: "87.5%" }}>
          YOUR SCORE
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ delay }}
          className={`font-dot font-black leading-[0.86] crt-glow tabular-nums ${compact ? "text-[72px]" : "text-[104px] sm:text-[120px]"}`}
          aria-hidden="true"
        >
          {counted}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: [0.8, 1.12, 1] } : {}}
          transition={{ delay: delay + 1.6, duration: 0.45 }}
          className="font-display font-black uppercase text-yellow leading-[1.02] text-[19px] sm:text-[22px] mt-1"
        >
          {videokePraise(score100)}
        </motion.p>
        <p className="font-mono text-[11px] text-white/70 mt-2" style={{ fontStretch: "87.5%" }}>
          Emotional damage {value.toFixed(1)} / 10
        </p>
        <span className="sr-only">Emotional damage: {value.toFixed(1)} out of 10</span>
      </div>
      {/* speaker grille */}
      <div className="flex justify-center gap-1.5 pt-2 pb-0.5" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-paper-light/25" />
        ))}
      </div>
    </div>
  );
}
