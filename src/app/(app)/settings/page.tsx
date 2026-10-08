import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db/prisma";
import { planLabel, subscriptionStatusLabel } from "@/lib/config/subscription";

export const dynamic = "force-dynamic";

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

  const items = [
    { href: "/settings/business", label: dict.nav.business, desc: "آدرس، ساعات کاری، ارسال، پرداخت", icon: "🏬" },
    {
      href: "/settings/instagram",
      label: dict.nav.instagram,
      desc:
        ig?.status === "CONNECTED"
          ? dict.settings.instagram.statusConnected
          : dict.settings.instagram.statusDisconnected,
      icon: "📸",
    },
    {
      href: "/settings/subscription",
      label: dict.nav.subscription,
      desc: sub
        ? `${planLabel(sub.plan)} — ${subscriptionStatusLabel(sub.status)}`
        : dict.settings.subscription.trial,
      icon: "💳",
    },
  ];

  const isAdmin = Boolean(auth.user?.isAdmin);

  return (
    <AppShell title={dict.nav.settings}>
      <div className="card p-4 mb-4 flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-ink-100 grid place-items-center font-semibold">
          {(auth.user.name || auth.user.email).slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{auth.user.name || auth.business.name}</div>
          <div className="text-xs text-ink-500">{auth.user.email}</div>
          {isAdmin && (
            <div className="text-[10px] text-brand-600 font-semibold mt-0.5">ADMIN</div>
          )}
        </div>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="btn-secondary text-xs" style={{ padding: "0.4rem 0.75rem" }}>
            خروج
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">پاسخ‌گویی خودکار</div>
            <div className="text-xs text-ink-500">Sellora به پیام‌های مشتریان در پس‌زمینه پاسخ بدهد.</div>
          </div>
          <AutomationToggle enabled={auto?.enabled ?? false} />
        </div>
      </div>

      <div className="section-title">راهنما</div>
      <div className="space-y-2">
        <Link href="/why-sellora" className="card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-50 grid place-items-center text-xl">✨</div>
          <div className="flex-1">
            <div className="font-medium">چرا Sellora؟</div>
            <div className="text-xs text-ink-500">همه‌ی قابلیت‌ها و مزیت‌های Sellora</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400 rtl:rotate-180">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      </div>

      {isAdmin && (
        <>
          <div className="section-title">پنل مدیریت</div>
          <div className="space-y-2">
            <Link href="/admin/subscriptions" className="card p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 grid place-items-center text-xl">👑</div>
              <div className="flex-1">
                <div className="font-medium">مدیریت اشتراک‌ها</div>
                <div className="text-xs text-ink-500">بررسی، تأیید یا رد درخواست‌های پرداخت</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400 rtl:rotate-180">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
          </div>
        </>
      )}

      <div className="section-title">بخش‌ها</div>
      <div className="space-y-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-ink-50 grid place-items-center text-xl">{it.icon}</div>
            <div className="flex-1">
              <div className="font-medium">{it.label}</div>
              <div className="text-xs text-ink-500">{it.desc}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400 rtl:rotate-180">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

function AutomationToggle({ enabled }: { enabled: boolean }) {
  return (
    <form action="/api/rules/automation" method="post" className="inline-flex">
      <input type="hidden" name="enabled" value={enabled ? "false" : "true"} />
      <button
        type="submit"
        role="switch"
        aria-checked={enabled}
        aria-label="پاسخ‌گویی خودکار"
        className={`relative h-7 w-12 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
          enabled ? "bg-emerald-500" : "bg-ink-200"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
            enabled ? "start-0.5" : "start-[calc(100%-1.625rem)]"
          }`}
        />
      </button>
    </form>
  );
}
