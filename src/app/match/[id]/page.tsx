"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import NeuralNetworkBg from "@/components/NeuralNetworkBg";
import GlitchText from "@/components/GlitchText";
import SongInputStep from "@/components/steps/SongInputStep";
import MbtiStep from "@/components/steps/MbtiStep";
import AttachmentStep from "@/components/steps/AttachmentStep";
import LoveLanguageStep from "@/components/steps/LoveLanguageStep";
import ZodiacStep from "@/components/steps/ZodiacStep";
import AnalysisLoader from "@/components/AnalysisLoader";
import MatchReport from "@/components/MatchReport";
import Button from "@/components/ui/Button";

import {
  Song,
  AttachmentStyle,
  LoveLanguage,
  ProfileResult,
  UserProfile,
  MatchResult,
} from "@/lib/types";

type Step =
  | "fetch"
  | "intro"
  | "songs"
  | "mbti"
  | "attachment"
  | "love-language"
  | "zodiac"
  | "loading"
  | "match-loading"
  | "report"
  | "expired";

const THREAT_COLORS: Record<string, string> = {
  CRITICAL: "#ff0040",
  SEVERE: "#ff3252",
  ELEVATED: "#ff8c00",
  MODERATE: "#ffd000",
  LOW: "#00cc88",
};

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const transition = { type: "spring" as const, stiffness: 320, damping: 30 };

