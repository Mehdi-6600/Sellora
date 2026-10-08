import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db/prisma";
import { Badge, Dot, StatusPulse } from "@/components/ui/badge";
import { SelloraMark } from "@/components/brand/sellora";
import { daysLeft, planLabel, subscriptionStatusLabel } from "@/lib/config/subscription";
import { toPersianDigits } from "@/lib/utils/format";
import { AutomationSwitch } from "@/components/automation/automation-switch";
import {
  IconArrowRight,
  IconBolt,
  IconCard,
  IconCog,
  IconInstagram,
  IconLogout,
  IconSparkle,
} from "@/components/layout/icons";

export const dynamic = "force-dynamic";

/** Icon tile colour per section state — one definition, used by every row. */
function tileClass(tone: "brand" | "success" | "danger" | "warning" | "neutral") {
  const base = "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border";
  switch (tone) {
    case "success":
      return `${base} border-emerald-400/25 bg-emerald-400/15 text-emerald-300`;
    case "danger":
      return `${base} border-red-400/25 bg-red-400/15 text-red-300`;
    case "warning":
      return `${base} border-amber-400/25 bg-amber-400/15 text-amber-300`;
    case "neutral":
      return `${base} border-ink-100 bg-ink-50 text-ink-500`;
    default:
      return `${base} border-brand-100 bg-brand-50 text-brand-700`;
  }
}

