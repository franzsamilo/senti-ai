"use client";

import { motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import Button from "@/components/ui/Button";
import { IconLock, IconArrowRight } from "@/components/ui/icons";
import { itemVariants, softSpring } from "@/components/ui/motion";
import { MAX_CONTEXT_CHARS } from "@/lib/sanitize";

const MAX_CHARS = MAX_CONTEXT_CHARS;
const MIN_CHARS = 20;

/** Nudges shown under the field to unblock a staring-at-cursor moment. */
const PROMPTS = [
  "How did the last one end?",
  "What are you still not over?",
  "Who are you not texting right now?",
  "What do you keep re-reading?",
];

interface PersonalContextStepProps {
  onBack?: () => void;
  context: string;
  onContextChange: (context: string) => void;
  onNext: () => void;
}

export default function PersonalContextStep({
  onBack,
  context,
  onContextChange,
  onNext,
}: PersonalContextStepProps) {
  const length = context.length;
  const isOverLimit = length > MAX_CHARS;
  const trimmed = context.trim().length;
  const isTooShort = trimmed < MIN_CHARS;
  const progress = Math.min(1, trimmed / 240);

  return (
    <StepShell
      step={6}
      onBack={onBack}
      backLabel="Star sign"
      kicker="INTAKE"
      title="Ano nangyari sa'yo?"
      subtitle="The system reads context far better than it reads checkboxes. Situationship, breakup, the thing you keep re-reading at 2AM — the more it has, the more precise the assessment."
      footer={
        <div className="flex flex-col gap-3">
          <Button
            onClick={onNext}
            disabled={isTooShort || isOverLimit}
            className="w-full gap-2"
          >
            {isTooShort ? `${MIN_CHARS - trimmed} more characters` : "Run assessment"}
            {!isTooShort && !isOverLimit && <IconArrowRight size={18} />}
          </Button>
          <div className="flex items-center gap-2.5 text-xs rounded-lg px-3 py-2.5 border border-border-subtle bg-bg-card text-text-muted">
            <IconLock size={15} className="shrink-0" />
            <span>Not stored, not shared. It goes to the analysis and nowhere else.</span>
          </div>
        </div>
      }
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            maxLength={MAX_CHARS + 10}
            rows={9}
            placeholder={
              "Start anywhere. For example: nag-break kami after 3 years, tapos nakita ko siya sa Spotify ng ex niya na may shared playlist. MU kami for 2 years, walang label. Ngayon every gabi may isang kanta na paulit-ulit habang ini-scroll ko yung old convos namin."
            }
            className="w-full resize-none rounded-xl px-4 py-3.5 text-sm font-mono outline-none transition-colors placeholder:opacity-35"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${
                isOverLimit ? "rgba(255,50,82,0.6)" : "rgba(255,255,255,0.08)"
              }`,
              color: "#e8e8e8",
              lineHeight: 1.65,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = isOverLimit
                ? "rgba(255,50,82,0.8)"
                : "rgba(255,50,82,0.45)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isOverLimit
                ? "rgba(255,50,82,0.6)"
                : "rgba(255,255,255,0.08)";
            }}
          />

          {/* Depth meter — rewards writing more without stating a target */}
          <div className="absolute left-4 right-4 bottom-3 h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{ scaleX: progress }}
              transition={softSpring}
              style={{
                originX: 0,
                background: "linear-gradient(90deg, rgba(255,50,82,0.5), #ff3252)",
              }}
            />
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {PROMPTS.map((prompt) => (
              <span
                key={prompt}
                className="font-mono text-[11px] text-text-muted/70"
              >
                {prompt}
              </span>
            ))}
          </div>
          <span
            className="font-mono text-[11px] tabular-nums shrink-0"
            style={{
              color: isOverLimit
                ? "#ff3252"
                : MAX_CHARS - length <= 100
                ? "#ff8c00"
                : "#4a4a4a",
            }}
          >
            {length}/{MAX_CHARS}
          </span>
        </div>
      </motion.div>
    </StepShell>
  );
}
