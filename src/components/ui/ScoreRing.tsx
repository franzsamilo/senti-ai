"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "@/components/ui/StatBox";

interface ScoreRingProps {
  value: number;
  max?: number;
  color: string;
  size?: number;
  label?: string;
  /** Seconds before the sweep starts — lets the headline land first. */
  delay?: number;
}

/**
 * A circular gauge that sweeps to the score while the number counts up. Drawn
 * for a dark surface (the results hero): white text, faint track.
 */
export default function ScoreRing({
  value,
  max = 10,
  color,
  size = 148,
  label = "Emotional damage",
  delay = 0.4,
}: ScoreRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const decimals = max > 10 ? 0 : 1;
  const counted = useCountUp(value, decimals, inView, 1600);
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.min(1, Math.max(0, value / max));

  return (
    <div ref={ref} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="score-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffb199" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#score-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: inView ? circumference * (1 - fraction) : circumference }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay }}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-[40px] font-extrabold leading-none text-white tabular-nums">
          {counted.toFixed(decimals)}
        </span>
        <span className="text-[12px] text-white/60 mt-1">/ {max}</span>
        <span className="sr-only">
          {label}: {value} out of {max}
        </span>
      </div>
    </div>
  );
}
