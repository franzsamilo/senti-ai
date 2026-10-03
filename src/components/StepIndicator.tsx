"use client";

import { motion } from "framer-motion";
import { softSpring } from "@/components/ui/motion";

/** Short names for each step, shown under the bar. */
export const STEP_NAMES = ["Songs", "Type", "Attachment", "Love", "Sign", "Story"];

interface StepIndicatorProps {
  current: number;
  total?: number;
}

/**
 * Segmented progress bar. The active segment fills with the dusk gradient and
 * done segments stay lit, so the bar reads as "how far you've come" at a
 * glance — a friendlier signal than a step number on its own.
 */
export default function StepIndicator({ current, total = 6 }: StepIndicatorProps) {
  const name = STEP_NAMES[current - 1];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 text-[13px]">
        <p className="text-text-secondary">
          Step <span className="font-semibold text-text-primary tabular-nums">{current}</span> of{" "}
          {total}
          {name && <span className="text-text-muted"> · {name}</span>}
        </p>
        <p className="text-text-muted tabular-nums">{Math.round(((current - 1) / total) * 100)}% done</p>
      </div>

      <div
        className="flex items-center gap-1.5"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${current} of ${total}`}
      >
        {Array.from({ length: total }, (_, i) => {
          const index = i + 1;
          const done = index < current;
          const active = index === current;
          return (
            <div
              key={index}
              className="h-1.5 flex-1 rounded-full overflow-hidden"
              style={{ background: "rgba(74,30,82,0.08)" }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={false}
                animate={{ scaleX: done || active ? 1 : 0 }}
                transition={softSpring}
                style={{
                  originX: 0,
                  background: active ? "var(--dusk)" : "rgba(224,48,107,0.45)",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
