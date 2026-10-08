import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { getPlan } from "@/lib/config/pricing";
import { formatToman, toPersianDigits } from "@/lib/utils/format";
import { PAYMENT_INFO } from "@/lib/config/payment";
import { IconCard, IconInfo } from "@/components/layout/icons";
import { PayForm } from "./pay-form";

export const dynamic = "force-dynamic";

const VALID_PLANS = ["WEEKLY", "MONTHLY", "QUARTERLY"] as const;
type ValidPlan = (typeof VALID_PLANS)[number];

function isValidPlan(p: string): p is ValidPlan {
  return (VALID_PLANS as readonly string[]).includes(p);
}

export default async function PayPage({ params }: { params: { plan: string } }) {
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  if (!isValidPlan(params.plan)) {
    redirect("/settings/subscription");
  }

  const plan = getPlan(params.plan);
  const existing = await prisma.subscription.findUnique({
    where: { businessId: auth.businessId },
  });

  if (existing && existing.paymentStatus === "APPROVED" && existing.status === "ACTIVE") {
    redirect("/settings/subscription/status");
  }

  const planName =
    plan.id === "WEEKLY" ? "هفتگی" : plan.id === "MONTHLY" ? "ماهانه" : "سه‌ماهه";

  return (
    <AppShell title="پرداخت" backHref="/settings/subscription" subtitle={planName}>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        {/* ---------------------------------------------------- amount summary */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3.5 border-b border-ink-100/80 bg-brand-gradient-soft p-4">
            <span
              aria-hidden="true"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glowSoft"
            >
              <IconCard size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-semibold text-ink-500">پلن انتخابی</div>
              <div className="text-[15px] font-extrabold text-ink-950">
                {planName} — {toPersianDigits(plan.durationDays)} روز
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-[12.5px] text-ink-600">مبلغ قابل واریز</span>
            <span className="tnum text-[20px] font-extrabold text-brand-700">
              {formatToman(plan.price * 10)}
              <span className="ms-1 text-[11px] font-semibold text-ink-400">تومان</span>
            </span>
          </div>
        </Card>

        {/* ------------------------------------------------------- card details */}
        <Card className="overflow-hidden">
          <div className="border-b border-ink-100/80 px-4 py-3 text-[13px] font-bold text-ink-900">
            اطلاعات کارت مقصد
          </div>
          <dl className="divide-y divide-ink-100/70 text-[12.5px]">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-ink-500">شماره کارت</dt>
              <dd className="font-mono text-[13.5px] font-bold tracking-wider text-ink-900" dir="ltr">
                {PAYMENT_INFO.cardNumber}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-ink-500">صاحب حساب</dt>
              <dd className="font-bold text-ink-900">{PAYMENT_INFO.cardHolder}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-ink-500">بانک</dt>
              <dd className="font-bold text-ink-900">{PAYMENT_INFO.bankName}</dd>
            </div>
          </dl>
        </Card>

        {/* ------------------------------------------------------------ steps */}
        <div className="flex items-start gap-2.5 rounded-card border border-brand-100 bg-brand-50/70 p-3.5">
          <IconInfo size={17} className="mt-0.5 shrink-0 text-brand-500" />
          <div className="text-[12px] leading-6 text-brand-900">
            <div className="font-bold">راهنمای پرداخت</div>
            <ol className="mt-1 list-decimal space-y-1 ps-4">
              {PAYMENT_INFO.instructions.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </div>
        </div>

        <PayForm planId={plan.id} />

        <p className="text-center text-[11.5px] leading-6 text-ink-500">
          نیاز به کمک دارید؟{" "}
          <Link href="/why-sellora" className="font-bold text-brand-700 hover:underline">
            سوال‌های پرتکرار
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
