import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";

const PLAN_DAYS: Record<string, number> = {
  WEEKLY: 7,
  MONTHLY: 30,
  QUARTERLY: 90,
};

export async function POST(_req: Request, ctx: { params: { id: string } }) {
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

  const id = ctx.params.id;

  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (sub.paymentStatus !== "PENDING") {
    return NextResponse.json(
      { error: "not_pending", message: "این درخواست در وضعیت انتظار نیست." },
      { status: 409 }
    );
  }

  const now = new Date();
  const days = PLAN_DAYS[sub.plan] ?? 30;
  const endsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      paymentStatus: "APPROVED",
      status: "ACTIVE",
      startsAt: now,
      endsAt,
      reviewedAt: now,
      reviewedBy: auth.userId,
      rejectionReason: null,
    },
  });

  // Notify the business owner
  try {
    await prisma.notification.create({
      data: {
        businessId: sub.businessId,
        kind: "subscription.approved",
        title: "اشتراک شما تأیید شد",
        body: `پلن ${sub.plan} فعال شد. اعتبار تا ${endsAt.toISOString().slice(0, 10)}.`,
        href: "/settings/subscription/status",
      },
    });
  } catch {
    // non-fatal
  }

  try {
    await prisma.auditLog.create({
      data: {
        businessId: sub.businessId,
        actorUserId: auth.userId,
        action: "subscription.approve",
        targetType: "Subscription",
        targetId: id,
        metaJson: { plan: sub.plan, amount: sub.amount },
      },
    });
  } catch {
    // non-fatal
  }

  return NextResponse.json({ ok: true, subscription: updated });
}
