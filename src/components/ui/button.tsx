"use client";

import * as React from "react";
import { cx } from "@/lib/utils/format";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none";
  const variants: Record<Variant, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft",
    secondary: "bg-white text-ink-900 border border-ink-200 hover:bg-ink-50",
    ghost: "text-ink-700 hover:bg-ink-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes: Record<Size, string> = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-3.5 text-base",
  };
  return <button className={cx(base, variants[variant], sizes[size], className)} {...props} />;
}
