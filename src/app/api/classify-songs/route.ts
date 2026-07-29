import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getCachedClassification,
  setCachedClassification,
} from "@/lib/classificationCache";

const client = new Anthropic();

interface SongInput {
  title: string;
  artist: string;
}

interface ClassifiedSong {
  title: string;
  artist: string;
  mood: string;
  painIndex: number;
}

export async function POST(req: NextRequest) {
  let body: { songs: SongInput[] };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { songs } = body;

  if (!Array.isArray(songs) || songs.length === 0) {
    return NextResponse.json({ error: "songs array is required" }, { status: 400 });
  }

  const results: ClassifiedSong[] = [];
  const uncached: SongInput[] = [];

  for (const song of songs) {
    const cached = getCachedClassification(song.title, song.artist);
    if (cached) {
      results.push({ title: song.title, artist: song.artist, ...cached });
    } else {
      uncached.push(song);
    }
  }

  if (uncached.length > 0) {
    const songList = uncached
      .map((s) => `- "${s.title}" by ${s.artist}`)
      .join("\n");

    const prompt = `You are a music mood classifier. For each song, determine its emotional mood and pain index.

Classify each into ONE mood from: yearning, heartbreak, letting_go, kilig, toxic, denial, nostalgia, devotion, infatuation, existential, hopeless_crush, forbidden, sweet_pining, loyalty, anxiety, lost_love, adoration, warmth, obsession, belonging, tragic_hope, jealousy

Assign a painIndex from 0.0 to 10.0 (0-3 happy, 4-6 bittersweet, 7-8 heartbreak, 9-10 devastation).

If you don't recognize a song, guess from the title and artist's style. Default to painIndex 5.0 and mood "existential" if truly unknown.

Respond ONLY with a JSON array: [{"title":"...","artist":"...","mood":"...","painIndex":0.0}]

Songs to classify:
${songList}`;

    try {
      const message = await client.messages.create({
        model: "claude-opus-5",
        // Scales with the batch — users can now add up to 25 songs, and a
        // truncated response would drop classifications silently.
        max_tokens: Math.min(4000, 400 + uncached.length * 120),
        thinking: { type: "disabled" },
        output_config: { effort: "low" },
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

      // Extract JSON array from the response
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const classified: ClassifiedSong[] = JSON.parse(jsonMatch[0]);
        for (const item of classified) {
          setCachedClassification(item.title, item.artist, item.mood, item.painIndex);
          results.push(item);
        }
      } else {
        // Fallback: assign defaults to all uncached songs
        for (const song of uncached) {
          const fallback: ClassifiedSong = {
            title: song.title,
            artist: song.artist,
            mood: "existential",
            painIndex: 5.0,
          };
          setCachedClassification(song.title, song.artist, fallback.mood, fallback.painIndex);
          results.push(fallback);
        }
      }
    } catch {
      // On any API error, push fallback defaults so the wizard never breaks
      for (const song of uncached) {
        const fallback: ClassifiedSong = {
          title: song.title,
          artist: song.artist,
          mood: "existential",
          painIndex: 5.0,
        };
        results.push(fallback);
      }
    }
  }

  return NextResponse.json(results);
}
