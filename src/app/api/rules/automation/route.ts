import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const form = await req.formData();
    const enabled = form.get("enabled") === "true";
    const cfg = await prisma.automationConfig.upsert({
      where: { businessId: auth.businessId },
      create: { businessId: auth.businessId, enabled },
      update: { enabled },
    });
    await prisma.auditLog.create({
      data: {
        businessId: auth.businessId,
        actorUserId: auth.userId,
        action: enabled ? "automation.enable" : "automation.disable",
        metaJson: { enabled } as any,
      },
    });
    void cfg;
    // Redirect back to settings (simple form POST).
    return NextResponse.redirect(new URL("/settings", req.url), { status: 303 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
