"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import Button from "@/components/ui/Button";

interface MatchChallengeProps {
  profile: UserProfile;
}

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
      // Fallback: select the input
      const input = document.getElementById("match-link-input") as HTMLInputElement | null;
      input?.select();
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Senti.AI Match Challenge",
          text: shareText,
          url: matchUrl,
        });
        return;
      } catch {
        // User cancelled or not supported — fall through to copy
      }
    }
    await handleCopy();
  }

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-base" style={{ color: "#e8e8e8" }}>
          Challenge a Friend
        </h3>
        <p className="text-sm" style={{ color: "#888888" }}>
          Generate a link. Tingnan natin kung sino mas sawi sa inyong dalawa.
        </p>
      </div>

      {status === "idle" && (
        <Button onClick={handleCreateChallenge} variant="secondary" className="w-full">
          ⚔️ Challenge a Friend
        </Button>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-3 py-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-transparent animate-spin shrink-0"
            style={{ borderTopColor: "#ff3252", borderRightColor: "rgba(255,50,82,0.4)" }}
          />
          <span className="font-mono text-xs" style={{ color: "#888888" }}>
            Packaging your emotional damage...
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: "#ff3252" }}>
            May error. Hindi ka papalarin ng universe ngayon. Try again.
          </p>
          <Button onClick={handleCreateChallenge} variant="secondary" className="w-full">
            Try Again
          </Button>
        </div>
      )}

      {status === "ready" && matchId && (
        <div className="flex flex-col gap-3">
          {/* Link input */}
          <div className="flex gap-2">
            <input
              id="match-link-input"
              type="text"
              readOnly
              value={matchUrl}
              className="flex-1 rounded-lg px-3 py-2.5 text-xs font-mono outline-none min-w-0"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#888888",
              }}
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2.5 rounded-lg text-xs font-medium transition-colors shrink-0"
              style={{
                background: copied ? "rgba(34,170,85,0.15)" : "rgba(255,50,82,0.12)",
                border: `1px solid ${copied ? "rgba(34,170,85,0.3)" : "rgba(255,50,82,0.3)"}`,
                color: copied ? "#22aa55" : "#ff3252",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2">
            <Button onClick={handleShare} variant="primary" className="flex-1 text-sm">
              Share Link
            </Button>
          </div>

          {/* Pre-written share text */}
          <div
            className="rounded-lg p-3 text-xs leading-relaxed"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#555555",
            }}
          >
            <span className="block mb-1 font-mono" style={{ color: "#555555", fontSize: "10px" }}>
              SUGGESTED MESSAGE:
            </span>
            <span style={{ color: "#888888" }}>{shareText}</span>
          </div>

          <p className="text-xs font-mono" style={{ color: "#555555" }}>
            Link expires in 48 hours. Sana magreply sila.
          </p>
        </div>
      )}
    </div>
  );
}
