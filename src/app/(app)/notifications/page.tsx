import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { Empty } from "@/components/ui/empty";
import { NotificationItem, type NotificationRow } from "@/components/notifications/notification-item";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read";
import {
  listNotifications,
  notificationHref,
  notificationMeta,
  unreadCount,
} from "@/lib/notifications";
import { formatRelativeTime, toPersianDigits } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { dict, locale } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  let items: NotificationRow[] = [];
  let unread = 0;
  let failed = false;
  try {
    const [rows, count] = await Promise.all([
      listNotifications(auth.businessId, 50),
      unreadCount(auth.businessId),
    ]);
    unread = count;
    items = rows.map((n: any) => {
      const meta = notificationMeta(n.kind);
      return {
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        href: notificationHref(n),
        readAt: n.readAt ? new Date(n.readAt).toISOString() : null,
        createdAt: new Date(n.createdAt).toISOString(),
        relativeTime: formatRelativeTime(n.createdAt, locale),
        tone: meta.tone,
        icon: meta.icon,
      };
    });
  } catch (err) {
    console.error("[notifications page]", err);
    failed = true;
  }

  return (
    <AppShell
      title={dict.notifications.title}
      subtitle={
        unread > 0 ? `${toPersianDigits(unread)} ${dict.notifications.unreadWord}` : undefined
      }
      backHref="/dashboard"
      actions={unread > 0 ? <MarkAllReadButton label={dict.notifications.markAllRead} /> : undefined}
    >
      <div className="mx-auto w-full max-w-2xl space-y-2">
        {failed ? (
          <div className="card border-red-400/30 bg-red-400/15 p-6 text-center text-[13px] font-medium text-red-300">
            {dict.errors.generic}
          </div>
        ) : items.length === 0 ? (
          <Empty
            title={dict.notifications.emptyTitle}
            subtitle={dict.notifications.emptyDesc}
            nextStep="وقتی مشتری داغی شناسایی شود یا گفتگویی به شما سپرده شود، همین‌جا و روی زنگ اعلان می‌بینید."
          />
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <NotificationItem key={n.id} n={n} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
