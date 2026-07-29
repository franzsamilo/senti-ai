import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PROFILE_RESULT_SCHEMA } from "@/lib/resultSchema";

const MODEL = "claude-opus-5";

/**
 * Diagnostic endpoint: hit /api/health in production to confirm the model,
 * credentials and structured-output config actually work.
 *
 * This exists because an analysis failure is invisible from the outside — the
 * client silently renders a static fallback report, so a broken model config
 * looks identical to a working one until you notice every user is getting the
 * same text.
 */
export async function GET() {
  const hasKey = Boolean(
    process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
  );

  if (!hasKey) {
    return NextResponse.json(
      {
        ok: false,
        model: MODEL,
        credentials: "missing",
        hint: "Set ANTHROPIC_API_KEY. Without it every analysis silently falls back to the static template.",
      },
      { status: 503 }
    );
  }

  const checks: Record<string, unknown> = { model: MODEL, credentials: "present" };

  try {
    const anthropic = new Anthropic();
    const started = Date.now();

    // Same shape as a real analysis, minimal size — proves the model ID,
    // structured outputs and effort parameter are all accepted.
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: "Reply with a minimal valid object for the schema.",
      messages: [{ role: "user", content: "Health check." }],
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: PROFILE_RESULT_SCHEMA },
      },
    });

    checks.latencyMs = Date.now() - started;
    checks.stopReason = message.stop_reason;
    checks.structuredOutputs = "accepted";
    checks.usage = {
      input: message.usage.input_tokens,
      output: message.usage.output_tokens,
      cacheRead: message.usage.cache_read_input_tokens,
    };

    const textBlock = message.content.find((b) => b.type === "text");
    checks.parsed =
      textBlock && textBlock.type === "text"
        ? Boolean(JSON.parse(textBlock.text.trim()))
        : false;

    return NextResponse.json({ ok: true, ...checks });
  } catch (err) {
    const e = err as { status?: number; name?: string; message?: string };
    return NextResponse.json(
      {
        ok: false,
        ...checks,
        status: e?.status,
        name: e?.name,
        message: e?.message,
        hint:
          e?.status === 404
            ? `Model "${MODEL}" is not available to this API key.`
            : e?.status === 400
            ? "Request rejected — likely the output_config/structured-outputs parameter."
            : e?.status === 401
            ? "Credentials rejected."
            : "See message.",
      },
      { status: 500 }
    );
  }
}
