"use client";

import * as React from "react";
import { cx } from "@/lib/utils/format";

type Variant = "primary" | "success" | "secondary" | "ghost" | "danger" | "danger-soft" | "glass";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "btn-primary",
  success: "btn-success",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  "danger-soft": "btn-danger-soft",
  glass: "btn-glass",
};

/**
 * Sizes are touch-first: the medium button is 44px tall (WCAG 2.5.5 target
 * size) and the large one 52px, so a phone never shows a microscopic control.
 */
const SIZES: Record<Size, string> = {
  sm: "min-h-[44px] px-3.5 py-2 text-[13px] rounded-xl",
  md: "min-h-[44px] px-4 py-2.5 text-sm",
  lg: "min-h-[52px] px-5 py-3 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and blocks interaction — for async submits. */
  loading?: boolean;
  /** Full-width, the default for mobile forms. */
  block?: boolean;
}) {
  return (
    <button
      className={cx(
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        loading && "pointer-events-none",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cx("h-4 w-4 shrink-0 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
