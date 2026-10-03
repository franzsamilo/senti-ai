import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/buildPrompt";
import { checkRateLimit } from "@/lib/rateLimit";
import { MAX_CONTEXT_CHARS } from "@/lib/sanitize";
import { PROFILE_RESULT_SCHEMA } from "@/lib/resultSchema";
import { normalizeProfileResult } from "@/lib/normalizeResult";
import { computeScoreProfile } from "@/lib/scoring";
import { MODEL, describeError, generateJson, hasCredentials } from "@/lib/claude";
import type {
  AnalysisRequest,
  AttachmentStyle,
  LoveLanguage,
  Mood,
  ProfileResult,
} from "@/lib/types";

/**
 * `medium` is the Opus 5.5 API default, set explicitly so a future default
 * change can't silently move it. On this model `medium` already out-thinks
 * Opus 5 at `high`, and pushing higher makes the model converge on what it
 * judges the single best answer — which across users reads as the same
 * answer. This is a creative-voice task: variance between people matters
 * more than squeezing out the optimum.
 */
const EFFORT = "medium" as const;

// Thinking can't be turned off on Opus 5.5 and counts against max_tokens, so
// this covers reasoning AND the full report. The retry gets real headroom.
const MAX_TOKENS = 16000;
const RETRY_MAX_TOKENS = 24000;

// Server-side caps — the client enforces its own, this is the real boundary.
const MAX_SONGS = 25;
const MAX_FIELD_LEN = 200;

const ATTACHMENT_STYLES: AttachmentStyle[] = ["anxious", "avoidant", "disorganized", "secure"];
const LOVE_LANGUAGES: LoveLanguage[] = ["words", "acts", "gifts", "time", "touch"];

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = (forwarded ? forwarded.split(",")[0].trim() : realIp) ?? "unknown";

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "The creator of Senti.AI believed in second chances... not a third though. 'D ako bobo.",
      },
      { status: 429 }
    );
  }

  let body: AnalysisRequest & { personalContext?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body is not valid JSON." },
      { status: 400 }
    );
  }

  const { songs, mbti, attachmentStyle, loveLanguage, zodiac, fingerprint, personalContext } = body;

  if (
    !Array.isArray(songs) ||
    songs.length === 0 ||
    !mbti ||
    !ATTACHMENT_STYLES.includes(attachmentStyle) ||
    !Array.isArray(loveLanguage) ||
    !zodiac ||
    !fingerprint
  ) {
    return NextResponse.json(
      { error: "invalid_request", message: "Missing required fields." },
      { status: 400 }
    );
  }

  // Clamp untrusted input before it reaches the prompt or the scorer.
  const safeSongs = songs.slice(0, MAX_SONGS).map((s) => ({
    title: String(s.title ?? "").slice(0, MAX_FIELD_LEN),
    artist: String(s.artist ?? "Unknown Artist").slice(0, MAX_FIELD_LEN),
    mood: (typeof s.mood === "string" ? s.mood : "unknown") as Mood,
    painIndex:
      typeof s.painIndex === "number" && Number.isFinite(s.painIndex)
        ? Math.min(10, Math.max(0, s.painIndex))
        : 5.5,
  }));
  const safeLanguages = loveLanguage.filter((l): l is LoveLanguage => LOVE_LANGUAGES.includes(l));
  const safeMbti = String(mbti).slice(0, 8);
  const safeContext = personalContext
    ? String(personalContext).slice(0, MAX_CONTEXT_CHARS)
    : undefined;

  const scores = computeScoreProfile(safeSongs, safeMbti, attachmentStyle, safeLanguages);

  if (!hasCredentials()) {
    console.error("[/api/analyze] no Anthropic credentials — every analysis will fall back");
    return NextResponse.json(
      { error: "analysis_failed", reason: "missing_credentials", message: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { system, user } = buildPrompt(
      safeSongs,
      safeMbti,
      attachmentStyle,
      safeLanguages,
      String(zodiac).slice(0, 32),
      scores,
      safeContext
    );

    const { data, servedBy } = await generateJson({
      system,
      user,
      schema: PROFILE_RESULT_SCHEMA,
      effort: EFFORT,
      maxTokens: MAX_TOKENS,
      retryMaxTokens: RETRY_MAX_TOKENS,
      // The system prompt is large and byte-identical for every user.
      cacheSystem: true,
    });

    if (servedBy !== MODEL) {
      console.warn(`[/api/analyze] served by fallback model ${servedBy}`);
    }

    // The schema fixes the shape; normalization fixes what the schema can't
    // express — array lengths, string hygiene, and every number held to its
    // calibration band.
    const result: ProfileResult = normalizeProfileResult(data, scores);

    return NextResponse.json({ result, remaining, source: "model" });
  } catch (err) {
    // Log everything useful. A generic "API call failed" line is how a broken
    // model config once sat in production handing every user the template.
    const detail = describeError(err);
    console.error("[/api/analyze] FAILED", { model: MODEL, ...detail });

    return NextResponse.json(
      {
        error: "analysis_failed",
        // Surfaced so the client can mark the report as degraded rather than
        // passing a template off as a real analysis.
        reason: detail.reason,
        message: detail.message ?? "API call failed",
      },
      { status: 500 }
    );
  }
}
