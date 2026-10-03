"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "@/components/ui/StatBox";

interface ThreatMeterProps {
  label: string;
  value: number; // 0-100
  color?: string;
  /** The model's one-line read of this meter. */
  note?: string;
  delay?: number;
}

export default function ThreatMeter({
  label,
  value,
  color = "#e0306b",
  note,
  delay = 0,
}: ThreatMeterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const clamped = Math.min(100, Math.max(0, value));
  const counted = useCountUp(clamped, 0, inView, 1100);

  return (
    <div ref={ref} className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline gap-3">
        <span className="text-[14px] font-medium text-text-primary truncate">{label}</span>
        <span className="font-display text-[15px] font-bold shrink-0 tabular-nums" style={{ color }}>
          {counted}%
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(74,30,82,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView ? clamped / 100 : 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20, delay }}
          style={{
            originX: 0,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 12px ${color}55`,
          }}
        />
      </div>
      {note && <p className="text-[13px] text-text-secondary leading-snug">{note}</p>}
    </div>
  );
}
