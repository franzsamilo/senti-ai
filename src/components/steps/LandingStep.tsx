"use client";

import { useEffect, useState } from "react";
import GlitchText from "@/components/GlitchText";
import Button from "@/components/ui/Button";
import { generateFingerprint, getRemainingAnalyses } from "@/lib/fingerprint";

interface LandingStepProps {
  onStart: () => void;
}

export default function LandingStep({ onStart }: LandingStepProps) {
  const [remaining, setRemaining] = useState<number>(2);

  useEffect(() => {
    const fp = generateFingerprint();
    setRemaining(getRemainingAnalyses(fp));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-8">
      {/* CLASSIFIED badge */}
      <div className="inline-flex items-center gap-2 border border-accent/60 rounded-full px-4 py-1.5 text-xs font-mono text-accent tracking-widest uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        CLASSIFIED
      </div>

      {/* Main title */}
      <GlitchText
        text="SENTI.AI"
        className="text-6xl sm:text-8xl font-bold text-text-primary"
        as="h1"
      />

      {/* Tagline */}
      <p className="font-mono text-sm text-text-secondary tracking-wider">
        Emotional Damage Assessment System v6.9
      </p>

      {/* Remaining scans counter */}
      <div className="font-mono text-xs text-text-muted border border-border-subtle rounded px-3 py-1.5">
        {remaining > 0 ? (
          <span>
            <span className="text-accent-success">{remaining}/2</span> free scans remaining
          </span>
        ) : (
          <span className="text-accent">0/2 scans remaining — limit reached</span>
        )}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <Button
          onClick={onStart}
          disabled={remaining === 0}
          className="w-full text-base py-4"
        >
          Start Emotional Scan
        </Button>
      </div>

      {/* Warning */}
      <p className="text-xs text-text-muted max-w-sm font-mono">
        Warning: This system is brutally honest. Proceed at your own emotional risk.
      </p>
    </div>
  );
}
