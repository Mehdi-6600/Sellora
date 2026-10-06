import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createSession, getSession } from "@/lib/auth/session";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({ businessId: z.string().cuid() });

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    const membership = await prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId: parsed.data.businessId, userId: session.uid } },
    });
    if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    await createSession({ uid: session.uid, bid: parsed.data.businessId, role: membership.role });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
