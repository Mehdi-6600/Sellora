import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";

const bodySchema = z.object({
  reason: z.string().trim().min(1).max(500),
});

export async function POST(req: Request, ctx: { params: { id: string } }) {
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

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

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
  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      paymentStatus: "REJECTED",
      status: "TRIAL",
      reviewedAt: now,
      reviewedBy: auth.userId,
      rejectionReason: parsed.data.reason,
    },
  });

  try {
    await prisma.notification.create({
      data: {
        businessId: sub.businessId,
        kind: "subscription.rejected",
        title: "درخواست اشتراک رد شد",
        body: `دلیل: ${parsed.data.reason}`,
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
        action: "subscription.reject",
        targetType: "Subscription",
        targetId: id,
        metaJson: { reason: parsed.data.reason },
      },
    });
  } catch {
    // non-fatal
  }

  return NextResponse.json({ ok: true, subscription: updated });
}
