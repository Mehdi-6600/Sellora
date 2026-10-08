import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getServerDict } from "@/lib/i18n";
import { cx, formatRelativeTime, toPersianDigits } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { leadTemperature } from "@/lib/ui/labels";

/**
 * Conversation list, shared by the inbox (mobile, full screen) and the desktop
 * two/three-pane workspace.
 *
 * "Needs a reply" is derived honestly from the data we have: the newest message
 * in the thread is inbound and nobody has answered it yet. There is no invented
 * read-receipt state.
 */
export async function ConversationList({
  businessId,
  activeId,
  className,
}: {
  businessId: string;
  activeId?: string;
  className?: string;
}) {
  const { dict, locale } = await getServerDict();

  const convos = await prisma.conversation.findMany({
    where: { businessId },
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      lead: true,
    },
    take: 100,
  });

  if (convos.length === 0) {
    return (
      <Empty
        title={dict.conversations.empty}
        subtitle="سلورا گفتگوهای اینستاگرام فروشگاه را همین‌جا جمع می‌کند؛ به محض رسیدن اولین پیام مشتری، مکالمه با خلاصه‌ی آخرین پیام نمایش داده می‌شود."
        nextStep="برای شروع، حساب اینستاگرام کسب‌وکار را متصل کنید."
        action={
          <Link href="/settings/instagram" className="btn-primary w-full">
            {dict.dashboard.connectInstagram}
          </Link>
        }
      />
    );
  }

  // "Needs a reply" is derived, never invented: the newest message in the
  // thread came from the customer and nobody has answered it yet.
  const lastOf = (c: any) => (Array.isArray(c.messages) ? c.messages[0] : undefined);
  const needsReply = (c: any) => lastOf(c)?.direction === "INBOUND" || c.state === "WAITING_OWNER";
  const waiting = convos.filter(needsReply).length;

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[12px] font-semibold text-ink-500">
          <span className="tnum">{toPersianDigits(convos.length)}</span> گفتگو
        </span>
        {waiting > 0 ? (
          <Badge tone="amber">
            <span className="tnum">{toPersianDigits(waiting)}</span> در انتظار پاسخ
          </Badge>
        ) : (
          <Badge tone="green">همه پاسخ داده شده</Badge>
        )}
      </div>

      <ul className="space-y-2 lg:space-y-1.5">
        {convos.map((c: any) => {
          const last = lastOf(c);
          const active = c.id === activeId;
          const unanswered = needsReply(c);
          const hot = c.lead?.temperature === "HOT";
          const temp = c.lead ? leadTemperature(c.lead.temperature, dict) : null;
          const displayName = c.customerName || c.customerUsername || "مشتری";

          return (
            <li key={c.id}>
              <Link
                href={`/conversations/${c.id}`}
                aria-current={active ? "true" : undefined}
                className={cx(
                  "relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200",
                  active
                    ? "border-brand-200 bg-brand-50/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                    : unanswered
                    ? "border-amber-400/30 bg-amber-400/15 hover:border-amber-400/30 hover:shadow-card"
                    : "border-ink-100/90 bg-white/[0.06] hover:-translate-y-[1px] hover:border-brand-200/70 hover:shadow-card"
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-2 start-0 w-1 rounded-full bg-gradient-to-b from-brand-400 to-brand-700"
                  />
                ) : null}

                <Avatar name={displayName} src={c.customerProfilePic} size={46} />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] font-bold text-ink-900">
                      {displayName}
                    </span>
                    {hot && <Badge tone="red">🔥 {dict.leads.hot}</Badge>}
                    {!hot && temp?.tone === "amber" && <Badge tone="amber">{temp.label}</Badge>}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    {unanswered ? (
                      <span className="shrink-0 rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-400/25">
                        پاسخ نداده
                      </span>
                    ) : null}
                    <span
                      className={cx(
                        "truncate text-[12px] leading-5",
                        unanswered ? "font-medium text-ink-700" : "text-ink-500"
                      )}
                    >
                      {last ? last.text : "گفتگوی جدید"}
                    </span>
                  </span>
                </span>

                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  {last ? (
                    <time
                      className="text-[10px] font-medium text-ink-400"
                      dateTime={new Date(last.createdAt).toISOString()}
                    >
                      {formatRelativeTime(last.createdAt, locale)}
                    </time>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={cx(
                      "h-2 w-2 rounded-full",
                      unanswered
                        ? "bg-amber-500"
                        : c.automationLock === "HUMAN"
                        ? "bg-sky-500"
                        : "bg-emerald-500"
                    )}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
