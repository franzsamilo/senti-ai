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
    <div
      className="relative overflow-hidden rounded-3xl p-5 flex flex-col gap-4 text-white shadow-[var(--shadow-lift)]"
      style={{ background: "var(--dusk-button)" }}
    >
      <div
        aria-hidden
        className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
        style={{ background: "#ffb199" }}
      />
      <div className="relative flex items-start gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-white/15 shrink-0">
          <IconHeart size={20} />
        </span>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[18px] font-bold">Challenge a friend</h3>
          <p className="text-[14px] text-white/85 leading-relaxed">
            Send a link. They take the scan, then you both get a compatibility roast. Tingnan natin kung sino
            mas sawi.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status !== "ready" ? (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex flex-col gap-2">
            <button
              onClick={handleCreateChallenge}
              disabled={status === "loading"}
              className="w-full min-h-[48px] rounded-2xl bg-white text-accent-ink font-semibold text-[15px] hover:bg-white/95 transition-colors cursor-pointer disabled:opacity-70"
            >
              {status === "loading" ? "Creating your challenge…" : status === "error" ? "Try again" : "Create challenge link"}
            </button>
            {status === "error" && (
              <p className="text-[13px] text-white/90">May error. Hindi ka papalarin ng universe ngayon — try again.</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col gap-2.5"
          >
            <div className="flex gap-2 min-w-0">
              <input
                id="match-link-input"
                type="text"
                readOnly
                value={matchUrl}
                aria-label="Challenge link"
                className="flex-1 rounded-xl px-3 py-2.5 text-[13px] outline-none min-w-0 truncate bg-white/15 border border-white/25 text-white"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={handleCopy}
                className="px-3.5 rounded-xl text-[13px] font-semibold shrink-0 bg-white/20 hover:bg-white/30 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <IconCheck size={14} /> Copied
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
            <Button
              onClick={handleShare}
              variant="secondary"
              className="w-full !bg-white !text-accent-ink !border-white"
            >
              <IconLink size={17} /> Send the challenge
            </Button>
            <p className="text-[12px] text-white/75">Link expires in 48 hours. Sana magreply sila.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
