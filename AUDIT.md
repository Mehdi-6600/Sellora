# Sellora — Production Readiness Audit (Phase 0)

Date: 2026-10-08 (Asia/Tehran) · Branch: `arena/5a3320a9-sellora` · Base: `8bf380f` (origin/main)

This audit was produced by **reading the repository**, not by trusting `STATUS.md` or any
previous report. `STATUS.md` describes branch `arena/4a49fc1e-sellora` and is **stale**: main
has moved well past it (manual card-to-card payment review, admin panel, subscription status
pages). Where `STATUS.md` and the code disagree, the code wins and the disagreement is listed.

Baseline verified in sandbox before any change:

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | **PASS** (0 errors) |
| Production build | `npx next build` | **PASS** (44 routes, 26.8 kB middleware, 87.1 kB shared First Load JS) |
| Lint | `next lint` (run inside build) | **PASS** with 9 warnings (unused vars / prefer-const) |
| Prisma client | `npx prisma generate` | **BLOCKED in sandbox** — `binaries.prisma.sh` is not reachable. Not a repo defect; Vercel can reach it. |
| DB-backed tests | `npm run test:db` | **NOT RUN** — no reachable Postgres from sandbox |
| Live production site | `https://sellora-navy-one.vercel.app` | **NOT REACHABLE** from sandbox (egress allowlist) — runtime behaviour verified by code reading only |

---

## GREEN — already correct, do not touch

- **Tenant isolation in data access.** Every tenant-scoped route derives `businessId` from
  `requireAuth()` (which re-verifies `BusinessMember` on each request), never from the request
  body. Single-record routes (`products/[id]`, `conversations/[id]`,
  `conversations/[id]/*`) load-then-compare and return `404` (not `403`) on mismatch, which
  avoids leaking existence. `sendOwnerMessage()` and `setAutomationLock()` in
  `src/lib/conversation/service.ts` both re-check `convo.businessId !== input.businessId`.
- **Admin gating.** All three `/api/admin/subscriptions*` routes and the admin page check
  `auth.user.isAdmin`. No admin route trusts a client-supplied role.
- **Business switch.** `/api/business/switch` validates membership before swapping the session.
- **Session design.** HS256 JWT via `jose`, `httpOnly` + `SameSite=lax` + `secure` in
  production, 30-day expiry, issuer pinned and verified. No token in `localStorage`.
- **Password hashing.** `bcryptjs` cost 12. No plaintext anywhere.
- **Token-at-rest encryption.** AES-256-GCM with a versioned `v1.iv.tag.ct` format
  (`src/lib/security/crypto.ts`).
- **Meta webhook signature.** `X-Hub-Signature-256` verified with `crypto.timingSafeEqual`
  over the **raw** body, before parsing; multi-secret rotation supported.
- **Idempotency.** `@@unique([source, externalId])` on `WebhookEvent`, `P2002` handled as
  "already seen", per-message `idempotencyKey`.
- **Policy engine.** `canSendAutomatedReply()` enforces `OWNER_ACTIVE`, automation-disabled,
  `DISCONNECTED`, token expiry and Meta's 24 h messaging window — and outbound is only queued
  when it returns `allowed`.
- **Conversation engine.** Deterministic, re-reads price/availability from the DB at answer
  time, has confidence tiers and refuses to invent. Persian/Finglish/Arabic normalisation.
- **Migration hygiene.** `0001_init` + `0002_add_manual_payment_review`; 0002 is written with
  `IF NOT EXISTS` / `DO $$ … duplicate_object` guards so it is re-runnable and non-destructive.
- **Payment honesty (server-side).** `POST /api/subscription` records `TRIAL`, never `ACTIVE`.
  Activation only happens in the admin approve route.
- **Pricing single source of truth.** `src/lib/config/pricing.ts` — plan prices are not
  hardcoded in components (see RED-4 for the one exception, in the dictionary).

---

## RED — broken, unsafe, or missing

**RED-1 · `.env.local` is committed to a public repository.**
`git ls-files` shows `.env.local` is tracked. It contains a live Neon endpoint hostname and
role name (`npg_…@ep-silent-dust-…neon.tech`). `.gitignore` already lists `.env.local`, but
ignore rules do not apply to already-tracked files. → untrack it.

**RED-2 · Session signing key fails *open* in production.**
`getSecretKey()` falls back to the literal `"sellora-dev-secret-change-me-please"` when
`NEXTAUTH_SECRET` is unset. If that env var is ever missing on Vercel, **anyone can forge a
session cookie for any user and any tenant**. Same class of bug in `crypto.ts`
(hardcoded `"sellora-dev-key-not-for-production-change-me"`). → must fail closed in production.

