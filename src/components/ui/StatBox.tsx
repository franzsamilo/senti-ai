"use client";

import { useEffect, useRef, useState } from "react";

interface StatBoxProps {
  label: string;
  value: string | number;
  suffix?: string;
  animate?: boolean;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function StatBox({ label, value, suffix = "", animate = false }: StatBoxProps) {
  const isNumeric = typeof value === "number";
  const [displayed, setDisplayed] = useState<number>(isNumeric && animate ? 0 : (isNumeric ? value : 0));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isNumeric || !animate) return;

    const target = value as number;
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplayed(parseFloat((eased * target).toFixed(1)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, animate, isNumeric]);

  const displayValue = isNumeric && animate
    ? displayed
    : value;

  return (
    <div className="bg-bg-card border border-border-subtle rounded-lg p-3 sm:p-4 text-center min-w-[120px] sm:min-w-[140px] shrink-0">
      <p className="text-xl sm:text-2xl font-bold text-accent font-mono">
        {displayValue}{suffix}
      </p>
      <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-mono mt-1">
        {label}
      </p>
    </div>
  );
}
