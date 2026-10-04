"use client";

import { motion } from "framer-motion";
import { popSpring } from "@/components/ui/motion";

/** Stops on the route, painted on the board. */
export const STEP_NAMES = ["Kanta", "Type", "Attachment", "Love", "Sign", "Kwento"];

interface StepIndicatorProps {
  current: number;
  total?: number;
}

/**
 * Progress as a jeepney route signboard: a yellow board with a hand-painted
 * inner frame, every stop on the route spelled out, and the current stop
 * painted in reverse. Passed stops stay in full ink, stops ahead are faded —
 * you can read the whole trip at a glance, the way you'd read a board
 * through a windshield.
 */
export default function StepIndicator({ current, total = 6 }: StepIndicatorProps) {
  const stops = STEP_NAMES.slice(0, total);
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current} of ${total}: ${stops[current - 1] ?? ""}`}
      className="relative rounded-[10px] border-2 border-ink bg-yellow px-1.5 sm:px-2.5 py-1.5"
      style={{ boxShadow: "inset 0 0 0 3px var(--yellow), inset 0 0 0 4.5px rgba(29,25,50,0.5), 0 3px 0 var(--ink)" }}
    >
      <ol className="flex items-center justify-between sm:justify-center">
        {stops.map((name, i) => {
          const index = i + 1;
          const active = index === current;
          const passed = index < current;
          return (
            <li key={name} className="flex items-center min-w-0">
              {i > 0 && (
                <span aria-hidden className="px-[3px] sm:px-1.5 font-display font-black text-[12px] text-ink/40">
                  ›
                </span>
              )}
              <span className="relative px-1.5 sm:px-2 py-1">
                {active && (
                  <motion.span
                    aria-hidden
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={popSpring}
                    className="absolute inset-0 rounded-[5px] bg-ink"
                  />
                )}
                <span
                  className="relative font-display font-extrabold uppercase tracking-[0.03em] text-[13px] sm:text-[15px] leading-none whitespace-nowrap"
                  style={{
                    color: active ? "var(--yellow)" : "var(--ink)",
                    opacity: active || passed ? 1 : 0.42,
                  }}
                >
                  {name}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
