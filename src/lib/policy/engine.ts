// Policy / eligibility engine — determines whether Sellora is ALLOWED to respond
// or act at a given moment. This is separate from the conversation engine (which
// decides what the customer means).

import type {
  ConversationRecord,
  InstagramAccountRecord,
  AutomationConfigRecord,
} from "@/types/prisma-shim";

type Conversation = ConversationRecord;
type InstagramAccount = InstagramAccountRecord;
type AutomationConfig = AutomationConfigRecord;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _META_REF = { META_API_VERSION: process.env.META_API_VERSION || "v21.0" };

export type PolicyDecision = {
  allowed: boolean;
  reason?:
    | "AUTOMATION_DISABLED"
    | "OWNER_ACTIVE"
    | "MESSAGING_WINDOW_EXPIRED"
    | "TOKEN_INVALID"
    | "PERMISSION_MISSING"
    | "BUSINESS_NOT_CONNECTED"
    | "PRODUCT_NOT_FOUND"
    | "BUSINESS_CLOSED"
    | "RATE_LIMITED"
    | "UNKNOWN";
};

/**
 * Instagram Messaging windows (Meta Platforms v21.x):
 * A business can send free-form messages within 24h of the last customer message.
 * After the 24h window, only specific tags are allowed (post-purchase, etc.) which
 * we do not support in MVP. So we block after 24h.
 */
const MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000;

export function canSendAutomatedReply(input: {
  conversation: Pick<Conversation, "automationLock" | "lastMessageAt" | "state">;
  direction: "INBOUND" | "OUTBOUND";
  igAccount?: Pick<InstagramAccount, "status" | "tokenExpiresAt"> | null;
  automation?: Pick<AutomationConfig, "enabled"> | null;
  now?: Date;
}): PolicyDecision {
  const now = input.now ?? new Date();

  if (input.conversation.automationLock === "HUMAN") {
    return { allowed: false, reason: "OWNER_ACTIVE" };
  }
  if (!input.automation?.enabled) {
    return { allowed: false, reason: "AUTOMATION_DISABLED" };
  }
  if (!input.igAccount || input.igAccount.status !== "CONNECTED") {
    return { allowed: false, reason: "BUSINESS_NOT_CONNECTED" };
  }
  if (input.igAccount.tokenExpiresAt && input.igAccount.tokenExpiresAt.getTime() < now.getTime()) {
    return { allowed: false, reason: "TOKEN_INVALID" };
  }

  const lastMessageAt = new Date(input.conversation.lastMessageAt).getTime();
  if (now.getTime() - lastMessageAt > MESSAGING_WINDOW_MS) {
    return { allowed: false, reason: "MESSAGING_WINDOW_EXPIRED" };
  }

  return { allowed: true };
}

export function policyReasonToPersian(reason: PolicyDecision["reason"]): string {
  switch (reason) {
    case "OWNER_ACTIVE":
      return "صاحب فروشگاه در حال پاسخ‌گویی است و پیام خودکار ارسال نشد.";
    case "AUTOMATION_DISABLED":
      return "پاسخ‌گویی خودکار برای این فروشگاه غیرفعال است.";
    case "BUSINESS_NOT_CONNECTED":
      return "حساب اینستاگرام فروشگاه متصل نیست.";
    case "TOKEN_INVALID":
      return "دسترسی اینستاگرام منقضی شده است. نیاز به ورود مجدد.";
    case "MESSAGING_WINDOW_EXPIRED":
      return "پنجره پاسخ‌دهی ۲۴ ساعته این گفتگو بسته شده است.";
    case "RATE_LIMITED":
      return "به دلیل محدودیت نرخ ارسال، پیام در صف قرار گرفت.";
    default:
      return "ارسال پیام در حال حاضر مجاز نیست.";
  }
}
