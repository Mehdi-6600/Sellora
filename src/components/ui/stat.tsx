import * as React from "react";
import Link from "next/link";
import { cx } from "@/lib/utils/format";
import { IconTile, type TileTone } from "@/components/ui/card";

/**
 * Metric card used by the dashboard, the automations page and the admin panel.
 * One component keeps every number in the product typographically identical.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  href,
  featured = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: TileTone;
  href?: string;
  /** Brand-gradient treatment for the single most important number. */
  featured?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cx(
            "text-[12px] font-semibold leading-5",
            featured ? "text-white/85" : "text-ink-500"
          )}
        >
          {label}
        </span>
        {icon ? (
          <IconTile
            tone={featured ? "white" : tone}
            size="sm"
            className={featured ? "border-white/20 bg-white/15 text-white" : undefined}
          >
            {icon}
          </IconTile>
        ) : null}
      </div>
      <div
        className={cx(
          "tnum mt-2 text-[26px] font-extrabold leading-none tracking-tight",
          featured ? "text-white" : "text-ink-950"
        )}
      >
        {value}
      </div>
      {hint ? (
        <div
          className={cx(
            "mt-1.5 text-[11px] leading-5",
            featured ? "text-white/80" : "text-ink-500"
          )}
        >
          {hint}
        </div>
      ) : null}
    </>
  );

  const shell = cx(
    "relative overflow-hidden rounded-card border p-4 text-start",
    featured
      ? "border-brand-700/25 bg-brand-gradient text-white shadow-glowSoft"
      : "border-ink-100/90 bg-white shadow-card",
    href && !featured && "transition-all duration-200 ease-smooth hover:-translate-y-[2px] hover:border-brand-200/80 hover:shadow-card-hover",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cx(shell, "block focus-visible:outline-none")}>
        {featured ? <span className="shimmer-overlay" aria-hidden="true" /> : null}
        <div className="relative">{body}</div>
      </Link>
    );
  }

  return (
    <div className={shell}>
      {featured ? <span className="shimmer-overlay" aria-hidden="true" /> : null}
      <div className="relative">{body}</div>
    </div>
  );
}

/**
 * Compact "state of the service" row: label, live value and a chevron.
 * Server-rendered links keep keyboard navigation intact.
 */
export function StatusRow({
  label,
  value,
  hint,
  tone = "brand",
  icon,
  href,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: TileTone;
  icon?: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      {icon ? (
        <IconTile tone={tone} size="sm">
          {icon}
        </IconTile>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-ink-900">{label}</span>
        {hint ? <span className="mt-0.5 block truncate text-[11px] text-ink-500">{hint}</span> : null}
      </span>
      <span className="shrink-0 text-[12px] font-semibold text-ink-700">{value}</span>
      {href ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0 text-ink-300 rtl:rotate-180"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      ) : null}
    </>
  );

  const shell =
    "flex min-h-[56px] items-center gap-3 rounded-2xl px-3 py-2.5 transition";

  if (href) {
    return (
      <Link href={href} className={cx(shell, "hover:bg-canvas-soft active:bg-canvas")}>
        {inner}
      </Link>
    );
  }
  return <div className={shell}>{inner}</div>;
}
