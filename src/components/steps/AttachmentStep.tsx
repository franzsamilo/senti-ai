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
}

const OPTIONS: AttachmentOption[] = [
  {
    value: "anxious",
    Icon: IconAnxious,
    label: "Anxious",
    description: "You notice the gap between the message and the reply.",
  },
  {
    value: "avoidant",
    Icon: IconAvoidant,
    label: "Avoidant",
    description: "You ask for space before anyone asks you for more.",
  },
  {
    value: "disorganized",
    Icon: IconDisorganized,
    label: "Disorganized",
    description: "You want closeness and distance in the same hour.",
  },
  {
    value: "secure",
    Icon: IconSecure,
    label: "Secure",
    description: "You say what you mean and it usually goes fine.",
  },
];

interface AttachmentStepProps {
  selected: AttachmentStyle;
  onSelect: (style: AttachmentStyle) => void;
}

export default function AttachmentStep({ selected, onSelect }: AttachmentStepProps) {
  return (
    <StepShell
      step={3}
      kicker="INTAKE"
      title="Attachment style"
      subtitle="Answer for how you actually behave, not how you'd describe yourself to a friend."
    >
      <motion.div variants={listVariants} className="flex flex-col gap-2.5">
        {OPTIONS.map(({ value, Icon, label, description }) => (
          <OptionCard
            key={value}
            selected={selected === value}
            onSelect={() => onSelect(value)}
            icon={<Icon size={22} />}
            label={label}
            description={description}
            layoutGroupId="attachment-selection"
          />
        ))}
      </motion.div>
    </StepShell>
  );
}
