import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, toPersianDigits } from "@/lib/utils/format";
import { getServerDict } from "@/lib/i18n";
import { StatCard } from "@/components/ui/stat";
import { IconPulse, IconBolt, IconInfo } from "@/components/layout/icons";

export const dynamic = "force-dynamic";

/**
 * Admin-only operational view: failed background jobs, webhook events that
 * never finished processing, and outbound messages stuck in a failure state.
 * Everything shown already exists in the database; nothing is synthesised.
 */
export default async function AdminSystemPage() {
  const { locale } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }
  if (!auth.user?.isAdmin) {
    return (
      <AppShell title="سلامت سیستم" backHref="/settings">
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

  const [failedJobs, pendingWebhookCount, stuckMessages] = await Promise.all([
    prisma.failedJob.findMany({ orderBy: { lastErrorAt: "desc" }, take: 20 }),
    prisma.webhookEvent.count({ where: { processed: false } }),
    prisma.message.findMany({
      where: { deliveryState: { in: ["FAILED", "RETRYING", "BLOCKED"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <AppShell title="سلامت سیستم" backHref="/settings" subtitle="خطاها و کارهای ناموفق پس‌زمینه">
      <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="کارهای ناموفق"
          value={toPersianDigits(failedJobs.length)}
          hint="در انتظار بررسی"
          icon={<IconPulse size={18} />}
          tone={failedJobs.length > 0 ? "danger" : "success"}
        />
        <StatCard
          label="وب‌هوک پردازش‌نشده"
          value={toPersianDigits(pendingWebhookCount)}
          hint={pendingWebhookCount > 0 ? "نیاز به بازیابی" : "همه پردازش شده"}
          icon={<IconInfo size={18} />}
          tone={pendingWebhookCount > 0 ? "warning" : "success"}
        />
        <StatCard
          label="پیام‌های ناموفق"
          value={toPersianDigits(stuckMessages.length)}
          hint="ارسال ناتمام"
          icon={<IconBolt size={18} />}
          tone={stuckMessages.length > 0 ? "danger" : "success"}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="section-title">کارهای پس‌زمینه ناموفق</div>
      {failedJobs.length === 0 ? (
        <Card className="p-5 text-center text-sm text-ink-500">موردی ثبت نشده است.</Card>
      ) : (
        <div className="space-y-2">
          {failedJobs.map((j: any) => (
            <Card key={j.id} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge tone="red">{j.jobType}</Badge>
                <span className="text-[11px] text-ink-400">
                  {formatRelativeTime(j.lastErrorAt, locale)}
                </span>
              </div>
              <div className="break-words text-[12px] leading-6 text-ink-600">{j.error}</div>
              <div className="mt-1 text-[11px] text-ink-400">
                تلاش‌ها: {toPersianDigits(j.attempts ?? 0)} · فروشگاه: {j.businessId ?? "—"}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="section-title">پیام‌های ناموفق در ارسال</div>
      {stuckMessages.length === 0 ? (
        <Card className="p-5 text-center text-sm text-ink-500">همه پیام‌ها سالم هستند.</Card>
      ) : (
        <div className="space-y-2">
          {stuckMessages.map((m: any) => (
            <Card key={m.id} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge tone={m.deliveryState === "RETRYING" ? "amber" : "red"}>{m.deliveryState}</Badge>
                <span className="text-[11px] text-ink-400">
                  {formatRelativeTime(m.createdAt, locale)}
                </span>
              </div>
              <div className="break-words text-[12px] leading-6 text-ink-600">
                {m.failureReason || "بدون دلیل ثبت‌شده"}
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </AppShell>
  );
}
