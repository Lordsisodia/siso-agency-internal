# Lane: Reliability — Webhooks, Idempotency, Outbox/Inbox

Goal: find OSS and proven patterns that help us build a **reliable Shopify-connected ops runtime**:
- webhook ingestion that is safe under retries / duplicates
- idempotent writes
- transactional outbox (exactly-once effects via at-least-once delivery)
- replay/backfill support with an execution ledger

## What we’re looking for (high-signal)

- Transactional outbox libraries (esp. Postgres + TypeScript)
- Inbox/dedupe schemas (idempotency keys, request hashes, replay windows)
- CDC/outbox examples that clarify operational knobs (retries, ordering, poison messages)
- Minimal, well-documented libs we can integrate or re-implement cleanly

## Current curated highlights (from our catalog/curation)

High-fit candidates:
- `Zehelein/pg-transactional-outbox` (poc) — TypeScript + Postgres transactional outbox/inbox blueprint (directly relevant)
  - Evidence: `docs/.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-pg-transactional-outbox-reliability-primitives.md`

Good references (pattern validation; not necessarily integration targets):
- `dotnetcore/CAP` (watch) — high-quality outbox/eventbus pattern (C#/.NET)
- `tomorrow-one/transactional-outbox` (watch) — Java/Kafka transactional outbox library
- `catmullet/one` (watch) — Go idempotency middleware reference
- `lydtechconsulting/kafka-idempotent-consumer` (watch) — idempotent consumer + outbox example

Shopify app wiring references (auth + webhook verification):
- `kinngh/shopify-nextjs-prisma-app` (deepen) — embedded Shopify app starter (Next.js + Prisma)
  - `pages/api/webhooks/[...webhookTopic].js` (webhook handler)
  - `utils/middleware/verifyHmac.js` + `utils/middleware/verifyRequest.js` (HMAC + request gating)
  - `utils/sessionHandler.js` + `prisma/schema.prisma` (session persistence)
- `carstenlebek/shopify-node-app-starter` (deepen) — embedded Shopify app starter (TypeScript)
  - `src/pages/api/auth/*` (online/offline OAuth flow)
  - `src/pages/api/webhooks.ts` + `src/webhooks/index.ts` (webhook endpoint + registry)
  - `src/lib/sessionStorage.ts` + `src/middleware.ts` (session storage + request validation)

Detailed blueprint (what we should implement):
- `docs/.blackbox/oss-catalog/shopify-app-primitives.md`

## Practical pattern checklist (what we should implement regardless of OSS)

### Webhook inbox (dedupe)
- Store `{source, external_event_id, received_at, hash, status}`
- Reject duplicates quickly and return 2xx idempotently
- Capture raw payload pointer (or hash) for replay/debug

### Idempotency keys
- For any “write-back” operation (refund, fulfill, store credit):
  - require `idempotency_key`
  - store result keyed by `{tenant, operation, idempotency_key}`
  - return the stored result on retry

### Transactional outbox
- In the same DB transaction as state change:
  - write business state
  - insert outbox row `{type, payload, dedupe_key, available_at, attempts}`
- Separate worker publishes outbox rows to the bus and marks as delivered

## Lumelle v1 blueprint (proposed, polling-first)

This is the “implementable” contract we should build towards, based on:
- `Zehelein/pg-transactional-outbox` schema + worker semantics
- Shopify webhook ingestion constraints (retries, duplicate deliveries, missing external ids for some topics)

### A) `webhook_inbox` table (dedupe + replay)

Purpose:
- guarantee “exactly-once” *handler execution* per webhook delivery key (even under retries)
- provide replay/backfill via stored payload + status

Proposed minimal columns (conceptual; adjust types to our DB conventions):
- identity:
  - `id` (uuid pk)
  - `tenant_id`
  - `source` (e.g. `shopify`)
  - `topic`
  - `shop_id` or `shop_domain`
- dedupe key:
  - `external_event_id` (nullable; when Shopify provides a stable id)
  - `payload_hash` (sha256 of raw body; used when `external_event_id` is missing/unreliable)
- routing + ordering:
  - `segment` (nullable; recommended `order_id` when present, otherwise `customer_id`, otherwise `shop_id`)
  - `concurrency` in `('sequential','parallel')` (default `sequential`)
- payload:
  - `payload` (jsonb)
  - `metadata` (jsonb; headers, delivery info, HMAC validation outcome, etc.)
- worker state:
  - `locked_until` (lease; default epoch)
  - `received_at`
  - `processed_at` (null until success)
  - `abandoned_at` (null until poison)
  - `started_attempts`, `finished_attempts` (smallint counters)
  - `last_error` (optional short text)

Required constraints/indexes:
- Unique: `(tenant_id, source, topic, external_event_id)` where `external_event_id IS NOT NULL`
- Unique fallback: `(tenant_id, source, topic, payload_hash)` where `external_event_id IS NULL`
- Indexes to support polling and cleanup:
  - `(segment)`, `(created_at/received_at)`, `(processed_at)`, `(abandoned_at)`, `(locked_until)`

### B) `outbox_events` table (exactly-once effects)

Purpose:
- guarantee “exactly-once” *effects publication* from our system (e.g., workflow events, audit events)

Proposed columns (aligned with the `pg-transactional-outbox` reference):
- `id` (uuid pk)
- `aggregate_type` (e.g. `order`, `return`, `workflow_run`)
- `aggregate_id`
- `message_type` (e.g. `workflow.run.started`, `return.approved`)
- `segment` (recommended: same as inbox segment rules)
- `concurrency` (`sequential|parallel`)
- `payload` (jsonb)
- `metadata` (jsonb)
- `locked_until`, `created_at`, `processed_at`, `abandoned_at`, `started_attempts`, `finished_attempts`

### C) Polling workers (shared semantics)

Worker loop requirements (applies to inbox + outbox):
- claim messages by taking a short lease (`locked_until = now + lock_ms`) and incrementing `started_attempts`
- enforce per-segment ordering for sequential messages (only oldest per segment is claimable)
- process with timeout; on success set `processed_at` and increment `finished_attempts`
- on failure:
  - set `locked_until = now + backoff_ms` (retry scheduling)
  - increment `finished_attempts`
  - if attempts exceed threshold → set `abandoned_at` and emit an audit event
- cleanup:
  - delete processed rows after retention window
  - delete abandoned rows after longer retention window (or keep for investigations)

### D) Shopify idempotency keys (practical)

When Shopify provides a stable delivery id, use it. Otherwise:
- `payload_hash = sha256(raw_body)`
- dedupe key = `(shop, topic, payload_hash)`

Always store:
- raw payload hash (even if you store parsed JSON)
- headers that help debug retries (delivery timestamps, topic, shop domain)

## Recommended next runs (commands)

Outbox + dedupe (precision queries):
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (outbox/dedupe pass): " -- --queries-md .blackbox/snippets/research/query-banks/github-search-queries-outbox-dedupe-atleastonce-v1.md --no-derived-queries --min-stars 25 --max-total-queries 24 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost`

## Stop rule (avoid churn)

Once we have:
- 1–2 high-fit libs to deepen, and
- a clear in-house schema/pattern checklist,

…pause discovery here and focus on implementing the primitives + adding evidence notes to POCs.
