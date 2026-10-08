import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { markRead } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let auth;
  try {
    auth = await requireAuth();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  try {
    // markRead is an updateMany scoped to auth.businessId — a foreign id
    // matches zero rows and returns 404-free success without leaking existence.
    await markRead(auth.businessId, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notifications read]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
