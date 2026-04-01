"use client";

import StepIndicator from "@/components/StepIndicator";
import { LoveLanguage } from "@/lib/types";

interface LoveLanguageOption {
  value: LoveLanguage;
  emoji: string;
  label: string;
}

const OPTIONS: LoveLanguageOption[] = [
  { value: "words", emoji: "💬", label: "Words of Affirmation" },
  { value: "acts", emoji: "🛠️", label: "Acts of Service" },
  { value: "gifts", emoji: "🎁", label: "Receiving Gifts" },
  { value: "time", emoji: "⏰", label: "Quality Time" },
  { value: "touch", emoji: "🤗", label: "Physical Touch" },
];

interface LoveLanguageStepProps {
  selected: LoveLanguage;
  onSelect: (lang: LoveLanguage) => void;
}

export default function LoveLanguageStep({ selected, onSelect }: LoveLanguageStepProps) {
  return (
    <div className="flex flex-col gap-6 px-4 py-8 max-w-[680px] mx-auto w-full">
      <div className="flex flex-col gap-2">
        <StepIndicator current={4} />
        <h2 className="text-2xl font-bold text-text-primary">Love Language</h2>
        <p className="text-sm text-text-secondary">
          How do you express the love that no one asked for?
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={[
                "flex items-center gap-4 w-full rounded-lg border px-5 py-4 text-left transition-all duration-150 cursor-pointer min-h-[44px]",
                isSelected
                  ? "bg-accent/10 border-accent text-text-primary"
                  : "bg-bg-card border-border-subtle hover:border-accent/50",
              ].join(" ")}
            >
              <span className="text-2xl leading-none">{opt.emoji}</span>
              <span className={`font-semibold text-sm ${isSelected ? "text-accent" : "text-text-primary"}`}>
                {opt.label}
              </span>
              {isSelected && (
                <span className="ml-auto text-accent text-xs font-mono">SELECTED</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
