"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import StepIndicator from "@/components/StepIndicator";
import SongChip from "@/components/ui/SongChip";
import Button from "@/components/ui/Button";
import { searchSongs } from "@/data/songs";
import { Song } from "@/lib/types";

const MAX_SONGS = 5;
const MIN_SONGS = 3;
const MAX_RESULTS = 8;

interface SongInputStepProps {
  songs: Song[];
  onSongsChange: (songs: Song[]) => void;
  onNext: () => void;
}

export default function SongInputStep({ songs, onSongsChange, onNext }: SongInputStepProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update dropdown results whenever query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setOpen(false);
      return;
    }
    const found = searchSongs(trimmed).slice(0, MAX_RESULTS);
    setResults(found);
    setOpen(true);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isDuplicate = useCallback(
    (song: Song) =>
      songs.some(
        (s) =>
          s.title.toLowerCase() === song.title.toLowerCase() &&
          s.artist.toLowerCase() === song.artist.toLowerCase()
      ),
    [songs]
  );

  function addSong(song: Song) {
    if (songs.length >= MAX_SONGS) return;
    if (isDuplicate(song)) return;
    onSongsChange([...songs, song]);
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function addCustomSong() {
    const trimmed = query.trim();
    if (!trimmed) return;
    const custom: Song = {
      title: trimmed,
      artist: "Unknown Artist",
      mood: "unknown",
      painIndex: 5.5,
    };
    addSong(custom);
  }

  function removeSong(index: number) {
    onSongsChange(songs.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (results.length > 0) {
      addSong(results[0]);
    } else if (query.trim()) {
      addCustomSong();
    }
  }

  const canAdd = songs.length < MAX_SONGS;
  const canProceed = songs.length >= MIN_SONGS;

  return (
    <div className="flex flex-col gap-6 px-4 py-8 max-w-[680px] mx-auto w-full">
      <div className="flex flex-col gap-2">
        <StepIndicator current={1} />
        <h2 className="text-2xl font-bold text-text-primary">Your Hugot Playlist</h2>
        <p className="text-sm text-text-secondary">
          Select 3–5 songs that define your emotional state rn
        </p>
      </div>

      {/* Song counter */}
      <div className="font-mono text-xs text-text-muted">
        <span className={songs.length >= MIN_SONGS ? "text-accent-success" : "text-accent"}>
          {songs.length}
        </span>
        /{MAX_SONGS} songs added
      </div>

      {/* Selected songs */}
      {songs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {songs.map((song, i) => (
            <SongChip
              key={`${song.title}-${song.artist}-${i}`}
              song={song}
              showPainIndex
              onRemove={() => removeSong(i)}
            />
          ))}
        </div>
      )}

      {/* Search input + dropdown */}
      <div ref={containerRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!canAdd}
          placeholder={
            canAdd
              ? "Search for a song or type a custom title..."
              : "Maximum songs added"
          }
          className={[
            "w-full bg-bg-card border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-150",
            canAdd
              ? "border-border-subtle focus:border-accent/60"
              : "border-border-subtle opacity-50 cursor-not-allowed",
          ].join(" ")}
        />

        {/* Dropdown */}
        {open && results.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-[#0f0f18] border border-border-subtle rounded-lg overflow-hidden shadow-xl">
            {results.map((song, i) => (
              <li key={i}>
                <button
                  onClick={() => addSong(song)}
                  disabled={isDuplicate(song)}
                  className={[
                    "w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors duration-100",
                    isDuplicate(song)
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-accent/10 cursor-pointer",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-accent font-medium truncate">{song.title}</span>
                    <span className="text-text-muted text-xs truncate">{song.artist}</span>
                  </div>
                  <span className="font-mono text-xs text-text-muted ml-4 shrink-0">
                    {song.painIndex.toFixed(1)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* No results — show custom add hint */}
        {open && results.length === 0 && query.trim().length > 0 && canAdd && (
          <div className="absolute z-50 mt-1 w-full bg-[#0f0f18] border border-border-subtle rounded-lg overflow-hidden shadow-xl">
            <button
              onClick={addCustomSong}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-accent/10 cursor-pointer transition-colors duration-100"
            >
              <span className="text-text-muted">Add custom song:</span>
              <span className="text-text-primary font-medium truncate">&ldquo;{query.trim()}&rdquo;</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted font-mono">
        Press Enter to add the top result, or click a suggestion. Custom songs get a default pain index.
      </p>

      {/* Next button */}
      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full mt-2"
      >
        {canProceed
          ? "Analyze My Emotional Damage →"
          : `Add ${MIN_SONGS - songs.length} more song${MIN_SONGS - songs.length !== 1 ? "s" : ""} to continue`}
      </Button>
    </div>
  );
}
