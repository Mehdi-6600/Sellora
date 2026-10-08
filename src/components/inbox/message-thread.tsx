import * as React from "react";
import { cx, formatTime } from "@/lib/utils/format";
import { deliveryState } from "@/lib/ui/labels";
import type { Dict } from "@/lib/i18n/dictionaries/fa";
import type { Locale } from "@/lib/i18n";

type ThreadMessage = {
  id: string;
  direction: string;
  senderType: string;
  text: string;
  deliveryState: string;
  createdAt: Date | string;
};

/**
 * Message bubbles.
 *
 * Inbound (customer) messages sit on warm white surfaces, Sellora's automated
 * replies carry the brand gradient with the automation marker, and the owner's
 * own messages are the dark, "you" voice. Timestamps and delivery state are
 * always visible but quiet, and days are separated so long threads stay
 * readable.
 */
export function MessageThread({
  messages,
  dict,
  locale,
}: {
  messages: ThreadMessage[];
  dict: Dict;
  locale: Locale;
}) {
  if (messages.length === 0) {
    return (
      <div className="card px-6 py-10 text-center">
        <p className="text-[13px] font-semibold text-ink-800">هنوز پیامی رد و بدل نشده</p>
        <p className="mt-1 text-[12px] leading-6 text-ink-500">
          گفتگو ساخته شده اما پیامی ثبت نشده است. با تحویل گرفتن گفتگو می‌توانید اولین پیام را
          بفرستید.
        </p>
      </div>
    );
  }

  let lastDay = "";

  return (
    <div className="flex flex-col gap-2.5" id="messages">
      {messages.map((m) => {
        const day = new Date(m.createdAt).toLocaleDateString(
          locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-EG" : "en-US",
          { weekday: "long", day: "numeric", month: "long" }
        );
        const showDay = day !== lastDay;
        lastDay = day;

        const inbound = m.direction === "INBOUND";
        const automated = !inbound && m.senderType === "SELLORA";
        const failed = m.deliveryState !== "SENT" && !inbound;

        return (
          <React.Fragment key={m.id}>
            {showDay ? (
              <div className="mx-auto my-1 rounded-full bg-white/80 px-3 py-1 text-[10.5px] font-semibold text-ink-500 ring-1 ring-ink-100">
                {day}
              </div>
            ) : null}

            <div className={cx("flex", inbound ? "justify-start" : "justify-end")}>
              <div className={cx("max-w-[85%] sm:max-w-[75%]", !inbound && "items-end")}>
                {automated ? (
                  <div className="mb-1 flex items-center justify-end gap-1 text-[10.5px] font-bold text-brand-600">
                    <span aria-hidden="true">✦</span>
                    پاسخ خودکار سلورا
                  </div>
                ) : null}
                <div
                  className={cx(
                    "whitespace-pre-wrap break-words px-3.5 py-2.5 text-[13.5px] leading-7 shadow-[0_1px_2px_rgba(38,12,24,0.05)]",
                    inbound
                      ? "rounded-2xl rounded-ss-md border border-ink-100 bg-white text-ink-900"
                      : automated
                      ? "rounded-2xl rounded-se-md bg-brand-gradient text-white shadow-glowSoft"
                      : "rounded-2xl rounded-se-md bg-ink-900 text-white"
                  )}
                >
                  {m.text}
                </div>
                <div
                  className={cx(
                    "mt-1 flex items-center gap-1.5 text-[10.5px] text-ink-400",
                    inbound ? "justify-start" : "justify-end"
                  )}
                >
                  <time dateTime={new Date(m.createdAt).toISOString()}>
                    {formatTime(m.createdAt, locale)}
                  </time>
                  {!inbound ? (
                    <span
                      className={cx(
                        "font-semibold",
                        failed ? "text-amber-600" : "text-emerald-600"
                      )}
                    >
                      • {failed ? "⚠ " : "✓ "}
                      {deliveryState(m.deliveryState, dict)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      {/* Scroll anchor for the composer's "jump to newest" behaviour. */}
      <div id="thread-end" aria-hidden="true" className="h-1" />
    </div>
  );
}
