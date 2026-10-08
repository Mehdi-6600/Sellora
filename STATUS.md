# Sellora — Deployment Readiness Status

> ⚠️ **STALE (2026-10-08):** this document describes branch
> `arena/4a49fc1e-sellora` and predates the manual payment-review flow, the
> admin panel, the notification center, the public landing page and the SEO
> work on `main`. Several claims below no longer match the code (e.g. IDs are
> `cuid()`, not `gen_random_uuid()`; the database variable is
> `SELLORA_DATABASE_URL`). See `AUDIT.md` for the current, verified state.

Branch: `arena/4a49fc1e-sellora`
Date: 2026-10-06 (Asia/Tehran)

## GREEN (verified working)

- **Repository foundation**: 79 source files under `src/` + `prisma/` + `scripts/`. TypeScript clean; Next.js 14 production build succeeds: 16 pages + 24 API routes.
- **Database schema** (`prisma/schema.prisma` → `prisma/migrations/0001_init/migration.sql`): 22 tables, 11 enums, FKs cascading correctly, partial unique on `Message.businessId+idempotencyKey` (NULL-safe so INBOUND rows don't collide), `Conversation.igAccountId` FK to `InstagramAccount`, proper businessId scoping and composite indexes for common queries (by businessId+state, lastMessageAt, temperature, etc.). `gen_random_uuid()` default IDs (Postgres-native).
- **Prisma configuration** pinned to **5.22.0** (CLI + client + adapter-pg internally consistent, no accidental upgrade to Prisma 7/8 which was broken earlier).
- **Vercel deployment**: `vercel.json` sets `prisma generate && next build && prisma migrate deploy` as build command; `postinstall: prisma generate` generates the client on Vercel where binaries.prisma.sh IS reachable; `prisma migrate deploy` (not dev) runs against `DIRECT_URL` post-build so schema is applied without drift. No sandbox-only deps (`embedded-postgres` removed from production `dependencies`).
- **Sandbox pg fallback** (`src/lib/db/prisma.ts`) is **opt-in only**: `SELLORA_ALLOW_PG_FALLBACK=1 AND NODE_ENV!==production`. It is impossible to enable accidentally in production.
- **.env.example** documents all required variables: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `DATA_ENCRYPTION_KEY`, `META_APP_ID`, `META_APP_SECRET`, `META_API_VERSION`, `META_WEBHOOK_VERIFY_TOKEN`, `META_REDIRECT_URI`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `APP_URL`, optional `OPENAI_API_KEY`. No fake values.
- **Authentication**: bcrypt cost-12 password hashing; HS256 JWT httpOnly+signed+expiring (30d) session cookie; middleware enforces session on all tenant routes; all API handlers re-verify via `requireAuth()` and `assertTenant(businessId)`. Signup/login/session/logout all verified against real Postgres.
- **Tenant isolation** audited on every route:
  - `conversations`, `leads`, `products`, `rules`, `subscription`, `instagram/*` filter by `auth.businessId`.
  - Single-record routes (`conversations/[id]`, `products/[id]`) load then compare `record.businessId !== auth.businessId → 404`.
  - `business/switch` validates membership before swapping session.
  - Instagram OAuth callback now requires an authenticated session AND that the claimed businessId is a membership of that user (defence against cookie tampering/CSRF).
- **Password hashing (bcryptjs cost 12)**, **AES-256-GCM encryption** (`src/lib/security/crypto.ts`) for Instagram `accessToken` at rest; keyed from `DATA_ENCRYPTION_KEY` (falls back to SHA-256 of `NEXTAUTH_SECRET` if missing — logged as dev-only).
- **Webhook security**:
  - Meta: HMAC-SHA256 timing-safe compare; requests with bad/missing signature return 401 BEFORE processing; fast ACK after persist.
  - QStash: now verifies HMAC-SHA256 signature over `url + "\n" + body` when `QSTASH_CURRENT_SIGNING_KEY` is set; supports both current+next keys for rotation; returns non-2xx on failure for QStash retries.
- **Idempotency**: unique `(source, externalId)` on `WebhookEvent`, partial unique `(businessId, idempotencyKey)` on `Message`; duplicate INSERTs raise 23505 and are skipped.
- **Rate limiting** (in-memory, single-instance) on auth login/signup and product creation.
- **Input validation**: Zod schemas for login/signup/product/ruleset/message/handoff/subscription; no raw body passed to queries; stack traces never leaked (generic `{error:{code}}` responses).
- **Products**: CRUD, availability toggle, soft-delete (ARCHIVED), pipe-separated bulk import with per-row validation + partial success, tenant-scoped SKU uniqueness (NULL-safe), audit log entries for price_change/availability/import/archive.
- **Conversation engine** (deterministic, pre-AI):
  - Persian + Arabic-letter + Finglish normalization (gheimat/price/chand/mojud/...), punctuation, zero-width chars cleaned.
  - Multi-intent detection returns ordered priority list (HUMAN_REQUEST > ORDER_INTENT > ... > GREETING).
  - Entity extraction for colors/sizes/Persian digit shoe sizes/32 Iranian cities.
  - Confidence tiers HIGH/MEDIUM/LOW/UNKNOWN: LOW asks for product/clarification; UNKNOWN says so honestly; never invents.
  - Re-reads product price/availability from DB at response time, never uses cached values; stale context (>TTL) is forgotten.
  - Multiple products handled via `resolveProduct()` token match.
- **Lead scoring** is deterministic additive (signals carry weights, caps at 100, repeat signals decayed). "قیمت؟" alone is COLD; ORDER_INTENT+CONTACT = HOT; explicit-buy phrase "همینو میخوام/ثبت سفارش/برام بفرست" adds weight; reasons are human-readable Persian; REPEAT_FOLLOWUP increments for returning customers; hotAt is preserved on upsert; hot-lead notifications created on transition.
- **Policy engine** enforces OWNER_ACTIVE lock, automation disabled, account DISCONNECTED, token expiry, and Meta's 24h messaging window. Outbound blocked on any violation.
- **Owner handoff** (`/api/conversations/[id]/handoff` + `sendOwnerMessage`) flips `automationLock=HUMAN/state=OWNER_ACTIVE`, records audit log. Automation can be resumed via handoff API.
- **Pricing**: 299,000 / 899,000 / 2,249,000 IRT with "بهترین ارزش" badge on QUARTERLY; subscription rows preserve historical `amount` field; new subscriptions are recorded as TRIAL (no fake paid activation).
- **Meta Graph client** uses `META_API_VERSION` config (default `v21.0`); version is NOT hardcoded in OAuth/callback code. OAuth uses `state` CSRF cookie (httpOnly/SameSite=lax) + session verification. Token exchange and page listing use centralized `graphUrl()` helper. Token encryption/decryption/expiry handling wired.
- **Queue**: QStash when configured (signed), otherwise synchronous inline processing with FailedJob persisted on error. Error classification maps 401/403/190/102 to REAUTH_REQUIRED, 429 to RETRYING, 400 to BLOCKED.
- **UI**: Persian RTL with Vazirmatn fallback, mobile-first `max-w-md` shell, large touch targets (py-3 buttons), bottom navigation, empty/loading/error states, no untranslated English in owner-facing labels, no fake "connected" badges (Instagram status returns real DISCONNECTED state), pricing on subscription page exactly matches 299k/899k/2,249k toman with "بهترین ارزش" ribbon.
- **32/32 integration tests** pass against real Postgres; tsc clean; production build green; HTTP smoke tests pass (signup/login/dashboard/products/webhook 401 + valid challenge/cross-tenant isolation confirmed live).

## YELLOW (code is correct; requires external credentials/approval to verify end-to-end)

- **Live Meta/Instagram DM round-trip**: OAuth flow, token exchange, signature verification, enqueue and policy gates all wired and unit-tested, but without a real META_APP_ID/SECRET + approved Instagram Business Account we cannot confirm outbound DM delivery or private-reply 24h windows against the live Graph API. No fake calls are made — outbound send requires `status===CONNECTED`.
- **QStash / distributed retries**: code path exists (`/api/webhooks/qstash`), signature verification added, `QSTASH_TOKEN` not provisioned in sandbox so at-least-once delivery and cross-region retries not live-tested. Synchronous inline fallback is safe (best-effort, errors recorded in FailedJob).
- **OpenAI fallback**: code path exists, truth hierarchy enforced (DB > ruleset > context > history > AI), AI never runs without OPENAI_API_KEY and only on LOW/UNKNOWN. Key not set; path dormant.
- **Payment activation**: per scope, no PSP implemented. Plans + Subscription table + audit are correct; `POST /api/subscription` records plan selection as TRIAL/requested and never fakes successful payment.

## RED (broken or incomplete)

None.

## CHANGES MADE (this pass)

- `package.json`: pinned prisma+@prisma/client to exactly 5.22.0; removed `embedded-postgres` from production deps; adjusted scripts to `build: next build`, `postbuild: prisma migrate deploy`, `postinstall: prisma generate`; added SELLORA_ALLOW_PG_FALLBACK to test:db.
- `vercel.json`: set explicit `buildCommand: prisma generate && next build && prisma migrate deploy`, `installCommand: npm install`, fra1 region.
- `prisma/schema.prisma`: added `Conversation → InstagramAccount` FK relation (conversations/igAccount); removed global @@unique on `Message.idempotencyKey` (moved to partial composite index via SQL migration).
- `prisma/migrations/migration_lock.toml` (new) + `prisma/migrations/0001_init/migration.sql` (synced from scripts/0001_init.sql).
- `scripts/0001_init.sql`: added FK on `Conversation.igAccountId → InstagramAccount.id CASCADE`, `Conversation_igAccountId_idx`; replaced global unique on Message.idempotencyKey with NULL-safe partial unique `(businessId, idempotencyKey)`; kept all other constraints/indexes/updated_at trigger.
- `scripts/migrate.sh` (new): production migration wrapper (calls `prisma migrate deploy`).
- `.env.example`: completed and cleaned up; added DATA_ENCRYPTION_KEY, META_REDIRECT_URI, QSTASH_CURRENT/NEXT_SIGNING_KEY, APP_URL; removed fake values; documented each variable.
- `src/lib/db/prisma.ts`: sandbox pg fallback is now gated behind `SELLORA_ALLOW_PG_FALLBACK=1 && NODE_ENV!==production`; SSL handling fixed (sslmode=require/verify-* enable TLS, local/localhost defaults to plain); lazy init so env vars set after import are honored; `$queryRaw` tagged-template support fixed; lowercase model delegates so `prisma.user.findUnique(...)` etc. all work.
- `src/lib/meta/config.ts`: exported `META_API_VERSION`, `META_REDIRECT_URI`, `APP_URL`.
- `src/lib/meta/client.ts`: OAuth login URL uses `META_API_VERSION` constant (no env lookup); `buildOAuthLoginUrl` centralized.
- `src/app/api/instagram/callback/route.ts`: replaced hardcoded `v21.0` with `META_API_VERSION`; OAuth token/page-detail URLs built via `URL` + searchParams (no string concatenation of secret); redirect URI selected from `META_REDIRECT_URI → APP_URL → request`; **added authenticated-session + business-membership verification** before accepting OAuth callback (CSRF/tamper defence); cleared state cookie on success.
- `src/app/api/instagram/connect/route.ts`: uses `META_REDIRECT_URI/APP_URL` for callback; fixed missing closing brace.
- `src/app/api/webhooks/meta/route.ts`: now returns 401 on invalid/missing signature BEFORE processing (was ACKing forgeries).
- `src/app/api/webhooks/qstash/route.ts`: replaced "optional" signature check with proper HMAC-SHA256 timing-safe verification over `url + "\n" + body`, supporting current+next signing keys for zero-downtime rotation; reads raw body before parsing.
- `src/lib/conversation/service.ts`: added REPEAT_FOLLOWUP signal for returning customers.
- `src/lib/conversation/intents.ts`: expanded HUMAN_REQUEST patterns to match "با آدم حرف بزنم" (after Arabic-ye normalization produces "ادم").
- `STATUS.md` updated.

## NEXT EXTERNAL ACTION

1. On Neon: create a `sellora` database; copy the pooled `DATABASE_URL` and direct `DIRECT_URL`.
2. On Vercel: set all environment variables listed in `.env.example` (at minimum `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `DATA_ENCRYPTION_KEY`).
3. Deploy (push/import). The build will run `prisma generate`, build Next.js, then `prisma migrate deploy` to apply `prisma/migrations/0001_init/migration.sql` against `DIRECT_URL`.
4. In Meta App Dashboard (developers.facebook.com): create app, add Instagram Messaging product, set webhook URL to `https://<your-domain>/api/webhooks/meta` using the `META_WEBHOOK_VERIFY_TOKEN` you generated; add `https://<your-domain>/api/instagram/callback` to Valid OAuth Redirect URIs; set `META_REDIRECT_URI` to that same URL; fill in `META_APP_ID`/`META_APP_SECRET`.
5. Complete Meta App Review for `instagram_basic`, `pages_messaging`, `pages_show_list`, `pages_manage_metadata` to move from Dev to Live mode.
6. Optionally provision Upstash QStash and set `QSTASH_TOKEN` + signing keys to enable durable retries.