export default async function SettingsPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  const [ig, auto, sub] = await Promise.all([
    prisma.instagramAccount.findUnique({ where: { businessId: auth.businessId } }),
    prisma.automationConfig.findUnique({ where: { businessId: auth.businessId } }),
    prisma.subscription.findUnique({ where: { businessId: auth.businessId } }),
  ]);

  const isAdmin = Boolean(auth.user?.isAdmin);
  const igConnected = ig?.status === "CONNECTED";
  const left = sub ? daysLeft(sub.endsAt) : null;
  const initial = (auth.user.name || auth.user.email || "S").slice(0, 1).toUpperCase();

  const items = [
    {
      href: "/settings/business",
      label: dict.nav.business,
      desc: "آدرس، ساعات کاری، ارسال، پرداخت و شرایط بازگشت",
      icon: <IconCog size={19} />,
      tone: "brand" as const,
    },
    {
      href: "/settings/instagram",
      label: dict.nav.instagram,
      desc: igConnected
        ? `متصل${ig?.username ? ` — @${ig.username.replace(/^@/, "")}` : ""}`
        : dict.settings.instagram.statusDisconnected,
      icon: <IconInstagram size={19} />,
      tone: igConnected ? ("success" as const) : ("danger" as const),
    },
    {
      href: "/settings/subscription",
      label: dict.nav.subscription,
      desc: sub
        ? `${planLabel(sub.plan)} — ${subscriptionStatusLabel(sub.status)}${
            sub.status === "ACTIVE" && left !== null
              ? ` (${toPersianDigits(Math.max(left, 0))} روز مانده)`
              : ""
          }`
        : dict.settings.subscription.trial,
      icon: <IconCard size={19} />,
      tone: "warning" as const,
    },
    {
      href: "/automations",
      label: dict.nav.automations,
      desc: auto?.enabled ? "پاسخ‌گویی خودکار فعال است" : "پاسخ‌گویی خودکار غیرفعال است",
      icon: <IconBolt size={19} />,
      tone: auto?.enabled ? ("success" as const) : ("neutral" as const),
    },
  ];

  return (
    <AppShell title={dict.nav.settings} subtitle="حساب، فروشگاه و اتصال‌ها" wide>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2 lg:space-y-5">
          {/* ------------------------------------------------------- profile */}
          <section aria-label="حساب کاربری" className="card overflow-hidden">
            <div className="relative flex items-center gap-3.5 border-b border-ink-100/80 bg-brand-gradient-soft p-4">
              <span
                aria-hidden="true"
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-lg font-extrabold text-white shadow-glowSoft"
              >
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-bold text-ink-900">
                    {auth.user.name || auth.business.name}
                  </span>
                  {isAdmin ? <Badge tone="brand">ADMIN</Badge> : null}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-ink-500" dir="ltr">
                  {auth.user.email}
                </div>
                <div className="mt-0.5 truncate text-[11.5px] text-ink-500">
                  فروشگاه: {auth.business.name}
                </div>
              </div>
              <SelloraMark size={40} glow className="hidden sm:block" />
            </div>
            <div className="flex items-center gap-2 p-3">
              <form action="/api/auth/logout" method="post" className="flex-1">
                <button type="submit" className="btn-secondary w-full min-h-[44px]">
                  <IconLogout size={17} />
                  خروج از حساب
                </button>
              </form>
              <Link href="/why-sellora" className="btn-ghost min-h-[44px] flex-1">
                <IconSparkle size={17} />
                چرا سلورا؟
              </Link>
            </div>
          </section>

          {/* ---------------------------------------------------- sections list */}
          <section aria-label="بخش‌های تنظیمات">
            <div className="section-title">
              <IconCog size={16} className="text-brand-500" />
              بخش‌ها
            </div>
            <ul className="space-y-2">
              {items.map((it) =>
                it.href === "/automations" ? (
                  // The master switch keeps the one-tap toggle the settings page
                  // has always had (same POST /api/rules/automation); the link
                  // below it opens the full automations view.
                  <li key={it.href}>
                    <div className="card flex min-h-[68px] items-center gap-3 p-3.5">
                      <span aria-hidden="true" className={tileClass(it.tone)}>
                        {it.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-bold text-ink-900">
                          {it.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[11.5px] text-ink-500">
                          {it.desc}
                        </span>
                        <Link
                          href="/automations"
                          className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-bold text-brand-700 hover:underline"
                        >
                          جزئیات و جریان‌ها
                          <IconArrowRight size={13} className="rtl:rotate-180" />
                        </Link>
                      </span>
                      <AutomationSwitch
                        enabled={Boolean(auto?.enabled)}
                        label={dict.nav.automations}
                      />
                    </div>
                  </li>
                ) : (
                <li key={it.href}>
                  <Link href={it.href} className="card-link flex min-h-[68px] items-center gap-3 p-3.5">
                    <span aria-hidden="true" className={tileClass(it.tone)}>
                      {it.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-ink-900">
                        {it.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-ink-500">
                        {it.desc}
                      </span>
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="shrink-0 text-ink-400 rtl:rotate-180"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Link>
                </li>
                )
              )}
            </ul>
          </section>

          {isAdmin ? (
            <section aria-label="پنل مدیریت">
              <div className="section-title">
                <IconSparkle size={16} className="text-amber-300" />
                پنل مدیریت
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/admin/subscriptions" className="card-link flex items-center gap-3 p-3.5">
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-400/25 bg-amber-400/15 text-xl"
                  >
                    👑
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-ink-900">مدیریت اشتراک‌ها</span>
                    <span className="mt-0.5 block text-[11px] text-ink-500">
                      بررسی و تأیید درخواست‌های پرداخت
                    </span>
                  </span>
                </Link>
                <Link href="/admin/system" className="card-link flex items-center gap-3 p-3.5">
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sky-400/25 bg-sky-400/15 text-xl"
                  >
                    🩺
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-ink-900">سلامت سیستم</span>
                    <span className="mt-0.5 block text-[11px] text-ink-500">
                      کارهای ناموفق و پیام‌های گیرکرده
                    </span>
                  </span>
                </Link>
              </div>
            </section>
          ) : null}
        </div>

        {/* ------------------------------------------------------------- aside */}
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <section aria-label="وضعیت سرویس" className="card p-4">
            <h2 className="text-[13px] font-bold text-ink-900">وضعیت سرویس</h2>
            <ul className="mt-3 space-y-3 text-[12px]">
              <li className="flex items-center justify-between gap-2">
                <span className="text-ink-600">اینستاگرام</span>
                {igConnected ? (
                  <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <StatusPulse tone="green" />
                    متصل
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-bold text-ink-500">
                    <Dot tone="gray" />
                    قطع
                  </span>
                )}
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-ink-600">پاسخ‌گویی خودکار</span>
                <Badge tone={auto?.enabled ? "green" : "gray"}>
                  {auto?.enabled ? "فعال" : "غیرفعال"}
                </Badge>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-ink-600">اشتراک</span>
                <Badge tone={sub?.status === "ACTIVE" ? "green" : "amber"}>
                  {sub ? subscriptionStatusLabel(sub.status) : dict.settings.subscription.trial}
                </Badge>
              </li>
            </ul>
          </section>

          <section aria-label="راهنما" className="card overflow-hidden">
            <div className="border-b border-ink-100/80 bg-brand-gradient-soft p-4">
              <h2 className="text-[13px] font-bold text-ink-900">چرا Sellora؟</h2>
              <p className="mt-1 text-[11.5px] leading-6 text-ink-600">
                همه‌ی قابلیت‌ها، تفاوت با ربات ساده و پاسخ سوال‌های پرتکرار.
              </p>
            </div>
            <div className="p-3">
              <Link href="/why-sellora" className="btn-secondary w-full min-h-[44px]">
                مشاهده صفحه راهنما
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
