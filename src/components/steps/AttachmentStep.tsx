"use client";

import { motion } from "framer-motion";
import StepShell from "@/components/ui/StepShell";
import OptionCard from "@/components/ui/OptionCard";
import {
  IconAnxious,
  IconAvoidant,
  IconDisorganized,
  IconSecure,
} from "@/components/ui/icons";
import { listVariants } from "@/components/ui/motion";
import { AttachmentStyle } from "@/lib/types";

interface AttachmentOption {
  value: AttachmentStyle;
  Icon: typeof IconAnxious;
  label: string;
  description: string;
  aside: string;
}

const OPTIONS: AttachmentOption[] = [
  {
    value: "anxious",
    Icon: IconAnxious,
    label: "Anxious",
    description: "You notice the gap between the message and the reply.",
    aside: "“Bakit hindi ka nagrereply?!” energy",
  },
  {
    value: "avoidant",
    Icon: IconAvoidant,
    label: "Avoidant",
    description: "You ask for space before anyone asks you for more.",
    aside: "“I need space” pero nag-i-stalk sa socmed",
  },
  {
    value: "disorganized",
    Icon: IconDisorganized,
    label: "Disorganized",
    description: "You want closeness and distance in the same hour.",
    aside: "Push-pull champion of the world",
  },
  {
    value: "secure",
    Icon: IconSecure,
    label: "Secure",
    description: "You say what you mean and it usually goes fine.",
    aside: "Allegedly healthy… sus",
  },
];

interface AttachmentStepProps {
  onBack?: () => void;
  selected: AttachmentStyle | null;
  onSelect: (style: AttachmentStyle) => void;
}

export default function AttachmentStep({ onBack, selected, onSelect }: AttachmentStepProps) {
  return (
    <StepShell
      step={3}
      onBack={onBack}
      backLabel="Type"
      title="How do you attach?"
      subtitle="Pick how you actually behave, not how you'd describe yourself to a friend. The algorithm knows."
    >
      <motion.div variants={listVariants} className="flex flex-col gap-2.5">
        {OPTIONS.map(({ value, Icon, label, description, aside }) => (
          <OptionCard
            key={value}
            selected={selected === value}
            onSelect={() => onSelect(value)}
            icon={<Icon size={22} />}
            label={label}
            description={description}
            aside={aside}
            layoutGroupId="attachment-selection"
          />
        ))}
      </motion.div>
    </StepShell>
  );
}
