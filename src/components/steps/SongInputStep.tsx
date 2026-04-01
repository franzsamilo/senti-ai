"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import StepIndicator from "@/components/StepIndicator";
import SongChip from "@/components/ui/SongChip";
import Button from "@/components/ui/Button";
import { searchSongs, songDatabase } from "@/data/songs";
import { Song } from "@/lib/types";
import type { SpotifyTrack } from "@/lib/spotify";

const MAX_SONGS = 10;
const MIN_SONGS = 5;
const MAX_RESULTS = 25;

interface SongInputStepProps {
  songs: Song[];
  onSongsChange: (songs: Song[]) => void;
  onNext: () => void;
}

function spotifyTrackToSong(track: SpotifyTrack): Song {
  const title = track.name;
  const artist = track.artists.map((a) => a.name).join(", ");

  // Try to cross-reference against the built-in database (case-insensitive)
  const match = songDatabase.find(
    (s) =>
      s.title.toLowerCase() === title.toLowerCase() &&
      s.artist.toLowerCase().includes(artist.split(",")[0].toLowerCase())
  );

  if (match) return match;

  return {
    title,
    artist,
    mood: "unknown",
    painIndex: 5.5,
  };
}

export default function SongInputStep({ songs, onSongsChange, onNext }: SongInputStepProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [open, setOpen] = useState(false);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Song request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestArtist, setRequestArtist] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  // Read Spotify tracks from sessionStorage on mount
  useEffect(() => {
    const raw = sessionStorage.getItem("spotify_tracks");
    if (!raw) return;
    try {
      const parsed: SpotifyTrack[] = JSON.parse(raw);
      setSpotifyTracks(parsed);
    } catch {
      // malformed data — ignore silently
    }
    sessionStorage.removeItem("spotify_tracks");
  }, []);

  // Update dropdown results whenever query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setOpen(false);
      setShowRequestForm(false);
      setRequestSubmitted(false);
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

  function openRequestForm() {
    setRequestTitle(query.trim());
    setRequestArtist("");
    setRequestSubmitted(false);
    setShowRequestForm(true);
  }

  async function submitRequest() {
    const title = requestTitle.trim();
    const artist = requestArtist.trim();
    if (!title || !artist) return;
    setRequestLoading(true);
    try {
      await fetch("/api/song-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, artist }),
      });
    } catch {
      // best-effort — show confirmation regardless
    } finally {
      setRequestLoading(false);
      setRequestSubmitted(true);
      setTimeout(() => {
        setShowRequestForm(false);
        setRequestSubmitted(false);
      }, 3000);
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
          Select 5–10 songs that define your emotional state rn
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
              showPainIndex={false}
              onRemove={() => removeSong(i)}
            />
          ))}
        </div>
      )}

      {/* Spotify track list */}
      {spotifyTracks.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
            Your top Spotify tracks
          </p>
          <div className="max-h-48 sm:max-h-64 overflow-y-auto flex flex-col gap-1 pr-1">
            {spotifyTracks.map((track, i) => {
              const song = spotifyTrackToSong(track);
              const alreadyAdded = songs.some(
                (s) =>
                  s.title.toLowerCase() === song.title.toLowerCase() &&
                  s.artist.toLowerCase() === song.artist.toLowerCase()
              );
              const albumArt = track.album.images[track.album.images.length - 1]?.url;

              return (
                <button
                  key={i}
                  onClick={() => !alreadyAdded && canAdd && addSong(song)}
                  disabled={alreadyAdded || !canAdd}
                  className={[
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-100 border",
                    alreadyAdded || !canAdd
                      ? "border-border-subtle opacity-40 cursor-not-allowed"
                      : "border-border-subtle hover:border-accent/40 hover:bg-accent/5 cursor-pointer",
                  ].join(" ")}
                >
                  {albumArt ? (
                    <Image
                      src={albumArt}
                      alt={track.name}
                      width={32}
                      height={32}
                      className="rounded shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-bg-card shrink-0" />
                  )}
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm text-text-primary font-medium truncate">
                      {track.name}
                    </span>
                    <span className="text-xs text-text-muted truncate">
                      {track.artists.map((a) => a.name).join(", ")}
                    </span>
                  </div>
                  {alreadyAdded && (
                    <span className="font-mono text-xs text-accent-success shrink-0">added</span>
                  )}
                </button>
              );
            })}
          </div>
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
          <ul className="absolute z-50 mt-1 w-full bg-[#0f0f18] border border-border-subtle rounded-lg overflow-y-auto max-h-[300px] shadow-xl">
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
                  {isDuplicate(song) && (
                    <span className="text-xs text-text-muted ml-4 shrink-0">added</span>
                  )}
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

      {/* Can't find song? — request form, shown below search when no results */}
      {query.trim().length >= 2 && results.length === 0 && canAdd && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-text-secondary">
            Can&apos;t find your song?
          </p>
          <div className="flex flex-col gap-2 text-xs text-text-muted font-mono">
            <span>
              [Type it and press Enter to add it anyway]
            </span>
            {!showRequestForm && (
              <button
                onClick={openRequestForm}
                className="text-left text-accent hover:underline w-fit"
              >
                [Request it to be added →]
              </button>
            )}
          </div>

          {showRequestForm && (
            <div className="bg-bg-card border border-border-subtle rounded-lg p-3 space-y-2">
              {requestSubmitted ? (
                <p className="text-xs text-accent-success font-mono">Submitted! ✓ Thanks, we&apos;ll consider adding it.</p>
              ) : (
                <>
                  <p className="text-xs text-text-muted font-mono">📝 Request a song</p>
                  <input
                    type="text"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    placeholder="Song title"
                    maxLength={100}
                    className="w-full bg-[#0f0f18] border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/60 transition-colors duration-150"
                  />
                  <input
                    type="text"
                    value={requestArtist}
                    onChange={(e) => setRequestArtist(e.target.value)}
                    placeholder="Artist"
                    maxLength={100}
                    className="w-full bg-[#0f0f18] border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/60 transition-colors duration-150"
                  />
                  <Button
                    onClick={submitRequest}
                    disabled={requestLoading || !requestTitle.trim() || !requestArtist.trim()}
                    className="px-4 py-2 text-xs min-h-[36px]"
                  >
                    {requestLoading ? "Submitting..." : "Submit Request"}
                  </Button>
                  <p className="text-xs text-text-muted">
                    We&apos;ll consider adding it! Your song will still work — our AI analyzes it on the fly.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-text-muted font-mono">
        Press Enter to add the top result, or click a suggestion.
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
