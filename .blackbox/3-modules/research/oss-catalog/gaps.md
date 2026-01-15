# OSS Sourcing Gaps (vs search focus)

Updated: `2025-12-31T11:53:19Z`

This file is a tactical view of what to search next. It is based on **catalog tag coverage** and our stated focus in `search-focus.md`.

## Focus tag coverage (catalog counts)

These are current counts in `.blackbox/oss-catalog/catalog.json`:

- `policy`: 25
- `observability`: 29
- `analytics`: 49
- `search`: 103
- `workflows`: 54
- `auth`: 32
- `returns`: 3
- `support`: 48
- `shipping`: 27
- `admin`: 89
- `commerce`: 162
- `storefront`: 64
- `content`: 146
- `blog`: 61
- `cms`: 55

## What’s actually “missing” (practical gaps)

- `audit`: not currently a first-class tag in the catalog tagging heuristics; we track audit candidates via known repos (e.g. Retraced) + keywords (`audit log`, `activity feed`, `event log`).
- `policy`: we have candidates, but we want more *embeddable* policy/approvals primitives (decision logs, policy bundles, evaluation APIs) that fit our ops runtime.
- Storefront/blog components: we now tag `storefront` + `content` + `blog` explicitly, but **curation is still thin** (too many “site” repos vs reusable components).
  - 2025-12-31: two targeted runs (storefront templates + content blocks) seeded **0 net-new** curation items; treat this lane as “pattern mining” until we refresh query banks with new topic-based queries.
  - 2025-12-31: sections/components pass also seeded **0 net-new** curation items (all candidates already in `deepen`); keep mining, don’t keep scraping.

## Recommended next query directions (high-signal)

### Storefront code (pattern mining, not “full platform”)
- Ecosystems: `Hydrogen`, `Next.js`, `Remix`, `SvelteKit`, `Astro`
- Headless commerce patterns: `Saleor`, `Vendure`, `Medusa`, `Vue Storefront`
- Prefer **topic-based searches** to avoid personal websites:
  - `topic:storefront-api`, `topic:shopify-storefront-api`, `topic:shopify-hydrogen`, `topic:headless-commerce`, `topic:vendure`, `topic:saleor`, `topic:medusajs`, `topic:vuestorefront`

### Blog/article components (reusable blocks)
- MDX/Markdown: `mdx`, `react-markdown`, `remark`, `rehype`
- Common blocks: TOC, reading time, code blocks (`shiki`), callouts, pagination, “related posts”

### Returns / shipping (domain-specific primitives)
- Returns: `rma`, `reverse logistics`, `exchange`, `store credit`, `return label`
- Shipping: `carrier rates`, `tracking`, `3pl`, `wms`, `pick pack`

Practical note (2025-12-31):
- GitHub repo search for returns/RMA is close to saturated for us (even at low stars).
- Better next tactic: mine returns/refund/store-credit models from the full commerce stacks we already cataloged (Saleor/Solidus/Spree) and implement our own returns lifecycle on top of workflow + policy + audit primitives.
