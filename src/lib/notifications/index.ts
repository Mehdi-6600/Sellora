// Notification center — single source of truth for event kinds, deep links and
// read/unread operations.
//
// Rules:
//  * Every notification describes something that ACTUALLY happened in this
//    tenant's data. Nothing here synthesises or fakes events.
//  * `href` is a same-origin path. It is always rendered through Next <Link>,
//    never injected as raw HTML, and never taken from user input.
//  * All read operations are scoped by businessId so a tenant can only touch
//    its own rows (markRead/markAllRead use updateMany, not findUnique+update).

import { prisma } from "@/lib/db/prisma";

export const NOTIFICATION_KINDS = {
  HOT_LEAD: "lead.hot",
  NEW_CONVERSATION: "conversation.new",
  OWNER_HANDOFF: "conversation.needs_owner",
  INSTAGRAM_DISCONNECTED: "instagram.disconnected",
  SUBSCRIPTION_PENDING: "subscription.pending",
  SUBSCRIPTION_APPROVED: "subscription.approved",
  SUBSCRIPTION_REJECTED: "subscription.rejected",
  SUBSCRIPTION_EXPIRING: "subscription.expiring",
  SUBSCRIPTION_EXPIRED: "subscription.expired",
  SYSTEM_WARNING: "system.warning",
} as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[keyof typeof NOTIFICATION_KINDS];

type KindMeta = {
  /** Fallback target when a row (e.g. pre-migration) has no href. */
  fallbackHref: string;
  tone: "red" | "amber" | "green" | "blue" | "gray";
  icon: string;
};

const KIND_META: Record<string, KindMeta> = {
  [NOTIFICATION_KINDS.HOT_LEAD]: { fallbackHref: "/leads", tone: "red", icon: "🔥" },
  [NOTIFICATION_KINDS.NEW_CONVERSATION]: { fallbackHref: "/conversations", tone: "blue", icon: "💬" },
  [NOTIFICATION_KINDS.OWNER_HANDOFF]: { fallbackHref: "/conversations", tone: "amber", icon: "🤝" },
  [NOTIFICATION_KINDS.INSTAGRAM_DISCONNECTED]: { fallbackHref: "/settings/instagram", tone: "red", icon: "📸" },
  [NOTIFICATION_KINDS.SUBSCRIPTION_PENDING]: { fallbackHref: "/settings/subscription/status", tone: "amber", icon: "⏳" },
  [NOTIFICATION_KINDS.SUBSCRIPTION_APPROVED]: { fallbackHref: "/settings/subscription/status", tone: "green", icon: "✅" },
  [NOTIFICATION_KINDS.SUBSCRIPTION_REJECTED]: { fallbackHref: "/settings/subscription/status", tone: "red", icon: "❌" },
  [NOTIFICATION_KINDS.SUBSCRIPTION_EXPIRING]: { fallbackHref: "/settings/subscription", tone: "amber", icon: "⏰" },
  [NOTIFICATION_KINDS.SUBSCRIPTION_EXPIRED]: { fallbackHref: "/settings/subscription", tone: "red", icon: "" },
  [NOTIFICATION_KINDS.SYSTEM_WARNING]: { fallbackHref: "/settings", tone: "gray", icon: "⚠️" },
};

const DEFAULT_META: KindMeta = { fallbackHref: "/dashboard", tone: "gray", icon: "🔔" };

export function notificationMeta(kind: string): KindMeta {
  return KIND_META[kind] ?? DEFAULT_META;
}

export function notificationHref(n: { kind: string; href: string | null }): string {
  return n.href || notificationMeta(n.kind).fallbackHref;
}

/**
 * Persist a notification for a tenant. Failures are logged, never thrown:
 * a notification is a side effect and must not roll back the work that
 * triggered it (callers already wrap most of these in try/catch).
 */
export async function notify(input: {
  businessId: string;
  kind: NotificationKind | string;
  title: string;
  body: string;
  href?: string | null;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        businessId: input.businessId,
        kind: input.kind,
        title: input.title,
        body: input.body,
        href: input.href ?? null,
      },
    });
  } catch (err) {
    console.error("[notifications] create failed:", err);
  }
}

export async function unreadCount(businessId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { businessId, readAt: null },
    });
  } catch (err) {
    console.error("[notifications] unreadCount failed:", err);
    return 0;
  }
}

export async function listNotifications(businessId: string, take = 50) {
  return prisma.notification.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: Math.min(take, 100),
  });
}

/** Tenant-scoped mark-as-read. updateMany guarantees no cross-tenant write. */
export async function markRead(businessId: string, id: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id, businessId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllRead(businessId: string): Promise<number> {
  const res = await prisma.notification.updateMany({
    where: { businessId, readAt: null },
    data: { readAt: new Date() },
  });
  return typeof res?.count === "number" ? res.count : 0;
}

/**
 * Lazy subscription lifecycle notices.
 *
 * Called from the owner-facing dashboard/settings server components. There is
 * no cron in this deployment, so expiry is evaluated on read: it is cheap (one
 * indexed findUnique + at most one count/create) and cannot drift.
 *
 * Creates at most one EXPIRING and one EXPIRED notice per subscription period
 * (deduped against notices created after `startsAt`), so a returning owner is
 * never spammed.
 */
export async function ensureSubscriptionNotices(sub: {
  businessId: string;
  status: string;
  paymentStatus: string | null;
  startsAt: Date | string;
  endsAt: Date | string | null;
  plan: string;
}): Promise<void> {
  if (sub.status !== "ACTIVE" || sub.paymentStatus !== "APPROVED" || !sub.endsAt) return;
  const endsAt = new Date(sub.endsAt).getTime();
  if (!Number.isFinite(endsAt)) return;
  const now = Date.now();
  const daysLeft = Math.ceil((endsAt - now) / 86_400_000);

  const kind =
    endsAt <= now
      ? NOTIFICATION_KINDS.SUBSCRIPTION_EXPIRED
      : daysLeft <= 3
      ? NOTIFICATION_KINDS.SUBSCRIPTION_EXPIRING
      : null;
  if (!kind) return;

  const startsAt = new Date(sub.startsAt);
  const already = await prisma.notification.count({
    where: { businessId: sub.businessId, kind, createdAt: { gte: startsAt } },
  });
  if (already > 0) return;

  if (kind === NOTIFICATION_KINDS.SUBSCRIPTION_EXPIRED) {
    // Real lifecycle transition, computed server-side from endsAt. We never
    // downgrade on a client claim — only on the stored expiry timestamp.
    try {
      await prisma.subscription.updateMany({
        where: { businessId: sub.businessId, status: "ACTIVE", endsAt: { lte: new Date() } },
        data: { status: "EXPIRED" },
      });
    } catch (err) {
      console.error("[notifications] expire transition failed:", err);
    }
    await notify({
      businessId: sub.businessId,
      kind,
      title: "اشتراک شما منقضی شد",
      body: "اعتبار پلن شما به پایان رسیده است. برای ادامه پاسخ‌گویی خودکار، اشتراک را تمدید کنید.",
      href: "/settings/subscription",
    });
    return;
  }

  await notify({
    businessId: sub.businessId,
    kind,
    title: "اشتراک شما رو به پایان است",
    body: `اعتبار پلن ${sub.plan} تا ${daysLeft} روز دیگر تمام می‌شود. برای جلوگیری از توقف پاسخ‌گویی خودکار، تمدید کنید.`,
    href: "/settings/subscription",
  });
}
