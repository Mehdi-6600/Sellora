import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { getPlan } from "@/lib/config/pricing";
import { formatToman } from "@/lib/utils/format";
import { PAYMENT_INFO } from "@/lib/config/payment";
import { PayForm } from "./pay-form";

export const dynamic = "force-dynamic";

const VALID_PLANS = ["WEEKLY", "MONTHLY", "QUARTERLY"] as const;
type ValidPlan = (typeof VALID_PLANS)[number];

function isValidPlan(p: string): p is ValidPlan {
  return (VALID_PLANS as readonly string[]).includes(p);
}

export default async function PayPage({ params }: { params: { plan: string } }) {
  const { dict } = await getServerDict();
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

  return (
    <AppShell title="پرداخت" backHref="/settings/subscription">
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-ink-500">پلن انتخابی</div>
          <div className="font-semibold">
            {plan.id === "WEEKLY" ? "هفتگی" : plan.id === "MONTHLY" ? "ماهانه" : "سه‌ماهه"}
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-ink-500">مدت</div>
          <div className="font-semibold">{plan.durationDays} روز</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-500">مبلغ قابل واریز</div>
          <div className="text-lg font-bold text-brand-600">
            {formatToman(plan.price * 10)} تومان
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-sm font-semibold mb-3">اطلاعات کارت مقصد</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-500">شماره کارت</span>
            <span className="font-mono font-semibold tracking-wider" dir="ltr">
              {PAYMENT_INFO.cardNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">صاحب حساب</span>
            <span className="font-semibold">{PAYMENT_INFO.cardHolder}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">بانک</span>
            <span className="font-semibold">{PAYMENT_INFO.bankName}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-4 bg-ink-50 border-ink-100">
        <div className="text-xs leading-6 text-ink-700">
          <div className="font-semibold mb-1">راهنما:</div>
          <ol className="list-decimal pr-4 space-y-1">
            {PAYMENT_INFO.instructions.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>
      </Card>

      <PayForm planId={plan.id} />
    </AppShell>
  );
}
