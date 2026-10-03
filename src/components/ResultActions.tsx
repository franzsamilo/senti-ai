"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { IconTrophy } from "@/components/ui/icons";
import type { ProfileResult } from "@/lib/types";

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="glass rounded-3xl p-5 flex flex-col gap-3">{children}</div>;
}

function PanelHeader({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-[rgba(139,63,217,0.1)] text-accent-secondary shrink-0">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="font-display text-[16px] font-semibold text-text-primary">{title}</p>
        <p className="text-[13px] text-text-secondary leading-relaxed">{body}</p>
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
        icon={<IconTrophy size={20} />}
        title="Leaderboard"
        body="Post your score anonymously — just the number, type, attachment and sign. No names."
      />
      {state === "done" && rank ? (
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-[18px] font-bold text-text-primary">
            You&apos;re #{rank.rank} <span className="text-text-muted font-medium text-[14px]">of {rank.total}</span>
          </p>
          <Link href="/leaderboard" className="text-[13px] font-medium text-accent-ink hover:underline">
            See the leaderboard →
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
