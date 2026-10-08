import * as React from "react";
import { cx } from "@/lib/utils/format";

type Tone = "brand" | "green" | "red" | "amber" | "gray" | "blue";

/**
 * Soft tinted pills on light surfaces: restrained tone backgrounds
 * with dark text and a hairline ring of the same hue. Readable at 11–12px
 * and consistent across every screen.
 */
const tones: Record<Tone, string> = {
  brand: "bg-brand-500/15 text-brand-700 ring-brand-400/30",
  green: "bg-emerald-400/15 text-emerald-700 ring-emerald-400/25",
  red: "bg-red-400/15 text-red-700 ring-red-400/25",
  amber: "bg-amber-400/15 text-amber-700 ring-amber-400/25",
  gray: "bg-ink-50 text-ink-600 ring-ink-200",
  blue: "bg-sky-400/15 text-sky-700 ring-sky-400/25",
};

const dotColors: Record<Tone, string> = {
  brand: "bg-brand-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  gray: "bg-ink-400",
  blue: "bg-sky-500",
};

export function Badge({
  tone = "gray",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ring-1",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "green" }: { tone?: Tone }) {
  return (
    <span className={cx("inline-block h-1.5 w-1.5 shrink-0 rounded-full", dotColors[tone])} />
  );
}

/**
 * Live status indicator: a ringed dot that softly pulses while "active".
 * Used for the Instagram connection state.
 */
export function StatusPulse({ tone = "green" }: { tone?: Tone }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center">
      <span
        className={cx(
          "absolute inline-flex h-full w-full rounded-full opacity-60",
          dotColors[tone],
          "animate-pulse-ring"
        )}
      />
      <span className={cx("relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-white", dotColors[tone])} />
    </span>
  );
}
