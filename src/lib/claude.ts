import Anthropic from "@anthropic-ai/sdk";

/**
 * One place that knows how this app talks to Claude.
 *
 * Every route that needs a model answer wants the same thing: a JSON object
 * that matches a schema, produced with a known amount of thinking, surviving
 * the handful of ways a call can come back unusable. Keeping that logic in
 * three routes is how they drifted apart before (one had retries, one didn't,
 * one disabled thinking in a way the current model rejects).
 */

export const MODEL = "claude-opus-5-5";

/**
 * Opus 5.5's safety classifiers can decline a request outright — HTTP 200,
 * `stop_reason: "refusal"`, empty content. Personal context in a roast app can
 * mention anything, so a false positive is a real possibility. With this beta
 * and `fallbacks: "default"`, the API re-runs a declined request on the model
 * Anthropic recommends for that refusal category, inside the same call.
 */
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

/**
 * Thinking can't be disabled on Opus 5.5 — effort is the only control. Note
 * the API default is `medium` here (Opus 5 defaulted to `high`), so every call
 * sets it explicitly rather than inheriting whatever the default becomes.
 */
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface JsonRequest {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  effort: Effort;
  /** Thinking counts toward this, so size it for reasoning plus the reply. */
  maxTokens: number;
  /** Ceiling for the single retry after a truncated response. */
  retryMaxTokens?: number;
  /**
   * Cache the system prompt. Only worth it when it is large and byte-identical
   * across requests — per-user content belongs in `user`, never here.
   */
  cacheSystem?: boolean;
}

interface RequestMode {
  fallbacks: boolean;
  structured: boolean;
}

export interface JsonResponse {
  data: unknown;
  /** The model that actually answered — differs from MODEL after a fallback. */
  servedBy: string;
}

/** The model (and any fallback) declined. Callers render their offline copy. */
export class ModelDeclinedError extends Error {
  constructor(public category: string | null) {
    super(`Model declined${category ? ` (${category})` : ""}`);
    this.name = "ModelDeclinedError";
  }
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export function hasCredentials(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export async function generateJson(req: JsonRequest): Promise<JsonResponse> {
  const anthropic = getClient();
  const retryMaxTokens = req.retryMaxTokens ?? Math.round(req.maxTokens * 1.6);

  const system = [
    {
      type: "text" as const,
      text: req.system,
      ...(req.cacheSystem ? { cache_control: { type: "ephemeral" as const } } : {}),
    },
  ];

  // Streamed and collected with finalMessage(): the client gets one JSON body
  // either way, but a streamed request can't hit the SDK's HTTP timeout on a
  // long thinking turn.
  const request = (mode: RequestMode, maxTokens: number) =>
    anthropic.beta.messages
      .stream({
        model: MODEL,
        max_tokens: maxTokens,
        ...(mode.fallbacks ? { betas: [FALLBACK_BETA], fallbacks: "default" as const } : {}),
        system,
        messages: [{ role: "user", content: req.user }],
        output_config: mode.structured
          ? {
              effort: req.effort,
              format: { type: "json_schema", schema: req.schema },
            }
          : { effort: req.effort },
      })
      .finalMessage();

  // Fallbacks and structured outputs are both optional extras. If the account
  // or API version rejects one (a 400), losing the whole analysis over it
  // would hand the user the static template — so peel them off one at a time
  // and let the prompt's schema description carry the format if it comes to
  // that.
  const modes: RequestMode[] = [
    { fallbacks: true, structured: true },
    { fallbacks: false, structured: true },
    { fallbacks: false, structured: false },
  ];
  let mode = modes[0];
  let message;
  for (let i = 0; ; i++) {
    mode = modes[i];
    try {
      message = await request(mode, req.maxTokens);
      break;
    } catch (err) {
      if (!(err instanceof Anthropic.BadRequestError) || i === modes.length - 1) throw err;
      console.warn(`[claude] request rejected (${JSON.stringify(mode)}), retrying with less:`, err.message);
    }
  }

  // A truncated response is unparseable JSON. Retry with real headroom —
  // re-sending the same ceiling just truncates in the same place.
  if (message.stop_reason === "max_tokens") {
    console.warn(`[claude] hit max_tokens at ${req.maxTokens}, retrying at ${retryMaxTokens}`);
    message = await request(mode, retryMaxTokens);
    if (message.stop_reason === "max_tokens") {
      throw new Error(`Response truncated at ${retryMaxTokens} max_tokens`);
    }
  }

  // With fallbacks on, a refusal here means the whole chain declined.
  if (message.stop_reason === "refusal") {
    throw new ModelDeclinedError(message.stop_details?.category ?? null);
  }

  // Read by block type — on Opus 5.5 the content can open with thinking blocks.
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in API response");
  }

  // Belt and braces: structured outputs shouldn't emit fences, the unstructured
  // retry might.
  const raw = textBlock.text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return { data: JSON.parse(raw), servedBy: message.model };
}

/** Compact, loggable description of a failed call. */
export function describeError(err: unknown): {
  status?: number;
  name?: string;
  message?: string;
  reason: string;
} {
  const e = err as { status?: number; name?: string; message?: string };
  return {
    status: e?.status,
    name: e?.name,
    message: e?.message,
    reason: e?.status ? `api_${e.status}` : e?.name ?? "unknown",
  };
}
