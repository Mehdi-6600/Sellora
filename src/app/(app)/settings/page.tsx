import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { SelloraMark } from "@/components/brand/sellora";
import { daysLeft, planLabel, subscriptionStatusLabel } from "@/lib/config/subscription";
import { toPersianDigits } from "@/lib/utils/format";
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
      return `${base} border-emerald-400/25 bg-emerald-400/15 text-emerald-700`;
    case "danger":
      return `${base} border-red-400/25 bg-red-400/15 text-red-700`;
    case "warning":
      return `${base} border-amber-400/25 bg-amber-400/15 text-amber-700`;
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
    <AppShell backHref="/more" title={dict.nav.settings} subtitle="حساب، فروشگاه و اتصال‌ها" wide>
      <div className="max-w-2xl">
        <div className="space-y-5">
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
              {items.map(it => <li key={it.href}>
                <Link href={it.href} className="card-link flex min-h-[72px] items-center gap-3 p-4">
                  <span className={tileClass(it.tone)}>{it.icon}</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{it.label}</span><span className="mt-1 block text-xs leading-6 text-ink-500">{it.desc}</span></span>
                  <IconArrowRight size={16} className="rtl:rotate-180" />
                </Link>
              </li>)}
            </ul>
          </section>

          {isAdmin ? (
            <section aria-label="پنل مدیریت">
              <div className="section-title">
                <IconSparkle size={16} className="text-amber-700" />
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

      </div>
    </AppShell>
  );
}
