"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import StepIndicator from "@/components/StepIndicator";
import { IconArrowLeft } from "@/components/ui/icons";
import { headerVariants, listVariants, spring } from "@/components/ui/motion";

interface StepShellProps {
  step: number;
  total?: number;
  /** Short monospace kicker above the title, e.g. "INTAKE". */
  kicker?: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Pinned action area at the bottom of the step. */
  footer?: ReactNode;
  /** Omit to hide the back control (first step of the flow). */
  onBack?: () => void;
  backLabel?: string;
}

/**
 * One layout for every step in the flow: progress, kicker, title, subtitle,
 * body, action. Consistent rhythm is most of what separates a considered
 * product from a stack of pages that each invented their own spacing.
 */
export default function StepShell({
  step,
  total = 6,
  kicker,
  title,
  subtitle,
  children,
  footer,
  onBack,
  backLabel = "Back",
}: StepShellProps) {
  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-7 px-5 py-9 sm:py-12 max-w-[680px] mx-auto w-full"
    >
      <motion.header variants={headerVariants} className="flex flex-col gap-3">
        {onBack && (
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.96 }}
            transition={spring}
            className="self-start inline-flex items-center gap-1.5 -ml-1 px-1 py-1 font-mono text-[11px] tracking-[0.18em] uppercase text-text-muted hover:text-accent transition-colors cursor-pointer min-h-[36px]"
          >
            <IconArrowLeft size={15} />
            {backLabel}
          </motion.button>
        )}
        <StepIndicator current={step} total={total} kicker={kicker} />
        <h2 className="text-[26px] sm:text-3xl font-bold tracking-tight text-text-primary leading-[1.15]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-text-secondary leading-relaxed max-w-[52ch]">
            {subtitle}
          </p>
        )}
      </motion.header>

      {children}

      {footer && (
        <motion.div variants={headerVariants} className="pt-1">
          {footer}
        </motion.div>
      )}
    </motion.div>
  );
}
