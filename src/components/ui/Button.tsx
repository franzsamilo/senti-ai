"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { spring } from "@/components/ui/motion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: "primary" | "secondary" | "ghost";
  children?: ReactNode;
}

export default function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "relative px-4 sm:px-6 py-3 rounded-xl font-semibold text-[15px] tracking-tight transition-colors duration-200 min-h-[48px] cursor-pointer inline-flex items-center justify-center overflow-hidden";

  const variants = {
    primary: disabled
      ? "text-neutral-600 cursor-not-allowed"
      : "text-white",
    secondary:
      "border border-border-subtle hover:border-accent/50 text-text-primary bg-transparent",
    ghost: "text-text-secondary hover:text-text-primary bg-transparent",
  };

  const primaryStyle = disabled
    ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }
    : {
        background: "linear-gradient(135deg, #ff3252, #ff0844)",
        boxShadow: "0 0 24px rgba(255,50,82,0.35)",
      };

  return (
    <motion.button
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2, boxShadow: "0 0 34px rgba(255,50,82,0.5)" }}
      whileTap={disabled ? undefined : { scale: 0.98, y: 0 }}
      transition={spring}
      className={`${base} ${variants[variant]} ${className}`}
      style={variant === "primary" ? primaryStyle : undefined}
      {...props}
    >
      {/* Sheen sweep on hover — subtle, only on the enabled primary */}
      {variant === "primary" && !disabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
          }}
        />
      )}
      {children}
    </motion.button>
  );
}
