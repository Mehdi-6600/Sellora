import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge, Dot } from "@/components/ui/badge";
import { ensureSubscriptionNotices } from "@/lib/notifications";
import {
  daysLeft,
  paymentStatusLabel,
  planLabel,
  subscriptionStatusLabel,
} from "@/lib/config/subscription";
import { toPersianDigits } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch (e: any) {
    if (e instanceof Response) {
      if (e.status === 401) redirect("/login");
    }
    throw e;
  }

  const today = startOfToday();

  const [
    openConvos,
    waitingOwner,
    hotLeadCount,
    ig,
    productCount,
    auto,
    hotLeads,
    messagesToday,
    convosToday,
    outboundTotal,
    outboundAuto,
    sub,
  ] = await Promise.all([
    prisma.conversation.count({
      where: { businessId: auth.businessId, state: { notIn: ["COMPLETED", "EXPIRED"] } },
    }),
    prisma.conversation.count({ where: { businessId: auth.businessId, state: "WAITING_OWNER" } }),
    prisma.lead.count({ where: { businessId: auth.businessId, temperature: "HOT" } }),
    prisma.instagramAccount.findUnique({ where: { businessId: auth.businessId } }),
    prisma.product.count({ where: { businessId: auth.businessId, status: { not: "ARCHIVED" } } }),
    prisma.automationConfig.findUnique({ where: { businessId: auth.businessId } }),
    prisma.lead.findMany({
      where: { businessId: auth.businessId, temperature: "HOT" },
      include: { conversation: true },
      orderBy: { score: "desc" },
      take: 3,
    }),
    prisma.message.count({ where: { businessId: auth.businessId, createdAt: { gte: today } } }),
    prisma.conversation.count({ where: { businessId: auth.businessId, createdAt: { gte: today } } }),
    prisma.message.count({ where: { businessId: auth.businessId, direction: "OUTBOUND" } }),
    prisma.message.count({
      where: { businessId: auth.businessId, direction: "OUTBOUND", senderType: "SELLORA", deliveryState: "SENT" },
    }),
    prisma.subscription.findUnique({ where: { businessId: auth.businessId } }),
  ]);

  // Lazy, server-computed expiry notices (no cron in this deployment).
  if (sub) await ensureSubscriptionNotices(sub);

  // Share of outbound messages that Sellora answered automatically. Both sides
  // come from the Message table, so this is a measured ratio, not a guess.
  const autoRate = outboundTotal > 0 ? Math.round((outboundAuto / outboundTotal) * 100) : null;

  const igNeedsAttention = !!ig && ig.status !== "CONNECTED";
  const left = sub ? daysLeft(sub.endsAt) : null;
  const subscriptionNeedsAttention =
    !!sub && (sub.status === "EXPIRED" || (left !== null && left <= 3) || sub.paymentStatus === "REJECTED");

  const needsAttention =
    waitingOwner > 0 || igNeedsAttention || subscriptionNeedsAttention || !auto?.enabled;

  const showOnboarding = !auto?.enabled || ig?.status !== "CONNECTED" || productCount === 0;

  return (
    <AppShell
      title={
        <span>
          {dict.dashboard.greeting}، {auth.user.name || auth.business.name} 👋
        </span>
      }
      subtitle={dict.app.tagline}
    >
      {needsAttention && (
        <section aria-label="نیاز به توجه شما" className="mb-4 space-y-2">
          {waitingOwner > 0 && (
            <Link href="/conversations" className="card p-3 flex items-center gap-3 border-amber-200 bg-amber-50">
              <Dot tone="amber" />
              <div className="flex-1 text-sm text-amber-900">
                {toPersianDigits(waitingOwner)} گفتگو منتظر پاسخ شماست.
              </div>
              <span aria-hidden="true" className="text-amber-700 rtl:rotate-180">
                ←
              </span>
            </Link>
          )}
          {igNeedsAttention && (
            <Link href="/settings/instagram" className="card p-3 flex items-center gap-3 border-red-200 bg-red-50">
              <Dot tone="red" />
              <div className="flex-1 text-sm text-red-900">
                {ig?.status === "REAUTH_REQUIRED"
                  ? "اتصال اینستاگرام به ورود مجدد نیاز دارد؛ پاسخ خودکار متوقف است."
                  : "اینستاگرام متصل نیست؛ پاسخ خودکار کار نمی‌کند."}
              </div>
              <span aria-hidden="true" className="text-red-700 rtl:rotate-180">
                ←
              </span>
            </Link>
          )}
          {subscriptionNeedsAttention && sub && (
            <Link
              href="/settings/subscription"
              className="card p-3 flex items-center gap-3 border-amber-200 bg-amber-50"
            >
              <Dot tone="amber" />
              <div className="flex-1 text-sm text-amber-900">
                {sub.paymentStatus === "REJECTED"
                  ? `درخواست پرداخت رد شد: ${sub.rejectionReason || "برای جزئیات ببینید"}`
                  : sub.status === "EXPIRED"
                  ? "اشتراک شما منقضی شده است."
                  : `اعتبار اشتراک تا ${toPersianDigits(Math.max(left ?? 0, 0))} روز دیگر تمام می‌شود.`}
              </div>
              <span aria-hidden="true" className="text-amber-700 rtl:rotate-180">
                ←
              </span>
            </Link>
          )}
          {!auto?.enabled && (
            <Link href="/settings" className="card p-3 flex items-center gap-3 border-ink-200 bg-ink-50">
              <Dot tone="gray" />
              <div className="flex-1 text-sm text-ink-700">پاسخ‌گویی خودکار غیرفعال است.</div>
              <span aria-hidden="true" className="text-ink-500 rtl:rotate-180">
                ←
              </span>
            </Link>
          )}
        </section>
      )}

      {showOnboarding && (
        <Link
          href="/onboarding"
          className="block card p-4 mb-4 bg-gradient-to-l from-brand-50 to-white border-brand-200"
        >
          <div className="flex items-start gap-3">
            <div aria-hidden="true" className="h-9 w-9 rounded-xl bg-brand-600 text-white grid place-items-center">
              🚀
            </div>
            <div>
              <div className="font-semibold text-ink-900">{dict.dashboard.startOnboarding}</div>
              <div className="text-sm text-ink-600 mt-0.5">
                {ig?.status === "CONNECTED" ? dict.dashboard.addProductsDesc : dict.dashboard.connectInstagramDesc}
              </div>
            </div>
            <div aria-hidden="true" className="ms-auto text-brand-600 rtl:rotate-180">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      <section aria-label="امروز" className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-br from-brand-600 to-brand-500 text-white border-0 shadow-none">
          <div className="text-xs opacity-80">گفتگوهای امروز</div>
          <div className="mt-1 text-2xl font-bold">{toPersianDigits(convosToday)}</div>
          <div className="text-xs opacity-80 mt-0.5">
            {toPersianDigits(messagesToday)} پیام امروز
          </div>
        </Card>
        <Link href="/leads" className="card p-4">
          <div className="text-xs text-ink-500">{dict.dashboard.hotLeads}</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{toPersianDigits(hotLeadCount)}</div>
          <div className="text-xs text-ink-500 mt-0.5">{dict.dashboard.hotLeadsDesc}</div>
        </Link>
        <Link href="/conversations" className="card p-4">
          <div className="text-xs text-ink-500">{dict.dashboard.conversationsOpen}</div>
          <div className="mt-1 text-2xl font-bold">{toPersianDigits(openConvos)}</div>
          <div className="text-xs text-ink-500 mt-0.5">
            {waitingOwner > 0
              ? `${toPersianDigits(waitingOwner)} ${dict.dashboard.conversationsWaiting}`
              : "همه تحت کنترل ✨"}
          </div>
        </Link>
        <Card className="p-4">
          <div className="text-xs text-ink-500">سهم پاسخ خودکار</div>
          <div className="mt-1 text-2xl font-bold">{autoRate === null ? "—" : `${toPersianDigits(autoRate)}٪`}</div>
          <div className="text-xs text-ink-500 mt-0.5">
            {toPersianDigits(outboundAuto)} از {toPersianDigits(outboundTotal)} پیام ارسالی
          </div>
        </Card>
      </section>

      <div className="section-title">{dict.dashboard.hotLeads}</div>
      {hotLeads.length === 0 ? (
        <Card className="p-6 text-center text-sm text-ink-500">
          هنوز مشتری داغی شناسایی نشده. وقتی مشتری قصد خرید نشان بدهد، اینجا می‌بینید.
        </Card>
      ) : (
        <div className="space-y-2">
          {hotLeads.map((lead: any) => (
            <Link key={lead.id} href={`/conversations/${lead.conversationId}`} className="card p-4 flex items-center gap-3">
              <div aria-hidden="true" className="h-10 w-10 rounded-full bg-red-50 text-red-600 grid place-items-center font-bold">
                🔥
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 truncate">
                  {lead.conversation.customerName || lead.conversation.customerUsername || "مشتری"}
                </div>
                <div className="text-xs text-ink-500 truncate">{lead.reason}</div>
              </div>
              <Badge tone="red">{toPersianDigits(lead.score)}/۱۰۰</Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="section-title">وضعیت سرویس</div>
      <div className="grid grid-cols-1 gap-2">
        <StatusRow
          label={dict.nav.instagram}
          connected={ig?.status === "CONNECTED"}
          okText={dict.settings.instagram.statusConnected}
          badText={dict.settings.instagram.statusDisconnected}
          href="/settings/instagram"
        />
        <StatusRow
          label={dict.nav.products}
          connected={productCount > 0}
          okText={`${toPersianDigits(productCount)} محصول ثبت شده`}
          badText="محصولی ثبت نشده"
          href="/products"
        />
        <StatusRow
          label="پاسخ‌گویی خودکار"
          connected={auto?.enabled ?? false}
          okText="فعال"
          badText="غیرفعال"
          href="/settings"
        />
        <StatusRow
          label={dict.nav.subscription}
          connected={sub?.status === "ACTIVE"}
          okText={
            sub
              ? `${planLabel(sub.plan)} — ${subscriptionStatusLabel(sub.status)}${
                  sub.status === "ACTIVE" && left !== null ? ` (${toPersianDigits(Math.max(left, 0))} روز مانده)` : ""
                }`
              : dict.settings.subscription.trial
          }
          badText={
            sub
              ? `${planLabel(sub.plan)} — ${
                  sub.paymentStatus ? paymentStatusLabel(sub.paymentStatus) : subscriptionStatusLabel(sub.status)
                }`
              : "اشتراکی انتخاب نشده"
          }
          href="/settings/subscription"
        />
      </div>
    </AppShell>
  );
}

function StatusRow({
  label,
  connected,
  okText,
  badText,
  href,
}: {
  label: string;
  connected: boolean;
  okText: string;
  badText: string;
  href: string;
}) {
  return (
    <Link href={href} className="card p-3 flex items-center gap-3 min-h-[52px]">
      <Dot tone={connected ? "green" : "amber"} />
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-ink-500">{connected ? okText : badText}</div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400 rtl:rotate-180" aria-hidden="true">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </Link>
  );
}
