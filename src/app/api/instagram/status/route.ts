import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { verifyToken } from "@/lib/meta/client";
import { decrypt } from "@/lib/security/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    const ig = await prisma.instagramAccount.findUnique({ where: { businessId: auth.businessId } });
    if (!ig) return NextResponse.json({ status: "DISCONNECTED" });
    if (!ig.pageId) return NextResponse.json({ status: ig.status });
    const v = await verifyToken(decrypt(ig.accessToken), ig.pageId).catch(() => ({ ok: false }));
    const status = v.ok ? "CONNECTED" : "REAUTH_REQUIRED";
    if (status !== ig.status) {
      await prisma.instagramAccount.update({ where: { id: ig.id }, data: { status: status as any, lastVerifiedAt: new Date() } });
    }
    return NextResponse.json({ status, username: ig.username });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
