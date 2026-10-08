import Link from "next/link";
import { cx, toPersianDigits } from "@/lib/utils/format";
import { IconBell } from "./icons";

/**
 * Authenticated-header notification bell.
 *
 * Presentational: the unread count is resolved once per render by AppShell
 * (one indexed count query) and shared with the sidebar and bottom nav, so a
 * page never issues the same count twice.
 */
export function NotificationBell({
  unread,
  label,
  className,
}: {
  unread: number;
  label: string;
  className?: string;
}) {
  const ariaLabel = unread > 0 ? `${label} — ${toPersianDigits(unread)}` : label;

  return (
    <Link
      href="/notifications"
      aria-label={ariaLabel}
      className={cx(
        "relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-transparent text-ink-600 transition hover:border-ink-100 hover:bg-canvas-soft hover:text-ink-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200",
        className
      )}
    >
      <IconBell size={20} />
      {unread > 0 && (
        <span
          aria-hidden="true"
          className="tnum absolute -top-0.5 end-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
        >
          {unread > 99 ? "۹۹+" : toPersianDigits(unread)}
        </span>
      )}
    </Link>
  );
}
