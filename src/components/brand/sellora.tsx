import * as React from "react";
import Image from "next/image";
import { cx } from "@/lib/utils/format";

/**
 * Sellora brand components.
 *
 * Every surface below renders the OFFICIAL Sellora artwork — the original
 * character image that ships with the product:
 *
 *   public/icons/icon-512.png   the original character (512px master)
 *   public/icons/icon-192.png   app icon (same artwork, 192px)
 *   public/og.jpg               reference lockup: wordmark + underline + bokeh
 *
 * The character is never redrawn, recolored, filtered or replaced by an SVG
 * recreation: face, shape, colors, details and style stay pixel-identical to
 * the original artwork everywhere the logo appears (sidebar, mobile header,
 * login/signup, onboarding, dashboard, Instagram connect, empty states,
 * error/404, landing hero, favicon & app icons).
 */

/** The original Sellora character artwork (official master). */
const ARTWORK_SRC = "/icons/icon-512.png";

export type MarkTone = "brand" | "muted" | "success" | "white";

/**
 * The real Sellora logo mark — the original character image, untouched.
 *
 * @param size     rendered width & height in px (responsive per call site)
 * @param tone     "white" adds a frosted ring so the mark lifts off deep
 *                 gradient panels; the artwork itself is never recolored
 * @param glow     brand light bloom used on hero moments
 * @param priority preload the image (header/sidebar logos)
 */
export function SelloraMark({
  size = 40,
  tone = "brand",
  glow = false,
  priority = false,
  className,
  title = "سلورا",
  style,
  ...rest
}: {
  size?: number;
  tone?: MarkTone;
  glow?: boolean;
  priority?: boolean;
  className?: string;
  title?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const frosted = tone === "white";

  return (
    <span
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center",
        frosted && "rounded-[26%] ring-2 ring-white/60 shadow-[0_12px_32px_-14px_rgba(6,3,20,0.7)]",
        glow && "drop-shadow-[0_4px_8px_rgba(24,39,65,0.10)]",
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      <Image
        src={ARTWORK_SRC}
        alt={title}
        width={size}
        height={size}
        sizes={`${size}px`}
        priority={priority}
        className="h-full w-full rounded-[26%]"
      />
    </span>
  );
}

/**
 * Professional lockup of the REAL character + the Sellora wordmark, with the
 * thin underline from the reference artwork (public/og.jpg).
 * `tone="white"` is for deep premium-gradient surfaces; the default sits on
 * the light canvas.
 */
export function SelloraLockup({
  size = 36,
  tone = "ink",
  subtitle,
  className,
  priority = false,
}: {
  size?: number;
  tone?: "ink" | "white";
  subtitle?: React.ReactNode;
  className?: string;
  priority?: boolean;
}) {
  const white = tone === "white";
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <SelloraMark size={size} tone="brand" glow priority={priority} />
      <span className="flex flex-col leading-none">
        <span
          className={cx(
            "font-extrabold tracking-[-0.02em]",
            white ? "text-white" : "text-ink-950"
          )}
          style={{ fontSize: Math.round(size * 0.5) }}
          dir="ltr"
        >
          Sellora
        </span>
        {/* The hairline under the wordmark in the brand artwork. */}
        <span
          aria-hidden="true"
          className={cx(
            "mt-[3px] block h-px w-[78%] rounded-full",
            white ? "bg-white/70" : "bg-gradient-to-r from-brand-400 to-brand-700/10"
          )}
        />
        {subtitle ? (
          <span
            className={cx(
              "mt-1 text-[11px] font-medium leading-none",
              white ? "text-white/80" : "text-ink-500"
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/**
 * The original character floating in a soft-3D scene, used for empty states,
 * success moments, onboarding and error screens: the real artwork above a
 * violet light pool, with two blurred spheres echoing the bokeh of the
 * reference artwork. The artwork pixels are never altered.
 */
export function SelloraEmblem({
  size = 116,
  tone = "brand",
  pulse = false,
  className,
}: {
  size?: number;
  tone?: MarkTone;
  pulse?: boolean;
  className?: string;
}) {
  const onDeep = tone === "white";
  return (
    <span
      className={cx("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Light pool — violet on the premium canvas, white on gradient panels */}
      <span
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: onDeep
            ? "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.20), transparent 68%)"
            : "radial-gradient(circle at 50% 45%, rgba(0,122,255,0.08), transparent 68%)",
        }}
      />
      {pulse ? (
        <span className="absolute inset-3 rounded-full border border-blue-400/50 animate-pulse-ring" />
      ) : null}
      {/* Small satellite spheres — violet + brand rose, the artwork's bokeh. */}
      <span
        className="absolute rounded-full bg-gradient-to-br from-blue-100 to-blue-50 blur-[2px]"
        style={{ width: size * 0.14, height: size * 0.14, top: size * 0.06, insetInlineEnd: 0 }}
      />
      <span
        className="absolute rounded-full bg-gradient-to-br from-brand-300/70 to-brand-600/50 blur-[3px]"
        style={{
          width: size * 0.1,
          height: size * 0.1,
          bottom: size * 0.12,
          insetInlineStart: size * 0.02,
        }}
      />
      <SelloraMark size={Math.round(size * 0.72)} tone={onDeep ? "white" : "brand"} glow  />
    </span>
  );
}

/**
 * Decorative premium aura for hero surfaces: two soft violet light sources
 * plus a brand-rose whisper, matching the new Purple Premium canvas.
 * Purely presentational.
 */
export function BrandAura({ className: _className }: { className?: string }) {
  return null;
}