**RED-3 · Unauthenticated webhook endpoints fail *open*.**
- `verifyWebhookSignature()` returns `true` when no app secret is configured
  ("Dev fallback… accept webhook without verification"). `META_APP_SECRET` is intentionally
  unconfigured today, so `/api/webhooks/meta` currently accepts **unsigned** POSTs.
- `verifyQstashSignature()` returns `true` when no signing keys are configured, so
  `/api/webhooks/qstash` is a public endpoint that will execute `send.message` jobs for
  arbitrary `messageId`s and mutate `Message.deliveryState` / `InstagramAccount.status`
  across tenants. This is the most serious unauthenticated mutation path in the codebase.
- `GET /api/webhooks/meta` echoes `hub.challenge` when `META_WEBHOOK_VERIFY_TOKEN` is empty and
  the caller sends an empty token.

**RED-4 · `/api/health` leaks internals, unauthenticated.**
Returns `dbError: e.message` — raw Postgres/Prisma error text (can contain host, role,
constraint and query details) to any anonymous caller.

**RED-5 · The toast system is a silent no-op.**
`Toaster` renders `<ToastContext.Provider>` around **its own markup only**; `{children}` in the
root layout is *not* inside it. Therefore every `useToast()` call in `login-form`,
`signup-form`, `product-actions`, `ruleset-form`, `import-form` and `chat-panel` receives the
default context `{ push: () => {} }`. Users get **zero** success/error feedback in six flows.

**RED-6 · There is no way to create a single product from the UI.**
`/products` renders `+ افزودن محصول جدید` as `<Link href="/products?new=1">`, but nothing in the
codebase reads `searchParams.new`. The only creation path is the bulk paste importer. `POST
/api/products` exists and is correct, but is unreachable from the product.

**RED-7 · `submit-payment` fakes payment progress and corrupts the lifecycle.**
- Sets `paidAt = now` at *submission* time, before any human review. The admin panel renders
  `paidAt` as "تاریخ ثبت", and `status/page.tsx` treats it as a payment timestamp. This is
  "pretend payment succeeded" at the data layer.
- Forces `status: "TRIAL"` on update — **renewing an ACTIVE subscription downgrades it to TRIAL
  immediately**, before the new payment is approved.
- Writes `startsAt = now`, `endsAt = now + days` before approval, so the pending period already
  looks like consumed subscription time.

**RED-8 · No error / not-found / loading boundaries anywhere.**
No `error.tsx`, `not-found.tsx` or `loading.tsx` in the whole app. An unexpected throw in a
server component renders Next's default English error page; `notFound()` in
`conversations/[id]` renders the default English 404. Also `/why-sellora` deliberately throws
`new Response(null, { status: 401 })` for logged-out visitors → a blank, contentless 401.

**RED-9 · Zero SEO surface.**
No `metadataBase`, no Open Graph, no Twitter card, no canonical, no `robots`, no
`robots.txt`, no `sitemap.xml`, no JSON-LD, no `public/` directory at all (no favicon, no
apple-touch-icon, no manifest, no OG image). Root metadata is a single `title` + `description`
in `src/app/layout.tsx`. Private routes (`/dashboard`, `/admin/subscriptions`, …) are **not**
`noindex`ed.

**RED-10 · No landing page.** `src/app/page.tsx` is `redirect(session ? "/dashboard" : "/login")`,
and `src/middleware.ts` *also* redirects `/`. A cold visitor from Instagram/Google lands on a
login form with no explanation of the product.

**RED-11 · No notification surface.** The `Notification` model exists and five code paths write
to it (`lead.hot`, `conversation.needs_owner`, `subscription.pending`, `subscription.approved`,
`subscription.rejected`) — but there is **no bell, no page and no API to read them**. Owners can
never see a hot lead alert. Notifications are write-only.

**RED-12 · Untranslated enum values shown to owners.**
`settings/page.tsx` renders `` `${sub.plan} — ${sub.status}` `` → literally `WEEKLY — TRIAL`.
`settings/subscription/page.tsx` renders `{sub.status}` raw. `conversations/[id]/page.tsx`
renders `• {m.deliveryState}` → `• RETRYING`. `settings/page.tsx` has
`aria-label="toggle automation"`.

**RED-13 · Fake claims in the product.**
- `why-sellora`: "یک هفته رایگان. بدون نیاز به کارت اعتباری. هر وقت نخواستی، لغو کن."
  Signup creates **no** `Subscription` row at all — there is no automatic 7-day trial and no
  cancel flow. Claim is false.
- `onboarding`: steps 2, 3 and 5 are hardcoded `done: true` (progress bar lies), and steps
  2/3/5 ("نوع کسب‌وکار", "نوع فروش", "انتخاب پست‌ها") point at features that do not exist.
- `dashboard`: the "خودکار حل شد" tile counts conversations in
  `COMPLETED ∪ WAITING_CUSTOMER` — a conversation merely waiting on the customer is not
  "resolved automatically".
