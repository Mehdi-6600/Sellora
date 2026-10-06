import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { getPlan, PLANS } from "@/lib/config/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PlanSchema = z.object({ plan: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]) });

export async function GET() {
  try {
    const auth = await requireAuth();
    const sub = await prisma.subscription.findUnique({ where: { businessId: auth.businessId } });
    return NextResponse.json({ plans: PLANS, subscription: sub });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    const parsed = PlanSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    const plan = getPlan(parsed.data.plan);
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    // MVP: record as TRIAL / requested (no payment gateway yet). We never fake a successful paid activation.
    const sub = await prisma.subscription.upsert({
      where: { businessId: auth.businessId },
      create: {
        businessId: auth.businessId,
        plan: plan.id,
        status: "TRIAL",
        amount: plan.price,
        currency: "IRT",
        startsAt,
        endsAt,
      },
      update: {
        plan: plan.id,
        amount: plan.price,
        currency: "IRT",
        startsAt,
        endsAt,
      },
    });
    await prisma.auditLog.create({
      data: {
        businessId: auth.businessId,
        actorUserId: auth.userId,
        action: "subscription.requested",
        metaJson: { plan: plan.id, amount: plan.price } as any,
      },
    });
    return NextResponse.json({ ok: true, subscription: sub });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
