import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { setAutomationLock } from "@/lib/conversation/service";
import { handoffSchema } from "@/lib/validation/schemas";
import { readJsonBody } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await params;
    const auth = await requireAuth();
    const bodyRes = await readJsonBody(req, 5_000);
    if (!bodyRes.ok) return NextResponse.json({ error: bodyRes.error }, { status: bodyRes.status });
    const parsed = handoffSchema.safeParse(bodyRes.json);
    if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    await setAutomationLock({
      userId: auth.userId,
      businessId: auth.businessId,
      conversationId,
      state: parsed.data.state,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
