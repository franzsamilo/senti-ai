"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface StatBoxProps {
  label: string;
  value: string | number;
  suffix?: string;
  animate?: boolean;
  /** Decimal places for animated numbers. */
  decimals?: number;
  /** Text colour for the number. Defaults to the accent ink. */
  color?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Counts up from 0 the first time it scrolls into view. */
export function useCountUp(target: number, decimals: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!start) return;
    const begin = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - begin) / duration, 1);
      const factor = 10 ** decimals;
      setValue(Math.round(easeOutCubic(progress) * target * factor) / factor);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, decimals, start, duration]);

  return value;
}

export default function StatBox({
  label,
  value,
  suffix = "",
  animate = false,
  decimals = 0,
  color = "var(--color-accent-ink)",
}: StatBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const isNumeric = typeof value === "number";
  const counted = useCountUp(isNumeric ? value : 0, decimals, animate && isNumeric && inView);
  const display = isNumeric && animate ? counted.toFixed(decimals) : value;

  return (
    <div ref={ref} className="glass rounded-2xl p-3 sm:p-4 text-center flex-1 min-w-0">
      <p className="font-display text-[22px] sm:text-[28px] font-bold leading-none tabular-nums" style={{ color }}>
        {display}
        <span className="text-[13px] sm:text-[15px] font-semibold text-text-muted">{suffix}</span>
      </p>
      <p className="text-[11px] sm:text-xs text-text-secondary mt-1.5 leading-tight">{label}</p>
    </div>
  );
}
