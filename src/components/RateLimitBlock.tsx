"use client";

import GlitchText from "@/components/GlitchText";

export default function RateLimitBlock() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-6">
      {/* Icon */}
      <span className="text-5xl select-none" aria-hidden>
        🚫
      </span>

      {/* Glitch title */}
      <GlitchText
        text="ACCESS DENIED"
        as="h1"
        className="text-4xl sm:text-5xl font-bold text-accent"
      />

      {/* Quote block */}
      <div className="font-mono text-sm sm:text-base text-text-secondary max-w-sm flex flex-col gap-1 border border-border-subtle rounded-xl bg-bg-card p-5">
        <p className="text-text-primary">&ldquo;The creator of Senti.AI believed in second chances...&rdquo;</p>
        <p className="text-text-primary">&ldquo;...not a third though. &apos;D ako bobo.&rdquo;</p>
        <p className="text-text-muted mt-2">— Management</p>
      </div>

      {/* Footer lines */}
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs text-text-muted">
          [Your emotional damage has been noted.]
        </p>
        <p className="font-mono text-xs text-text-muted">
          [Come back tomorrow or use a different browser idc]
        </p>
      </div>
    </div>
  );
}
