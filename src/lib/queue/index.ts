// Background-job abstraction.
// For MVP on Vercel serverless we use Upstash QStash if configured; otherwise
// we process the job synchronously inside the request (so development and
// single-instance deployments work). We never PRETEND this is a distributed
// queue: when QSTASH_TOKEN is absent, delivery is best-effort synchronous.
//
// Swap `enqueue()` calls with a true queue later without touching callers.

import { prisma } from "@/lib/db/prisma";
import { sendMessageWithEncryptedToken } from "@/lib/meta/client";

export type JobName = "send.message" | "process.webhook";

export async function enqueue(job: JobName, payload: Record<string, unknown>, opts?: { delayMs?: number }) {
  if (process.env.QSTASH_TOKEN) {
    try {
      const baseUrl = process.env.APP_URL || process.env.VERCEL_URL || "http://localhost:3000";
      const url = `${baseUrl.replace(/\/$/, "")}/api/webhooks/qstash`;
      const res = await fetch(`https://qstash.upstash.io/v2/publish/${url}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
          "Content-Type": "application/json",
          "Upstash-Method": "POST",
          ...(opts?.delayMs ? { "Upstash-Delay": `${Math.round(opts.delayMs / 1000)}s` } : {}),
        },
        body: JSON.stringify({ job, payload }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("[queue] QStash publish failed:", text);
        throw new Error(`qstash publish failed: ${res.status}`);
      }
      return { queued: true as const, backend: "qstash" as const };
    } catch (err) {
      console.error("[queue] falling back to inline execution", err);
    }
  }
  // Inline fallback
  try {
    await processJob(job, payload);
    return { queued: true as const, backend: "inline" as const };
  } catch (err) {
    console.error("[queue] inline job failed", err);
    await prisma.failedJob.create({
      data: {
        businessId: (payload.businessId as string) ?? null,
        jobType: job,
        payload: payload as any,
        error: err instanceof Error ? err.message : String(err),
        attempts: 1,
      },
    });
    return { queued: false as const, backend: "inline" as const };
  }
}

export async function processJob(job: JobName, payload: Record<string, unknown>): Promise<void> {
  switch (job) {
    case "send.message":
      await handleSendMessage(payload as any);
      break;
    case "process.webhook":
      // Webhook processing is done inline in the webhook route for fast ACK.
      break;
    default:
      throw new Error(`Unknown job: ${job}`);
  }
}

async function handleSendMessage(p: {
  messageId: string;
}) {
  const message = await prisma.message.findUnique({
    where: { id: p.messageId },
    include: { conversation: true, business: true },
  });
  if (!message) throw new Error("message not found");
  if (message.direction !== "OUTBOUND") return;
  if (["SENT", "BLOCKED", "EXPIRED"].includes(message.deliveryState)) return; // idempotent

  const ig = await prisma.instagramAccount.findUnique({ where: { businessId: message.businessId } });
  if (!ig) {
    await prisma.message.update({
      where: { id: message.id },
      data: { deliveryState: "FAILED", failureReason: "instagram_not_connected" },
    });
    return;
  }

  await prisma.message.update({
    where: { id: message.id },
    data: { deliveryState: "SENDING" },
  });

  try {
    const result = await sendMessageWithEncryptedToken({
      pageId: ig.pageId || ig.instagramBusinessAccountId,
      encryptedToken: ig.accessToken,
      recipientId: message.conversation.igSid,
      text: message.text,
      idempotencyKey: message.idempotencyKey ?? undefined,
    });
    await prisma.message.update({
      where: { id: message.id },
      data: {
        igMessageId: result.messageId,
        deliveryState: "SENT",
        deliveredAt: new Date(),
      },
    });
  } catch (err: any) {
    const code = err?.code;
    const status = err?.status;
    let nextState: "FAILED" | "RETRYING" | "BLOCKED" = "RETRYING";
    // Classify failures (see master prompt §19)
    if (status === 401 || status === 403 || code === 190 || code === 102) {
      nextState = "FAILED";
      // Mark Instagram connection as needing re-auth
      await prisma.instagramAccount.update({
        where: { id: ig.id },
        data: { status: "REAUTH_REQUIRED" },
      });
    } else if (status === 429) {
      nextState = "RETRYING";
      // backoff handled by QStash or manual retry
    } else if (status === 400) {
      nextState = "BLOCKED"; // invalid request — don't retry
    }
    await prisma.message.update({
      where: { id: message.id },
      data: { deliveryState: nextState, failureReason: err?.message ?? String(err) },
    });
    await prisma.messageDelivery.create({
      data: {
        messageId: message.id,
        attempt: (await prisma.messageDelivery.count({ where: { messageId: message.id } })) + 1,
        deliveryState: nextState as any,
        errorCode: code ? String(code) : String(status ?? "unknown"),
        errorMessage: err?.message ?? String(err),
      },
    });
    if (nextState !== "RETRYING") throw err;
  }
}
