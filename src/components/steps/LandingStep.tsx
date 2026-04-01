"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlitchText from "@/components/GlitchText";
import Button from "@/components/ui/Button";
import { generateFingerprint, getRemainingAnalyses } from "@/lib/fingerprint";
import { initiateSpotifyAuth } from "@/lib/spotify";

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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-6 sm:gap-8">
      {/* CLASSIFIED badge */}
      <div className="inline-flex items-center gap-2 border border-accent/60 rounded-full px-4 py-1.5 text-xs font-mono text-accent tracking-widest uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        CLASSIFIED
      </div>

      {/* Main title */}
      <GlitchText
        text="SENTI.AI"
        className="text-5xl sm:text-8xl font-bold text-text-primary"
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
      <div className="flex flex-col items-center gap-3 w-full max-w-xs px-0">
        <Button
          onClick={onStart}
          disabled={remaining === 0}
          className="w-full text-base py-4"
        >
          Start Emotional Assessment
        </Button>
        <button
          onClick={() => initiateSpotifyAuth()}
          disabled={remaining === 0}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-mono"
        >
          or connect Spotify for auto-import
        </button>
        <p className="text-xs text-text-muted font-mono opacity-50">
          Limited to invited testers only
        </p>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-4">
        <Link
          href="/leaderboard"
          className="text-xs font-mono text-text-muted hover:text-accent transition-colors duration-200 border border-border-subtle hover:border-accent/40 rounded-lg px-4 py-2 min-h-[36px] inline-flex items-center"
        >
          View the Leaderboard
        </Link>
        <Link
          href="/barkada"
          className="text-xs font-mono text-text-muted hover:text-accent transition-colors duration-200 border border-border-subtle hover:border-accent/40 rounded-lg px-4 py-2 min-h-[36px] inline-flex items-center"
        >
          Join a Barkada
        </Link>
      </div>

      {/* Warning */}
      <p className="text-xs text-text-muted max-w-sm font-mono">
        Warning: This system is brutally honest. Proceed at your own emotional risk.
      </p>
    </div>
  );
}
