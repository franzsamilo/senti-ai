"use client";

import { useEffect, useRef, useState } from "react";
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
  loveLanguage: LoveLanguage;
  zodiac: string;
  /** Called with the finished ProfileResult — also aliased as onComplete for compatibility */
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

export default function AnalysisLoader({
  songs,
  mbti,
  attachmentStyle,
  loveLanguage,
  zodiac,
  onResult,
  onComplete,
  onBlocked,
}: AnalysisLoaderProps) {
  // Support both onResult and onComplete prop names; keep stable via ref
  const handleResultRef = useRef<(r: ProfileResult) => void>(onResult ?? onComplete ?? (() => {}));
  useEffect(() => {
    handleResultRef.current = onResult ?? onComplete ?? (() => {});
  });
  const handleResult = (r: ProfileResult) => handleResultRef.current(r);

  const [visibleCount, setVisibleCount] = useState(1);
  const [completedCount, setCompletedCount] = useState(0);

  const apiDoneRef = useRef(false);
  const resultRef = useRef<ProfileResult | null>(null);
  const firedRef = useRef(false);

  // Advance visible messages every 1800ms
  useEffect(() => {
    const id = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= MESSAGES.length) {
          clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Completed count follows visible with ~800ms delay
  useEffect(() => {
    if (completedCount >= visibleCount - 1) return;
    const id = setTimeout(() => {
      setCompletedCount((prev) => Math.min(prev + 1, visibleCount - 1));
    }, 800);
    return () => clearTimeout(id);
  }, [visibleCount, completedCount]);

  // Fire onResult when both animation and API are done
  useEffect(() => {
    if (firedRef.current) return;
    if (visibleCount >= MESSAGES.length && apiDoneRef.current && resultRef.current) {
      firedRef.current = true;
      const result = resultRef.current;
      const timer = setTimeout(() => handleResult(result), 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount]);

  // API call on mount
  useEffect(() => {
    let cancelled = false;

    async function runAnalysis() {
      // Client-side rate limit pre-check
      const fp = generateFingerprint();
      const remaining = getRemainingAnalyses(fp);
      if (remaining <= 0) {
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
          }),
        });

        if (cancelled) return;

        if (res.status === 429) {
          onBlocked();
          return;
        }

        if (!res.ok) throw new Error("API error");

        const data: ProfileResult = await res.json();
        recordAnalysis(fp);
        resultRef.current = data;
      } catch {
        if (cancelled) return;
        // Fallback: always give a result
        resultRef.current = generateFallback(
          songs,
          mbti,
          attachmentStyle,
          loveLanguage,
          zodiac
        );
      }

      apiDoneRef.current = true;

      // If animation already finished, fire immediately after 1s
      if (!firedRef.current && visibleCount >= MESSAGES.length && resultRef.current) {
        firedRef.current = true;
        setTimeout(() => {
          if (resultRef.current) handleResult(resultRef.current);
        }, 1000);
      }
    }

    runAnalysis();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full max-w-xl mx-auto gap-8">
      {/* Spinner */}
      <div
        className="w-16 h-16 rounded-full border-2 border-transparent animate-spin"
        style={{
          borderTopColor: "#ff3252",
          borderRightColor: "rgba(255,50,82,0.4)",
        }}
      />

      {/* Loading messages */}
      <div className="flex flex-col gap-2 w-full">
        {MESSAGES.slice(0, visibleCount).map((msg, i) => {
          const isDone = i < completedCount;
          const isActive = i === completedCount && i < visibleCount;

          return (
            <div
              key={i}
              className={`font-mono text-sm flex items-start gap-2 transition-opacity duration-300 ${
                isDone
                  ? "text-accent-success opacity-100"
                  : isActive
                  ? "text-accent opacity-100 animate-pulse"
                  : "text-text-muted opacity-80"
              }`}
            >
              <span className="shrink-0 w-4">
                {isDone ? "✓" : isActive ? "▶" : "·"}
              </span>
              <span>{msg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
