"use client";

import StepIndicator from "@/components/StepIndicator";
import { AttachmentStyle } from "@/lib/types";

interface AttachmentOption {
  value: AttachmentStyle;
  emoji: string;
  label: string;
  description: string;
}

const OPTIONS: AttachmentOption[] = [
  {
    value: "anxious",
    emoji: "😰",
    label: "Anxious",
    description: "'Bakit hindi ka nagrereply?!' energy",
  },
  {
    value: "avoidant",
    emoji: "🚪",
    label: "Avoidant",
    description: "'I need space' pero nagsstalk sa socmed",
  },
  {
    value: "disorganized",
    emoji: "🌀",
    label: "Disorganized",
    description: "Push-pull champion of the world",
  },
  {
    value: "secure",
    emoji: "🧘",
    label: "Secure",
    description: "Allegedly healthy... sus",
  },
];

interface AttachmentStepProps {
  selected: AttachmentStyle;
  onSelect: (style: AttachmentStyle) => void;
}

export default function AttachmentStep({ selected, onSelect }: AttachmentStepProps) {
  return (
    <div className="flex flex-col gap-6 px-4 py-8 max-w-[680px] mx-auto w-full">
      <div className="flex flex-col gap-2">
        <StepIndicator current={3} />
        <h2 className="text-2xl font-bold text-text-primary">Attachment Style</h2>
        <p className="text-sm text-text-secondary">
          Be honest. The algorithm knows if you&apos;re lying.
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
              <div className="flex flex-col gap-0.5">
                <span className={`font-semibold text-sm ${isSelected ? "text-accent" : "text-text-primary"}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-text-secondary">{opt.description}</span>
              </div>
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
