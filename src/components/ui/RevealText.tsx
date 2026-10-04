"use client";

import { motion } from "framer-motion";

interface RevealTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  /** Seconds before the first word appears. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
}

/**
 * Words are set one at a time, like slugs of type dropped into a forme: each
 * falls in from above with a slight tilt and lands square. Screen readers get
 * the full sentence at once via aria-label.
 */
export default function RevealText({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
  stagger = 0.06,
}: RevealTextProps) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: -18, rotate: i % 2 ? 4 : -4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{
            delay: delay + i * stagger,
            y: { type: "spring", stiffness: 520, damping: 22 },
            rotate: { type: "spring", stiffness: 520, damping: 22 },
            opacity: { duration: 0.12 },
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
