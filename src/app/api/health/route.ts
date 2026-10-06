import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (e: any) {
    dbError = e?.message ?? String(e);
  }
  return NextResponse.json({
    ok: true,
    service: "sellora",
    time: new Date().toISOString(),
    db: dbOk ? "connected" : "disconnected",
    dbError: dbOk ? null : dbError,
    meta: {
      appIdConfigured: !!process.env.META_APP_ID,
      qstashConfigured: !!process.env.QSTASH_TOKEN,
    },
  });
}
