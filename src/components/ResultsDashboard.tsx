"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Song, AttachmentStyle, LoveLanguage, ProfileResult, ThreatLevel } from "@/lib/types";
import GlitchText from "@/components/GlitchText";
import StatBox from "@/components/ui/StatBox";
import ThreatMeter from "@/components/ui/ThreatMeter";
import SongChip from "@/components/ui/SongChip";
import Button from "@/components/ui/Button";
import MatchChallenge from "@/components/MatchChallenge";
import { captureCard } from "@/lib/shareImage";

interface ResultsDashboardProps {
  result: ProfileResult;
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage[];
  zodiac: string;
  onRunAgain: () => void;
}

const THREAT_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: "#ff0040",
  SEVERE: "#ff3252",
  ELEVATED: "#ff8c00",
  MODERATE: "#ffd000",
  LOW: "#00cc88",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.45, ease: "easeOut" as const },
  }),
};

function Section({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={index}>
      {children}
    </motion.div>
  );
}

function Card({ children, accentBorder = false }: { children: React.ReactNode; accentBorder?: boolean }) {
  return (
    <div className={`bg-bg-card rounded-xl p-4 sm:p-5 ${accentBorder ? "border border-accent/40" : "border border-border-subtle"}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">{children}</p>;
}

export default function ResultsDashboard({
  result, songs, mbti, attachmentStyle, loveLanguage, zodiac, onRunAgain,
}: ResultsDashboardProps) {
  const threatColor = THREAT_COLORS[result.threat_level];
  const avgPainIndex = songs.length > 0
    ? parseFloat((songs.reduce((sum, s) => sum + s.painIndex, 0) / songs.length).toFixed(1))
    : 0;
  const score = result.emotional_damage_score;
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const meters = [
    { label: "Emotional Instability", value: Math.min(99, Math.round(score * 10.5)) },
    { label: "Toxic Trait Concentration", value: Math.min(99, Math.round(score * 9.2)) },
    { label: "Delulu Index", value: Math.min(99, Math.round(score * 11.0)) },
    { label: "Sadboi/Sadgirl Rating", value: Math.min(99, Math.round(avgPainIndex * 10.0)) },
    { label: "Healing Progress", value: Math.max(5, Math.min(20, Math.round((10 - score) * 2))) },
  ];

  // Pick the 2 shortest/punchiest predictions for the share card
  const topPredictions = [...result.behavioral_predictions]
    .sort((a, b) => a.length - b.length)
    .slice(0, 2);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("senti_history");
      const history = stored ? JSON.parse(stored) : [];
      history.push({ score: result.emotional_damage_score, threat_level: result.threat_level, headline: result.headline, mbti, timestamp: Date.now() });
      if (history.length > 10) history.shift();
      localStorage.setItem("senti_history", JSON.stringify(history));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDownload() {
    if (!shareCardRef.current) return;
    setDownloading(true);
    try {
      const blob = await captureCard(shareCardRef.current);
      const file = new File([blob], `senti-ai-results-${Date.now()}.png`, { type: "image/png" });

      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "My Senti.AI Emotional Damage Report" });
          return;
        } catch (shareErr) {
          if ((shareErr as DOMException)?.name === "AbortError") return;
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-8 pb-20 flex flex-col gap-5 sm:gap-6">

      {/* ============================================================
          HIDDEN SHARE CARD — compact, story-optimized (9:16 ratio)
          Rendered off-screen, captured by html-to-image
          ============================================================ */}
      <div
        ref={shareCardRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "540px",
          backgroundColor: "#0a0a0f",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          zIndex: -1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#555555", letterSpacing: "3px", textTransform: "uppercase" }}>
            SENTI.AI — EMOTIONAL DAMAGE REPORT
          </p>
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#e8e8e8", lineHeight: 1.3, margin: 0 }}>
            {result.headline}
          </p>
        </div>

        {/* Threat level badge */}
        <div style={{ textAlign: "center" }}>
          <span style={{
            fontFamily: "monospace",
            fontSize: "12px",
            letterSpacing: "3px",
            padding: "6px 16px",
            borderRadius: "9999px",
            border: `1px solid ${threatColor}`,
            color: threatColor,
            boxShadow: `0 0 16px ${threatColor}44`,
          }}>
            THREAT LEVEL: {result.threat_level}
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "10px" }}>
          {[
            { label: "EMOTIONAL DAMAGE", val: `${result.emotional_damage_score.toFixed(1)}/10` },
            { label: "DRUNK TEXT PROB", val: `${result.drunk_text_probability}%` },
            { label: "AVG PAIN INDEX", val: `${avgPainIndex}/10` },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "12px 8px",
              textAlign: "center",
            }}>
              <p style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: 700, color: "#ff3252", margin: 0 }}>
                {s.val}
              </p>
              <p style={{ fontFamily: "monospace", fontSize: "9px", color: "#555555", letterSpacing: "1px", textTransform: "uppercase", margin: "4px 0 0" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

        {/* Top predictions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {topPredictions.map((pred, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "12px 14px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
            }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#ff3252", flexShrink: 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p style={{ fontSize: "13px", color: "#e8e8e8", lineHeight: 1.5, margin: 0 }}>
                {pred}
              </p>
            </div>
          ))}
        </div>

        {/* Final verdict */}
        <div style={{
          background: "rgba(255,50,82,0.06)",
          border: "1px solid rgba(255,50,82,0.2)",
          borderRadius: "10px",
          padding: "14px",
        }}>
          <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#555555", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px" }}>
            FINAL VERDICT
          </p>
          <p style={{ fontSize: "13px", color: "#e8e8e8", lineHeight: 1.5, margin: 0 }}>
            {result.final_verdict}
          </p>
        </div>

        {/* Footer / CTA */}
        <div style={{ textAlign: "center", paddingTop: "8px" }}>
          <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#555555", letterSpacing: "3px", margin: 0 }}>
            —— SENTI.AI ——
          </p>
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: threatColor, margin: "6px 0 0" }}>
            Take yours → senti-ai-sooty.vercel.app
          </p>
        </div>
      </div>
      {/* ============================================================
          END HIDDEN SHARE CARD
          ============================================================ */}


      {/* 1. Header */}
      <Section index={0}>
        <div className="flex flex-col items-center text-center gap-3 pt-2 sm:pt-4 pb-2">
          <p className="font-mono text-[10px] sm:text-xs text-text-muted tracking-widest">SENTI.AI — EMOTIONAL DAMAGE REPORT</p>
          <GlitchText text={result.headline} as="h2" className="text-xl sm:text-3xl font-bold leading-tight" />
          <span
            className="font-mono text-[10px] sm:text-xs tracking-widest px-3 py-1.5 rounded-full border font-bold"
            style={{ color: threatColor, borderColor: threatColor, boxShadow: `0 0 12px ${threatColor}44` }}
          >
            THREAT LEVEL: {result.threat_level}
          </span>
        </div>
      </Section>

      {/* 2. Final Verdict — ON TOP for maximum impact */}
      <Section index={1}>
        <Card accentBorder>
          <SectionLabel>Final Verdict</SectionLabel>
          <p className="text-text-primary text-sm leading-relaxed mb-3">{result.final_verdict}</p>
          <p className="text-text-secondary text-sm italic mb-3">{result.recommended_action}</p>
          <p className="font-mono text-xs text-text-muted">{result.compatibility_warning}</p>
        </Card>
      </Section>

      {/* 3. Quick Stats Row — flex grid, no horizontal scroll */}
      <Section index={2}>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatBox label="Emotional Damage" value={result.emotional_damage_score} suffix="/10" animate />
          <StatBox label="Drunk Text Prob" value={result.drunk_text_probability} suffix="%" animate />
          <StatBox label="Avg Pain Index" value={avgPainIndex} suffix="/10" animate />
        </div>
      </Section>

      {/* 4. Ex-Stalking */}
      <Section index={3}>
        <Card>
          <SectionLabel>Ex-Stalking Frequency</SectionLabel>
          <p className="text-text-primary text-sm leading-relaxed">{result.ex_stalking_frequency}</p>
        </Card>
      </Section>

      {/* 5. Threat Assessment Meters */}
      <Section index={4}>
        <Card>
          <SectionLabel>Threat Assessment</SectionLabel>
          <div className="flex flex-col gap-4">
            {meters.map((m) => (
              <ThreatMeter key={m.label} label={m.label} value={m.value} color={m.label === "Healing Progress" ? "#00cc88" : threatColor} />
            ))}
          </div>
        </Card>
      </Section>

      {/* 6. Song Diagnosis */}
      <Section index={5}>
        <Card>
          <SectionLabel>Song Diagnosis</SectionLabel>
          <p className="text-text-primary text-sm leading-relaxed mb-4">{result.song_diagnosis}</p>
          {songs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {songs.map((s) => (
                <SongChip key={`${s.title}-${s.artist}`} song={s} showPainIndex={false} />
              ))}
            </div>
          )}
        </Card>
      </Section>

      {/* 7. Behavioral Predictions */}
      <Section index={6}>
        <SectionLabel>Behavioral Predictions</SectionLabel>
        <div className="flex flex-col gap-3">
          {result.behavioral_predictions.map((pred, i) => (
            <Card key={i}>
              <div className="flex gap-3">
                <span className="font-mono text-xs text-accent shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-text-primary text-sm leading-relaxed">{pred}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* 8. Toxic Traits + Red Flags */}
      <Section index={7}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <SectionLabel>Toxic Traits</SectionLabel>
            <ul className="flex flex-col gap-3">
              {result.toxic_traits.map((trait, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-primary leading-relaxed">
                  <span className="text-accent shrink-0">▸</span>{trait}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionLabel>Red Flags (For Future Jowa)</SectionLabel>
            <ul className="flex flex-col gap-3">
              {result.red_flags.map((flag, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-primary leading-relaxed">
                  <span className="text-red-500 shrink-0">⚑</span>{flag}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* 9. Actions */}
      <Section index={8}>
        <div className="flex flex-col gap-3 pt-2">
          {/* Primary share CTA */}
          <Button
            variant="primary"
            className="w-full text-sm sm:text-base font-semibold gap-2 py-4"
            disabled={downloading}
            onClick={handleDownload}
          >
            {downloading ? (
              <><span className="animate-pulse">⏳</span> Packaging your emotional damage...</>
            ) : (
              <><span>📸</span> Share to IG / FB Story</>
            )}
          </Button>

          <MatchChallenge
            profile={{ songs, mbti, attachmentStyle, loveLanguage, zodiac, result, timestamp: Date.now() }}
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="w-full text-xs sm:text-sm py-3"
              onClick={async () => {
                const nickname = prompt("Enter your nickname for the barkada:");
                if (!nickname) return;
                const res = await fetch("/api/barkada", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "create", nickname,
                    profile: { songs, mbti, attachmentStyle, loveLanguage, zodiac, result, timestamp: Date.now() },
                  }),
                });
                const data = await res.json();
                window.open(`/barkada/${data.id}`, "_blank");
              }}
            >
              Create Barkada
            </Button>

            <Button
              variant="secondary"
              className="w-full text-xs sm:text-sm py-3"
              onClick={async () => {
                const res = await fetch("/api/leaderboard", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ score: result.emotional_damage_score, mbti, attachmentStyle, zodiac, threat_level: result.threat_level }),
                });
                const data = await res.json();
                alert(`Submitted! You're ranked #${data.rank} out of ${data.total}`);
              }}
            >
              Post to Leaderboard
            </Button>
          </div>

          <Button variant="ghost" className="w-full text-sm" onClick={onRunAgain}>
            Run Again
          </Button>

          <a href="/history" className="block text-center text-text-muted font-mono text-xs hover:text-accent transition-colors">
            View History →
          </a>
        </div>
      </Section>
    </div>
  );
}
