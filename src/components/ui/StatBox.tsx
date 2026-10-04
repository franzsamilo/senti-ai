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
  /** Text colour for the number. Defaults to ink. */
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

/** A single figure on card stock: big signage numerals, small label under. */
export default function StatBox({
  label,
  value,
  suffix = "",
  animate = false,
  decimals = 0,
  color = "var(--ink)",
}: StatBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const isNumeric = typeof value === "number";
  const counted = useCountUp(isNumeric ? value : 0, decimals, animate && isNumeric && inView);
  const display = isNumeric && animate ? counted.toFixed(decimals) : value;

  return (
    <div ref={ref} className="paper p-3 sm:p-4 text-center flex-1 min-w-0">
      <p className="font-display text-[30px] sm:text-[36px] font-black leading-none tabular-nums" style={{ color }}>
        {display}
        <span className="text-[14px] sm:text-[16px] font-extrabold text-text-muted">{suffix}</span>
      </p>
      <p className="text-[12px] sm:text-[13px] text-text-secondary mt-1.5 leading-tight">{label}</p>
    </div>
  );
}
