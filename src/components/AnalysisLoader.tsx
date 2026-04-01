"use client";

// Placeholder — full implementation coming in a later task.
// This stub keeps page.tsx buildable and prevents import errors.

import { Song, AttachmentStyle, LoveLanguage, ProfileResult } from "@/lib/types";

interface AnalysisLoaderProps {
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage;
  zodiac: string;
  onComplete: (result: ProfileResult) => void;
  onBlocked: () => void;
}

export default function AnalysisLoader(_props: AnalysisLoaderProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="font-mono text-text-muted text-sm animate-pulse">
        Initializing Emotional Damage Protocol...
      </p>
    </div>
  );
}
