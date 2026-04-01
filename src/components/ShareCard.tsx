"use client";

import React, { forwardRef } from "react";
import { ProfileResult, Song, ThreatLevel } from "@/lib/types";

interface ShareCardProps {
  result: ProfileResult;
  songs: Song[];
  format: "story" | "post";
}

const THREAT_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: "#ff0040",
  SEVERE: "#ff3252",
  ELEVATED: "#ff8c00",
  MODERATE: "#ffd000",
  LOW: "#00cc88",
};

const CARD_DIMENSIONS = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1080 },
};

function getShortestPredictions(
  predictions: string[],
  count: number
): string[] {
  return [...predictions]
    .sort((a, b) => a.length - b.length)
    .slice(0, count);
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ result, songs, format }, ref) => {
    const { width, height } = CARD_DIMENSIONS[format];
    const accentColor = THREAT_COLORS[result.threat_level];
    const isStory = format === "story";
    const predictions = getShortestPredictions(
      result.behavioral_predictions,
      isStory ? 3 : 2
    );
    const avgPainIndex =
      songs.length > 0
        ? (
            songs.reduce((sum, s) => sum + s.painIndex, 0) / songs.length
          ).toFixed(1)
        : "—";

    const containerStyle: React.CSSProperties = {
      position: "absolute",
      left: "-9999px",
      top: "-9999px",
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: "#0a0a0f",
      color: "#e8e8e8",
      fontFamily: "'Outfit', sans-serif",
      display: "flex",
      flexDirection: "column",
      padding: isStory ? "80px 72px" : "72px 72px",
      boxSizing: "border-box",
      overflow: "hidden",
    };

    const noiseOverlayStyle: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "radial-gradient(ellipse at 20% 10%, rgba(255,50,82,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(255,50,82,0.04) 0%, transparent 50%)",
      pointerEvents: "none",
    };

    const topBarStyle: React.CSSProperties = {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: isStory ? "64px" : "48px",
    };

    const logoStyle: React.CSSProperties = {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "28px",
      fontWeight: 700,
      color: accentColor,
      letterSpacing: "0.1em",
    };

    const labelStyle: React.CSSProperties = {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "16px",
      color: "rgba(232,232,232,0.4)",
      letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
    };

    const heroStyle: React.CSSProperties = {
      marginBottom: isStory ? "56px" : "40px",
    };

    const headlineStyle: React.CSSProperties = {
      fontSize: isStory ? "56px" : "44px",
      fontWeight: 800,
      lineHeight: 1.15,
      color: "#e8e8e8",
      marginBottom: "28px",
      letterSpacing: "-0.02em",
    };

    const threatBadgeStyle: React.CSSProperties = {
      display: "inline-block",
      padding: "10px 24px",
      backgroundColor: `${accentColor}22`,
      border: `2px solid ${accentColor}`,
      borderRadius: "100px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "18px",
      fontWeight: 700,
      color: accentColor,
      letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
    };

    const statsStripStyle: React.CSSProperties = {
      display: "flex",
      gap: "0",
      marginBottom: isStory ? "56px" : "40px",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "28px 0",
    };

    const statItemStyle: React.CSSProperties = {
      flex: 1,
      textAlign: "center" as const,
    };

    const statValueStyle: React.CSSProperties = {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "36px",
      fontWeight: 700,
      color: accentColor,
      display: "block",
      marginBottom: "8px",
    };

    const statLabelStyle: React.CSSProperties = {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "13px",
      color: "rgba(232,232,232,0.45)",
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
    };

    const statDividerStyle: React.CSSProperties = {
      width: "1px",
      backgroundColor: "rgba(255,255,255,0.08)",
      margin: "0 4px",
    };

    const predictionsContainerStyle: React.CSSProperties = {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      marginBottom: isStory ? "48px" : "32px",
    };

    const predictionItemStyle: React.CSSProperties = {
      display: "flex",
      gap: "20px",
      alignItems: "flex-start",
      padding: "20px 24px",
      backgroundColor: "rgba(255,255,255,0.02)",
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: "0 8px 8px 0",
    };

    const predictionTextStyle: React.CSSProperties = {
      fontSize: isStory ? "26px" : "22px",
      lineHeight: 1.5,
      color: "rgba(232,232,232,0.85)",
      fontWeight: 400,
    };

    const verdictStyle: React.CSSProperties = {
      marginBottom: isStory ? "48px" : "32px",
      padding: "28px 32px",
      backgroundColor: "rgba(255,50,82,0.05)",
      border: "1px solid rgba(255,50,82,0.15)",
      borderRadius: "12px",
    };

    const verdictTextStyle: React.CSSProperties = {
      fontSize: isStory ? "24px" : "20px",
      lineHeight: 1.6,
      color: "rgba(232,232,232,0.7)",
      fontStyle: "italic",
    };

    const bottomStyle: React.CSSProperties = {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: "auto",
      paddingTop: "32px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    };

    const brandingStyle: React.CSSProperties = {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "20px",
      color: "rgba(232,232,232,0.35)",
      letterSpacing: "0.2em",
    };

    const ctaStyle: React.CSSProperties = {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "22px",
      color: accentColor,
      fontWeight: 600,
    };

    return (
      <div ref={ref} style={containerStyle}>
        <div style={noiseOverlayStyle} />

        {/* Top bar */}
        <div style={topBarStyle}>
          <span style={logoStyle}>SENTI.AI</span>
          <span style={labelStyle}>Emotional Damage Report</span>
        </div>

        {/* Hero: headline + threat level */}
        <div style={heroStyle}>
          <div style={headlineStyle}>{result.headline}</div>
          <div style={threatBadgeStyle}>
            THREAT LEVEL: {result.threat_level}
          </div>
        </div>

        {/* Stats strip */}
        <div style={statsStripStyle}>
          <div style={statItemStyle}>
            <span style={statValueStyle}>
              {result.emotional_damage_score.toFixed(1)}/10
            </span>
            <span style={statLabelStyle}>Emotional Damage</span>
          </div>
          <div style={statDividerStyle} />
          <div style={statItemStyle}>
            <span style={statValueStyle}>
              {result.drunk_text_probability}%
            </span>
            <span style={statLabelStyle}>Drunk Text Prob</span>
          </div>
          <div style={statDividerStyle} />
          <div style={statItemStyle}>
            <span style={statValueStyle}>{avgPainIndex}/10</span>
            <span style={statLabelStyle}>Pain Index</span>
          </div>
        </div>

        {/* Behavioral predictions */}
        <div style={predictionsContainerStyle}>
          {predictions.map((prediction, i) => (
            <div key={i} style={predictionItemStyle}>
              <span style={predictionTextStyle}>{prediction}</span>
            </div>
          ))}
        </div>

        {/* Final verdict */}
        {isStory && (
          <div style={verdictStyle}>
            <div style={verdictTextStyle}>"{result.final_verdict}"</div>
          </div>
        )}

        {/* Bottom branding */}
        <div style={bottomStyle}>
          <span style={brandingStyle}>—— SENTI.AI ——</span>
          <span style={ctaStyle}>Take yours → senti.ai</span>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;
