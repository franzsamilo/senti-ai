"use client";

interface SoundToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export default function SoundToggle({ muted, onToggle }: SoundToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      title={muted ? "Unmute sounds" : "Mute sounds"}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-opacity hover:opacity-80 active:scale-95"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
