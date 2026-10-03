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
 * Words arrive one at a time, de-blurring into place — the headline is
 * delivered like a line read, not dumped on the page. Screen readers get the
 * full sentence at once via aria-label.
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
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + i * stagger, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
