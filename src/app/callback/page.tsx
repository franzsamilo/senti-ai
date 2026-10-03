"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  exchangeCode,
  fetchTopTracks,
  SPOTIFY_ERROR_KEY,
  SPOTIFY_FRESH_KEY,
  SPOTIFY_TRACKS_KEY,
} from "@/lib/spotify";
import BrandMark from "@/components/ui/BrandMark";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    async function handleCallback() {
      if (error || !code) {
        sessionStorage.setItem(SPOTIFY_ERROR_KEY, "true");
        router.replace("/");
        return;
      }

      try {
        const token = await exchangeCode(code);

        if (!token) {
          sessionStorage.setItem(SPOTIFY_ERROR_KEY, "true");
          router.replace("/");
          return;
        }

        const tracks = await fetchTopTracks(token);
        sessionStorage.setItem(SPOTIFY_TRACKS_KEY, JSON.stringify(tracks));
        sessionStorage.setItem(SPOTIFY_FRESH_KEY, "1");
      } catch (err) {
        console.error("Callback error:", err);
        sessionStorage.setItem(SPOTIFY_ERROR_KEY, "true");
      }

      router.replace("/");
    }

    handleCallback();
  }, [searchParams, router]);

  return <CallbackScreen />;
}

function CallbackScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-6 text-center">
      <BrandMark size={56} />
      <p className="font-display text-xl font-semibold text-text-primary">
        Kinukuha ang top tracks mo...
      </p>
      <p className="text-sm text-text-secondary">Saglit lang. Don&apos;t close this tab.</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={<CallbackScreen />}
    >
      <CallbackContent />
    </Suspense>
  );
}
