import * as React from "react";
import { cx } from "@/lib/utils/format";

/** Base surface: white, 22px radius, hairline border, wide soft shadow. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("card", className)}
      {...props}
    />
  );
}

/** Card that behaves like a link/button: lifts and warms on hover. */
export function CardLink({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { href?: string }) {
  return <div className={cx("card-link", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("px-4 pt-4 pb-2 sm:px-5 sm:pt-5", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("px-4 py-2 sm:px-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("flex items-center gap-2 px-4 pt-2 pb-4 sm:px-5 sm:pb-5", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cx("text-[15px] font-bold text-ink-900", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("mt-1 text-[13px] leading-6 text-ink-500", className)} {...props} />;
}

/** Section label with the hairline rule used across the app. */
export function SectionHeading({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cx("section-title", className)} {...props}>
      {children}
    </h2>
  );
}

/**
 * Small tinted icon container used beside titles and in list rows. Emoji or an
 * SVG both work; the surface keeps the soft-3D look consistent.
 */
const TONES = {
  brand: "border-brand-200/70 bg-brand-50 text-brand-400",
  neutral: "border-white/[0.1] bg-white/[0.05] text-ink-400",
  success: "border-emerald-400/30 bg-emerald-400/15 text-emerald-700",
  warning: "border-amber-400/30 bg-amber-400/15 text-amber-700",
  danger: "border-red-400/30 bg-red-400/15 text-red-700",
  info: "border-sky-400/30 bg-sky-400/15 text-sky-700",
  white: "border-white/25 bg-white/15 text-white backdrop-blur",
} as const;

export type TileTone = keyof typeof TONES;

export function IconTile({
  tone = "neutral",
  size = "md",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: TileTone; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-9 w-9 rounded-xl text-base",
    md: "h-11 w-11 rounded-2xl text-lg",
    lg: "h-14 w-14 rounded-2xl text-2xl",
  } as const;
  return (
    <span
      aria-hidden="true"
      className={cx(
        "grid shrink-0 place-items-center border shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
        sizes[size],
        TONES[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
