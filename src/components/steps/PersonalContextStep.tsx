"use client";

interface PersonalContextStepProps {
  context: string;
  onContextChange: (context: string) => void;
  onNext: () => void;
  onSkip: () => void;
}

const MAX_CHARS = 150;

export default function PersonalContextStep({
  context,
  onContextChange,
  onNext,
  onSkip,
}: PersonalContextStepProps) {
  const remaining = MAX_CHARS - context.length;
  const isOverLimit = context.length > MAX_CHARS;
  const isEmpty = context.trim().length === 0;

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-12">
      <div className="w-full max-w-[580px] mx-auto flex flex-col gap-6">
        {/* Badge */}
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-xs tracking-widest px-2 py-1 rounded border"
            style={{
              color: "#ffd000",
              borderColor: "rgba(255,208,0,0.35)",
              background: "rgba(255,208,0,0.06)",
            }}
          >
            OPTIONAL
          </span>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-3xl font-bold leading-tight"
            style={{ color: "#e8e8e8" }}
          >
            Ano nangyari sa&apos;yo?
          </h1>
          <p className="text-sm" style={{ color: "#888888" }}>
            Tell us what you&apos;re going through rn.{" "}
            <span style={{ color: "#555555" }}>
              (This makes the roast more personal.)
            </span>
          </p>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <textarea
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            maxLength={MAX_CHARS + 10} // small buffer; enforce via counter
            rows={4}
            placeholder={`e.g., "nag-break kami after 3 years" or "MU kami for 2 years walang label"`}
            className="w-full resize-none rounded-lg px-4 py-3 text-sm font-mono outline-none transition-colors placeholder:opacity-40"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${
                isOverLimit
                  ? "rgba(255,50,82,0.6)"
                  : "rgba(255,255,255,0.08)"
              }`,
              color: "#e8e8e8",
              lineHeight: "1.6",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = isOverLimit
                ? "rgba(255,50,82,0.8)"
                : "rgba(255,50,82,0.45)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isOverLimit
                ? "rgba(255,50,82,0.6)"
                : "rgba(255,255,255,0.08)";
            }}
          />

          {/* Character counter */}
          <div className="flex justify-end">
            <span
              className="font-mono text-xs tabular-nums"
              style={{
                color: isOverLimit
                  ? "#ff3252"
                  : remaining <= 20
                  ? "#ff8c00"
                  : "#555555",
              }}
            >
              {context.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Privacy notice */}
        <div
          className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            color: "#555555",
          }}
        >
          <span>🔒</span>
          <span>This stays between you and the AI. Nothing is stored or shared.</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-2">
          {/* Primary — Include & Analyze */}
          <button
            onClick={onNext}
            disabled={isEmpty || isOverLimit}
            className="w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-150"
            style={
              isEmpty || isOverLimit
                ? {
                    background: "rgba(255,255,255,0.04)",
                    color: "#555555",
                    border: "1px solid rgba(255,255,255,0.06)",
                    cursor: "not-allowed",
                  }
                : {
                    background: "linear-gradient(135deg, #ff3252, #ff0844)",
                    color: "#fff",
                    border: "none",
                    boxShadow: "0 0 18px rgba(255,50,82,0.35)",
                    cursor: "pointer",
                  }
            }
          >
            Include &amp; Analyze →
          </button>

          {/* Secondary — Skip */}
          <button
            onClick={onSkip}
            className="w-full py-3 px-6 rounded-lg font-medium text-sm transition-all duration-150"
            style={{
              background: "transparent",
              color: "#888888",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#e8e8e8";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#888888";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            Skip — Analyze without context
          </button>
        </div>
      </div>
    </div>
  );
}
