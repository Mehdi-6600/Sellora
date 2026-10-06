import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    const leads = await prisma.lead.findMany({
      where: { businessId: auth.businessId },
      include: { conversation: true },
      orderBy: [{ temperature: "desc" }, { score: "desc" }],
      take: 200,
    });
    return NextResponse.json({ leads });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
