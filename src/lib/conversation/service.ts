// High-level conversation service used by webhook handlers, owner actions,
// and API routes. Ensures: tenant scoping, context management, confidence
// policy, lead updating, and deterministic answer generation.

import { prisma } from "@/lib/db/prisma";
import { detectIntents, extractEntities, classifyConfidence } from "./intents";
import { resolveProduct, resolveVariant, isContextStale } from "./resolve";
import { buildResponse } from "./responses";
import { canSendAutomatedReply } from "@/lib/policy/engine";
import { scoreFromSignals, signalsFromIntents, detectExplicitBuyPhrase, LeadSignal } from "@/lib/leads/scoring";

/**
 * Process an inbound customer message:
 *  1. Persist message
 *  2. Refresh or resolve context
 *  3. Detect intents/entities
 *  4. Build response
 *  5. Persist outbound message (queued)
 *  6. Update lead
 *  7. Return response + state for queue worker to deliver.
 */
export async function handleInboundMessage(input: {
  businessId: string;
  igAccountId: string;
  igSid: string; // customer scoped id
  igMessageId?: string;
  text: string;
  customerName?: string;
  customerUsername?: string;
}): Promise<{ reply?: { text: string; idempotencyKey: string }; needsOwner: boolean }> {
  const { businessId, igAccountId, igSid, text, igMessageId } = input;

    return prisma.$transaction(async (tx: any) => {
    // Upsert conversation
    const convo = await tx.conversation.upsert({
      where: { businessId_igAccountId_igSid: { businessId, igAccountId, igSid } },
      update: { lastMessageAt: new Date() },
      create: {
        businessId,
        igAccountId,
        igSid,
        customerName: input.customerName,
        customerUsername: input.customerUsername,
        state: "NEW",
        automationLock: "AUTO",
        lastMessageAt: new Date(),
      },
      include: { context: true },
    });

    // Persist inbound message
    await tx.message.create({
      data: {
        businessId,
        conversationId: convo.id,
        igMessageId: igMessageId ?? null,
        direction: "INBOUND",
        senderType: "CUSTOMER",
        text,
        deliveryState: "SENT",
        deliveredAt: new Date(),
      },
    });

    // Ensure context row
    let ctx = convo.context;
    if (!ctx) {
      ctx = await tx.conversationContext.create({
        data: { conversationId: convo.id, entitiesJson: {} },
      });
    }

    const intents = detectIntents(text);
    const entities = extractEntities(text);

    // Try to resolve a product mention; if found, update active product.
    let activeProduct = ctx.activeProductId
      ? await tx.product.findUnique({
          where: { id: ctx.activeProductId },
          include: { variants: true },
        })
      : null;
    if (ctx.activeProductId && isContextStale(ctx.lastProductMentionedAt)) {
      activeProduct = null; // stale; forget
    }
    const resolved = await resolveProduct(businessId, text);
    if (resolved) {
      activeProduct = resolved.product as any;
      ctx = await tx.conversationContext.update({
        where: { id: ctx.id },
        data: {
          activeProductId: activeProduct!.id,
          activeVariantId: null,
          lastProductMentionedAt: new Date(),
          entitiesJson: { colors: entities.colors, sizes: entities.sizes, city: entities.city },
        },
      });
    } else if (entities.city) {
      ctx = await tx.conversationContext.update({
        where: { id: ctx.id },
        data: {
          city: entities.city,
          entitiesJson: { ...(ctx.entitiesJson as any), city: entities.city, colors: entities.colors, sizes: entities.sizes },
        },
      });
    }

    // Variant resolution
    let activeVariant = ctx.activeVariantId
      ? await tx.productVariant.findUnique({ where: { id: ctx.activeVariantId } })
      : null;
    const variantMatch = activeProduct ? resolveVariant(activeProduct as any, { colors: entities.colors, sizes: entities.sizes }) : null;
    if (variantMatch) {
      activeVariant = variantMatch;
      await tx.conversationContext.update({
        where: { id: ctx.id },
        data: { activeVariantId: variantMatch.id },
      });
    }

    // Business info
    const ruleset = await tx.businessRuleset.findFirst({
      where: { businessId, isActive: true },
      orderBy: { version: "desc" },
    });

    // Fresh database read for product price/availability (sensitive).
    if (activeProduct) {
      activeProduct = await tx.product.findUnique({
        where: { id: activeProduct.id },
        include: { variants: true },
      });
    }

    const confidence = classifyConfidence(intents, entities, !!activeProduct);

    const auto = await tx.automationConfig.findUnique({ where: { businessId } });
    const ig = await tx.instagramAccount.findUnique({ where: { businessId } });
    const policy = canSendAutomatedReply({
      conversation: convo,
      direction: "INBOUND",
      igAccount: ig,
      automation: auto,
    });

    const { text: replyText, needsOwner } = buildResponse(intents, confidence, {
      product: activeProduct as any,
      variant: activeVariant,
      ruleset,
      city: entities.city,
      entities,
    });

    // Update state
    let newState = convo.state;
    if (convo.state === "NEW") newState = "ACTIVE";
    if (needsOwner) newState = "WAITING_OWNER";
    else newState = "WAITING_CUSTOMER";

    await tx.conversation.update({
      where: { id: convo.id },
      data: { state: newState, contextExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) },
    });

    // ---- Lead scoring ----
    const existingSignals: LeadSignal[] = [];
    const prevLead = await tx.lead.findUnique({ where: { conversationId: convo.id } });
    if (prevLead) existingSignals.push(...((prevLead.signalsJson as any) as LeadSignal[]));
    const newSignals = signalsFromIntents(intents, entities);
    if (detectExplicitBuyPhrase(text)) {
      newSignals.push({
        type: "EXPLICIT_BUY_PHRASE",
        weight: 20,
        label: "عبارت خرید قطعی را به کار برد",
        at: new Date().toISOString(),
      });
    }
    if (needsOwner && intents.includes("ORDER_INTENT") === false && intents.includes("HUMAN_REQUEST") === false) {
      // Owner escalation isn't itself a buy signal, no score added.
    }
    // Repeat engagement: if the customer has messaged before (non-trivial prior signals),
    // add a REPEAT_FOLLOWUP signal so that warm/cold customers who come back move up.
    const inboundCount: number = await tx.message.count({
      where: { conversationId: convo.id, direction: "INBOUND" },
    });
    if (inboundCount >= 2) {
      // Already had at least one prior inbound before this one.
      newSignals.push({
        type: "REPEAT_FOLLOWUP",
        weight: 8,
        label: "مشتری دوباره پیگیری کرد",
        at: new Date().toISOString(),
      });
    }

    const signals = [...existingSignals, ...newSignals];
    const scored = scoreFromSignals(signals);

    await tx.lead.upsert({
      where: { conversationId: convo.id },
      create: {
        businessId,
        conversationId: convo.id,
        temperature: scored.temperature,
        score: scored.score,
        reason: scored.reason,
        signalsJson: signals as any,
        relevantIntent: intents[0],
        hotAt: scored.temperature === "HOT" ? new Date() : null,
      },
      update: {
        temperature: scored.temperature,
        score: scored.score,
        reason: scored.reason,
        signalsJson: signals as any,
        relevantIntent: intents[0],
        hotAt: scored.temperature === "HOT" ? (prevLead?.hotAt ?? new Date()) : prevLead?.hotAt,
      },
    });

    // Create hot-lead notification
    if (scored.temperature === "HOT" && prevLead && prevLead.temperature !== "HOT") {
      await tx.notification.create({
        data: {
          businessId,
          kind: "lead.hot",
          title: "مشتری داغ جدید",
          body: `یک مشتری جدید با قصد بالا در گفتگو "${activeProduct?.name ?? convo.customerUsername ?? convo.igSid}" شناسایی شد.`,
        },
      });
    }

    // Only queue the automated reply if policy allows
    if (!policy.allowed) {
      return { needsOwner: true };
    }

    const idempotencyKey = `msg_${businessId}_${convo.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await tx.message.create({
      data: {
        businessId,
        conversationId: convo.id,
        direction: "OUTBOUND",
        senderType: needsOwner ? "OWNER" : "SELLORA",
        text: replyText,
        deliveryState: "PENDING",
        idempotencyKey,
        metadataJson: { intents, entities, confidence, needsOwner, template: true },
      },
    });

    if (needsOwner) {
      await tx.notification.create({
        data: {
          businessId,
          kind: "conversation.needs_owner",
          title: "گفتگو نیاز به بررسی شما دارد",
          body: replyText.slice(0, 120),
        },
      });
    }

    return { reply: { text: replyText, idempotencyKey }, needsOwner };
  });
}

/**
 * Owner sends a manual message to a customer (after takeover).
 */
export async function sendOwnerMessage(input: {
  userId: string;
  businessId: string;
  conversationId: string;
  text: string;
}) {
  const convo = await prisma.conversation.findUnique({
    where: { id: input.conversationId },
  });
  if (!convo || convo.businessId !== input.businessId) {
    throw new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
  }
  // Lock automation
  await prisma.conversation.update({
    where: { id: convo.id },
    data: { automationLock: "HUMAN", state: "OWNER_ACTIVE" },
  });
  const idempotencyKey = `own_${convo.id}_${Date.now()}`;
  const msg = await prisma.message.create({
    data: {
      businessId: input.businessId,
      conversationId: convo.id,
      direction: "OUTBOUND",
      senderType: "OWNER",
      text: input.text,
      deliveryState: "PENDING",
      idempotencyKey,
    },
  });
  await prisma.auditLog.create({
    data: {
      businessId: input.businessId,
      actorUserId: input.userId,
      action: "conversation.owner_reply",
      targetType: "Conversation",
      targetId: convo.id,
    },
  });
  return { messageId: msg.id, idempotencyKey };
}

export async function setAutomationLock(input: {
  userId: string;
  businessId: string;
  conversationId: string;
  state: "AUTO" | "HUMAN";
}) {
  const convo = await prisma.conversation.findUnique({ where: { id: input.conversationId } });
  if (!convo || convo.businessId !== input.businessId) throw new Response("not found", { status: 404 });

  await prisma.conversation.update({
    where: { id: convo.id },
    data: {
      automationLock: input.state,
      state: input.state === "HUMAN" ? "OWNER_ACTIVE" : "ACTIVE",
    },
  });
  await prisma.auditLog.create({
    data: {
      businessId: input.businessId,
      actorUserId: input.userId,
      action: input.state === "HUMAN" ? "conversation.takeover" : "conversation.return_to_auto",
      targetType: "Conversation",
      targetId: convo.id,
    },
  });
  return { ok: true };
}
