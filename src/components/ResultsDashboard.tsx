"use client";

// Placeholder — full implementation coming in a later task.

import { Song, AttachmentStyle, LoveLanguage, ProfileResult } from "@/lib/types";

interface ResultsDashboardProps {
  result: ProfileResult;
  songs: Song[];
  mbti: string;
  attachmentStyle: AttachmentStyle;
  loveLanguage: LoveLanguage;
  zodiac: string;
  onRunAgain: () => void;
}

export default function ResultsDashboard({ result, onRunAgain }: ResultsDashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <p className="font-mono text-text-secondary text-sm">Results Dashboard — coming soon</p>
      <pre className="text-xs text-text-muted bg-bg-card border border-border-subtle rounded p-4 max-w-full overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
      <button
        onClick={onRunAgain}
        className="font-mono text-xs text-accent underline cursor-pointer"
      >
        Run Again
      </button>
    </div>
  );
}
