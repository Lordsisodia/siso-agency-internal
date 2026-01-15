# Blocks Kit v1 — mini‑POC (blog + marketing + storefront) prompt pack

Goal: run a **contracts-first** mini‑POC that proves we can build Lumelle’s Blocks Kit v1 without more OSS scraping.

Inputs (read first):
- `docs/.blackbox/oss-catalog/blocks-kit-contracts.md`
- `docs/.blackbox/oss-catalog/component-source-map.md`
- `docs/.blackbox/oss-catalog/component-mining-playbook.md`

Outputs (write back here in docs repo):
- `docs/.blackbox/deepresearch/YYYY-MM-DD_blocks-kit-v1-mini-poc-results.md`
- (optional) small edits to:
  - `docs/.blackbox/oss-catalog/blocks-kit-contracts.md`
  - `docs/.blackbox/oss-catalog/blocks-inventory.md`

Non‑negotiables:
- Do **not** paste tokens into chat.
- Do **not** clone/vendoring OSS repos into this docs repo.
- Only copy/adapt code from `license_bucket=safe` sources; otherwise patterns-only notes.

---

## Prompt 1 — Setup (POC workspace)

Paste:

Create a throwaway POC workspace (outside `docs/`), using React + Tailwind (or our current frontend stack). Do not commit it. Do not add `node_modules` to this repo.

Then create a checklist document inside the POC workspace that mirrors the acceptance checks in:
- `docs/.blackbox/agents/.plans/2025-12-31_1922_blocks-kit-v1-mini-poc-blog-marketing-storefront/artifacts/mini-poc-plan.md`

---

## Prompt 2 — Blog/article kit (Phase 1)

Paste:

Implement the following blocks (minimal UI, focus on correctness + a11y):
- `RichContent` (Markdown/MDX renderer with a controlled component map)
- `TableOfContents` (nested headings + active section highlight)
- `CodeBlock` (highlight + copy)
- `Callout` (info/warning/danger/success)

Use the contracts in `docs/.blackbox/oss-catalog/blocks-kit-contracts.md`.
Use the file pointers in `docs/.blackbox/oss-catalog/component-source-map.md` to mine patterns.

When done, record:
- what worked
- what was hard
- any contract changes needed (be explicit)

---

## Prompt 3 — Marketing sections (Phase 2)

Paste:

Implement marketing blocks:
- `FaqSection` (keyboard + aria-expanded)
- `PricingSection` (monthly/yearly toggle; highlight tier)
- `NewsletterSignup` (validation + loading/success/error)

Follow the contracts and acceptance checks.
Use the marketing file pointers in `component-source-map.md`.

Record any differences you found between “nice HTML blocks” and “what we need in a real app” (e.g., state, validation, analytics hooks).

---

## Prompt 4 — Storefront primitives (Phase 3)

Paste:

Implement a storefront slice using static fixtures (no Shopify credentials needed):
- `ProductCard` + `ProductGrid`
- `CartDrawer` shell + `CartLinesEditor` shell (qty/remove behaviors can be stubbed but states must exist)
- `FacetFilters` shell (URL-sync can be simulated with local state)

Use file pointers:
- Hydrogen v1 (product card/grid + cart provider/mutations patterns)
- Enterprise Commerce (facets desktop/mobile, cart sheet/actions)
- Storefront UI primitives (drawer/chips/accordion/scrollable)

Record any contract gaps discovered.

---

## Prompt 5 — Write back results into docs (required)

Paste:

Write an evergreen result note:
- `docs/.blackbox/deepresearch/YYYY-MM-DD_blocks-kit-v1-mini-poc-results.md`

Structure:
1) Summary of what was built (blog/marketing/storefront)
2) Acceptance criteria pass/fail table
3) Contract changes proposed (exact edits)
4) “Build next” recommendation (what we should ship first in Lumelle)
5) Risks + mitigations

Then, if necessary, apply small edits to:
- `docs/.blackbox/oss-catalog/blocks-kit-contracts.md` (tighten interfaces)
- `docs/.blackbox/oss-catalog/blocks-inventory.md` (reprioritize blocks)

