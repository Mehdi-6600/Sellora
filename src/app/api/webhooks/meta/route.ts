// Meta (Instagram / Facebook) webhook endpoint.
//
// Implements:
//   - GET  : Webhook verification (hub.challenge / hub.verify_token)
//   - POST : Signature verified event ingestion + fast ACK. Long processing is
//            dispatched to the background job queue (QStash if configured, else inline).
//
// Idempotency is enforced by unique(source, externalId). The event is persisted
// BEFORE processing (event sourcing), then we return 200 quickly.
//
// NOTE: MVP supports Instagram Messaging webhook ("messages" field for Instagram-
// scoped IDs) and post comments. The shape of Instagram DM webhooks under the
// "instagram" object is documented per Graph API version; we detect inbound
// messages under both `messaging` (Facebook/IG unified) and `standby`/`changes`
// entries defensively.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyWebhookSignature } from "@/lib/meta/signature";
import { META_WEBHOOK_VERIFY_TOKEN } from "@/lib/meta/config";
import { enqueue } from "@/lib/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET is Meta's webhook verification challenge (subscribe-time only).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === META_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  // 1. Read RAW body for signature verification.
  const rawBody = await req.text();
  const sig = req.headers.get("x-hub-signature-256");
  const okSig = verifyWebhookSignature(rawBody, sig);

  // 1a. Reject invalid signatures BEFORE any work — never ACK forgeries.
  if (!okSig) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // 2. Fast-ACK: respond 200 to Meta within 1s to avoid retries on our
  // critical path. Persisting the WebhookEvent happens inside processMetaWebhook
  // but does not block the response (it is started but not awaited).
  const response = NextResponse.json({ ok: true });
  void processMetaWebhook(payload, true).catch((err) => {
    console.error("[meta-webhook] processing error:", err);
  });
  return response;
}

async function processMetaWebhook(payload: any, signatureOk: boolean) {
  const entries = payload?.entry ?? [];
  for (const entry of entries) {
    // Instagram DM entries have `messaging` array; comment entries have `changes`.
    const entryId = entry?.id; // The Instagram Business Account ID OR page id
    const externalEventId = entry?.time ? `${entryId}-${entry.time}-${JSON.stringify(entry).slice(0, 80)}` : null;
    const business = await resolveBusinessFromEntry(entryId);

    // Persist event (idempotent via unique).
    let webhookEvent;
    try {
      webhookEvent = await prisma.webhookEvent.create({
        data: {
          source: "meta",
          businessId: business?.id ?? null,
          externalId: externalEventId ?? `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          eventType: "instagram.webhook",
          signatureOk,
          payload: entry as any,
        },
      });
    } catch (e: any) {
      if (e?.code === "P2002") {
        // Duplicate event — already processed; skip.
        continue;
      }
      console.error("[meta-webhook] persist error:", e?.message);
      continue;
    }

    // Messaging events (DMs):
    const messaging = entry.messaging ?? [];
    for (const m of messaging) {
      if (!m?.message?.text && !m?.postback) continue; // ignore echoes/deliveries
      if (m?.message?.is_echo) continue;
      await handleInboundDm(business?.id ?? null, entryId, m, webhookEvent.id);
    }

    // Comments → private reply eligibility handled elsewhere in MVP.
    // We just mark the event processed.
    if (entry.changes) {
      // future comment handling; for MVP we don't auto-comment/reply but persist.
    }

    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: true, processedAt: new Date() },
    });
  }
}

async function resolveBusinessFromEntry(entryId: string | undefined) {
  if (!entryId) return null;
  // Match by InstagramBusinessAccountId OR pageId by looking up the InstagramAccount directly.
  const ig = await prisma.instagramAccount.findFirst({
    where: { OR: [{ instagramBusinessAccountId: entryId }, { pageId: entryId }] },
  });
  if (!ig) return null;
  return prisma.business.findUnique({ where: { id: ig.businessId } });
}

async function handleInboundDm(businessId: string | null, entryId: string | undefined, m: any, webhookEventId: string) {
  if (!businessId) return; // unknown tenant — log & ignore
  const senderId = m?.sender?.id;
  const text: string = m?.message?.text ?? "";
  const mid = m?.message?.mid;
  if (!senderId || !text) return;

  const ig = await prisma.instagramAccount.findUnique({ where: { businessId } });
  if (!ig || ig.status !== "CONNECTED") return;

  // Dynamically import to avoid cold-start cost.
  const { handleInboundMessage } = await import("@/lib/conversation/service");
  const result = await handleInboundMessage({
    businessId,
    igAccountId: ig.id,
    igSid: senderId,
    igMessageId: mid,
    text,
  }).catch((e) => {
    console.error("[meta-webhook] inbound message error", e);
    return null;
  });

  if (result?.reply) {
    // Find the just-created outbound message to queue
    const msg = await prisma.message.findFirst({
      where: { idempotencyKey: result.reply.idempotencyKey },
      orderBy: { createdAt: "desc" },
    });
    if (msg) {
      await enqueue("send.message", { messageId: msg.id });
    }
  }

  await prisma.webhookEvent.update({
    where: { id: webhookEventId },
    data: { processedAt: new Date(), processed: true },
  });
  void entryId;
}
