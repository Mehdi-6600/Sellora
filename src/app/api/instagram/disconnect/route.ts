import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const auth = await requireAuth();
    await prisma.instagramAccount.update({
      where: { businessId: auth.businessId },
      data: { status: "DISCONNECTED", accessToken: "", lastVerifiedAt: null, tokenExpiresAt: null },
    });
    await prisma.auditLog.create({
      data: {
        businessId: auth.businessId,
        actorUserId: auth.userId,
        action: "instagram.disconnect",
      },
    });
    return NextResponse.redirect(new URL("/settings/instagram", process.env.APP_URL || "/"), { status: 303 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
