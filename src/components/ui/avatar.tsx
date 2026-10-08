import * as React from "react";
import { cx } from "@/lib/utils/format";

/**
 * Customer avatar.
 *
 * Uses the real Instagram profile picture when it exists and falls back to a
 * deterministic brand-tinted monogram, so a list never shows a raw grey box.
 */
const PALETTE = [
  "from-brand-500 to-brand-700",
  "from-brand-400 to-brand-600",
  "from-brand-600 to-brand-900",
  "from-sky-500 to-brand-600",
  "from-emerald-500 to-brand-600",
  "from-amber-500 to-brand-700",
];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) % 9973;
  return h;
}

export function Avatar({
  name,
  src,
  size = 44,
  className,
}: {
  name: string | null | undefined;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const label = (name || "?").trim();
  const initial = label.slice(0, 1).toUpperCase();
  const gradient = PALETTE[hash(label) % PALETTE.length];

  return (
    <span
      className={cx(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
        gradient,
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {src ? (
        // Owner-supplied/Instagram CDN URLs are not in next/image remotePatterns
        // for every case, so keep a plain lazy <img> with explicit dimensions.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-bold leading-none">{initial}</span>
      )}
    </span>
  );
}
