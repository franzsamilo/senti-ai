"use client";

import { motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import OptionCard from "@/components/ui/OptionCard";
import Button from "@/components/ui/Button";
import {
  IconWords,
  IconActs,
  IconGifts,
  IconTime,
  IconTouch,
  IconArrowRight,
} from "@/components/ui/icons";
import { listVariants } from "@/components/ui/motion";
import { LoveLanguage } from "@/lib/types";

interface LoveLanguageOption {
  value: LoveLanguage;
  Icon: typeof IconWords;
  label: string;
  description: string;
}

const OPTIONS: LoveLanguageOption[] = [
  {
    value: "words",
    Icon: IconWords,
    label: "Words of Affirmation",
    description: "Saying it out loud, and needing it said back.",
  },
  {
    value: "acts",
    Icon: IconActs,
    label: "Acts of Service",
    description: "Handling the thing before they notice it needs handling.",
  },
  {
    value: "gifts",
    Icon: IconGifts,
    label: "Receiving Gifts",
    description: "The object matters less than the fact they remembered.",
  },
  {
    value: "time",
    Icon: IconTime,
    label: "Quality Time",
    description: "Undivided attention, phone face-down.",
  },
  {
    value: "touch",
    Icon: IconTouch,
    label: "Physical Touch",
    description: "Proximity does what conversation can't.",
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
      kicker="INTAKE"
      title="Love language"
      subtitle="How you give it, not how you'd like to receive it. Select all that apply."
      footer={
        <Button onClick={onNext} disabled={selected.length === 0} className="w-full gap-2">
          {selected.length === 0 ? "Select at least one" : "Continue"}
          {selected.length > 0 && <IconArrowRight size={18} />}
        </Button>
      }
    >
      <motion.div variants={listVariants} className="flex flex-col gap-2.5">
        {OPTIONS.map(({ value, Icon, label, description }) => (
          <OptionCard
            key={value}
            multi
            selected={selected.includes(value)}
            onSelect={() => toggle(value)}
            icon={<Icon size={22} />}
            label={label}
            description={description}
          />
        ))}
      </motion.div>
    </StepShell>
  );
}
