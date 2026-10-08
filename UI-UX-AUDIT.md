# Sellora UX audit and implementation map

## Existing surface inventory (before edits)
- Public `/`: hero, chat illustration, problems, solution, six feature cards, setup, pricing from PLANS, FAQ, final CTA. `/why-sellora`: audience, comparison table, features, before/after, principles, pricing and CTA. PublicShell supplies header/footer.
- `/login`, `/signup`: AuthLayout and existing client forms/API authentication.
- `/dashboard`: greeting hero with metrics, Instagram status, attention queue, four metrics, recent conversations, hot leads, automation metrics, quick actions, service status. Most duplication originates here.
- `/conversations`, `/conversations/[id]`: list/filter, responsive InboxLayout, MessageThread, customer context, existing chat polling/send and handoff. Keep all interaction logic.
- `/automations`: master switch, connection warning, metrics, flows, engine controls, capabilities, safety rules and next-step links. Collapse explanatory reference material, not controls.
- `/products`, `?new=1`, `/products/import`: catalog, product form/actions and import preview. Keep as primary existing workflow.
- `/leads`: temperature groups and captured contacts. Secondary growth destination.
- `/onboarding`: setup checklist. Secondary setup destination.
- `/notifications`: list, per-item read, mark-all. Existing POSTs swallow failed responses; chrome uses server props that can be replayed by router cache.
- `/settings`: account, business/integration/subscription links, duplicate automation switch and service summaries, promotional help. Focus on account/configuration.
- `/settings/business`: ruleset form. `/settings/instagram`: real OAuth status, authorization, refresh/disconnect, permissions. `/settings/subscription`, `/pay/[plan]`, `/status`: existing real plan/payment lifecycle.
- `/admin/subscriptions`, `/admin/system`: guarded operational tools. Keep role restrictions.
- Shared: AppShell (server chrome), SidebarNav, BottomNav (More overlay), notification bell, UI buttons/cards/badges/inputs/switches/toasts, Persian/Arabic RTL and English dictionaries, brand artwork.
- Error, loading, not-found states share the same tokens.

## Placement decisions
- Public: introduction → prominent Why Sellora → focused benefits → setup → pricing → FAQ. No unsupported competitive rankings.
- Dashboard: next action, account status, essential daily metrics, recent conversations and leads. Remove repeated hero/sidebar metrics and generic quick links; those functions remain in Products, Settings and Automation.
- Navigation: Dashboard / Inbox / Automation / Products / More, same destinations on phone and desktop. No invented analytics feature; existing metrics remain on dashboard/automation.
- More: stable route containing account, subscription, integration, leads, setup, notifications, product help. Persistent bottom bar and explicit Back; settings children retain parent links.
- Configuration: keep automation master control on Automation; settings links there rather than duplicating its controls. Collapse secondary explanatory content.

## Boundaries
No schema, API contract, authentication, subscription, Meta OAuth or automation-engine changes. Notification reconciliation uses existing GET/POST endpoints, never a cosmetic zero. Preserve original brand artwork; replace environmental purple with neutral/blue tokens.

## Validation constraints
No database or Meta credentials were supplied in this checkout. Public rendering can be tested directly; authenticated rendering requires an isolated local test database or explicitly documented fixtures. Live Meta authorization and real payments cannot be certified without their configured services.

