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
import AnalysisLoader from "@/components/AnalysisLoader";
import ResultsDashboard from "@/components/ResultsDashboard";
import RateLimitBlock from "@/components/RateLimitBlock";

import { Song, AttachmentStyle, LoveLanguage, ProfileResult } from "@/lib/types";

type Step =
  | "landing"
  | "songs"
  | "mbti"
  | "attachment"
  | "love-language"
  | "zodiac"
  | "loading"
  | "results"
  | "blocked";

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const transition = { type: "spring", stiffness: 320, damping: 30 };

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [songs, setSongs] = useState<Song[]>([]);
  const [mbti, setMbti] = useState<string>("");
  const [attachmentStyle, setAttachmentStyle] = useState<AttachmentStyle>("anxious");
  const [loveLanguage, setLoveLanguage] = useState<LoveLanguage>("words");
  const [zodiac, setZodiac] = useState<string>("");
  const [result, setResult] = useState<ProfileResult | null>(null);

  function handleMbtiSelect(value: string) {
    setMbti(value);
    setStep("attachment");
  }

  function handleAttachmentSelect(value: AttachmentStyle) {
    setAttachmentStyle(value);
    setStep("love-language");
  }

  function handleLoveLanguageSelect(value: LoveLanguage) {
    setLoveLanguage(value);
    setStep("zodiac");
  }

  function handleZodiacSelect(value: string) {
    setZodiac(value);
    setStep("loading");
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
                onNext={() => setStep("mbti")}
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
                onSelect={handleLoveLanguageSelect}
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
                  setLoveLanguage("words");
                  setZodiac("");
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
