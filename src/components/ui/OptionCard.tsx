"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { IconCheck } from "@/components/ui/icons";
import { itemVariants, popSpring, spring } from "@/components/ui/motion";

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
  description?: string;
  /** Short playful aside under the description, e.g. the Taglish version. */
  aside?: string;
  /** Shared id so the selection highlight slides between cards in a group. */
  layoutGroupId?: string;
  multi?: boolean;
}

/**
 * The selectable row used by the attachment and love-language steps.
 *
 * The selected state is drawn by a `layoutId` element, so moving between
 * options animates the highlight across the list instead of cutting. On
 * multi-select groups the highlight is per-card (no shared layoutId) since
 * several can be lit at once.
 */
export default function OptionCard({
  selected,
  onSelect,
  icon,
  label,
  description,
  aside,
  layoutGroupId,
  multi = false,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      variants={itemVariants}
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985, y: 0 }}
      transition={spring}
      aria-pressed={selected}
      className="group relative flex items-center gap-4 w-full rounded-2xl border px-4 sm:px-5 py-4 text-left cursor-pointer min-h-[72px] overflow-hidden"
      style={{
        borderColor: selected ? "rgba(224,48,107,0.45)" : "rgba(255,255,255,0.9)",
        background: selected ? "rgba(255,240,245,0.95)" : "rgba(255,255,255,0.72)",
        boxShadow: selected ? "var(--shadow-lift)" : "var(--shadow-card)",
        transition: "border-color 180ms ease, background 180ms ease, box-shadow 180ms ease",
      }}
    >
      {/* Sliding selection wash — only for single-select groups */}
      {selected && !multi && layoutGroupId && (
        <motion.span
          layoutId={layoutGroupId}
          transition={spring}
          className="absolute inset-0 -z-10 rounded-2xl"
          style={{
            background:
              "linear-gradient(100deg, rgba(255,122,89,0.12), rgba(224,48,107,0.10) 50%, rgba(139,63,217,0.08))",
          }}
        />
      )}

      <motion.span
        animate={selected ? { scale: [1, 1.12, 1], rotate: [0, -6, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.4 }}
        className="shrink-0 grid place-items-center w-12 h-12 rounded-xl"
        style={{
          color: selected ? "#ffffff" : "#8b3fd9",
          background: selected ? "var(--dusk-button)" : "rgba(139,63,217,0.08)",
          transition: "color 180ms ease, background 180ms ease",
        }}
      >
        {icon}
      </motion.span>

      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-display font-semibold text-[16px] leading-snug text-text-primary">
          {label}
        </span>
        {description && (
          <span className="text-[13px] text-text-secondary leading-relaxed">{description}</span>
        )}
        {aside && (
          <span className="text-[12px] text-accent-ink leading-relaxed">{aside}</span>
        )}
      </span>

      <motion.span
        initial={false}
        animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.4 }}
        transition={popSpring}
        className="shrink-0 grid place-items-center w-7 h-7 rounded-full text-white"
        style={{ background: "var(--dusk-button)" }}
      >
        <IconCheck size={15} strokeWidth={2.6} />
      </motion.span>
    </motion.button>
  );
}
