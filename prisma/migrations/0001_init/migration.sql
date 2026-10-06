-- Sellora initial schema — manually translated from prisma/schema.prisma.
-- Run against a real Postgres database. This matches the Prisma schema exactly so
-- that `prisma migrate deploy` can pick up against the same DB.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Enums ----------
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InstagramConnectionStatus" AS ENUM ('CONNECTED', 'DEGRADED', 'REAUTH_REQUIRED', 'DISCONNECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ConversationState" AS ENUM ('NEW', 'ACTIVE', 'WAITING_CUSTOMER', 'WAITING_OWNER', 'OWNER_ACTIVE', 'QUALIFIED', 'COMPLETED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AutomationLock" AS ENUM ('AUTO', 'HUMAN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MessageSenderType" AS ENUM ('CUSTOMER', 'SELLORA', 'OWNER', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DeliveryState" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED', 'RETRYING', 'EXPIRED', 'BLOCKED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LeadTemperature" AS ENUM ('COLD', 'WARM', 'HOT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionPlan" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Tables ----------
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  "passwordHash" TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'fa',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);

CREATE TABLE IF NOT EXISTS "Business" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  locale TEXT NOT NULL DEFAULT 'fa',
  currency TEXT NOT NULL DEFAULT 'IRR',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "BusinessMember" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  role "UserRole" NOT NULL DEFAULT 'OWNER',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("businessId", "userId")
);
CREATE INDEX IF NOT EXISTS "BusinessMember_businessId_idx" ON "BusinessMember"("businessId");
CREATE INDEX IF NOT EXISTS "BusinessMember_userId_idx" ON "BusinessMember"("userId");

CREATE TABLE IF NOT EXISTS "InstagramAccount" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT UNIQUE NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "instagramBusinessAccountId" TEXT UNIQUE NOT NULL,
  "pageId" TEXT,
  username TEXT,
  name TEXT,
  "profilePicUrl" TEXT,
  "accessToken" TEXT NOT NULL,
  "tokenExpiresAt" TIMESTAMPTZ,
  status "InstagramConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED',
  "lastVerifiedAt" TIMESTAMPTZ,
  scope TEXT,
  "metaAppId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "InstagramAccount_status_idx" ON "InstagramAccount"(status);

CREATE TABLE IF NOT EXISTS "InstagramPost" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "igAccountId" TEXT NOT NULL REFERENCES "InstagramAccount"(id) ON DELETE CASCADE,
  "igMediaId" TEXT UNIQUE NOT NULL,
  "mediaType" TEXT,
  permalink TEXT,
  caption TEXT,
  "thumbnailUrl" TEXT,
  "mediaUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "InstagramPost_businessId_idx" ON "InstagramPost"("businessId");

CREATE TABLE IF NOT EXISTS "Product" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  price INTEGER NOT NULL,
  "imageUrl" TEXT,
  status "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("businessId", sku)
);
CREATE INDEX IF NOT EXISTS "Product_businessId_status_idx" ON "Product"("businessId", status);
CREATE INDEX IF NOT EXISTS "Product_businessId_name_idx" ON "Product"("businessId", name);

CREATE TABLE IF NOT EXISTS "ProductVariant" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  sku TEXT,
  price INTEGER,
  status "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("businessId", sku)
);
CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX IF NOT EXISTS "ProductVariant_businessId_status_idx" ON "ProductVariant"("businessId", status);

CREATE TABLE IF NOT EXISTS "BusinessRuleset" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  address TEXT,
  phone TEXT,
  "workingHours" JSONB,
  "shippingInfo" TEXT,
  "paymentMethods" TEXT,
  "returnPolicy" TEXT,
  "citiesServed" TEXT,
  "generalInfo" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "BusinessRuleset_businessId_isActive_idx" ON "BusinessRuleset"("businessId", "isActive");

CREATE TABLE IF NOT EXISTS "BusinessRule" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("businessId", key)
);
CREATE INDEX IF NOT EXISTS "BusinessRule_businessId_idx" ON "BusinessRule"("businessId");

CREATE TABLE IF NOT EXISTS "AutomationConfig" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT UNIQUE NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  "autoReplyComments" BOOLEAN NOT NULL DEFAULT false,
  "defaultTone" TEXT NOT NULL DEFAULT 'friendly',
  "useAiFallback" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Conversation" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "igAccountId" TEXT NOT NULL REFERENCES "InstagramAccount"(id) ON DELETE CASCADE,
  "igSid" TEXT NOT NULL,
  "customerName" TEXT,
  "customerUsername" TEXT,
  "customerProfilePic" TEXT,
  "postId" TEXT,
  state "ConversationState" NOT NULL DEFAULT 'NEW',
  "automationLock" "AutomationLock" NOT NULL DEFAULT 'AUTO',
  "lastMessageAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "contextExpiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("businessId", "igAccountId", "igSid")
);
CREATE INDEX IF NOT EXISTS "Conversation_businessId_state_idx" ON "Conversation"("businessId", state);
CREATE INDEX IF NOT EXISTS "Conversation_businessId_lastMessageAt_idx" ON "Conversation"("businessId", "lastMessageAt");
CREATE INDEX IF NOT EXISTS "Conversation_businessId_automationLock_idx" ON "Conversation"("businessId", "automationLock");
CREATE INDEX IF NOT EXISTS "Conversation_igAccountId_idx" ON "Conversation"("igAccountId");

