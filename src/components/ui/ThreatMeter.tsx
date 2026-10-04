"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "@/components/ui/StatBox";

interface ThreatMeterProps {
  label: string;
  value: number; // 0-100
  /** The model's one-line read of this meter. */
  note?: string;
  delay?: number;
}

const SEGMENTS = 20;

/** VU-meter zones, printed in the three riso inks: calm, warm, overload. */
function segmentColor(i: number) {
  if (i >= 16) return "#ff4f9a";
  if (i >= 11) return "#ffd23a";
  return "#2b4ee0";
}

/**
 * A level meter off a cassette deck: twenty segments that light up left to
 * right, blue into yellow into pink, ticking on one at a time the first time
 * it scrolls into view.
 */
export default function ThreatMeter({ label, value, note, delay = 0 }: ThreatMeterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const clamped = Math.min(100, Math.max(0, value));
  const counted = useCountUp(clamped, 0, inView, 1100);
  const lit = Math.round((clamped / 100) * SEGMENTS);

  return (
    <div ref={ref} className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline gap-3">
        <span className="font-display font-extrabold text-[19px] leading-none text-ink truncate">{label}</span>
        <span className="font-mono text-[14px] font-bold shrink-0 tabular-nums text-ink" style={{ fontStretch: "87.5%" }}>
          {counted}%
        </span>
      </div>
      <div
        className="grid gap-[3px] rounded-[6px] border-2 border-ink bg-ink p-[3px]"
        style={{ gridTemplateColumns: `repeat(${SEGMENTS}, minmax(0, 1fr))` }}
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const on = i < lit;
          return (
            <motion.span
              key={i}
              className="h-[14px] rounded-[2px]"
              initial={false}
              animate={{
                backgroundColor: inView && on ? segmentColor(i) : "rgba(255,250,242,0.12)",
              }}
              transition={{ delay: inView && on ? delay + i * 0.035 : 0, duration: 0.08 }}
            />
          );
        })}
      </div>
      {note && <p className="text-[14px] text-text-secondary leading-snug">{note}</p>}
    </div>
  );
}
