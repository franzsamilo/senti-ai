"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import NeuralNetworkBg from "@/components/NeuralNetworkBg";
import LandingStep from "@/components/steps/LandingStep";
import SongInputStep from "@/components/steps/SongInputStep";
import MbtiStep from "@/components/steps/MbtiStep";
import AttachmentStep from "@/components/steps/AttachmentStep";
import LoveLanguageStep from "@/components/steps/LoveLanguageStep";
import ZodiacStep from "@/components/steps/ZodiacStep";
import PersonalContextStep from "@/components/steps/PersonalContextStep";
import AnalysisLoader from "@/components/AnalysisLoader";
import ResultsDashboard from "@/components/ResultsDashboard";
import RateLimitBlock from "@/components/RateLimitBlock";

import { Song, AttachmentStyle, LoveLanguage, ProfileResult } from "@/lib/types";
import { sanitizePersonalContext } from "@/lib/sanitize";

type Step =
  | "landing"
  | "songs"
  | "mbti"
  | "attachment"
  | "love-language"
  | "zodiac"
  | "personal-context"
  | "loading"
  | "results"
  | "blocked";

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const transition = { type: "spring" as const, stiffness: 320, damping: 30 };

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [songs, setSongs] = useState<Song[]>([]);
  const [mbti, setMbti] = useState<string>("");
  const [attachmentStyle, setAttachmentStyle] = useState<AttachmentStyle>("anxious");
  const [loveLanguage, setLoveLanguage] = useState<LoveLanguage[]>([]);
  const [zodiac, setZodiac] = useState<string>("");
  const [personalContext, setPersonalContext] = useState<string>("");
  const [result, setResult] = useState<ProfileResult | null>(null);

  function handleMbtiSelect(value: string) {
    setMbti(value);
    setStep("attachment");
  }

  function handleAttachmentSelect(value: AttachmentStyle) {
    setAttachmentStyle(value);
    setStep("love-language");
  }

  function handleLoveLanguageNext() {
    setStep("zodiac");
  }

  function handleZodiacSelect(value: string) {
    setZodiac(value);
    setStep("personal-context");
  }

  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      <NeuralNetworkBg />

      <main className="relative z-10 w-full max-w-[680px] mx-auto">
        <AnimatePresence mode="wait">
          {step === "landing" && (
            <motion.div
              key="landing"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <LandingStep onStart={() => setStep("songs")} />
            </motion.div>
          )}

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
                onNext={() => {
                  // Background-classify any songs that were manually entered (mood === "unknown")
                  const unknownSongs = songs.filter((s) => s.mood === "unknown");
                  if (unknownSongs.length > 0) {
                    fetch("/api/classify-songs", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ songs: unknownSongs }),
                    })
                      .then((res) => res.json())
                      .then((classified) => {
                        setSongs((prev) =>
                          prev.map((s) => {
                            const match = classified.find(
                              (c: { title: string; artist: string; mood: string; painIndex: number }) =>
                                c.title.toLowerCase() === s.title.toLowerCase() &&
                                c.artist.toLowerCase() === s.artist.toLowerCase()
                            );
                            return match
                              ? { ...s, mood: match.mood, painIndex: match.painIndex }
                              : s;
                          })
                        );
                      })
                      .catch(() => {}); // Silent failure — fallback values are fine
                  }
                  setStep("mbti");
                }}
              />
            </motion.div>
          )}

          {step === "mbti" && (
            <motion.div
              key="mbti"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <MbtiStep selected={mbti} onSelect={handleMbtiSelect} />
            </motion.div>
          )}

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
                onSelect={handleAttachmentSelect}
              />
            </motion.div>
          )}

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
                onNext={handleLoveLanguageNext}
              />
            </motion.div>
          )}

          {step === "zodiac" && (
            <motion.div
              key="zodiac"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <ZodiacStep selected={zodiac} onSelect={handleZodiacSelect} />
            </motion.div>
          )}

          {step === "personal-context" && (
            <motion.div
              key="personal-context"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <PersonalContextStep
                context={personalContext}
                onContextChange={setPersonalContext}
                onNext={() => {
                  setPersonalContext(sanitizePersonalContext(personalContext));
                  setStep("loading");
                }}
              />
            </motion.div>
          )}

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
                personalContext={personalContext}
                onComplete={(r: ProfileResult) => {
                  setResult(r);
                  setStep("results");
                }}
                onBlocked={() => setStep("blocked")}
              />
            </motion.div>
          )}

          {step === "results" && result && (
            <motion.div
              key="results"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <ResultsDashboard
                result={result}
                songs={songs}
                mbti={mbti}
                attachmentStyle={attachmentStyle}
                loveLanguage={loveLanguage}
                zodiac={zodiac}
                onRunAgain={() => {
                  setSongs([]);
                  setMbti("");
                  setAttachmentStyle("anxious");
                  setLoveLanguage([]);
                  setZodiac("");
                  setPersonalContext("");
                  setResult(null);
                  setStep("landing");
                }}
              />
            </motion.div>
          )}

          {step === "blocked" && (
            <motion.div
              key="blocked"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <RateLimitBlock />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
