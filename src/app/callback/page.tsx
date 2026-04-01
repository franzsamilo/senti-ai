"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { exchangeCode, fetchTopTracks } from "@/lib/spotify";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    async function handleCallback() {
      if (error || !code) {
        sessionStorage.setItem("spotify_error", "true");
        router.replace("/");
        return;
      }

      try {
        const token = await exchangeCode(code);

        if (!token) {
          sessionStorage.setItem("spotify_error", "true");
          router.replace("/");
          return;
        }

        const tracks = await fetchTopTracks(token);
        sessionStorage.setItem("spotify_tracks", JSON.stringify(tracks));
      } catch (err) {
        console.error("Callback error:", err);
        sessionStorage.setItem("spotify_error", "true");
      }

      router.replace("/");
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
      {/* Spinner */}
      <div className="w-12 h-12 rounded-full border-2 border-border-subtle border-t-accent animate-spin" />

      <p className="font-mono text-sm text-text-secondary tracking-wider">
        Scanning your Spotify for emotional damage...
      </p>

      <p className="font-mono text-xs text-text-muted">
        Please wait. Do not close this tab.
      </p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-border-subtle border-t-accent animate-spin" />
          <p className="font-mono text-sm text-text-secondary tracking-wider">
            Scanning your Spotify for emotional damage...
          </p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
