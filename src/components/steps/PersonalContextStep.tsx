"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import Button from "@/components/ui/Button";
import { IconLock, IconArrowRight, IconEdit } from "@/components/ui/icons";
import { itemVariants, softSpring } from "@/components/ui/motion";
import { MAX_CONTEXT_CHARS } from "@/lib/sanitize";
import { ATTACHMENT_LABELS, LOVE_LANGUAGE_SHORT } from "@/lib/theme";
import type { AssessmentDraft } from "@/hooks/useAssessmentDraft";

const MAX_CHARS = MAX_CONTEXT_CHARS;

/** Tap to drop a starter line into the box — beats staring at a cursor. */
const PROMPTS = [
  "How did the last one end?",
  "What are you still not over?",
  "Who are you not texting right now?",
  "What do you keep re-reading?",
];

export type EditableStep = "songs" | "mbti" | "attachment" | "love-language" | "zodiac";

interface PersonalContextStepProps {
  onBack?: () => void;
  context: string;
  onContextChange: (context: string) => void;
  onNext: () => void;
  draft: AssessmentDraft;
  onEdit: (step: EditableStep) => void;
}

export default function PersonalContextStep({
  onBack,
  context,
  onContextChange,
  onNext,
  draft,
  onEdit,
}: PersonalContextStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const length = context.length;
  const isOverLimit = length > MAX_CHARS;
  const trimmed = context.trim().length;
  const progress = Math.min(1, trimmed / 240);

  function insertPrompt(prompt: string) {
    const prefix = context.trim() ? `${context.trimEnd()}\n\n` : "";
    onContextChange(`${prefix}${prompt} `);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  const summary: { step: EditableStep; label: string; value: string }[] = [
    { step: "songs", label: "Songs", value: `${draft.songs.length} tracks` },
    { step: "mbti", label: "Type", value: draft.mbti || "—" },
    {
      step: "attachment",
      label: "Attachment",
      value: draft.attachmentStyle ? ATTACHMENT_LABELS[draft.attachmentStyle] : "—",
    },
    {
      step: "love-language",
      label: "Love",
      value: draft.loveLanguage.map((l) => LOVE_LANGUAGE_SHORT[l]).join(", ") || "—",
    },
    {
      step: "zodiac",
      label: "Sign",
      value: draft.zodiac ? draft.zodiac[0].toUpperCase() + draft.zodiac.slice(1) : "—",
    },
  ];

  return (
    <StepShell
      step={6}
      onBack={onBack}
      backLabel="Sign"
      title="Ano'ng nangyari?"
      subtitle="Optional, pero ito ang pinaka-nakakatulong. The situationship, the breakup, the message you keep re-reading at 2AM — the more it has, the more precise (and personal) the read."
      footer={
        <div className="flex flex-col gap-2.5">
          <Button onClick={onNext} disabled={isOverLimit} className="w-full py-4">
            {trimmed > 0 ? "Run my assessment" : "Skip & run my assessment"}
            <IconArrowRight size={18} />
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-[12px] text-text-muted">
            <IconLock size={13} className="shrink-0" />
            Not stored, not shared — it goes to the analysis and nowhere else.
          </p>
        </div>
      }
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            maxLength={MAX_CHARS + 10}
            rows={7}
            aria-label="What happened"
            placeholder="Start anywhere. Halimbawa: nag-break kami after 3 years, tapos nakita ko siya sa Spotify na may shared playlist with someone else. MU kami for 2 years, walang label…"
            className="glass w-full resize-none rounded-2xl px-4 pt-3.5 pb-6 text-base text-text-primary placeholder:text-text-muted/80 outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(224,48,107,0.18)]"
            style={{
              lineHeight: 1.6,
              borderColor: isOverLimit ? "rgba(225,29,72,0.6)" : undefined,
            }}
          />

          {/* Depth meter — rewards writing more without stating a target */}
          <div className="absolute left-4 right-4 bottom-3 h-[3px] rounded-full bg-[rgba(74,30,82,0.07)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{ scaleX: progress }}
              transition={softSpring}
              style={{ originX: 0, background: "var(--dusk)" }}
            />
          </div>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => insertPrompt(prompt)}
                className="rounded-full px-3 py-1.5 text-[13px] text-text-secondary bg-white/70 border border-white hover:bg-white hover:text-accent-ink transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
          <span
            className="text-[12px] tabular-nums shrink-0 pt-1.5"
            style={{
              color: isOverLimit ? "#be123c" : MAX_CHARS - length <= 100 ? "#b45309" : "#7b6987",
            }}
          >
            {length}/{MAX_CHARS}
          </span>
        </div>
      </motion.div>

      {/* Answer summary — one tap back to anything that needs changing */}
      <motion.section variants={itemVariants} className="flex flex-col gap-2">
        <p className="text-[15px] font-semibold text-text-primary">Your answers</p>
        <div className="glass rounded-2xl divide-y divide-border-subtle overflow-hidden">
          {summary.map((row) => (
            <button
              key={row.step}
              onClick={() => onEdit(row.step)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/60 transition-colors cursor-pointer"
            >
              <span className="text-[13px] text-text-muted w-[84px] shrink-0">{row.label}</span>
              <span className="text-[14px] font-medium text-text-primary flex-1 truncate">{row.value}</span>
              <IconEdit size={15} className="text-text-muted shrink-0" />
            </button>
          ))}
        </div>
      </motion.section>
    </StepShell>
  );
}
