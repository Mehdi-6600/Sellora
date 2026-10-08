import Link from "next/link";
import { notificationMeta } from "@/lib/notifications";
import { cx } from "@/lib/utils/format";

export type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
  relativeTime: string;
};

/**
 * One notification row.
 *
 * Rendered as a real <Link> (keyboard + screen-reader friendly). Clicking an
 * unread row marks it read with a keepalive POST so the request survives the
 * navigation, then follows the deep link.
 */
export function NotificationItem({ n }: { n: NotificationRow }) {
  const meta = notificationMeta(n.kind);
  const unread = !n.readAt;

  return (
    <Link
      href={n.href}
      onClick={() => {
        if (!unread) return;
        // keepalive lets the mark-read request finish after navigation starts.
        fetch(`/api/notifications/${n.id}/read`, { method: "POST", keepalive: true }).catch(() => {});
      }}
      className={cx(
        "card p-4 flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
        unread && "border-brand-200 bg-brand-50/40"
      )}
    >
      <div
        aria-hidden="true"
        className={cx(
          "h-10 w-10 rounded-xl grid place-items-center text-lg flex-shrink-0",
          meta.tone === "red" && "bg-red-50",
          meta.tone === "amber" && "bg-amber-50",
          meta.tone === "green" && "bg-emerald-50",
          meta.tone === "blue" && "bg-sky-50",
          meta.tone === "gray" && "bg-ink-100"
        )}
      >
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={cx("text-sm truncate", unread ? "font-bold text-ink-900" : "font-medium text-ink-700")}>
            {n.title}
          </div>
          {unread && (
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-600 flex-shrink-0" />
          )}
        </div>
        <div className="text-xs text-ink-600 leading-6 mt-0.5">{n.body}</div>
        <div className="text-[11px] text-ink-400 mt-1">
          <time dateTime={n.createdAt}>{n.relativeTime}</time>
        </div>
      </div>
    </Link>
  );
}