- `dict.settings.subscription.noPayments` still says the payment gateway is inactive and
  "we will contact you", which predates the implemented card-to-card review flow.

---

## YELLOW — works, but below production bar

- **`src/lib/db/prisma.ts` (≈470 lines).** A hand-written Proxy "mini-Prisma" pg fallback
  gated on `SELLORA_ALLOW_PG_FALLBACK=1 && NODE_ENV!=='production'`. Correctly disabled in
  production, but it is a large, hand-maintained SQL translator that can silently diverge from
  real Prisma semantics. Also `pgHealth()` only inspects the *fallback* pool, so it reports
  `"no pg pool"` whenever real Prisma is in use.
- **Mixed money units.** `Product.price` is stored in **RIALS** (`toStoragePrice(toman) = toman*10`),
  `Subscription.amount` is stored in **TOMAN** (`= PLANS[].price`). Display code compensates
  inconsistently (`formatToman(p.price)` vs `formatToman(sub.amount * 10)`). It renders correctly
  today but is a live 10× bug waiting to happen. Not changed here — a migration would rewrite
  historical data.
- **Currency codes disagree.** `Business.currency` default `"IRR"`, `Subscription.currency`
  default `"IRR"` in schema but written as `"IRT"` by `pricing.CURRENCY`.
- **Hardcoded prices in the dictionary.** `fa.ts` has `weeklyPrice: "۲۹۹،۰۰۰ تومان"` etc.,
  duplicating `pricing.ts` and violating that file's own "NEVER hard-code these prices
  anywhere else" comment.
- **Fire-and-forget on serverless.** `POST /api/webhooks/meta` returns 200 and then runs
  `void processMetaWebhook(…)`. On Vercel the function is frozen after the response, so webhook
  processing (and the auto-reply) can be dropped mid-flight. Next 14 has no `after()`/`waitUntil`
  in App Router route handlers.
- **Render-blocking third-party font CSS.** Root layout injects
  `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/…">`. A blocking
  cross-origin request on the critical path, plus a third-party dependency for every Iranian
  user.
- **In-memory rate limiter.** `rate-limit.ts` is per-instance; on Vercel's many short-lived
  lambdas the effective limit is `max × instances`. Acceptable for launch, must be stated.
- **Env var documentation mismatch.** Schema reads `SELLORA_DATABASE_URL`; `.env.example`,
  `README.md` and `STATUS.md` all document `DATABASE_URL` / `DIRECT_URL`. A fresh deploy that
  follows the docs fails at `prisma generate` with "Environment variable not found".
- **Unoptimised images.** `products/page.tsx` uses a bare `<img src={p.imageUrl}>` with no
  `width`/`height`/`loading` — CLS + full-size downloads.
- **Accessibility.** Every `<Label>` is rendered without `htmlFor`, and no input except
  `#trackingCode` has an `id` → no programmatic label association anywhere. No visible
  `:focus-visible` ring beyond Tailwind defaults on `.input`. Bottom-nav links are ~44 px tall
  but have no `aria-current`. The automation toggle is a `<button>` pretending to be a switch
  (no `role="switch"`, no `aria-checked`) and positions its knob with physical `right-*`
  classes inside an RTL document.
- **Login error mapping.** API returns `error.message = "invalidCredentials"`, but the form looks
  it up in `dict.errors` (it lives in `dict.auth`) → users always see the generic message.
- **`STATUS.md` inaccuracies.** Claims `gen_random_uuid()` IDs (schema uses `cuid()`), claims
  22 tables / 11 enums and "32/32 integration tests pass" against real Postgres — unverifiable
  here and not reflected by the current schema.
- **`next-env.d.ts` is tracked.** Next regenerates it; the official `.gitignore` template
  excludes it.
- **`next@14.2.15` carries a published security advisory.** npm reports: *"This version has a
  security vulnerability… See nextjs.org/blog/security-update-2025-12-11"*. The patched 14.2.x
  line is `14.2.34` / `14.2.35` (both published 2025-12-11). Upgrading is **out of scope per
  the explicit "Do NOT upgrade Next.js" instruction** — recorded as an EXTERNAL BLOCKER.

---

## EXTERNAL BLOCKERS (cannot be closed from this sandbox)

1. **Next.js patch level** — needs the owner's approval to move `14.2.15 → 14.2.35`
   (same minor, security-only).
2. **Neon Postgres** — not reachable; migrations, `test:db` and tenant-isolation runtime tests
   cannot be executed here.
3. **`binaries.prisma.sh`** — not reachable; `prisma generate` / `prisma migrate deploy` cannot
   be run here (works on Vercel).
4. **Meta App Review** — `META_APP_ID` / `META_APP_SECRET` unconfigured by design; live Instagram
   DM round-trip is untestable.
