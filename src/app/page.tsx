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

import { useStepHistory } from "@/hooks/useStepHistory";
import { useStepDirection } from "@/hooks/useStepDirection";
import { isDraftComplete, useAssessmentDraft } from "@/hooks/useAssessmentDraft";
import {
  appendHistory,
  loadLastReport,
  saveLastReport,
  type ReportSnapshot,
} from "@/lib/reportStore";
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
  const restoredRef = useRef(false);

  /**
   * Once the saved draft is loaded, decide where the user should land: back
   * on the question they were on before a refresh, or the landing page.
   */
  useEffect(() => {
    if (!hydrated || restoredRef.current) return;
    restoredRef.current = true;

    const last = loadLastReport();
    // Browser-only state (storage, history) — can't be read during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastReport(last);

    // A refresh keeps the history entry but resets React state; put the user
    // back where that entry says they were.
    const tagged = window.history.state?.sentiStep as Step | undefined;
    if (isQuestionStep(tagged)) {
      setStep(tagged);
    } else if (tagged === "results" && last) {
      setReport(last);
      setStep("results");
    }
  }, [hydrated]);

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
    // The offline template isn't a read of this person — keep it out of the
    // deterioration tracker so a retry doesn't log two "scans".
    if (!result.degraded) appendHistory(snapshot);
    goTo("results");
  }

  function startOver() {
    reset();
    setReport(null);
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
        onRetry={() => goToQuestion("loading")}
        onHome={() => goTo("landing")}
      />
    );
  } else if (step === "blocked") {
    content = <RateLimitBlock />;
  }

  return (
    <main className="relative min-h-screen overflow-x-clip">
      {/* Each step opens at the top: scroll resets once the old step has
          left and before the new one appears, so nothing visibly jumps. */}
      <AnimatePresence
        mode="wait"
        custom={direction}
        initial={false}
        onExitComplete={() => window.scrollTo({ top: 0 })}
      >
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
