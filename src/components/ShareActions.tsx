"use client";

import React, { useRef, useState } from "react";
import { ProfileResult, Song } from "@/lib/types";
import ShareCard from "@/components/ShareCard";
import Button from "@/components/ui/Button";
import { captureCard, shareOrDownload } from "@/lib/shareImage";

const SITE_URL = "https://senti-ai-iota.vercel.app";

interface ShareActionsProps {
  result: ProfileResult;
  songs: Song[];
}

function getShareText(result: ProfileResult) {
  return `I just got psychoanalyzed by Senti.AI 😭\n\nEmotional Damage Score: ${result.emotional_damage_score}/10\nThreat Level: ${result.threat_level}\n\n"${result.headline}"\n\nTake yours → ${SITE_URL}`;
}

export default function ShareActions({ result, songs }: ShareActionsProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const postRef = useRef<HTMLDivElement>(null);
  const [sharingStory, setSharingStory] = useState(false);
  const [sharingPost, setSharingPost] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare(
    ref: React.RefObject<HTMLDivElement | null>,
    format: "story" | "post",
    setSharingState: (v: boolean) => void
  ) {
    if (!ref.current) return;
    setSharingState(true);
    try {
      const blob = await captureCard(ref.current);
      const filename = `senti-ai-${format}-${Date.now()}.png`;
      await shareOrDownload(blob, filename);
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setSharingState(false);
    }
  }

  function shareToMessenger() {
    const text = getShareText(result);
    const encodedLink = encodeURIComponent(SITE_URL);

    // Try Messenger share URL (works on both mobile and desktop)
    // On mobile it opens the Messenger app, on desktop it opens messenger.com
    const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodedLink}&app_id=966242223397117&redirect_uri=${encodeURIComponent(SITE_URL)}`;

    // Fallback: if we can use Web Share API, use that instead (better on mobile)
    if (navigator.share) {
      navigator.share({
        text,
        url: SITE_URL,
      }).catch(() => {
        // If share was cancelled or failed, open Messenger URL
        window.open(messengerUrl, "_blank");
      });
    } else {
      window.open(messengerUrl, "_blank");
    }
  }

  async function copyResultsText() {
    const text = getShareText(result);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      {/* Hidden share card renders — off-screen, captured by html2canvas */}
      <ShareCard ref={storyRef} result={result} songs={songs} format="story" />
      <ShareCard ref={postRef} result={result} songs={songs} format="post" />

      {/* Share image buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          variant="primary"
          className="flex-1 gap-2 text-base font-semibold"
          disabled={sharingStory || sharingPost}
          onClick={() => handleShare(storyRef, "story", setSharingStory)}
        >
          {sharingStory ? (
            <><span className="animate-pulse">⏳</span> Generating...</>
          ) : (
            <><span>📤</span> Share to Story</>
          )}
        </Button>

        <Button
          variant="secondary"
          className="flex-1 gap-2 text-base"
          disabled={sharingStory || sharingPost}
          onClick={() => handleShare(postRef, "post", setSharingPost)}
        >
          {sharingPost ? (
            <><span className="animate-pulse">⏳</span> Generating...</>
          ) : (
            <><span>🖼️</span> Share as Post</>
          )}
        </Button>
      </div>

      {/* Text share buttons */}
      <div className="flex gap-3 w-full">
        <Button
          variant="ghost"
          className="flex-1 text-sm gap-2"
          onClick={shareToMessenger}
        >
          <span>💬</span> Messenger
        </Button>

        <Button
          variant="ghost"
          className="flex-1 text-sm gap-2"
          onClick={copyResultsText}
        >
          <span>{copied ? "✓" : "📋"}</span> {copied ? "Copied!" : "Copy Results"}
        </Button>
      </div>
    </>
  );
}
