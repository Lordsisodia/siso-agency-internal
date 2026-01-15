# Shopify App Primitives (OAuth, Sessions, Webhooks) — blueprint + OSS file pointers

Updated: `2025-12-31`

Goal: turn a small set of high-signal OSS repos into **repeatable primitives** we can reuse across Lumelle:
- embedded admin surfaces (Shopify App UI)
- reliable webhook ingestion (dedupe + idempotency + audit trail)
- safe request verification (JWT/session token + HMAC)

This is **not** a full app template. It’s a “what we should implement” blueprint + where to mine patterns.

Guardrails:
- **No token leaks:** use GitHub CLI auth; never paste PATs into docs/chat.
- **No cloning/vendoring:** capture patterns + file pointers only.
- **License gate:** only copy/adapt code from `license_bucket=safe` repos (MIT/Apache/BSD/ISC/MPL-2.0).

---

## Reference OSS sources (high-signal)

### Shopify embedded app starter (Next.js + Prisma)
- Repo: `kinngh/shopify-nextjs-prisma-app` (MIT)
- Why it’s useful:
  - Very explicit request verification + session token exchange
  - Concrete examples for: webhooks, GDPR, app proxy, GraphQL proxy

Key file pointers (no cloning):
- Request verification (JWT → sessions)
  - `utils/middleware/verifyRequest.js` (JWT decode → online/offline token exchange → attach session)
  - `utils/validateJWT.js` (JWT parsing/validation)
- Session persistence (DB + encryption)
  - `utils/sessionHandler.js` (store/load/delete `Session`)
  - `utils/cryption.js` (Cryptr-based encryption)
  - `prisma/schema.prisma` (stores + session models)
- Webhooks
  - `pages/api/webhooks/[...webhookTopic].js` (raw body + `shopify.webhooks.validate` + topic dispatch)
  - `utils/webhooks/*` (topic handlers)
- GDPR webhooks
  - `pages/api/gdpr/customers_data_request.js`
  - `pages/api/gdpr/customers_redact.js`
  - `pages/api/gdpr/shop_redact.js`
  - `utils/middleware/verifyHmac.js` (HMAC verification middleware)
- App proxy
  - `pages/api/proxy_route/json.js` (example proxy endpoint)
  - `utils/middleware/verifyProxy.js` (proxy signature verification)
- Admin GraphQL proxy
  - `pages/api/graphql.js` (`shopify.clients.graphqlProxy`)
- Middleware composition
  - `utils/middleware/withMiddleware.js` (middleware registry)

### Shopify embedded app starter (TypeScript-first, serverless)
- Repo: `carstenlebek/shopify-node-app-starter` (MIT)
- Why it’s useful:
  - Clean Next.js “no custom server” wiring
  - Online/offline auth flows + webhook registry + session storage example

Key file pointers (no cloning):
- Shopify context + webhook registry
  - `src/lib/shopify.ts` (Shopify Context init + `Webhooks.Registry.addHandlers`)
  - `src/webhooks/index.ts` (webhook handler map)
- Auth (online/offline flows)
  - `src/pages/api/auth/*`
- Webhooks
  - `src/pages/api/webhooks.ts` (`Webhooks.Registry.process`; `bodyParser: false`)
- GraphQL proxy
  - `src/pages/api/graphql.ts` (`Shopify.Utils.graphqlProxy`; `bodyParser: false`)
- Session storage
  - `src/lib/sessionStorage.ts` (`Shopify.Session.CustomSessionStorage` using Upstash Redis)
- Request verification + CSP
  - `src/middleware.ts` (guards `/api/*`, ensures offline auth, sets `frame-ancestors` CSP)
  - `src/middleware/verify-request.ts` (top-level redirect + session validation)

---

## What we should implement (platform primitives)

### 1) `ShopifyAuth` (install + re-auth)
Responsibilities:
- Drive initial install OAuth flow and handle re-auth when tokens expire.
- Maintain **two token types**:
  - **offline token**: background jobs, webhooks, store-level operations
  - **online token**: user-context actions in embedded admin UI

Patterns to mine:
- Session token exchange → online + offline tokens:
  - `kinngh/shopify-nextjs-prisma-app` → `utils/middleware/verifyRequest.js`
