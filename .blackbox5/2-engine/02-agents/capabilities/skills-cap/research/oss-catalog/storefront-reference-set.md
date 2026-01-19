# Storefront Reference Set (pattern mining)

Updated: `2025-12-31`

Purpose: maintain a **short, high-signal list of storefront codebases** we can mine for reusable UI + integration patterns:
- cart drawer / minicart
- variant selector (size/color availability)
- collection filters / facets
- search UX (autocomplete, zero-state, facets)
- product cards / grids + PDP layout

This is intentionally not a “framework shortlist”.
It’s a **pattern mining index**: where to look when we need a specific storefront primitive.

Guardrails:
- No cloning/vendoring into this docs repo; capture patterns + contracts + links only.
- Only copy/adapt snippets from `license_bucket=safe` repos, with attribution.
- Treat full starter repos as reference implementations; extract patterns, not architecture lock-in.

---

## Canonical sources (start here)

### Shopify-first references
- `Shopify/hydrogen-v1` (poc) — official patterns for Storefront API data fetching + cart state
- `packdigital/pack-hydrogen-theme-blueprint` (poc) — Hydrogen theme blueprint w/ real cart/search/product components
- `Blazity/enterprise-commerce` (deepen) — Next.js storefront with Shopify backend + Algolia middle layer
- `VienDinhCom/next-shopify-storefront` (poc) — smaller Next.js Shopify starter (good for quick scanning)
- `BuilderIO/nextjs-shopify` (deepen) — “starter for headless Shopify stores”; good PLP/PDP/cart patterns to mine
- `vercel/commerce` (deepen) — Next.js Commerce; high-signal PLP/PDP/cart/search patterns + Shopify Storefront API boundaries
- `zeon-studio/commerceplate` (deepen) — Next.js Shopify storefront boilerplate (App Router patterns + reusable components)

### Non-Shopify but still valuable pattern references
- `lambda-curry/medusa2-starter` (deepen) — Medusa2 + Remix + Stripe (end-to-end storefront starter)
- `withastro/storefront` (deepen) — Astro storefront patterns (performance + static-first considerations)
- `zeon-studio/storeplate` (deepen) — Astro Shopify storefront boilerplate (Tailwind + Nanostores)
- `pevey/sveltekit-medusa-starter` (deepen) — SvelteKit + Medusa storefront patterns
- `takeshape/penny` (poc) — Next.js v14 composable commerce starter (Storybook + Playwright); great for mining real component + testing patterns

### Component/UI primitive sources (design-system adjacent)
- `vuestorefront/storefront-ui` (poc) — storefront UI primitives library (cards, price, cart controls)
- `basementstudio/commerce-toolkit` (deepen) — commerce utilities/patterns (boundaries + helpers)
- `DivanteLtd/storefront-integration-sdk` (deepen) — adapter boundary patterns (storefront ↔ backend)

---

## Pattern → best repos to mine

### Product grid + product card (PLP)
Primary:
- `Shopify/hydrogen-v1`
- `Blazity/enterprise-commerce`
- `vercel/commerce`
Secondary:
- `vuestorefront/storefront-ui`

What to extract:
- card states (sold out, sale, variant availability, badges)
- image loading (aspect ratios, placeholders, lazy loading)
- price model (compare-at, discounts, currency formatting)

### Variant selector (PDP)
Primary:
- `Shopify/hydrogen-v1`
- `Blazity/enterprise-commerce`
- `vercel/commerce`
What to extract:
- disabled options UX (out of stock, unavailable combinations)
- optimistic selection and URL synchronization (if present)
- accessibility (keyboard navigation, focus, labels)

### Cart drawer / minicart
Primary:
- `Shopify/hydrogen-v1`
- `vercel/commerce`
Secondary:
- `vuestorefront/storefront-ui`
What to extract:
- line item editing (qty, remove, undo patterns)
- empty state, loading state, error state
- persistence rules and recovery

### Collection filters / facets
Primary:
- `Blazity/enterprise-commerce`
Secondary:
- `itemsapi/itemsjs` (deepen) — faceted search engine patterns (model-side)
What to extract:
- URL-synced filter state
- “clear all” patterns and selected filters chips
- performance strategies (debounce, caching, pagination)

### Search UX (autocomplete + zero results)
Primary:
- `Blazity/enterprise-commerce` (Algolia layer)
Secondary:
- `itswadesh/svelte-commerce` (poc) — search UX + integration checklist
- `vercel/commerce`
What to extract:
- autocomplete suggestions + keyboard nav
- zero-state and “no results” recovery patterns

---

## Where to record outputs

- Repo-specific mining notes: `docs/.blackbox/oss-catalog/curation.json` (append-only notes)
- File pointers (exact code locations): `docs/.blackbox/oss-catalog/component-source-map.md`
- Lane overview + run commands: `docs/.blackbox/oss-catalog/lanes/storefront-content.md`
- Blocks inventory for shared components: `docs/.blackbox/oss-catalog/blocks-inventory.md`
