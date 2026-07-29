"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Song, AttachmentStyle, LoveLanguage, ProfileResult } from "@/lib/types";
import {
  generateFingerprint,
  hasAnalysesRemaining,
  recordAnalysis,
} from "@/lib/fingerprint";
import { generateFallback } from "@/lib/fallbackResults";
import { looksLikeSelfClaim, mentionsCreator } from "@/lib/easterEggs";

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

// Deliberate escalation: the first lines read as instrumentation, and the
// register only turns on the user once every input is already committed.
const MESSAGES = [
  "Initializing assessment protocol v6.9...",
  "Indexing listening history...",
  "Cross-referencing attachment model with personality index...",
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

// Cycled while the API is still thinking — the analysis now runs a deeper model,
// so the screen must never look frozen. Per the brief: loop the final messages.
const STALL_MESSAGES = [
  "Re-reading your playlist. The AI needs a moment.",
  "Cross-checking your red flags against the national average... you're above it.",
  "Verifying na hindi ka lang overreacting. (You are, but with evidence.)",
  "Compiling receipts. There are a lot of receipts.",
  "Re-running one prediction to be sure. It held up.",
  "Running the numbers again para sure. Still bad.",
  "Consulting your last 3 situationships for peer review...",
  "Almost done. Breathe. You'll survive this (allegedly).",
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
  const [stallCount, setStallCount] = useState(0);
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

  // Once the scripted list runs out and the API is still working, keep the
  // stall messages coming so the screen never looks stuck.
  useEffect(() => {
    if (apiDone) return;
    if (visibleCount < MESSAGES.length) return;
    const id = setTimeout(() => setStallCount((prev) => prev + 1), 1800);
    return () => clearTimeout(id);
  }, [visibleCount, stallCount, apiDone]);

  // Append a few stall lines, then keep rotating the last one in place so a
  // slow response can't grow the list past the fold.
  const MAX_APPENDED_STALLS = 6;
  const appended = Math.min(stallCount, MAX_APPENDED_STALLS);
  const stalls = Array.from(
    { length: appended },
    (_, i) => STALL_MESSAGES[i % STALL_MESSAGES.length]
  );
  if (stallCount > MAX_APPENDED_STALLS) {
    stalls[appended - 1] =
      STALL_MESSAGES[(stallCount - 1) % STALL_MESSAGES.length];
  }

  const shownMessages = [...MESSAGES.slice(0, visibleCount), ...stalls];

  // Completed checkmarks follow visible with shorter delay
  useEffect(() => {
    if (completedCount >= shownMessages.length - 1) return;
    const id = setTimeout(() => {
      setCompletedCount((prev) => Math.min(prev + 1, shownMessages.length - 1));
    }, 400);
    return () => clearTimeout(id);
  }, [shownMessages.length, completedCount]);

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
      if (!hasAnalysesRemaining(fp)) {
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

        if (!res.ok) {
          // Surface WHY. A silent fallback means a broken model config looks
          // exactly like a working one — every user quietly gets the same
          // templated report and nobody finds out.
          const detail = await res.json().catch(() => ({}));
          console.error(
            `[analysis] API failed (${res.status})`,
            detail?.reason ?? "",
            detail?.message ?? ""
          );
          throw new Error(detail?.reason ?? `http_${res.status}`);
        }

        const data = await res.json();
        recordAnalysis(fp);
        resultRef.current = data.result as ProfileResult;
      } catch (err) {
        if (cancelled) return;
        console.error("[analysis] falling back to offline report:", err);
        resultRef.current = {
          ...generateFallback(songs, mbti, attachmentStyle, loveLanguage, zodiac),
          degraded: true,
          // The offline report can't write the Easter egg, but it can still
          // acknowledge that it fired — otherwise the badge appears or
          // vanishes depending on whether the API happened to be up.
          ...(personalContext && mentionsCreator(personalContext)
            ? {
                creator_egg: looksLikeSelfClaim(personalContext)
                  ? ("self" as const)
                  : ("mention" as const),
              }
            : {}),
        };
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
        {shownMessages.map((msg, i) => {
          const isDone = i < completedCount;
          const isActive = i === completedCount;

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
