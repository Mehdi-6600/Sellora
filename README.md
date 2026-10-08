# Sellora

Sellora is the **sales and customer-service employee for an Instagram business**.
It answers repetitive customer questions on Instagram DM, qualifies leads, and
brings hot ones to the owner — without inventing prices, availability or
policies.

> “I hired an employee who answers customers, qualifies interested people and
> brings me the hot leads.”

---

## Stack

| Layer            | Technology                            |
| ---------------- | ------------------------------------- |
| Framework        | Next.js 14 (App Router, React 18)     |
| Language         | TypeScript (strict)                   |
| Database         | PostgreSQL (Neon)                     |
| ORM              | Prisma                                |
| Auth             | Signed HttpOnly JWT cookies (`jose`)  |
| Password hashing | bcryptjs                              |
| Validation       | Zod                                   |
| Styling          | Tailwind CSS, mobile-first, RTL       |
| i18n             | Persian (default), English, Arabic    |
| Queue            | Upstash QStash (optional; inline fallback) |
| AI               | Optional OpenAI fallback (disabled by default) |
| Deploy           | Vercel (`sellora-main`)               |
| Instagram        | Official Meta Graph API + Webhooks only (no scraping, no passwords) |

## Features implemented in this foundation

- **Accounts & tenancy**: multi-business workspaces, strict server-side tenant
  isolation on every query, session cookies signed via `jose`.
- **Product catalog**: CRUD, variants (size/color), status (available/unavailable/archived),
  SKU, image, price (stored in IRR; displayed as تومان), bulk paste-based import
  (`name | price | status` rows) with preview and partial success.
- **Business info**: versioned ruleset (address, phone, working hours, shipping,
  payment, returns, general info) — never fabricated.
- **Instagram OAuth**: official Meta login flow, long-lived token exchange, page
  → Instagram Business Account resolution, AES-256-GCM token encryption at rest,
  connection status (`CONNECTED` / `DEGRADED` / `REAUTH_REQUIRED` / `DISCONNECTED`).
- **Webhook endpoint** `/api/webhooks/meta`: signature verification, event
  persistence with unique idempotency key, fast ACK + asynchronous processing.
- **Conversation engine**:
  - Persian/Finglish/Arabic/English normalization (ك→ک, ي→ی, digits, kashida, ZWJ).
  - Deterministic multi-intent detection (PRICE, AVAILABILITY, VARIANT_QUERY, SHIPPING,
    DELIVERY_TIME, LOCATION, BUSINESS_HOURS, PAYMENT, RETURNS, DISCOUNT,
    ORDER_INTENT, CONTACT_REQUEST, HUMAN_REQUEST, GREETING, THANKS, UNKNOWN).
  - Entity extraction (color, size, city/number).
  - Multi-product context resolution (active product + variant) with TTL so a
    product mentioned 30 messages ago doesn't stick forever.
  - **Fresh DB read** of price/availability before sensitive answers.
- **Policy / eligibility engine** (separate from conversation engine): enforces
  owner-takeover lock (`automationLock=HUMAN`), 24-hour messaging window, token
  validity, automation enabled state, business connected state.
- **Confidence-based answering**: HIGH = answer, MEDIUM = answer what is known +
  clarify, LOW/UNKNOWN = clarify or escalate. Never invents.
- **Deterministic Persian templates** for all business questions. If a fact is
  missing from the business data, Say so explicitly and (if needed) escalate.
- **Lead engine**: deterministic score (0–100), temperature (COLD/WARM/HOT),
  reasons, signals, hot-lead notification. No random numbers. "قیمت؟" is never
  automatically HOT; explicit order/payment/capture signals are required.
- **Owner handoff**: `/api/conversations/[id]/handoff` transitions between AUTO/HUMAN;
  while `OWNER_ACTIVE`, all automation is blocked (no race with owner).
- **Message delivery states**: PENDING, SENDING, SENT, FAILED, RETRYING, EXPIRED,
  BLOCKED. Failure classification with retries for transient errors, hard stops
  on expired window / invalid token / permission denied.
- **Queue abstraction** (`lib/queue`): Upstash QStash when configured; safe
  inline fallback for dev. Every job is idempotent.
- **Rate limiting**: per-IP on auth, per-tenant aware (in-memory; easily
  replaced with Redis).
- **Audit log**: product changes, Instagram (dis)connect, automation toggles,
  owner takeover, subscription requests.
- **Pricing configuration-driven** (`lib/config/pricing.ts`): one offering, three
  durations (1w / 1m / 3m), with "بهترین ارزش" badge on the 3-month plan. No fake
  payment processing — records request in TRIAL status.
- **Mobile-first RTL UI** in Persian (English/Arabic scaffolded): dashboard,
  conversations (auto-bubbling + owner reply + takeover/return), hot leads,
  products (list + bulk import + quick availability toggle), settings, business
  info form, Instagram connect, subscription, progressive onboarding.
- **Health endpoint** `/api/health` reports DB connectivity, Meta config, QStash.
- **Observability**: request IDs via middleware, structured `AuditLog`, webhook
  persistence, `MessageDelivery` attempts. **Never logs secrets.**

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Provide environment

Copy `.env.example` to `.env.local` (or set via Vercel) and fill in:

