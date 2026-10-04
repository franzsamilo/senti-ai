"use client";

import { motion } from "framer-motion";
import { ReactNode, useId } from "react";
import { itemVariants, listVariants } from "@/components/ui/motion";

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
  /** The answer letter printed in the bubble (A, B, C…). */
  letter: string;
  description?: string;
  /** Short playful aside, written in the margin in pencil. */
  aside?: string;
  multi?: boolean;
}

/**
 * The pencil shading inside an answer bubble. Drawn as a zig-zag stroke
 * clipped to the oval, animated with pathLength, so picking an answer looks
 * like someone filling it in with a No. 2 pencil.
 */
function Bubble({ letter, selected }: { letter: string; selected: boolean }) {
  const clip = useId();
  return (
    <span className="relative grid place-items-center w-[34px] h-[38px] shrink-0">
      <svg viewBox="0 0 34 38" className="absolute inset-0" aria-hidden="true">
        <defs>
          <clipPath id={clip}>
            <ellipse cx={17} cy={19} rx={13.5} ry={16.5} />
          </clipPath>
        </defs>
        <ellipse cx={17} cy={19} rx={14} ry={17} fill="#fffaf2" stroke="#1d1932" strokeWidth={2} />
        <g clipPath={`url(#${clip})`}>
          <motion.path
            d="M6 9 L28 5 L4 15 L30 11 L4 21 L30 17 L4 27 L30 23 L6 33 L28 30"
            fill="none"
            stroke="#2a2638"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: selected ? 1 : 0, opacity: selected ? 0.94 : 0 }}
            transition={{ pathLength: { duration: 0.32, ease: "easeOut" }, opacity: { duration: 0.08 } }}
          />
        </g>
      </svg>
      <span
        className="relative font-display font-black text-[16px] leading-none transition-colors duration-150"
        style={{ color: selected ? "transparent" : "#1d1932" }}
      >
        {letter}
      </span>
    </span>
  );
}

/**
 * One line on the answer sheet — the selectable row used by the attachment
 * and love-language steps. A timing mark on the edge, a bubble to shade, a
 * printed question and a pencilled aside in the margin.
 */
export default function OptionCard({
  selected,
  onSelect,
  icon,
  label,
  letter,
  description,
  aside,
  multi = false,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      variants={itemVariants}
      onClick={onSelect}
      whileTap={{ scale: 0.99 }}
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      className="group relative flex items-center gap-3 sm:gap-4 w-full pl-5 pr-3 sm:pl-7 sm:pr-5 py-4 text-left cursor-pointer min-h-[84px] transition-colors duration-150"
      style={{ background: selected ? "rgba(255,210,58,0.32)" : "transparent" }}
    >
      {/* Scanner timing mark */}
      <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 w-[7px] h-[16px] bg-ink" />

      <Bubble letter={letter} selected={selected} />

      <motion.span
        animate={selected ? { rotate: [0, -10, 6, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="shrink-0 grid place-items-center w-11 h-11 text-ink"
      >
        {icon}
      </motion.span>

      <span className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-display font-extrabold text-[23px] leading-[0.95] text-ink">{label}</span>
        {description && (
          <span className="text-[14px] text-text-secondary leading-snug">{description}</span>
        )}
        {aside && (
          <span className="font-hand text-[17px] text-pink-ink leading-tight -rotate-[0.6deg] origin-left">
            {aside}
          </span>
        )}
      </span>
    </motion.button>
  );
}

/**
 * The sheet the rows are printed on: an ink header band with the part name
 * and the instructions, rows divided by perforation-style rules.
 */
export function AnswerSheet({
  part,
  instructions,
  multi = false,
  label,
  children,
}: {
  part: string;
  instructions: string;
  multi?: boolean;
  /** Accessible name for the group. */
  label: string;
  children: ReactNode;
}) {
  return (
    <motion.div variants={listVariants} className="paper overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-4 sm:px-5 py-2.5 bg-ink">
        <span className="font-display font-extrabold uppercase tracking-[0.06em] text-[14px] text-paper-light">
          {part}
        </span>
        <span className="font-hand text-[16px] text-yellow">{instructions}</span>
      </div>
      <div
        role={multi ? "group" : "radiogroup"}
        aria-label={label}
        className="flex flex-col divide-y-2 divide-dashed divide-[rgba(29,25,50,0.16)]"
      >
        {children}
      </div>
    </motion.div>
  );
}
