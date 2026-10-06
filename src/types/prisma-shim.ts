// Minimal type shims for Prisma model payloads used in non-DB code.
// These are not used for database access — they just keep strict TypeScript happy
// before `prisma generate` runs (which produces the full @prisma/client types).
// Once `prisma generate` runs successfully these types are replaced by the real ones.

export interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  imageUrl: string | null;
  status: "AVAILABLE" | "UNAVAILABLE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}
export interface ProductVariantRecord {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  price: number | null;
  status: "AVAILABLE" | "UNAVAILABLE" | "ARCHIVED";
}
export interface BusinessRulesetRecord {
  id: string;
  businessId: string;
  version: number;
  isActive: boolean;
  address: string | null;
  phone: string | null;
  workingHours: Record<string, { open: string; close: string }> | null;
  shippingInfo: string | null;
  paymentMethods: string | null;
  returnPolicy: string | null;
  citiesServed: string | null;
  generalInfo: string | null;
  notes: string | null;
}
export interface ConversationRecord {
  id: string;
  businessId: string;
  igAccountId: string;
  igSid: string;
  customerName: string | null;
  customerUsername: string | null;
  state: string;
  automationLock: "AUTO" | "HUMAN";
  lastMessageAt: Date;
}
export interface InstagramAccountRecord {
  id: string;
  businessId: string;
  status: "CONNECTED" | "DEGRADED" | "REAUTH_REQUIRED" | "DISCONNECTED";
  accessToken: string;
  tokenExpiresAt: Date | null;
  pageId: string | null;
  username: string | null;
}
export interface AutomationConfigRecord {
  id: string;
  businessId: string;
  enabled: boolean;
}
