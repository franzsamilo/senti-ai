"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Song, AttachmentStyle, LoveLanguage, ProfileResult } from "@/lib/types";
import {
  generateFingerprint,
  hasAnalysesRemaining,
  recordAnalysis,
} from "@/lib/fingerprint";
import { generateFallback } from "@/lib/fallbackResults";
import { IconCheck } from "@/components/ui/icons";

interface AnalysisLoaderProps {
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage[];
  zodiac: string;
  personalContext?: string;
  onComplete: (result: ProfileResult) => void;
  onBlocked: () => void;
}

// Deliberate escalation: the first lines read as instrumentation, and the
// register only turns on the user once every input is already committed.
const MESSAGES = [
  "Initializing Emotional Damage Protocol v6.9…",
  "Scanning your playlist for emotional damage…",
  "Cross-referencing attachment issues with zodiac toxicity index…",
  "Checking kung ilang beses mo na ni-replay yung last song…",
  "Computing probability of a 3AM ‘kumusta ka na?’ text…",
  "Analyzing hugot concentration per song… WARNING: lethal levels",
  "Calibrating delulu-to-reality ratio…",
  "Fetching data from your barkada GC… (charot)",
  "Mapping your red flags to a geographic heat map…",
  "Generating emotional damage report…",
  "Consulting the stars… they said ‘yikes’",
  "Final scan complete. You're not okay, bestie.",
];

// Cycled while the model is still thinking — the screen must never look
// frozen. Per the brief: loop the final messages.
const STALL_MESSAGES = [
  "Re-reading your playlist. The AI needs a moment.",
  "Cross-checking your red flags against the national average… you're above it.",
  "Verifying na hindi ka lang overreacting. (You are, but with evidence.)",
  "Compiling receipts. There are a lot of receipts.",
  "Re-running one prediction to be sure. It held up.",
  "Consulting your last 3 situationships for peer review…",
  "Almost done. Breathe. You'll survive this (allegedly).",
];

const NORMAL_SPEED = 1100;
const RUSH_SPEED = 380;
const MIN_MESSAGES_BEFORE_EXIT = 6; // the drama is non-negotiable
const STALL_SPEED = 2400;

