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
        <BrandMark size={64} />
        <p className="font-display font-extrabold uppercase tracking-[0.05em] text-[16px] text-text-secondary">
          Loading the challenge…
        </p>
      </div>
    );
  } else if (step === "expired") {
    content = (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-6 px-6 text-center">
        <div className="relative paper px-8 py-6 -rotate-2">
          <p className="font-display font-black uppercase text-[40px] leading-none text-ink/30">Admit one</p>
          <span className="stamp absolute inset-0 m-auto h-fit w-fit text-[44px] -rotate-12 text-red">Void</span>
        </div>
        <h1 className="font-display font-black uppercase text-[44px] leading-[0.9] text-ink">Too late, bestie.</h1>
        <p className="text-[16px] text-text-secondary max-w-sm">
          This challenge expired or never existed. Maybe they gave up waiting for you. Charot. (Hindi charot.)
        </p>
        <LinkButton href="/">
          Take your own scan <IconArrowRight size={18} />
        </LinkButton>
      </div>
    );
  } else if (step === "intro" && challenger && tone) {
    content = (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-6 px-4 py-10 text-center max-w-md mx-auto">
        {/* Fight poster */}
        <div className="w-full border-[3px] border-ink bg-paper-light shadow-[var(--shadow-hard)]">
          <p className="bg-ink text-yellow font-display font-black uppercase tracking-[0.1em] text-[14px] py-1.5">
            Senti.AI presents · Isang gabi lang
          </p>
          <div className="px-4 pt-4 pb-5 flex flex-col gap-3">
            <h1 className="font-display font-black uppercase text-[46px] sm:text-[54px] leading-[0.86] text-ink">
              Someone thinks they&apos;re <span className="hl">more sawi</span>{" "}than you
            </h1>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-2">
              <div className="flex flex-col items-center gap-1">
                <span className="font-display font-black text-[54px] leading-none" style={{ color: tone.color }}>
                  {challenger.result.emotional_damage_score.toFixed(1)}
                </span>
                <span className="stamp text-[15px] -rotate-6" style={{ color: tone.color }}>
                  {tone.label}
                </span>
                <span className="font-mono text-[11px] text-text-muted mt-1" style={{ fontStretch: "87.5%" }}>
                  {challenger.mbti} · {ATTACHMENT_LABELS[challenger.attachmentStyle] ?? challenger.attachmentStyle}
                </span>
              </div>
              <span className="grid place-items-center w-14 h-14 rounded-full bg-red border-[3px] border-ink font-display font-black text-[24px] text-paper-light -rotate-6">
                VS
              </span>
              <div className="flex flex-col items-center gap-1">
                <span className="font-display font-black text-[54px] leading-none text-ink/25">?.?</span>
                <span className="font-display font-black uppercase text-[20px] leading-none text-ink">Ikaw</span>
                <span className="font-mono text-[11px] text-text-muted mt-1" style={{ fontStretch: "87.5%" }}>
                  TBD
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[16px] text-text-secondary">
          They took the Senti.AI scan. Take yours, and you&apos;ll both get a compatibility read.
          Tingnan natin kung sino talaga.
        </p>

        <Button onClick={() => goTo("songs")} className="w-full py-4">
          <IconHeart size={20} /> Accept the challenge
        </Button>
        <p className="font-hand text-[17px] text-text-muted">About 2 minutes. Libre. Mas mura pa sa therapy.</p>
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
            <p className="font-display font-black uppercase text-[30px] leading-[0.95] text-ink max-w-sm">
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
            <BrandMark size={72} />
            <p className="font-display font-black uppercase text-[30px] leading-[0.95] text-ink max-w-xs">
              Comparing your emotional wreckage…
            </p>
            <p className="font-hand text-[18px] text-text-secondary">Calculating who texts first after a fight.</p>
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
