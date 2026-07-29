"use client";

import { motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import { ZODIAC_ICONS } from "@/components/ui/icons";
import { gridVariants, itemVariants, spring } from "@/components/ui/motion";

const ZODIACS: { value: string; label: string; window: string }[] = [
  { value: "aries", label: "Aries", window: "Mar 21 – Apr 19" },
  { value: "taurus", label: "Taurus", window: "Apr 20 – May 20" },
  { value: "gemini", label: "Gemini", window: "May 21 – Jun 20" },
  { value: "cancer", label: "Cancer", window: "Jun 21 – Jul 22" },
  { value: "leo", label: "Leo", window: "Jul 23 – Aug 22" },
  { value: "virgo", label: "Virgo", window: "Aug 23 – Sep 22" },
  { value: "libra", label: "Libra", window: "Sep 23 – Oct 22" },
  { value: "scorpio", label: "Scorpio", window: "Oct 23 – Nov 21" },
  { value: "sagittarius", label: "Sagittarius", window: "Nov 22 – Dec 21" },
  { value: "capricorn", label: "Capricorn", window: "Dec 22 – Jan 19" },
  { value: "aquarius", label: "Aquarius", window: "Jan 20 – Feb 18" },
  { value: "pisces", label: "Pisces", window: "Feb 19 – Mar 20" },
];

interface ZodiacStepProps {
  onBack?: () => void;
  selected: string;
  onSelect: (zodiac: string) => void;
}

export default function ZodiacStep({ onBack, selected, onSelect }: ZodiacStepProps) {
  return (
    <StepShell
      step={5}
      onBack={onBack}
      backLabel="Love language"
      kicker="INTAKE"
      title="Star sign"
      subtitle="Included for completeness. The system weights it more heavily than it should."
    >
      <motion.div
        variants={gridVariants}
        className="grid grid-cols-3 sm:grid-cols-4 gap-2.5"
      >
        {ZODIACS.map(({ value, label, window }) => {
          const Icon = ZODIAC_ICONS[value];
          const isSelected = selected === value;
          return (
            <motion.button
              key={value}
              variants={itemVariants}
              onClick={() => onSelect(value)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              aria-pressed={isSelected}
              title={window}
              className="relative flex flex-col items-center justify-center gap-2 rounded-xl border py-4 cursor-pointer min-h-[92px] overflow-hidden"
              style={{
                borderColor: isSelected
                  ? "rgba(255,50,82,0.55)"
                  : "rgba(255,255,255,0.07)",
                background: isSelected
                  ? "rgba(255,50,82,0.07)"
                  : "rgba(255,255,255,0.02)",
                color: isSelected ? "#ff3252" : "#7d7d7d",
                transition:
                  "border-color 180ms ease, background 180ms ease, color 180ms ease",
              }}
            >
              {isSelected && (
                <motion.span
                  layoutId="zodiac-selection"
                  transition={spring}
                  className="absolute inset-0 -z-10"
                  style={{
                    background:
                      "radial-gradient(120% 90% at 50% 0%, rgba(255,50,82,0.20), transparent 70%)",
                  }}
                />
              )}
              <Icon size={30} />
              <span
                className="text-[10px] sm:text-[11px] font-mono tracking-wide leading-none text-center"
                style={{ color: isSelected ? "#ff5470" : "#5f5f5f" }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </StepShell>
  );
}
