import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { getPlan, CURRENCY } from "@/lib/config/pricing";

export const runtime = "nodejs";

const bodySchema = z.object({
  plan: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]),
  trackingCode: z
    .string()
    .trim()
    .min(6, "کد رهگیری باید حداقل ۶ کاراکتر باشد.")
    .max(30, "کد رهگیری نباید بیشتر از ۳۰ کاراکتر باشد."),
});

export async function POST(req: Request) {
  let auth;
  try {
    auth = await requireAuth();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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

  const { plan, trackingCode } = parsed.data;
  const planConfig = getPlan(plan);
  const amount = planConfig.price;
  const days = planConfig.durationDays;
  const now = new Date();
  const endsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const existing = await prisma.subscription.findUnique({
    where: { businessId: auth.businessId },
  });

  if (existing && existing.status === "ACTIVE" && existing.paymentStatus === "APPROVED") {
    return NextResponse.json(
      { error: "already_active", message: "اشتراک شما در حال حاضر فعال است." },
      { status: 409 }
    );
  }

  const subscription = existing
    ? await prisma.subscription.update({
        where: { businessId: auth.businessId },
        data: {
          plan,
          amount,
          currency: CURRENCY,
          status: "TRIAL",
          paymentStatus: "PENDING",
          trackingCode,
          paidAt: now,
          reviewedAt: null,
          reviewedBy: null,
          rejectionReason: null,
          startsAt: now,
          endsAt,
        },
      })
    : await prisma.subscription.create({
        data: {
          businessId: auth.businessId,
          plan,
          amount,
          currency: CURRENCY,
          status: "TRIAL",
          paymentStatus: "PENDING",
          trackingCode,
          paidAt: now,
          startsAt: now,
          endsAt,
        },
      });

  try {
    await prisma.notification.create({
      data: {
        businessId: auth.businessId,
        kind: "subscription.pending",
        title: "درخواست خرید اشتراک در انتظار بررسی",
        body: `پلن ${plan} با کد رهگیری ${trackingCode} ثبت شد.`,
        href: "/settings/subscription/status",
      },
    });
  } catch {
    // Non-fatal.
  }

  try {
    await prisma.auditLog.create({
      data: {
        businessId: auth.businessId,
        actorUserId: auth.userId,
        action: "subscription.submit_payment",
        targetType: "Subscription",
        targetId: subscription.id,
        metaJson: { plan, trackingCode, amount },
      },
    });
  } catch {
    // Non-fatal.
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
      endsAt: subscription.endsAt,
    },
  });
}
