import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (e) {
    // SECURITY: the raw DB error can contain host names, roles and query text.
    // Log it server-side; expose only a boolean to anonymous callers.
    console.error("[health] database check failed:", e);
  }
  return NextResponse.json({
    ok: true,
    service: "sellora",
    time: new Date().toISOString(),
    db: dbOk ? "connected" : "disconnected",
    meta: {
      appIdConfigured: !!process.env.META_APP_ID,
      qstashConfigured: !!process.env.QSTASH_TOKEN,
    },
  });
}
