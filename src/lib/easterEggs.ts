/**
 * Creator Easter egg.
 *
 * Typing the creator's name into the personal-context field changes the
 * report. It's a marketing hook: the two branches are meant to be
 * screenshot-worthy in different ways.
 *
 *   "self"    — the subject claims to BE the creator. The report roasts him
 *               by name, in the headline. He runs it, screenshots it, posts it.
 *   "mention" — the creator appears as someone else in the story (or the user
 *               is just name-dropping). The report nods to him as the person
 *               who built the thing, then carries on roasting the subject.
 *
 * Which branch applies is decided by the model reading the sentence, not by a
 * regex — "ako si Franz Samilo" and "si Franz Samilo yung ex ko" need very
 * different treatment and only context can tell them apart.
 */

export type CreatorEgg = "self" | "mention";

/**
 * Name forms that trigger the egg.
 *
 * Note the surname is matched on its own because it's distinctive enough not
 * to fire by accident, while the first name alone deliberately is NOT — "Franz"
 * is a common enough name that someone's actual ex could be called it.
 */
const CREATOR_PATTERN =
  /\b(?:franz[\s._-]*samilo|samilo|franzsamilo)\b/i;

/** True when the subject's written context references the creator. */
export function mentionsCreator(context: string | undefined): boolean {
  if (!context) return false;
  return CREATOR_PATTERN.test(context);
}

/**
 * Weak signal for "the subject is claiming to be him". The model makes the
 * final call — this only nudges, because phrasing varies wildly
 * ("ako nga si...", "this is franz btw", "franz samilo here").
 */
export function looksLikeSelfClaim(context: string | undefined): boolean {
  if (!context) return false;
  const selfMarkers =
    /\b(?:ako\s+(?:si|nga\s+si|yung)|i\s*am|i'?m|im|my\s+name\s+is|this\s+is|ito\s+si|si\s+ako)\b[^.!?\n]{0,40}(?:franz|samilo)/i;
  const trailingMarkers =
    /(?:franz[\s._-]*samilo|samilo)\b[^.!?\n]{0,20}\b(?:here|nga|po\s+ito|ito)\b/i;
  return selfMarkers.test(context) || trailingMarkers.test(context);
}

/**
 * Extra instructions appended to the user turn (never the system prompt —
 * that one is cached and identical for everyone; this is per-request).
 */
export function buildCreatorEggInstruction(context: string): string {
  const leansSelf = looksLikeSelfClaim(context);

  return `

═══ SPECIAL DIRECTIVE — CREATOR REFERENCE DETECTED ═══
The subject's written context references FRANZ SAMILO, the software engineer who built Senti.AI.

First, decide from the actual sentence which of these is happening. ${
    leansSelf
      ? "A quick pattern check suggests the subject is claiming to BE him, but trust the sentence over that hint."
      : "A quick pattern check suggests he is being mentioned as someone else, but trust the sentence over that hint."
  }

CASE A — The subject is claiming to be Franz Samilo himself:
Turn on him. This is the one place in the entire report where you address the subject as a named individual, and he asked for it by typing his own name into his own app.
- The HEADLINE must be the diss. It has to be the line he screenshots.
- The angle writes itself: a software engineer who built an entire system to diagnose other people's emotional damage. He can architect anything except a conversation with the person he likes. He ships features faster than feelings. He has a 950-song database of heartbreak and zero moves. He debugged everything except himself. Registers like "Software engineer pero bobo sa pag-ibig" are the right temperature — but write your own, don't reuse that exact line.
- Pick the angle that actually fits HIS answers — his songs, his MBTI, his attachment style, his context. A generic developer joke is a wasted opportunity; the funny version uses his real inputs against him.
- Stay affectionate underneath. This is his app and his joke. Savage, not cruel — no real insults about his worth, looks, or career.
- Let it bleed into one or two other fields (a prediction, the final verdict) so it doesn't read as a single bolted-on gag, but do NOT make every field about him — the rest of the assessment still has to be a real read.

CASE B — Franz Samilo is someone else in their story, or is just being name-dropped:
- Work in a short, warm acknowledgement that he's the one who built this system — a knowing aside, one sentence at most, in whichever field it lands most naturally.
- Then carry on roasting the SUBJECT exactly as normal. The nod is a garnish, not the meal. Do not let it eat the report.
- If he genuinely appears to be someone in their romantic story, that is extremely funny and you should treat it as such — the creator being someone's hugot subject inside his own app is the joke, so land it — while still being kind about the real person involved.

Never explain the Easter egg, never mention "Easter egg", and never break character as the assessment system.
═══════════════════════════════════════════════════════`;
}
