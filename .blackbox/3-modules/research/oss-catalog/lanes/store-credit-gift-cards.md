# Lane: Store credit + gift cards (ledger primitives)

Goal: find OSS primitives we can mine/integrate for:
- **gift cards** (issue → redeem → balance tracking → expiry)
- **store credit** (refund to credit, partial redemption, audit trail)
- **loyalty points** (earn/redeem, tiers) as an optional extension

This lane is explicitly **not** about payments (“credit card processing”) or crypto tokens.

## What we’re looking for (high-signal)

### Ledger / balance model
- immutable credit/debit entries
- balance computation + currency support
- expiry + scope rules (per store, per customer, per order)

### Ops + audit integration
- reason codes (“refund approved”, “return received”, “manual adjustment”)
- actor attribution (agent/system)
- links to order/return ids

### Redemption UX/API
- apply credit to an order/checkout flow
- partial redemption and remainder balance

## What we avoid (reduce churn)
- crypto/web3 tokens and “wallet” repos
- payment processor SDKs / “credit card” repos
- generic coupon/voucher code with no ledger/audit semantics

## Recommended next run (command)

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (store-credit/gift-card pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-store-credit-gift-cards.md --no-derived-queries --no-rotate --min-stars 10 --max-total-queries 30 --max-queries-per-group 6 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "crypto,web3,blockchain,ethereum,solidity,nft,defi,erc20,bitcoin,payment,credit card" --exclude-regex \"\\\\b(crypto|web3|blockchain|ethereum|solidity|nft|defi|erc20|bitcoin|credit\\\\s*card|stripe\\\\s*payment|paypal)\\\\b\"`

## Latest pass outcome (2025-12-31)

Store-credit/gift-card search is **extremely noisy** on GitHub (fraud/scam “gift card generators”, unrelated “loyalty”, etc).

Most recent seed set: **25 repos** → triaged to:
- `deepen`: `1` (keeper)
- `watch`: `7` (reference-only / vendor SDKs / non-primary stack)
- `reject`: `17` (noise / suspicious / license risk)

Keepers worth actually mining:
- `voucherifyio/voucher-code-generator-js` (deepen, MIT) — **redemption code generation primitive** (useful for gift card redemption codes; still missing ledger semantics).
- `solidusio-contrib/solidus_virtual_gift_card` (watch, BSD-3-Clause) — better source for **issuance/redemption + store-credit integration** patterns than random search hits.
- `saleor/saleor` (poc, BSD-3-Clause) — gift cards used as a **store-credit-like payment rail**; mine `saleor/giftcard/*` + checkout/order integration points.

Gaps that remain:
- still missing clean, modular **ledger primitives** (credit/debit entries → computed balance, expiry, audit trail)
- still missing “apply credit” boundaries for Shopify-connected flows (refund-to-credit write-back, partial redemption)

## Stop rule (avoid churn)

If a full pass yields mostly payment/crypto noise or coupon-only repos, pause this lane and mine gift-card/store-credit flows from the commerce platforms already in `poc` (Solidus/Spree/Saleor).

## Tightening notes (to reduce scam churn)

If we run this lane again, bias away from scammy generator repos by extending exclusions:
- add `amazon, checker, discord, unifi, selenium, chromedriver, generator` to `--exclude-keywords`
- add `\\b(amazon|checker|discord|selenium|chromedriver|unifi)\\b` to `--exclude-regex`

(If we explicitly want *code generation* primitives, temporarily remove `generator` from exclusions.)
