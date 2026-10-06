-- Migration 0002: Manual payment review for Subscription
-- Adds isAdmin to User, PaymentReviewStatus enum, and review fields to Subscription.

-- 1. Add isAdmin to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- 2. Create PaymentReviewStatus enum
DO $$ BEGIN
  CREATE TYPE "PaymentReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Add payment-review fields to Subscription
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentReviewStatus";
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "trackingCode" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMPTZ;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMPTZ;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- 4. Indexes for admin queries
CREATE INDEX IF NOT EXISTS "Subscription_paymentStatus_idx" ON "Subscription"("paymentStatus");
CREATE INDEX IF NOT EXISTS "Subscription_trackingCode_idx" ON "Subscription"("trackingCode");
