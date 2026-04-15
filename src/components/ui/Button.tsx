"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 min-h-[44px] cursor-pointer inline-flex items-center justify-center";

  const variants = {
    primary: disabled
      ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
      : "bg-gradient-to-r from-accent to-accent-secondary text-white shadow-[0_0_20px_rgba(255,50,82,0.4)] hover:shadow-[0_0_28px_rgba(255,50,82,0.6)] hover:brightness-110",
    secondary:
      "border border-border-subtle hover:border-accent/50 text-text-primary hover:text-white bg-transparent",
    ghost:
      "text-text-secondary hover:text-text-primary bg-transparent",
  };

  return (
    <button
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