5. **Vercel project env vars** — cannot be read or verified from the sandbox, so RED-2's
   "is `NEXTAUTH_SECRET` actually set?" is unverifiable; the code is being changed to fail
   loudly instead of silently.
6. **Production URL** — `sellora-navy-one.vercel.app` is not in the sandbox egress allowlist, so
   Lighthouse/CWV numbers cannot be measured. Performance work is therefore based on bundle
   output and code inspection, and CWV targets are stated as *targets*, not measurements.
7. **Real PSP** — no Iranian payment gateway is integrated; the manual card-to-card review flow
   is the product's actual payment architecture.

---

## Phase 15 — verification log (2026-10-08, branch `arena/5a3320a9-sellora`)

Everything below was actually executed in this sandbox against a production
build (`npx next start`), not assumed.

### Gates

| Gate | Command | Result |
| --- | --- | --- |
| Type check | `npx tsc --noEmit` | exit 0, no output |
| Lint | `npx next lint` | `✔ No ESLint warnings or errors` (8 pre-existing warnings fixed) |
| Production build | `npx next build` | exit 0, 26 static pages |
| `prisma validate` / `prisma generate` / `migrate deploy` | — | **EXTERNAL BLOCKER**: `binaries.prisma.sh` is outside the sandbox egress allowlist, so the Prisma CLI cannot download its engine. `npm install` therefore fails at `postinstall`; `node_modules` itself is complete. |
| Runtime against real data (Neon) | — | **EXTERNAL BLOCKER**: no database reachable from the sandbox. |

Build sizes (First Load JS): shared 87.1 kB; `/` 94.1 kB (+180 B);
`/why-sellora` 94.1 kB; `/dashboard` 95.7 kB; `/products` 98 kB;
`/products/import` 111 kB (largest client component in the app);
middleware 26.8 kB. The public marketing surface is the lightest path in the
app and loads one self-hosted WOFF2 (`/fonts/vazirmatn-var.woff2`, 111 KB) with
`preload` + `font-display: swap`; no third-party font/CDN requests remain.

### Route matrix (anonymous visitor)

| Route | Result |
| --- | --- |
| `/`, `/why-sellora`, `/login`, `/signup` | 200, Persian, `index`/`noindex, follow` respectively |
| `/robots.txt` | 200 — allows `/`, `/why-sellora`, `/signup`, `/login`; disallows `/dashboard`, `/conversations`, `/leads`, `/products`, `/settings`, `/admin`, `/onboarding`, `/notifications`, `/api`; `Host` + `Sitemap` |
| `/sitemap.xml` | 200 — exactly 2 absolute public URLs from `siteUrl()` |
| `/site.webmanifest`, `/favicon.svg`, `/favicon.ico`, `/apple-touch-icon.png`, `/icons/icon-192.png`, `/icons/icon-512.png`, `/og.jpg` | all 200 (`og.jpg` 41 KB, 1200×630) |
| `/dashboard`, `/conversations`, `/leads`, `/products`, `/settings`, `/onboarding`, `/notifications`, `/admin/subscriptions`, `/admin/system` | 307 → `/login?next=<encoded original path>` (open-redirect safe: only same-origin relative paths) |
| `/api/products`, `/api/leads`, `/api/conversations`, `/api/rules`, `/api/subscription`, `/api/notifications`, `/api/admin/subscriptions`, `/api/admin/system` | 401 |
| `/api/health` | 200, no internals leaked |
| `POST /api/webhooks/meta` (unsigned) | 401 |
| `POST /api/webhooks/qstash` (bad signature) | 401 |
| Non-existent path | 404 with the Persian `not-found` boundary |

### Security headers (verified with `curl -I /`)

`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`,
`Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`,
`X-DNS-Prefetch-Control: on`, `Strict-Transport-Security: max-age=63072000; includeSubDomains`.

### Session behaviour with a missing/broken signing secret

- No cookie → middleware 307 to `/login`.
- Garbage cookie → the page treats the visitor as anonymous and issues a
  redirect flight command to `/login` (HTTP body stays 200 because the
  `loading.tsx` shell has already been streamed; a browser follows it). Verified
  by inspecting the flight payload (`login;307;`).
- `NEXTAUTH_SECRET` unset in production → `getSession()` logs
  `[session] refusing to verify sessions:` and returns null (no 500, no dev
  fallback key), and `POST /api/auth/login` returns 500 `{"error":{"code":"internal"}}`
  without minting a cookie. Fail closed, diagnosable.

### Not verifiable here (need the live deployment)

Core Web Vitals (LCP/CLS/INP) on real traffic, Meta/Instagram webhook delivery,
card-to-card payment approvals, and Neon query plans/index usage. The code paths
are in place; measuring them requires production traffic and credentials.
