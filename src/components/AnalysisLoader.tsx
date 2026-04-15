"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Song, AttachmentStyle, LoveLanguage, ProfileResult } from "@/lib/types";
import {
  generateFingerprint,
  getRemainingAnalyses,
  recordAnalysis,
} from "@/lib/fingerprint";
import { generateFallback } from "@/lib/fallbackResults";

interface AnalysisLoaderProps {
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage[];
  zodiac: string;
  personalContext?: string;
  onResult?: (result: ProfileResult) => void;
  onComplete?: (result: ProfileResult) => void;
  onBlocked: () => void;
}

const MESSAGES = [
  "Initializing Emotional Damage Protocol v6.9...",
  "Scanning your playlist for emotional damage...",
  "Cross-referencing attachment issues with zodiac toxicity index...",
  "Checking kung ilang beses mo na ni-replay yung last song...",
  "Computing probability of 'kumusta ka na?' text at 3AM...",
  "Analyzing hugot concentration per song... WARNING: lethal levels detected",
  "Calibrating delulu-to-reality ratio...",
  "Fetching data from your barkada GC... (charot)",
  "Mapping your red flags to a geographic heat map...",
  "Generating emotional damage report...",
  "Consulting the stars... they said 'yikes'",
  "Final scan complete. You're not okay, bestie.",
];

// Show messages faster at first (800ms), slow down mid-way (1200ms)
// When API is done, rush remaining messages at 400ms each
const NORMAL_SPEED = 900;
const RUSH_SPEED = 350;
const MIN_MESSAGES_BEFORE_EXIT = 6; // show at least 6 messages for dramatic effect

export default function AnalysisLoader({
  songs,
  mbti,
  attachmentStyle,
  loveLanguage,
  zodiac,
  personalContext,
  onResult,
  onComplete,
  onBlocked,
}: AnalysisLoaderProps) {
  const handleResultRef = useRef<(r: ProfileResult) => void>(onResult ?? onComplete ?? (() => {}));
  useEffect(() => {
    handleResultRef.current = onResult ?? onComplete ?? (() => {});
  });

  const [visibleCount, setVisibleCount] = useState(1);
  const [completedCount, setCompletedCount] = useState(0);
  const [apiDone, setApiDone] = useState(false);

  const resultRef = useRef<ProfileResult | null>(null);
  const firedRef = useRef(false);

  // Advance messages — speed up when API is done
  useEffect(() => {
    if (visibleCount >= MESSAGES.length) return;

    const speed = apiDone && visibleCount >= MIN_MESSAGES_BEFORE_EXIT
      ? RUSH_SPEED
      : NORMAL_SPEED;

    const id = setTimeout(() => {
      setVisibleCount((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(id);
  }, [visibleCount, apiDone]);

  // Completed checkmarks follow visible with shorter delay
  useEffect(() => {
    if (completedCount >= visibleCount - 1) return;
    const id = setTimeout(() => {
      setCompletedCount((prev) => Math.min(prev + 1, visibleCount - 1));
    }, 400);
    return () => clearTimeout(id);
  }, [visibleCount, completedCount]);

  // Fire result when ready
  const tryFire = useCallback(() => {
    if (firedRef.current) return;
    if (!resultRef.current) return;
    // Need either all messages shown, or API done + minimum messages shown
    const allShown = visibleCount >= MESSAGES.length;
    const enoughShown = apiDone && visibleCount >= MIN_MESSAGES_BEFORE_EXIT;
    if (!allShown && !enoughShown) return;

    firedRef.current = true;
    const result = resultRef.current;
    setTimeout(() => handleResultRef.current(result), 600);
  }, [visibleCount, apiDone]);

  useEffect(() => {
    tryFire();
  }, [tryFire]);

  // API call on mount
  useEffect(() => {
    let cancelled = false;

    async function runAnalysis() {
      const fp = generateFingerprint();
      if (getRemainingAnalyses(fp) <= 0) {
        if (!cancelled) onBlocked();
        return;
      }

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            songs,
            mbti,
            attachmentStyle,
            loveLanguage,
            zodiac,
            fingerprint: fp,
            ...(personalContext ? { personalContext } : {}),
          }),
        });

        if (cancelled) return;
        if (res.status === 429) { onBlocked(); return; }
        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        recordAnalysis(fp);
        resultRef.current = data.result as ProfileResult;
      } catch {
        if (cancelled) return;
        resultRef.current = generateFallback(songs, mbti, attachmentStyle, loveLanguage, zodiac);
      }

      if (!cancelled) setApiDone(true);
    }

    runAnalysis();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6 py-8 w-full max-w-xl mx-auto gap-6 sm:gap-8">
      {/* Spinner */}
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-transparent animate-spin shrink-0"
        style={{
          borderTopColor: "#ff3252",
          borderRightColor: "rgba(255,50,82,0.4)",
        }}
      />

      {/* Loading messages */}
      <div className="flex flex-col gap-2 w-full overflow-hidden">
        {MESSAGES.slice(0, visibleCount).map((msg, i) => {
          const isDone = i < completedCount;
          const isActive = i === completedCount && i < visibleCount;

          return (
            <div
              key={i}
              className={`font-mono text-xs sm:text-sm flex items-start gap-2 transition-opacity duration-300 ${
                isDone
                  ? "text-accent-success opacity-100"
                  : isActive
                  ? "text-accent opacity-100 animate-pulse"
                  : "text-text-muted opacity-80"
              }`}
            >
              <span className="shrink-0 w-4">
                {isDone ? "\u2713" : isActive ? "\u25B6" : "\u00B7"}
              </span>
              <span className="break-words min-w-0">{msg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
