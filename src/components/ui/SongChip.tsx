"use client";

import { motion } from "framer-motion";
import { Song } from "@/lib/types";
import { IconClose } from "@/components/ui/icons";
import { popSpring } from "@/components/ui/motion";

interface SongChipProps {
  song: Song;
  onRemove?: () => void;
  showPainIndex?: boolean;
}

export default function SongChip({ song, onRemove, showPainIndex = false }: SongChipProps) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={popSpring}
      className="inline-flex items-center gap-2 bg-white border border-border-subtle rounded-xl pl-3 pr-1.5 py-1.5 text-sm max-w-full min-w-0 shadow-[0_1px_2px_rgba(74,30,82,0.06)]"
    >
      <span className="flex flex-col min-w-0 leading-tight py-0.5">
        <span className="text-text-primary font-medium truncate text-[13px]">{song.title}</span>
        <span className="text-text-muted truncate text-[11px]">{song.artist}</span>
      </span>
      {showPainIndex && (
        <span className="ml-1 mr-1.5 text-[11px] font-mono font-semibold text-accent-ink bg-accent-soft rounded-md px-1.5 py-0.5 tabular-nums">
          {song.painIndex.toFixed(1)}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${song.title}`}
          className="shrink-0 grid place-items-center w-8 h-8 rounded-lg text-text-muted hover:text-accent-ink hover:bg-accent-soft transition-colors cursor-pointer"
        >
          <IconClose size={14} strokeWidth={2} />
        </button>
      )}
    </motion.span>
  );
}
