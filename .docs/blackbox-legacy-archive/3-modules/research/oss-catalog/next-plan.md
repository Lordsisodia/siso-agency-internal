# OSS discovery: next plan (living)

This is a lightweight “what we have vs what we still need” plan for the OSS discovery loop.
It is meant to stay short and be updated as we learn.

## Current snapshot (2025-12-31)
- Catalog size: **1078 repos** (`docs/.blackbox/oss-catalog/catalog.json`)
- Curation list: **754 items** (`docs/.blackbox/oss-catalog/curation.json`)
- Latest rendered views:
  - `docs/.blackbox/oss-catalog/shortlist.md`
  - `docs/.blackbox/oss-catalog/poc-backlog.md`
  - `docs/.blackbox/oss-catalog/risk.md`
  - `docs/.blackbox/oss-catalog/gap-queries.md`
  - `docs/.blackbox/oss-catalog/inventory.md`

Tagging note (important):
- We now tag `storefront`, `content`, and `blog` separately.
- `cms` is reserved for actual CMS products/frameworks (not every Markdown/MDX tool).

License gate (do this early):
- Any repo with `license_bucket=verify` or `license_spdx=NOASSERTION/UNKNOWN` should be treated as **reference-only** until verified.
- 2025-12-31 example: `n8n-io/n8n` looked high-value but verified as Sustainable Use License (SUL-1.0) → rejected for OSS adoption.
- Use `python3 ./.blackbox/scripts/research/verify_repo_licenses.py` to generate a report in a run plan folder before promoting to `poc`.

## Lane docs (where we keep the “why”)
- Storefront + content UI: `docs/.blackbox/oss-catalog/lanes/storefront-content.md`
- Admin + bulk ops + audit/activity feed: `docs/.blackbox/oss-catalog/lanes/admin-bulk-audit.md`
- Activity feed + timeline UI: `docs/.blackbox/oss-catalog/lanes/activity-feed-timeline.md`
- Page sections/components (FAQ/pricing/testimonials/newsletter): `docs/.blackbox/oss-catalog/lanes/sections-components.md`
- Reliability (webhooks/idempotency/outbox): `docs/.blackbox/oss-catalog/lanes/reliability-webhooks-idempotency.md`
- Search (facets/autocomplete/adapters): `docs/.blackbox/oss-catalog/lanes/search-facets-autocomplete.md`
- Support timeline/helpdesk primitives: `docs/.blackbox/oss-catalog/lanes/support-timeline.md`
- Returns / store credit: `docs/.blackbox/oss-catalog/lanes/returns-store-credit.md`
- Component mining playbook: `docs/.blackbox/oss-catalog/component-mining-playbook.md`
- Blocks inventory (what we actually want to build): `docs/.blackbox/oss-catalog/blocks-inventory.md`
- Blocks Kit contracts (stable interfaces to implement): `docs/.blackbox/oss-catalog/blocks-kit-contracts.md`
- Component source map (file pointers): `docs/.blackbox/oss-catalog/component-source-map.md`

## What we already have (strong coverage)
### Ops/platform primitives (high leverage)
- Policy/auth: OPA + related authz candidates
- Audit/event log: Retraced + audit log patterns
- Workflow substrate: multiple workflow runtimes/engines already identified

### Shipping/integrations
- Carrier SDKs + shipping label/tracking patterns have good coverage.

## What we still need (weak/under-tagged)
### Returns (still shallow vs shipping)
We want more OSS that directly addresses:
- RMA lifecycle (create → receive → inspect → approve/deny → refund/store credit → restock/disposal)
- Return label generation + carrier handoff (without being a full shipping platform)
- Store credit issuance + accounting/audit trail patterns

Current reality:
- At `--min-stars 50`, returns-only searches are close to saturated (few/no new repos).
- Even at low stars (`--min-stars 5`), GitHub repo search is now yielding **0 new keepers** for returns/RMA.
- A lane-only low-stars run on **2025-12-31** produced an **empty tranche** (all candidates already in catalog/curation):
  - `docs/.blackbox/agents/.plans/2025-12-31_1247_oss-discovery-github-oss-discovery-cycle-124756/`
- Next tactic: **pause repo search** and mine returns/refund/store-credit domain models from the commerce platforms we already curate (e.g. Saleor/Solidus/Spree), then build our own returns lifecycle on top of workflow + policy + audit primitives.
- 2025-12-31: added `solidusio/solidus` as a `watch` reference with concrete file pointers (see `docs/.blackbox/oss-catalog/component-source-map.md`).

### Store credit (ledger primitives) — still noisy in search
We do have some primitives, but GitHub search is extremely noisy for “gift cards / store credit”.
Latest pass outcome:
- `docs/.blackbox/oss-catalog/lanes/store-credit-gift-cards.md`
- Keepers are mostly:
  - code generation primitives (e.g. `voucherifyio/voucher-code-generator-js`)
  - ecosystem modules inside full commerce platforms (e.g. `solidusio-contrib/solidus_virtual_gift_card`, Saleor giftcard gateway)

