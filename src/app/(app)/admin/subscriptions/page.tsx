import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat";
import { formatToman, toPersianDigits } from "@/lib/utils/format";
import { planLabel } from "@/lib/config/subscription";
import { IconCard, IconCheck, IconClose, IconClock } from "@/components/layout/icons";
import { AdminSubscriptionActions } from "./admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  if (!auth.user?.isAdmin) {
    return (
      <AppShell title="پنل مدیریت" backHref="/settings">
        <div className="mx-auto w-full max-w-md">
          <Card className="p-6 text-center">
            <div aria-hidden="true" className="mb-3 text-4xl">
              🔒
            </div>
            <div className="mb-2 text-[15px] font-bold text-ink-900">دسترسی محدود</div>
            <div className="text-[13px] text-ink-500">شما به این بخش دسترسی ندارید.</div>
          </Card>
        </div>
      </AppShell>
    );
  }

  const subs = await prisma.subscription.findMany({
    where: {
      paymentStatus: { in: ["PENDING", "APPROVED", "REJECTED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const businessIds: string[] = Array.from(new Set(subs.map((s: any) => s.businessId)));
  const businesses = businessIds.length
    ? await prisma.business.findMany({ where: { id: { in: businessIds } } })
    : [];
  const bmap = new Map<string, any>(businesses.map((b: any) => [b.id, b]));

  const pending = subs.filter((s: any) => s.paymentStatus === "PENDING");
  const approved = subs.filter((s: any) => s.paymentStatus === "APPROVED");
  const rejected = subs.filter((s: any) => s.paymentStatus === "REJECTED");

  return (
    <AppShell
      title="پنل مدیریت اشتراک‌ها"
      backHref="/settings"
      subtitle="بررسی، تأیید یا رد درخواست‌های پرداخت کارت‌به‌کارت"
      wide
    >
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard
            label="در انتظار بررسی"
            value={toPersianDigits(pending.length)}
            hint={pending.length > 0 ? "نیاز به اقدام شما" : "صف خالی است"}
            icon={<IconClock size={18} />}
            tone={pending.length > 0 ? "warning" : "success"}
          />
          <StatCard
            label="تأیید شده"
            value={toPersianDigits(approved.length)}
            hint="فعال‌سازی‌شده"
            icon={<IconCheck size={18} />}
            tone="success"
          />
          <StatCard
            label="رد شده"
            value={toPersianDigits(rejected.length)}
            hint="با دلیل ثبت‌شده"
            icon={<IconClose size={18} />}
            tone="neutral"
            className="col-span-2 lg:col-span-1"
          />
        </div>

        {subs.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="text-[13px] font-bold text-ink-900">هنوز درخواستی ثبت نشده</div>
            <p className="mt-1 text-[12px] leading-6 text-ink-500">
              درخواست‌های پرداخت کارت‌به‌کارت فروشگاه‌ها همین‌جا برای بررسی نمایش داده می‌شوند.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {subs.map((s: any) => {
              const biz = bmap.get(s.businessId);
              const isPending = s.paymentStatus === "PENDING";
              return (
                <Card key={s.id} className="overflow-hidden">
                  <div className="flex items-start justify-between gap-3 border-b border-ink-100/80 bg-canvas-soft/60 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glowSoft"
                      >
                        <IconCard size={20} />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] font-bold text-ink-900">
                          {biz?.name ?? "—"}
                        </div>
                        <div className="truncate text-[11.5px] text-ink-500" dir="ltr">
                          {biz?.slug ? `@${biz.slug}` : s.businessId.slice(0, 12)}
                        </div>
                      </div>
                    </div>
                    <Badge
                      tone={
                        s.paymentStatus === "APPROVED"
                          ? "green"
                          : s.paymentStatus === "REJECTED"
                          ? "gray"
                          : "amber"
                      }
                    >
                      {s.paymentStatus === "APPROVED"
                        ? "تأیید شده"
                        : s.paymentStatus === "REJECTED"
                        ? "رد شده"
                        : "در انتظار"}
                    </Badge>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 p-4 text-[12px]">
                    <div>
                      <dt className="text-ink-500">پلن</dt>
                      <dd className="mt-0.5 font-bold text-ink-900">{planLabel(s.plan)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">مبلغ</dt>
                      <dd className="tnum mt-0.5 font-bold text-ink-900">
                        {formatToman(s.amount * 10)} تومان
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-ink-500">کد رهگیری</dt>
                      <dd className="mt-0.5 font-mono font-bold text-ink-900" dir="ltr">
                        {s.trackingCode || "—"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-ink-500">تاریخ ثبت درخواست</dt>
                      <dd className="mt-0.5 font-semibold text-ink-800">
                        {new Date(s.createdAt).toLocaleString("fa-IR")}
                      </dd>
                    </div>
                    {s.paidAt ? (
                      <div className="col-span-2">
                        <dt className="text-ink-500">تاریخ تأیید پرداخت</dt>
                        <dd className="mt-0.5 font-semibold text-ink-800">
                          {new Date(s.paidAt).toLocaleString("fa-IR")}
                        </dd>
                      </div>
                    ) : null}
                    {s.rejectionReason ? (
                      <div className="col-span-2">
                        <dt className="text-ink-500">دلیل رد</dt>
                        <dd className="mt-0.5 font-semibold text-red-300">{s.rejectionReason}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {isPending ? (
                    <div className="px-4 pb-4">
                      <AdminSubscriptionActions subscriptionId={s.id} />
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