## Implemented
- Replaced inverted purple/rose environmental tokens with light neutral surfaces, dark ink, blue actions and green activation switches. Updated manifest/browser theme and standalone error boundary too. Preserved official logo assets.
- Shared cards, fields, buttons, status colors and keyboard focus are consistent. Frosting is reserved for navigation/chrome and the landing conversation illustration; ordinary content remains solid/readable.
- Landing now states Instagram DM automation explicitly, offers pricing immediately, and places a three-part Why Sellora section directly after the hero. Removed the repetitive problem/solution wall; detailed comparison remains available.
- Dashboard no longer repeats hero/side-column metrics, generic quick actions, onboarding promos or empty lead cards. Actual conversations/leads and linked service status remain.
- Automation has one visible master switch, concise flow summaries with native disclosures, and collapsed reference sections. Settings links to automation rather than maintaining a second control. Onboarding's automation link follows that move.
- More is a real authenticated page. Desktop and mobile both use five primary destinations. Account/integration/subscription/help/admin links remain accessible. Settings returns to More; the public comparison page offers an explicit app-return link for signed-in visitors.
- Notification writes check HTTP success, disable during submission and report failures. Bells reconcile against the existing GET endpoint after writes, navigation, focus and page restoration. Opening the notification list alone does not silently mark unseen items read: existing individual-read / read-all semantics are retained.
- Instagram explanation distinguishes Facebook/Meta authorization from connecting an Instagram business account, and return/connection from enabling automation. Real status, OAuth URL, refresh and disconnect stay unchanged. Setup no longer calls Instagram optional when Meta credentials are missing.
- Removed repeated mobile product-import entry in the empty state.

## Verification — 2026-10-08
Passed:
- `npm run lint`: no warnings/errors.
- `npm run typecheck`.
- `npx next build`: compiled, typechecked and generated successfully. Used this directly to avoid the project's `postbuild` deployment migration against an unspecified database.
- `git diff --check`.
- Chromium browser checks at **320, 390 and 1440px** for public home/comparison/login/signup and 17 authenticated routes (dashboard, More, settings, automation, inbox, catalog, leads, notifications, setup, Instagram, business rules, subscription, import, new-product form, payment status, payment form, comparison). Asserted no document horizontal overflow, no application error boundary, and persistent mobile navigation on app routes.
- Actual click journey: Dashboard → More → Settings → Back → More.
- Screenshots inspected for landing, dashboard, More, settings, automation, Instagram, inbox/list/thread, products, business form, subscription, onboarding, leads, notifications and auth. Render review caught and corrected duplicate switches/import actions, weak input borders and overly expanded reference cards.
- Anonymous browser computed canvas color: `rgb(247, 249, 252)`; no purple environmental color remains in app styles or manifest.
- Notification **frontend contract tests**: success, failed read-all, failed individual read, pending disable, individual-read-before-navigation, stale server props and focus reconciliation. Real components; mocked API responses. Repeatable test in `scripts/test-notification-ui.mjs`.
- Repeatable responsive route checks in `scripts/test-ui-smoke.mjs`; uses an externally supplied Playwright auth state, never an auth bypass.

### Environment limitations / not certified
- Native Prisma generation attempted but engine download from `binaries.prisma.sh` was unavailable. Authenticated rendering used the project's existing opt-in development PG fallback with a disposable, local PostgreSQL database and a test signup. No production records were used or changed.
- The pre-existing fallback turns null filters into `= NULL` and does not implement all relation includes. Consequently, **production notification persistence and populated message-relation rendering are not certified by these UI checks**. The notification frontend contract tests are intentionally separate; they are not claimed as live backend tests. No changes were made to this fallback or the production DB layer to hide these limitations.
- Meta credentials/live Instagram access and real payment approval were unavailable. Verified explanatory/error/unconfigured UI, not live OAuth completion, message delivery or payment processing.
- Admin-only actions and all automation-engine business scenarios were not exercised end-to-end. Their API handlers and guards are unchanged.
- `npm ci` reported existing dependency vulnerabilities (including Next 14.2.15). Dependency upgrades are outside this UI-only change; package manifest/lockfile are unchanged.

### Running browser checks
Install Playwright as a local test tool (not required by the app), start the dev server with your usual test database, then run:

```sh
node scripts/test-notification-ui.mjs
UI_AUTH_STATE=/path/to/test-storage-state.json node scripts/test-ui-smoke.mjs
```

Optional `BASE_URL`, `CHROMIUM_PATH`, and JSON `CHROMIUM_ARGS` configure the browser environment. The notification test creates/removes a temporary component-only route; run it against a local development server, never production. Screenshots and test state belong in ignored `.cache/`, not Git.
