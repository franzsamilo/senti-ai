"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import Button from "@/components/ui/Button";
import { IconArrowRight, IconSparkle } from "@/components/ui/icons";
import { gridVariants, itemVariants, spring } from "@/components/ui/motion";

/** Grouped by temperament so the grid reads as a taxonomy, not 16 loose chips. */
const GROUPS: { label: string; types: string[] }[] = [
  { label: "Analysts", types: ["INTJ", "INTP", "ENTJ", "ENTP"] },
  { label: "Diplomats", types: ["INFJ", "INFP", "ENFJ", "ENFP"] },
  { label: "Sentinels", types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"] },
  { label: "Explorers", types: ["ISTP", "ISFP", "ESTP", "ESFP"] },
];

/** One-line recognition aids — how the type shows up in the talking stage. */
const VIBES: Record<string, string> = {
  INTJ: "may 5-year plan pati sa crush",
  INTP: "overthinks, under-texts",
  ENTJ: "relationship = quarterly review",
  ENTP: "nag-aaway para lang sa fun",
  INFJ: "alam na ang ending sa umpisa pa lang",
  INFP: "main character ng bawat hugot",
  ENFJ: "therapist ng buong barkada",
  ENFP: "in love every two weeks",
  ISTJ: "may spreadsheet ng reply time",
  ISFJ: "nag-aalaga kahit 'di hinihingi",
  ESTJ: "may house rules ang landian",
  ESFJ: "kilala na agad ng tita mo",
  ISTP: "seen. that's the reply.",
  ISFP: "playlist ang confession",
  ESTP: "first move, zero plan",
  ESFP: "life of every inuman",
};

/** The four either/or questions behind a type, for people who never took one. */
const AXES: { letters: [string, string]; options: [string, string] }[] = [
  { letters: ["E", "I"], options: ["Recharge with people", "Recharge alone"] },
  { letters: ["S", "N"], options: ["Trust what's real", "Trust the vibe"] },
  { letters: ["T", "F"], options: ["Decide with logic", "Decide with feelings"] },
  { letters: ["J", "P"], options: ["Plan everything", "Bahala na"] },
];

interface MbtiStepProps {
  onBack?: () => void;
  selected: string;
  onSelect: (mbti: string) => void;
}

export default function MbtiStep({ onBack, selected, onSelect }: MbtiStepProps) {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [axes, setAxes] = useState<(string | null)[]>([null, null, null, null]);
  const built = axes.every(Boolean) ? axes.join("") : null;

  return (
    <StepShell
      step={2}
      onBack={onBack}
      backLabel="Songs"
      title="What's your type?"
      subtitle="Your MBTI. Tap the one you'd defend in an argument — or build it below if you've never taken the test."
    >
      <motion.div variants={gridVariants} className="flex flex-col gap-5">
        {GROUPS.map((group) => (
          <motion.div key={group.label} variants={itemVariants} className="flex flex-col gap-2">
            <p className="text-[13px] font-medium text-text-muted">{group.label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {group.types.map((type) => {
                const isSelected = selected === type;
                return (
                  <motion.button
                    key={type}
                    onClick={() => onSelect(type)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={spring}
                    aria-pressed={isSelected}
                    className="relative flex flex-col items-start gap-0.5 rounded-2xl px-3.5 py-3 text-left cursor-pointer overflow-hidden min-h-[68px] border"
                    style={{
                      borderColor: isSelected ? "transparent" : "rgba(255,255,255,0.9)",
                      background: isSelected ? "transparent" : "rgba(255,255,255,0.72)",
                      boxShadow: isSelected ? "var(--shadow-glow)" : "var(--shadow-card)",
                    }}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="mbti-selection"
                        transition={spring}
                        className="absolute inset-0 -z-10"
                        style={{ background: "var(--dusk-button)" }}
                      />
                    )}
                    <span
                      className="font-display font-bold text-[17px] tracking-wide"
                      style={{ color: isSelected ? "#fff" : "#2a1834" }}
                    >
                      {type}
                    </span>
                    <span
                      className="text-[11.5px] leading-snug"
                      style={{ color: isSelected ? "rgba(255,255,255,0.85)" : "#7b6987" }}
                    >
                      {VIBES[type]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Type builder ── */}
      <motion.div variants={itemVariants} className="glass rounded-2xl overflow-hidden">
        <button
          onClick={() => setBuilderOpen((v) => !v)}
          aria-expanded={builderOpen}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer"
        >
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-[rgba(139,63,217,0.1)] text-accent-secondary">
            <IconSparkle size={18} />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-text-primary">Don&apos;t know your type?</span>
            <span className="block text-[13px] text-text-muted">Four quick choices. Close enough for a roast.</span>
          </span>
          <motion.span animate={{ rotate: builderOpen ? 90 : 0 }} className="text-text-muted">
            <IconArrowRight size={18} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {builderOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 flex flex-col gap-2.5">
                {AXES.map((axis, i) => (
                  <div key={axis.letters.join("")} className="grid grid-cols-2 gap-2">
                    {axis.options.map((label, j) => {
                      const letter = axis.letters[j];
                      const on = axes[i] === letter;
                      return (
                        <button
                          key={letter}
                          onClick={() => setAxes((prev) => prev.map((v, k) => (k === i ? letter : v)))}
                          aria-pressed={on}
                          className={`rounded-xl px-3 py-2.5 text-[13.5px] text-left border transition-colors cursor-pointer ${
                            on
                              ? "bg-accent-soft border-accent/40 text-accent-ink font-semibold"
                              : "bg-white border-border-subtle text-text-secondary hover:border-accent/30"
                          }`}
                        >
                          <span className="font-mono text-[12px] mr-1.5 opacity-70">{letter}</span>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ))}
                <Button
                  disabled={!built}
                  onClick={() => built && onSelect(built)}
                  className="mt-1 w-full"
                >
                  {built ? (
                    <>
                      I&apos;m {built} <IconArrowRight size={18} />
                    </>
                  ) : (
                    `${axes.filter(Boolean).length}/4 answered`
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </StepShell>
  );
}
