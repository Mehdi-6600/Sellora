import * as React from "react";
import Image from "next/image";
import { cx } from "@/lib/utils/format";

/**
 * Sellora brand components — built on THE ORIGINAL ARTWORK.
 *
 * The assets in `public/brand/` are the official Sellora images, not
 * recreations and not new SVG icons:
 *
 *   • sellora-mark*         — the original character (speech bubble + “S”),
 *                             derived from the official 512×512 icon by
 *                             resampling + alpha extraction only. No pixel of
 *                             the artwork is redrawn or recoloured.
 *   • sellora-wordmark*     — the official “Sellora” wordmark with its hairline
 *                             underline, cropped out of the original banner
 *                             (public/og.jpg) with the background keyed out.
 *                             It is white *in the artwork itself*.
 *
 * Because the wordmark is white in the artwork, the lockup is placed on the
 * deep-violet brand plate (exactly like the reference image, where it sits on
 * a coloured background). The artwork's own colours — rose, crimson, wine —
 * are never re-tinted to match the purple environment.
 */

/** Intrinsic size of public/brand/sellora-wordmark.png (used for next/image). */
const WORDMARK_RATIO = 646 / 194;

export type MarkTone = "brand" | "muted" | "success" | "white";

/** Soft-3D light pool + satellites, tinted per tone. */
const EMBLEM_TONES: Record<MarkTone, { pool: string; satellite: string }> = {
  brand: {
    pool: "radial-gradient(circle at 50% 46%, rgba(237,67,110,0.30), rgba(124,76,228,0.16) 52%, transparent 70%)",
    satellite: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(214,37,92,0.55))",
  },
  muted: {
    pool: "radial-gradient(circle at 50% 46%, rgba(152,146,179,0.28), transparent 68%)",
    satellite: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(152,146,179,0.6))",
  },
  success: {
    pool: "radial-gradient(circle at 50% 46%, rgba(16,185,129,0.26), transparent 68%)",
    satellite: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(16,185,129,0.55))",
  },
  white: {
    pool: "radial-gradient(circle at 50% 46%, rgba(255,255,255,0.35), transparent 70%)",
    satellite: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.55))",
  },
};

/**
 * The Sellora character — the original artwork, served as an image so it stays
 * pixel-identical to the reference at every size (16px favicon → 340px hero).
 *
 * @param size  rendered width & height in px (responsive callers pass a number)
 * @param glow  adds the artwork's own rose light bloom
 */
