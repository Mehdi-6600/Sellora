import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";

async function requireAdmin() {
  const auth = await requireAuth();
  if (!auth.user?.isAdmin) {
    throw new Response(JSON.stringify({ error: "forbidden_admin_only" }), { status: 403 });
  }
  return auth;
}

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status"); // PENDING | APPROVED | REJECTED | all

  const where =
    statusFilter && ["PENDING", "APPROVED", "REJECTED"].includes(statusFilter)
      ? { paymentStatus: statusFilter as any }
      : {};

  const subs = await prisma.subscription.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Attach business info (name, slug) for UI
  const businessIds: string[] = Array.from(new Set(subs.map((s: any) => s.businessId)));
  const businesses = businessIds.length
    ? await prisma.business.findMany({ where: { id: { in: businessIds } } })
    : [];
  const bmap = new Map<string, any>(businesses.map((b: any) => [b.id, b]));

  const items = subs.map((s: any) => ({
    id: s.id,
    businessId: s.businessId,
    businessName: bmap.get(s.businessId)?.name ?? "—",
    businessSlug: bmap.get(s.businessId)?.slug ?? "—",
    plan: s.plan,
    amount: s.amount,
    currency: s.currency,
    status: s.status,
    paymentStatus: s.paymentStatus,
    trackingCode: s.trackingCode,
    paidAt: s.paidAt,
    reviewedAt: s.reviewedAt,
    reviewedBy: s.reviewedBy,
    rejectionReason: s.rejectionReason,
    createdAt: s.createdAt,
  }));

  return NextResponse.json({ ok: true, items });
}
