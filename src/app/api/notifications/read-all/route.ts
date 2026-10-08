import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { markAllRead } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  let auth;
  try {
    auth = await requireAuth();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const count = await markAllRead(auth.businessId);
    return NextResponse.json({ ok: true, updated: count });
  } catch (e) {
    console.error("[notifications read-all]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
