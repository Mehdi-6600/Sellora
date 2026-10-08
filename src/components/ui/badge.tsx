import * as React from "react";
import { cx } from "@/lib/utils/format";

type Tone = "brand" | "green" | "red" | "amber" | "gray" | "blue";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-800",
  gray: "bg-ink-100 text-ink-700",
  blue: "bg-blue-50 text-blue-700",
};

export function Badge({ tone = "gray", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Dot({ tone = "green" }: { tone?: Tone }) {
  const colors: Record<Tone, string> = {
    brand: "bg-brand-500",
    green: "bg-emerald-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
    gray: "bg-ink-400",
    blue: "bg-blue-500",
  };
  return <span className={cx("inline-block h-1.5 w-1.5 rounded-full", colors[tone])} />;
}
