import * as React from "react";
import { cx } from "@/lib/utils/format";
import { SelloraEmblem, type MarkTone } from "@/components/brand/sellora";

/**
 * Premium empty state.
 *
 * Every instance answers the three questions the design language requires:
 *  1. what is happening (title)
 *  2. why it matters (subtitle)
 *  3. what to do next (action / nextStep)
 *
 * The Sellora character is the default visual — it is the brand's own
 * illustration, so empty states feel owned rather than generic.
 */
export function Empty({
  title,
  subtitle,
  action,
  nextStep,
  tone = "brand",
  icon,
  compact = false,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Optional third line: the concrete next action. */
  nextStep?: string;
  tone?: MarkTone;
  /** Overrides the character with a simple glyph when a lighter feel fits. */
  icon?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "card flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-6 py-7" : "gap-3 px-6 py-10",
        className
      )}
    >
      {icon ? (
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-brand-100 bg-brand-50 text-2xl">
          {icon}
        </div>
      ) : (
        <SelloraEmblem size={compact ? 78 : 104} tone={tone} />
      )}
      <h3 className="mt-1 text-[15px] font-bold text-ink-900">{title}</h3>
      {subtitle && <p className="max-w-sm text-[13px] leading-6 text-ink-500">{subtitle}</p>}
      {nextStep && (
        <p className="max-w-sm text-[13px] font-medium leading-6 text-brand-700">{nextStep}</p>
      )}
      {action && <div className="mt-2 w-full max-w-xs sm:w-auto">{action}</div>}
    </div>
  );
}
