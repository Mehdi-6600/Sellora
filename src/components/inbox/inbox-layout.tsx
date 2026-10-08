import * as React from "react";
import { cx } from "@/lib/utils/format";
import { SelloraEmblem } from "@/components/brand/sellora";

/**
 * Inbox workspace.
 *
 * Desktop : conversation list · active conversation · customer panel, each pane
 *           scrolling on its own inside a viewport-height workspace.
 * Mobile  : exactly one pane at a time (list → conversation), with the customer
 *           details available as an in-thread disclosure — the phone experience
 *           is designed on its own terms, never a shrunken desktop grid.
 */
export function InboxLayout({
  list,
  thread,
  details,
  mobileView,
  className,
}: {
  list: React.ReactNode;
  thread: React.ReactNode;
  details?: React.ReactNode;
  /** Which pane a phone shows. */
  mobileView: "list" | "thread";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "lg:grid lg:items-start lg:gap-5",
        details
          ? "lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_minmax(0,18rem)]"
          : "lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]",
        className
      )}
    >
      <section
        aria-label="فهرست گفتگوها"
        className={cx(
          "lg:block lg:max-h-[calc(100dvh-9.5rem)] lg:overflow-y-auto lg:pe-1 lg:pb-2",
          mobileView === "thread" && "hidden"
        )}
      >
        {list}
      </section>

      <section
        aria-label="گفتگو"
        className={cx("min-w-0", mobileView === "list" && "hidden lg:block")}
      >
        {thread}
      </section>

      {details ? (
        <aside
          aria-label="اطلاعات مشتری"
          className="hidden lg:block lg:max-h-[calc(100dvh-9.5rem)] lg:overflow-y-auto"
        >
          {details}
        </aside>
      ) : null}
    </div>
  );
}

/** Placeholder for the desktop thread pane when nothing is selected. */
export function InboxPlaceholder({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="card flex h-full min-h-[420px] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <SelloraEmblem size={118} />
      <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>
      <p className="max-w-xs text-[13px] leading-6 text-ink-500">{hint}</p>
    </div>
  );
}
