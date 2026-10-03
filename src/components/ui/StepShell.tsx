"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import StepIndicator from "@/components/StepIndicator";
import { IconArrowLeft } from "@/components/ui/icons";
import { headerVariants, listVariants, spring } from "@/components/ui/motion";

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
 * One layout for every step in the flow: back, progress, title, subtitle,
 * body, action. Consistent rhythm is most of what separates a considered
 * product from a stack of pages that each invented their own spacing.
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
      className="flex flex-col gap-6 px-4 sm:px-5 pt-6 sm:pt-10 pb-6 max-w-[680px] mx-auto w-full min-h-[100dvh]"
    >
      <motion.header variants={headerVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between min-h-[40px]">
          {onBack ? (
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.94 }}
              transition={spring}
              className="inline-flex items-center gap-1.5 rounded-full pl-2 pr-3.5 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary bg-white/60 hover:bg-white border border-white/90 cursor-pointer"
            >
              <IconArrowLeft size={16} />
              {backLabel}
            </motion.button>
          ) : (
            <span />
          )}
          <span className="font-display font-bold text-[15px] tracking-tight text-dusk">Senti.AI</span>
        </div>
        <StepIndicator current={step} total={total} />
        <div className="flex flex-col gap-2 pt-1">
          <h2 className="text-[28px] sm:text-[34px] font-bold text-text-primary leading-[1.1]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[15px] text-text-secondary leading-relaxed max-w-[54ch]">{subtitle}</p>
          )}
        </div>
      </motion.header>

      <div className="flex flex-col gap-6 flex-1">{children}</div>

      {footer && (
        <motion.div
          variants={headerVariants}
          className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] z-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(241,235,251,0) 0%, rgba(241,235,251,0.92) 38%, rgba(241,235,251,0.98) 100%)",
          }}
        >
          {footer}
        </motion.div>
      )}
    </motion.div>
  );
}
