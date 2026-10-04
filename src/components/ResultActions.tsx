"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { IconTrophy } from "@/components/ui/icons";
import type { ProfileResult } from "@/lib/types";

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="paper p-4 sm:p-5 flex flex-col gap-3.5">{children}</div>;
}

function PanelHeader({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-ink shrink-0">{icon}</span>
      <div className="flex flex-col gap-1">
        <p className="font-display font-black uppercase text-[22px] leading-none text-ink">{title}</p>
        <p className="text-[14px] text-text-secondary leading-snug">{body}</p>
      </div>
    </div>
  );
}

/** Post the score anonymously and show the rank inline (no alert()). */
export function LeaderboardSubmit({
  result,
  mbti,
  attachmentStyle,
  zodiac,
}: {
  result: ProfileResult;
  mbti: string;
  attachmentStyle: string;
  zodiac: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [rank, setRank] = useState<{ rank: number; total: number } | null>(null);

  async function submit() {
    setState("busy");
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: result.emotional_damage_score,
          mbti,
          attachmentStyle,
          zodiac,
          threat_level: result.threat_level,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "submit failed");
      setRank({ rank: data.rank, total: data.total });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <Panel>
      <PanelHeader
        icon={<IconTrophy size={40} />}
        title="Leaderboard"
        body="Post your score anonymously — just the number, type, attachment and sign. No names."
      />
      {state === "done" && rank ? (
        <div className="flex flex-col gap-1.5">
          <p className="font-display font-black text-[30px] leading-none text-ink">
            You&apos;re #{rank.rank}{" "}
            <span className="text-text-muted font-extrabold text-[17px]">of {rank.total}</span>
          </p>
          <Link
            href="/leaderboard"
            className="self-start min-h-[40px] inline-flex items-center font-display font-extrabold uppercase tracking-[0.04em] text-[15px] text-pink-ink underline decoration-2 underline-offset-4"
          >
            See the leaderboard
          </Link>
        </div>
      ) : (
        <Button variant="secondary" onClick={submit} disabled={state === "busy"} className="w-full">
          {state === "busy" ? "Posting…" : state === "error" ? "Try again" : "Post my score"}
        </Button>
      )}
    </Panel>
  );
}
