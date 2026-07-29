import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt } from "@/lib/buildPrompt";
import { checkRateLimit } from "@/lib/rateLimit";
import { MAX_CONTEXT_CHARS } from "@/lib/sanitize";
import { PROFILE_RESULT_SCHEMA } from "@/lib/resultSchema";
import { normalizeProfileResult } from "@/lib/normalizeResult";
import type { AnalysisRequest, ProfileResult } from "@/lib/types";

const MODEL = "claude-opus-5";

/**
 * Deliberately not "high". Higher effort makes the model converge on what it
 * judges to be the single best answer, which across users reads as the same
 * answer. This is a creative-voice task, not a correctness task — variance
 * between users matters more here than squeezing out the optimum.
 */
const EFFORT = "medium" as const;

// Server-side caps — the client enforces its own, this is the real boundary.
const MAX_SONGS = 25;
const MAX_FIELD_LEN = 200;

export async function POST(req: NextRequest) {
  // Resolve client IP
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = (forwarded ? forwarded.split(",")[0].trim() : realIp) ?? "unknown";

  // Server-side rate limit check
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

  // Parse and validate request body
  let body: AnalysisRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body is not valid JSON." },
      { status: 400 }
    );
  }

  const { songs, mbti, attachmentStyle, loveLanguage, zodiac, fingerprint, personalContext } = body as AnalysisRequest & { personalContext?: string };

  if (
    !songs ||
    !Array.isArray(songs) ||
    songs.length === 0 ||
    !mbti ||
    !attachmentStyle ||
    !loveLanguage ||
    !zodiac ||
    !fingerprint
  ) {
    return NextResponse.json(
      { error: "invalid_request", message: "Missing required fields." },
      { status: 400 }
    );
  }

  // Clamp untrusted input before it reaches the prompt
  const safeSongs = songs.slice(0, MAX_SONGS).map((s) => ({
    title: String(s.title ?? "").slice(0, MAX_FIELD_LEN),
    artist: String(s.artist ?? "Unknown Artist").slice(0, MAX_FIELD_LEN),
    mood: s.mood ?? "unknown",
    painIndex:
      typeof s.painIndex === "number" && Number.isFinite(s.painIndex)
        ? Math.min(10, Math.max(0, s.painIndex))
        : 5.5,
  }));
  const safeContext = personalContext
    ? String(personalContext).slice(0, MAX_CONTEXT_CHARS)
    : undefined;

  try {
    const { system, user } = buildPrompt(
      safeSongs,
      String(mbti).slice(0, 8),
      attachmentStyle,
      loveLanguage,
      String(zodiac).slice(0, 32),
      safeContext
    );

    const anthropic = new Anthropic();

    const baseRequest = {
      model: MODEL,
      // Adaptive thinking is on by default and counts against max_tokens,
      // so this has to cover reasoning AND the full report.
      max_tokens: 12000,
      // The system prompt is large and byte-identical on every request —
      // cache it so repeat analyses pay ~10% for the prefix.
      system: [
        {
          type: "text" as const,
          text: system,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      messages: [{ role: "user" as const, content: user }],
    };

    // Structured outputs guarantee the response parses. If the account or API
    // version rejects the parameter, we must NOT lose the whole analysis over
    // it — a silent drop to the static fallback is exactly how every user ends
    // up with the same templated report.
    const requestAnalysis = (structured: boolean) =>
      anthropic.messages.create({
        ...baseRequest,
        output_config: structured
          ? {
              effort: EFFORT,
              format: { type: "json_schema", schema: PROFILE_RESULT_SCHEMA },
            }
          : { effort: EFFORT },
      });

    let message;
    try {
      message = await requestAnalysis(true);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 400) {
        console.warn(
          "[/api/analyze] structured outputs rejected, retrying without:",
          (err as Error)?.message
        );
        message = await requestAnalysis(false);
      } else {
        throw err;
      }
    }

    // A truncated response is unparseable JSON. One retry is far cheaper than
    // dropping the user to the static fallback roast.
    if (message.stop_reason === "max_tokens") {
      console.warn("[/api/analyze] hit max_tokens, retrying once");
      message = await requestAnalysis(true);
    }

    // Safety classifiers can decline a request outright (HTTP 200, empty
    // content). Fall through to the client's fallback roast rather than
    // rendering an empty dashboard.
    if (message.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "analysis_failed", message: "Analysis declined" },
        { status: 500 }
      );
    }

    // Extract the text content block (skips any thinking blocks)
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in API response");
    }

    // Strip markdown code fences if present (belt-and-braces — structured
    // outputs shouldn't emit them)
    let raw = textBlock.text.trim();
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    // The schema fixes the shape; normalization fixes the contents the schema
    // can't express — array lengths, score ranges, empty strings.
    const result: ProfileResult = normalizeProfileResult(JSON.parse(raw));

    return NextResponse.json({ result, remaining, source: "model" });
  } catch (err) {
    // Log everything useful. A generic "API call failed" line is why a broken
    // model config could sit in production handing every user the same
    // templated fallback without anyone noticing.
    const e = err as { status?: number; name?: string; message?: string };
    console.error("[/api/analyze] FAILED", {
      model: MODEL,
      status: e?.status,
      name: e?.name,
      message: e?.message,
      hasApiKey: Boolean(
        process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
      ),
    });

    return NextResponse.json(
      {
        error: "analysis_failed",
        // Surfaced so the client can show that the report is degraded rather
        // than passing a template off as a real analysis.
        reason: e?.status ? `api_${e.status}` : e?.name ?? "unknown",
        message: e?.message ?? "API call failed",
      },
      { status: 500 }
    );
  }
}
