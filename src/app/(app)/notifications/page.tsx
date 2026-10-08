import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { Empty } from "@/components/ui/empty";
import { NotificationItem, type NotificationRow } from "@/components/notifications/notification-item";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read";
import { listNotifications, notificationHref, unreadCount } from "@/lib/notifications";
import { formatRelativeTime } from "@/lib/utils/format";

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
    items = rows.map((n: any) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      href: notificationHref(n),
      readAt: n.readAt ? new Date(n.readAt).toISOString() : null,
      createdAt: new Date(n.createdAt).toISOString(),
      relativeTime: formatRelativeTime(n.createdAt, locale),
    }));
  } catch (err) {
    console.error("[notifications page]", err);
    failed = true;
  }

  return (
    <AppShell
      title={dict.notifications.title}
      subtitle={unread > 0 ? `${unread} ${dict.notifications.unreadWord}` : undefined}
      backHref="/dashboard"
      actions={unread > 0 ? <MarkAllReadButton label={dict.notifications.markAllRead} /> : undefined}
    >
      {failed ? (
        <div className="card p-6 text-center text-sm text-red-700 border-red-200 bg-red-50">
          {dict.errors.generic}
        </div>
      ) : items.length === 0 ? (
        <Empty title={dict.notifications.emptyTitle} subtitle={dict.notifications.emptyDesc} />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <NotificationItem key={n.id} n={n} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
