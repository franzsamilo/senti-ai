import { forwardRef } from "react";
import type { ProfileResult } from "@/lib/types";
import { SITE_HOST, threatTone } from "@/lib/theme";
import { videokePraise } from "@/components/ui/VideokeScore";

interface ShareCardProps {
  result: ProfileResult;
  painIndex: number;
  mbti: string;
  attachmentStyle: string;
  zodiac: string;
}

const INK = "#1d1932";
const PAPER = "#f4ede0";
const PINK = "#ff4f9a";
const YELLOW = "#ffd23a";
const SCREEN = "#1b33c2";

/** A torn receipt edge, drawn rather than masked so the capture keeps it. */
function ZigZag({ width, flip = false, color }: { width: number; flip?: boolean; color: string }) {
  const tooth = 12;
  const n = Math.ceil(width / tooth);
  let d = flip ? `M0 0` : `M0 8`;
  for (let i = 0; i < n; i++) {
    const x = i * tooth;
    d += flip ? ` L${x + tooth / 2} 8 L${x + tooth} 0` : ` L${x + tooth / 2} 0 L${x + tooth} 8`;
  }
  d += flip ? ` L${n * tooth} 0 Z` : ` L${n * tooth} 8 Z`;
  return (
    <svg width={width} height={8} viewBox={`0 0 ${width} 8`} style={{ display: "block" }}>
      <path d={d} fill={color} />
    </svg>
  );
}

/**
 * The story card: 540×960 laid out here, captured at 2× into a 1080×1920 PNG
 * — IG/FB story size. It's the report's front page shrunk to a poster: the
 * masthead, the headline with its threat stamp, the videoke score screen and
 * a strip of receipt.
 *
 * Inline styles only: html-to-image clones computed styles, and keeping the
 * card self-contained means a Tailwind change elsewhere can't break the one
 * thing people actually post.
 *
 * The off-screen positioning lives on a wrapper, never on the captured node.
 * html-to-image copies *every* computed property, including the logical
 * `inset-inline` longhands; an offset on the card itself survives any
 * override and the PNG comes out a perfectly sized blank.
 */
