import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/config/pricing";
import { daysLeft, planLabel, subscriptionStatusLabel } from "@/lib/config/subscription";
import { ensureSubscriptionNotices } from "@/lib/notifications";
import { formatToman, toPersianDigits } from "@/lib/utils/format";
import { IconCard, IconCheck, IconSparkle } from "@/components/layout/icons";
import { SubscribeButton } from "./subscribe-button";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }
  const sub = await prisma.subscription.findUnique({ where: { businessId: auth.businessId } });

  // Owners who open their plan page should also see an expiry notice, not only
  // those who land on the dashboard. Best effort, never fatal.
  if (sub) {
    try {
      await ensureSubscriptionNotices(sub);
    } catch (err) {
      console.error("[subscription] notice failed:", err);
    }
  }

  const left = sub ? daysLeft(sub.endsAt) : null;
  const active = sub?.status === "ACTIVE" && sub?.paymentStatus === "APPROVED";

  const planName = (id: string) =>
    id === "WEEKLY"
      ? dict.settings.subscription.weekly
      : id === "MONTHLY"
      ? dict.settings.subscription.monthly
      : dict.settings.subscription.quarterly;

  return (
    <AppShell
      title={dict.settings.subscription.title}
      subtitle="پرداخت کارت‌به‌کارت با بررسی دستی و فعال‌سازی سریع"
      backHref="/settings"
    >
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {/* ------------------------------------------------------- current plan */}
        <section className="card overflow-hidden">
          <div className="relative flex items-center gap-3.5 border-b border-ink-100/80 bg-brand-gradient-soft p-4">
            <span
              aria-hidden="true"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glowSoft"
            >
              <IconCard size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-semibold text-ink-500">
                {dict.settings.subscription.currentPlan}
              </div>
              <div className="truncate text-[15px] font-extrabold text-ink-950">
                {sub ? planLabel(sub.plan) : dict.settings.subscription.trial}
              </div>
            </div>
            <Badge
              tone={
                active ? "green" : sub?.status === "TRIAL" ? "amber" : sub ? "gray" : "gray"
              }
            >
              {sub ? subscriptionStatusLabel(sub.status) : dict.settings.subscription.trial}
            </Badge>
          </div>

          {sub ? (
            <dl className="grid grid-cols-2 gap-3 p-4 text-[12px] sm:grid-cols-3">
              <div>
                <dt className="text-ink-500">مبلغ</dt>
                <dd className="tnum mt-0.5 font-bold text-ink-900">
                  {formatToman(sub.amount * 10)} تومان
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">روزهای باقی‌مانده</dt>
                <dd className="tnum mt-0.5 font-bold text-ink-900">
                  {left === null ? "—" : `${toPersianDigits(Math.max(left, 0))} روز`}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-ink-500">کد رهگیری</dt>
                <dd className="mt-0.5 font-mono font-bold text-ink-900" dir="ltr">
                  {sub.trackingCode || "—"}
                </dd>
              </div>
            </dl>
          ) : null}

          <div className="grid gap-2 border-t border-ink-100/80 p-3 sm:grid-cols-2">
            <Link href="/settings/subscription/status" className="btn-secondary min-h-[44px]">
              وضعیت پرداخت
            </Link>
            <Link href="/why-sellora" className="btn-ghost min-h-[44px]">
              <IconSparkle size={17} />
              چرا سلورا؟
            </Link>
          </div>
        </section>

        {/* ----------------------------------------------------------- plans */}
        <section aria-label="پلن‌ها">
          <div className="section-title">
            <IconCard size={16} className="text-brand-500" />
            {dict.settings.subscription.select}
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {PLANS.map((p) => {
              const best = Boolean(p.badge);
              return (
                <article
                  key={p.id}
                  className={
                    best
                      ? "relative overflow-hidden rounded-card border border-brand-200 bg-white p-4 shadow-glowSoft ring-1 ring-brand-100"
                      : "card p-4"
                  }
                >
                  {best ? (
                    <span className="absolute end-3 top-3">
                      <Badge tone="brand">{p.badge}</Badge>
                    </span>
                  ) : null}
                  <h3 className="text-[13.5px] font-bold text-ink-900">{planName(p.id)}</h3>
                  <div className="tnum mt-2 text-[22px] font-extrabold text-ink-950">
                    {formatToman(p.price * 10)}
                    <span className="ms-1 text-[11px] font-semibold text-ink-400">تومان</span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-ink-500">
                    {toPersianDigits(p.durationDays)} روز اعتبار
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[11.5px] text-ink-600">
                    {[
                      "پاسخ خودکار نامحدود به دایرکت",
                      "شناسایی مشتری داغ و اعلان",
                      "مدیریت محصولات و قیمت‌ها",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <IconCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span className="leading-5">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <SubscribeButton planId={p.id} variant={best ? "primary" : "secondary"} />
                </article>
              );
            })}
          </div>
        </section>

        <p className="rounded-card border border-ink-100/80 bg-white/70 px-4 py-3 text-[11.5px] leading-6 text-ink-500">
          {dict.settings.subscription.noPayments}
        </p>
      </div>
    </AppShell>
  );
}