export default function AnalysisLoader({
  songs,
  mbti,
  attachmentStyle,
  loveLanguage,
  zodiac,
  personalContext,
  onComplete,
  onBlocked,
}: AnalysisLoaderProps) {
  const handleResultRef = useRef(onComplete);
  useEffect(() => {
    handleResultRef.current = onComplete;
  });

  const [visibleCount, setVisibleCount] = useState(1);
  const [stallCount, setStallCount] = useState(0);
  const [apiDone, setApiDone] = useState(false);
  const [finished, setFinished] = useState(false);

  const resultRef = useRef<ProfileResult | null>(null);
  const firedRef = useRef(false);

  const heaviest = useMemo(
    () => (songs.length ? songs.reduce((a, b) => (b.painIndex > a.painIndex ? b : a)) : null),
    [songs]
  );

  // Advance messages — speed up once the result is in
  useEffect(() => {
    if (visibleCount >= MESSAGES.length) return;
    const speed = apiDone && visibleCount >= MIN_MESSAGES_BEFORE_EXIT ? RUSH_SPEED : NORMAL_SPEED;
    const id = setTimeout(() => setVisibleCount((prev) => prev + 1), speed);
    return () => clearTimeout(id);
  }, [visibleCount, apiDone]);

  // Scripted list exhausted and the model still thinking: keep talking.
  useEffect(() => {
    if (apiDone || visibleCount < MESSAGES.length) return;
    const id = setTimeout(() => setStallCount((prev) => prev + 1), STALL_SPEED);
    return () => clearTimeout(id);
  }, [visibleCount, stallCount, apiDone]);

  const stalling = visibleCount >= MESSAGES.length && !apiDone && stallCount > 0;
  const current = stalling
    ? STALL_MESSAGES[(stallCount - 1) % STALL_MESSAGES.length]
    : MESSAGES[Math.min(visibleCount, MESSAGES.length) - 1];
  const completed = MESSAGES.slice(0, Math.min(visibleCount, MESSAGES.length) - (stalling ? 0 : 1));

  // Progress creeps toward 92% on the script, finishes only with a result.
  const progress = finished
    ? 100
    : Math.min(92, (visibleCount / MESSAGES.length) * 88 + Math.min(stallCount, 8) * 0.5);

  const tryFire = useCallback(() => {
    if (firedRef.current || !resultRef.current) return;
    const allShown = visibleCount >= MESSAGES.length;
    const enoughShown = apiDone && visibleCount >= MIN_MESSAGES_BEFORE_EXIT;
    if (!allShown && !enoughShown) return;

    firedRef.current = true;
    setFinished(true);
    const result = resultRef.current;
    setTimeout(() => handleResultRef.current(result), 700);
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
        if (res.status === 429) {
          onBlocked();
          return;
        }

        if (!res.ok) {
          // Surface WHY. A silent fallback means a broken model config looks
          // exactly like a working one.
          const detail = await res.json().catch(() => ({}));
          console.error(`[analysis] API failed (${res.status})`, detail?.reason ?? "", detail?.message ?? "");
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
        };
      }

      if (!cancelled) setApiDone(true);
    }

    runAnalysis();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-5 py-10 w-full max-w-xl mx-auto gap-8">
      {/* Record */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={finished ? { scale: 1.06, opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        className="relative"
      >
        <div
          className="absolute -inset-6 rounded-full blur-2xl opacity-60"
          style={{ background: "var(--dusk)" }}
          aria-hidden
        />
        <div
          className="spin-slow relative w-44 h-44 sm:w-52 sm:h-52 rounded-full grid place-items-center shadow-[var(--shadow-lift)]"
          style={{
            background:
              "repeating-radial-gradient(circle at center, #2a1834 0px, #2a1834 2px, #3a2346 3px, #2a1834 4px)",
          }}
          aria-hidden
        >
          {/* sheen */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 30deg, transparent 0deg, rgba(255,255,255,0.14) 40deg, transparent 80deg, transparent 200deg, rgba(255,255,255,0.08) 230deg, transparent 260deg)",
            }}
          />
          <div
            className="relative w-[42%] h-[42%] rounded-full grid place-items-center text-center px-2"
            style={{ background: "var(--dusk-button)" }}
          >
            <span className="text-[9px] sm:text-[10px] font-semibold leading-tight text-white/95 line-clamp-2">
              {heaviest?.title ?? "Senti.AI"}
            </span>
            <span className="absolute w-2 h-2 rounded-full bg-[#fcecf3]" />
          </div>
        </div>
      </motion.div>

      {heaviest && (
        <p className="-mt-3 text-[13px] text-text-muted text-center max-w-[32ch] truncate">
          Now playing: <span className="font-medium text-text-secondary">{heaviest.title}</span>
          {heaviest.artist !== "Unknown Artist" && <> — {heaviest.artist}</>}
        </p>
      )}

      {/* Current line */}
      <div className="flex flex-col items-center gap-4 w-full text-center">
        <p className="text-[13px] font-medium text-accent-ink">
          {finished ? "Report ready" : "Reading you…"}
        </p>
        <div className="min-h-[64px] flex items-start justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={finished ? "done" : current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="font-display text-[20px] sm:text-[23px] font-semibold text-text-primary leading-snug max-w-[30ch]"
            >
              {finished ? "Brace yourself." : current}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="w-full max-w-sm h-2 rounded-full overflow-hidden bg-[rgba(74,30,82,0.08)]">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            style={{ background: "var(--dusk)" }}
          />
        </div>
      </div>

      {/* Trail of completed checks */}
      <ul className="w-full max-w-sm flex flex-col gap-1.5 min-h-[120px]" aria-live="polite">
        <AnimatePresence initial={false}>
          {completed.slice(-4).map((msg, i, arr) => (
            <motion.li
              key={msg}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.4 + (i / Math.max(1, arr.length - 1)) * 0.6, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2 text-[13px] text-text-secondary"
            >
              <span className="mt-0.5 grid place-items-center w-4 h-4 rounded-full bg-accent-success/15 text-accent-success shrink-0">
                <IconCheck size={11} strokeWidth={2.6} />
              </span>
              <span className="min-w-0">{msg}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
