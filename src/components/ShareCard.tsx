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

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ result, songs, format }, ref) => {
    const isStory = format === "story";
    const width = 1080;
    const height = isStory ? 1920 : 1080;
    const accent = THREAT_COLORS[result.threat_level];
    const avgPain = songs.length > 0
      ? (songs.reduce((s, x) => s + x.painIndex, 0) / songs.length).toFixed(1)
      : "—";

    // Pick 2-3 shortest predictions
    const preds = [...result.behavioral_predictions]
      .sort((a, b) => a.length - b.length)
      .slice(0, isStory ? 3 : 2);

    const pad = isStory ? "72px" : "60px";
    const fs = (story: number, post: number) => `${isStory ? story : post}px`;

    return (
      <div
        ref={ref}
        style={{
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
          padding: pad,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Subtle gradient overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(ellipse at 20% 10%, rgba(255,50,82,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(255,50,82,0.04) 0%, transparent 50%)",
        }} />

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isStory ? "40px" : "28px" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "28px", fontWeight: 700, color: accent, letterSpacing: "0.1em" }}>SENTI.AI</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", color: "rgba(232,232,232,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Emotional Damage Report</span>
        </div>

        {/* Headline + threat badge */}
        <div style={{ marginBottom: isStory ? "32px" : "24px" }}>
          <div style={{ fontSize: fs(48, 38), fontWeight: 800, lineHeight: 1.15, marginBottom: "20px", letterSpacing: "-0.02em" }}>
            {result.headline}
          </div>
          <span style={{
            display: "inline-block", padding: "8px 20px",
            backgroundColor: `${accent}22`, border: `2px solid ${accent}`,
            borderRadius: "100px", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "16px", fontWeight: 700, color: accent, letterSpacing: "0.15em",
          }}>
            THREAT LEVEL: {result.threat_level}
          </span>
        </div>

        {/* Stats strip */}
        <div style={{
          display: "flex", gap: "0", padding: "20px 0",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: isStory ? "28px" : "20px",
        }}>
          {[
            { val: `${result.emotional_damage_score.toFixed(1)}/10`, label: "Damage" },
            { val: `${result.drunk_text_probability}%`, label: "Drunk Text" },
            { val: `${avgPain}/10`, label: "Pain Index" },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />}
              <div style={{ flex: 1, textAlign: "center" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "30px", fontWeight: 700, color: accent, display: "block", marginBottom: "6px" }}>{stat.val}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(232,232,232,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{stat.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Songs list */}
        <div style={{ marginBottom: isStory ? "24px" : "16px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(232,232,232,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>
            PLAYLIST
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {songs.slice(0, 10).map((s, i) => (
              <span key={i} style={{
                display: "inline-block", padding: "6px 14px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "100px", fontSize: "14px", color: "rgba(232,232,232,0.7)",
              }}>
                {s.title} — {s.artist}
              </span>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div style={{ flex: isStory ? 1 : undefined, display: "flex", flexDirection: "column", gap: "12px", marginBottom: isStory ? "24px" : "16px" }}>
          {preds.map((p, i) => (
            <div key={i} style={{
              padding: "16px 20px",
              backgroundColor: "rgba(255,255,255,0.02)",
              borderLeft: `3px solid ${accent}`,
              borderRadius: "0 8px 8px 0",
              fontSize: fs(22, 18), lineHeight: 1.5, color: "rgba(232,232,232,0.85)",
            }}>
              {p}
            </div>
          ))}
        </div>

        {/* Toxic traits + Red flags (story only) */}
        {isStory && (
          <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(232,232,232,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>
                TOXIC TRAITS
              </div>
              {result.toxic_traits.slice(0, 3).map((t, i) => (
                <div key={i} style={{ fontSize: "16px", lineHeight: 1.5, color: "rgba(232,232,232,0.7)", marginBottom: "8px", paddingLeft: "12px", borderLeft: `2px solid ${accent}40` }}>
                  {t}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(232,232,232,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>
                RED FLAGS
              </div>
              {result.red_flags.slice(0, 3).map((r, i) => (
                <div key={i} style={{ fontSize: "16px", lineHeight: 1.5, color: "rgba(232,232,232,0.7)", marginBottom: "8px", paddingLeft: "12px", borderLeft: "2px solid rgba(255,0,64,0.4)" }}>
                  {r}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final verdict */}
        {isStory && (
          <div style={{
            padding: "20px 24px", marginBottom: "24px",
            backgroundColor: "rgba(255,50,82,0.05)",
            border: "1px solid rgba(255,50,82,0.15)",
            borderRadius: "12px",
          }}>
            <div style={{ fontSize: "18px", lineHeight: 1.6, color: "rgba(232,232,232,0.7)", fontStyle: "italic" }}>
              &ldquo;{result.final_verdict}&rdquo;
            </div>
          </div>
        )}

        {/* Post format: song diagnosis instead of traits/verdict */}
        {!isStory && (
          <div style={{
            padding: "16px 20px", marginBottom: "16px",
            backgroundColor: "rgba(255,50,82,0.05)",
            border: "1px solid rgba(255,50,82,0.15)",
            borderRadius: "12px",
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(232,232,232,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              SONG DIAGNOSIS
            </div>
            <div style={{ fontSize: "16px", lineHeight: 1.5, color: "rgba(232,232,232,0.7)" }}>
              {result.song_diagnosis}
            </div>
          </div>
        )}

        {/* Bottom branding */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginTop: "auto", paddingTop: "20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "18px", color: "rgba(232,232,232,0.35)", letterSpacing: "0.2em" }}>—— SENTI.AI ——</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "18px", color: accent, fontWeight: 600 }}>Take yours → senti-ai-iota.vercel.app</span>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
export default ShareCard;
