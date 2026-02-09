# Lane: Returns / RMA + Store credit

Goal: find OSS implementations of **returns primitives** we can mine or integrate:
- RMA lifecycle (request → approve → label → receive → inspect → refund/store credit → restock)
- store credit issuance/redemption (with audit trail)
- return label + carrier handoff patterns

Returns OSS is typically **low-star, ecosystem-specific, and noisy** in search results.
This lane focuses on extracting reusable *models and flows*, not adopting a full commerce platform.

## Status (2025-12-31)

We’ve hit **diminishing returns** on GitHub repo search for returns/RMA:
- Two low-stars passes (min-stars=5) produced **0 new keepers** (all non-trivial hits were already in our catalog/curation).
- A follow-up lane-only pass (2025-12-31, min-stars=5, no boosts) produced an **empty tranche** (all candidates already seen / filtered by prefer-new).
- Action: **pause returns repo hunting** and pivot to:
  - mining returns flows/models from full commerce platforms already in curation (Saleor/Solidus/Spree/etc)
  - building our own returns lifecycle backed by higher-leverage primitives we *do* have (workflow + policy + audit)

## What we’re looking for (high-signal)

### RMA lifecycle primitives
- RMA entity + state machine (requested/approved/in transit/received/inspected/refunded/closed)
- Return reasons taxonomy + policy gates (time window, condition, exceptions)
- Return item inspection + restock/disposal flags

### Store credit primitives
- Credit issuance (amount, currency, scope, expiry)
- Redemption rules + partial redemption
- Audit ledger (who issued, why, linked order/return)

### Label + logistics glue
- Return label generation + tracking
- Carrier/warehouse integration boundaries (without becoming a full WMS)

## What we explicitly avoid (to reduce churn)
- Ambiguous “RMA” hits unrelated to e-commerce (hardware RMA, ChromeOS RMA shim, etc)
- Repos that only mention “returns” as a programming verb (“function returns …”)
- Copyleft runtime dependencies (AGPL/GPL) unless reference-only

## Current curated highlights (from our catalog/curation)

Keepers (real returns/store-credit signals):
- `auroraextensions/simplereturns` (deepen) — Magento self-service RMA module; mine the data model + lifecycle
- `solidusio-contrib/solidus_virtual_gift_card` (watch) — store credit/gift card primitive for Solidus; reference for issuance/redemption flows

Reference-only (full platforms with relevant modules):
- `saleor/saleor` (poc, BSD-3-Clause) — reference-quality returns/refunds + gift cards as “store credit” rail; best source for “refund owed vs refund executed” pattern
- `spree/spree` (poc, license=verify) — large commerce stack; mine return/refund/store-credit patterns (store credit ledger + reimbursements + return items)
- `solidusio/solidus` (watch, license=verify) — large commerce stack; mine store credit + refunds patterns

## Where to mine (file pointers, no cloning)

Evergreen notes:
- Saleor deep dive: `docs/.blackbox/deepresearch/2025-12-31_saleor-returns-refunds-store-credit-domain-model.md`
- Cross-platform contrast: `docs/.blackbox/deepresearch/2025-12-31_returns-domain-model-contrast-saleor-spree-solidus.md`

Saleor (returns/refunds + “store credit” via gift cards):
- Return products (+ optional refund + optional replacement exchange):
  - `saleor/graphql/order/mutations/fulfillment_return_products.py`
- Refund products (line-level):
  - `saleor/graphql/order/mutations/fulfillment_refund_products.py`
- Refund order (amount-level “ops escape hatch”):
  - `saleor/graphql/order/mutations/order_refund.py`
- “Refund owed” vs “refund processed” split:
  - `saleor/graphql/order/mutations/order_grant_refund_create.py`
  - `saleor/graphql/order/mutations/order_grant_refund_update.py`
  - `saleor/graphql/payment/mutations/transaction/transaction_request_refund_for_granted_refund.py`
- Gift cards as store credit rail:
  - `saleor/giftcard/models.py`, `saleor/giftcard/events.py`, `saleor/giftcard/gateway.py`

Solidus (store credit ledger + reimbursements + RMA state machine):
- Store credit ledger:
  - `core/app/models/spree/store_credit.rb`
  - `core/app/models/spree/store_credit_event.rb`
  - `core/app/models/spree/payment_method/store_credit.rb`
- Returns core:
  - `core/app/models/spree/return_authorization.rb`
  - `core/app/models/spree/core/state_machines/return_authorization.rb`
  - `core/app/models/spree/customer_return.rb`
  - `core/app/models/spree/return_item.rb`
- Reimbursements (tie returns → original payment vs store credit):
  - `core/app/models/spree/reimbursement.rb`
  - `core/app/models/spree/reimbursement_type/store_credit.rb`
  - `core/app/models/spree/reimbursement_type/original_payment.rb`

Spree (reference-only; license is copyleft for v4.10+ contributions):
- Similar models exist and are useful for comparison only:
  - `core/app/models/spree/store_credit.rb`, `core/app/models/spree/store_credit_event.rb`
  - `core/app/models/spree/return_authorization.rb`, `core/app/models/spree/return_item.rb`, `core/app/models/spree/customer_return.rb`
  - `core/app/models/spree/reimbursement.rb`, `core/app/models/spree/reimbursement_type.rb`

## Recommended next runs (commands)

Low-stars returns pass (ecosystem-specific, higher noise but better coverage):
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (returns low-stars pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-returns-low-stars.md --no-derived-queries --min-stars 5 --include-archived --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|homework|assignment|course|semester|leetcode|tutorial|cheatsheet|whitepaper|paper|book|erc20|ethereum|blockchain|ico|crowdsale|landofcoder|codecanyon|envato|ticksy)\\b"`

Alternative next tactic (better ROI than more repo search):
- Pick 1 “reference platform” we already curate (e.g. `saleor/saleor`) and extract:
  - return/refund entities + state transitions
  - store credit issuance/redemption rules
  - the audit/event model around decisions
  Then capture the mapping back into our domain model (Shopify → internal returns objects).

## Stop rule (avoid diminishing returns)

If we run **2 low-stars passes** and get:
- <2 new “keeper” repos (deepen/watch), or
- mostly non-commerce “RMA” false positives,

…pause this lane and shift to:
- shipping label/tracking (carrier SDKs) or
- policy/approvals (OPA + decision logs) which is higher leverage for our stack.
