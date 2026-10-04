"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";
import { loadHistory, type HistoryEntry } from "@/lib/reportStore";
import { threatTone } from "@/lib/theme";

const LINE = "#ff4f9a";
const INK = "#1d1932";

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
  let tone: { ink: string };
  if (deluluDiff !== null && Math.abs(deluluDiff) >= 5) {
    message =
      deluluDiff > 0
        ? `Your delulu index went up ${deluluDiff} points since last time. Seek help.`
        : `Delulu index down ${Math.abs(deluluDiff)} points. Growth? Or better at lying to the app?`;
    tone = deluluDiff > 0 ? { ink: "#be123c" } : { ink: "#047857" };
  } else if (diff > 0) {
    message = `Emotional damage up ${pct}% since last time. Seek help.`;
    tone = { ink: "#be123c" };
  } else if (diff < 0) {
    message = `Suspicious. Your score dropped ${pct}%. Are you lying?`;
    tone = { ink: "#047857" };
  } else {
    message = "Consistent emotional damage. At least you're stable.";
    tone = { ink: "#a16207" };
  }

  return (
    <div className="relative self-start max-w-[420px] bg-yellow-soft px-4 pt-5 pb-4 -rotate-1 shadow-[var(--shadow-paper)]">
      <span className="tape -top-3 left-6 -rotate-3" aria-hidden />
      <p className="font-hand text-[21px] leading-snug" style={{ color: tone.ink }}>
        {message}
      </p>
      <p className="mt-1 font-hand text-[16px] text-text-muted">— Dr. Senti</p>
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
    <div className="paper overflow-hidden" style={{ borderRadius: 4 }}>
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-ink">
        <span className="font-display font-black uppercase tracking-[0.08em] text-[14px] text-paper-light">Patient chart</span>
        <span className="font-mono text-[10.5px] text-paper-light/80" style={{ fontStretch: "87.5%" }}>
          DAMAGE /10 · LAST {entries.length} SCAN{entries.length > 1 ? "S" : ""}
        </span>
      </div>
      <div
        className="p-3 sm:p-4"
        style={{
          backgroundImage:
            "linear-gradient(rgba(43,78,224,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(43,78,224,0.12) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        <p className="font-display font-black uppercase text-[22px] leading-none text-ink mb-3">Emotional damage over time</p>
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
                <stop offset="0%" stopColor={LINE} stopOpacity="0.28" />
                <stop offset="100%" stopColor={LINE} stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 5, 10].map((tick) => (
              <g key={tick}>
                <line x1={pad.left} x2={W - pad.right} y1={y(tick)} y2={y(tick)} stroke="rgba(29,25,50,0.25)" strokeWidth={1} />
                <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#4a4560" fontFamily="var(--font-martian)">
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
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            )}

            {/* Crosshair for the active point */}
            <line x1={points[active][0]} x2={points[active][0]} y1={pad.top} y2={y(0)} stroke="rgba(29,25,50,0.35)" strokeDasharray="3 3" />

            {points.map(([px, py], i) => (
              <g key={i}>
                <circle cx={px} cy={py} r={i === active ? 6.5 : 4.5} fill="#fffaf2" stroke={INK} strokeWidth={2.5} />
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
              <text textAnchor="middle" fontSize="18" fontWeight="900" fill={INK} fontFamily="var(--font-shoulders)">
                {entries[active].score.toFixed(1)}
              </text>
            </g>

            {entries.map((e, i) =>
              i === 0 || i === last || i === hover ? (
                <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#4a4560" fontFamily="var(--font-martian)">
                  {formatDate(e.timestamp)}
                </text>
              ) : null
            )}
          </svg>
        </div>
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
      <PageHeader
        kicker="Medical records"
        title={
          <>
            Your <span className="hl">deterioration</span>{" "}tracker
          </>
        }
        subtitle="Every scan from this browser, newest last. Stored only on this device."
      />

      {entries === null ? null : entries.length === 0 ? (
        <div className="paper p-8 text-center flex flex-col items-center gap-4">
          <p className="font-display font-black uppercase text-[28px] leading-none text-ink">No scans yet.</p>
          <p className="font-hand text-[19px] text-text-secondary">Wala pang ebidensya.</p>
          <LinkButton href="/">
            Take your first scan <IconArrowRight size={18} />
          </LinkButton>
        </div>
      ) : (
        <>
          <DamageChart entries={entries} />
          <ChangeBanner entries={entries} />

          <section className="flex flex-col gap-2.5">
            <h2 className="flex items-baseline gap-3 border-t-[3px] border-ink pt-2 font-display font-black uppercase text-[28px] leading-none text-ink">
              Scan log <span className="font-mono text-[13px] text-text-muted">{entries.length}</span>
            </h2>
            {[...entries].reverse().map((entry, i) => {
              const tone = threatTone(entry.threat_level);
              return (
                <motion.div
                  key={entry.timestamp}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="paper p-4 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 items-start"
                >
                  <p className="font-display font-extrabold text-[20px] leading-[1.05] text-ink">{entry.headline}</p>
                  <span className="font-display font-black text-[34px] leading-[0.85] tabular-nums text-ink">
                    {entry.score.toFixed(1)}
                  </span>
                  <div className="col-span-2 flex items-center gap-2.5 flex-wrap">
                    <span className="stamp text-[13px] -rotate-3" style={{ color: tone.color }}>
                      {tone.label}
                    </span>
                    {entry.mbti && (
                      <span className="font-display font-extrabold uppercase text-[13px] tracking-[0.04em] text-ink">{entry.mbti}</span>
                    )}
                    <span className="font-mono text-[11px] text-text-muted" style={{ fontStretch: "87.5%" }}>
                      {formatDate(entry.timestamp, true)}
                    </span>
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
