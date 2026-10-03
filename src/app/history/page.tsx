"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import BrandMark from "@/components/ui/BrandMark";
import { LinkButton } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";
import { loadHistory, type HistoryEntry } from "@/lib/reportStore";
import { threatTone } from "@/lib/theme";

const LINE = "#e0306b";

function formatDate(ts: number, long = false): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(long ? { year: "numeric", hour: "numeric", minute: "2-digit" } : {}),
  });
}

/** The "seek help" banner: compares the two latest scans. */
function ChangeBanner({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length < 2) return null;
  const latest = entries[entries.length - 1];
  const previous = entries[entries.length - 2];
  const diff = latest.score - previous.score;
  const pct = previous.score > 0 ? Math.abs(Math.round((diff / previous.score) * 100)) : 0;

  // Prefer the delulu meter when both scans have it — it's the funnier read.
  const deluluDiff =
    latest.delulu !== undefined && previous.delulu !== undefined ? latest.delulu - previous.delulu : null;

  let message: string;
  let tone: { ink: string; soft: string };
  if (deluluDiff !== null && Math.abs(deluluDiff) >= 5) {
    message =
      deluluDiff > 0
        ? `Your delulu index went up ${deluluDiff} points since last time. Seek help.`
        : `Delulu index down ${Math.abs(deluluDiff)} points. Growth? Or better at lying to the app?`;
    tone = deluluDiff > 0 ? { ink: "#be123c", soft: "#ffe4ea" } : { ink: "#047857", soft: "#dcf7eb" };
  } else if (diff > 0) {
    message = `Emotional damage up ${pct}% since last time. Seek help.`;
    tone = { ink: "#be123c", soft: "#ffe4ea" };
  } else if (diff < 0) {
    message = `Suspicious. Your score dropped ${pct}%. Are you lying?`;
    tone = { ink: "#047857", soft: "#dcf7eb" };
  } else {
    message = "Consistent emotional damage. At least you're stable.";
    tone = { ink: "#a16207", soft: "#fef6cd" };
  }

  return (
    <div className="rounded-2xl px-4 py-3.5 text-[15px] font-medium" style={{ color: tone.ink, background: tone.soft }}>
      {message}
    </div>
  );
}

/**
 * Damage over time — one series, so no legend; the title names it. Fixed
 * 0–10 axis so a 9.0 always looks like a 9.0, recessive grid, direct label on
 * the latest point only, hover/tap for any other point's value.
 */
