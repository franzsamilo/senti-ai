"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import StepIndicator from "@/components/StepIndicator";
import { Wordmark } from "@/components/ui/BrandMark";
import { IconArrowLeft } from "@/components/ui/icons";
import { headerVariants, listVariants } from "@/components/ui/motion";

interface StepShellProps {
  step: number;
  total?: number;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /**
   * Action area. Pinned to the bottom of the viewport on phones so the main
   * button is always under the thumb, however long the step's content gets.
   */
  footer?: ReactNode;
  /** Omit to hide the back control. */
  onBack?: () => void;
  backLabel?: string;
}

/**
 * One layout for every step in the flow: back, route board, headline,
 * standfirst, body, action. Consistent rhythm is most of what separates a
 * considered product from a stack of pages that each invented their own
 * spacing.
 */
export default function StepShell({
  step,
  total = 6,
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
      className="flex flex-col gap-6 px-4 sm:px-5 pt-5 sm:pt-8 pb-6 max-w-[680px] mx-auto w-full min-h-[100dvh]"
    >
      <motion.header variants={headerVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between min-h-[44px]">
          {onBack ? (
            <motion.button
              type="button"
              onClick={onBack}
              whileTap={{ y: 2 }}
              className="inline-flex items-center gap-1.5 min-h-[44px] -ml-1 px-1 font-display font-extrabold uppercase tracking-[0.04em] text-[15px] text-text-secondary hover:text-ink cursor-pointer"
            >
              <IconArrowLeft size={18} />
              {backLabel}
            </motion.button>
          ) : (
            <span />
          )}
          <Wordmark className="text-[20px]" />
        </div>
        <StepIndicator current={step} total={total} />
        <div className="flex flex-col gap-2.5 pt-2">
          <h2 className="text-[42px] sm:text-[56px] leading-[0.92] text-ink">{title}</h2>
          {subtitle && (
            <p className="text-[16px] text-text-secondary leading-relaxed max-w-[52ch]">{subtitle}</p>
          )}
        </div>
      </motion.header>

      <div className="flex flex-col gap-6 flex-1">{children}</div>

      {footer && (
        <motion.div
          variants={headerVariants}
          data-step-footer
          className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] z-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(244,237,224,0) 0%, rgba(244,237,224,0.94) 36%, #f4ede0 100%)",
          }}
        >
          {footer}
        </motion.div>
      )}
    </motion.div>
  );
}
