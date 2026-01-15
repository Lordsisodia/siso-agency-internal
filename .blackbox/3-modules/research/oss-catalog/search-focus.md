# OSS Discovery Search Focus (Lumelle e-commerce platform)

Updated: `2025-12-29`

This document defines what we are “looking for” during OSS discovery cycles so we:
- search consistently,
- curate faster,
- avoid collecting random repos that don’t map to platform primitives.

Scope: **Shopify-connected AI Ops** (admin + workflows + ops surfaces) rather than “build a full Shopify replacement”.

## Primary outcomes (what we want OSS to accelerate)

### Outcome A: Ops reliability + auditability
- Workflow orchestration that’s observable, reversible, and safe
- Audit logs / activity feeds
- Policy + approvals (RBAC/ABAC-style)

### Outcome B: Returns + exchanges (core differentiation)
- Return portal UX + rules engine
- RMA workflows + warehouse receiving
- Store credit / exchanges

### Outcome C: Support timeline + agent assist (grounded in data)
- Unified customer timeline (orders, tickets, returns, shipments)
- Inbox/helpdesk primitives (or components we can embed)

### Outcome D: Catalog ops speed
- Bulk editing tools
- Admin UX primitives (tables, filters, diff/preview, safe bulk actions)

## The 6 platform primitives we will actually build (in-house)
These are the durable “core” pieces we expect to own as first-class Lumelle platform code.

1) **Unified Ops Data Model** (orders/returns/shipments/support events)
   - Canonical IDs, event schema, timeline aggregation, and cross-linking.
2) **Workflow Runtime + Execution Ledger**
   - Webhook ingestion → tasks → retries → idempotency → backfills; every run is traceable.
3) **Policy + Approvals Layer**
   - A consistent decision point for “can we do this?” and “who needs to approve?” across ops actions.
4) **Audit Log + Activity Timeline**
   - Immutable action history for humans and machines, tied to orders/customers/returns.
5) **Connector/Integration Framework (Shopify-first)**
   - Webhook adapters, rate-limit handling, data sync jobs, and safe write-backs (refunds, fulfillments, store credit).
6) **Admin Ops Surfaces**
   - Returns Ops, Support Timeline, Bulk Actions, and “safe to run” tooling (preview/dry-run/undo where possible).

## What we should prioritize integrating (good OSS fit)

### 1) Platform primitives
- `auth`: OIDC/SSO, multi-tenant auth patterns
- `policy`: RBAC/ABAC/policy engines; approvals
- `observability`: tracing/logging/error tracking/alerting (pluggable)
- `workflows`: queues, schedulers, orchestration, webhook processing

### 2) Ops modules (domain-specific)
- `returns`: return portals, RMA, exchange flows, store credit wallets
- `shipping`: labeling, tracking, carrier rate shopping (usually adapters)
- `support`: shared inbox/helpdesk primitives, customer timeline patterns

### 3) Admin UI accelerators
- internal tools/admin builders (embed/extend)
- data-grid/table components (filter/sort/bulk actions)
- form builders, workflow editors

## The 6 areas we prefer to integrate OSS (vs build from scratch)
We want OSS to accelerate us, but we’ll be selective. These are the “best leverage” integration zones:

1) **Policy engine** (OPA-like) for authorization/approvals decisions
2) **Audit log UI + event storage** primitives (embeddable audit timelines)
3) **Workflow orchestration runtime** (schedulers, retries, queues) where it fits our model
4) **Admin accelerators** (internal tools builders, admin frameworks, data grids)
5) **Search/indexing** (ecommerce search UX + indexing backends) for both storefront and ops
6) **Observability/analytics** (tracing, logs, metrics, product analytics) as pluggable components

## What we should usually avoid (unless explicitly needed)
- Full “ecommerce platform” repos that assume we will run the entire store/checkout end-to-end
- Demo/starter/template repos (already filtered by keywords, but still watch out)
- Anything with restrictive licensing (GPL/AGPL/fair-code) unless we explicitly plan to keep it isolated and legal approves

## Tags we want to fill (current catalog gaps)
These are under-covered in `.blackbox/oss-catalog/catalog.json` and should be targeted in upcoming runs:
- `returns`
- `shipping`
- `policy`
- `analytics`
- `observability`
- `support`
- `auth`
- `commerce`
- `search`
- `workflows`

## Curation rubric (fast)
Use `.blackbox/snippets/research/oss-triage-rubric.md`.

## Definition of “done enough” for discovery
- Catalog has ~`50–150` candidates spanning the primary tags above.
- Curated shortlist has `10–25` repos with owners + statuses.
- POC backlog has `3–6` repos with concrete scope + acceptance criteria.

## POC definition of success (how we decide fast)
A POC is “successful” if, within **1–2 days**, we can produce *evidence* and make a decision:

- **Runnable**: we can run it locally (or in a minimal container) without heroics.
- **Fit**: it maps directly to one of the outcomes A–D above and to one of our platform primitives.
- **Integration clarity**: we can name the integration touchpoints (API/webhook/DB) and the boundary (what we own vs what it owns).
- **License risk bounded**: license is `safe`, or we have an explicit plan to verify/contain it.
- **Decision**: we can set `adopt | deepen | keep_poc | reject` with a short reason and next step.
