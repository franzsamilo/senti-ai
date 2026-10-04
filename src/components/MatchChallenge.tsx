"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserProfile } from "@/lib/types";
import Button from "@/components/ui/Button";
import { IconCheck, IconHeart, IconLink } from "@/components/ui/icons";

interface MatchChallengeProps {
  profile: UserProfile;
}

/** The 1v1 viral loop: a link a friend opens to take the scan against you. */
export default function MatchChallenge({ profile }: MatchChallengeProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const matchUrl = matchId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/match/${matchId}`
    : "";

  const shareText = matchId
    ? `I just got psychoanalyzed by Senti.AI and my Emotional Damage Score is ${profile.result.emotional_damage_score.toFixed(1)}/10 😭 Take yours and let's see kung sino mas sawi sa ating dalawa → ${matchUrl}`
    : "";

  async function handleCreateChallenge() {
    setStatus("loading");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", profileA: profile }),
      });
      if (!res.ok) throw new Error("Failed to create match");
      const data = await res.json();
      setMatchId(data.id);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.getElementById("match-link-input") as HTMLInputElement | null;
      input?.select();
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Senti.AI Match Challenge", text: shareText, url: matchUrl });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    await handleCopy();
  }

  return (
    <div className="lift">
      <div className="ticket relative flex bg-yellow text-ink">
        {/* main */}
        <div className="flex-1 min-w-0 pl-6 pr-4 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-display font-extrabold uppercase tracking-[0.08em] text-[12px] text-ink/70">
              Senti.AI presents · 1v1
            </p>
            <h3 className="font-display font-black uppercase text-[34px] sm:text-[40px] leading-[0.88] text-ink">
              Sawi vs. sawi
            </h3>
            <p className="text-[15px] text-ink/85 leading-snug mt-1">
              Challenge a friend: send a link, they take the scan, then you both get a compatibility roast.
              Tingnan natin kung sino mas sawi.
            </p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {status !== "ready" ? (
              <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
                <Button onClick={handleCreateChallenge} disabled={status === "loading"} variant="secondary" className="w-full">
                  <IconHeart size={20} />
                  {status === "loading" ? "Printing your ticket…" : status === "error" ? "Try again" : "Create challenge link"}
                </Button>
                {status === "error" && (
                  <p className="text-[13px] text-ink">May error. Hindi ka papalarin ng universe ngayon — try again.</p>
                )}
              </motion.div>
            ) : (
              <motion.div key="ready" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2.5">
                <div className="flex gap-2 min-w-0">
                  <input
                    id="match-link-input"
                    type="text"
                    readOnly
                    value={matchUrl}
                    aria-label="Challenge link"
                    className="flex-1 rounded-[8px] px-3 py-2.5 font-mono text-[12px] outline-none min-w-0 truncate bg-paper-light border-2 border-ink text-ink"
                    style={{ fontStretch: "87.5%" }}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3.5 rounded-[8px] border-2 border-ink bg-ink text-yellow font-display font-extrabold uppercase tracking-[0.04em] text-[14px] shrink-0 cursor-pointer inline-flex items-center gap-1.5 min-h-[44px]"
                  >
                    {copied ? (
                      <>
                        <IconCheck size={15} strokeWidth={3} /> Copied
                      </>
                    ) : (
                      "Copy"
                    )}
                  </button>
                </div>
                <Button onClick={handleShare} className="w-full">
                  <IconLink size={19} /> Send the challenge
                </Button>
                <p className="font-hand text-[16px] text-ink/80">Valid for 48 hours. Sana magreply sila.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* stub */}
        <div className="relative w-[58px] shrink-0 border-l-2 border-dashed border-ink/60 grid place-items-center">
          <span
            className="font-display font-black uppercase tracking-[0.12em] text-[17px] leading-none text-ink whitespace-nowrap"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Admit one · No. {(matchId ?? "000000").slice(0, 6).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
