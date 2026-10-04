"use client";

import { useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import Button from "@/components/ui/Button";
import { IconLock, IconArrowRight, IconEdit } from "@/components/ui/icons";
import { itemVariants } from "@/components/ui/motion";
import { MAX_CONTEXT_CHARS } from "@/lib/sanitize";
import { ATTACHMENT_LABELS, LOVE_LANGUAGE_SHORT } from "@/lib/theme";
import type { AssessmentDraft } from "@/hooks/useAssessmentDraft";

const MAX_CHARS = MAX_CONTEXT_CHARS;

/** Seven ruled lines (32px each) plus the textarea's top/bottom padding. */
const MIN_TEXTAREA_HEIGHT = 7 * 32 + 6 + 12;

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

  /**
   * The notebook page grows with what's written instead of scrolling inside
   * itself, so no line is ever half-hidden under the header. While typing at
   * the end, the page is also nudged up so the current line stays above the
   * pinned "Run my assessment" footer rather than disappearing behind it.
   */
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(MIN_TEXTAREA_HEIGHT, el.scrollHeight)}px`;

    if (document.activeElement !== el || el.selectionEnd !== el.value.length) return;
    const footer = document.querySelector<HTMLElement>("[data-step-footer]");
    const viewport = window.visualViewport?.height ?? window.innerHeight;
    const clearance = (footer?.offsetHeight ?? 140) + 12;
    const overlap = el.getBoundingClientRect().bottom - (viewport - clearance);
    if (overlap > 0) window.scrollBy({ top: overlap });
  }, [context]);

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

  const marginNote =
    trimmed === 0
      ? null
      : trimmed < 80
      ? "sige, tuloy mo…"
      : trimmed < 240
      ? "ooh. may tea."
      : "ok bestie, sapat na 'to (pero go lang)";

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
          <p className="flex items-center justify-center gap-1.5 text-[12.5px] text-text-muted">
            <IconLock size={14} tone="none" className="shrink-0" />
            Not stored, not shared — it goes to the analysis and nowhere else.
          </p>
        </div>
      }
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        {/* A page torn out of a notebook */}
        <div className="paper overflow-hidden" style={{ borderRadius: 4 }}>
          <div className="flex items-center justify-between gap-3 pl-[50px] pr-4 pt-3 pb-1">
            <span className="font-hand text-[19px] text-blue-ink leading-none">Drafts na hindi masesend</span>
            <span
              className="font-mono text-[11px] tabular-nums shrink-0"
              style={{
                color: isOverLimit ? "#be123c" : MAX_CHARS - length <= 100 ? "#b45309" : "#6c6680",
                fontStretch: "87.5%",
              }}
            >
              {length}/{MAX_CHARS}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            maxLength={MAX_CHARS + 10}
            rows={7}
            aria-label="What happened"
            placeholder="Start anywhere. Halimbawa: nag-break kami after 3 years, tapos nakita ko siya sa Spotify na may shared playlist with someone else. MU kami for 2 years, walang label…"
            className="ruled block w-full resize-none overflow-hidden pl-[50px] pr-4 pt-[6px] pb-[12px] text-base text-ink placeholder:text-text-muted/80 outline-none"
            style={{
              lineHeight: "32px",
              boxShadow: isOverLimit ? "inset 0 0 0 2px rgba(225,29,72,0.6)" : undefined,
            }}
          />
          {/* The margin note gets its own line under the writing — a fixed-height
              spacer, so it never sits on top of the text and nothing jumps
              when it appears or changes. */}
          <div
            aria-live="polite"
            className="flex items-center justify-end min-h-[36px] pl-[50px] pr-4 pb-1.5"
            style={{
              backgroundColor: "#fffdf6",
              backgroundImage:
                "linear-gradient(to right, transparent 38px, rgba(226,64,43,0.45) 38px 39.5px, transparent 39.5px)",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {marginNote && (
                <motion.span
                  key={marginNote}
                  initial={{ opacity: 0, y: 4, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: -2 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="font-hand text-[17px] leading-tight text-pink-ink text-right"
                >
                  {marginNote}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => insertPrompt(prompt)}
              className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-dashed border-ink/35 bg-paper-light/70 px-3 py-2 min-h-[40px] text-[14px] text-ink hover:border-ink hover:bg-yellow-soft transition-colors cursor-pointer"
            >
              <IconEdit size={15} />
              {prompt}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Answer summary — an itemised receipt, one tap back to anything */}
      <motion.section variants={itemVariants} className="lift">
        <div className="receipt px-5 pt-6 pb-7">
          <p className="text-center font-display font-black uppercase text-[20px] tracking-[0.08em] text-ink leading-none">
            Order summary
          </p>
          <p className="text-center font-mono text-[10.5px] text-text-muted mt-1.5" style={{ fontStretch: "87.5%" }}>
            Tap a line to change it
          </p>
          <div className="mt-3 border-t-2 border-dashed border-ink/30" />
          <div className="flex flex-col py-1">
            {summary.map((row) => (
              <button
                key={row.step}
                onClick={() => onEdit(row.step)}
                className="group w-full flex items-baseline gap-2 py-2.5 text-left cursor-pointer min-h-[44px]"
              >
                <span className="font-mono text-[12.5px] uppercase text-ink shrink-0" style={{ fontStretch: "87.5%" }}>
                  {row.label}
                </span>
                <span className="leader" />
                <span
                  className="font-mono text-[12.5px] text-ink text-right truncate max-w-[55%] group-hover:underline decoration-pink decoration-2 underline-offset-4"
                  style={{ fontStretch: "87.5%" }}
                >
                  {row.value}
                </span>
                <IconEdit size={16} className="text-ink shrink-0 self-center opacity-60 group-hover:opacity-100" />
              </button>
            ))}
          </div>
          <div className="border-t-2 border-dashed border-ink/30" />
          <p className="flex items-baseline gap-2 pt-3 font-mono text-[13px] font-bold text-ink" style={{ fontStretch: "87.5%" }}>
            TOTAL<span className="leader" />1 read, made to order
          </p>
        </div>
      </motion.section>
    </StepShell>
  );
}
