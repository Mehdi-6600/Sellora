import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import { getServerDict } from "@/lib/i18n";

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
        <Card className="p-6 text-center">
          <div aria-hidden="true" className="text-4xl mb-3">
            🔒
          </div>
          <div className="font-semibold mb-2">دسترسی محدود</div>
          <div className="text-sm text-ink-500">شما به این بخش دسترسی ندارید.</div>
        </Card>
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
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Card className="p-3 text-center">
          <div className="text-xs text-ink-500 mb-1">کارهای ناموفق</div>
          <div className="text-xl font-bold text-red-600">{failedJobs.length}</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-ink-500 mb-1">وب‌هوک پردازش‌نشده</div>
          <div className="text-xl font-bold text-amber-600">{pendingWebhookCount}</div>
        </Card>
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
              <div className="text-xs text-ink-600 break-words leading-6">{j.error}</div>
              <div className="text-[11px] text-ink-400 mt-1">
                تلاش‌ها: {j.attempts} · فروشگاه: {j.businessId ?? "—"}
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
              <div className="text-xs text-ink-600 break-words leading-6">
                {m.failureReason || "بدون دلیل ثبت‌شده"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
