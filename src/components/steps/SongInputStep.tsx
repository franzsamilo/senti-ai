"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import SongChip from "@/components/ui/SongChip";
import Button from "@/components/ui/Button";
import {
  IconArrowRight,
  IconCheck,
  IconMusic,
  IconPlus,
  IconSearch,
} from "@/components/ui/icons";
import { popSpring, spring } from "@/components/ui/motion";
import { normalizeText, QUICK_PICKS, searchSongs } from "@/data/songs";
import { Song } from "@/lib/types";

const MAX_SONGS = 25;
const MIN_SONGS = 3;
const SWEET_SPOT = 8; // where the read starts getting genuinely specific
const MAX_RESULTS = 40;

interface SongInputStepProps {
  onBack?: () => void;
  songs: Song[];
  onSongsChange: (songs: Song[]) => void;
  onNext: () => void;
}

const sameSong = (a: Song, b: Song) =>
  normalizeText(a.title) === normalizeText(b.title) &&
  normalizeText(a.artist) === normalizeText(b.artist);

/**
 * Typed songs that aren't in the database. "Title - Artist" and "Title by
 * Artist" are split so the model gets the artist too.
 */
function parseCustomSong(input: string): Song {
  const trimmed = input.trim();
  const split = trimmed.match(/^(.+?)\s+(?:-|–|—|by)\s+(.+)$/i);
  return {
    title: (split ? split[1] : trimmed).trim(),
    artist: split ? split[2].trim() : "Unknown Artist",
    mood: "unknown",
    painIndex: 5.5,
  };
}

