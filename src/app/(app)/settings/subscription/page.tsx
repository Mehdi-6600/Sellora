import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/config/pricing";
import { planLabel, subscriptionStatusLabel } from "@/lib/config/subscription";
import { formatToman } from "@/lib/utils/format";
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

  return (
    <AppShell title={dict.settings.subscription.title} backHref="/settings">
      {sub && (
        <Card className="p-4 mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">💳</div>
          <div className="flex-1">
            <div className="text-sm text-ink-500">{dict.settings.subscription.currentPlan}</div>
            <div className="font-semibold">
              {planLabel(sub.plan)} — {formatToman(sub.amount * 10)} تومان
            </div>
          </div>
          <Badge tone={sub.status === "ACTIVE" ? "green" : sub.status === "TRIAL" ? "amber" : "gray"}>
            {subscriptionStatusLabel(sub.status)}
          </Badge>
        </Card>
      )}

      <Link
        href="/why-sellora"
        className="block card p-4 mb-4 bg-gradient-to-l from-brand-50 to-white border-brand-200"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-600 text-white grid place-items-center text-lg">✨</div>
          <div className="flex-1">
            <div className="font-semibold text-ink-900 text-sm">چرا Sellora؟</div>
            <div className="text-xs text-ink-600">قابلیت‌ها و مزیت‌ها رو ببین</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600 rtl:rotate-180">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-3">
        {PLANS.map((p) => (
          <Card key={p.id} className={`p-4 relative overflow-hidden ${p.badge ? "border-brand-400 ring-2 ring-brand-100" : ""}`}>
            {p.badge && (
              <div className="absolute -right-8 top-4 rotate-45 bg-brand-600 text-white text-[10px] font-bold px-10 py-1">
                {p.badge}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                {p.id === "WEEKLY" ? dict.settings.subscription.weekly : p.id === "MONTHLY" ? dict.settings.subscription.monthly : dict.settings.subscription.quarterly}
              </div>
              <div className="text-lg font-bold">{formatToman(p.price * 10)} تومان</div>
            </div>
            <div className="text-xs text-ink-500 mt-1">{p.durationDays} روز</div>
            <SubscribeButton planId={p.id} />
          </Card>
        ))}
      </div>

      <p className="text-xs text-ink-500 mt-6 leading-6">{dict.settings.subscription.noPayments}</p>
    </AppShell>
  );
}
