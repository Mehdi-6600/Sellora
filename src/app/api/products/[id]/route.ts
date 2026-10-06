import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { productUpdateSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadAuthorized(productId: string) {
  const auth = await requireAuth();
  const p = await prisma.product.findUnique({ where: { id: productId } });
  if (!p || p.businessId !== auth.businessId) {
    throw new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
  }
  return { auth, product: p };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { product } = await loadAuthorized(id);
    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { auth, product } = await loadAuthorized(id);
    const body = await req.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    const updates = parsed.data;
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: updates.name ?? undefined,
        description: updates.description ?? undefined,
        sku: updates.sku ?? undefined,
        price: updates.price ?? undefined,
        imageUrl: updates.imageUrl ?? undefined,
        status: updates.status ?? undefined,
      },
    });
    // Audit log for availability/price changes
    const actions: string[] = [];
    if (updates.status && updates.status !== product.status) actions.push(updates.status === "AVAILABLE" ? "product.mark_available" : "product.mark_unavailable");
    if (updates.price != null && updates.price !== product.price) actions.push("product.price_change");
    for (const a of actions) {
      await prisma.auditLog.create({
        data: {
          businessId: auth.businessId,
          actorUserId: auth.userId,
          action: a,
          targetType: "Product",
          targetId: product.id,
          metaJson: { from: a.includes("price") ? product.price : product.status, to: a.includes("price") ? updates.price : updates.status } as any,
        },
      });
    }
    return NextResponse.json({ product: updated });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("[products PATCH]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { auth, product } = await loadAuthorized(id);
    await prisma.product.update({ where: { id: product.id }, data: { status: "ARCHIVED" } });
    await prisma.auditLog.create({
      data: {
        businessId: auth.businessId,
        actorUserId: auth.userId,
        action: "product.archive",
        targetType: "Product",
        targetId: product.id,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