### Storefront code (for pattern mining)
We want repo examples we can mine for reusable UI patterns and integration glue:
- product grid + product card + collection filters (search facets)
- variant selector patterns (size/color, availability, prefetch, optimistic UI)
- cart drawer + cart state management + line item editing
- checkout UX primitives (even if checkout is external)

Practical note:
- GitHub **repo search** mostly matches name/description/README; it does *not* reliably find UI pattern strings that only exist in code.
  If a “pattern phrase” query yields <5 repos, switch to ecosystem/topic queries (Hydrogen/Medusa/Saleor/Vendure) or API-shaped queries
  (“Shopify Storefront API”, “cart lines”, etc.).
- 2025-12-31: storefront/content pass at `--min-stars 50` seeded **+4** new blog/content repos; a follow-up storefront templates pass at `--min-stars 50` produced **0 net-new** keepers (all hits already in catalog/curation) → pause more template discovery and stay in mining mode for storefront UI.

### Blog/article components (for content surfaces)
We want component-level libraries and starter pages for:
- MDX/Markdown renderer components + portable text patterns
- TOC generation, headings anchor links, reading time
- code blocks (Shiki/rehype/remark), callouts, footnotes
- pagination, tags/categories, “related posts”
- FAQ / pricing / testimonials sections (reusable content blocks)

Practical note:
- 2025-12-31: a sections/components pass (FAQ/pricing/testimonials/newsletter) seeded **0 net-new** curation items; keep this lane in “mining mode” (we already have the core sources in `deepen`).

## How we’ll keep looping (repeatable cadence)
1) **Run one discovery cycle** per focus lane (storefront/blog/returns) with a small query budget.
2) **Seed top candidates** into curation as `triage` (owner=“Shaan”), with a note prefix naming the pass.
3) **Kill-list sweep**: reject obvious non-fit to keep churn low.
4) **Promote** best fits to `deepen` or `poc` with concrete acceptance criteria.
5) **Render** and use `shortlist.md` + `poc-backlog.md` as the working surface.

## Next run commands (copy/paste)
These use GitHub CLI auth without printing tokens:

- Storefront templates/starters (best for mining real commerce UI code):
  - `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (storefront templates pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-storefront-templates.md --no-derived-queries --min-stars 50 --max-total-queries 30 --max-queries-per-group 6 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "wordpress,woocommerce,magento,prestashop,opencart,shopware,drupal" --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site)\\b"`
- Blog + content blocks (MDX/markdown + reusable sections):
  - `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (content blocks pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-content-blocks.md --no-derived-queries --min-stars 50 --max-total-queries 30 --max-queries-per-group 6 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "awesome" --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site|course|homework|assignment|leetcode)\\b"`
- Combined storefront+content sweep (broader, slightly noisier):
  - `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (storefront+content pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-storefront-content.md --no-derived-queries --min-stars 50 --max-total-queries 36 --max-queries-per-group 6 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "wordpress,woocommerce,magento,prestashop,opencart,shopware,drupal"`
- Search topics (backend + UI primitives):
  - `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (search topics pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-search-topics.md --no-derived-queries --min-stars 200 --max-total-queries 24 --max-queries-per-group 8 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site)\\b"`
- Admin + bulk ops + audit/activity feed:
  - `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (admin/bulk/audit pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-admin-audit-bulk.md --no-derived-queries --min-stars 50 --max-total-queries 30 --max-queries-per-group 6 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "wordpress,woocommerce,magento,prestashop,opencart,shopware,drupal,portfolio,resume,curriculum,cv" --exclude-regex "\\b(landing\\s*page|themeforest|codecanyon|envato|course|homework|assignment|tutorial|leetcode)\\b"`
- Returns/shipping precision:
  - `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-cycle.sh --queries-md .blackbox/snippets/research/github-search-queries-returns-shipping-precision.md --min-stars 50 --max-total-queries 24 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost`
- Returns (low-stars, ecosystem-specific; higher noise but better coverage):
  - `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (returns low-stars pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-returns-low-stars.md --no-derived-queries --min-stars 5 --include-archived --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|homework|assignment|course|semester|leetcode|tutorial|cheatsheet|whitepaper|paper|book|erc20|ethereum|blockchain|ico|crowdsale|landofcoder|codecanyon|envato|ticksy)\\b"`

If you used `start-oss-discovery-cycle.sh`, seed from the latest run:
- `python3 ./.blackbox/scripts/research/seed_oss_curation_from_extracted.py --latest --curation .blackbox/oss-catalog/curation.json --top 25 --status triage --owner "Shaan" --note-prefix "Seeded (pass name): "`