CREATE TABLE IF NOT EXISTS "ConversationContext" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "conversationId" TEXT UNIQUE NOT NULL REFERENCES "Conversation"(id) ON DELETE CASCADE,
  "activeProductId" TEXT REFERENCES "Product"(id),
  "activeVariantId" TEXT REFERENCES "ProductVariant"(id),
  "activeIntent" TEXT,
  city TEXT,
  "customerContact" TEXT,
  "entitiesJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "lastProductMentionedAt" TIMESTAMPTZ,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Message" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "conversationId" TEXT NOT NULL REFERENCES "Conversation"(id) ON DELETE CASCADE,
  "igMessageId" TEXT,
  direction "MessageDirection" NOT NULL,
  "senderType" "MessageSenderType" NOT NULL,
  text TEXT NOT NULL,
  "metadataJson" JSONB,
  "deliveryState" "DeliveryState" NOT NULL DEFAULT 'PENDING',
  "failureReason" TEXT,
  "deliveredAt" TIMESTAMPTZ,
  "seenAt" TIMESTAMPTZ,
  "idempotencyKey" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "Message_businessId_idempotencyKey_key" ON "Message"("businessId","idempotencyKey") WHERE "idempotencyKey" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "Message_businessId_createdAt_idx" ON "Message"("businessId", "createdAt");
CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX IF NOT EXISTS "Message_deliveryState_idx" ON "Message"("deliveryState");

CREATE TABLE IF NOT EXISTS "MessageDelivery" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "messageId" TEXT NOT NULL REFERENCES "Message"(id) ON DELETE CASCADE,
  attempt INTEGER NOT NULL DEFAULT 0,
  "requestMeta" JSONB,
  "responseMeta" JSONB,
  "deliveryState" "DeliveryState" NOT NULL,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "attemptedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "MessageDelivery_messageId_idx" ON "MessageDelivery"("messageId");

CREATE TABLE IF NOT EXISTS "Lead" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "conversationId" TEXT UNIQUE NOT NULL REFERENCES "Conversation"(id) ON DELETE CASCADE,
  temperature "LeadTemperature" NOT NULL DEFAULT 'COLD',
  score INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  "signalsJson" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "relevantIntent" TEXT,
  "contactName" TEXT,
  "contactPhone" TEXT,
  "contactCity" TEXT,
  "capturedContact" BOOLEAN NOT NULL DEFAULT false,
  "hotAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Lead_businessId_temperature_idx" ON "Lead"("businessId", temperature);
CREATE INDEX IF NOT EXISTS "Lead_businessId_score_idx" ON "Lead"("businessId", score);
CREATE INDEX IF NOT EXISTS "Lead_businessId_createdAt_idx" ON "Lead"("businessId", "createdAt");

CREATE TABLE IF NOT EXISTS "WebhookEvent" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT REFERENCES "Business"(id),
  source TEXT NOT NULL DEFAULT 'meta',
  "externalId" TEXT,
  "eventType" TEXT NOT NULL,
  "signatureOk" BOOLEAN NOT NULL DEFAULT false,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  "processingError" TEXT,
  "receivedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "processedAt" TIMESTAMPTZ,
  UNIQUE(source, "externalId")
);
CREATE INDEX IF NOT EXISTS "WebhookEvent_processed_idx" ON "WebhookEvent"(processed);
CREATE INDEX IF NOT EXISTS "WebhookEvent_receivedAt_idx" ON "WebhookEvent"("receivedAt");

CREATE TABLE IF NOT EXISTS "FailedJob" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT REFERENCES "Business"(id),
  "jobType" TEXT NOT NULL,
  payload JSONB NOT NULL,
  error TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  "lastErrorAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "FailedJob_jobType_idx" ON "FailedJob"("jobType");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "actorUserId" TEXT,
  action TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  "metaJson" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "AuditLog_businessId_createdAt_idx" ON "AuditLog"("businessId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"(action);

CREATE TABLE IF NOT EXISTS "Subscription" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT UNIQUE NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  plan "SubscriptionPlan" NOT NULL,
  status "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IRT',
  "startsAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "endsAt" TIMESTAMPTZ,
  "refId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "UsageSnapshot" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  inbound INTEGER NOT NULL DEFAULT 0,
  outbound INTEGER NOT NULL DEFAULT 0,
  "resolvedAuto" INTEGER NOT NULL DEFAULT 0,
  "hotLeads" INTEGER NOT NULL DEFAULT 0,
  "ownerTakeovers" INTEGER NOT NULL DEFAULT 0,
  UNIQUE("businessId", date)
);

CREATE TABLE IF NOT EXISTS "Notification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  "readAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Notification_businessId_readAt_idx" ON "Notification"("businessId", "readAt");

-- ---------- UpdatedAt trigger ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT '"' || tablename || '"' FROM pg_tables WHERE schemaname='public' AND tablename IN
      ('User','Business','BusinessMember','InstagramAccount','InstagramPost','Product','ProductVariant',
       'BusinessRule','AutomationConfig','Conversation','ConversationContext','Message','Lead',
       'Subscription','Notification')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %s;', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t);
  END LOOP;
END $$;

-- Mark migration as applied (for prisma migrate baseline)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  id VARCHAR(36) PRIMARY KEY,
  checksum VARCHAR(64) NOT NULL,
  finished_at TIMESTAMPTZ,
  migration_name VARCHAR(255) NOT NULL,
  logs TEXT,
  rolled_back_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_steps_count INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, applied_steps_count)
VALUES (
  '0001_init',
  'manual-seed',
  now(),
  '0001_init',
  NULL,
  1
) ON CONFLICT DO NOTHING;
