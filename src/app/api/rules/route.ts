import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { rulesetSchema } from "@/lib/validation/schemas";
import { readJsonBody } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    const ruleset = await prisma.businessRuleset.findFirst({
      where: { businessId: auth.businessId, isActive: true },
      orderBy: { version: "desc" },
    });
    return NextResponse.json({ ruleset });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const bodyRes = await readJsonBody(req, 100_000);
    if (!bodyRes.ok) return NextResponse.json({ error: bodyRes.error }, { status: bodyRes.status });
    const parsed = rulesetSchema.safeParse(bodyRes.json);
    if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    const current = await prisma.businessRuleset.findFirst({
      where: { businessId: auth.businessId, isActive: true },
      orderBy: { version: "desc" },
    });
    const nextVersion = (current?.version ?? 0) + 1;
    if (current) {
      await prisma.businessRuleset.update({ where: { id: current.id }, data: { isActive: false } });
    }
    const ruleset = await prisma.businessRuleset.create({
      data: {
        businessId: auth.businessId,
        version: nextVersion,
        isActive: true,
        address: parsed.data.address ?? null,
        phone: parsed.data.phone ?? null,
        workingHours: (parsed.data.workingHours as any) ?? null,
        shippingInfo: parsed.data.shippingInfo ?? null,
        paymentMethods: parsed.data.paymentMethods ?? null,
        returnPolicy: parsed.data.returnPolicy ?? null,
        citiesServed: parsed.data.citiesServed ?? null,
        generalInfo: parsed.data.generalInfo ?? null,
        notes: parsed.data.notes ?? null,
      },
    });
    await prisma.auditLog.create({
      data: {
        businessId: auth.businessId,
        actorUserId: auth.userId,
        action: "rules.update",
        metaJson: { version: nextVersion } as any,
      },
    });
    return NextResponse.json({ ruleset });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("[rules PUT]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