function DamageChart({ entries }: { entries: HistoryEntry[] }) {
  const [hover, setHover] = useState<number | null>(null);
  // Drawn at the container's real pixel width so axis text stays 11px on a
  // phone instead of being scaled down with a fixed viewBox.
  const boxRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setW(Math.max(260, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const H = 200;
  const pad = { top: 22, right: 22, bottom: 30, left: 30 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (entries.length === 1 ? innerW / 2 : (i / (entries.length - 1)) * innerW);
  const y = (score: number) => pad.top + innerH * (1 - score / 10);

  const points = entries.map((e, i) => [x(i), y(e.score)] as const);
  const path = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px},${py}`).join(" ");
  const area = `${path} L${points[points.length - 1][0]},${y(0)} L${points[0][0]},${y(0)} Z`;
  const last = entries.length - 1;
  const active = hover ?? last;

  return (
    <div className="glass rounded-3xl p-4 sm:p-5">
      <p className="font-display text-[16px] font-semibold text-text-primary">Emotional damage over time</p>
      <p className="text-[13px] text-text-muted mb-3">Score out of 10 · last {entries.length} scan{entries.length > 1 ? "s" : ""}</p>
      <div ref={boxRef} className="w-full">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block touch-none"
          role="img"
          aria-label={`Emotional damage scores: ${entries.map((e) => e.score.toFixed(1)).join(", ")}`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="damage-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LINE} stopOpacity="0.18" />
              <stop offset="100%" stopColor={LINE} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 5, 10].map((tick) => (
            <g key={tick}>
              <line x1={pad.left} x2={W - pad.right} y1={y(tick)} y2={y(tick)} stroke="rgba(74,30,82,0.08)" strokeWidth={1} />
              <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#7b6987">
                {tick}
              </text>
            </g>
          ))}

          {entries.length > 1 && <path d={area} fill="url(#damage-area)" />}
          {entries.length > 1 && (
            <motion.path
              d={path}
              fill="none"
              stroke={LINE}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )}

          {/* Crosshair for the active point */}
          <line x1={points[active][0]} x2={points[active][0]} y1={pad.top} y2={y(0)} stroke="rgba(74,30,82,0.18)" strokeDasharray="3 3" />

          {points.map(([px, py], i) => (
            <g key={i}>
              <circle cx={px} cy={py} r={i === active ? 6 : 4} fill={LINE} stroke="#fff" strokeWidth={2} />
              {/* Hit target larger than the mark */}
              <rect
                x={px - innerW / Math.max(2, entries.length * 2)}
                y={pad.top}
                width={innerW / Math.max(1, entries.length)}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onClick={() => setHover(i)}
              />
            </g>
          ))}

          {/* Direct label on the active point (the latest by default) */}
          <g transform={`translate(${Math.min(W - pad.right - 44, Math.max(pad.left + 44, points[active][0]))}, ${Math.max(14, points[active][1] - 14)})`}>
            <text textAnchor="middle" fontSize="13" fontWeight="700" fill="#2a1834">
              {entries[active].score.toFixed(1)}
            </text>
          </g>

          {entries.map((e, i) =>
            i === 0 || i === last || i === hover ? (
              <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#7b6987">
                {formatDate(e.timestamp)}
              </text>
            ) : null
          )}
        </svg>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    // localStorage is browser-only; reading after mount is intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadHistory());
  }, []);

  return (
    <main className="min-h-screen max-w-[680px] mx-auto px-4 pb-16 flex flex-col gap-6">
      <nav className="py-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <BrandMark size={32} />
          <span className="font-display font-bold text-[18px] text-text-primary">Senti.AI</span>
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="text-[34px] sm:text-[42px] font-extrabold leading-tight text-text-primary">
          Your <span className="text-dusk">deterioration</span>{" "}tracker
        </h1>
        <p className="text-[15px] text-text-secondary">Every scan from this browser, newest last. Stored only on this device.</p>
      </header>

      {entries === null ? null : entries.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center flex flex-col items-center gap-4">
          <p className="text-[15px] text-text-secondary">No scans yet. Wala pang ebidensya.</p>
          <LinkButton href="/">
            Take your first scan <IconArrowRight size={18} />
          </LinkButton>
        </div>
      ) : (
        <>
          <DamageChart entries={entries} />
          <ChangeBanner entries={entries} />

          <section className="flex flex-col gap-2.5">
            <h2 className="text-[17px] font-bold text-text-primary">
              Scan log <span className="text-text-muted font-medium">· {entries.length}</span>
            </h2>
            {[...entries].reverse().map((entry, i) => {
              const tone = threatTone(entry.threat_level);
              return (
                <motion.div
                  key={entry.timestamp}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-2xl p-4 flex flex-col gap-2"
                >
                  <p className="text-[15px] text-text-primary leading-snug">{entry.headline}</p>
                  <div className="flex items-center gap-2 flex-wrap text-[12px]">
                    <span className="font-display text-[15px] font-bold" style={{ color: tone.ink }}>
                      {entry.score.toFixed(1)}/10
                    </span>
                    <span className="font-semibold rounded-full px-2 py-0.5" style={{ color: tone.ink, background: tone.soft }}>
                      {tone.label}
                    </span>
                    {entry.mbti && <span className="text-text-secondary">{entry.mbti}</span>}
                    <span className="text-text-muted">{formatDate(entry.timestamp, true)}</span>
                  </div>
                </motion.div>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}
