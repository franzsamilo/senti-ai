import { forwardRef } from "react";
import type { ProfileResult } from "@/lib/types";
import { SITE_HOST, threatTone } from "@/lib/theme";

interface ShareCardProps {
  result: ProfileResult;
  painIndex: number;
  mbti: string;
  attachmentStyle: string;
  zodiac: string;
}

/**
 * The story card: 540×960 laid out here, captured at 2× into a 1080×1920 PNG
 * — IG/FB story size.
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
  const display = "var(--font-bricolage), var(--font-outfit), system-ui, sans-serif";
  const body = "var(--font-outfit), system-ui, sans-serif";

  // The two shortest predictions are usually the punchiest — and they fit.
  const predictions = [...result.behavioral_predictions]
    .sort((a, b) => a.length - b.length)
    .slice(0, 2);

  const delulu = result.metrics?.delulu.value;
  const stats = [
    { label: "Drunk text", value: `${result.drunk_text_probability}%` },
    { label: "Pain index", value: painIndex.toFixed(1) },
    ...(typeof delulu === "number" ? [{ label: "Delulu", value: `${delulu}%` }] : []),
  ];

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
          color: "#2a1834",
          // Small Outfit text picked up uneven gaps ("Dr unk") when rasterised
          // through the SVG foreignObject; precise glyph positioning fixes it.
          textRendering: "geometricPrecision",
          fontKerning: "normal",
          background:
            "radial-gradient(120% 60% at 15% 0%, #ffb199 0%, transparent 60%), radial-gradient(100% 70% at 100% 100%, #7c3aed 0%, transparent 60%), linear-gradient(165deg, #ff8a66 0%, #e0306b 50%, #8b3fd9 100%)",
          padding: "44px 34px 36px",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
          <span style={{ fontFamily: display, fontWeight: 800, fontSize: "24px", letterSpacing: "-0.02em" }}>
            Senti.AI
          </span>
          <span style={{ fontSize: "13px", opacity: 0.9, fontWeight: 500 }}>Emotional Damage Report</span>
        </div>

        {/* Main card */}
        <div
          style={{
            background: "rgba(255,255,255,0.96)",
            borderRadius: "28px",
            padding: "26px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            boxShadow: "0 24px 60px -20px rgba(42,24,52,0.5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: tone.ink,
                background: tone.soft,
                borderRadius: "999px",
                padding: "6px 12px",
              }}
            >
              Threat level: {tone.label}
            </span>
            <span style={{ fontSize: "12px", color: "#7b6987", fontWeight: 500 }}>
              {mbti} · {attachmentStyle} · {zodiac}
            </span>
          </div>

          <p
            style={{
              fontFamily: display,
              fontSize: "27px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: 0,
              ...clamp(4),
            }}
          >
            {result.headline}
          </p>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "#7b6987", fontWeight: 500 }}>Emotional damage</span>
              <span style={{ fontFamily: display, fontSize: "64px", fontWeight: 800, lineHeight: 0.95, color: tone.ink }}>
                {result.emotional_damage_score.toFixed(1)}
                <span style={{ fontSize: "22px", color: "#a898b2" }}>/10</span>
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#f8eef4",
                    borderRadius: "14px",
                    padding: "10px 10px 8px",
                    minWidth: "70px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: display, fontSize: "20px", fontWeight: 800, color: "#c21f59" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#7b6987", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Predictions — centred in whatever space the headline leaves, so a
            short report doesn't open a dead band above the verdict */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "10px",
            flex: 1,
            minHeight: 0,
          }}
        >
          {predictions.map((p, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "18px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "15px",
                lineHeight: 1.45,
                fontWeight: 500,
                ...clamp(3),
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div style={{ color: "#fff", display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, opacity: 0.85, letterSpacing: "0.04em" }}>FINAL VERDICT</span>
          <p
            style={{
              fontFamily: display,
              fontSize: "19px",
              fontWeight: 600,
              lineHeight: 1.35,
              margin: 0,
              ...clamp(4),
            }}
          >
            {result.final_verdict}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            borderTop: "1px solid rgba(255,255,255,0.3)",
            paddingTop: "14px",
          }}
        >
          <span>Take yours →</span>
          <span>{SITE_HOST}</span>
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
