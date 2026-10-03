"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LandingStep from "@/components/steps/LandingStep";
import QuestionSteps, {
  QUESTION_STEPS,
  isQuestionStep,
  type QuestionStep,
} from "@/components/QuestionSteps";
import AnalysisLoader from "@/components/AnalysisLoader";
import ResultsDashboard from "@/components/ResultsDashboard";
import RateLimitBlock from "@/components/RateLimitBlock";
import { pageTransition, pageVariants } from "@/components/ui/motion";
import { PENDING_BARKADA_KEY } from "@/components/ResultActions";

import { useStepHistory } from "@/hooks/useStepHistory";
import { useStepDirection } from "@/hooks/useStepDirection";
import { isDraftComplete, useAssessmentDraft } from "@/hooks/useAssessmentDraft";
import {
  appendHistory,
  loadLastReport,
  saveLastReport,
  type ReportSnapshot,
} from "@/lib/reportStore";
import { SPOTIFY_ERROR_KEY, SPOTIFY_FRESH_KEY, SPOTIFY_TRACKS_KEY } from "@/lib/spotify";
import type { ProfileResult } from "@/lib/types";

type Step = "landing" | QuestionStep | "loading" | "results" | "blocked";

const ORDER: readonly Step[] = ["landing", ...QUESTION_STEPS, "loading", "results", "blocked"];

/**
 * Reached automatically rather than chosen — they never enter the history
 * stack, so Back skips past them to the last question actually answered.
 */
const NON_RETURNABLE_STEPS = ["loading", "blocked"] as const;

const DRAFT_KEY = "senti_draft";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const { goTo, goBack } = useStepHistory<Step>(step, setStep, {
    replaceFor: NON_RETURNABLE_STEPS,
  });
  const direction = useStepDirection(step, ORDER);
  const { draft, setDraft, reset, hydrated } = useAssessmentDraft(DRAFT_KEY);

  const [report, setReport] = useState<ReportSnapshot | null>(null);
  const [lastReport, setLastReport] = useState<ReportSnapshot | null>(null);
  const [spotifyError, setSpotifyError] = useState(false);
  const [pendingBarkada, setPendingBarkada] = useState<string | null>(null);
  const restoredRef = useRef(false);

  /**
   * Once the saved draft is loaded, decide where the user should land:
   * straight onto the song list after Spotify, back on the question they
   * were on before a refresh, or the landing page.
   */
  useEffect(() => {
    if (!hydrated || restoredRef.current) return;
    restoredRef.current = true;

    const last = loadLastReport();
    // Browser-only state (storage, history) — can't be read during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastReport(last);

    try {
      // Arrived from a barkada group's "take your scan" link: remember the
      // group for the results page and go straight to the first question.
      const params = new URLSearchParams(window.location.search);
      const barkada = params.get("barkada");
      if (barkada && /^[a-z0-9]{4,16}$/i.test(barkada)) {
        sessionStorage.setItem(PENDING_BARKADA_KEY, barkada);
        params.delete("barkada");
        const query = params.toString();
        window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
        setPendingBarkada(barkada);
        goTo("songs");
        return;
      }
      setPendingBarkada(sessionStorage.getItem(PENDING_BARKADA_KEY));

      if (sessionStorage.getItem(SPOTIFY_FRESH_KEY)) {
        sessionStorage.removeItem(SPOTIFY_FRESH_KEY);
        goTo("songs");
        return;
      }
      if (sessionStorage.getItem(SPOTIFY_ERROR_KEY)) {
        sessionStorage.removeItem(SPOTIFY_ERROR_KEY);
        setSpotifyError(true);
        return;
      }
    } catch {}

    // A refresh keeps the history entry but resets React state; put the user
    // back where that entry says they were.
    const tagged = window.history.state?.sentiStep as Step | undefined;
    if (isQuestionStep(tagged)) {
      setStep(tagged);
    } else if (tagged === "results" && last) {
      setReport(last);
      setStep("results");
    }
  }, [hydrated, goTo]);

  const hasDraft =
    draft.songs.length > 0 || Boolean(draft.mbti) || draft.attachmentStyle !== null;

  function handleResult(result: ProfileResult) {
    if (!draft.attachmentStyle) return;
    const snapshot: ReportSnapshot = {
      result,
      songs: draft.songs,
      mbti: draft.mbti,
      attachmentStyle: draft.attachmentStyle,
      loveLanguage: draft.loveLanguage,
      zodiac: draft.zodiac,
      createdAt: Date.now(),
    };
    setReport(snapshot);
    setLastReport(snapshot);
    saveLastReport(snapshot);
    appendHistory(snapshot);
    goTo("results");
  }

  function startOver() {
    reset();
    setReport(null);
    try {
      sessionStorage.removeItem(SPOTIFY_TRACKS_KEY);
    } catch {}
    goTo("songs");
  }

  function goToQuestion(next: QuestionStep | "loading") {
    // Never start a paid analysis on a half-finished draft (e.g. after
    // jumping around with the answer summary) — send them to the gap.
    if (next === "loading" && !isDraftComplete(draft)) {
      const gap: QuestionStep =
        draft.songs.length < 3
          ? "songs"
          : !draft.mbti
          ? "mbti"
          : !draft.attachmentStyle
          ? "attachment"
          : draft.loveLanguage.length === 0
          ? "love-language"
          : "zodiac";
      goTo(gap);
      return;
    }
    goTo(next);
  }

  let content: React.ReactNode = null;

  if (step === "landing") {
    content = (
      <LandingStep
        onStart={() => goTo("songs")}
        hasDraft={hasDraft}
        spotifyError={spotifyError}
        onOpenLastReport={
          lastReport
            ? () => {
                setReport(lastReport);
                goTo("results");
              }
            : undefined
        }
      />
    );
  } else if (isQuestionStep(step)) {
    content = (
      <QuestionSteps
        step={step}
        draft={draft}
        setDraft={setDraft}
        goTo={goToQuestion}
        goBack={goBack}
      />
    );
  } else if (step === "loading" && draft.attachmentStyle) {
    content = (
      <AnalysisLoader
        songs={draft.songs}
        mbti={draft.mbti}
        attachmentStyle={draft.attachmentStyle}
        loveLanguage={draft.loveLanguage}
        zodiac={draft.zodiac}
        personalContext={draft.personalContext}
        onComplete={handleResult}
        onBlocked={() => goTo("blocked")}
      />
    );
  } else if (step === "results" && (report ?? lastReport)) {
    // Back/forward can land here with nothing in memory; the saved copy of
    // the latest report stands in.
    const shown = (report ?? lastReport)!;
    content = (
      <ResultsDashboard
        key={shown.createdAt}
        result={shown.result}
        songs={shown.songs}
        mbti={shown.mbti}
        attachmentStyle={shown.attachmentStyle}
        loveLanguage={shown.loveLanguage}
        zodiac={shown.zodiac}
        onRunAgain={startOver}
        onEditAnswers={() => goTo("personal-context")}
        onHome={() => goTo("landing")}
        pendingBarkadaId={pendingBarkada}
      />
    );
  } else if (step === "blocked") {
    content = <RateLimitBlock />;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={step}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={pageTransition}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
