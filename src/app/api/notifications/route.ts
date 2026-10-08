import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { listNotifications, notificationHref, unreadCount } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let auth;
  try {
    auth = await requireAuth();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [items, unread] = await Promise.all([
      listNotifications(auth.businessId, 50),
      unreadCount(auth.businessId),
    ]);
    return NextResponse.json({
      ok: true,
      unread,
      items: items.map((n: any) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        href: notificationHref(n),
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
    });
  } catch (e) {
    console.error("[notifications GET]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
