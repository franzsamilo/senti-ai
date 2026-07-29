"use client";

import { motion } from "framer-motion";
import { softSpring } from "@/components/ui/motion";

interface StepIndicatorProps {
  current: number;
  total?: number;
  /** Optional label replacing the generic "STEP" word, e.g. "INTAKE". */
  kicker?: string;
}

function zeroPad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Segmented progress readout. Each completed segment fills with a spring so
 * advancing a step reads as instrument feedback, not a page swap.
 */
export default function StepIndicator({
  current,
  total = 6,
  kicker = "STEP",
}: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] text-text-muted tracking-[0.2em] uppercase">
          {kicker}{" "}
          <span className="text-accent">{zeroPad(current)}</span>
          <span className="text-text-muted"> / {zeroPad(total)}</span>
        </p>
        <p className="font-mono text-[11px] text-text-muted tracking-[0.2em] uppercase">
          {Math.round((current / total) * 100)}%
        </p>
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
              className="h-[3px] flex-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={false}
                animate={{ scaleX: done || active ? 1 : 0 }}
                transition={softSpring}
                style={{
                  originX: 0,
                  background: active
                    ? "linear-gradient(90deg, #ff3252, #ff0844)"
                    : "rgba(255,50,82,0.4)",
                  boxShadow: active ? "0 0 10px rgba(255,50,82,0.5)" : "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
