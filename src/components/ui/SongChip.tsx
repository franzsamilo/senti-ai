"use client";

import { Song } from "@/lib/types";

interface SongChipProps {
  song: Song;
  onRemove?: () => void;
  showPainIndex?: boolean;
}

export default function SongChip({ song, onRemove, showPainIndex = false }: SongChipProps) {
  return (
    <span className="inline-flex items-center gap-2 bg-bg-card border border-border-subtle rounded-full px-3 py-1.5 text-sm max-w-full">
      <span className="text-text-primary font-medium truncate max-w-[120px] sm:max-w-none">{song.title}</span>
      <span className="text-text-muted truncate max-w-[80px] sm:max-w-none">{song.artist}</span>
      {showPainIndex && (
        <span className="text-accent text-xs font-mono">{song.painIndex.toFixed(1)}</span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${song.title}`}
          className="text-text-muted hover:text-accent transition-colors duration-150 leading-none cursor-pointer ml-0.5"
        >
          &times;
        </button>
      )}
    </span>
  );
}
