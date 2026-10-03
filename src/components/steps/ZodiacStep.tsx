"use client";

import { motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import { IconCalendar, ZODIAC_ICONS } from "@/components/ui/icons";
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

/** First day of each sign, in calendar order. */
const SIGN_STARTS: [month: number, day: number, sign: string][] = [
  [1, 20, "aquarius"],
  [2, 19, "pisces"],
  [3, 21, "aries"],
  [4, 20, "taurus"],
  [5, 21, "gemini"],
  [6, 21, "cancer"],
  [7, 23, "leo"],
  [8, 23, "virgo"],
  [9, 23, "libra"],
  [10, 23, "scorpio"],
  [11, 22, "sagittarius"],
  [12, 22, "capricorn"],
];

export function signFromDate(month: number, day: number): string {
  let sign = "capricorn"; // Jan 1–19 wraps around from December
  for (const [m, d, s] of SIGN_STARTS) {
    if (month > m || (month === m && day >= d)) sign = s;
  }
  return sign;
}

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
      backLabel="Love"
      title="What's your sign?"
      subtitle="The stars don't lie. Neither does this algorithm — though it does weigh this more than it should."
    >
      {/* Birthday shortcut — the native date picker is the fastest input on phones */}
      <motion.label
        variants={itemVariants}
        className="glass rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer"
      >
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-[rgba(139,63,217,0.1)] text-accent-secondary shrink-0">
          <IconCalendar size={20} />
        </span>
        <span className="flex flex-col flex-1 min-w-0">
          <span className="text-[15px] font-semibold text-text-primary">Not sure? Enter your birthday</span>
          <input
            type="date"
            aria-label="Birthday"
            onChange={(e) => {
              const [, month, day] = e.target.value.split("-").map(Number);
              if (month && day) onSelect(signFromDate(month, day));
            }}
            className="mt-1 w-full bg-transparent text-base text-text-secondary outline-none"
          />
        </span>
      </motion.label>

      <motion.div variants={gridVariants} className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {ZODIACS.map(({ value, label, window }) => {
          const Icon = ZODIAC_ICONS[value];
          const isSelected = selected === value;
          return (
            <motion.button
              key={value}
              variants={itemVariants}
              onClick={() => onSelect(value)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              aria-pressed={isSelected}
              className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3.5 px-1 cursor-pointer min-h-[104px] overflow-hidden border"
              style={{
                borderColor: isSelected ? "transparent" : "rgba(255,255,255,0.9)",
                background: isSelected ? "transparent" : "rgba(255,255,255,0.72)",
                boxShadow: isSelected ? "var(--shadow-glow)" : "var(--shadow-card)",
                color: isSelected ? "#ffffff" : "#8b3fd9",
              }}
            >
              {isSelected && (
                <motion.span
                  layoutId="zodiac-selection"
                  transition={spring}
                  className="absolute inset-0 -z-10"
                  style={{ background: "var(--dusk-button)" }}
                />
              )}
              <Icon size={30} />
              <span
                className="font-display text-[14px] font-semibold leading-none"
                style={{ color: isSelected ? "#fff" : "#2a1834" }}
              >
                {label}
              </span>
              <span
                className="text-[10.5px] leading-none"
                style={{ color: isSelected ? "rgba(255,255,255,0.8)" : "#7b6987" }}
              >
                {window}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </StepShell>
  );
}
