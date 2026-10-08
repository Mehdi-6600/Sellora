import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { sendMessageSchema } from "@/lib/validation/schemas";
import { sendOwnerMessage } from "@/lib/conversation/service";
import { enqueue } from "@/lib/queue";
import { readJsonBody } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await params;
    const auth = await requireAuth();
    const bodyRes = await readJsonBody(req, 20_000);
    if (!bodyRes.ok) return NextResponse.json({ error: bodyRes.error }, { status: bodyRes.status });
    const parsed = sendMessageSchema.safeParse(bodyRes.json);
    if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    const result = await sendOwnerMessage({
      userId: auth.userId,
      businessId: auth.businessId,
      conversationId,
      text: parsed.data.text,
    });
    // Queue delivery (inline if no queue configured)
    const message = await (await import("@/lib/db/prisma")).prisma.message.findFirst({
      where: { idempotencyKey: result.idempotencyKey },
      orderBy: { createdAt: "desc" },
    });
    if (message) await enqueue("send.message", { messageId: message.id });
    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("[messages POST]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
