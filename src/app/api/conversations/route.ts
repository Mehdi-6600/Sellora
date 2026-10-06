import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    const conversations = await prisma.conversation.findMany({
      where: { businessId: auth.businessId },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        lead: true,
      },
      orderBy: { lastMessageAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ conversations });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
