# OSS POC Backlog

Updated: `2025-12-31T17:58:25Z`

Generated from:
- catalog: `/Users/shaansisodia/DEV/client-projects/lumelle/docs/.blackbox/oss-catalog/catalog.json`
- curation: `/Users/shaansisodia/DEV/client-projects/lumelle/docs/.blackbox/oss-catalog/curation.json`

Included statuses: adopt, deepen, poc

## Items

- **open-policy-agent/opa** — status=poc, priority=60, owner=Shaan
  - stars=11029, license=safe, lang=Go, tags=auth, policy (https://github.com/open-policy-agent/opa)
  - Notes: Seeded:seeded rank=8/25 ; score=69 ; stars=11023 ; tags=auth, policy
POC scoped (auto): Integrate OPA as a policy/approval decision point for 1 workflow (e.g. returns refund approval) using a simple Rego policy and input payload schema.

POC deepening notes (OPA)

1 day POC plan (steps)
- Define a minimal policy input schema for one ops action:
  - example: `refund_request` {shop_id, actor_id, order_id, amount, reason, risk_signals, timestamp}
- Write 2 Rego policies:
  - allow refund under threshold + low-risk
  - deny refund over threshold unless actor has role=admin
- Stand up OPA in dev:
  - run container/service
  - load policy bundle
- Build a single “policy decision call” in our workflow:
  - POST input JSON → OPA → get decision + reason
- Emit an audit event for every decision (allow/deny) with the reason.

Integration touchpoints (APIs / webhooks / DB)
- API boundary:
  - Internal service calls OPA via HTTP to evaluate decisions.
- Data inputs:
  - Shopify webhook payloads (refund/cancel intents) → normalized input schema.
- Data storage:
  - Store decision logs (actor, action, object, decision, reason, policy version, timestamp) in our DB.
- Audit UI:
  - Link decisions to customer/order timelines; filter by order_id.

Risks + mitigations
- Risk: Policy complexity grows / hard to test.
  - Mitigation: keep policies small, add golden JSON test cases per action.
- Risk: Latency in hot paths.
  - Mitigation: cache simple decisions; avoid calling OPA synchronously in storefront paths.
- Risk: Incorrect denies block ops.
  - Mitigation: implement “manual override” + approval workflow; log every override.
- Risk: Policy drift across environments.
  - Mitigation: version policies; include policy version in every decision log.

Top 10 shortlist why: Policy-as-code decision point for approvals; keeps business rules versioned/testable and decoupled from app deploys.

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-opa-policy-approvals-primitives.md`
  - POC timebox: 2 day(s)
  - POC scope: Integrate OPA as a policy/approval decision point for 1 workflow (e.g. returns refund approval) using a simple Rego policy and input payload schema.
  - Acceptance: Given an example “refund request” JSON, OPA returns allow/deny + reason; decision is logged; policy change can be applied without redeploying app code.
  - Decision by: 2026-01-08

- **retracedhq/retraced** — status=poc, priority=58, owner=Shaan
  - stars=426, license=safe, lang=TypeScript, tags=admin, observability (https://github.com/retracedhq/retraced)
  - Notes: Seeded:seeded rank=21/25 ; score=74 ; stars=426
POC scoped (auto): Prototype an audit log stream + embeddable UI for our ops actions (refund, exchange, workflow run). Run locally with 1 event producer and verify search/filter.

POC deepening notes (Retraced)

1 day POC plan (steps)
- Deploy Retraced locally (docker/k8s): bring up API + UI.
- Define an “event schema” for Lumelle ops actions:
  - actor (user/service), action (refund_approved, exchange_created, workflow_run), object (order_id/customer_id), metadata, timestamp.
- Implement a tiny event emitter in a test harness (or script) that sends 10–20 sample events.
- Verify key UX requirements:
  - filter/search by `order_id` and `customer_id`
  - view per-actor activity
  - view per-action history
- Confirm retention/storage knobs and export strategy.

Integration touchpoints (APIs / webhooks / DB)
- API integration:
  - Our services call Retraced ingestion endpoint when ops actions occur.
- Webhook linkage:
  - Shopify webhooks (order/refund/fulfillment) are not the audit source; they are inputs to workflows. Audit should capture *our decisions*.
- Data storage:
  - Retraced stores event log; we should also keep a minimal local pointer (event id + order_id) if we need cross-system traceability.
- UI embedding:
  - Embed audit UI into admin surfaces (Returns Ops, Support timeline) or deep-link by order/customer.

Risks + mitigations
- Risk: Product fit mismatch (Retraced is audit logs, not a full customer timeline).
  - Mitigation: use Retraced for immutable audit; build timeline aggregation separately.
- Risk: Operational overhead (K8s, storage, backups).
  - Mitigation: timebox POC to deployment complexity; decide if we want managed alternative later.
- Risk: Data volume & PII handling.
  - Mitigation: keep payload minimal, avoid raw PII, store identifiers only; ensure retention policy.
- Risk: Licensing/maintenance.
  - Mitigation: verify license + cadence; keep an exit plan (exportable events).

Top 10 shortlist why: Fast way to stand up immutable audit logs + embeddable UI for every ops action (refunds, overrides, workflow runs).

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-retraced-audit-log-primitives.md`
  - POC timebox: 2 day(s)
  - POC scope: Prototype an audit log stream + embeddable UI for our ops actions (refund, exchange, workflow run). Run locally with 1 event producer and verify search/filter.
  - Acceptance: We can emit 3 event types with actor+object+timestamp, view them in UI, and filter by customer/order id; events are immutable and queryable.
  - Decision by: 2026-01-08

- **illacloud/illa-builder** — status=poc, priority=56, owner=Shaan
  - stars=12307, license=safe, lang=TypeScript, tags=admin, workflows (https://github.com/illacloud/illa-builder)
  - Notes: Admin builder; assess embed + RBAC
POC scoped (auto): Prototype an internal “Returns Ops” admin tool: list returns, bulk actions, and a detail view fed by mocked API. Focus on speed of building + embedding + RBAC hooks.

POC deepening notes (ILLA Builder)

1 day POC plan (steps)
- Bring up ILLA locally and get a hello-world internal app running.
- Create a mocked Returns Ops API (static JSON) with 3 endpoints:
  - GET `/returns?status=&q=` (list)
  - POST `/returns/bulk` (approve/deny/store-credit)
  - GET `/returns/{id}` (detail)
- Build the “Returns Ops” internal UI:
  - list view with filters (status, date range), search (order_id/customer_id), and pagination.
  - bulk-select + bulk action buttons (approve, deny, request more info).
  - detail view showing timeline and action buttons.
- Validate RBAC:
  - define roles: `ops_agent`, `ops_manager`, `admin`
  - ensure bulk actions are gated to manager/admin
  - confirm audit logging for actions (even if stubbed).
- Timebox an embed decision:
  - decide whether we host as separate internal app, or embed within our admin shell.

Integration touchpoints (APIs / webhooks / DB)
- API boundary:
  - ILLA calls our internal Admin API (REST/GraphQL) for list/detail/bulk actions.
- Auth:
  - integrate with our auth (SSO/OAuth/JWT) or keep behind VPN for POC; map user claims → roles.
- Data:
  - reads from our Returns tables; writes create return-state transitions + notes.
- Observability:
  - emit an “ops action” event on every bulk action for audit/timeline (could feed Retraced later).
- Webhooks:
  - Shopify webhooks remain upstream inputs; the internal tool operates on our normalized return objects.

Risks + mitigations
- Risk: Security posture (internal tool builder expands attack surface).
  - Mitigation: keep behind auth boundary; least-privilege API tokens; restrict network; log all actions.
- Risk: Vendor/tool lock-in of UI logic.
  - Mitigation: treat as prototyping accelerator; keep API contracts explicit so we can rebuild UI if needed.
- Risk: Performance for large lists/bulk ops.
  - Mitigation: ensure server-side pagination/filtering; avoid client-side loading of full datasets.
- Risk: RBAC drift vs app permissions.
  - Mitigation: enforce authorization on the API (not just UI); UI-only gating is never sufficient.
- Risk: Maintenance overhead (upgrades, plugins, runtime complexity).
  - Mitigation: decide quickly (“accelerator” vs “no”) based on 1-day POC outcomes.

Top 10 shortlist why: Low-code internal tool builder to ship Returns Ops / bulk actions UI quickly without custom frontend from scratch.

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-illa-builder-admin-bulk-ops-primitives.md`
  - POC timebox: 1 day(s)
  - POC scope: Prototype an internal “Returns Ops” admin tool: list returns, bulk actions, and a detail view fed by mocked API. Focus on speed of building + embedding + RBAC hooks.
  - Acceptance: A working internal UI exists with list+filter+bulk action scaffold; we can embed/host it and gate by role; decide if it accelerates admin surfaces vs build custom.
  - Decision by: 2026-01-08

- **simstudioai/sim** — status=poc, priority=54, owner=Shaan
  - stars=24698, license=safe, lang=TypeScript, tags=workflows, support, webhooks (https://github.com/simstudioai/sim)
  - Notes: Seeded:seeded rank=3/25 ; score=77 ; stars=24637 ; tags=support, workflows
POC scoped (auto): Evaluate SIM as a workflow automation layer for support/ops (webhooks → actions). Prototype 1 “support timeline” workflow: ingest Shopify webhook → enrich → create a timeline event.

Top 10 shortlist why: Workflow layer for support/ops; good candidate for “support timeline workflow” and execution visibility.

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-simstudio-sim-agent-workflows-primitives.md`
  - POC timebox: 2 day(s)
  - POC scope: Evaluate SIM as a workflow automation layer for support/ops (webhooks → actions). Prototype 1 “support timeline” workflow: ingest Shopify webhook → enrich → create a timeline event.
  - Acceptance: We can run 1 workflow end-to-end with webhook input, see execution history/observability, and export audit trail; decide if it’s a platform primitive candidate.
  - Decision by: 2026-01-08

- **saleor/saleor** — status=poc, priority=52, owner=Shaan
  - stars=22437, license=safe, lang=Python, tags=commerce, returns, payments (https://github.com/saleor/saleor)
  - Notes: POC scoped (auto): Evaluate Saleor’s order/return domain model for reuse: map Shopify order+return concepts to Saleor schema and identify reusable components (returns workflow primitives).

Top 10 shortlist why: Reference-quality commerce domain model; strong place to borrow returns/exchanges primitives and data shapes.

Mining notes (returns/refunds/store credit) — 2025-12-31
- Return products (optional refund + replacement)
  - GraphQL: `orderFulfillmentReturnProducts(order: ID!, input: OrderReturnProductsInput!)`
  - Inputs: `orderLines[]`, `fulfillmentLines[]` (each has id + quantity + `replace`), plus `amountToRefund?`, `includeShippingCosts?`, `refund?`
  - Output: `returnFulfillment`, `replaceFulfillment`, `replaceOrder`
  - Code: `saleor/graphql/order/mutations/fulfillment_return_products.py`, `saleor/order/actions.py` (`create_fulfillments_for_returned_products`)
- Refund products (line-level)
  - GraphQL: `orderFulfillmentRefundProducts`
  - Code: `saleor/graphql/order/mutations/fulfillment_refund_products.py`
- Refund order (amount-level)
  - GraphQL: `orderRefund(id: ID!, amount: Decimal!)`
  - Code: `saleor/graphql/order/mutations/order_refund.py`
- Granted refunds (internal accounting + reason + line linkage)
  - GraphQL: `orderGrantRefundCreate`, `orderGrantRefundUpdate`
  - Code: `saleor/graphql/order/mutations/order_grant_refund_create.py`, `saleor/graphql/order/mutations/order_grant_refund_update.py`
- Process granted refund against a transaction (includes gift-card/store-credit gateway)
  - GraphQL: `transactionRequestRefundForGrantedRefund`
  - Code: `saleor/graphql/payment/mutations/transaction/transaction_request_refund_for_granted_refund.py`
  - Gift card refund behavior (store credit-like): `saleor/giftcard/gateway.py` (`refund_gift_card_transaction` adds balance)

Evergreen summary: `docs/.blackbox/deepresearch/2025-12-31_saleor-returns-refunds-store-credit-domain-model.md`

Concrete file pointers (gift cards / store credit, no cloning)
- `saleor/giftcard/models.py` — GiftCard model (balance/expiry)
- `saleor/giftcard/const.py` — `GIFT_CARD_PAYMENT_GATEWAY_ID`
- `saleor/giftcard/gateway.py` — gateway behavior; refunds adjust gift card balance
- `saleor/giftcard/events.py` — event hooks/history
- `saleor/graphql/giftcard/mutations/gift_card_create.py` — issue gift card
- `saleor/graphql/giftcard/mutations/gift_card_add_note.py` — attach notes (audit-ish)
- `saleor/graphql/giftcard/bulk_mutations/gift_card_bulk_create.py` — bulk issuance
- `saleor/checkout/models.py` — checkout ↔ gift cards + total balance helper
- `saleor/checkout/calculations.py` — `calculate_checkout_total_with_gift_cards`
- `saleor/graphql/payment/mutations/payment/checkout_payment_create.py` — payment creation accounts for gift cards
- `saleor/order/models.py` — order ↔ gift cards + gift card line flags

Evidence (returns model mining):
- Plan summary: `.blackbox/agents/.plans/2025-12-31_2132_returns-model-mining-saleor-solidus-spree/artifacts/summary.md`
- Extracted pointers: `.blackbox/agents/.plans/2025-12-31_2132_returns-model-mining-saleor-solidus-spree/artifacts/extracted.md`
- Contrast: `.blackbox/deepresearch/2025-12-31_returns-domain-model-contrast-saleor-spree-solidus.md`
  - POC timebox: 2 day(s)
  - POC scope: Evaluate Saleor’s order/return domain model for reuse: map Shopify order+return concepts to Saleor schema and identify reusable components (returns workflow primitives).
  - Acceptance: We produce a short mapping doc (Shopify → Saleor) and a decision: adopt parts vs reference-only; identify 1 reusable pattern for returns/exchanges.
  - Decision by: 2026-01-08

- **itswadesh/svelte-commerce** — status=poc, priority=46, owner=Shaan
  - stars=1758, license=safe, lang=Svelte, tags=commerce, cms, search, storefront (https://github.com/itswadesh/svelte-commerce)
  - Notes: Seeded:seeded rank=11/25 ; score=64 ; stars=1758 ; tags=commerce, cms, search
POC scoped (auto): Use this storefront as a concrete reference for “ecommerce search UX” patterns (search box + suggestions, query → results, filtering) and identify what we can reuse for our own storefront and/or internal tools.
Evidence: ecommerce-focused codebase with explicit search tagging; useful to validate search UX + integration points (even if we don’t adopt the full stack).
  - POC timebox: 1 day(s)
  - POC scope: Run and inspect svelte-commerce to extract reusable search UX/integration patterns for ecommerce (search routes, filters, result rendering) and map those to our needs.
  - Acceptance: We can run the app locally, locate its search integration points, and produce a short “Search UX + integration checklist” for our platform (query params, indexing needs, filters). Decide keep/deepen vs reject.
  - Decision by: 2026-01-08

- **Shopify/hydrogen-v1** — status=poc, priority=28, owner=Shaan
  - stars=3739, license=safe, lang=TypeScript, tags=commerce, storefront (https://github.com/Shopify/hydrogen-v1)
  - Notes: Seeded (storefront/blog/components pass):seeded rank=1/25 ; score=76 ; stars=3739 ; tags=commerce

POC scoped (component mining): Component mining POC: identify reusable storefront UI patterns (product grid/card, cart drawer, PDP sections) and how data is fetched via Shopify APIs.

Mining notes (Storefront patterns)
- Patterns to extract:
  - product card + product grid (image handling, price/badge display, skeleton/loading)
  - PDP sections (gallery, variant selector, quantity, add-to-cart, recommendations)
  - cart patterns (cart lines edit, remove, quantity update, optimistic UI)
- Data boundaries:
  - where Storefront API queries live (queries/fragments), and how routes/loaders assemble page data
  - how cart/session state is persisted (cookies/local storage) and refreshed
- Quality bar:
  - responsive behavior (mobile-first), keyboard nav/focus, and predictable empty states

Notes
- Treat as the canonical Shopify storefront reference; copy only from MIT files with attribution.

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-shopify-hydrogen-storefront-primitives.md`
  - POC timebox: 1 day(s)
  - POC scope: Component mining POC: identify reusable storefront UI patterns (product grid/card, cart drawer, PDP sections) and how data is fetched via Shopify APIs.
  - Acceptance: We extract and document at least 5 reusable UI patterns/components with file references and notes on data requirements; plus a short mapping of Shopify Storefront API calls used for product/collection/cart.
  - Decision by: 2026-01-08

- **rehype-pretty/rehype-pretty-code** — status=poc, priority=26, owner=Shaan
  - stars=1266, license=safe, lang=TypeScript, tags=content (https://github.com/rehype-pretty/rehype-pretty-code)
  - Notes: Seeded (blog components v3):seeded rank=1/25 ; score=76 ; stars=1265

POC scoped (component mining): Extract a reusable MDX/Markdown code-block rendering pipeline (rehype/remark) for blog/product storytelling pages, including theme + copy button.
  - POC timebox: 1 day(s)
  - POC scope: Extract a reusable MDX/Markdown code-block rendering pipeline (rehype/remark) for blog/product storytelling pages, including theme + copy button.
  - Acceptance: We produce: (1) a minimal demo snippet showing code block rendering, (2) a list of required deps/options, and (3) a checklist for integrating into our blog/article page (TOC + code blocks + prose styling).
  - Decision by: 2026-01-08

- **authzed/spicedb** — status=poc, priority=25, owner=Shaan
  - stars=6310, license=safe, lang=Go, tags=auth, policy (https://github.com/authzed/spicedb)
  - Notes: Top 10 shortlist why: Zanzibar-style authorization store for fine-grained permissions/entitlements (roles, resources, approvals).

Quick-win POC (1 day): Run SpiceDB locally and model permissions for 1 ops surface (Returns Ops): roles -> actions -> resources.
  - POC timebox: 1 day(s)
  - POC scope: Run SpiceDB locally and model permissions for 1 ops surface (Returns Ops): roles -> actions -> resources.
  - Acceptance: SpiceDB runs locally; schema defines at least 2 roles and 3 actions; 6 permission checks (allow/deny) pass via API/CLI and are saved as a reproducible script/notes.
  - Decision by: 2026-01-08

- **jonyw4/vendure-advanced-shipping** — status=poc, priority=25, owner=Shaan
  - stars=27, license=safe, lang=TypeScript, tags=commerce, shipping (https://github.com/jonyw4/vendure-advanced-shipping)
  - Notes: Seeded (returns/shipping precision pass):seeded rank=1/25 ; score=64 ; stars=27 ; tags=commerce, shipping

Deepen focus: Mine shipping-calculation primitives (boxes/dimensions), rate selection, and how it models carrier/shipping-method constraints in Vendure plugins.

POC scoped (auto): Validate whether Vendure shipping plugins (boxes/dimensions-based shipping) can inform our Shipping adapter model; extract data model + rules primitives and document integration touchpoints.

POC deepening notes (Vendure advanced shipping)

1 day POC plan (steps)
- Extract the required input model (product dims + units) and document the custom fields.
- Extract the package/box model (entity fields + volume/unit conversion).
- Extract the packaging algorithm (single-package + multi-package heuristic).
- Write a minimal ShippingQuote schema (input/output) + 3 example payloads.
- Capture limitations (volume-only heuristic) and propose our fallback behavior when dims are missing.

Integration touchpoints (APIs / webhooks / DB)
- Data inputs: product dimensions (weight/width/height/length + units).
- Packaging output: list of packages with totalWeight and productsWeight.
- Admin surface: “manage packages” UI (pattern only).

Risks + mitigations
- Risk: volume-only heuristic (not true packing).
  - Mitigation: treat as baseline; refine later with per-item packing constraints if needed.
- Risk: missing dims behavior is undefined.
  - Mitigation: define explicit fallback: manual review, default package, or reject quote.

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-vendure-advanced-shipping.md`
  - POC timebox: 1 day(s)
  - POC scope: Validate whether Vendure shipping plugins (boxes/dimensions-based shipping) can inform our Shipping adapter model; extract data model + rules primitives and document integration touchpoints.
  - Acceptance: We can describe a minimal ShippingQuote input/output schema (items, dimensions, destination, carrier/service); map how the plugin computes shipping methods; and produce a short design note + 3 example payloads.
  - Decision by: 2026-01-10

- **vuestorefront/storefront-ui** — status=poc, priority=25, owner=Shaan
  - stars=2424, license=safe, lang=TypeScript, tags=commerce, storefront (https://github.com/vuestorefront/storefront-ui)
  - Notes: Seeded (storefront components v2):seeded rank=1/25 ; score=76 ; stars=2424 ; tags=commerce

POC scoped (component mining): Mine storefront UI primitives (product card/grid, price display, cart controls) and decide if we can reuse patterns/components in our component library.

Mining notes (Storefront UI primitives)
- Identify 6–10 “dumb UI” primitives we can reuse as patterns:
  - ProductCard / ProductGrid
  - Price (currency + discounts)
  - Quantity selector
  - Add-to-cart control
  - Cart item row + totals
  - Drawer/sheet + modal primitives
- For each primitive, capture:
  - props/data contract (inputs)
  - states (loading/empty/error/disabled)
  - responsive rules
  - a11y expectations

Notes
- Prefer adapting patterns/markup; only copy code from MIT files with attribution.
  - POC timebox: 1 day(s)
  - POC scope: Mine storefront UI primitives (product card/grid, price display, cart controls) and decide if we can reuse patterns/components in our component library.
  - Acceptance: We identify at least 6 reusable UI primitives + data props needed; and decide adopt as reference vs reuse code (license ok) vs reject. Document which components map to our PDP/collection/cart pages.
  - Decision by: 2026-01-08

- **goshippo/shippo-php-client** — status=poc, priority=24, owner=Shaan
  - stars=168, license=safe, lang=PHP, tags=— (https://github.com/goshippo/shippo-php-client)
  - Notes: Seeded (shipping carriers v2):seeded rank=2/25 ; score=60 ; stars=168 ; tags=shipping

POC scoped (shipping integration): Use Shippo client as reference for carrier-agnostic rate/label/tracking flow + data model.
  - POC timebox: 1 day(s)
  - POC scope: Evaluate Shippo API client integration patterns (rates + labels + tracking) and define our internal shipping abstraction (carriers, shipments, labels, tracking events).
  - Acceptance: We produce an integration checklist with: (1) rate lookup, (2) label purchase, (3) tracking status ingestion (webhook/poll), and (4) a normalized DB schema for shipments+labels+tracking. Confirm license is safe and SDK is maintained enough for reference/reuse.
  - Decision by: 2026-01-08

- **rajinwonderland/react-code-blocks** — status=poc, priority=24, owner=Shaan
  - stars=636, license=safe, lang=TypeScript, tags=content (https://github.com/rajinwonderland/react-code-blocks)
  - Notes: Seeded (blog components v3):seeded rank=2/25 ; score=72 ; stars=636

POC scoped (component mining): Evaluate code-block UI component (syntax highlight, copy, line numbers) for blog and docs-like pages.
  - POC timebox: 1 day(s)
  - POC scope: Evaluate code-block UI component (syntax highlight, copy, line numbers) for blog and docs-like pages.
  - Acceptance: We confirm: (1) supports at least 3 languages, (2) copy button works, (3) theming can match our design tokens, and (4) it can be wrapped into an MDX renderer without hacks.
  - Decision by: 2026-01-08

- **raystack/frontier** — status=poc, priority=24, owner=Shaan
  - stars=314, license=safe, lang=Go, tags=auth, policy (https://github.com/raystack/frontier)
  - Notes: Seeded (focus returns/shipping/policy/support pass):seeded rank=4/25 ; score=66 ; stars=314 ; tags=auth, policy

Platform primitive POC (2 days): Evaluate Frontier as our authorization/admin permissions primitive: model org/shop -> users -> roles -> permissions and gate 2 ops actions.
  - POC timebox: 2 day(s)
  - POC scope: Evaluate Frontier as our authorization/admin permissions primitive: model org/shop -> users -> roles -> permissions and gate 2 ops actions.
  - Acceptance: Frontier runs locally; we can create 1 org + 1 project/shop + 2 roles (agent/manager) + 2 permissions; 6 permission checks (allow/deny) succeed via API; and we document the integration boundary (where authn lives vs authz decisions).
  - Decision by: 2026-01-08

- **VienDinhCom/next-shopify-storefront** — status=poc, priority=24, owner=Shaan
  - stars=836, license=safe, lang=TypeScript, tags=commerce, storefront (https://github.com/VienDinhCom/next-shopify-storefront)
  - Notes: Seeded (storefront/blog/components pass):seeded rank=2/25 ; score=74 ; stars=836 ; tags=commerce

POC scoped (component mining): Component mining POC: Next.js Shopify storefront patterns (search/listing, PDP layout, cart interactions).

Mining notes (Storefront patterns)
- Treat as a small, readable Shopify storefront reference to mine:
  - product grid/card + pagination
  - search/listing page structure
  - PDP layout + variant selection
  - cart interactions + empty/loading states
- Extract file-level references for our kit blocks (ProductCard/Grid, VariantSelector, CartLines).
  - POC timebox: 1 day(s)
  - POC scope: Component mining POC: Next.js Shopify storefront patterns (search/listing, PDP layout, cart interactions).
  - Acceptance: We list at least 4 components/sections worth reusing (product card/grid, filters/search UI, PDP gallery/variants, cart UI) and note integration touchpoints (API routes/hooks) and required data shapes.
  - Decision by: 2026-01-08

- **bidah/mobile-medusa** — status=poc, priority=23, owner=Shaan
  - stars=115, license=safe, lang=TypeScript, tags=commerce, storefront (https://github.com/bidah/mobile-medusa)
  - Notes: Seeded (storefront starters v3):seeded rank=3/25 ; score=72 ; stars=115 ; tags=commerce

POC scoped (storefront mining): Extract mobile storefront patterns for commerce (catalog browsing, product detail, cart) using Medusa backend and Expo app integration.

Mining notes (Mobile storefront patterns)
- What to extract:
  - navigation + deep link structure for PLP/PDP/cart
  - product card/list patterns and image loading
  - cart UX on mobile (sheet/drawer patterns, qty editing)
  - offline/error states and retry UX
- Use this as a “mobile constraints” reference when designing our web storefront components.
  - POC timebox: 1 day(s)
  - POC scope: Extract mobile storefront patterns for commerce (catalog browsing, product detail, cart) using Medusa backend and Expo app integration.
  - Acceptance: We identify 5 reusable mobile UX patterns (navigation, list/card, PDP, cart, auth) and document the API/data shapes needed; plus a quick decision: reference-only vs reuse components.
  - Decision by: 2026-01-08

- **marmelab/react-admin** — status=poc, priority=23, owner=Shaan
  - stars=26436, license=safe, lang=TypeScript, tags=admin (https://github.com/marmelab/react-admin)
  - Notes: Seeded:seeded rank=3/25 ; score=77 ; stars=26434 ; tags=admin

Quick-win POC (1 day): Scaffold a minimal Returns Ops admin UI (list + filters + bulk action) against a mocked API, to validate time-to-value for admin surfaces.
  - POC timebox: 1 day(s)
  - POC scope: Scaffold a minimal Returns Ops admin UI (list + filters + bulk action) against a mocked API, to validate time-to-value for admin surfaces.
  - Acceptance: UI boots locally; list view renders 20 mock returns; filters work (status + search); one bulk action executes against mock endpoint and updates UI state; RBAC hook point is identified (route guard or action gating).
  - Decision by: 2026-01-08

- **Zehelein/pg-transactional-outbox** — status=poc, priority=23, owner=Shaan
  - stars=35, license=safe, lang=TypeScript, tags=workflows, webhooks, observability (https://github.com/Zehelein/pg-transactional-outbox)
  - Notes: Seeded (outbox+dedupe atleast-once v1 2025-12-30):seeded rank=3/25 ; score=71 ; stars=35 ; tags=support

Triage decision (2025-12-30): deepen: TypeScript + Postgres transactional outbox library; high-fit for our workflow ledger + webhook inbox/outbox reliability.

POC deepening notes (pg-transactional-outbox)

2 day POC plan (steps)
- Use polling mode as v1 (avoid logical replication complexity).
- Extract the exact table schema + indexing strategy for outbox and inbox.
- Define our segment strategy (order_id/customer_id) and default sequential processing.
- Specify the worker loop: lease (locked_until), retries, poison threshold, and cleanup.
- Produce a failure-modes checklist (crash mid-flight, poison, replay/backfill).

Integration touchpoints (APIs / webhooks / DB)
- DB: inbox/outbox tables live alongside workflow state; writes happen in the same transaction as state changes.
- Webhooks: Shopify webhooks are inserted into inbox with a stable idempotency key; handlers emit outbox events.
- Observability: attempt counters + processed/abandoned timestamps drive dashboards/alerts.

Risks + mitigations
- Risk: missing/unstable external webhook ids.
  - Mitigation: derive idempotency keys from (tenant, topic, payload hash) with replay windows.
- Risk: ordering bugs in concurrent workers.
  - Mitigation: segment by order_id and default to sequential per segment.

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-pg-transactional-outbox-reliability-primitives.md`
  - POC timebox: 2 day(s)
  - POC scope: Validate a Postgres transactional outbox implementation for Lumelle webhook/workflow reliability: schema, worker loop, retry/dedupe semantics, and operational knobs. This is pattern + schema mining (not adopting as-is).
  - Acceptance: We can: (1) write an outbox row in the same DB transaction as a business change, (2) run a worker that publishes exactly-once-per-dedupe-key with retries/backoff, (3) document schema + failure modes (poison messages, replay, ordering), and (4) produce a minimal “webhook inbox + outbox” checklist for our runtime.
  - Decision by: 2026-01-10

- **Activiti/Activiti** — status=poc, priority=22, owner=Shaan
  - stars=10495, license=safe, lang=Java, tags=admin, workflows (https://github.com/Activiti/Activiti)
  - Notes: Platform primitive POC (2 days): Evaluate Activiti as a BPM/workflow engine primitive: model 1 returns approval process and run it end-to-end.
  - POC timebox: 2 day(s)
  - POC scope: Evaluate Activiti as a BPM/workflow engine primitive: model 1 returns approval process and run it end-to-end.
  - Acceptance: Activiti runs locally; one BPMN process is deployed; we can start an instance with a JSON payload; and we can observe state transitions across at least 3 steps (e.g. submitted → review → approved/denied). Document integration boundary + effort estimate.
  - Decision by: 2026-01-08

- **basementstudio/next-shopify** — status=poc, priority=22, owner=Shaan
  - stars=32, license=safe, lang=TypeScript, tags=commerce, storefront (https://github.com/basementstudio/next-shopify)
  - Notes: Seeded (storefront starters v3):seeded rank=8/25 ; score=67 ; stars=32 ; tags=commerce

POC scoped (storefront mining): Extract a reusable Next.js Shopify Storefront API integration pattern (cart + product/collection fetching) and identify 4 UI/UX patterns to reuse (cart drawer, variant selector, product grid, filters).

Mining notes (Storefront integration patterns)
- What to extract:
  - cart context/provider patterns and mutation handling
  - Storefront API query/mutation organization (fragments, cart lines, selectedOptions)
  - error recovery + idempotency patterns for cart mutations
- Treat as a small reference implementation (even if the repo is low-star).
  - POC timebox: 1 day(s)
  - POC scope: Extract a reusable Next.js Shopify Storefront API integration pattern (cart + product/collection fetching) and identify 4 UI/UX patterns to reuse (cart drawer, variant selector, product grid, filters).
  - Acceptance: We document: (1) API integration points (handlers/hooks), (2) required Storefront API queries/mutations for cart + product/collection, and (3) at least 4 reusable UI patterns with props/data requirements and file references.
  - Decision by: 2026-01-08

- **packdigital/pack-hydrogen-theme-blueprint** — status=poc, priority=22, owner=Shaan
  - stars=88, license=safe, lang=TypeScript, tags=commerce, storefront, content (https://github.com/packdigital/pack-hydrogen-theme-blueprint)
  - Notes: Seeded (storefront/blog/components pass):seeded rank=9/25 ; score=74 ; stars=88 ; tags=commerce

POC scoped (component mining): Component mining POC: Hydrogen theme blueprint sections for marketing + commerce (hero, testimonials, product grid, featured collection).

Mining notes (Storefront sections kit)
- Treat as a high-signal source for “storefront-ready sections” (not just marketing):
  - featured collection / product grid sections
  - hero + CTA blocks that integrate with commerce data
  - testimonials/newsletter blocks that match storefront styling
- Extraction goals:
  - identify canonical section shells (container + heading + body + CTA)
  - document how sections accept data props (collection, products)
  - capture a11y + responsive patterns for repeated sections
  - POC timebox: 1 day(s)
  - POC scope: Component mining POC: Hydrogen theme blueprint sections for marketing + commerce (hero, testimonials, product grid, featured collection).
  - Acceptance: We extract at least 6 section patterns (hero, FAQ, testimonials, product grid, collection highlight, newsletter) and record which can be ported to our component library with minimal changes.
  - Decision by: 2026-01-08

- **tomatophp/filament-ecommerce** — status=poc, priority=21, owner=Shaan
  - stars=96, license=safe, lang=PHP, tags=commerce, shipping (https://github.com/tomatophp/filament-ecommerce)
  - Notes: Seeded (returns/shipping v6 precision):seeded rank=5/25 ; score=62 ; stars=96 ; tags=commerce, shipping

POC scoped (shipping/admin patterns): Use Filament ecommerce as a reference for shipping/fulfillment admin UX (tables, filters, status transitions, bulk actions).
  - POC timebox: 1 day(s)
  - POC scope: Evaluate Filament ecommerce admin patterns for shipping/fulfillment operations: identify reusable admin tables/actions for shipments and order fulfillment status updates.
  - Acceptance: We can run the project locally OR read enough code/docs to extract (1) shipment/fulfillment data model fields, (2) at least 3 admin UI patterns (table filters, bulk actions, status transitions), and (3) a decision: reference-only vs reuse patterns. License is confirmed safe.
  - Decision by: 2026-01-08

- **AthenZ/athenz** — status=poc, priority=18, owner=Shaan
  - stars=978, license=safe, lang=Java, tags=support, auth, policy (https://github.com/AthenZ/athenz)
  - Notes: Seeded (focus returns/shipping/policy/support pass):seeded rank=16/25 ; score=62 ; stars=978 ; tags=support, auth, policy

Platform primitive POC (2 days): Assess Athenz as a policy/auth service for service-to-service and ops authorization; prove it can express 1 approval policy and audit it.
  - POC timebox: 2 day(s)
  - POC scope: Assess Athenz as a policy/auth service for service-to-service and ops authorization; prove it can express 1 approval policy and audit it.
  - Acceptance: Athenz runs locally; we define one domain + one policy; 4 allow/deny checks pass; and we can export policy/config plus a minimal audit log of decisions (timestamps + subject + resource + decision).
  - Decision by: 2026-01-08

- **LekoArts/gatsby-starter-minimal-blog** — status=poc, priority=18, owner=Shaan
  - stars=1153, license=safe, lang=MDX, tags=content, blog (https://github.com/LekoArts/gatsby-starter-minimal-blog)
  - Notes: Seeded (storefront/content pass):seeded rank=8/25 ; score=59 ; stars=1153 ; tags=content, blog

License verified: GitHub /license reports `0BSD` (permissive).

Deepen focus: Mine blog page primitives (TOC, code blocks w/ line highlighting, tags/categories, SEO) to inform our blog/components kit.

POC scoped (auto): Mine blog page primitives (TOC, code blocks with line highlighting, tags/categories, SEO) into our content/components kit; produce a component checklist and mapping for Lumelle blog pages.

POC deepening notes (LekoArts minimal blog)

1 day POC plan (steps)
- Identify the actual implementation repo for core primitives (theme): `LekoArts/gatsby-themes` → `gatsby-theme-minimal-blog`.
- Extract MDX rendering primitives:
  - MDX component map
  - pre→code block transformation
- Extract CodeBlock primitives:
  - copy button UX + accessibility label
  - optional line numbers
  - highlight-lines model
  - optional title/filename header
- Extract blog list primitives:
  - `BlogPostCard` / list item + tag links
- Extract SEO primitives:
  - title/description/image
  - canonical URL
  - OG/Twitter meta

Integration touchpoints (APIs / webhooks / DB)
- Content source: markdown/MDX + frontmatter (framework-agnostic concept).
- Rendering: component map + safe HTML handling.
- No backend integration required; this is UI pattern mining.

Risks + mitigations
- Risk: Gatsby-specific APIs.
  - Mitigation: extract patterns (contracts) and re-implement in our stack; avoid copying Gatsby glue.

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-lekoarts-blog-primitives.md`
  - POC timebox: 1 day(s)
  - POC scope: Mine blog page primitives (TOC, code blocks with line highlighting, tags/categories, SEO) into our content/components kit; produce a component checklist and mapping for Lumelle blog pages.
  - Acceptance: We add at least 8 concrete “blog primitives” to `.blackbox/oss-catalog/component-source-map.md` and update our blocks/contracts docs with 3 reusable blocks (e.g. TOC, Callout, CodeBlock).
  - Decision by: 2026-01-10

- **papercups-io/chat-widget** — status=poc, priority=18, owner=Shaan
  - stars=268, license=safe, lang=TypeScript, tags=support (https://github.com/papercups-io/chat-widget)
  - Notes: Seeded (support timeline v1 pass 2025-12-30):seeded rank=7/25 ; score=74 ; stars=268

Triage decision (2025-12-30): deepen: Embeddable chat widget UI; mine for widget embedding, identity handoff, and conversation UI patterns.

Concrete file pointers (no cloning)
- `src/components/ChatWidget.tsx` — main widget component
- `src/components/ChatWidgetContainer.tsx` — container + state wiring
- `src/components/ChatWindow.tsx` — conversation window UI
- `src/components/WidgetToggle.tsx` — open/close toggle
- `src/index.tsx` — package entry
- `example/src/App.tsx` — embed usage example
- `LICENSE` — MIT

POC deepening notes (Papercups chat-widget)

1 day POC plan (steps)
- Run the widget example locally and confirm basic embed works.
- Identify required init parameters (account/app id, user identity).
- Define our identity payload contract: `external_user_id`, `email?`, `name?`, `shop_id`, `order_id?`.
- Embed widget into a simple internal page (stub) and wire identity handoff.
- Confirm conversation/thread creation + message send path (or document limitations if backend is required).
- Write down the boundary: what is UI-only vs what requires Papercups server.

Integration touchpoints (APIs / webhooks / DB)
- Embed/loader: JS/TS bundle + init call inside our admin shell.
- Identity: map Lumelle user/shop/order context → widget identity payload.
- Conversation linkage: if supported, attach metadata (order_id/customer_id) to thread for timeline indexing.
- Data retention: decide whether messages are stored externally, mirrored internally, or treated as transient UI.

Risks + mitigations
- Risk: widget is coupled to a specific backend service.
  - Mitigation: treat as UX reference; keep our event/timeline model independent.
- Risk: auth/identity mismatch.
  - Mitigation: require stable `external_user_id` + signed token (if supported); never trust client-only identity.
  - POC timebox: 1 day(s)
  - POC scope: Embed the Papercups widget on a minimal Lumelle admin/support page; validate identity handoff + conversation lifecycle boundaries.
  - Acceptance: Widget can be embedded on a page, opens/closes reliably, and can associate a conversation to a stable external user_id; we can enumerate the integration touchpoints and decide adopt vs reject.
  - Decision by: 2026-01-10

- **paed01/bpmn-engine** — status=poc, priority=17, owner=Shaan
  - stars=958, license=safe, lang=JavaScript, tags=workflows (https://github.com/paed01/bpmn-engine)
  - Notes: Seeded:seeded rank=15/25 ; score=74 ; stars=958 ; tags=workflows

Platform primitive POC (2 days): Prototype a BPMN-based workflow primitive for a returns approval process and measure integration complexity.
  - POC timebox: 2 day(s)
  - POC scope: Prototype a BPMN-based workflow primitive for a returns approval process and measure integration complexity.
  - Acceptance: Engine runs locally; one BPMN process is deployed; we start 3 process instances with different inputs; each reaches a terminal state (approved/denied) with observable step progression; and we identify the exact integration points needed (webhook input, task handlers, persistence).
  - Decision by: 2026-01-08

- **takeshape/penny** — status=poc, priority=17, owner=Shaan
  - stars=79, license=safe, lang=TypeScript, tags=commerce, storefront (https://github.com/takeshape/penny)
  - Notes: Seeded (storefront+content pass):seeded rank=9/25 ; score=72 ; stars=79 ; tags=commerce

Deepen focus: Next.js v14 composable commerce starter with Storybook + Playwright; mine PLP/PDP/cart patterns + component testing setup.

POC scoped (auto): Mine a modern Next.js v14 commerce starter for PLP/PDP/cart patterns + testing/storybook setup; extract a reusable component map and state management approach.

POC deepening notes (Penny)

1 day POC plan (steps)
- Map the route + feature boundaries (PLP/PDP/cart/search) and capture the component map.
- Extract cart state model:
  - cart item identity key
  - derived totals (qty/subtotal)
- Extract checkout handoff recovery pattern (success vs cancel) and how it clears/persists cart.
- Extract search modal structure (hook/query/UI separation).
- Record testing posture (Storybook stories + Playwright) as a reusable pattern.

Integration touchpoints (APIs / webhooks / DB)
- Storefront API: GraphQL queries + typed transforms.
- UI state: Jotai atoms for cart/search drawers.
- Checkout return: query param based state transition (`shopify_checkout_action`).

Risks + mitigations
- Risk: starter decisions are TakeShape-specific.
  - Mitigation: extract only framework-agnostic patterns + stable contracts.

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-takeshape-penny.md`
  - POC timebox: 1 day(s)
  - POC scope: Mine a modern Next.js v14 commerce starter for PLP/PDP/cart patterns + testing/storybook setup; extract a reusable component map and state management approach.
  - Acceptance: We produce a component map covering PLP, PDP, cart, search UX + state boundaries, and add 10 file pointers into `component-source-map.md` (routes/components/hooks).
  - Decision by: 2026-01-10

- **aipotheosis-labs/gate22** — status=poc, priority=16, owner=Shaan
  - stars=150, license=safe, lang=TypeScript, tags=auth, policy (https://github.com/aipotheosis-labs/gate22)
  - Notes: Seeded:seeded rank=22/25 ; score=74 ; stars=150 ; tags=auth, policy

Platform primitive POC (2 days): Evaluate Gate22 as a policy/auth control plane for agent/tool usage: define 2 policies and enforce allow/deny for 2 tools.
  - POC timebox: 2 day(s)
  - POC scope: Evaluate Gate22 as a policy/auth control plane for agent/tool usage: define 2 policies and enforce allow/deny for 2 tools.
  - Acceptance: Gate22 runs locally; 2 policies are configured; 2 tools/actions are tested (one allowed, one denied); enforcement is logged with a reason; and we can describe how it would integrate with our workflow runtime + audit log.
  - Decision by: 2026-01-08

- **django-helpdesk/django-helpdesk** — status=poc, priority=16, owner=Shaan
  - stars=1652, license=safe, lang=Python, tags=support (https://github.com/django-helpdesk/django-helpdesk)
  - Notes: Seeded (support timeline v1 pass 2025-12-30):seeded rank=22/25 ; score=68 ; stars=1652 ; tags=support

Triage decision (2025-12-30): deepen: Solid ticketing/helpdesk primitives (schemas, states, assignments) we can mine for support timeline + internal ops inbox patterns.

Concrete file pointers (no cloning)
- `src/helpdesk/models.py` — Ticket/FollowUp/Queue-ish domain model
- `src/helpdesk/forms.py` — create/update ticket forms
- `src/helpdesk/urls.py` — route map
- `src/helpdesk/views/api.py` — API endpoints (if needed for embed)
- `src/helpdesk/views/staff.py` — staff dashboard + ticket views
- `src/helpdesk/views/public.py` — public-facing ticket flows
- `src/helpdesk/templates/helpdesk/dashboard.html` — dashboard template
- `src/helpdesk/templates/helpdesk/create_ticket.html` — create ticket UI
- `src/helpdesk/templates/helpdesk/edit_ticket.html` — edit ticket UI
- `LICENSE` — BSD-2-Clause

POC deepening notes (django-helpdesk)

2 day POC plan (steps)
- Read the core model files to extract the canonical primitives (Ticket, FollowUp/Message, Queue, User assignment).
- Document the state machine: statuses, transitions, and who can change what.
- Identify timestamps we need for ops (created, first_response, last_response, resolved).
- Review staff/public views to see the default workflows (create, reply, close, reopen).
- Produce a Lumelle mapping: `SupportThread`, `SupportMessage`, `SupportAssignment`, `SupportTag`, `SupportSLA` fields.

Integration touchpoints (APIs / webhooks / DB)
- DB: ticket + follow-up tables become our reference for a minimal schema.
- API: check `views/api.py` patterns if we want an embeddable inbox UI later.
- Email ingestion: identify how inbound email is attached to threads (if present) and what we’d replicate.

Risks + mitigations
- Risk: Django-specific assumptions leak into our design.
  - Mitigation: only adopt the domain primitives + state machine concepts; keep implementation stack-agnostic.
  - POC timebox: 2 day(s)
  - POC scope: Mine django-helpdesk ticket/thread model + status transitions and map them to Lumelle Support Timeline primitives (Thread, Message, Assignment, SLA timestamps).
  - Acceptance: We can name the minimal schema for Thread/Message/Assignment + states, map them to our unified timeline event model, and identify which primitives are worth adopting vs rebuilding.
  - Decision by: 2026-01-10

- **kestra-io/kestra** — status=poc, priority=7, owner=Shaan
  - stars=26176, license=safe, lang=Java, tags=workflows (https://github.com/kestra-io/kestra)
  - Notes: Seeded:seeded rank=19/25 ; score=65 ; stars=26154 ; tags=workflows

Top 10 shortlist why: Battle-tested workflow orchestration primitive (schedules, retries, visibility) to run ops automations safely.

Quick-win POC (1 day): Run Kestra locally and implement 1 webhook-driven ops workflow (e.g. return approval) with retries + audit-friendly logs.
  - POC timebox: 1 day(s)
  - POC scope: Run Kestra locally and implement 1 webhook-driven ops workflow (e.g. return approval) with retries + audit-friendly logs.
  - Acceptance: Kestra runs locally; 1 flow is triggered via webhook; flow completes successfully; retry can be forced and observed; run history shows inputs/outputs and timestamps.
  - Decision by: 2026-01-08

- **vercel/commerce** — status=deepen, priority=27, owner=Shaan
  - stars=13786, license=safe, lang=TypeScript, tags=commerce, shopify, storefront (https://github.com/vercel/commerce)
  - Notes: Added (manual): High-signal storefront reference for Next.js + Shopify.

Component mining focus
- PLP/collections (grid + tiles) and search/listing URL state
- PDP patterns (gallery, variant selector)
- Cart patterns (drawer/modal, optimistic quantity updates)
- Shopify Storefront API boundaries (queries/fragments + cart mutations)

Concrete file pointers (no cloning)
Routes
- `app/page.tsx` (home)
- `app/search/page.tsx` + `app/search/[collection]/page.tsx` (listing/search)
- `app/product/[handle]/page.tsx` (PDP)

UI components
- `components/grid/*` (tiles + grids)
- `components/product/variant-selector.tsx` + `components/product/gallery.tsx`
- `components/cart/*` (cart context + add/edit/delete + modal)

Shopify API glue
- `lib/shopify/queries/*` + `lib/shopify/mutations/*` + `lib/shopify/fragments/*` (Storefront API)
- `lib/shopify/index.ts` + `lib/shopify/types.ts` (client + types)

POC intent
- Extract 6–8 reusable patterns with data requirements and a11y notes; treat as a reference source (MIT; copy only with attribution).

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-vercel-commerce-storefront-primitives.md`
  - POC timebox: 1 day(s)
  - POC scope: Storefront component mining: map PLP/PDP/cart primitives + Storefront API boundaries in Vercel Commerce; extract reusable patterns + data requirements for our Blocks Kit storefront.
  - Acceptance: We document (with file pointers) at least: product tile/grid pattern, PDP variant selector, cart state/actions, and the Storefront API query/mutation boundaries used. Produce a short “patterns + data contract” checklist to implement in our Blocks Kit.
  - Decision by: 2026-01-10

- **alyssaxuu/flowy** — status=deepen, priority=25, owner=Shaan
  - stars=11929, license=safe, lang=JavaScript, tags=workflows, admin (https://github.com/alyssaxuu/flowy)
  - Notes: Seeded (sections/components pass):seeded rank=1/25 ; score=77 ; stars=11929 ; tags=workflows

Triage: keep (deepen). Minimal JS flowchart/canvas library; mine interaction model for a future workflow editor surface (drag/drop nodes, connectors).
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **Blazity/enterprise-commerce** — status=deepen, priority=25, owner=Shaan
  - stars=654, license=safe, lang=TypeScript, tags=commerce, returns, search, storefront (https://github.com/Blazity/enterprise-commerce)
  - Notes: Seeded (storefront pattern mining v3 2025-12-30):seeded rank=1/25 ; score=74 ; stars=654 ; tags=commerce, returns, search

Promote to deepen: strong Next.js commerce starter; mine cart/variants/collection filters patterns + architecture decisions.

Mining notes (Storefront patterns)
- Patterns to extract:
  - PLP filters/facets (URL-synced state, “clear all”, selected filters UI)
  - search UX (Algolia middle layer): autocomplete, zero-results states, facets
  - PDP variant selector patterns + availability/disabled options
  - cart UX (drawer/minicart if present) + line item editing
- Architecture to capture:
  - boundary between Shopify backend + search layer + UI
  - data normalization layer (how they model product/variant/collection for UI)
  - caching/prefetch patterns for browsing journey performance

Notes
- Use as reference; copy only from MIT files with attribution.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **cheekujha/react-table-filter** — status=deepen, priority=25, owner=Shaan
  - stars=64, license=safe, lang=JavaScript, tags=— (https://github.com/cheekujha/react-table-filter)
  - Notes: Seeded (admin table filters/saved views v1 2025-12-30):seeded rank=1/25 ; score=74 ; stars=64

Promote to deepen: table column filter UI pattern (Excel-like). Mine UX + filter model; adapt to our admin grids.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **homerchen19/use-undo** — status=deepen, priority=25, owner=Shaan
  - stars=412, license=safe, lang=TypeScript, tags=— (https://github.com/homerchen19/use-undo)
  - Notes: Seeded (admin bulk actions/undo/optimistic v1 2025-12-30):seeded rank=1/25 ; score=74 ; stars=412

Promote to deepen: clean undo/redo hook; candidate for bulk-edit undo stack in admin (and potentially storefront cart edits).
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **lambda-curry/medusa2-starter** — status=deepen, priority=25, owner=Shaan
  - stars=145, license=safe, lang=TypeScript, tags=commerce, storefront (https://github.com/lambda-curry/medusa2-starter)
  - Notes: Seeded (storefront/blog components pass):seeded rank=1/25 ; score=74 ; stars=145 ; tags=commerce, storefront

Triage decision (2025-12-31): deepen: end-to-end storefront starter (Medusa2 + Remix) with Stripe; high-signal reference for real-world storefront primitives and repo structure.

Mining notes (Storefront patterns)
- UI primitives to extract: product cards/grids, PDP layout, cart lines/cart drawer (if present), empty/loading states.
- Data boundaries: how Remix loaders/actions fetch and mutate cart/checkout state (separate UI from server calls).
- Checkout/integrations: Stripe integration touchpoints; any webhook handling patterns.
- Repo structure: monorepo conventions (packages/apps), shared UI components, and env/config handling.

Notes
- Use as pattern reference; copy only from MIT files and keep attribution.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **mertJF/tailblocks** — status=deepen, priority=25, owner=Shaan
  - stars=8919, license=safe, lang=JavaScript, tags=— (https://github.com/mertJF/tailblocks)
  - Notes: Seeded (sections/components pass):seeded rank=1/25 ; score=77 ; stars=8918

Triage decision (2025-12-30): deepen: high-signal Tailwind “blocks” library; mine pricing/testimonials/FAQ/newsletter sections.

Mining notes (Blocks Kit v1)

What to mine
- Pricing blocks: 1 simple, 1 comparison table, 1 with “most popular” highlight.
- Testimonials blocks: grid + single-quote hero; note how avatars/ratings are handled.
- FAQ blocks: 2 variants (simple list vs accordion).
- Newsletter blocks: inline subscribe + section subscribe (with privacy note).

Extraction checklist
- Record container width + padding conventions used across blocks.
- Capture the responsive layout rules (stacking order + breakpoints).
- Note typography scale (heading sizes, body line-length) and spacing rhythm.

Notes
- Source map: docs/.blackbox/oss-catalog/blocks-inventory.md (Sections Kit v1).
- Prefer patterns over wholesale copy; keep attribution for any adapted snippets.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **mholt/PapaParse** — status=deepen, priority=25, owner=Shaan
  - stars=13317, license=safe, lang=JavaScript, tags=— (https://github.com/mholt/PapaParse)
  - Notes: Seeded (clipboard csv/tsv validation v1 2025-12-30):seeded rank=1/25 ; score=77 ; stars=13317

Promote to deepen: best-in-class CSV parsing; useful for import + paste workflows and malformed CSV handling.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **pbeshai/use-query-params** — status=deepen, priority=25, owner=Shaan
  - stars=2221, license=safe, lang=TypeScript, tags=admin, storefront (https://github.com/pbeshai/use-query-params)
  - Notes: Seeded (filter state + URL sync v1 2025-12-30):seeded rank=1/25 ; score=76 ; stars=2221

Promote to deepen: mature URL query param state management; useful for saved views + facet filters in storefront/admin.

Mining notes (URL-synced state)
- Use as the reference for “URL is source of truth” patterns:
  - filters/facets on PLP
  - saved views in admin tables
  - shareable links + back/forward navigation correctness
- What to extract:
  - encoding/decoding arrays, enums, booleans, ranges (price range)
  - default handling + unknown param stripping
  - SSR considerations (server render vs client hydration)
- Acceptance criteria for our kit:
  - filter UI can round-trip from URL → UI state → URL without drift
  - deep links restore state reliably
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **searchkit/searchkit** — status=deepen, priority=25, owner=Shaan
  - stars=4854, license=safe, lang=TypeScript, tags=search (https://github.com/searchkit/searchkit)
  - Notes: Seeded (search components facets/autocomplete v1 2025-12-30):seeded rank=1/25 ; score=76 ; stars=4854 ; tags=search

Promote to deepen: strong search UI + facets stack (Elastic/OpenSearch) and InstantSearch-compatible — can mine patterns for faceted filtering + query state + UI composition.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **TanStack/form** — status=deepen, priority=25, owner=Shaan
  - stars=6186, license=safe, lang=TypeScript, tags=returns, cms (https://github.com/TanStack/form)
  - Notes: Seeded (tsv paste + type coercion v1 2025-12-30):seeded rank=1/25 ; score=77 ; stars=6186 ; tags=returns, cms

Promote to deepen: type-safe form state management; can inform validation/coercion pipelines and error presentation for bulk edit/import.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **voucherifyio/voucher-code-generator-js** — status=deepen, priority=25, owner=Shaan
  - stars=270, license=safe, lang=JavaScript, tags=— (https://github.com/voucherifyio/voucher-code-generator-js)
  - Notes: Seeded (store-credit/gift-card pass):seeded rank=1/25 ; score=74 ; stars=270
Triage: deepen — Good primitive for generating redemption codes (gift card / store credit vouchers); MIT; small surface area.

Concrete file pointers (no cloning)
- `voucher_codes.js` — core generator logic + configuration knobs
- `test/` — unit tests / expected formats
- `README.md` — API + examples
- `LICENSE` — verify permissive terms (MIT)
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **withastro/storefront** — status=deepen, priority=25, owner=Shaan
  - stars=763, license=safe, lang=TypeScript, tags=commerce, storefront (https://github.com/withastro/storefront)
  - Notes: Seeded (storefront+blog components pass 2025-12-30):seeded rank=1/25 ; score=74 ; stars=763 ; tags=commerce

Triage decision (2025-12-31): deepen: Astro storefront reference; mine performance-first patterns (static+islands), product grid/card layout, and cart UX tradeoffs.

Mining notes (Storefront patterns)
- What to extract:
  - PLP product grid/card: image strategy, skeletons, pagination
  - PDP layout: gallery + variants + add-to-cart states
  - performance patterns: island boundaries, data loading split, caching
- Use as a contrast reference vs Next.js/Remix (Hydrogen/Medusa) to avoid overbuilding runtime requirements.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **Keyang/node-csvtojson** — status=deepen, priority=24, owner=Shaan
  - stars=2029, license=safe, lang=TypeScript, tags=— (https://github.com/Keyang/node-csvtojson)
  - Notes: Seeded (clipboard csv/tsv validation v1 2025-12-30):seeded rank=2/25 ; score=76 ; stars=2029

Promote to deepen: CSV→JSON conversion (Node/browser); evaluate performance + error reporting for admin imports.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **kinngh/shopify-nextjs-prisma-app** — status=deepen, priority=24, owner=Shaan
  - stars=501, license=safe, lang=JavaScript, tags=commerce, shopify, admin, auth, webhooks (https://github.com/kinngh/shopify-nextjs-prisma-app)
  - Notes: Seeded (storefront templates pass):seeded rank=2/25 ; score=74 ; stars=501 ; tags=commerce

Deepen notes — 2025-12-31
Why this matters
- This is the cleanest OSS reference for Shopify app primitives we need (auth/session/webhooks) without adopting a whole commerce platform.

Concrete file pointers (no cloning)
Auth + request verification
- `utils/shopify.js` (Shopify client/config)
- `utils/sessionHandler.js` (session storage)
- `utils/middleware/verifyRequest.js` (request gating)
- `utils/middleware/verifyHmac.js` (HMAC verification)

API surfaces
- `pages/api/index.js` (API entry)
- `pages/api/graphql.js` (GraphQL proxy example)
- `pages/api/webhooks/[...webhookTopic].js` (webhook handler)
- `pages/api/proxy_route/json.js` (app proxy example)
- `pages/api/gdpr/*` (GDPR webhooks)

DB
- `prisma/schema.prisma` (DB schema)
- `utils/prisma.js` (Prisma client)

What to extract
- Our canonical Shopify app checklist: OAuth, session storage, webhook verification, and least-privilege scopes.
  - POC timebox: 1 day(s)
  - POC scope: Run the embedded Shopify app starter locally and validate the core integration path: OAuth install, session storage (Prisma), one GraphQL call, and one webhook receipt + HMAC verification.
  - Acceptance: We can install the app into a dev Shopify store, persist an offline session via Prisma, successfully call Shopify Admin API/GraphQL for 1 read action, and receive+verify a webhook (HMAC) end-to-end.
  - Decision by: 2026-01-10

- **rudyhuynh/use-url-search-params** — status=deepen, priority=24, owner=Shaan
  - stars=66, license=safe, lang=TypeScript, tags=search (https://github.com/rudyhuynh/use-url-search-params)
  - Notes: Seeded (filter state + URL sync v1 2025-12-30):seeded rank=2/25 ; score=72 ; stars=66 ; tags=search

Promote to deepen: simple URL search param state hook; evaluate API ergonomics vs use-query-params.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **TanStack/table** — status=deepen, priority=24, owner=Shaan
  - stars=27498, license=safe, lang=TypeScript, tags=cms (https://github.com/TanStack/table)
  - Notes: Seeded (admin topics v1 2025-12-30):seeded rank=2/25 ; score=77 ; stars=27498 ; tags=cms

Promote to deepen: core table engine for admin grids (selection, sorting, filtering, pagination). Strong base for bulk-edit tooling.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **typesense/typesense-instantsearch-adapter** — status=deepen, priority=24, owner=Shaan
  - stars=505, license=safe, lang=JavaScript, tags=search (https://github.com/typesense/typesense-instantsearch-adapter)
  - Notes: Seeded (search components facets/autocomplete v1 2025-12-30):seeded rank=2/25 ; score=74 ; stars=505 ; tags=search

Promote to deepen: key adapter for Typesense + InstantSearch; useful for building reusable search/facet components in our storefront/admin.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **xplato/useUndoable** — status=deepen, priority=24, owner=Shaan
  - stars=182, license=safe, lang=TypeScript, tags=— (https://github.com/xplato/useUndoable)
  - Notes: Seeded (admin bulk actions/undo/optimistic v1 2025-12-30):seeded rank=2/25 ; score=72 ; stars=182

Promote to deepen: batteries-included undoable hook; evaluate history size, performance, and API ergonomics.
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date

- **ant-design/ant-design-landing** — status=deepen, priority=23, owner=Shaan
  - stars=6491, license=safe, lang=JavaScript, tags=content, marketing (https://github.com/ant-design/ant-design-landing)
  - Notes: Seeded (sections/components pass):seeded rank=3/25 ; score=77 ; stars=6491

Triage: keep (deepen). Strong library of landing-page section blocks (Banner/Nav/Content/Pricing/Teams/Footer). Add file pointers into component source map; reference-only.

Evidence:
- Plan artifact: `.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/deepen-section-kits-marketing-blocks.md`
  - POC timebox: 2 day(s)
  - POC scope: TODO: define concrete scope
  - Acceptance: TODO: define measurable acceptance criteria
  - Decision by: TODO: set a decision date
