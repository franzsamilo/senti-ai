"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import Button from "@/components/ui/Button";
import { IconArrowRight, IconSparkle } from "@/components/ui/icons";
import { gridVariants, itemVariants } from "@/components/ui/motion";

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

/**
 * The type picker is a videoke remote: an LCD readout that echoes whichever
 * key you're on, and sixteen keycaps that sit proud of the plate and travel
 * down when pressed. Grouped by temperament, the way remotes group their
 * buttons, so it reads as a layout rather than sixteen loose chips.
 */
export default function MbtiStep({ onBack, selected, onSelect }: MbtiStepProps) {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [axes, setAxes] = useState<(string | null)[]>([null, null, null, null]);
  const [hovered, setHovered] = useState<string | null>(null);
  const built = axes.every(Boolean) ? axes.join("") : null;
  const shown = hovered ?? (selected || null);

  return (
    <StepShell
      step={2}
      onBack={onBack}
      backLabel="Songs"
      title="What's your type?"
      subtitle="Your MBTI. Press the one you'd defend in an argument — or build it below if you've never taken the test."
    >
      <motion.div
        variants={gridVariants}
        className="rounded-[18px] border-2 border-ink bg-paper-dark p-3 sm:p-4 flex flex-col gap-4"
        style={{ boxShadow: "inset 0 2px 0 rgba(255,255,255,0.6), var(--shadow-paper)" }}
      >
        {/* LCD readout */}
        <motion.div
          variants={itemVariants}
          aria-live="polite"
          className="rounded-[8px] border-2 border-ink px-3.5 py-2.5 flex items-center gap-3 min-h-[64px]"
          style={{
            background: "linear-gradient(180deg, #c9d7a3, #b9c98f)",
            boxShadow: "inset 0 3px 6px rgba(29,25,50,0.25)",
            color: "#26301a",
          }}
        >
          <span className="font-dot font-black text-[34px] leading-none tracking-[0.04em] w-[86px] shrink-0">
            {shown ?? "????"}
          </span>
          <span className="font-mono text-[11.5px] leading-snug" style={{ fontStretch: "87.5%" }}>
            {shown ? VIBES[shown] : "Pindutin ang type mo."}
          </span>
        </motion.div>

        {GROUPS.map((group) => (
          <motion.div key={group.label} variants={itemVariants} className="flex flex-col gap-2">
            <p className="flex items-center gap-2 font-display font-extrabold uppercase tracking-[0.08em] text-[12px] text-ink/70">
              <span className="h-[2px] w-3 bg-ink/40" />
              {group.label}
              <span className="h-[2px] flex-1 bg-ink/20" />
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {group.types.map((type) => {
                const isSelected = selected === type;
                return (
                  <motion.button
                    key={type}
                    onClick={() => onSelect(type)}
                    onHoverStart={() => setHovered(type)}
                    onHoverEnd={() => setHovered((h) => (h === type ? null : h))}
                    initial={false}
                    animate={{
                      y: isSelected ? 3 : 0,
                      boxShadow: isSelected ? "0 1px 0 #1d1932" : "0 4px 0 #1d1932",
                    }}
                    whileTap={{ y: 3, boxShadow: "0 1px 0 #1d1932" }}
                    transition={{ type: "spring", stiffness: 900, damping: 40 }}
                    aria-pressed={isSelected}
                    className="relative flex flex-col items-start gap-1 rounded-[10px] border-2 border-ink px-3 pt-2.5 pb-3 text-left cursor-pointer min-h-[74px]"
                    style={{ background: isSelected ? "var(--pink)" : "var(--paper-light)" }}
                  >
                    <span className="font-display font-black text-[26px] leading-none tracking-[0.02em] text-ink">
                      {type}
                    </span>
                    <span className="text-[12px] leading-snug text-ink/70">{VIBES[type]}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Type builder ── */}
      <motion.div variants={itemVariants} className="paper overflow-hidden">
        <button
          onClick={() => setBuilderOpen((v) => !v)}
          aria-expanded={builderOpen}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer min-h-[64px]"
        >
          <IconSparkle size={30} className="text-ink shrink-0" />
          <span className="flex-1">
            <span className="block font-display font-extrabold text-[20px] leading-none text-ink">
              Don&apos;t know your type?
            </span>
            <span className="block text-[14px] text-text-secondary mt-1">
              Four quick choices. Close enough na&nbsp;&apos;yan.
            </span>
          </span>
          <motion.span animate={{ rotate: builderOpen ? 90 : 0 }} className="text-ink">
            <IconArrowRight size={20} />
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
                  <div
                    key={axis.letters.join("")}
                    role="radiogroup"
                    aria-label={axis.letters.join(" or ")}
                    className="grid grid-cols-2 rounded-[10px] border-2 border-ink overflow-hidden"
                  >
                    {axis.options.map((label, j) => {
                      const letter = axis.letters[j];
                      const on = axes[i] === letter;
                      return (
                        <button
                          key={letter}
                          role="radio"
                          aria-checked={on}
                          onClick={() => setAxes((prev) => prev.map((v, k) => (k === i ? letter : v)))}
                          className={`flex items-center gap-2 px-3 py-2.5 min-h-[48px] text-[14px] text-left transition-colors cursor-pointer ${
                            j === 1 ? "border-l-2 border-ink" : ""
                          } ${on ? "bg-ink text-yellow font-semibold" : "bg-paper-light text-ink hover:bg-yellow-soft"}`}
                        >
                          <span className="font-display font-black text-[20px] leading-none">{letter}</span>
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