export default function SongInputStep({ onBack, songs, onSongsChange, onNext }: SongInputStepProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pickGroup, setPickGroup] = useState(QUICK_PICKS[0]?.id ?? "");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Song request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestArtist, setRequestArtist] = useState("");
  const [requestState, setRequestState] = useState<"idle" | "sending" | "sent">("idle");

  const results = useMemo(
    () => (query.trim() ? searchSongs(query).slice(0, MAX_RESULTS) : []),
    [query]
  );

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

  const isAdded = useCallback((song: Song) => songs.some((s) => sameSong(s, song)), [songs]);

  const canAdd = songs.length < MAX_SONGS;
  const canProceed = songs.length >= MIN_SONGS;

  function addSong(song: Song, { keepQuery = false } = {}) {
    if (!canAdd || isAdded(song)) return;
    onSongsChange([...songs, song]);
    if (!keepQuery) {
      setQuery("");
      setOpen(false);
      inputRef.current?.focus();
    }
  }

  function toggleSong(song: Song) {
    if (isAdded(song)) onSongsChange(songs.filter((s) => !sameSong(s, song)));
    else addSong(song, { keepQuery: true });
  }

  function removeSong(index: number) {
    onSongsChange(songs.filter((_, i) => i !== index));
  }

  const exactMatch = results.some(
    (s) => normalizeText(s.title) === normalizeText(parseCustomSong(query).title)
  );
  // The custom row is the last option in the dropdown, after the results.
  const showCustomRow = query.trim().length > 0 && !exactMatch && canAdd;
  const optionCount = results.length + (showCustomRow ? 1 : 0);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && optionCount > 0) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev + 1) % optionCount);
      return;
    }
    if (e.key === "ArrowUp" && optionCount > 0) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev - 1 + optionCount) % optionCount);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (activeIndex < results.length && results[activeIndex]) addSong(results[activeIndex]);
    else if (query.trim()) addSong(parseCustomSong(query));
  }

  function openRequestForm() {
    const parsed = parseCustomSong(query);
    setRequestTitle(parsed.title);
    setRequestArtist(parsed.artist === "Unknown Artist" ? "" : parsed.artist);
    setRequestState("idle");
    setShowRequestForm(true);
  }

  async function submitRequest() {
    const title = requestTitle.trim();
    const artist = requestArtist.trim();
    if (!title || !artist) return;
    setRequestState("sending");
    try {
      await fetch("/api/song-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, artist }),
      });
    } catch {
      // best-effort — confirm regardless
    }
    setRequestState("sent");
    setTimeout(() => setShowRequestForm(false), 2500);
  }

  const activePicks = QUICK_PICKS.find((g) => g.id === pickGroup) ?? QUICK_PICKS[0];
  const remainingToMin = MIN_SONGS - songs.length;

  return (
    <StepShell
      step={1}
      onBack={onBack}
      backLabel="Home"
      title="Ano'ng nasa playlist mo?"
      subtitle="Add the songs you actually have on repeat — OPM, P-pop, indie, Taylor, K-pop, lahat pwede. At least 3, but 8 or more makes the read a lot sharper."
      footer={
        <Button onClick={onNext} disabled={!canProceed} className="w-full">
          {canProceed ? (
            <>
              Continue with {songs.length} song{songs.length !== 1 ? "s" : ""}
              <IconArrowRight size={18} />
            </>
          ) : (
            `Add ${remainingToMin} more song${remainingToMin !== 1 ? "s" : ""}`
          )}
        </Button>
      }
    >
      {/* ── Search ── */}
      <div ref={containerRef} className="relative z-30">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: query ? "#e0306b" : "#9a89a6" }}
        >
          <IconSearch size={19} />
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
            setShowRequestForm(false);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={!canAdd}
          aria-label="Search songs"
          placeholder={canAdd ? "Search a song or artist…" : "That's the max — 25 songs"}
          className="glass w-full rounded-2xl pl-12 pr-4 py-4 text-base text-text-primary placeholder:text-text-muted outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(224,48,107,0.18)] disabled:opacity-60"
        />

        <AnimatePresence>
          {open && optionCount > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute mt-2 w-full bg-white border border-border-subtle rounded-2xl overflow-y-auto max-h-[320px] shadow-[var(--shadow-lift)] py-1.5"
              role="listbox"
            >
              {results.map((song, i) => {
                const added = isAdded(song);
                return (
                  <li key={`${song.title}-${song.artist}-${i}`} role="option" aria-selected={i === activeIndex}>
                    <button
                      onClick={() => addSong(song)}
                      // mousemove, not mouseenter: a cursor merely resting where
                      // the dropdown opens must not steal the keyboard selection
                      onMouseMove={() => setActiveIndex(i)}
                      disabled={added}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        added ? "opacity-50 cursor-default" : i === activeIndex ? "bg-accent-soft" : ""
                      } cursor-pointer`}
                    >
                      <span className="shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-[rgba(139,63,217,0.08)] text-accent-secondary">
                        <IconMusic size={16} />
                      </span>
                      <span className="flex flex-col min-w-0 flex-1">
                        <span className="text-[15px] font-medium text-text-primary truncate">{song.title}</span>
                        <span className="text-[13px] text-text-muted truncate">{song.artist}</span>
                      </span>
                      {added ? (
                        <span className="text-xs text-accent-success inline-flex items-center gap-1 shrink-0">
                          <IconCheck size={14} /> Added
                        </span>
                      ) : (
                        <IconPlus size={18} className="text-text-muted shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
              {showCustomRow && (
                <li role="option" aria-selected={activeIndex === results.length}>
                  <button
                    onClick={() => addSong(parseCustomSong(query))}
                    onMouseMove={() => setActiveIndex(results.length)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors ${
                      results.length > 0 ? "border-t border-border-subtle" : ""
                    } ${activeIndex === results.length ? "bg-accent-soft" : ""}`}
                  >
                    <span className="shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-accent-soft text-accent-ink">
                      <IconPlus size={16} />
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-[15px] text-text-primary truncate">
                        Add &ldquo;{query.trim()}&rdquo;
                      </span>
                      <span className="text-[12px] text-text-muted">
                        Not in the list? Add it anyway — tip: &ldquo;Title - Artist&rdquo;
                      </span>
                    </span>
                  </button>
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* ── Request a song (only when nothing matched) ── */}
      {query.trim().length >= 2 && results.length === 0 && canAdd && (
        <div className="-mt-2 text-[13px] text-text-secondary">
          {!showRequestForm ? (
            <button onClick={openRequestForm} className="text-accent-ink font-medium hover:underline cursor-pointer">
              Wala sa list? Request it to be added →
            </button>
          ) : (
            <div className="glass rounded-2xl p-4 flex flex-col gap-2.5">
              {requestState === "sent" ? (
                <p className="text-accent-success font-medium">Request sent — salamat! It still works for your scan today.</p>
              ) : (
                <>
                  <p className="font-medium text-text-primary">Request a song</p>
                  <input
                    type="text"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    placeholder="Song title"
                    maxLength={100}
                    className="w-full bg-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-base outline-none focus:border-accent/50"
                  />
                  <input
                    type="text"
                    value={requestArtist}
                    onChange={(e) => setRequestArtist(e.target.value)}
                    placeholder="Artist"
                    maxLength={100}
                    className="w-full bg-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-base outline-none focus:border-accent/50"
                  />
                  <Button
                    onClick={submitRequest}
                    disabled={requestState === "sending" || !requestTitle.trim() || !requestArtist.trim()}
                    className="self-start min-h-[40px] py-2 text-sm"
                  >
                    {requestState === "sending" ? "Sending…" : "Send request"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Your list ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-semibold text-text-primary">
            Your songs{" "}
            <span className="font-normal text-text-muted tabular-nums">
              {songs.length}/{MAX_SONGS}
            </span>
          </p>
          {songs.length > 0 && (
            <button
              onClick={() => onSongsChange([])}
              className="text-[13px] text-text-muted hover:text-accent-ink transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(74,30,82,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={false}
            animate={{ width: `${Math.min(100, (songs.length / SWEET_SPOT) * 100)}%` }}
            transition={spring}
            style={{ background: songs.length >= SWEET_SPOT ? "var(--dusk)" : "rgba(224,48,107,0.55)" }}
          />
        </div>
        <p className="text-[13px] text-text-muted -mt-1">
          {songs.length < MIN_SONGS
            ? `Add at least ${MIN_SONGS} to continue.`
            : songs.length < SWEET_SPOT
            ? `${SWEET_SPOT - songs.length} more for the sharpest read — or continue now.`
            : "Perfect sample size. Ready ka na."}
        </p>

        {songs.length > 0 ? (
          <motion.div layout className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {songs.map((song, i) => (
                <SongChip
                  key={`${song.title}-${song.artist}`}
                  song={song}
                  onRemove={() => removeSong(i)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-strong px-4 py-5 text-center text-[14px] text-text-muted">
            Wala pa. Search above, or tap a few from the picks below.
          </div>
        )}
      </section>

      {/* ── Quick picks ── */}
      <section className="flex flex-col gap-3">
        <p className="text-[15px] font-semibold text-text-primary">Quick picks</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5">
          {QUICK_PICKS.map((group) => {
            const active = group.id === activePicks?.id;
            return (
              <button
                key={group.id}
                onClick={() => setPickGroup(group.id)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors cursor-pointer ${
                  active ? "text-white" : "text-text-secondary bg-white/70 hover:bg-white border border-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="quick-pick-tab"
                    transition={spring}
                    className="absolute inset-0 rounded-full -z-10"
                    style={{ background: "var(--dusk-button)" }}
                  />
                )}
                {group.label}
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePicks?.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {activePicks?.songs.map((song) => {
              const added = isAdded(song);
              return (
                <motion.button
                  key={`${song.title}-${song.artist}`}
                  onClick={() => toggleSong(song)}
                  disabled={!added && !canAdd}
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  aria-pressed={added}
                  className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left border transition-colors cursor-pointer disabled:opacity-40 ${
                    added ? "bg-accent-soft border-accent/30" : "bg-white/70 border-white hover:bg-white"
                  }`}
                >
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="text-[14px] font-medium text-text-primary truncate">{song.title}</span>
                    <span className="text-[12px] text-text-muted truncate">{song.artist}</span>
                  </span>
                  <motion.span
                    key={added ? "on" : "off"}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={popSpring}
                    className={`shrink-0 grid place-items-center w-7 h-7 rounded-full ${
                      added ? "text-white" : "text-text-muted border border-border-subtle"
                    }`}
                    style={added ? { background: "var(--dusk-button)" } : undefined}
                  >
                    {added ? <IconCheck size={14} strokeWidth={2.4} /> : <IconPlus size={14} />}
                  </motion.span>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </section>
    </StepShell>
  );
}
