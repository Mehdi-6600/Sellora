import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { parseImportInput, toStoragePrice } from "@/lib/products/importer";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({ text: z.string().min(1).max(200_000) });

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    const rows = parseImportInput(parsed.data.text);
    const validRows = rows.filter((r) => r.valid);

    let created = 0;
    for (const r of validRows) {
      try {
        await prisma.product.create({
          data: {
            businessId: auth.businessId,
            name: r.name!,
            price: toStoragePrice(r.priceToman || 0),
            status: r.status!,
          },
        });
        created++;
      } catch (err: any) {
        // Skip duplicates (unique sku etc.) but don't fail the whole batch.
        console.warn("[import] row skipped:", r.name, err?.message);
      }
    }

    await prisma.auditLog.create({
      data: {
        businessId: auth.businessId,
        actorUserId: auth.userId,
        action: "product.import",
        metaJson: { validRows: validRows.length, created, invalidRows: rows.length - validRows.length } as any,
      },
    });

    return NextResponse.json({ created, invalid: rows.length - (validRows.length as number), total: rows.length });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("[import]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
