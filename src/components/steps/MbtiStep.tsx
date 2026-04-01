"use client";

import StepIndicator from "@/components/StepIndicator";

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

interface MbtiStepProps {
  selected: string;
  onSelect: (mbti: string) => void;
}

export default function MbtiStep({ selected, onSelect }: MbtiStepProps) {
  return (
    <div className="flex flex-col gap-6 px-4 py-8 max-w-[680px] mx-auto w-full">
      <div className="flex flex-col gap-2">
        <StepIndicator current={2} />
        <h2 className="text-2xl font-bold text-text-primary">MBTI Type</h2>
        <p className="text-sm text-text-secondary">
          Select your personality type (or the one you identify with after 3AM)
        </p>
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {MBTI_TYPES.map((type) => {
          const isSelected = selected === type;
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={[
                "h-12 sm:h-14 rounded-lg border font-mono font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer min-h-[44px]",
                isSelected
                  ? "bg-accent border-accent text-white shadow-[0_0_12px_rgba(255,50,82,0.35)]"
                  : "bg-bg-card border-border-subtle text-text-secondary hover:border-accent/50 hover:text-text-primary",
              ].join(" ")}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
