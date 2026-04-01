"use client";

interface PersonalContextStepProps {
  context: string;
  onContextChange: (context: string) => void;
  onNext: () => void;
}

const MAX_CHARS = 500;
const MIN_CHARS = 20;

export default function PersonalContextStep({
  context,
  onContextChange,
  onNext,
}: PersonalContextStepProps) {
  const remaining = MAX_CHARS - context.length;
  const isOverLimit = context.length > MAX_CHARS;
  const isTooShort = context.trim().length < MIN_CHARS;

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-12">
      <div className="w-full max-w-[580px] mx-auto flex flex-col gap-6">
        {/* Badge */}
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-xs tracking-widest px-2 py-1 rounded border"
            style={{
              color: "#ff3252",
              borderColor: "rgba(255,50,82,0.35)",
              background: "rgba(255,50,82,0.06)",
            }}
          >
            REQUIRED
          </span>
          <span
            className="font-mono text-xs tracking-widest"
            style={{ color: "#555555" }}
          >
            STEP 06 / 06
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
            Dito magaling yung AI — the more context you give, the more
            devastatingly accurate the roast.{" "}
            <span style={{ color: "#aaaaaa" }}>
              Spill everything. Situationship drama, breakup lore, 3AM thoughts,
              the whole mess.
            </span>
          </p>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <textarea
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            maxLength={MAX_CHARS + 10}
            rows={7}
            placeholder={`e.g., "nag-break kami after 3 years tapos nakita ko siya sa Spotify ng ex niya na may shared playlist called 'us <3'... ayoko na talaga. MU kami for 2 years walang label, tapos biglang may bago. Ngayon every gabi Pagsamo on repeat habang ini-scroll ko yung old convos namin. I keep typing 'kumusta ka na' then deleting it. Ang gago ko."`}
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
          <div className="flex justify-between">
            {isTooShort && context.trim().length > 0 ? (
              <span
                className="font-mono text-xs"
                style={{ color: "#ff8c00" }}
              >
                {MIN_CHARS - context.trim().length} more characters needed
              </span>
            ) : (
              <span />
            )}
            <span
              className="font-mono text-xs tabular-nums"
              style={{
                color: isOverLimit
                  ? "#ff3252"
                  : remaining <= 50
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
          <button
            onClick={onNext}
            disabled={isTooShort || isOverLimit}
            className="w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-150"
            style={
              isTooShort || isOverLimit
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
            Analyze My Emotional Damage →
          </button>
        </div>
      </div>
    </div>
  );
}
