import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildMatchPrompt } from "@/lib/buildMatchPrompt";
import { checkRateLimit } from "@/lib/rateLimit";
import type { UserProfile, MatchResult } from "@/lib/types";

interface MatchEntry {
  profileA: UserProfile;
  profileB?: UserProfile;
  matchResult?: MatchResult;
  createdAt: number;
}

const matchStore = new Map<string, MatchEntry>();

const TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

function cleanupExpired() {
  const now = Date.now();
  for (const [id, entry] of matchStore.entries()) {
    if (now - entry.createdAt > TTL_MS) {
      matchStore.delete(id);
    }
  }
}

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function GET(req: NextRequest) {
  cleanupExpired();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const entry = matchStore.get(id);
  if (!entry) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    id,
    profileA: entry.profileA,
    profileB: entry.profileB ?? null,
    matchResult: entry.matchResult ?? null,
    completed: !!entry.matchResult,
  });
}

export async function POST(req: NextRequest) {
  cleanupExpired();

  let body: {
    action: "create" | "complete";
    profileA?: UserProfile;
    profileB?: UserProfile;
    id?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (body.action === "create") {
    if (!body.profileA) {
      return NextResponse.json({ error: "missing_profileA" }, { status: 400 });
    }

    let id = generateId();
    // Ensure uniqueness (collision is astronomically unlikely but handle it)
    while (matchStore.has(id)) {
      id = generateId();
    }

    matchStore.set(id, {
      profileA: body.profileA,
      createdAt: Date.now(),
    });

    return NextResponse.json({ id });
  }

  if (body.action === "complete") {
    if (!body.id || !body.profileB) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const entry = matchStore.get(body.id);
    if (!entry) {
      return NextResponse.json({ error: "match_not_found" }, { status: 404 });
    }

    // Rate limit User B's IP
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = (forwarded ? forwarded.split(",")[0].trim() : realIp) ?? "unknown";

    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: "The creator of Senti.AI believed in second chances... not a third though. 'D ako bobo.",
        },
        { status: 429 }
      );
    }

    // If already completed, return cached result
    if (entry.matchResult && entry.profileB) {
      return NextResponse.json({
        matchResult: entry.matchResult,
        profileA: entry.profileA,
        profileB: entry.profileB,
      });
    }

    // Store profileB
    entry.profileB = body.profileB;

    try {
      const { system, user } = buildMatchPrompt(entry.profileA, body.profileB);

      const anthropic = new Anthropic();

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system,
        messages: [{ role: "user", content: user }],
      });

      const textBlock = message.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in API response");
      }

      let raw = textBlock.text.trim();
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

      const matchResult: MatchResult = JSON.parse(raw);

      // Persist to store
      entry.matchResult = matchResult;

      return NextResponse.json({
        matchResult,
        profileA: entry.profileA,
        profileB: body.profileB,
      });
    } catch (err) {
      console.error("[/api/match] error:", err);
      // Fallback match result so users always get something
      const fallbackResult: MatchResult = generateFallbackMatch(entry.profileA, body.profileB);
      entry.matchResult = fallbackResult;

      return NextResponse.json({
        matchResult: fallbackResult,
        profileA: entry.profileA,
        profileB: body.profileB,
      });
    }
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}

function generateFallbackMatch(profileA: UserProfile, profileB: UserProfile): MatchResult {
  const scoreA = profileA.result.emotional_damage_score;
  const scoreB = profileB.result.emotional_damage_score;
  const avgScore = (scoreA + scoreB) / 2;
  const compatScore = Math.max(5, Math.round(100 - avgScore * 7));

  const threatLevels = ["CRITICAL", "SEVERE", "ELEVATED", "MODERATE", "LOW"];
  const combinedIdx = Math.min(
    4,
    threatLevels.indexOf(profileA.result.threat_level) +
      threatLevels.indexOf(profileB.result.threat_level)
  );
  const combinedThreat = threatLevels[Math.floor(combinedIdx / 2)];

  return {
    match_headline: `Dalawang sawi, isang universe. Charot. (Hindi charot.)`,
    combined_threat_level: combinedThreat,
    compatibility_score: compatScore,
    who_texts_first: `${profileA.attachmentStyle === "anxious" ? "Person A" : "Person B"} — ${
      profileA.attachmentStyle === "anxious"
        ? "anxious attachment doesn't sleep, friend"
        : "because someone has to end the deafening silence"
    }`,
    who_ghosts_first: `${profileB.attachmentStyle === "avoidant" ? "Person B" : profileA.attachmentStyle === "avoidant" ? "Person A" : "Person B"} — avoidant energy detected`,
    talking_stage_duration: `6-8 months. Neither of you will DTR. You'll just vibe until one of you posts a "healing era" IG story.`,
    biggest_red_flag_combo: `${profileA.mbti} + ${profileB.mbti} + ${profileA.attachmentStyle}/${profileB.attachmentStyle} attachment combo = the talking stage that never ends`,
    relationship_prediction: `Magiging MU kayo for approximately 7 months. Hindi kayo mag-DTR. Magpopost si ${profileA.zodiac} ng cryptic quote, si ${profileB.zodiac} naman ay magbubukas ng ibang app. Pero somehow you'll keep coming back to each other like a broken Spotify loop.`,
    song_overlap_roast: `Your combined playlist is either a masterpiece of shared pain or a red flag that you're both drowning in the same emotional damage. Pareho kayong hindi okay — at least you have that in common.`,
    final_match_verdict: `Compatibility score: ${compatScore}/100. Hindi ito magandang score, bestie. Pero the chaotic energy between ${profileA.mbti} and ${profileB.mbti} is either going to produce something beautiful or a 47-message thread in someone's barkada GC. Malamang ang huli. Good luck — you're both going to need it.`,
  };
}
