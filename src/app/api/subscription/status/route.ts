import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  let auth;
  try {
    auth = await requireAuth();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { businessId: auth.businessId },
  });

  if (!subscription) {
    return NextResponse.json({ ok: true, subscription: null });
  }

  return NextResponse.json({
    ok: true,
    subscription: {
      id: subscription.id,
      plan: subscription.plan,
      amount: subscription.amount,
      currency: subscription.currency,
      status: subscription.status,
      paymentStatus: subscription.paymentStatus,
      trackingCode: subscription.trackingCode,
      startsAt: subscription.startsAt,
      endsAt: subscription.endsAt,
      reviewedAt: subscription.reviewedAt,
      rejectionReason: subscription.rejectionReason,
    },
  });
}