```
SELLORA_DATABASE_URL=postgres://...    # Neon pooled string (schema.prisma reads this exact name)
NEXTAUTH_SECRET=<long random secret>
META_APP_ID=...
META_APP_SECRET=...
META_WEBHOOK_VERIFY_TOKEN=<random>
QSTASH_TOKEN=...                        # optional; for true background jobs
```

### 3. Create the database (Neon PostgreSQL required)

```bash
npx prisma migrate deploy      # production
npx prisma migrate dev         # local dev (creates & applies migrations)
```

> **Do not use SQLite / in-memory DBs.** The schema is written for Postgres
> (Neon). A `SELLORA_DATABASE_URL` pointing at a real Postgres database is
> required — `prisma generate` and `prisma migrate deploy` both read that exact
> variable name from `prisma/schema.prisma`.

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000, create an account, then visit **Settings → Business**
to fill in catalog/business info and **Settings → Instagram** to connect.

## Production on Vercel

1. Link the repo to Vercel project `sellora-main`.
2. Configure all environment variables (SELLORA_DATABASE_URL, NEXTAUTH_SECRET,
   META_APP_ID, META_APP_SECRET, META_WEBHOOK_VERIFY_TOKEN, QSTASH_TOKEN).
3. In Meta App dashboard:
   - Add the webhook URL: `https://<your-domain>/api/webhooks/meta`
   - Subscribe to `messages` (Instagram Messaging), `comments` (for future
     comment → DM flow), and `messaging_postbacks`.
   - Complete App Review for `pages_messaging`, `instagram_basic`,
     `pages_show_list`, `pages_manage_metadata`, `business_management` and request
     Advanced Access for production.
4. Run migrations (Vercel build or `npx prisma migrate deploy` locally against
   Neon DB).
5. Deploy.

## Truth hierarchy / no-AI-by-default

Every customer-facing answer uses:

1. Current database state (fresh read before sensitive answers)
2. Active business rules (versioned)
3. Current conversation context (active product/variant/city)
4. Historical snapshot (product snapshot on conversations)
5. Optional AI fallback (off by default, gated by `AI_ENABLED=true` and
   `OPENAI_API_KEY`, and used ONLY when deterministic confidence is UNKNOWN)

AI never invents price, availability, shipping cost, delivery time, hours,
address, refunds or payments. If Sellora doesn't know the answer, it asks
a clarification question or escalates to the owner.

## Project structure

```
src/
  app/
    (auth)/login|signup/        — Email/password auth screens
    (app)/                       — Protected shell (mobile-first + bottom nav)
      dashboard/
      conversations/
      leads/
      products/ (+ import)
      settings/ (business/instagram/subscription)
      onboarding/
    api/
      auth/[...route]            — Login / signup / logout
      webhooks/meta              — Meta webhooks (GET verify, POST ingest)
      webhooks/qstash            — Background job consumer
      products/                  — Catalog CRUD + import
      rules/                     — Business info (versioned)
      conversations/             — Conversation list / detail / messages / handoff
      leads/
      subscription/
      instagram/(connect|callback|status|disconnect)
      business/switch
      health
  components/
    layout/   (AppShell, BottomNav, RequireAuth)
    ui/       (Button, Card, Input, Badge, Empty, Toaster)
  lib/
    auth/session.ts              — JWT sessions, requireAuth, tenant assertion
    db/prisma.ts                 — Prisma singleton
    security/                    — crypto (AES-GCM), rate-limit
    meta/                        — Graph API client, signature verify, config
    conversation/                — normalize, intents, entities, resolve product,
                                   responses templates, service
    leads/scoring.ts             — Deterministic lead scoring
    policy/engine.ts             — Eligibility policy (messaging window, lock, …)
    queue/index.ts               — QStash + inline job processing
    products/importer.ts         — Paste-based catalog importer
    config/pricing.ts            — Single source of truth for subscription prices
    i18n/                        — fa / en / ar dictionaries + locale resolver
    utils/                       — format (toman, persian digits, dates), slug, cx
  types/
prisma/schema.prisma              — Full multi-tenant Postgres schema
```

## Security

- Strict tenant isolation enforced server-side via `requireAuth()` +
  `BusinessId` filter on every query. Client-supplied `businessId` is ignored.
- Passwords hashed with bcrypt (cost 12).
- Session cookie HttpOnly, Secure in prod, SameSite=Lax, signed via HS256 JWT.
- Webhook signature verified via `X-Hub-Signature-256` (HMAC-SHA256) with timing-safe comparison.
- Instagram access tokens encrypted at rest (`aes-256-gcm`) using DATA_ENCRYPTION_KEY (or NEXTAUTH_SECRET-derived key).
- No secrets exposed client-side; no Instagram passwords stored.
- Rate limiting on auth endpoints; per-tenant guardrails ready.
- Zod validation on all API inputs; safe error messages to clients
  (no stack traces, no Prisma errors surfaced verbatim).

## What is *not* claimed

- **Production Meta access** requires completing Meta App Review and Advanced
  Access for the relevant permissions; the code is written to the official
  current API shape but approval is an external Meta step.
- **Payments** are not integrated per spec §37/§53; subscription selection
  records a TRIAL/requested subscription, it does **not** fake successful payment.
- **A full distributed queue** is provided via Upstash QStash when configured;
  without QStASH_TOKEN jobs run inline (safe for single-instance, not
  horizontally scaled).
- **AI fallback** is scaffolded but disabled by default and intentionally kept
  behind a strict allow-list / confidence gate; no hallucinated facts are
  permitted.
