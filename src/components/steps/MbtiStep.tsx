"use client";

import { motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import { gridVariants, itemVariants, spring } from "@/components/ui/motion";

/** Grouped by temperament so the grid reads as a taxonomy, not 16 loose chips. */
const GROUPS: { label: string; types: string[] }[] = [
  { label: "Analysts", types: ["INTJ", "INTP", "ENTJ", "ENTP"] },
  { label: "Diplomats", types: ["INFJ", "INFP", "ENFJ", "ENFP"] },
  { label: "Sentinels", types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"] },
  { label: "Explorers", types: ["ISTP", "ISFP", "ESTP", "ESFP"] },
];

interface MbtiStepProps {
  onBack?: () => void;
  selected: string;
  onSelect: (mbti: string) => void;
}

export default function MbtiStep({ onBack, selected, onSelect }: MbtiStepProps) {
  return (
    <StepShell
      step={2}
      onBack={onBack}
      backLabel="Songs"
      kicker="INTAKE"
      title="Personality type"
      subtitle="Your MBTI. If you've never taken one, pick the one you'd defend in an argument."
    >
      <motion.div variants={gridVariants} className="flex flex-col gap-5">
        {GROUPS.map((group) => (
          <motion.div key={group.label} variants={itemVariants} className="flex flex-col gap-2.5">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-text-muted">
              {group.label}
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {group.types.map((type) => {
                const isSelected = selected === type;
                return (
                  <motion.button
                    key={type}
                    onClick={() => onSelect(type)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={spring}
                    aria-pressed={isSelected}
                    className="relative h-[52px] rounded-xl border font-mono font-semibold text-[13px] tracking-wide cursor-pointer overflow-hidden"
                    style={{
                      borderColor: isSelected
                        ? "rgba(255,50,82,0.7)"
                        : "rgba(255,255,255,0.07)",
                      background: isSelected
                        ? "rgba(255,50,82,0.10)"
                        : "rgba(255,255,255,0.02)",
                      color: isSelected ? "#ff5470" : "#8a8a8a",
                      transition:
                        "border-color 160ms ease, background 160ms ease, color 160ms ease",
                    }}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="mbti-selection"
                        transition={spring}
                        className="absolute inset-0 -z-10"
                        style={{
                          background:
                            "linear-gradient(160deg, rgba(255,50,82,0.22), rgba(255,8,68,0.05))",
                          boxShadow: "inset 0 0 0 1px rgba(255,50,82,0.35)",
                        }}
                      />
                    )}
                    {type}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </StepShell>
  );
}
