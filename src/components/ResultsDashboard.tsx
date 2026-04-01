"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Song, AttachmentStyle, LoveLanguage, ProfileResult, ThreatLevel } from "@/lib/types";
import GlitchText from "@/components/GlitchText";
import StatBox from "@/components/ui/StatBox";
import ThreatMeter from "@/components/ui/ThreatMeter";
import SongChip from "@/components/ui/SongChip";
import Button from "@/components/ui/Button";
import ShareActions from "@/components/ShareActions";
import MatchChallenge from "@/components/MatchChallenge";

interface ResultsDashboardProps {
  result: ProfileResult;
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage;
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

function Section({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      {children}
    </motion.div>
  );
}

function Card({ children, accentBorder = false }: { children: React.ReactNode; accentBorder?: boolean }) {
  return (
    <div
      className={`bg-bg-card rounded-xl p-5 ${
        accentBorder
          ? "border border-accent/40"
          : "border border-border-subtle"
      }`}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

export default function ResultsDashboard({
  result,
  songs,
  mbti,
  attachmentStyle,
  loveLanguage,
  zodiac,
  onRunAgain,
}: ResultsDashboardProps) {
  const threatColor = THREAT_COLORS[result.threat_level];
  const avgPainIndex =
    songs.length > 0
      ? parseFloat(
          (songs.reduce((sum, s) => sum + s.painIndex, 0) / songs.length).toFixed(1)
        )
      : 0;

  const score = result.emotional_damage_score;

  // Derived meter values — weighted off damage score
  const meters = [
    { label: "Emotional Instability", value: Math.min(99, Math.round(score * 10.5)) },
    { label: "Toxic Trait Concentration", value: Math.min(99, Math.round(score * 9.2)) },
    { label: "Delulu Index", value: Math.min(99, Math.round(score * 11.0)) },
    { label: "Sadboi/Sadgirl Rating", value: Math.min(99, Math.round(avgPainIndex * 10.0)) },
    { label: "Healing Progress", value: Math.max(5, Math.min(20, Math.round((10 - score) * 2))) },
  ];

  // Save to localStorage history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("senti_history");
      const history = stored ? JSON.parse(stored) : [];
      history.push({
        score: result.emotional_damage_score,
        threat_level: result.threat_level,
        headline: result.headline,
        mbti,
        timestamp: Date.now(),
      });
      if (history.length > 10) history.shift();
      localStorage.setItem("senti_history", JSON.stringify(history));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-16 flex flex-col gap-6">
      {/* 1. Header */}
      <Section index={0}>
        <div className="flex flex-col items-center text-center gap-3 pt-6 pb-2">
          <GlitchText
            text={result.headline}
            as="h2"
            className="text-2xl sm:text-3xl font-bold leading-tight max-w-xl"
          />
          <span
            className="font-mono text-xs tracking-widest px-3 py-1.5 rounded-full border font-bold"
            style={{
              color: threatColor,
              borderColor: threatColor,
              boxShadow: `0 0 12px ${threatColor}44`,
            }}
          >
            THREAT LEVEL: {result.threat_level}
          </span>
        </div>
      </Section>

      {/* 2. Quick Stats Row */}
      <Section index={1}>
        <div className="flex gap-3 overflow-x-auto pb-1 justify-center sm:justify-start">
          <StatBox
            label="Emotional Damage"
            value={result.emotional_damage_score}
            suffix="/10"
            animate
          />
          <StatBox
            label="Drunk Text Prob"
            value={result.drunk_text_probability}
            suffix="%"
            animate
          />
          <StatBox
            label="Avg Pain Index"
            value={avgPainIndex}
            suffix="/10"
            animate
          />
        </div>
      </Section>

      {/* 3. Ex-Stalking */}
      <Section index={2}>
        <Card>
          <SectionLabel>Ex-Stalking Frequency</SectionLabel>
          <p className="text-text-primary text-sm leading-relaxed">
            {result.ex_stalking_frequency}
          </p>
        </Card>
      </Section>

      {/* 4. Threat Assessment Meters */}
      <Section index={3}>
        <Card>
          <SectionLabel>Threat Assessment</SectionLabel>
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
      </Section>

      {/* 5. Song Diagnosis */}
      <Section index={4}>
        <Card>
          <SectionLabel>Song Diagnosis</SectionLabel>
          <p className="text-text-primary text-sm leading-relaxed mb-4">
            {result.song_diagnosis}
          </p>
          {songs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {songs.map((s) => (
                <SongChip key={`${s.title}-${s.artist}`} song={s} showPainIndex />
              ))}
            </div>
          )}
        </Card>
      </Section>

      {/* 6. Behavioral Predictions */}
      <Section index={5}>
        <SectionLabel>Behavioral Predictions</SectionLabel>
        <div className="flex flex-col gap-3">
          {result.behavioral_predictions.map((pred, i) => (
            <Card key={i}>
              <div className="flex gap-3">
                <span className="font-mono text-xs text-accent shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-text-primary text-sm leading-relaxed">{pred}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* 7. Toxic Traits + Red Flags */}
      <Section index={6}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <SectionLabel>Toxic Traits</SectionLabel>
            <ul className="flex flex-col gap-3">
              {result.toxic_traits.map((trait, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-primary leading-relaxed">
                  <span className="text-accent shrink-0">▸</span>
                  {trait}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionLabel>Red Flags (For Future Jowa)</SectionLabel>
            <ul className="flex flex-col gap-3">
              {result.red_flags.map((flag, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-primary leading-relaxed">
                  <span className="text-red-500 shrink-0">⚑</span>
                  {flag}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* 8. Final Verdict */}
      <Section index={7}>
        <Card accentBorder>
          <SectionLabel>Final Verdict</SectionLabel>
          <p className="text-text-primary text-sm leading-relaxed mb-3">
            {result.final_verdict}
          </p>
          <p className="text-text-secondary text-sm italic mb-3">
            {result.recommended_action}
          </p>
          <p className="font-mono text-xs text-text-muted">
            {result.compatibility_warning}
          </p>
        </Card>
      </Section>

      {/* 9. Actions */}
      <Section index={8}>
        <div className="flex flex-col gap-3">
          <ShareActions result={result} songs={songs} />

          <MatchChallenge
            profile={{
              songs,
              mbti,
              attachmentStyle,
              loveLanguage,
              zodiac,
              result,
              timestamp: Date.now(),
            }}
          />

          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={async () => {
              const nickname = prompt("Enter your nickname for the barkada group:");
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
            Create Barkada Group
          </Button>

          <Button
            variant="ghost"
            className="w-full text-sm"
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

          <Button variant="secondary" className="w-full" onClick={onRunAgain}>
            Run Again
          </Button>

          <a
            href="/history"
            className="block text-center text-text-muted font-mono text-xs hover:text-accent transition-colors"
          >
            View History →
          </a>
        </div>
      </Section>
    </div>
  );
}
