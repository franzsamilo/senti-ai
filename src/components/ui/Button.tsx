"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: Variant;
  children?: ReactNode;
}

/**
 * Buttons are keys on a videoke remote or a cassette deck: an ink-rimmed
 * cap that sits 4px proud of its plate and physically travels down when
 * pressed. Primary keys are riso pink; secondary keys are bare card stock;
 * ghost is just an underlined word.
 */
const BASE =
  "relative inline-flex items-center justify-center gap-2 min-h-[50px] px-5 sm:px-6 py-3 rounded-[12px] font-display font-extrabold uppercase tracking-[0.04em] text-[18px] leading-none cursor-pointer select-none disabled:cursor-not-allowed transition-[transform,box-shadow,background-color] duration-100 ease-out";

const KEY: Record<Exclude<Variant, "ghost">, CSSProperties> = {
  // Icons on a pink key print their spot pass in yellow, or it would vanish.
  primary: {
    background: "var(--pink)",
    color: "var(--ink)",
    border: "2px solid var(--ink)",
    ["--icon-spot" as string]: "var(--yellow)",
  },
  secondary: { background: "var(--paper-light)", color: "var(--ink)", border: "2px solid var(--ink)" },
};

const DISABLED: CSSProperties = {
  background: "#e6ddcb",
  color: "#8c8597",
  border: "2px dashed rgba(29,25,50,0.3)",
  boxShadow: "none",
};

const GHOST =
  "min-h-[44px] px-2 font-body normal-case tracking-normal text-[15px] font-semibold text-text-secondary hover:text-text-primary underline decoration-2 underline-offset-4 decoration-transparent hover:decoration-pink";

export default function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  if (variant === "ghost") {
    return (
      <motion.button
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className={`${BASE} ${GHOST} ${disabled ? "opacity-50" : ""} ${className}`}
        style={{ boxShadow: "none", ...style }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      disabled={disabled}
      initial={false}
      whileHover={disabled ? undefined : { y: -1, boxShadow: "0 5px 0 #1d1932" }}
      whileTap={disabled ? undefined : { y: 3, boxShadow: "var(--shadow-key-down)" }}
      transition={{ type: "spring", stiffness: 900, damping: 40 }}
      className={`${BASE} ${className}`}
      style={{
        ...(disabled ? DISABLED : { ...KEY[variant], boxShadow: "var(--shadow-key)" }),
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * A navigation link styled as a key. Use this instead of wrapping <Button>
 * in <Link> — a button inside an anchor is invalid HTML and confuses screen
 * readers about what the control does.
 */
export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  if (variant === "ghost") {
    return (
      <Link href={href} className={`${BASE} ${GHOST} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`${BASE} hover:-translate-y-px active:translate-y-[3px] active:!shadow-[0_1px_0_#1d1932] ${className}`}
      style={{ ...KEY[variant], boxShadow: "var(--shadow-key)" }}
    >
      {children}
    </Link>
  );
}
