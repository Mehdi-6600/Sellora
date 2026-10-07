import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman } from "@/lib/utils/format";
import { AdminSubscriptionActions } from "./admin-actions";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  WEEKLY: "هفتگی",
  MONTHLY: "ماهانه",
  QUARTERLY: "سه‌ماهه",
};

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
        <Card className="p-6 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <div className="font-semibold mb-2">دسترسی محدود</div>
          <div className="text-sm text-ink-500">شما به این بخش دسترسی ندارید.</div>
        </Card>
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

  return (
    <AppShell title="پنل مدیریت اشتراک‌ها" backHref="/settings">
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Card className="p-3 text-center">
          <div className="text-xs text-ink-500 mb-1">در انتظار</div>
          <div className="text-xl font-bold text-amber-600">{pending.length}</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-ink-500 mb-1">تأیید شده</div>
          <div className="text-xl font-bold text-emerald-600">
            {subs.filter((s: any) => s.paymentStatus === "APPROVED").length}
          </div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-ink-500 mb-1">رد شده</div>
          <div className="text-xl font-bold text-red-600">
            {subs.filter((s: any) => s.paymentStatus === "REJECTED").length}
          </div>
        </Card>
      </div>

      {subs.length === 0 ? (
        <Card className="p-6 text-center text-ink-500">
          هنوز درخواست اشتراکی ثبت نشده است.
        </Card>
      ) : (
        <div className="space-y-3">
          {subs.map((s: any) => {
            const biz = bmap.get(s.businessId);
            const isPending = s.paymentStatus === "PENDING";
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">{biz?.name ?? "—"}</div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {biz?.slug ? `@${biz.slug}` : s.businessId.slice(0, 12)}
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

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <div className="text-xs text-ink-500">پلن</div>
                    <div className="font-semibold">{PLAN_LABELS[s.plan] ?? s.plan}</div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-500">مبلغ</div>
                    <div className="font-semibold">{formatToman(s.amount * 10)} تومان</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-ink-500">کد رهگیری</div>
                    <div className="font-mono font-semibold" dir="ltr">
                      {s.trackingCode || "—"}
                    </div>
                  </div>
                  {s.paidAt && (
                    <div className="col-span-2">
                      <div className="text-xs text-ink-500">تاریخ ثبت</div>
                      <div>{new Date(s.paidAt).toLocaleString("fa-IR")}</div>
                    </div>
                  )}
                  {s.rejectionReason && (
                    <div className="col-span-2">
                      <div className="text-xs text-ink-500">دلیل رد</div>
                      <div className="text-red-600">{s.rejectionReason}</div>
                    </div>
                  )}
                </div>

                {isPending && <AdminSubscriptionActions subscriptionId={s.id} />}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
