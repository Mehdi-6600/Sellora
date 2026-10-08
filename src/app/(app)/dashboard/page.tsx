import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge, StatusPulse } from "@/components/ui/badge";
import { StatCard, StatusRow } from "@/components/ui/stat";
import { Avatar } from "@/components/ui/avatar";
import { SelloraEmblem, BrandAura } from "@/components/brand/sellora";
import { ensureSubscriptionNotices } from "@/lib/notifications";
import {
  daysLeft,
  paymentStatusLabel,
  planLabel,
  subscriptionStatusLabel,
} from "@/lib/config/subscription";
import { cx, formatRelativeTime, toPersianDigits } from "@/lib/utils/format";
import {
  IconArrowRight,
  IconBell,
  IconBolt,
  IconCard,
  IconFlame,
  IconInbox,
  IconInstagram,
  IconSparkle,
} from "@/components/layout/icons";

export const dynamic = "force-dynamic";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const { dict, locale } = await getServerDict();
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
    recentConvos,
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
      where: {
        businessId: auth.businessId,
        direction: "OUTBOUND",
        senderType: "SELLORA",
        deliveryState: "SENT",
      },
    }),
    prisma.subscription.findUnique({ where: { businessId: auth.businessId } }),
    prisma.conversation.findMany({
      where: { businessId: auth.businessId },
      orderBy: { lastMessageAt: "desc" },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      take: 4,
    }),

  ]);

  // Lazy, server-computed expiry notices (no cron in this deployment).
  // Best effort: a notification hiccup must never take the dashboard down.
  if (sub) {
    try {
      await ensureSubscriptionNotices(sub);
    } catch (err) {
      console.error("[dashboard] subscription notice failed:", err);
    }
  }

  // Share of outbound messages that Sellora answered automatically. Both sides
  // come from the Message table, so this is a measured ratio, not a guess.
  const autoRate = outboundTotal > 0 ? Math.round((outboundAuto / outboundTotal) * 100) : null;

  const igConnected = ig?.status === "CONNECTED";
  const igNeedsAttention = ig?.status === "REAUTH_REQUIRED" || ig?.status === "DEGRADED";
  const left = sub ? daysLeft(sub.endsAt) : null;
  const subscriptionNeedsAttention =
    !!sub && (sub.status === "EXPIRED" || (left !== null && left <= 3) || sub.paymentStatus === "REJECTED");

  const needsAttention = igNeedsAttention || subscriptionNeedsAttention;
  const showOnboarding = !auto?.enabled || ig?.status !== "CONNECTED" || productCount === 0;
  const automationOn = Boolean(auto?.enabled) && igConnected;

  return (
    <AppShell
      title={`${dict.dashboard.greeting}، ${auth.user.name || auth.business.name} 👋`}
      subtitle="وضعیت امروز فروشگاه شما"
      wide
    >
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {/* ================================================== main column */}
        <div className="space-y-4 lg:col-span-2 lg:space-y-5">
          {/* ------------------------------------------------------ hero card */}
          <section
            aria-label="خلاصه امروز"
            className="relative overflow-hidden rounded-card border border-white/10 bg-premium-gradient p-5 text-white shadow-premium"
          >
            <BrandAura />


            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white ring-1 ring-white/25 backdrop-blur">
                <StatusPulse tone={automationOn ? "green" : "amber"} />
                {automationOn
                  ? "سلورا فعال است و پاسخ می‌دهد"
                  : igConnected
                  ? "پاسخ خودکار خاموش است"
                  : "اینستاگرام متصل نیست"}
              </span>

              <h2 className="mt-3 text-[19px] font-extrabold leading-8">
                {waitingOwner > 0
                  ? `${toPersianDigits(waitingOwner)} گفتگو منتظر پاسخ شماست`
                  : showOnboarding ? "فروشگاه را برای پاسخ‌گویی آماده کنید" : "امروز چه خبر؟"}
              </h2>
              <p className="mt-1 max-w-md text-[13px] leading-7 text-white/85">
                {toPersianDigits(openConvos)} گفتگوی باز دارید
                {convosToday > 0
                  ? ` و امروز ${toPersianDigits(convosToday)} گفتگوی تازه شروع شده است.`
                  : "."}
              </p>

              <div className="mt-4">
                <Link href={waitingOwner > 0 ? "/conversations" : showOnboarding ? "/onboarding" : "/conversations"} className="btn-primary">
                  {waitingOwner > 0 ? "پاسخ به گفتگوها" : showOnboarding ? "ادامه راه‌اندازی" : "باز کردن صندوق پیام‌ها"}
                  <IconArrowRight size={18} className="rtl:rotate-180" />
                </Link>
              </div>


            </div>
          </section>

          {/* ------------------------------------------------ attention items */}
          {needsAttention && (
            <section aria-label="نیاز به توجه شما" className="space-y-2">

              {igNeedsAttention && (
                <AttentionRow
                  tone="red"
                  icon={<IconInstagram size={18} />}
                  title={
                    ig?.status === "REAUTH_REQUIRED"
                      ? "اتصال اینستاگرام به ورود مجدد نیاز دارد"
                      : "اینستاگرام متصل نیست"
                  }
                  hint="تا زمانی که اتصال برقرار نشود، پاسخ خودکار برای مشتری‌ها ارسال نمی‌شود."
                  href="/settings/instagram"
                  cta="بررسی اتصال"
                />
              )}
              {subscriptionNeedsAttention && sub && (
                <AttentionRow
                  tone="amber"
                  icon={<IconCard size={18} />}
                  title={
                    sub.paymentStatus === "REJECTED"
                      ? "درخواست پرداخت رد شد"
                      : sub.status === "EXPIRED"
                      ? "اشتراک شما منقضی شده است"
                      : `اعتبار اشتراک تا ${toPersianDigits(Math.max(left ?? 0, 0))} روز دیگر`
                  }
                  hint={
                    sub.paymentStatus === "REJECTED"
                      ? sub.rejectionReason || "برای جزئیات، وضعیت اشتراک را ببینید."
                      : "برای جلوگیری از توقف پاسخ‌گویی، اشتراک را تمدید کنید."
                  }
                  href="/settings/subscription"
                  cta="مدیریت اشتراک"
                />
              )}

            </section>
          )}

          {/* ------------------------------------------------------------ metrics */}
          <section aria-label="شاخص‌های کلیدی">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="پیام‌ها (امروز)"
                value={toPersianDigits(messagesToday)}
                hint={`${toPersianDigits(convosToday)} گفتگوی تازه`}
                icon={<IconInbox size={18} />}
                href="/conversations"
              />
              <StatCard
                label="پاسخ‌های خودکار"
                value={toPersianDigits(outboundAuto)}
                hint={`از ${toPersianDigits(outboundTotal)} پیام ارسالی`}
                icon={<IconSparkle size={18} />}
                href="/automations"
              />
              <StatCard
                label={dict.dashboard.hotLeads}
                value={toPersianDigits(hotLeadCount)}
                hint={dict.dashboard.hotLeadsDesc}
                icon={<IconFlame size={18} />}
                tone="danger"
                href="/leads"
              />
              <StatCard
                label={dict.dashboard.autoRate}
                value={autoRate === null ? "—" : `${toPersianDigits(autoRate)}٪`}
                hint="سهم پاسخ‌های خودکار"
              />
            </div>
          </section>

          {/* ------------------------------------------------- recent conversations */}
          <section aria-label="آخرین گفتگوها">
            <div className="section-title">
              <IconInbox size={16} className="text-brand-500" />
              آخرین گفتگوها
              <Link
                href="/conversations"
                className="ms-auto text-[11px] font-bold text-brand-700 hover:underline"
              >
                همه
              </Link>
            </div>

            {recentConvos.length === 0 ? (
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <SelloraEmblem size={64} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-ink-900">هنوز گفتگویی شروع نشده</p>
                    <p className="mt-1 text-[12px] leading-6 text-ink-500">
                      به محض رسیدن اولین پیام مشتری، اینجا خلاصه‌ی آن نمایش داده می‌شود.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {recentConvos.map((c: any) => {
                  const last = Array.isArray(c.messages) ? c.messages[0] : undefined;
                  const displayName = c.customerName || c.customerUsername || "مشتری";
                  const needsReply = last?.direction === "INBOUND";
                  return (
                    <Link
                      key={c.id}
                      href={`/conversations/${c.id}`}
                      className="card-link flex min-h-[68px] items-center gap-3 p-3"
                    >
                      <Avatar name={displayName} src={c.customerProfilePic} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-bold text-ink-900">
                            {displayName}
                          </span>
                          {needsReply ? <Badge tone="amber">پاسخ نداده</Badge> : null}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-ink-500">
                          {last ? last.text : "گفتگوی جدید"}
                        </span>
                      </span>
                      {last ? (
                        <time
                          className="shrink-0 text-[10.5px] text-ink-400"
                          dateTime={new Date(last.createdAt).toISOString()}
                        >
                          {formatRelativeTime(last.createdAt, locale)}
                        </time>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* --------------------------------------------------------- hot leads */}
          {hotLeads.length > 0 && <section aria-label={dict.dashboard.hotLeads}>
            <div className="section-title">
              <IconFlame size={16} className="text-red-400" />
              {dict.dashboard.hotLeads}
              <Link
                href="/leads"
                className="ms-auto text-[11px] font-bold text-brand-700 hover:underline"
              >
                همه
              </Link>
            </div>
              <div className="space-y-2">
                {hotLeads.map((lead: any) => (
                  <Link
                    key={lead.id}
                    href={`/conversations/${lead.conversationId}`}
                    className="card-link flex items-center gap-3 p-3"
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-brand-100 bg-brand-50 text-lg"
                    >
                      🔥
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-ink-900">
                        {lead.conversation?.customerName ||
                          lead.conversation?.customerUsername ||
                          lead.contactName ||
                          "مشتری"}
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-ink-500">
                        {lead.reason}
                      </span>
                    </span>
                    <Badge tone="red">{toPersianDigits(lead.score)}/۱۰۰</Badge>
                  </Link>
                ))}
              </div>
          </section>}
        </div>

        {/* ================================================= side column */}
        <aside className="space-y-4 lg:space-y-5">
          {/* ---------------------------------------------------- service status */}
          <section aria-label="وضعیت سرویس">
            <div className="section-title">
              <IconBell size={16} className="text-brand-500" />
              وضعیت سرویس
            </div>
            <div className="card divide-y divide-ink-100/70 px-1 py-1">
              <StatusRow
                label={dict.nav.instagram}
                value={
                  igConnected ? "متصل" : igNeedsAttention ? "نیاز به بررسی" : "قطع"
                }
                hint={ig?.username ? `@${ig.username.replace(/^@/, "")}` : "حسابی متصل نیست"}
                tone={igConnected ? "success" : igNeedsAttention ? "warning" : "neutral"}
                icon={<IconInstagram size={18} />}
                href="/settings/instagram"
              />
              <StatusRow
                label={dict.nav.products}
                value={`${toPersianDigits(productCount)} محصول`}
                hint={productCount === 0 ? "محصولی ثبت نشده" : "ثبت‌شده و فعال"}
                tone="brand"
                icon={<IconBolt size={18} />}
                href="/products"
              />
              <StatusRow
                label="پاسخ‌گویی خودکار"
                value={automationOn ? "فعال" : auto?.enabled ? "متوقف" : "غیرفعال"}
                hint={
                  automationOn
                    ? "سلورا پاسخ می‌دهد"
                    : auto?.enabled
                    ? "بدون اتصال اینستاگرام"
                    : "خودتان پاسخ می‌دهید"
                }
                tone={automationOn ? "success" : auto?.enabled ? "warning" : "neutral"}
                icon={<IconSparkle size={18} />}
                href="/automations"
              />
              <StatusRow
                label={dict.nav.subscription}
                value={sub ? subscriptionStatusLabel(sub.status) : dict.settings.subscription.trial}
                hint={
                  sub
                    ? `${planLabel(sub.plan)} — ${
                        sub.paymentStatus ? paymentStatusLabel(sub.paymentStatus) : ""
                      }`.trim()
                    : "اشتراکی انتخاب نشده"
                }
                tone={sub?.status === "ACTIVE" ? "success" : "warning"}
                icon={<IconCard size={18} />}
                href="/settings/subscription"
              />
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ helpers */

function AttentionRow({
  tone,
  icon,
  title,
  hint,
  href,
  cta,
}: {
  tone: "amber" | "red" | "gray";
  icon: React.ReactNode;
  title: string;
  hint: string;
  href: string;
  cta: string;
}) {
  const tones = {
    amber: {
      card: "border-amber-400/30 bg-amber-400/15",
      tile: "border-amber-400/30 bg-white/[0.05] text-amber-700",
      title: "text-amber-700",
      hint: "text-amber-700/90",
      cta: "text-amber-700",
    },
    red: {
      card: "border-red-400/30 bg-red-400/15",
      tile: "border-red-400/30 bg-white/[0.05] text-red-700",
      title: "text-red-700",
      hint: "text-red-700/90",
      cta: "text-red-700",
    },
    gray: {
      card: "border-white/10 bg-white/[0.04]",
      tile: "border-ink-100 bg-ink-50 text-ink-600",
      title: "text-ink-900",
      hint: "text-ink-600",
      cta: "text-ink-900",
    },
  }[tone];

  return (
    <Link
      href={href}
      className={cx(
        "flex items-start gap-3 rounded-card border p-3.5 transition-all duration-200 ease-smooth hover:-translate-y-[1px] hover:shadow-card",
        tones.card
      )}
    >
      <span
        aria-hidden="true"
        className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-2xl border", tones.tile)}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cx("block text-[13px] font-bold", tones.title)}>{title}</span>
        <span className={cx("mt-1 block text-[11.5px] leading-5", tones.hint)}>{hint}</span>
        <span className={cx("mt-1.5 inline-block text-[11.5px] font-bold", tones.cta)}>
          {cta} ←
        </span>
      </span>
    </Link>
  );
}
