"use client";

import * as React from "react";
import Link from "next/link";
import { cx } from "@/lib/utils/format";
import { IconChevronLeft } from "@/components/layout/icons";

export type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
  relativeTime: string;
  /** Presentation derived on the server from the kind (single source: lib/notifications). */
  tone: "red" | "amber" | "green" | "blue" | "gray";
  icon: string;
};

/**
 * Marks one notification read on the server (tenant-scoped by the API route).
 * Non-fatal: if the request fails we still navigate, and the server state
 * stays the single source of truth for the unread badge.
 */
function postMarkRead(id: string): Promise<void> {
  return fetch(`/api/notifications/${id}/read`, { method: "POST" })
    .then(() => undefined)
    .catch(() => undefined);
}

/**
 * One notification row.
 *
 * Rendered as a real <Link> (keyboard + screen-reader friendly). Clicking an
 * unread row:
 *   1. waits for the mark-read request to finish (so the destination is
 *      rendered from DB state that already counts it as read — no race),
 *   2. navigates to the deep link with a full document load, which bypasses
 *      Next's client router cache (it can replay a previously visited page
 *      with the stale unread badge).
 * Modified / middle clicks keep the browser's native behaviour.
 */
export function NotificationItem({ n }: { n: NotificationRow }) {
  const [opening, setOpening] = React.useState(false);
  const unread = !n.readAt;

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!unread) return;
    const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    if (modified) {
      // New tab / window: let the browser open it; still record the read.
      void postMarkRead(n.id);
      return;
    }
    e.preventDefault();
    if (opening) return;
    setOpening(true);
    void (async () => {
      await postMarkRead(n.id);
      // Full document navigation: the deep-link page is rendered fresh from the
      // DB, which already holds the read state committed by the POST above.
      // A client-side push can replay a cached page with the old unread count
      // (router.refresh() + push race), so the badge would look stuck.
      window.location.assign(n.href);
    })();
  }

  const tile =
    n.tone === "red"
      ? "border-red-400/25 bg-red-400/15 text-red-300"
      : n.tone === "amber"
      ? "border-amber-400/25 bg-amber-400/15 text-amber-300"
      : n.tone === "green"
      ? "border-emerald-400/25 bg-emerald-400/15 text-emerald-300"
      : n.tone === "blue"
      ? "border-sky-400/25 bg-sky-400/15 text-sky-300"
      : "border-ink-100 bg-ink-50 text-ink-600";

  return (
    <Link
      href={n.href}
      onClick={onClick}
      className={cx(
        "card-link flex items-start gap-3 p-3.5 focus-visible:outline-none",
        unread && "border-brand-200/80 bg-brand-50/40"
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-lg",
          tile
        )}
      >
        {n.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cx(
              "truncate text-[13px]",
              unread ? "font-bold text-ink-950" : "font-semibold text-ink-700"
            )}
          >
            {n.title}
          </span>
          {unread ? (
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-brand-600"
            />
          ) : null}
        </span>
        <span className="mt-0.5 block text-[12px] leading-6 text-ink-600">{n.body}</span>
        <span className="mt-1 block text-[10.5px] text-ink-400">
          <time dateTime={n.createdAt}>{n.relativeTime}</time>
        </span>
      </span>
      <IconChevronLeft size={16} className="mt-3 shrink-0 text-ink-400 rtl:rotate-180" />
    </Link>
  );
}
