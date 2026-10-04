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

// Deliberate escalation, and late: the first lines read like a gentle
// music-personality read, so nothing before the results gives the roast
// away. The register only turns in the back half — by then every answer is
// committed and the turn *is* the drama.
const MESSAGES = [
  "Pinapakinggan ang playlist mo…",
  "Reading your type, attachment and love language together…",
  "Asking the stars what they think…",
  "Checking which songs you'd replay at 3AM…",
  "Hmm. Interesting choices.",
  "Checking kung ilang beses mo na ni-replay yung last song…",
  "Analyzing hugot concentration per song… WARNING: lethal levels",
  "Computing probability of a 3AM ‘kumusta ka na?’ text…",
  "Calibrating delulu-to-reality ratio…",
  "Fetching data from your barkada GC… (charot)",
  "Consulting the stars again… they said ‘yikes’",
  "Printing your emotional damage report. You're not okay, bestie.",
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

/** Gateway answers (not the app's) — the request never reached a verdict. */
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

/** Resolves once the page is in front again (immediately if it already is). */
function whenVisible(): Promise<void> {
  if (typeof document === "undefined" || document.visibilityState === "visible") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const onChange = () => {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", onChange);
      resolve();
    };
    document.addEventListener("visibilitychange", onChange);
  });
}

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

      const body = JSON.stringify({
        songs,
        mbti,
        attachmentStyle,
        loveLanguage,
        zodiac,
        fingerprint: fp,
        ...(personalContext ? { personalContext } : {}),
      });
      const post = () =>
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

      try {
        // A real read takes ~50s. On a phone that's long enough to lock the
        // screen or hop to Spotify, and a backgrounded tab can drop the
        // request. That — or the platform answering for the app with a
        // 502/503/504 — is worth exactly one retry, once the page is back in
        // front. App errors (a 500 with a reason) are not: the SDK has
        // already retried those server-side.
        let res: Response;
        try {
          res = await post();
          if (RETRYABLE_STATUSES.has(res.status)) {
            console.warn(`[analysis] gateway ${res.status}, retrying once`);
            await whenVisible();
            if (cancelled) return;
            res = await post();
          }
        } catch (dropped) {
          if (cancelled) return;
          console.warn("[analysis] request dropped, retrying once:", dropped);
          await whenVisible();
          if (cancelled) return;
          res = await post();
        }

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
          // Shown in small print on the report, so a user can say what
          // happened without anyone needing the server logs.
          degraded_reason: err instanceof TypeError ? "network" : err instanceof Error ? err.message : "unknown",
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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-5 py-10 w-full max-w-xl mx-auto gap-7">
      <motion.div
        initial={{ y: 24, opacity: 0, rotate: -4 }}
        animate={finished ? { y: 0, opacity: 1, rotate: 0, scale: 1.04 } : { y: 0, opacity: 1, rotate: -1.5, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        className="w-full max-w-[340px]"
      >
        <Cassette progress={progress} title={heaviest?.title} artist={heaviest?.artist} spinning={!finished} />
      </motion.div>

      {/* Tape counter + current line */}
      <div className="flex flex-col items-center gap-3 w-full text-center">
        <div className="flex items-center gap-3">
          <span
            className="rounded-[6px] border-2 border-ink bg-ink px-2 py-1 font-dot font-black text-[22px] leading-none text-yellow tabular-nums tracking-[0.08em]"
            aria-label={`${Math.round(progress)} percent`}
          >
            {String(Math.round(progress)).padStart(3, "0")}
          </span>
          <span className="font-display font-extrabold uppercase tracking-[0.06em] text-[15px] text-pink-ink">
            {finished ? "Report ready" : "Reading you…"}
          </span>
        </div>
        <div className="min-h-[72px] flex items-start justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={finished ? "done" : current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.26 }}
              className="font-display text-[26px] sm:text-[30px] font-extrabold text-ink leading-[1.02] max-w-[24ch]"
            >
              {finished ? "Brace yourself." : current}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Trail of completed checks */}
      <ul className="w-full max-w-sm flex flex-col gap-2 min-h-[128px]" aria-live="polite">
        <AnimatePresence initial={false}>
          {completed.slice(-4).map((msg, i, arr) => (
            <motion.li
              key={msg}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.4 + (i / Math.max(1, arr.length - 1)) * 0.6, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2 text-[14px] text-text-secondary"
            >
              <IconCheck size={16} strokeWidth={3} className="mt-0.5 text-accent-success shrink-0" />
              <span className="min-w-0">{msg}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/**
 * The loader is a C-60 playing your heaviest track: a pink shell, a label
 * with the title written in pen, and real tape moving from the left reel to
 * the right as the read progresses — the progress bar, in other words.
 */
function Cassette({
  progress,
  title,
  artist,
  spinning,
}: {
  progress: number;
  title?: string;
  artist?: string;
  spinning: boolean;
}) {
  const p = Math.max(0, Math.min(1, progress / 100));
  const MIN = 15;
  const MAX = 31;
  const left = MIN + (MAX - MIN) * (1 - p);
  const right = MIN + (MAX - MIN) * p;
  const hub = (cx: number) => (
    <g className={spinning ? "reel-spin" : undefined}>
      <circle cx={cx} cy={104} r={11} fill="#fffaf2" stroke="#1d1932" strokeWidth={2} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect
          key={a}
          x={cx - 1.6}
          y={93.5}
          width={3.2}
          height={5}
          rx={1}
          fill="#1d1932"
          transform={`rotate(${a} ${cx} 104)`}
        />
      ))}
    </g>
  );
  return (
    <div className="relative">
      <svg viewBox="0 0 320 200" className="w-full h-auto" aria-hidden="true">
        {/* shell: pink pass, then ink pass */}
        <rect x={10} y={10} width={306} height={186} rx={14} fill="#ff4f9a" />
        <rect x={4} y={4} width={306} height={186} rx={14} fill="none" stroke="#1d1932" strokeWidth={3} />
        {[22, 292].map((x) => [22, 172].map((y) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={5} fill="#fffaf2" stroke="#1d1932" strokeWidth={2} />
            <path d={`M${x - 3} ${y}h6`} stroke="#1d1932" strokeWidth={1.5} />
          </g>
        )))}
        {/* label */}
        <rect x={30} y={20} width={254} height={124} rx={8} fill="#fffaf2" stroke="#1d1932" strokeWidth={2.5} />
        <rect x={30} y={20} width={254} height={22} rx={8} fill="#ffd23a" stroke="#1d1932" strokeWidth={2.5} />
        <rect x={31.5} y={34} width={251} height={7} fill="#ffd23a" />
        {[58, 132].map((y) => (
          <path key={y} d={`M44 ${y}h226`} stroke="rgba(43,78,224,0.25)" strokeWidth={1.5} />
        ))}
        {/* window */}
        <rect x={72} y={78} width={170} height={52} rx={26} fill="#1d1932" />
        <motion.circle cx={110} cy={104} fill="#5a3a2a" initial={false} animate={{ r: left }} transition={{ type: "spring", stiffness: 60, damping: 20 }} />
        <motion.circle cx={204} cy={104} fill="#5a3a2a" initial={false} animate={{ r: right }} transition={{ type: "spring", stiffness: 60, damping: 20 }} />
        {hub(110)}
        {hub(204)}
        <rect x={142} y={92} width={30} height={24} rx={3} fill="rgba(255,250,242,0.12)" />
        {/* bottom guide */}
        <path d="M78 196l10-36h138l10 36" fill="#ff4f9a" stroke="#1d1932" strokeWidth={3} strokeLinejoin="round" />
        {[108, 136, 178, 206].map((x) => (
          <circle key={x} cx={x} cy={180} r={4.5} fill="#1d1932" />
        ))}
      </svg>
      {/* label text, in HTML so it can use the hand font */}
      <div className="absolute left-[12%] right-[12%] top-[10.6%] flex items-center justify-between font-display font-black uppercase text-[11px] sm:text-[12px] tracking-[0.08em] text-ink">
        <span>Side A</span>
        <span>C-60</span>
      </div>
      <p className="absolute left-[13%] right-[13%] top-[21%] font-hand text-[19px] sm:text-[21px] leading-none text-blue-ink truncate text-center">
        {title ?? "Senti.AI mix"}
        {artist && artist !== "Unknown Artist" && <span className="text-[15px] text-text-muted"> — {artist}</span>}
      </p>
    </div>
  );
}
