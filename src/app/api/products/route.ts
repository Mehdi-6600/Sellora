import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { productCreateSchema } from "@/lib/validation/schemas";
import { clientId, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status");
    const take = Math.min(200, Number(searchParams.get("take") || 100));
    const products = await prisma.product.findMany({
      where: {
        businessId: auth.businessId,
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: { variants: true },
      orderBy: { updatedAt: "desc" },
      take,
    });
    return NextResponse.json({ products });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cid = clientId(req);
  const rl = rateLimit("products:create", cid, { max: 60, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  try {
    const auth = await requireAuth();
    const body = await req.json();
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    const existing = data.sku
      ? await prisma.product.findUnique({ where: { businessId_sku: { businessId: auth.businessId, sku: data.sku! } } })
      : null;
    if (existing) return NextResponse.json({ error: { code: "product_exists" } }, { status: 409 });

    const product = await prisma.product.create({
      data: {
        businessId: auth.businessId,
        name: data.name,
        description: data.description || null,
        sku: data.sku || null,
        price: data.price,
        imageUrl: data.imageUrl || null,
        status: data.status,
        variants: data.variants?.length
          ? {
              create: data.variants.map((v) => ({
                businessId: auth.businessId,
                size: v.size || null,
                color: v.color || null,
                sku: v.sku || null,
                price: v.price ?? null,
                status: v.status,
              })),
            }
          : undefined,
      },
      include: { variants: true },
    });

    await prisma.auditLog.create({
      data: {
        businessId: auth.businessId,
        actorUserId: auth.userId,
        action: "product.create",
        targetType: "Product",
        targetId: product.id,
        metaJson: { name: product.name, price: product.price } as any,
      },
    });
    return NextResponse.json({ product });
  } catch (e: any) {
    if (e instanceof Response) return e;
    if (e?.code === "P2002") return NextResponse.json({ error: { code: "product_exists" } }, { status: 409 });
    console.error("[products POST]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
