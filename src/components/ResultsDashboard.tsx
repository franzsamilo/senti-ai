"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Song, AttachmentStyle, LoveLanguage, ProfileResult, ThreatLevel } from "@/lib/types";
import GlitchText from "@/components/GlitchText";
import StatBox from "@/components/ui/StatBox";
import ThreatMeter from "@/components/ui/ThreatMeter";
import SongChip from "@/components/ui/SongChip";
import Button from "@/components/ui/Button";
import MatchChallenge from "@/components/MatchChallenge";
import {
  IconFlag,
  IconSearch,
  IconSignal,
  IconShare,
  IconTarget,
} from "@/components/ui/icons";
import { itemVariants, listVariants, spring } from "@/components/ui/motion";
import { captureCard } from "@/lib/shareImage";

/** Songs shown in the diagnosis card before the list collapses. */
const SONG_PREVIEW_COUNT = 10;

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

function Card({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5"
      style={{
        background: accent ? "rgba(255,50,82,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${accent ? "rgba(255,50,82,0.28)" : "rgba(255,255,255,0.07)"}`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * A numbered section header with a rule running to the edge — the visual
 * grammar of a filed report rather than a stack of cards.
 */
function ReportSection({
  index,
  label,
  icon,
  children,
}: {
  index: number;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section variants={itemVariants} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tabular-nums text-accent tracking-[0.18em]">
          {String(index).padStart(2, "0")}
        </span>
        {icon && <span className="text-text-muted shrink-0">{icon}</span>}
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-text-secondary whitespace-nowrap">
          {label}
        </span>
        <span className="h-px flex-1 bg-border-subtle" />
      </div>
      {children}
    </motion.section>
  );
}

/** Labelled sub-value inside a card. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-text-muted">
        {label}
      </span>
      <span className="text-sm text-text-secondary leading-relaxed">{children}</span>
    </div>
  );
}

/** Stable per-report identifier — deterministic so it survives re-renders. */
function makeCaseId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `CASE #SA-${Math.abs(hash).toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;
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
  const [showAllSongs, setShowAllSongs] = useState(false);

  // Frozen at mount so the header doesn't reshuffle on every re-render.
  const caseId = useMemo(
    () => makeCaseId(`${mbti}${attachmentStyle}${zodiac}${result.headline}`),
    [mbti, attachmentStyle, zodiac, result.headline]
  );
  const timestamp = useMemo(
    () =>
      new Date().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

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
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-2xl mx-auto px-4 pt-8 pb-20 flex flex-col gap-6 sm:gap-7"
    >

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

      {/* ══════════════════════════════════════════════
          REPORT HEADER — the dossier frame. The content is
          absurd; the presentation is not. The joke lands harder
          against a page that looks like it means it.
          ══════════════════════════════════════════════ */}
      <motion.header variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-text-muted">
          <span className="inline-flex items-center gap-2 text-accent-success">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-success" />
            Assessment complete
          </span>
          <span>{caseId}</span>
        </div>

        <div className="flex flex-col items-center text-center gap-3.5 py-1">
          <p className="font-mono text-[10px] text-text-muted tracking-[0.25em] uppercase">
            Emotional Damage Report
          </p>
          <GlitchText
            text={result.headline}
            as="h2"
            className="text-[22px] sm:text-3xl font-bold leading-[1.2] tracking-tight"
          />
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...spring, delay: 0.25 }}
            className="font-mono text-[11px] tracking-[0.18em] px-3.5 py-2 rounded-full border font-bold"
            style={{
              color: threatColor,
              borderColor: threatColor,
              background: `${threatColor}12`,
              boxShadow: `0 0 18px ${threatColor}33`,
            }}
          >
            THREAT LEVEL: {result.threat_level}
          </motion.span>
        </div>

        {/* Subject line — the detail that makes it read as a real record */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border-subtle bg-border-subtle">
          {[
            { label: "Type", value: mbti || "—" },
            { label: "Attachment", value: attachmentStyle },
            { label: "Sign", value: zodiac || "—" },
            { label: "Sample", value: `${songs.length} tracks` },
          ].map((field) => (
            <div key={field.label} className="bg-bg-primary px-3 py-2.5 flex flex-col gap-1">
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-text-muted">
                {field.label}
              </span>
              <span className="font-mono text-[12px] text-text-secondary uppercase truncate">
                {field.value}
              </span>
            </div>
          ))}
        </div>

        <p className="font-mono text-[10px] text-text-muted/70 text-center tracking-wide">
          Generated {timestamp} · Findings are final
        </p>

        {/* The offline template is generic by nature. Say so rather than
            passing it off as a real read of this specific person. */}
        {result.degraded && (
          <div
            className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
            style={{
              background: "rgba(255,140,0,0.07)",
              border: "1px solid rgba(255,140,0,0.28)",
              color: "#ff8c00",
            }}
          >
            <IconTarget size={14} className="shrink-0 mt-0.5" />
            <span>
              <strong className="font-semibold">Offline assessment.</strong> The
              analysis engine was unreachable, so this is the generic profile —
              not a read of your specific answers. Run it again in a moment.
            </span>
          </div>
        )}
      </motion.header>

      {/* 01 — Final verdict, kept on top for impact */}
      <ReportSection index={1} label="Final Verdict" icon={<IconTarget size={14} />}>
        <Card accent>
          <p className="text-text-primary text-[15px] leading-relaxed">{result.final_verdict}</p>
          <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col gap-3">
            <Field label="Recommended action">{result.recommended_action}</Field>
            <Field label="Compatibility warning">{result.compatibility_warning}</Field>
          </div>
        </Card>
      </ReportSection>

      {/* 02 — Key metrics */}
      <ReportSection index={2} label="Key Metrics" icon={<IconSignal size={14} />}>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatBox label="Emotional Damage" value={result.emotional_damage_score} suffix="/10" animate />
          <StatBox label="Drunk Text Prob" value={result.drunk_text_probability} suffix="%" animate />
          <StatBox label="Avg Pain Index" value={avgPainIndex} suffix="/10" animate />
        </div>
      </ReportSection>

      {/* 03 — Surveillance pattern */}
      <ReportSection index={3} label="Surveillance Pattern" icon={<IconSearch size={14} />}>
        <Card>
          <p className="text-text-primary text-sm leading-relaxed">{result.ex_stalking_frequency}</p>
        </Card>
      </ReportSection>

      {/* 04 — Threat meters */}
      <ReportSection index={4} label="Threat Assessment" icon={<IconTarget size={14} />}>
        <Card>
          <div className="flex flex-col gap-4">
            {meters.map((m) => (
              <ThreatMeter
                key={m.label}
                label={m.label}
                value={m.value}
                color={m.label === "Healing Progress" ? "#00cc88" : threatColor}
              />
            ))}
          </div>
        </Card>
      </ReportSection>

      {/* 05 — Song diagnosis */}
      <ReportSection index={5} label="Listening Analysis" icon={<IconSignal size={14} />}>
        <Card>
          <p className="text-text-primary text-sm leading-relaxed">{result.song_diagnosis}</p>
          {songs.length > 0 && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border-subtle">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-text-muted">
                Evidence · {songs.length} tracks
              </p>
              <div className="flex flex-wrap gap-2">
                {(showAllSongs ? songs : songs.slice(0, SONG_PREVIEW_COUNT)).map((s, i) => (
                  <SongChip key={`${s.title}-${s.artist}-${i}`} song={s} showPainIndex />
                ))}
              </div>
              {songs.length > SONG_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllSongs((v) => !v)}
                  className="self-start font-mono text-[11px] text-accent hover:underline cursor-pointer"
                >
                  {showAllSongs
                    ? "[ show less ]"
                    : `[ +${songs.length - SONG_PREVIEW_COUNT} more ]`}
                </button>
              )}
            </div>
          )}
        </Card>
      </ReportSection>

      {/* 06 — Behavioral predictions */}
      <ReportSection index={6} label="Behavioral Predictions" icon={<IconTarget size={14} />}>
        <div className="flex flex-col gap-2.5">
          {result.behavioral_predictions.map((pred, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ ...spring, delay: i * 0.06 }}
            >
              <Card>
                <div className="flex gap-3.5">
                  <span
                    className="font-mono text-[11px] shrink-0 mt-0.5 tabular-nums"
                    style={{ color: threatColor }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-text-primary text-sm leading-relaxed">{pred}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ReportSection>

      {/* 07 — Traits and flags */}
      <ReportSection index={7} label="Risk Factors" icon={<IconFlag size={14} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-text-muted mb-3">
              Toxic traits
            </p>
            <ul className="flex flex-col gap-3">
              {result.toxic_traits.map((trait, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-text-primary leading-relaxed">
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
                  {trait}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-text-muted mb-3">
              Red flags · for future jowa
            </p>
            <ul className="flex flex-col gap-3">
              {result.red_flags.map((flag, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-text-primary leading-relaxed">
                  <IconFlag size={13} className="shrink-0 mt-1 text-threat-critical" />
                  {flag}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </ReportSection>

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 pt-3">
        <div className="h-px w-full bg-border-subtle" />

        <Button
          variant="primary"
          className="w-full gap-2 py-4"
          disabled={downloading}
          onClick={handleDownload}
        >
          {downloading ? (
            <>Packaging your report...</>
          ) : (
            <>
              <IconShare size={18} />
              Share to IG / FB Story
            </>
          )}
        </Button>

        <MatchChallenge
          profile={{ songs, mbti, attachmentStyle, loveLanguage, zodiac, result, timestamp: Date.now() }}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            className="w-full text-[13px] py-3"
            onClick={async () => {
              const nickname = prompt("Enter your nickname for the barkada:");
              if (!nickname) return;
              const res = await fetch("/api/barkada", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "create",
                  nickname,
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
            className="w-full text-[13px] py-3"
            onClick={async () => {
              const res = await fetch("/api/leaderboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  score: result.emotional_damage_score,
                  mbti,
                  attachmentStyle,
                  zodiac,
                  threat_level: result.threat_level,
                }),
              });
              const data = await res.json();
              alert(`Submitted! You're ranked #${data.rank} out of ${data.total}`);
            }}
          >
            Post to Leaderboard
          </Button>
        </div>

        <Button variant="ghost" className="w-full text-sm" onClick={onRunAgain}>
          Run again
        </Button>

        <a
          href="/history"
          className="block text-center text-text-muted font-mono text-[11px] tracking-wide hover:text-accent transition-colors py-2"
        >
          View assessment history →
        </a>
      </motion.div>
    </motion.div>
  );
}
