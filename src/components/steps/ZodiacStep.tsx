"use client";

import { motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import { IconCalendar, ZODIAC_ICONS } from "@/components/ui/icons";
import { gridVariants, itemVariants } from "@/components/ui/motion";

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

/** A ballpoint loop drawn around the chosen sign, like circling it in the paper. */
function PenCircle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none z-10"
    >
      <motion.path
        d="M54 7C82 6 96 24 95 50 94 79 74 95 48 94 20 93 5 76 6 49 7 24 25 8 60 10"
        fill="none"
        stroke="#2b4ee0"
        strokeWidth={2.6}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      />
    </svg>
  );
}

/**
 * The horoscope column from the back page of a tabloid: twelve signs ruled
 * into a grid under a masthead, and yours gets circled in blue ballpen.
 */
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
        className="paper px-4 py-3 flex items-center gap-3 cursor-pointer"
      >
        <IconCalendar size={34} className="text-ink shrink-0" />
        <span className="flex flex-col flex-1 min-w-0">
          <span className="font-display font-extrabold text-[19px] leading-none text-ink">
            Not sure? Enter your birthday
          </span>
          <input
            type="date"
            aria-label="Birthday"
            onChange={(e) => {
              const [, month, day] = e.target.value.split("-").map(Number);
              if (month && day) onSelect(signFromDate(month, day));
            }}
            className="mt-1.5 w-full bg-transparent text-base text-text-secondary outline-none border-b-2 border-dotted border-ink/30 focus:border-blue pb-0.5"
          />
        </span>
      </motion.label>

      <motion.section variants={itemVariants} className="paper p-3 sm:p-4" aria-label="Zodiac signs">
        <header className="flex items-end justify-between gap-3 pb-2 mb-3 border-b-[5px] border-double border-ink">
          <h3 className="font-display font-black uppercase text-[26px] sm:text-[30px] leading-none tracking-[0.01em] text-ink">
            Ang Iyong Kapalaran
          </h3>
          <span className="font-serif italic text-[13px] text-text-secondary pb-0.5 hidden sm:block">
            ni Madam Senti
          </span>
        </header>

        <motion.div
          variants={gridVariants}
          className="grid grid-cols-3 sm:grid-cols-4 gap-px bg-[rgba(29,25,50,0.22)] border border-[rgba(29,25,50,0.22)]"
        >
          {ZODIACS.map(({ value, label, window }) => {
            const Icon = ZODIAC_ICONS[value];
            const isSelected = selected === value;
            return (
              <motion.button
                key={value}
                variants={itemVariants}
                onClick={() => onSelect(value)}
                whileTap={{ scale: 0.96 }}
                aria-pressed={isSelected}
                className="relative flex flex-col items-center justify-center gap-1.5 py-3.5 px-1 cursor-pointer min-h-[108px] transition-colors duration-150"
                style={{ background: isSelected ? "var(--color-yellow-soft)" : "var(--paper-light)" }}
              >
                {isSelected && <PenCircle />}
                <Icon size={36} className="text-ink" tone={isSelected ? "#ff4f9a" : "#ffd23a"} />
                <span className="font-display font-extrabold text-[18px] leading-none text-ink">{label}</span>
                <span className="text-[11px] leading-none text-text-muted">{window}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.section>
    </StepShell>
  );
}