export default function MatchPage() {
  const params = useParams();
  const matchId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [step, setStep] = useState<Step>("fetch");
  const [challengerProfile, setChallengerProfile] = useState<UserProfile | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [profileA, setProfileA] = useState<UserProfile | null>(null);
  const [profileB, setProfileB] = useState<UserProfile | null>(null);

  // User B's wizard state
  const [songs, setSongs] = useState<Song[]>([]);
  const [mbti, setMbti] = useState<string>("");
  const [attachmentStyle, setAttachmentStyle] = useState<AttachmentStyle>("anxious");
  const [loveLanguage, setLoveLanguage] = useState<LoveLanguage[]>([]);
  const [zodiac, setZodiac] = useState<string>("");
  const [userBResult, setUserBResult] = useState<ProfileResult | null>(null);

  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Fetch match on mount
  useEffect(() => {
    if (!matchId) {
      setStep("expired");
      return;
    }

    async function fetchMatch() {
      try {
        const res = await fetch(`/api/match?id=${matchId}`);
        if (!res.ok) {
          setStep("expired");
          return;
        }
        const data = await res.json();

        // Already completed — show results directly
        if (data.completed && data.matchResult) {
          setProfileA(data.profileA);
          setProfileB(data.profileB);
          setMatchResult(data.matchResult);
          setStep("report");
          return;
        }

        setChallengerProfile(data.profileA);
        setStep("intro");
      } catch {
        setStep("expired");
      }
    }

    fetchMatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUserBResult(result: ProfileResult) {
    setUserBResult(result);

    const profileBData: UserProfile = {
      songs,
      mbti,
      attachmentStyle,
      loveLanguage,
      zodiac,
      result,
      timestamp: Date.now(),
    };

    setStep("match-loading");
    setMatchLoading(true);
    setMatchError(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          id: matchId,
          profileB: profileBData,
        }),
      });

      if (res.status === 429) {
        // Rate limited — show a gentle message but still attempt to show something
        setMatchError("rate_limited");
        setMatchLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Match failed");

      const data = await res.json();
      setProfileA(data.profileA);
      setProfileB(profileBData);
      setMatchResult(data.matchResult);
      setStep("report");
    } catch {
      setMatchError("error");
    } finally {
      setMatchLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      <NeuralNetworkBg />

      <main className="relative z-10 w-full max-w-[680px] mx-auto">
        <AnimatePresence mode="wait">

          {/* Fetching */}
          {step === "fetch" && (
            <motion.div
              key="fetch"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center justify-center min-h-screen gap-4 px-4"
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderTopColor: "#ff3252",
                  borderRightColor: "rgba(255,50,82,0.4)",
                }}
              />
              <p className="font-mono text-xs" style={{ color: "#555555" }}>
                Loading challenge data...
              </p>
            </motion.div>
          )}

          {/* Expired / Not found */}
          {step === "expired" && (
            <motion.div
              key="expired"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center justify-center min-h-screen gap-5 sm:gap-6 px-4 text-center"
            >
              <span
                className="font-mono text-xs tracking-[0.2em] px-3 py-1 rounded-full"
                style={{
                  background: "rgba(255,50,82,0.08)",
                  border: "1px solid rgba(255,50,82,0.2)",
                  color: "#ff3252",
                }}
              >
                LINK EXPIRED
              </span>
              <GlitchText
                text="Too late, bestie."
                as="h1"
                className="text-2xl font-bold"
              />
              <p className="text-sm max-w-sm" style={{ color: "#888888" }}>
                This challenge link has expired or doesn&apos;t exist. Maybe they gave up on waiting for you. Charot. (Hindi charot.)
              </p>
              <Button
                onClick={() => {
                  if (typeof window !== "undefined") window.location.href = "/";
                }}
                variant="secondary"
              >
                Take Your Own Analysis →
              </Button>
            </motion.div>
          )}

          {/* Intro */}
          {step === "intro" && challengerProfile && (
            <motion.div
              key="intro"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center justify-center min-h-screen gap-5 sm:gap-6 px-4 text-center py-10 sm:py-16"
            >
              <span
                className="font-mono text-xs tracking-[0.2em] px-3 py-1 rounded-full"
                style={{
                  background: "rgba(255,50,82,0.08)",
                  border: "1px solid rgba(255,50,82,0.2)",
                  color: "#ff3252",
                }}
              >
                CHALLENGE RECEIVED
              </span>

              <GlitchText
                text="Someone challenged you."
                as="h1"
                className="text-2xl md:text-3xl font-bold"
              />

              <p className="text-sm max-w-sm" style={{ color: "#888888" }}>
                They went through Senti.AI&apos;s emotional damage assessment. Now it&apos;s your turn.
                Tingnan natin kung sino mas sawi.
              </p>

              {/* Challenger's threat level */}
              <div
                className="rounded-xl border p-5 flex flex-col items-center gap-3 w-full max-w-xs"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <span
                  className="font-mono text-xs tracking-wider"
                  style={{ color: "#555555" }}
                >
                  THEIR STATS
                </span>

                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold"
                  style={{
                    background: `${THREAT_COLORS[challengerProfile.result.threat_level] ?? "#ff3252"}12`,
                    border: `1px solid ${THREAT_COLORS[challengerProfile.result.threat_level] ?? "#ff3252"}35`,
                    color: THREAT_COLORS[challengerProfile.result.threat_level] ?? "#ff3252",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: THREAT_COLORS[challengerProfile.result.threat_level] ?? "#ff3252" }}
                  />
                  THREAT LEVEL: {challengerProfile.result.threat_level}
                </div>

                <div className="flex items-baseline gap-1">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: THREAT_COLORS[challengerProfile.result.threat_level] ?? "#ff3252",
                    }}
                  >
                    {challengerProfile.result.emotional_damage_score.toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: "#555555" }}>/10 damage</span>
                </div>

                <p className="text-xs" style={{ color: "#555555" }}>
                  Can you beat that?
                </p>
              </div>

              <Button onClick={() => setStep("songs")} className="w-full max-w-xs">
                Accept Challenge →
              </Button>

              <p className="text-xs font-mono" style={{ color: "#555555" }}>
                2 free analyses per browser. Mahal ang therapy, libre 'to.
              </p>
            </motion.div>
          )}

          {/* Step: Songs */}
          {step === "songs" && (
            <motion.div
              key="songs"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <SongInputStep
                songs={songs}
                onSongsChange={setSongs}
                onNext={() => setStep("mbti")}
              />
            </motion.div>
          )}

          {/* Step: MBTI */}
          {step === "mbti" && (
            <motion.div
              key="mbti"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <MbtiStep
                selected={mbti}
                onSelect={(value) => {
                  setMbti(value);
                  setStep("attachment");
                }}
              />
            </motion.div>
          )}

          {/* Step: Attachment */}
          {step === "attachment" && (
            <motion.div
              key="attachment"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <AttachmentStep
                selected={attachmentStyle}
                onSelect={(value) => {
                  setAttachmentStyle(value);
                  setStep("love-language");
                }}
              />
            </motion.div>
          )}

          {/* Step: Love Language */}
          {step === "love-language" && (
            <motion.div
              key="love-language"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <LoveLanguageStep
                selected={loveLanguage}
                onSelect={setLoveLanguage}
                onNext={() => setStep("zodiac")}
              />
            </motion.div>
          )}

          {/* Step: Zodiac */}
          {step === "zodiac" && (
            <motion.div
              key="zodiac"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <ZodiacStep
                selected={zodiac}
                onSelect={(value) => {
                  setZodiac(value);
                  setStep("loading");
                }}
              />
            </motion.div>
          )}

          {/* Step: Loading (individual analysis) */}
          {step === "loading" && (
            <motion.div
              key="loading"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <AnalysisLoader
                songs={songs}
                mbti={mbti}
                attachmentStyle={attachmentStyle}
                loveLanguage={loveLanguage}
                zodiac={zodiac}
                onComplete={handleUserBResult}
                onBlocked={() => {
                  // If rate limited on the individual analysis, still try to complete match
                  // with a fallback profile so User B isn't left hanging
                  const fallbackResult: ProfileResult = {
                    headline: "Rate limited na — pero sige, subukan pa rin.",
                    threat_level: "ELEVATED",
                    drunk_text_probability: 60,
                    ex_stalking_frequency: "Often enough",
                    emotional_damage_score: 7.0,
                    behavioral_predictions: ["Nagamit na ang lahat ng free analyses."],
                    toxic_traits: ["Using all free analyses"],
                    red_flags: ["Desperate for emotional damage assessment"],
                    song_diagnosis: "Unknown",
                    final_verdict: "Hindi sapat ang 2 analyses para sa iyo.",
                    recommended_action: "Touch grass. Come back tomorrow.",
                    compatibility_warning: "Proceed with caution.",
                  };
                  handleUserBResult(fallbackResult);
                }}
              />
            </motion.div>
          )}

          {/* Match loading */}
          {step === "match-loading" && (
            <motion.div
              key="match-loading"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center"
            >
              {matchLoading && (
                <>
                  <div
                    className="w-16 h-16 rounded-full border-2 border-transparent animate-spin"
                    style={{
                      borderTopColor: "#ff3252",
                      borderRightColor: "rgba(255,50,82,0.4)",
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <p className="font-medium" style={{ color: "#e8e8e8" }}>
                      Computing your compatibility damage...
                    </p>
                    <p className="font-mono text-xs" style={{ color: "#555555" }}>
                      Comparing emotional wreckage levels...
                    </p>
                  </div>
                </>
              )}

              {matchError && (
                <div className="flex flex-col gap-4 items-center max-w-sm">
                  <p style={{ color: "#ff3252" }} className="font-medium">
                    {matchError === "rate_limited"
                      ? "Rate limit reached. Come back tomorrow for your free scans."
                      : "Something went wrong. The universe is against this match."}
                  </p>
                  <Button
                    onClick={() => {
                      if (typeof window !== "undefined") window.location.href = "/";
                    }}
                    variant="secondary"
                  >
                    Go Home
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Report */}
          {step === "report" && matchResult && profileA && profileB && (
            <motion.div
              key="report"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <MatchReport
                matchResult={matchResult}
                profileA={profileA}
                profileB={profileB}
              />
              <div className="px-4 pb-12 flex flex-col gap-3 max-w-[680px] mx-auto">
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") window.location.href = "/";
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Take Your Own Analysis
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
