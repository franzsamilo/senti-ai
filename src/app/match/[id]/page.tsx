"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import QuestionSteps, { QUESTION_STEPS, isQuestionStep, type QuestionStep } from "@/components/QuestionSteps";
import AnalysisLoader from "@/components/AnalysisLoader";
import MatchReport from "@/components/MatchReport";
import Button, { LinkButton } from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import { IconArrowRight, IconHeart } from "@/components/ui/icons";
import { pageTransition, pageVariants } from "@/components/ui/motion";
import { useStepHistory } from "@/hooks/useStepHistory";
import { useStepDirection } from "@/hooks/useStepDirection";
import { isDraftComplete, useAssessmentDraft } from "@/hooks/useAssessmentDraft";
import { ATTACHMENT_LABELS, threatTone } from "@/lib/theme";
import type { MatchResult, ProfileResult, UserProfile } from "@/lib/types";

type Step = "fetch" | "intro" | QuestionStep | "loading" | "match-loading" | "report" | "expired";

const ORDER: readonly Step[] = ["fetch", "intro", ...QUESTION_STEPS, "loading", "match-loading", "report", "expired"];
const NON_RETURNABLE = ["fetch", "loading", "match-loading", "expired"] as const;

export default function MatchPage() {
  const params = useParams();
  const matchId = (Array.isArray(params.id) ? params.id[0] : params.id) ?? "";

  const [step, setStep] = useState<Step>("fetch");
  const { goTo, goBack } = useStepHistory<Step>(step, setStep, { replaceFor: NON_RETURNABLE });
  const direction = useStepDirection(step, ORDER);
  const { draft, setDraft, hydrated } = useAssessmentDraft(`senti_match_${matchId}`);

  const [challenger, setChallenger] = useState<UserProfile | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [profileA, setProfileA] = useState<UserProfile | null>(null);
  const [profileB, setProfileB] = useState<UserProfile | null>(null);
  const [matchError, setMatchError] = useState<"rate_limited" | "error" | null>(null);

  useEffect(() => {
    if (!matchId) {
      setStep("expired");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/match?id=${encodeURIComponent(matchId)}`);
        if (cancelled) return;
        if (!res.ok) return setStep("expired");
        const data = await res.json();

        // Already completed — show the report directly.
        if (data.completed && data.matchResult) {
          setProfileA(data.profileA);
          setProfileB(data.profileB);
          setMatchResult(data.matchResult);
          setStep("report");
          return;
        }
        setChallenger(data.profileA);
        setStep("intro");
      } catch {
        if (!cancelled) setStep("expired");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  async function completeMatch(result: ProfileResult) {
    if (!draft.attachmentStyle) return;
    const me: UserProfile = {
      songs: draft.songs,
      mbti: draft.mbti,
      attachmentStyle: draft.attachmentStyle,
      loveLanguage: draft.loveLanguage,
      zodiac: draft.zodiac,
      result,
      timestamp: Date.now(),
    };

    goTo("match-loading");
    setMatchError(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", id: matchId, profileB: me }),
      });
      if (res.status === 429) return setMatchError("rate_limited");
      if (!res.ok) throw new Error("Match failed");
      const data = await res.json();
      setProfileA(data.profileA);
      setProfileB(me);
      setMatchResult(data.matchResult);
      goTo("report");
    } catch {
      setMatchError("error");
    }
  }

  function goToQuestion(next: QuestionStep | "loading") {
    if (next === "loading" && !isDraftComplete(draft)) return goTo("songs");
    goTo(next);
  }

  const tone = challenger ? threatTone(challenger.result.threat_level) : null;
  let content: React.ReactNode = null;

  if (step === "fetch" || !hydrated) {
    content = (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-4">
        <BrandMark size={52} />
        <p className="text-[14px] text-text-secondary">Loading the challenge…</p>
      </div>
    );
  } else if (step === "expired") {
    content = (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-5 px-6 text-center">
        <span className="text-[13px] font-semibold rounded-full px-3 py-1 bg-accent-soft text-accent-ink">Link expired</span>
        <h1 className="text-[32px] font-extrabold text-text-primary">Too late, bestie.</h1>
        <p className="text-[15px] text-text-secondary max-w-sm">
          This challenge expired or never existed. Maybe they gave up waiting for you. Charot. (Hindi charot.)
        </p>
        <LinkButton href="/">
          Take your own scan <IconArrowRight size={18} />
        </LinkButton>
      </div>
    );
  } else if (step === "intro" && challenger && tone) {
    content = (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-6 px-5 py-12 text-center max-w-md mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-white px-3.5 py-1.5 text-[13px] text-text-secondary">
          <IconHeart size={14} className="text-accent" /> Challenge received
        </span>
        <h1 className="text-[36px] sm:text-[44px] font-extrabold leading-[1.05] text-text-primary">
          Someone thinks they&apos;re <span className="text-dusk">more sawi</span>{" "}than you.
        </h1>
        <p className="text-[15px] text-text-secondary">
          They took Senti.AI&apos;s emotional damage scan. Take yours, and you&apos;ll both get a compatibility
          roast. Tingnan natin kung sino talaga.
        </p>

        <div className="glass rounded-3xl p-5 w-full flex items-center gap-4 text-left">
          <div className="flex flex-col gap-1 flex-1">
            <span
              className="self-start text-[12px] font-semibold rounded-full px-2.5 py-1"
              style={{ color: tone.ink, background: tone.soft }}
            >
              Threat level: {tone.label}
            </span>
            <span className="text-[13px] text-text-muted mt-1">
              {challenger.mbti} · {ATTACHMENT_LABELS[challenger.attachmentStyle] ?? challenger.attachmentStyle}
            </span>
          </div>
          <div className="text-right">
            <p className="font-display text-[40px] font-extrabold leading-none" style={{ color: tone.ink }}>
              {challenger.result.emotional_damage_score.toFixed(1)}
            </p>
            <p className="text-[12px] text-text-muted">/10 damage</p>
          </div>
        </div>

        <Button onClick={() => goTo("songs")} className="w-full py-4">
          Accept the challenge <IconArrowRight size={18} />
        </Button>
        <p className="text-[12px] text-text-muted">About 2 minutes. Libre. Mas mura pa sa therapy.</p>
      </div>
    );
  } else if (isQuestionStep(step)) {
    content = <QuestionSteps step={step} draft={draft} setDraft={setDraft} goTo={goToQuestion} goBack={goBack} />;
  } else if (step === "loading" && draft.attachmentStyle && !matchError) {
    content = (
      <AnalysisLoader
        songs={draft.songs}
        mbti={draft.mbti}
        attachmentStyle={draft.attachmentStyle}
        loveLanguage={draft.loveLanguage}
        zodiac={draft.zodiac}
        personalContext={draft.personalContext}
        onComplete={completeMatch}
        onBlocked={() => setMatchError("rate_limited")}
      />
    );
  } else if (step === "match-loading" || (step === "loading" && matchError)) {
    content = (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-5 px-6 text-center">
        {matchError ? (
          <>
            <p className="font-display text-[22px] font-bold text-text-primary max-w-sm">
              {matchError === "rate_limited"
                ? "You've used today's free scans. Balik bukas for the match."
                : "Something went wrong. The universe is against this match."}
            </p>
            <LinkButton href="/" variant="secondary">
              Go home
            </LinkButton>
          </>
        ) : (
          <>
            <BrandMark size={56} />
            <p className="font-display text-[22px] font-bold text-text-primary">Comparing your emotional wreckage…</p>
            <p className="text-[14px] text-text-secondary">Calculating who texts first after a fight.</p>
          </>
        )}
      </div>
    );
  } else if (step === "report" && matchResult && profileA && profileB) {
    content = (
      <>
        <MatchReport matchResult={matchResult} profileA={profileA} profileB={profileB} />
        <div className="px-4 pb-14 max-w-[680px] mx-auto">
          <LinkButton href="/" variant="secondary" className="w-full">
            Take your own full scan
          </LinkButton>
        </div>
      </>
    );
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
