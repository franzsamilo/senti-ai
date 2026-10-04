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

/** A track as a little cassette label: handwritten title, printed artist. */
export default function SongChip({ song, onRemove, showPainIndex = false }: SongChipProps) {
  const hot = song.painIndex >= 8;
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={popSpring}
      className="inline-flex items-center gap-2 bg-paper-light border-[1.5px] border-ink rounded-[6px] pl-2.5 pr-1.5 py-1 max-w-full min-w-0"
    >
      <span className="flex flex-col min-w-0 leading-tight py-0.5">
        <span className="font-hand text-blue-ink truncate text-[17px] leading-none">{song.title}</span>
        <span className="text-text-muted truncate text-[11px]">{song.artist}</span>
      </span>
      {showPainIndex && (
        <span
          className={`ml-1 mr-1 text-[11px] font-mono tabular-nums rounded-[4px] px-1.5 py-0.5 border-[1.5px] ${
            hot ? "bg-pink border-ink text-ink" : "border-ink/30 text-ink"
          }`}
          style={{ fontStretch: "87.5%" }}
        >
          {song.painIndex.toFixed(1)}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${song.title}`}
          className="shrink-0 grid place-items-center w-8 h-8 rounded-[6px] text-ink/60 hover:text-ink hover:bg-pink-soft transition-colors cursor-pointer"
        >
          <IconClose size={14} />
        </button>
      )}
    </motion.span>
  );
}
