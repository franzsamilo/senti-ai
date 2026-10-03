"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { spring } from "@/components/ui/motion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: "primary" | "secondary" | "ghost";
  children?: ReactNode;
}

const VARIANTS = {
  primary: "text-white",
  secondary:
    "bg-white/80 text-text-primary border border-border-subtle hover:border-accent/40 hover:bg-white",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-white/50",
};

export default function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const base =
    "group relative px-5 sm:px-6 py-3 rounded-2xl font-semibold text-[15px] tracking-tight transition-colors duration-200 min-h-[48px] cursor-pointer inline-flex items-center justify-center overflow-hidden disabled:cursor-not-allowed";

  const primaryStyle = disabled
    ? { background: "#efe6ee", color: "#a898b2", boxShadow: "none" }
    : { background: "var(--dusk-button)", boxShadow: "var(--shadow-glow)" };

  return (
    <motion.button
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
      transition={spring}
      className={`${base} ${variant === "primary" ? (disabled ? "" : VARIANTS.primary) : VARIANTS[variant]} ${
        disabled && variant !== "primary" ? "opacity-50" : ""
      } ${className}`}
      style={variant === "primary" ? { ...primaryStyle, ...style } : style}
      {...props}
    >
      {/* Light sweep on hover — only on the enabled primary */}
      {variant === "primary" && !disabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)",
          }}
        />
      )}
      <span className="relative inline-flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}

/**
 * A navigation link styled as a button. Use this instead of wrapping <Button>
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
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: ReactNode;
}) {
  const base =
    "relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-semibold text-[15px] tracking-tight min-h-[48px] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]";
  return (
    <Link
      href={href}
      className={`${base} ${variant === "primary" ? "text-white" : VARIANTS[variant]} ${className}`}
      style={variant === "primary" ? { background: "var(--dusk-button)", boxShadow: "var(--shadow-glow)" } : undefined}
    >
      {children}
    </Link>
  );
}
