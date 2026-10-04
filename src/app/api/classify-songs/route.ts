import { NextRequest, NextResponse } from "next/server";
import {
  getCachedClassification,
  setCachedClassification,
} from "@/lib/classificationCache";
import { describeError, generateJson, hasCredentials } from "@/lib/claude";
import type { Mood } from "@/lib/types";

/** Low-effort and small, but give it room on a cold start. */
export const maxDuration = 60;

const MOODS: Exclude<Mood, "unknown">[] = [
  "yearning",
  "heartbreak",
  "letting_go",
  "kilig",
  "toxic",
  "denial",
  "nostalgia",
  "devotion",
  "infatuation",
  "existential",
  "hopeless_crush",
  "forbidden",
  "sweet_pining",
  "loyalty",
  "anxiety",
  "lost_love",
  "adoration",
  "warmth",
  "obsession",
  "belonging",
  "tragic_hope",
  "jealousy",
];

const MAX_SONGS = 25;
const MAX_FIELD_LEN = 200;

// Structured outputs need an object at the top level, so the list is wrapped.
const CLASSIFICATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["songs"],
  properties: {
    songs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "artist", "mood", "painIndex"],
        properties: {
          title: { type: "string" },
          artist: { type: "string" },
          mood: { type: "string", enum: MOODS },
          painIndex: { type: "number", description: "0.0 to 10.0" },
        },
      },
    },
  },
} as const;

const SYSTEM = `You classify songs by emotional mood and pain index for a Filipino music-personality app.

For each song pick exactly one mood from the allowed list, and a painIndex from 0.0 to 10.0:
0-3 happy / kilig / warm, 4-6 bittersweet / pining, 7-8 real heartbreak / nostalgia / anxiety, 9-10 devastation / letting go.

Use what you know about the song. If you don't recognise it, infer from the title (Tagalog and Taglish titles included) and the artist's usual style, and keep painIndex near the middle of the range that mood implies. Return the title and artist exactly as given.`;

interface SongInput {
  title: string;
  artist: string;
}

interface ClassifiedSong {
  title: string;
  artist: string;
  mood: Mood;
  painIndex: number;
}

const neutral = (song: SongInput): ClassifiedSong => ({
  title: song.title,
  artist: song.artist,
  mood: "existential",
  painIndex: 5.0,
});

export async function POST(req: NextRequest) {
  let body: { songs?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!Array.isArray(body.songs) || body.songs.length === 0) {
    return NextResponse.json({ error: "songs array is required" }, { status: 400 });
  }

  const songs: SongInput[] = body.songs.slice(0, MAX_SONGS).map((s) => ({
    title: String((s as SongInput)?.title ?? "").slice(0, MAX_FIELD_LEN),
    artist: String((s as SongInput)?.artist ?? "Unknown Artist").slice(0, MAX_FIELD_LEN),
  }));

  const results: ClassifiedSong[] = [];
  const uncached: SongInput[] = [];

  for (const song of songs) {
    const cached = getCachedClassification(song.title, song.artist);
    if (cached) {
      results.push({ ...song, mood: cached.mood as Mood, painIndex: cached.painIndex });
    } else {
      uncached.push(song);
    }
  }

  if (uncached.length === 0) return NextResponse.json(results);

  if (!hasCredentials()) {
    return NextResponse.json([...results, ...uncached.map(neutral)]);
  }

  try {
    const { data } = await generateJson({
      system: SYSTEM,
      user: `Songs to classify:\n${uncached.map((s) => `- "${s.title}" by ${s.artist}`).join("\n")}`,
      schema: CLASSIFICATION_SCHEMA,
      // Thinking can't be disabled on Opus 5.5; low effort keeps this quick.
      effort: "low",
      // Thinking counts toward the limit, and the batch can be 25 songs long.
      maxTokens: Math.min(8000, 1500 + uncached.length * 150),
    });

    const classified = Array.isArray((data as { songs?: unknown }).songs)
      ? ((data as { songs: ClassifiedSong[] }).songs)
      : [];

    for (const song of uncached) {
      const match = classified.find(
        (c) =>
          typeof c?.title === "string" &&
          c.title.toLowerCase() === song.title.toLowerCase()
      );
      if (match && MOODS.includes(match.mood as Exclude<Mood, "unknown">)) {
        const painIndex = Math.min(10, Math.max(0, Number(match.painIndex) || 5));
        setCachedClassification(song.title, song.artist, match.mood, painIndex);
        results.push({ ...song, mood: match.mood, painIndex });
      } else {
        results.push(neutral(song));
      }
    }
  } catch (err) {
    // The wizard must never break over this — neutral values are fine.
    console.error("[/api/classify-songs] FAILED", describeError(err));
    results.push(...uncached.map(neutral));
  }

  return NextResponse.json(results);
}
