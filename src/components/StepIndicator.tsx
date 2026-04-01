"use client";

interface StepIndicatorProps {
  current: number;
  total?: number;
}

function zeroPad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function StepIndicator({ current, total = 5 }: StepIndicatorProps) {
  return (
    <p className="font-mono text-xs text-text-muted tracking-widest uppercase">
      STEP {zeroPad(current)} / {zeroPad(total)}
    </p>
  );
}
