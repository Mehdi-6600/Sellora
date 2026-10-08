import Link from "next/link";
import { cx, formatRelativeTime, toPersianDigits } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Dot } from "@/components/ui/badge";
import { IconClock, IconInfo, IconInstagram, IconSparkle, IconUser } from "@/components/layout/icons";
import { automationStatus, conversationState, leadTemperature } from "@/lib/ui/labels";
import type { Dict } from "@/lib/i18n/dictionaries/fa";
import type { Locale } from "@/lib/i18n";

type PanelConversation = {
  id: string;
  customerName?: string | null;
  customerUsername?: string | null;
  customerProfilePic?: string | null;
  state: string;
  automationLock: string;
  lastMessageAt: Date | string;
  createdAt: Date | string;
  lead?: {
    temperature: string;
    score: number;
    reason?: string | null;
    contactName?: string | null;
    contactPhone?: string | null;
    contactCity?: string | null;
    capturedContact?: boolean;
    hotAt?: Date | string | null;
  } | null;
};

/**
 * Customer side panel: who is talking, how warm they are, and what Sellora has
 * captured. Read-only by design — the takeover / hand-back controls live in the
 * composer so there is exactly one place to change who answers.
 */
export function CustomerPanel({
  convo,
  messageCount,
  dict,
  locale,
}: {
  convo: PanelConversation;
  messageCount: number;
  dict: Dict;
  locale: Locale;
}) {
  const name = convo.customerName || convo.customerUsername || "مشتری";
  const state = conversationState(convo.state, dict);
  const automation = automationStatus(convo.automationLock, convo.state, dict);
  const lead = convo.lead;
  const temp = lead ? leadTemperature(lead.temperature, dict) : null;

  return (
    <div className="space-y-3">
      {/* ------------------------------------------------------- customer card */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <Avatar name={name} src={convo.customerProfilePic} size={52} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-bold text-ink-900">{name}</div>
            {convo.customerUsername ? (
              <div className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-500" dir="ltr">
                <IconInstagram size={14} className="text-brand-500" />
                <span className="truncate">@{convo.customerUsername.replace(/^@/, "")}</span>
              </div>
            ) : (
              <div className="mt-0.5 text-[12px] text-ink-500">مشتری اینستاگرام</div>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone={automation.tone}>
            <Dot tone={automation.tone} />
            {automation.label}
          </Badge>
          <Badge tone={state.tone}>{state.label}</Badge>
        </div>
      </div>

      {/* ------------------------------------------------------------ lead card */}
      {lead ? (
        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[13px] font-bold text-ink-900">
              <IconSparkle size={16} className="text-brand-500" />
              امتیاز مشتری
            </div>
            {temp ? <Badge tone={temp.tone}>{temp.label}</Badge> : null}
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="tnum text-[22px] font-extrabold text-ink-950">
                {toPersianDigits(lead.score)}
                <span className="text-[12px] font-semibold text-ink-400"> / ۱۰۰</span>
              </span>
              {lead.hotAt ? (
                <span className="text-[11px] text-ink-500">
                  داغ از {formatRelativeTime(lead.hotAt, locale)}
                </span>
              ) : null}
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100"
              role="img"
              aria-label={`امتیاز ${lead.score} از ۱۰۰`}
            >
              <div
                className={cx(
                  "h-full rounded-full bg-gradient-to-r",
                  lead.temperature === "HOT"
                    ? "from-brand-400 to-brand-700"
                    : lead.temperature === "WARM"
                    ? "from-amber-400 to-brand-500"
                    : "from-ink-300 to-ink-400"
                )}
                style={{ width: `${Math.max(4, Math.min(100, lead.score))}%` }}
              />
            </div>
          </div>

          {lead.reason ? (
            <p className="mt-3 rounded-xl bg-canvas-soft px-3 py-2 text-[12px] leading-6 text-ink-600">
              {lead.reason}
            </p>
          ) : null}

          {lead.capturedContact ? (
            <dl className="mt-3 space-y-1.5 text-[12px]">
              {lead.contactName ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-500">نام</dt>
                  <dd className="truncate font-semibold text-ink-800">{lead.contactName}</dd>
                </div>
              ) : null}
              {lead.contactPhone ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-500">تماس</dt>
                  <dd className="truncate font-semibold text-ink-800" dir="ltr">
                    {lead.contactPhone}
                  </dd>
                </div>
              ) : null}
              {lead.contactCity ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-500">شهر</dt>
                  <dd className="truncate font-semibold text-ink-800">{lead.contactCity}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      ) : (
        <div className="card p-4">
          <div className="flex items-center gap-2 text-[13px] font-bold text-ink-900">
            <IconUser size={16} className="text-ink-400" />
            مشتری هنوز داغ نشده
          </div>
          <p className="mt-2 text-[12px] leading-6 text-ink-500">
            وقتی مشتری قصد خرید نشان دهد (مثلاً «همینو می‌خوام» یا درخواست ثبت سفارش)، سلورا امتیاز
            می‌دهد و از طریق اعلان خبر می‌دهد.
          </p>
        </div>
      )}

      {/* --------------------------------------------------------- meta card */}
      <div className="card p-4">
        <div className="flex items-center gap-2 text-[13px] font-bold text-ink-900">
          <IconInfo size={16} className="text-ink-400" />
          جزئیات گفتگو
        </div>
        <dl className="mt-3 space-y-2 text-[12px]">
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-ink-500">
              <IconClock size={13} />
              آخرین پیام
            </dt>
            <dd className="font-semibold text-ink-800">
              <time dateTime={new Date(convo.lastMessageAt).toISOString()}>
                {formatRelativeTime(convo.lastMessageAt, locale)}
              </time>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-ink-500">تعداد پیام‌ها</dt>
            <dd className="tnum font-semibold text-ink-800">{toPersianDigits(messageCount)}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-ink-500">شروع گفتگو</dt>
            <dd className="font-semibold text-ink-800">
              <time dateTime={new Date(convo.createdAt).toISOString()}>
                {formatRelativeTime(convo.createdAt, locale)}
              </time>
            </dd>
          </div>
        </dl>
      </div>

      <Link
        href="/automations"
        className="card-link flex items-center gap-3 p-3 text-[12px] font-semibold text-ink-700"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700">
          <IconSparkle size={17} />
        </span>
        کدام پاسخ‌ها خودکار ارسال می‌شوند؟
      </Link>
    </div>
  );
}
