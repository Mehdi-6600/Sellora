-- Migration 0004: stop the broken updatedAt trigger on "Notification".
--
-- Migration 0001 attaches the generic set_updated_at() BEFORE UPDATE trigger to
-- every table in its list, including "Notification". That function writes
-- NEW."updatedAt", but the Notification model has no updatedAt column (see
-- prisma/schema.prisma). Every UPDATE on "Notification" therefore fails with
--   record "new" has no field "updatedAt"
-- so mark-as-read and mark-all-read never persisted and the unread badge never
-- cleared.
--
-- Corrective and additive only: this drops the trigger. No column, data, index
-- or Prisma model changes. Existing migrations are left untouched.

DROP TRIGGER IF EXISTS set_updated_at ON "Notification";
