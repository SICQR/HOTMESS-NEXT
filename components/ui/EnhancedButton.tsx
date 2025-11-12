"use client";
import React from "react";
import clsx from "clsx";

export type EnhancedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  glow?: boolean;
};

export function EnhancedButton({ variant = "primary", size = "md", icon, glow, className, children, disabled, ...rest }: EnhancedButtonProps) {
  const base = "btn-base focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-primary)]";
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm md:text-base",
    lg: "px-6 py-3 text-base",
  }[size];
  const variants = {
    primary: "btn-primary",
    secondary: "bg-surface text-white hover:bg-neutral-800",
    outline: "btn-outline",
    ghost: "bg-transparent text-white hover:bg-neutral-900/60",
  }[variant];
  const glowCls = glow ? "glow-primary" : "";
  const disabledCls = disabled ? "opacity-60 cursor-not-allowed" : "";

  return (
    <button className={clsx(base, sizes, variants, glowCls, disabledCls, className)} disabled={disabled} {...rest}>
      {icon && <span className="opacity-90" aria-hidden>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
