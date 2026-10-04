"use client";

import StepShell from "@/components/ui/StepShell";
import OptionCard, { AnswerSheet } from "@/components/ui/OptionCard";
import Button from "@/components/ui/Button";
import {
  IconWords,
  IconActs,
  IconGifts,
  IconTime,
  IconTouch,
  IconArrowRight,
} from "@/components/ui/icons";
import { LoveLanguage } from "@/lib/types";

interface LoveLanguageOption {
  value: LoveLanguage;
  Icon: typeof IconWords;
  label: string;
  description: string;
  aside: string;
}

const OPTIONS: LoveLanguageOption[] = [
  {
    value: "words",
    Icon: IconWords,
    label: "Words of Affirmation",
    description: "Saying it out loud, and needing it said back.",
    aside: "Nire-reread ang “ingat ka” ng limang beses",
  },
  {
    value: "acts",
    Icon: IconActs,
    label: "Acts of Service",
    description: "Handling the thing before they notice it needs handling.",
    aside: "Nagpapa-Grab pauwi kahit hindi kayo",
  },
  {
    value: "gifts",
    Icon: IconGifts,
    label: "Receiving Gifts",
    description: "The object matters less than the fact they remembered.",
    aside: "Tinatago pa rin yung resibo ng milk tea",
  },
  {
    value: "time",
    Icon: IconTime,
    label: "Quality Time",
    description: "Undivided attention, phone face-down.",
    aside: "Ang “5 mins lang” mo ay 4 hours",
  },
  {
    value: "touch",
    Icon: IconTouch,
    label: "Physical Touch",
    description: "Proximity does what conversation can't.",
    aside: "Holding hands sa jeep, walang label",
  },
];

interface LoveLanguageStepProps {
  onBack?: () => void;
  selected: LoveLanguage[];
  onSelect: (langs: LoveLanguage[]) => void;
  onNext: () => void;
}

export default function LoveLanguageStep({
  onBack,
  selected,
  onSelect,
  onNext,
}: LoveLanguageStepProps) {
  function toggle(lang: LoveLanguage) {
    if (selected.includes(lang)) {
      onSelect(selected.filter((l) => l !== lang));
    } else {
      onSelect([...selected, lang]);
    }
  }

  return (
    <StepShell
      step={4}
      onBack={onBack}
      backLabel="Attachment"
      title="How do you show love?"
      subtitle="How you give it, not how you'd like to receive it. Pick all that apply — but picking all five says something too."
      footer={
        <Button onClick={onNext} disabled={selected.length === 0} className="w-full">
          {selected.length === 0 ? (
            "Pick at least one"
          ) : (
            <>
              Continue <IconArrowRight size={18} />
            </>
          )}
        </Button>
      }
    >
      <AnswerSheet
        part="Part IV · Love language"
        instructions="Shade all that apply."
        label="Love languages"
        multi
      >
        {OPTIONS.map(({ value, Icon, label, description, aside }, i) => (
          <OptionCard
            key={value}
            letter={"ABCDE"[i]}
            multi
            selected={selected.includes(value)}
            onSelect={() => toggle(value)}
            icon={<Icon size={34} />}
            label={label}
            description={description}
            aside={aside}
          />
        ))}
      </AnswerSheet>
    </StepShell>
  );
}
