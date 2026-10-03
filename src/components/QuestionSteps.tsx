"use client";

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import SongInputStep from "@/components/steps/SongInputStep";
import MbtiStep from "@/components/steps/MbtiStep";
import AttachmentStep from "@/components/steps/AttachmentStep";
import LoveLanguageStep from "@/components/steps/LoveLanguageStep";
import ZodiacStep from "@/components/steps/ZodiacStep";
import PersonalContextStep from "@/components/steps/PersonalContextStep";
import type { AssessmentDraft } from "@/hooks/useAssessmentDraft";
import { sanitizePersonalContext } from "@/lib/sanitize";
import type { Mood } from "@/lib/types";

export const QUESTION_STEPS = [
  "songs",
  "mbti",
  "attachment",
  "love-language",
  "zodiac",
  "personal-context",
] as const;

export type QuestionStep = (typeof QUESTION_STEPS)[number];

export function isQuestionStep(value: unknown): value is QuestionStep {
  return QUESTION_STEPS.includes(value as QuestionStep);
}

/** Long enough to see the selection land, short enough to feel instant. */
const ADVANCE_DELAY_MS = 260;

interface QuestionStepsProps {
  step: QuestionStep;
  draft: AssessmentDraft;
  setDraft: Dispatch<SetStateAction<AssessmentDraft>>;
  goTo: (step: QuestionStep | "loading") => void;
  goBack: () => void;
}

/**
 * The six questions, shared by the main flow and the friend-challenge flow so
 * both get the same steps, the same shortcuts and the same fixes.
 */
export default function QuestionSteps({ step, draft, setDraft, goTo, goBack }: QuestionStepsProps) {
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  function advanceSoon(next: QuestionStep) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goTo(next), ADVANCE_DELAY_MS);
  }

  const set = <K extends keyof AssessmentDraft>(key: K, value: AssessmentDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  /**
   * Songs typed in by hand arrive as mood "unknown". Classify them in the
   * background while the user answers the next questions; by the time they
   * reach the end, the analysis gets real moods. Failure is silent — the
   * neutral defaults are fine.
   */
  function classifyUnknownSongs() {
    const unknown = draft.songs.filter((s) => s.mood === "unknown");
    if (unknown.length === 0) return;
    fetch("/api/classify-songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songs: unknown.map(({ title, artist }) => ({ title, artist })) }),
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((classified: { title: string; artist: string; mood: Mood; painIndex: number }[]) => {
        if (!Array.isArray(classified)) return;
        setDraft((prev) => ({
          ...prev,
          songs: prev.songs.map((s) => {
            if (s.mood !== "unknown") return s;
            const match = classified.find(
              (c) =>
                c.title.toLowerCase() === s.title.toLowerCase() &&
                c.artist.toLowerCase() === s.artist.toLowerCase()
            );
            return match ? { ...s, mood: match.mood, painIndex: match.painIndex } : s;
          }),
        }));
      })
      .catch(() => {});
  }

  switch (step) {
    case "songs":
      return (
        <SongInputStep
          onBack={goBack}
          songs={draft.songs}
          onSongsChange={(songs) => set("songs", songs)}
          onNext={() => {
            classifyUnknownSongs();
            goTo("mbti");
          }}
        />
      );
    case "mbti":
      return (
        <MbtiStep
          onBack={goBack}
          selected={draft.mbti}
          onSelect={(mbti) => {
            set("mbti", mbti);
            advanceSoon("attachment");
          }}
        />
      );
    case "attachment":
      return (
        <AttachmentStep
          onBack={goBack}
          selected={draft.attachmentStyle}
          onSelect={(style) => {
            set("attachmentStyle", style);
            advanceSoon("love-language");
          }}
        />
      );
    case "love-language":
      return (
        <LoveLanguageStep
          onBack={goBack}
          selected={draft.loveLanguage}
          onSelect={(langs) => set("loveLanguage", langs)}
          onNext={() => goTo("zodiac")}
        />
      );
    case "zodiac":
      return (
        <ZodiacStep
          onBack={goBack}
          selected={draft.zodiac}
          onSelect={(zodiac) => {
            set("zodiac", zodiac);
            advanceSoon("personal-context");
          }}
        />
      );
    case "personal-context":
      return (
        <PersonalContextStep
          onBack={goBack}
          context={draft.personalContext}
          onContextChange={(context) => set("personalContext", context)}
          draft={draft}
          onEdit={(target) => goTo(target)}
          onNext={() => {
            set("personalContext", sanitizePersonalContext(draft.personalContext));
            goTo("loading");
          }}
        />
      );
  }
}
