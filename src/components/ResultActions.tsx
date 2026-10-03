"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { IconCheck, IconLink, IconTrophy, IconUsers } from "@/components/ui/icons";
import type { ProfileResult, UserProfile } from "@/lib/types";

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

/**
 * Start a barkada group. Asks for a nickname inline — the old version used
 * window.prompt(), posted the wrong body shape (the API wants `member`), and
 * then window.open()ed `/barkada/undefined` in a popup most phones block.
 */
export function BarkadaCreate({ profile }: { profile: UserProfile }) {
  const [nickname, setNickname] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const groupUrl = groupId && typeof window !== "undefined" ? `${window.location.origin}/barkada/${groupId}` : "";

  async function create() {
    const name = nickname.trim();
    if (!name) return;
    setState("busy");
    try {
      const res = await fetch("/api/barkada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", member: { nickname: name.slice(0, 24), profile } }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.error ?? "create failed");
      setGroupId(data.id);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  async function shareLink() {
    const text = `Barkada emotional damage check 😭 Sino pinaka-sawi sa atin? Join here → ${groupUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Senti.AI Barkada", text, url: groupUrl });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <Panel>
      <PanelHeader
        icon={<IconUsers size={20} />}
        title="Barkada mode"
        body="Start a group, send the link, and see who's the most sawi, most delulu, and most likely to text their ex tonight."
      />
      <AnimatePresence mode="wait" initial={false}>
        {groupId ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <Button onClick={shareLink} className="w-full">
              {copied ? (
                <>
                  <IconCheck size={17} /> Link copied
                </>
              ) : (
                <>
                  <IconLink size={17} /> Share group link
                </>
              )}
            </Button>
            <Link href={`/barkada/${groupId}`} className="text-center text-[13px] font-medium text-accent-ink hover:underline">
              Open the group page →
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
            className="flex gap-2"
          >
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={24}
              placeholder="Your nickname"
              aria-label="Your nickname"
              className="flex-1 min-w-0 bg-white border border-border-subtle rounded-2xl px-3.5 text-base outline-none focus:border-accent/50 min-h-[48px]"
            />
            <Button type="submit" variant="secondary" disabled={!nickname.trim() || state === "busy"} className="shrink-0">
              {state === "busy" ? "…" : "Create"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
      {state === "error" && (
        <p className="text-[13px] text-accent-ink">Hindi na-create. Try again in a bit?</p>
      )}
    </Panel>
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

export const PENDING_BARKADA_KEY = "senti_pending_barkada";

/**
 * Shown instead of BarkadaCreate when the user arrived from a group link.
 * Before this existed nothing in the app ever called the join action — the
 * group page's "Join" button just went home, and friends never got added.
 */
export function BarkadaJoin({ groupId, profile }: { groupId: string; profile: UserProfile }) {
  const [nickname, setNickname] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "joined" | "full" | "missing" | "error">("idle");

  async function join() {
    const name = nickname.trim();
    if (!name) return;
    setState("busy");
    try {
      const res = await fetch("/api/barkada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", id: groupId, member: { nickname: name.slice(0, 24), profile } }),
      });
      if (res.status === 409) return setState("full");
      if (res.status === 404) return setState("missing");
      if (!res.ok) throw new Error("join failed");
      try {
        sessionStorage.removeItem(PENDING_BARKADA_KEY);
      } catch {}
      setState("joined");
    } catch {
      setState("error");
    }
  }

  return (
    <Panel>
      <PanelHeader
        icon={<IconUsers size={20} />}
        title="Join your barkada's group"
        body="You came in from a group link. Add your result so everyone can see who's most sawi."
      />
      {state === "joined" ? (
        <Link
          href={`/barkada/${groupId}`}
          className="inline-flex items-center justify-center gap-2 rounded-2xl min-h-[48px] font-semibold text-white"
          style={{ background: "var(--dusk-button)" }}
        >
          <IconCheck size={17} /> Joined — see the group
        </Link>
      ) : state === "full" || state === "missing" ? (
        <p className="text-[14px] text-accent-ink">
          {state === "full" ? "That group is full (10 max)." : "That group expired — start a new one below."}
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            join();
          }}
          className="flex gap-2"
        >
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={24}
            placeholder="Your nickname"
            aria-label="Your nickname"
            className="flex-1 min-w-0 bg-white border border-border-subtle rounded-2xl px-3.5 text-base outline-none focus:border-accent/50 min-h-[48px]"
          />
          <Button type="submit" disabled={!nickname.trim() || state === "busy"} className="shrink-0">
            {state === "busy" ? "…" : "Join"}
          </Button>
        </form>
      )}
      {state === "error" && <p className="text-[13px] text-accent-ink">Hindi naka-join. Try again?</p>}
    </Panel>
  );
}