const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { result, painIndex, mbti, attachmentStyle, zodiac },
  ref
) {
  const tone = threatTone(result.threat_level);
  const display = "var(--font-shoulders), var(--font-archivo), system-ui, sans-serif";
  const body = "var(--font-archivo), system-ui, sans-serif";
  const serif = "var(--font-fraunces), Georgia, serif";
  const mono = "var(--font-martian), ui-monospace, monospace";
  const dot = "var(--font-doto), var(--font-martian), monospace";

  const score100 = Math.round(Math.min(10, Math.max(0, result.emotional_damage_score)) * 10);

  // The shortest prediction is usually the punchiest — and it fits.
  const prediction = [...result.behavioral_predictions].sort((a, b) => a.length - b.length)[0];

  const delulu = result.metrics?.delulu.value;
  const stats = [
    { label: "DRUNK TEXT PROBABILITY", value: `${result.drunk_text_probability}%` },
    { label: "PAIN INDEX", value: `${painIndex.toFixed(1)}/10` },
    ...(typeof delulu === "number" ? [{ label: "DELULU INDEX", value: `${delulu}%` }] : []),
  ];

  const headlineSize = result.headline.length > 95 ? 38 : result.headline.length > 65 ? 44 : 52;

  const clamp = (lines: number) =>
    ({
      display: "-webkit-box",
      WebkitLineClamp: lines,
      WebkitBoxOrient: "vertical" as const,
      overflow: "hidden",
    }) as const;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: "-10000px",
        top: 0,
        width: "540px",
        height: "960px",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        ref={ref}
        style={{
          width: "540px",
          height: "960px",
          overflow: "hidden",
          fontFamily: body,
          color: INK,
          textRendering: "geometricPrecision",
          fontKerning: "normal",
          // Solid paper only: html-to-image can't inline an SVG-filter data
          // URI as a background, and when it fails the whole card goes
          // transparent. Halftone gradients below are safe.
          background: `radial-gradient(circle at 100% 0%, rgba(255,79,154,0.10) 0 22%, transparent 22.5%), ${PAPER}`,
          padding: "30px 32px 26px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Masthead */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: display,
              fontWeight: 800,
              fontSize: "14px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              borderBottom: `2px solid ${INK}`,
              paddingBottom: "6px",
            }}
          >
            <span>3AM Edition</span>
            <span>Emotional Damage Report</span>
            <span>Libre</span>
          </div>
          <div
            style={{
              fontFamily: display,
              fontWeight: 900,
              fontSize: "84px",
              lineHeight: 0.84,
              textAlign: "center",
              textTransform: "uppercase",
              textShadow: `3px 3px 0 ${PINK}`,
              padding: "4px 0 2px",
            }}
          >
            Senti<span style={{ color: PINK, textShadow: "none" }}>.</span>AI
          </div>
          <div style={{ borderTop: `6px double ${INK}` }} />
        </div>

        {/* Kicker + stamp */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              background: "#e2402b",
              color: "#fffaf2",
              fontFamily: display,
              fontWeight: 900,
              fontSize: "17px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "6px 10px 5px",
              transform: "rotate(-1deg)",
            }}
          >
            Breaking
          </span>
          <span
            style={{
              color: tone.color,
              border: `4px solid ${tone.color}`,
              borderRadius: "8px",
              padding: "4px 12px 2px",
              fontFamily: display,
              fontWeight: 900,
              fontSize: "30px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              lineHeight: 1,
              transform: "rotate(-8deg)",
            }}
          >
            {tone.label}
          </span>
        </div>

        {/* Headline */}
        <p
          style={{
            fontFamily: display,
            fontSize: `${headlineSize}px`,
            fontWeight: 900,
            lineHeight: 0.9,
            textTransform: "uppercase",
            margin: 0,
            ...clamp(5),
          }}
        >
          {result.headline}
        </p>

        {/* Videoke screen */}
        <div
          style={{
            background: INK,
            borderRadius: "18px",
            padding: "8px",
            boxShadow: `5px 5px 0 ${PINK}`,
          }}
        >
          <div
            style={{
              backgroundColor: SCREEN,
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px), radial-gradient(120% 90% at 50% 40%, rgba(120,150,255,0.35), transparent 70%)",
              borderRadius: "12px",
              padding: "14px 12px 14px",
              textAlign: "center",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "18px",
            }}
          >
            <span
              style={{
                fontFamily: dot,
                fontWeight: 900,
                fontSize: "112px",
                lineHeight: 0.86,
                textShadow: "0 0 10px rgba(180,200,255,0.75)",
              }}
            >
              {score100}
            </span>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px", textAlign: "left" }}>
              <span style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "0.14em", opacity: 0.8 }}>YOUR SCORE</span>
              <span
                style={{
                  fontFamily: display,
                  fontWeight: 900,
                  fontSize: "24px",
                  lineHeight: 1,
                  color: YELLOW,
                  textTransform: "uppercase",
                  maxWidth: "210px",
                }}
              >
                {videokePraise(score100)}
              </span>
              <span style={{ fontFamily: mono, fontSize: "11px", opacity: 0.8 }}>
                Damage {result.emotional_damage_score.toFixed(1)}/10
              </span>
            </span>
          </div>
        </div>

        {/* Receipt strip */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <ZigZag width={476} color="#fffdf8" />
          <div style={{ background: "#fffdf8", padding: "8px 22px 6px", fontFamily: mono, fontSize: "13px" }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: "8px", lineHeight: 2 }}>
                <span>{s.label}</span>
                <span style={{ flex: 1, borderBottom: "2px dotted rgba(29,25,50,0.35)", transform: "translateY(-4px)" }} />
                <span style={{ fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
            <div style={{ fontSize: "11px", color: "#6c6680", marginTop: "2px" }}>
              {mbti} · {attachmentStyle} · {zodiac}
            </div>
          </div>
          <ZigZag width={476} flip color="#fffdf8" />
        </div>

        {/* Pull quote */}
        {prediction && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "21px",
                lineHeight: 1.28,
                margin: 0,
                borderLeft: `5px solid ${PINK}`,
                paddingLeft: "14px",
                ...clamp(4),
              }}
            >
              &ldquo;{prediction}&rdquo;
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `3px solid ${INK}`,
            paddingTop: "10px",
            fontFamily: display,
            fontWeight: 800,
            fontSize: "18px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ background: YELLOW, padding: "3px 8px 2px", border: `2px solid ${INK}` }}>Take yours →</span>
          <span>{SITE_HOST}</span>
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
