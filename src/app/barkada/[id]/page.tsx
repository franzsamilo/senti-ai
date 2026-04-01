"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NeuralNetworkBg from "@/components/NeuralNetworkBg";
import GlitchText from "@/components/GlitchText";
import BarkadaGroup from "@/components/BarkadaGroup";
import { BarkadaMember } from "@/app/api/barkada/route";

type FetchState = "loading" | "error" | "success";

export default function BarkadaPage() {
  const params = useParams();
  const groupId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [state, setState] = useState<FetchState>("loading");
  const [members, setMembers] = useState<BarkadaMember[]>([]);

  useEffect(() => {
    if (!groupId) {
      setState("error");
      return;
    }

    fetch(`/api/barkada?id=${encodeURIComponent(groupId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setMembers(data.members ?? []);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [groupId]);

  return (
    <main
      className="relative min-h-screen flex flex-col items-center"
      style={{ background: "#0a0a0f", color: "#e8e8e8" }}
    >
      <NeuralNetworkBg />

      <div className="relative z-10 w-full flex flex-col items-center pt-8 pb-16 px-4">
        {state === "loading" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div
              className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
              style={{
                borderTopColor: "#ff3252",
                borderRightColor: "#ff3252",
              }}
            />
            <p
              className="text-xs tracking-[0.3em] uppercase animate-pulse"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "#555555" }}
            >
              Loading group data...
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <GlitchText
              text="GROUP NOT FOUND"
              as="h1"
              className="text-3xl font-bold"
            />
            <p
              className="text-sm max-w-xs"
              style={{ color: "#888888", fontFamily: "var(--font-mono, monospace)" }}
            >
              This barkada group does not exist or has expired (groups last 7 days).
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm inline-flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #ff3252, #ff0844)",
                color: "#ffffff",
                boxShadow: "0 0 20px rgba(255,50,82,0.4)",
              }}
            >
              Go Back Home
            </Link>
          </div>
        )}

        {state === "success" && (
          <>
            <BarkadaGroup members={members} groupId={groupId} />

            <Link
              href="/"
              className="mt-4 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm inline-flex items-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, #ff3252, #ff0844)",
                color: "#ffffff",
                boxShadow: "0 0 20px rgba(255,50,82,0.4)",
              }}
            >
              <span>Join</span>
              <span style={{ opacity: 0.8 }}>—</span>
              <span>Take Your Scan</span>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
