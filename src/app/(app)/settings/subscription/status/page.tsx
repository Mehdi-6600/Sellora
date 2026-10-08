import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman, toPersianDigits } from "@/lib/utils/format";
import { daysLeft, paymentStatusLabel, planLabel, subscriptionStatusLabel } from "@/lib/config/subscription";

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
        <Card className="p-6 text-center">
          <div className="text-ink-500 mb-4">هنوز اشتراکی ثبت نشده است.</div>
          <Link
            href="/settings/subscription"
            className="inline-block bg-brand-600 text-white rounded-xl px-4 py-3 text-sm font-medium"
          >
            مشاهده پلن‌ها
          </Link>
        </Card>
      </AppShell>
    );
  }

  const isPending = sub.paymentStatus === "PENDING";
  const isApproved = sub.paymentStatus === "APPROVED";
  const isRejected = sub.paymentStatus === "REJECTED";
  const isActive = sub.status === "ACTIVE" && isApproved;

  return (
    <AppShell title="وضعیت اشتراک" backHref="/settings/subscription">
      {isPending && (
        <Card className="p-4 mb-4 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⏳</div>
            <div className="flex-1">
              <div className="font-semibold text-amber-800 mb-1">درخواست شما در انتظار بررسی است</div>
              <div className="text-sm text-amber-700 leading-6">
                درخواست خرید پلن {planLabel(sub.plan)} با کد رهگیری{" "}
                <span dir="ltr" className="font-mono font-semibold">
                  {sub.trackingCode}
                </span>{" "}
                ثبت شده است. ظرف حداکثر ۲۴ ساعت بررسی و تأیید می‌شود.
              </div>
            </div>
          </div>
        </Card>
      )}

      {isActive && (
        <Card className="p-4 mb-4 border-emerald-200 bg-emerald-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✅</div>
            <div className="flex-1">
              <div className="font-semibold text-emerald-800 mb-1">اشتراک شما فعال است</div>
              <div className="text-sm text-emerald-700 leading-6">
                پلن {planLabel(sub.plan)} فعال است.
                {sub.endsAt && (
                  <>
                    {" "}
                    اعتبار تا{" "}
                    <span className="font-semibold">
                      {new Date(sub.endsAt).toLocaleDateString("fa-IR")}
                    </span>
                    .
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {isRejected && (
        <Card className="p-4 mb-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">❌</div>
            <div className="flex-1">
              <div className="font-semibold text-red-800 mb-1">درخواست شما رد شد</div>
              <div className="text-sm text-red-700 leading-6">
                {sub.rejectionReason || "دلیل رد ثبت نشده است."}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="text-sm font-semibold mb-3">جزئیات اشتراک</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-500">پلن</span>
            <span className="font-semibold">{planLabel(sub.plan)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">مبلغ</span>
            <span className="font-semibold">{formatToman(sub.amount * 10)} تومان</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">کد رهگیری</span>
            <span className="font-mono font-semibold" dir="ltr">
              {sub.trackingCode || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">وضعیت پرداخت</span>
            <Badge
              tone={
                isApproved ? "green" : isRejected ? "gray" : isPending ? "amber" : "gray"
              }
            >
              {paymentStatusLabel(sub.paymentStatus)}
            </Badge>
          </div>
          {sub.endsAt && (
            <div className="flex justify-between">
              <span className="text-ink-500">روزهای باقی‌مانده</span>
              <span className="font-semibold">
                {toPersianDigits(Math.max(daysLeft(sub.endsAt) ?? 0, 0))} روز
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-ink-500">وضعیت اشتراک</span>
            <Badge tone={isActive ? "green" : "gray"}>{subscriptionStatusLabel(sub.status)}</Badge>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
