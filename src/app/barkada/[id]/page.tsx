"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BarkadaGroup from "@/components/BarkadaGroup";
import BrandMark from "@/components/ui/BrandMark";
import { LinkButton } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";
import type { BarkadaMember } from "@/app/api/barkada/route";

type FetchState = "loading" | "error" | "success";

/** Refresh cadence while the page is open — "updates as friends finish". */
const POLL_MS = 20000;

export default function BarkadaPage() {
  const params = useParams();
  const groupId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [state, setState] = useState<FetchState>(groupId ? "loading" : "error");
  const [members, setMembers] = useState<BarkadaMember[]>([]);

  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/barkada?id=${encodeURIComponent(groupId)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        if (cancelled) return;
        setMembers(data.members ?? []);
        setState("success");
      } catch {
        if (!cancelled) setState((prev) => (prev === "success" ? prev : "error"));
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [groupId]);

  return (
    <main className="relative min-h-screen flex flex-col items-center pb-16">
      {state === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
          <BrandMark size={52} />
          <p className="text-[14px] text-text-secondary">Loading the barkada…</p>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-6 text-center">
          <span className="text-[13px] font-semibold rounded-full px-3 py-1 bg-accent-soft text-accent-ink">Group not found</span>
          <h1 className="text-[30px] font-extrabold text-text-primary">Wala na &apos;tong barkada.</h1>
          <p className="text-[15px] text-text-secondary max-w-xs">
            This group doesn&apos;t exist or has expired — barkadas last 7 days.
          </p>
          <LinkButton href="/barkada">
            Start a new one <IconArrowRight size={18} />
          </LinkButton>
        </div>
      )}

      {state === "success" && (
        <>
          <BarkadaGroup members={members} groupId={groupId} />
          {members.length < 10 && (
            <div className="px-4 w-full max-w-2xl">
              <LinkButton href={`/?barkada=${encodeURIComponent(groupId)}`} className="w-full py-4">
                Join — take your scan <IconArrowRight size={18} />
              </LinkButton>
            </div>
          )}
        </>
      )}
    </main>
  );
}
