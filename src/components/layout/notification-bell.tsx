import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getServerDict } from "@/lib/i18n";
import { unreadCount } from "@/lib/notifications";
import { toPersianDigits } from "@/lib/utils/format";

/**
 * Authenticated-header notification bell.
 *
 * Server component: renders the unread badge from a single indexed count
 * query scoped to the session's business. The surrounding page already runs
 * requireAuth(), so the bell only needs the session id — no extra membership
 * round-trip per page render.
 */
export async function NotificationBell() {
  const { dict, locale } = await getServerDict();
  const session = await getSession();
  if (!session) return null;

  const unread = await unreadCount(session.bid);
  const label =
    unread > 0
      ? `${dict.notifications.bellAria} — ${unread} ${dict.notifications.unreadWord}`
      : dict.notifications.bellAria;

  return (
    <Link
      href="/notifications"
      aria-label={label}
      className="relative p-2 -m-1 rounded-xl hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-ink-700"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      {unread > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-0.5 end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-bold grid place-items-center leading-none"
        >
          {locale === "fa" ? toPersianDigits(unread > 99 ? "99+" : String(unread)) : unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
