"use client";

import StepIndicator from "@/components/StepIndicator";

interface ZodiacOption {
  value: string;
  symbol: string;
  label: string;
}

const ZODIACS: ZodiacOption[] = [
  { value: "aries", symbol: "♈", label: "Aries" },
  { value: "taurus", symbol: "♉", label: "Taurus" },
  { value: "gemini", symbol: "♊", label: "Gemini" },
  { value: "cancer", symbol: "♋", label: "Cancer" },
  { value: "leo", symbol: "♌", label: "Leo" },
  { value: "virgo", symbol: "♍", label: "Virgo" },
  { value: "libra", symbol: "♎", label: "Libra" },
  { value: "scorpio", symbol: "♏", label: "Scorpio" },
  { value: "sagittarius", symbol: "♐", label: "Sagittarius" },
  { value: "capricorn", symbol: "♑", label: "Capricorn" },
  { value: "aquarius", symbol: "♒", label: "Aquarius" },
  { value: "pisces", symbol: "♓", label: "Pisces" },
];

interface ZodiacStepProps {
  selected: string;
  onSelect: (zodiac: string) => void;
}

export default function ZodiacStep({ selected, onSelect }: ZodiacStepProps) {
  return (
    <div className="flex flex-col gap-6 px-4 py-8 max-w-[680px] mx-auto w-full">
      <div className="flex flex-col gap-2">
        <StepIndicator current={5} />
        <h2 className="text-2xl font-bold text-text-primary">Zodiac Sign</h2>
        <p className="text-sm text-text-secondary">
          The stars don&apos;t lie. Neither does this algorithm.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {ZODIACS.map((z) => {
          const isSelected = selected === z.value;
          return (
            <button
              key={z.value}
              onClick={() => onSelect(z.value)}
              className={[
                "flex flex-col items-center justify-center gap-1 rounded-lg border py-3 sm:py-4 transition-all duration-150 cursor-pointer min-h-[56px]",
                isSelected
                  ? "bg-accent/10 border-accent shadow-[0_0_12px_rgba(255,50,82,0.25)]"
                  : "bg-bg-card border-border-subtle hover:border-accent/50",
              ].join(" ")}
            >
              <span className={`text-lg sm:text-xl ${isSelected ? "text-accent" : "text-text-secondary"}`}>
                {z.symbol}
              </span>
              <span className={`text-[10px] sm:text-xs font-mono leading-tight text-center ${isSelected ? "text-accent" : "text-text-muted"}`}>
                {z.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
