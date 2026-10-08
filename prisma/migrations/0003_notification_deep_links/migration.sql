-- Migration 0003: notification deep links + efficient newest-first listing.
--
-- Additive only. Existing Notification rows keep working: href is nullable and
-- the UI falls back to a kind-based default target when it is absent.

-- 1. Optional deep-link target ("/conversations/<id>", "/settings/subscription/status", ...)
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "href" TEXT;

-- 2. Index for the notification center's newest-first listing.
--    The pre-existing (businessId, readAt) index serves unread counts; this one
--    serves `WHERE businessId = $1 ORDER BY createdAt DESC LIMIT n`.
CREATE INDEX IF NOT EXISTS "Notification_businessId_createdAt_idx"
  ON "Notification"("businessId", "createdAt" DESC);