- Separate offline auth route + redirect when missing:
  - `carstenlebek/shopify-node-app-starter` → `src/middleware.ts` + `src/pages/api/auth/offline*.ts`

Acceptance criteria (1-day POC):
- We can complete install, store offline session, and make 1 Admin GraphQL call for a shop.

### 2) `SessionStore` (durable + encrypted)
Responsibilities:
- Persist sessions keyed by session id (and indexed by shop).
- Encrypt at rest (sessions contain tokens).

Patterns to mine:
- Prisma session table + Cryptr encryption:
  - `kinngh/shopify-nextjs-prisma-app` → `utils/sessionHandler.js`, `utils/cryption.js`, `prisma/schema.prisma`
- Redis session storage + TTL behavior:
  - `carstenlebek/shopify-node-app-starter` → `src/lib/sessionStorage.ts`

Recommendation:
- Treat offline sessions as long-lived.
- Treat online sessions as expiring (TTL).

### 3) `RequestVerifier` (embedded admin → our APIs)
Responsibilities:
- Verify embedded app calls (session token/JWT) and bind them to:
  - `shop`
  - `actor` (user id where available)
  - an **online session** (if needed)
- Enforce embedding safety:
  - `Content-Security-Policy: frame-ancestors https://{shop} https://admin.shopify.com;`

Patterns to mine:
- JWT decode → sanitize shop domain → ensure session scope + expiry:
  - `kinngh/shopify-nextjs-prisma-app` → `utils/middleware/verifyRequest.js`
- Middleware gate + top-level redirect:
  - `carstenlebek/shopify-node-app-starter` → `src/middleware/verify-request.ts`

### 4) `WebhookInbox` (dedupe + audit + replay)
Responsibilities:
- Receive webhooks with **raw body** handling and HMAC validation.
- Store an inbox record so retries are idempotent.
- Emit “processed” audit events (or link to audit log system).

Patterns to mine:
- Raw body buffering + validate + dispatch-by-topic:
  - `kinngh/shopify-nextjs-prisma-app` → `pages/api/webhooks/[...webhookTopic].js`
- Registry-based processing (keeps routing centralized):
  - `carstenlebek/shopify-node-app-starter` → `src/pages/api/webhooks.ts` + `src/webhooks/index.ts`

Suggested inbox schema (minimal):
- `webhook_deliveries`:
  - `id` (internal), `shop`, `topic`, `webhook_id`, `received_at`
  - `payload_hash` (or pointer), `status` (`received|processed|failed`)
  - `attempts`, `last_error`

Related (full spec: inbox + outbox + worker semantics):
- `docs/.blackbox/oss-catalog/lanes/reliability-webhooks-idempotency.md`

### 5) `AppProxyVerifier` (Shopify app proxy → our endpoint)
Responsibilities:
- Verify proxy signature (query string HMAC) and bind request to `shop`.

Pattern to mine:
- Signature verification from sorted query string:
  - `kinngh/shopify-nextjs-prisma-app` → `utils/middleware/verifyProxy.js`

### 6) `AdminGraphQLProxy` (optional, but useful)
Responsibilities:
- Provide a safe server-side proxy for Admin GraphQL requests from the embedded UI.

Patterns to mine:
- GraphQL proxy with session binding:
  - `kinngh/shopify-nextjs-prisma-app` → `pages/api/graphql.js`
  - `carstenlebek/shopify-node-app-starter` → `src/pages/api/graphql.ts`

---

## Practical “mining mode” outputs (what to write back into Lumelle docs)

For each primitive above, we should record:
- a concrete **interface sketch** (inputs/outputs)
- expected **headers** and **verification steps**
- minimal **DB schema**
- 3 “golden test cases” (valid + invalid + replay/duplicate)
- file pointers to the OSS reference code

Where to update:
- Curation notes (append-only): `docs/.blackbox/oss-catalog/curation.json`
- Reliability lane checklist: `docs/.blackbox/oss-catalog/lanes/reliability-webhooks-idempotency.md`
- Source map file pointers: `docs/.blackbox/oss-catalog/component-source-map.md`
