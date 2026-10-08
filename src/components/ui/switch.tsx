"use client";

import * as React from "react";
import { cx } from "@/lib/utils/format";

/**
 * Premium switch.
 *
 * Renders a real <button role="switch"> so it keeps native button semantics
 * (Enter/Space, focus ring) while the track and knob carry the soft-3D look.
 * `as="span"` is available when the surrounding element must stay a <form>
 * submit button (see the settings/automation toggle, which works without JS).
 */
export function SwitchVisual({
  checked,
  size = "md",
  className,
}: {
  checked: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const track = size === "sm" ? "h-6 w-11" : "h-7 w-[52px]";
  const knob = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const offset = size === "sm" ? 2 : 2;

  return (
    <span
      className={cx(
        "relative inline-flex shrink-0 items-center rounded-full border transition-all duration-300 ease-smooth",
        track,
        checked
          ? "border-brand-700/25 bg-gradient-to-b from-brand-500 to-brand-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]"
          : "border-ink-200 bg-ink-200/80 shadow-inset",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "absolute rounded-full bg-white shadow-[0_2px_5px_rgba(6,3,20,0.28)] transition-all duration-300 ease-smooth",
          knob
        )}
        style={{
          insetInlineStart: checked
            ? `calc(100% - ${(size === "sm" ? 20 : 24) + offset}px)`
            : `${offset}px`,
        }}
      />
    </span>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  size = "md",
  className,
}: {
  checked: boolean;
  onCheckedChange?: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cx(
        "rounded-full p-0.5 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:opacity-50",
        className
      )}
    >
      <SwitchVisual checked={checked} size={size} />
    </button>
  );
}
