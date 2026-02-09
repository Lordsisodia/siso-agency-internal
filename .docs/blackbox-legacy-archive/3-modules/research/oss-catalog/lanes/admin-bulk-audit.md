# Lane: Admin + Bulk Ops + Audit / Activity feed

Goal: find OSS we can **embed or mine** to accelerate:
- backoffice/admin UI (lists, filters, bulk actions, detail views)
- audit log / activity feed primitives (event schema + UI)
- “ops runtime” glue (approvals, policy decision points, decision logs)

This lane is not about picking a full commerce platform. It’s about **extracting primitives** we can reuse.

## What we’re looking for (high-signal)

### Admin surfaces
- Table/grid UX: filtering, column configs, density, keyboard nav
- Bulk actions: multi-select, “apply to N items”, confirmations, undo
- Detail view patterns: activity timeline + action panel
- Access control hooks: RBAC/ABAC enforcement points + audit of actions

### Activity feed / audit log primitives
- Event schema conventions (actor/action/object + metadata)
- Query patterns: per-order/per-customer/per-actor filters
- UI: timeline, search, facet filters, export

### Policy / approvals primitives
- “policy decision call” pattern (input schema → decision + reason + trace id)
- Decision logs (what was evaluated, when, by whom, why)
- Manual overrides with full audit trail

## What we explicitly avoid (reduce churn)
- Pure UI “dashboard template” repos with no real data model
- Copyleft runtime dependencies (AGPL/GPL) unless reference-only
- Personal portfolios (common false positives in admin/template searches)

## Recommended next run (command)

Run a focused discovery cycle (no feature-map derived queries):
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (admin/bulk/audit pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-admin-audit-bulk.md --no-derived-queries --min-stars 50 --max-total-queries 30 --max-queries-per-group 6 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "wordpress,woocommerce,magento,prestashop,opencart,shopware,drupal,portfolio,resume,curriculum,cv" --exclude-regex \"\\\\b(landing\\\\s*page|themeforest|codecanyon|envato|course|homework|assignment|tutorial|leetcode)\\\\b\"`

## Stop rule (avoid churn)

If a full pass yields:
- <5 new curated items (triage/deepen/poc), or
- mostly UI-only templates without real bulk-action logic,

…pause this lane and switch to mining patterns from the best existing admin repos already in curation.