export function SelloraMark({
  size = 40,
  tone = "brand",
  glow = false,
  className,
  title = "سلورا",
  style,
  ...rest
}: {
  size?: number;
  tone?: MarkTone;
  glow?: boolean;
  className?: string;
  title?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const muted = tone === "muted";
  const white = tone === "white";

  return (
    <span
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center",
        glow && !muted && "drop-shadow-[0_18px_28px_rgba(124,76,228,0.35)]",
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      <Image
        src="/brand/sellora-mark.webp"
        alt={title}
        width={size}
        height={size}
        sizes={`${size}px`}
        priority={size >= 100}
        /* Serve the artwork file byte-for-byte: no recompression, so the
           character's gradient and transparency stay exactly as designed. */
        unoptimized
        className={cx(
          "h-full w-full select-none",
          muted && "opacity-45 grayscale",
          white && "drop-shadow-[0_10px_22px_rgba(31,10,69,0.28)]"
        )}
        draggable={false}
      />
    </span>
  );
}

/**
 * The official “Sellora” wordmark (white, straight out of the reference
 * artwork) with its hairline underline. Always pair it with a brand plate or a
 * deep-violet surface — that is how the reference artwork uses it too.
 */
export function SelloraWordmark({
  height = 30,
  className,
  title = "Sellora",
  priority = false,
}: {
  /** Rendered height of the wordmark block in px. */
  height?: number;
  className?: string;
  title?: string;
  priority?: boolean;
}) {
  const width = Math.round(height * WORDMARK_RATIO);
  return (
    <Image
      src="/brand/sellora-wordmark.webp"
      alt={title}
      width={width}
      height={height}
      sizes={`${width}px`}
      priority={priority}
      unoptimized
      draggable={false}
      className={cx("block h-auto w-auto select-none", className)}
      style={{ height, width: "auto" }}
    />
  );
}

/**
 * The deep-violet brand plate: the surface the artwork's own lockup sits on
 * (mirrors public/og.jpg, where the wordmark lives on a coloured background).
 */
function BrandPlate({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "relative inline-flex items-center overflow-hidden rounded-2xl border border-white/15",
        "bg-brand-gradient shadow-glowSoft ring-1 ring-inset ring-white/10",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/22 to-transparent"
      />
      <span className="relative inline-flex items-center">{children}</span>
    </span>
  );
}

/**
 * Mark + wordmark lockup.
 *
 * `variant="plate"` (default) renders the artwork on the violet brand plate —
 * the correct treatment for a white wordmark on light chrome (sidebar, mobile
 * header, marketing header). `variant="bare"` is for surfaces that are already
 * deep violet (hero panels, footers, auth brand panel).
 */
export function SelloraLockup({
  size = 40,
  variant = "plate",
  priority = false,
  subtitle,
  className,
  nameClassName,
}: {
  /** Height of the character mark in px. Everything else scales from it. */
  size?: number;
  variant?: "plate" | "bare";
  priority?: boolean;
  subtitle?: React.ReactNode;
  className?: string;
  nameClassName?: string;
}) {
  const markSize = size;
  const wordmarkHeight = Math.max(14, Math.round(size * 0.62));
  const gap = Math.max(6, Math.round(size * 0.22));

  const content = (
    <>
      <SelloraMark size={markSize} glow={variant === "bare"} title="سلورا" />
      <span className="inline-flex flex-col justify-center">
        <SelloraWordmark height={wordmarkHeight} priority={priority} className={nameClassName} />
        {subtitle ? (
          <span className="mt-1 text-[11px] font-medium leading-none text-white/80">{subtitle}</span>
        ) : null}
      </span>
    </>
  );

  if (variant === "bare") {
    return (
      <span
        className={cx("inline-flex items-center", className)}
        style={{ gap }}
      >
        {content}
      </span>
    );
  }

  const padX = Math.max(8, Math.round(size * 0.32));
  const padY = Math.max(5, Math.round(size * 0.2));

  return (
    <BrandPlate className={className}>
      <span
        className="inline-flex items-center"
        style={{ gap, paddingInline: padX, paddingBlock: padY }}
      >
        {content}
      </span>
    </BrandPlate>
  );
}

/**
 * The character in a soft-3D scene — for empty states, success moments,
 * onboarding and 404/error pages: the real artwork floating above a rose light
 * pool, with two blurred satellites echoing the bokeh of the reference image.
 *
 * @param feather blends the artwork's light vignette into the purple canvas
 *                with a soft radial mask (used for large hero sizes).
 */
export function SelloraEmblem({
  size = 116,
  tone = "brand",
  pulse = false,
  feather = false,
  className,
}: {
  size?: number;
  tone?: MarkTone;
  pulse?: boolean;
  feather?: boolean;
  className?: string;
}) {
  const markSize = Math.round(size * 0.72);
  const t = EMBLEM_TONES[tone];
  const big = size >= 120;

  return (
    <span
      className={cx("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Light pool — the artwork's rose plus a violet ambient so it sits on
          the purple canvas without a hard edge. */}
      <span
        className="absolute inset-0 blur-xl"
        style={{ background: t.pool, borderRadius: "9999px" }}
      />
      {pulse ? (
        <span className="absolute inset-3 rounded-full border border-brand-300/60 animate-pulse-ring" />
      ) : null}
      {/* Small satellite spheres — the same lighting as the brand image. */}
      <span
        className="absolute rounded-full blur-[2px]"
        style={{
          background: t.satellite,
          width: size * 0.14,
          height: size * 0.14,
          top: size * 0.06,
          insetInlineEnd: 0,
        }}
      />
      <span
        className="absolute rounded-full bg-gradient-to-br from-white/90 to-brand-200/70 blur-[3px]"
        style={{
          width: size * 0.1,
          height: size * 0.1,
          bottom: size * 0.12,
          insetInlineStart: size * 0.02,
        }}
      />
      <SelloraMark
        size={markSize}
        tone={tone}
        glow
        title="سلورا"
        className={cx("animate-float", feather && big && "brand-feather")}
      />
    </span>
  );
}

/**
 * Decorative aura for deep-violet hero surfaces: soft violet light sources plus
 * a whisper of the artwork's rose. Purely presentational.
 */
export function BrandAura({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <span className="absolute -top-16 end-[-3rem] h-56 w-56 rounded-full bg-white/20 blur-2xl" />
      <span className="absolute bottom-[-4rem] start-[-2rem] h-52 w-52 rounded-full bg-brand-950/30 blur-2xl" />
      <span className="absolute top-1/3 start-1/3 h-24 w-24 rounded-full bg-brand-300/25 blur-xl" />
      <span className="absolute top-1/4 end-1/4 h-20 w-20 rounded-full bg-rose-400/20 blur-xl" />
    </span>
  );
}
