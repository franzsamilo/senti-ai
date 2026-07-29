"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { IconCheck } from "@/components/ui/icons";
import { itemVariants, spring } from "@/components/ui/motion";

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
  description?: string;
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
      className="group relative flex items-center gap-4 w-full rounded-xl border px-4 sm:px-5 py-4 text-left cursor-pointer min-h-[68px] overflow-hidden"
      style={{
        borderColor: selected ? "rgba(255,50,82,0.55)" : "rgba(255,255,255,0.07)",
        background: selected ? "rgba(255,50,82,0.06)" : "rgba(255,255,255,0.02)",
        transition: "border-color 180ms ease, background 180ms ease",
      }}
    >
      {/* Sliding selection wash — only for single-select groups */}
      {selected && !multi && layoutGroupId && (
        <motion.span
          layoutId={layoutGroupId}
          transition={spring}
          className="absolute inset-0 -z-10 rounded-xl"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,50,82,0.14), rgba(255,50,82,0.02))",
            boxShadow: "inset 0 0 0 1px rgba(255,50,82,0.25)",
          }}
        />
      )}

      {/* Left rail — reads as an instrument indicator when lit */}
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
        style={{
          background: selected ? "linear-gradient(180deg,#ff3252,#ff0844)" : "transparent",
          boxShadow: selected ? "0 0 12px rgba(255,50,82,0.6)" : "none",
          transition: "background 180ms ease",
        }}
      />

      <span
        className="shrink-0 grid place-items-center w-11 h-11 rounded-lg border"
        style={{
          color: selected ? "#ff3252" : "#8a8a8a",
          borderColor: selected ? "rgba(255,50,82,0.35)" : "rgba(255,255,255,0.07)",
          background: selected ? "rgba(255,50,82,0.08)" : "rgba(255,255,255,0.02)",
          transition: "color 180ms ease, border-color 180ms ease, background 180ms ease",
        }}
      >
        {icon}
      </span>

      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span
          className="font-semibold text-[15px] leading-snug"
          style={{ color: selected ? "#ff5470" : "#e8e8e8" }}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-text-secondary leading-relaxed">
            {description}
          </span>
        )}
      </span>

      <motion.span
        initial={false}
        animate={{
          opacity: selected ? 1 : 0,
          scale: selected ? 1 : 0.6,
        }}
        transition={spring}
        className="shrink-0 grid place-items-center w-6 h-6 rounded-full"
        style={{ background: "rgba(255,50,82,0.16)", color: "#ff3252" }}
      >
        <IconCheck size={14} strokeWidth={2.4} />
      </motion.span>
    </motion.button>
  );
}
