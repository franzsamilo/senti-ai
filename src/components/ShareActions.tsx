"use client";

import React, { useRef, useState } from "react";
import { ProfileResult, Song } from "@/lib/types";
import ShareCard from "@/components/ShareCard";
import Button from "@/components/ui/Button";
import { captureCard, shareOrDownload } from "@/lib/shareImage";

interface ShareActionsProps {
  result: ProfileResult;
  songs: Song[];
}

export default function ShareActions({ result, songs }: ShareActionsProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const postRef = useRef<HTMLDivElement>(null);
  const [sharingStory, setSharingStory] = useState(false);
  const [sharingPost, setSharingPost] = useState(false);

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

  return (
    <>
      {/* Hidden share card renders — off-screen, captured by html2canvas */}
      <ShareCard ref={storyRef} result={result} songs={songs} format="story" />
      <ShareCard ref={postRef} result={result} songs={songs} format="post" />

      {/* Visible share buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          variant="primary"
          className="flex-1 gap-2 text-base font-semibold"
          disabled={sharingStory || sharingPost}
          onClick={() => handleShare(storyRef, "story", setSharingStory)}
        >
          {sharingStory ? (
            <>
              <span className="animate-pulse">⏳</span>
              Generating...
            </>
          ) : (
            <>
              <span>📤</span>
              Share to Story
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          className="flex-1 gap-2 text-base"
          disabled={sharingStory || sharingPost}
          onClick={() => handleShare(postRef, "post", setSharingPost)}
        >
          {sharingPost ? (
            <>
              <span className="animate-pulse">⏳</span>
              Generating...
            </>
          ) : (
            <>
              <span>🖼️</span>
              Share as Post
            </>
          )}
        </Button>
      </div>
    </>
  );
}
