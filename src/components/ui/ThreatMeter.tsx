"use client";

import { useEffect, useState } from "react";

interface ThreatMeterProps {
  label: string;
  value: number; // 0-100
  color?: string;
}

export default function ThreatMeter({
  label,
  value,
  color = "#ff3252",
}: ThreatMeterProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Defer to next paint so the CSS transition fires
    const id = requestAnimationFrame(() => {
      setWidth(Math.min(100, Math.max(0, value)));
    });
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] sm:text-xs font-mono text-text-secondary truncate">{label}</span>
        <span className="text-[11px] sm:text-xs font-mono shrink-0 ml-2" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
            transition: "width 1000ms ease-out",
          }}
        />
      </div>
    </div>
  );
}
