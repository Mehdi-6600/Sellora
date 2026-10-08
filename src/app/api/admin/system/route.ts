import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only observability snapshot built from tables that already exist
 * (FailedJob, WebhookEvent, Message). No new storage, no SaaS dependency.
 */
export async function GET() {
  let auth;
  try {
    auth = await requireAuth();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!auth.user?.isAdmin) {
    return NextResponse.json({ error: "forbidden_admin_only" }, { status: 403 });
  }

  try {
    const [failedJobs, pendingWebhookCount, pendingWebhooks, stuckMessages] = await Promise.all([
      prisma.failedJob.findMany({ orderBy: { lastErrorAt: "desc" }, take: 20 }),
      prisma.webhookEvent.count({ where: { processed: false } }),
      prisma.webhookEvent.findMany({
        where: { processed: false },
        orderBy: { receivedAt: "desc" },
        take: 10,
        select: { id: true, source: true, eventType: true, receivedAt: true, businessId: true },
      }),
      prisma.message.findMany({
        where: { deliveryState: { in: ["FAILED", "RETRYING", "BLOCKED"] } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          businessId: true,
          deliveryState: true,
          failureReason: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      failedJobs,
      pendingWebhookCount,
      pendingWebhooks,
      stuckMessages,
    });
  } catch (e) {
    console.error("[admin/system]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
