import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman, toPersianDigits } from "@/lib/utils/format";
import { daysLeft, paymentStatusLabel, planLabel, subscriptionStatusLabel } from "@/lib/config/subscription";
import { SelloraEmblem } from "@/components/brand/sellora";
import { IconCard } from "@/components/layout/icons";

export const dynamic = "force-dynamic";

export default async function SubscriptionStatusPage() {
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  const sub = await prisma.subscription.findUnique({
    where: { businessId: auth.businessId },
  });

  if (!sub) {
    return (
      <AppShell title="وضعیت اشتراک" backHref="/settings/subscription">
        <div className="mx-auto w-full max-w-md">
          <Card className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="text-ink-500">هنوز اشتراکی ثبت نشده است.</div>
            <Link href="/settings/subscription" className="btn-primary w-full min-h-[48px]">
              مشاهده پلن‌ها
            </Link>
          </Card>
        </div>
      </AppShell>
    );
  }

  const isPending = sub.paymentStatus === "PENDING";
  const isApproved = sub.paymentStatus === "APPROVED";
  const isRejected = sub.paymentStatus === "REJECTED";
  const isActive = sub.status === "ACTIVE" && isApproved;

  return (
    <AppShell title="وضعیت اشتراک" backHref="/settings/subscription">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        {isPending && (
          <Card className="overflow-hidden border-amber-400/30">
            <div className="flex items-start gap-3.5 bg-amber-400/15 p-4">
              <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-xl shadow-soft">
                ⏳
              </span>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold text-amber-200">
                  درخواست شما در انتظار بررسی است
                </div>
                <p className="mt-1 text-[12px] leading-6 text-amber-300">
                  درخواست خرید پلن {planLabel(sub.plan)} با کد رهگیری{" "}
                  <span dir="ltr" className="font-mono font-bold">
                    {sub.trackingCode}
                  </span>{" "}
                  ثبت شده است. حداکثر تا ۲۴ ساعت بررسی و تأیید می‌شود.
                </p>
              </div>
            </div>
          </Card>
        )}

        {isActive && (
          <Card className="overflow-hidden border-emerald-400/30">
            <div className="flex items-start gap-3.5 bg-emerald-400/15 p-4">
              <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-xl shadow-soft">
                ✅
              </span>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold text-emerald-200">اشتراک شما فعال است</div>
                <p className="mt-1 text-[12px] leading-6 text-emerald-200">
                  پلن {planLabel(sub.plan)} فعال است.
                  {sub.endsAt
                    ? ` اعتبار تا ${new Date(sub.endsAt).toLocaleDateString("fa-IR")}.`
                    : ""}
                </p>
              </div>
            </div>
          </Card>
        )}

        {isRejected && (
          <Card className="overflow-hidden border-red-400/30">
            <div className="flex items-start gap-3.5 bg-red-400/15 p-4">
              <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-xl shadow-soft">
                ❌
              </span>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold text-red-200">درخواست شما رد شد</div>
                <p className="mt-1 text-[12px] leading-6 text-red-300">
                  {sub.rejectionReason || "دلیل رد ثبت نشده است."}
                </p>
              </div>
            </div>
            <div className="p-3">
              <Link href="/settings/subscription" className="btn-primary w-full min-h-[48px]">
                ثبت درخواست جدید
              </Link>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h2 className="flex items-center gap-2 text-[13px] font-bold text-ink-900">
            <IconCard size={16} className="text-brand-500" />
            جزئیات اشتراک
          </h2>
          <dl className="mt-3 space-y-2.5 text-[12.5px]">
            <Line label="پلن" value={planLabel(sub.plan)} />
            <Line label="مبلغ" value={`${formatToman(sub.amount * 10)} تومان`} />
            <Line label="کد رهگیری" value={sub.trackingCode || "—"} mono />
            {sub.endsAt && (
              <Line
                label="روزهای باقی‌مانده"
                value={`${toPersianDigits(Math.max(daysLeft(sub.endsAt) ?? 0, 0))} روز`}
              />
            )}
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-500">وضعیت پرداخت</dt>
              <dd>
                <Badge tone={isApproved ? "green" : isRejected ? "gray" : isPending ? "amber" : "gray"}>
                  {paymentStatusLabel(sub.paymentStatus)}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-500">وضعیت اشتراک</dt>
              <dd>
                <Badge tone={isActive ? "green" : "gray"}>{subscriptionStatusLabel(sub.status)}</Badge>
              </dd>
            </div>
          </dl>
        </Card>

        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <SelloraEmblem size={72} />
          <p className="text-[11.5px] leading-6 text-ink-500">
            سوالی دارید؟ صفحه «چرا سلورا؟» پاسخ پرتکرارها را دارد.
          </p>
          <Link href="/why-sellora" className="btn-ghost min-h-[44px]">
            چرا سلورا؟
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Line({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-ink-500">{label}</dt>
      <dd className={mono ? "font-mono font-bold text-ink-900" : "font-bold text-ink-900"} dir={mono ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}
