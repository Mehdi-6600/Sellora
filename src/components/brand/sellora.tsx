import * as React from "react";
import { cx } from "@/lib/utils/format";

/**
 * Sellora brand components.
 *
 * The mark is a faithful vector reconstruction of the official artwork
 * (public/og.jpg / public/icons/icon-512.png):
 *
 *   • a soft squircle (26% corner radius) filled with the brand gradient,
 *     bright rose at the top easing into deep wine at the bottom,
 *   • an inner top sheen + bottom vignette for the soft-3D lighting,
 *   • a white speech bubble outline with the brand "S" inside.
 *
 * It is deliberately NOT a new character, a generic AI glyph or a stock
 * illustration — it is the same character in the same style, rebuilt as crisp
 * SVG so it stays sharp from 16px favicons to hero illustrations.
 */

const S_PATH =
  "M36.5 23.5c-1.6-1.2-3.6-1.8-5.6-1.8-3.4 0-5.9 1.8-5.9 4.3 0 2.2 1.6 3.4 4.9 4.1l2.1.5c2 .4 2.7 1 2.7 1.9 0 1.2-1.4 2-3.6 2-2 0-3.8-.7-5.1-1.9l-2 2.6c1.8 1.6 4.4 2.5 7.1 2.5 3.8 0 6.5-2 6.5-4.8 0-2.3-1.6-3.6-5-4.3l-2.1-.5c-1.9-.4-2.6-.9-2.6-1.8 0-1.1 1.3-1.8 3.2-1.8 1.6 0 3.2.5 4.4 1.4l1.9-2.4Z";

const BUBBLE_PATH =
  "M32 14c-9.4 0-17 6.6-17 14.8 0 4.6 2.4 8.7 6.2 11.4-.3 2.2-1.1 4.3-2.6 6.1 2.9-.4 5.5-1.5 7.6-3 1.8.5 3.8.8 5.8.8 9.4 0 17-6.6 17-14.8S41.4 14 32 14Z";

export type MarkTone = "brand" | "muted" | "success" | "white";

/**
 * Stable, hydration-safe SVG id prefix. `useId` works in both server and
 * client components, so a mark rendered inside a client island hydrates with
 * exactly the same gradient ids it was server-rendered with.
 */
function useMarkId(): string {
  const raw = React.useId();
  return `sm-${raw.replace(/[^a-zA-Z0-9-]/g, "")}`;
}

const TONE_GRADIENTS: Record<MarkTone, [string, string, string]> = {
  brand: ["#f9709a", "#d6255c", "#8e0f39"],
  muted: ["#dcdee8", "#b9becd", "#8d93a8"],
  success: ["#6ee7b7", "#10b981", "#047857"],
  white: ["#ffffff", "#ffffff", "#ffffff"],
};

/**
 * The Sellora character/logo mark.
 *
 * @param size  rendered width & height in px
 * @param glow  adds the brand light bloom used on hero moments
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
  // Unique gradient ids per instance — several marks live on one page and
  // duplicate ids would make every mark inherit the first one's gradient.
  const id = useMarkId();
  const [light, mid, dark] = TONE_GRADIENTS[tone];
  const solid = tone === "white";

  return (
    <span
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center",
        glow && "drop-shadow-[0_18px_28px_rgba(214,37,92,0.35)]",
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label={title}
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={`${id}-body`} x1="0.12" y1="0" x2="0.86" y2="1">
            {/* Three stops reproduce the artwork's lighting curve: a bright
                top-left highlight, the crimson body, the deep-wine base. */}
            <stop offset="0%" stopColor={light} />
            <stop offset="46%" stopColor={mid} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <radialGradient id={`${id}-sheen`} cx="0.5" cy="0" r="0.85">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={solid ? 0 : 0.55} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-vignette`} cx="0.5" cy="1" r="0.8">
            <stop offset="0%" stopColor={dark} stopOpacity={solid ? 0 : 0.5} />
            <stop offset="100%" stopColor={dark} stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <rect width="64" height="64" rx="17" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${id}-clip)`}>
          <rect width="64" height="64" fill={`url(#${id}-body)`} />
          <rect width="64" height="64" fill={`url(#${id}-sheen)`} />
          <rect width="64" height="64" fill={`url(#${id}-vignette)`} />
        </g>

        {/* Speech bubble + brand letter, in the artwork's white. */}
        <path
          d={BUBBLE_PATH}
          fill="none"
          stroke={solid ? "#d6255c" : "#ffffff"}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d={S_PATH} fill={solid ? "#d6255c" : "#ffffff"} />
      </svg>
    </span>
  );
}

/**
 * Mark + wordmark + the thin underline from the reference artwork.
 * `tone="white"` is for the deep gradient surfaces; the default sits on light
 * backgrounds.
 */
export function SelloraLockup({
  size = 36,
  tone = "ink",
  subtitle,
  className,
}: {
  size?: number;
  tone?: "ink" | "white";
  subtitle?: React.ReactNode;
  className?: string;
}) {
  const white = tone === "white";
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <SelloraMark size={size} tone="brand" glow />
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
 * The character in a soft-3D scene, used for empty states, success moments and
 * onboarding: the mark floating above a rose light pool, with two blurred
 * spheres echoing the bokeh of the reference artwork.
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
  return (
    <span
      className={cx("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Light pool */}
      <span
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background:
            tone === "muted"
              ? "radial-gradient(circle at 50% 45%, rgba(141,147,168,0.28), transparent 68%)"
              : "radial-gradient(circle at 50% 45%, rgba(237,67,110,0.32), transparent 68%)",
        }}
      />
      {pulse ? (
        <span className="absolute inset-3 rounded-full border border-brand-300/60 animate-pulse-ring" />
      ) : null}
      {/* Small satellite spheres — the same lighting as the brand image. */}
      <span
        className="absolute rounded-full bg-gradient-to-br from-brand-300/70 to-brand-600/50 blur-[2px]"
        style={{ width: size * 0.14, height: size * 0.14, top: size * 0.06, insetInlineEnd: 0 }}
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
      <SelloraMark size={size * 0.72} tone={tone} glow className="animate-float" />
    </span>
  );
}

/**
 * Decorative brand aura for hero surfaces: two soft light sources in the
 * artwork's rose/wine tones. Purely presentational.
 */
export function BrandAura({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <span className="absolute -top-16 end-[-3rem] h-56 w-56 rounded-full bg-white/20 blur-2xl" />
      <span className="absolute bottom-[-4rem] start-[-2rem] h-52 w-52 rounded-full bg-brand-950/30 blur-2xl" />
      <span className="absolute top-1/3 start-1/3 h-24 w-24 rounded-full bg-brand-300/25 blur-xl" />
    </span>
  );
}
