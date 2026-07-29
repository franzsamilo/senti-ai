/**
 * Shared motion vocabulary. Every step animates from the same physics so the
 * flow feels like one product rather than six screens that each found their
 * own easing curve.
 */

import type { Transition, Variants } from "framer-motion";

/** Default spring — quick to settle, slight overshoot for life. */
export const spring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.8,
};

/** Softer spring for larger surfaces (panels, progress fills). */
export const softSpring: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 30,
};

/** Parent of a staggered list. */
export const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.06 },
  },
};

/**
 * Parent of a dense grid (12 zodiac signs, 16 MBTI types). The per-item delay
 * has to be much tighter than a list's or the final tile lands half a second
 * after the first, which reads as jank rather than choreography.
 */
export const gridVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.018, delayChildren: 0.04 },
  },
};

/** Child of a staggered list — rises and fades into place. */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: spring },
};

/** Header block — leads the stagger, slightly earlier and slower. */
export const headerVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { ...spring, damping: 26 } },
};

/** Press feedback shared by every interactive card and button. */
export const pressable = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.985, y: 0 },
  transition: spring,
} as const;
