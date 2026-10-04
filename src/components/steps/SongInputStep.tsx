"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import Button from "@/components/ui/Button";
import {
  IconArrowRight,
  IconCheck,
  IconClose,
  IconEdit,
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

  /** Blank lines on the J-card: the minimum first, then up to the sweet spot. */
  const blankLines = Math.max(0, (songs.length < MIN_SONGS ? MIN_SONGS : SWEET_SPOT) - songs.length);

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
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink">
          <IconSearch size={24} tone={query ? "#ffd23a" : "none"} />
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
          className="w-full rounded-[12px] border-2 border-ink bg-paper-light pl-12 pr-4 py-4 text-[17px] text-ink placeholder:text-text-muted outline-none transition-shadow focus:shadow-[0_0_0_4px_var(--yellow)] disabled:opacity-60"
        />

        <AnimatePresence>
          {open && optionCount > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="absolute mt-2 w-full bg-paper-light border-2 border-ink rounded-[12px] overflow-y-auto max-h-[330px] shadow-[var(--shadow-hard)] py-1"
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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 min-h-[56px] text-left transition-colors ${
                        added ? "opacity-50 cursor-default" : i === activeIndex ? "bg-yellow-soft" : ""
                      } cursor-pointer`}
                    >
                      <span className="flex flex-col min-w-0 flex-1">
                        <span className="text-[16px] font-semibold text-ink truncate">{song.title}</span>
                        <span className="text-[13px] text-text-muted truncate">{song.artist}</span>
                      </span>
                      <PainTag value={song.painIndex} />
                      {added ? (
                        <IconCheck size={18} className="text-accent-success shrink-0" />
                      ) : (
                        <IconPlus size={18} className="text-ink shrink-0" />
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
                      results.length > 0 ? "border-t-2 border-dashed border-ink/20" : ""
                    } ${activeIndex === results.length ? "bg-yellow-soft" : ""}`}
                  >
                    <IconEdit size={22} className="text-ink shrink-0" />
                    <span className="flex flex-col min-w-0">
                      <span className="text-[16px] text-ink truncate">
                        Add &ldquo;{query.trim()}&rdquo;
                      </span>
                      <span className="text-[12.5px] text-text-muted">
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
        <div className="-mt-2 text-[14px] text-text-secondary">
          {!showRequestForm ? (
            <button onClick={openRequestForm} className="text-pink-ink font-semibold hover:underline cursor-pointer">
              Wala sa list? Request it to be added →
            </button>
          ) : (
            <div className="paper p-4 flex flex-col gap-2.5">
              {requestState === "sent" ? (
                <p className="text-accent-success font-medium">Request sent — salamat! It still works for your scan today.</p>
              ) : (
                <>
                  <p className="font-display font-extrabold text-[19px] text-ink leading-none">Request a song</p>
                  <input
                    type="text"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    placeholder="Song title"
                    maxLength={100}
                    className="w-full bg-paper-light border-2 border-ink/30 rounded-[10px] px-3.5 py-2.5 text-base outline-none focus:border-ink"
                  />
                  <input
                    type="text"
                    value={requestArtist}
                    onChange={(e) => setRequestArtist(e.target.value)}
                    placeholder="Artist"
                    maxLength={100}
                    className="w-full bg-paper-light border-2 border-ink/30 rounded-[10px] px-3.5 py-2.5 text-base outline-none focus:border-ink"
                  />
                  <Button
                    variant="secondary"
                    onClick={submitRequest}
                    disabled={requestState === "sending" || !requestTitle.trim() || !requestArtist.trim()}
                    className="self-start min-h-[42px] py-2 text-[15px]"
                  >
                    {requestState === "sending" ? "Sending…" : "Send request"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Your list: a cassette J-card ── */}
      <section className="paper overflow-hidden" aria-label="Your songs" style={{ borderRadius: 4 }}>
        {/* spine */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-pink border-b-2 border-ink">
          <span className="font-hand text-[20px] leading-none text-ink truncate">Side A — para sa&apos;yo &apos;to</span>
          <span className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-[11px] text-ink tabular-nums" style={{ fontStretch: "87.5%" }}>
              {songs.length}/{MAX_SONGS}
            </span>
            {songs.length > 0 && (
              <button
                onClick={() => onSongsChange([])}
                className="font-display font-extrabold uppercase tracking-[0.04em] text-[13px] text-ink underline decoration-2 underline-offset-2 hover:text-paper-light cursor-pointer min-h-[32px]"
              >
                Clear
              </button>
            )}
          </span>
        </div>

        <ol className="px-3 sm:px-4 pb-2">
          <AnimatePresence initial={false}>
            {songs.map((song, i) => (
              <motion.li
                key={`${song.title}-${song.artist}`}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
                transition={spring}
                className="grid grid-cols-[30px_1fr_auto_auto] items-center gap-2 min-h-[54px] border-b border-[rgba(43,78,224,0.22)]"
              >
                <span className="font-mono text-[11px] text-text-muted tabular-nums" style={{ fontStretch: "87.5%" }}>
                  {trackNo(i)}
                </span>
                <span className="flex flex-col min-w-0 py-1.5">
                  <span className="font-hand text-[21px] leading-[1.05] text-blue-ink truncate">{song.title}</span>
                  <span className="text-[12.5px] text-text-muted truncate">{song.artist}</span>
                </span>
                {song.mood === "unknown" ? (
                  <span className="font-hand text-[15px] text-text-muted">reading…</span>
                ) : (
                  <PainTag value={song.painIndex} />
                )}
                <button
                  onClick={() => removeSong(i)}
                  aria-label={`Remove ${song.title}`}
                  className="grid place-items-center w-10 h-10 -mr-1 rounded-[8px] text-ink/60 hover:text-ink hover:bg-pink-soft transition-colors cursor-pointer"
                >
                  <IconClose size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          {Array.from({ length: blankLines }, (_, k) => (
            <li
              key={`blank-${k}`}
              aria-hidden
              className="grid grid-cols-[30px_1fr] items-center gap-2 min-h-[54px] border-b border-[rgba(43,78,224,0.22)]"
            >
              <span className="font-mono text-[11px] text-text-muted/60 tabular-nums" style={{ fontStretch: "87.5%" }}>
                {trackNo(songs.length + k)}
              </span>
              {songs.length === 0 && k === 0 && (
                <span className="font-hand text-[19px] text-text-muted/80">search above, or tap a few picks below…</span>
              )}
            </li>
          ))}
        </ol>
        <p className="px-4 pb-3 pt-1 font-hand text-[18px] text-pink-ink -rotate-[0.8deg]">
          {songs.length < MIN_SONGS
            ? `${MIN_SONGS - songs.length} more to continue`
            : songs.length < SWEET_SPOT
            ? `${SWEET_SPOT - songs.length} more for the sharpest read — or go na`
            : "perfect sample size. ready ka na."}
        </p>
      </section>

      {/* ── Quick picks: a page from the videoke songbook ── */}
      <section className="flex flex-col" aria-label="Quick picks">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 relative z-10">
          {QUICK_PICKS.map((group) => {
            const active = group.id === activePicks?.id;
            return (
              <button
                key={group.id}
                onClick={() => setPickGroup(group.id)}
                aria-pressed={active}
                className={`relative shrink-0 rounded-t-[10px] border-2 border-b-0 border-ink px-3.5 pt-2 pb-2.5 font-display font-extrabold uppercase tracking-[0.03em] text-[14px] leading-none transition-colors cursor-pointer ${
                  active ? "bg-ink text-yellow translate-y-[2px]" : "bg-paper-dark text-ink hover:bg-yellow-soft translate-y-[6px]"
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>
        <div className="paper border-2 border-ink relative" style={{ borderRadius: "0 10px 10px 10px" }}>
          <div className="grid grid-cols-[56px_1fr_auto] gap-2 px-3.5 py-2 border-b-2 border-ink font-display font-extrabold uppercase text-[12px] tracking-[0.08em] text-ink/70">
            <span>Code</span>
            <span>Title / Artist</span>
            <span />
          </div>
          <AnimatePresence mode="wait">
            <motion.ul
              key={activePicks?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x-2 divide-dashed divide-ink/15"
            >
              {activePicks?.songs.map((song) => {
                const added = isAdded(song);
                return (
                  <li key={`${song.title}-${song.artist}`} className="border-b border-dashed border-ink/15">
                    <motion.button
                      onClick={() => toggleSong(song)}
                      disabled={!added && !canAdd}
                      whileTap={{ scale: 0.98 }}
                      aria-pressed={added}
                      className={`w-full grid grid-cols-[56px_1fr_auto] items-center gap-2 px-3.5 py-2.5 min-h-[56px] text-left transition-colors cursor-pointer disabled:opacity-40 ${
                        added ? "bg-yellow-soft" : "hover:bg-paper-dark/50"
                      }`}
                    >
                      <span className="font-mono text-[12px] text-pink-ink tabular-nums" style={{ fontStretch: "87.5%" }}>
                        {songCode(song)}
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-[15px] font-semibold text-ink truncate">{song.title}</span>
                        <span className="text-[12.5px] text-text-muted truncate">{song.artist}</span>
                      </span>
                      <motion.span
                        key={added ? "on" : "off"}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={popSpring}
                        className={`shrink-0 grid place-items-center w-8 h-8 rounded-full border-2 border-ink ${
                          added ? "bg-ink text-yellow" : "text-ink"
                        }`}
                      >
                        {added ? <IconCheck size={15} strokeWidth={3} /> : <IconPlus size={15} strokeWidth={2.6} />}
                      </motion.span>
                    </motion.button>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </section>
    </StepShell>
  );
}

/** A1–A12 on side A, B1–B13 on side B. */
function trackNo(index: number) {
  return index < 12 ? `A${index + 1}` : `B${index - 11}`;
}

/**
 * Videoke songbook number. Stable per song (a hash of title + artist) so the
 * same song always has the same code, like a real songbook.
 */
function songCode(song: Song) {
  let h = 7;
  for (const ch of `${song.title}|${song.artist}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return String(10000 + (h % 89999));
}

/**
 * Pain index as a plain tape-counter readout. Deliberately neutral — no
 * "hot track" highlight — so the questions don't telegraph what the
 * results are going to do with it.
 */
function PainTag({ value }: { value: number }) {
  return (
    <span
      title="Pain index"
      className="shrink-0 inline-flex items-baseline gap-1 rounded-[5px] border-[1.5px] border-ink/40 px-1.5 py-[3px] font-mono text-[11.5px] tabular-nums leading-none text-ink"
      style={{ fontStretch: "87.5%" }}
    >
      {value.toFixed(1)}
    </span>
  );
}
