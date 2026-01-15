# Blocks Inventory (Lumelle “Blocks Kit”)

Updated: `2025-12-31`

This is the “what are we actually building?” inventory for component mining.
It maps desired blocks → acceptance criteria → OSS sources (deepen/watch) so we can execute a 1‑day mini‑POC without more searching.

Guardrails:
- We mine **patterns and contracts first**; only copy/adapt code from `license_bucket=safe`.
- `verify` license items stay “reference/watch” until confirmed.
- No vendoring/cloning in this docs repo; capture notes + links only.

Related:
- Mining method + checklist: `.blackbox/oss-catalog/component-mining-playbook.md`
- Blocks Kit contracts (stable interfaces): `.blackbox/oss-catalog/blocks-kit-contracts.md`
- Component source map (file pointers): `.blackbox/oss-catalog/component-source-map.md`
- Canonical variant picks (reduce churn): `.blackbox/oss-catalog/blocks-kit-marketing-variant-picks.md`
- Sources (sections/components): `.blackbox/oss-catalog/lanes/sections-components.md`
- Sources (storefront + blog): `.blackbox/oss-catalog/lanes/storefront-content.md`

---

## v1 scope (ship first)

### A) Blog / Article page blocks

#### 1) Markdown/MDX renderer pipeline (React-first)
- Contract:
  - Input: `mdxOrMarkdownString` + frontmatter (title, publishedAt, tags)
  - Output: React element tree with custom components overrides
- Acceptance criteria:
  - Supports headings, lists, images, tables, links
  - Safe HTML handling (no arbitrary script execution)
  - Deterministic rendering (same input → same output)
- Primary sources (deepen):
  - `remarkjs/remark-rehype`
  - `rehypejs/rehype-react`
- Supporting sources (deepen):
  - `mdx-js/mdx` (already in catalog)
  - `remarkjs/react-markdown` (already in catalog)

#### 2) Heading IDs + “copy link” anchors
- Contract:
  - For every `h2/h3/h4`, generate stable `id` + render an anchor button
- Acceptance criteria:
  - Keyboard reachable, visible focus, ARIA label (“Copy link to heading”)
  - Works with deep links (`/post#some-heading`)
- Primary sources (deepen):
  - `rehypejs/rehype-slug`
  - `rehypejs/rehype-autolink-headings`

#### 3) Table of contents (TOC)
- Contract:
  - Input: heading tree (text, id, depth)
  - Output: TOC list + active section highlighting
- Acceptance criteria:
  - Responsive: sticky on desktop, collapsible on mobile
  - Active section updates on scroll (no jank)
- Primary sources:
  - Pattern mine from blog starters already in catalog (see `storefront-content` lane doc)

#### 4) Code blocks (syntax highlight + copy)
- Contract:
  - Input: code string + language + optional filename
  - Output: highlighted code block + copy button
- Acceptance criteria:
  - Copy button copies raw code
  - Horizontal scroll works; long lines don’t break layout
  - Optional line highlighting (nice-to-have)
- Primary sources (poc/deepen already in catalog):
  - `rehype-pretty/rehype-pretty-code` (poc)
  - `shikijs/shiki` (deepen)
  - `code-hike/codehike` (deepen)

#### 5) Callouts / admonitions
- Contract:
  - Input: `kind` (`info|warning|danger`) + title + body
- Acceptance criteria:
  - Accessible icon + semantics; consistent spacing/typography
- Primary sources (sections/components lane):
  - `themesberg/flowbite` (deepen)
  - `saadeghi/daisyui` (deepen)
  - `lmsqueezy/wedges` (deepen)

#### 6) “Related posts” + tags/categories
- Contract:
  - Input: current post id + tags; output: 3–6 related cards
- Acceptance criteria:
  - Uses deterministic scoring (shared tags, recency)
  - Mobile layout is 1-column; desktop is grid
- Primary sources:
  - Pattern mine from blog starters (catalog lane doc)

---

### B) Marketing / content-heavy page sections

These blocks are useful for:
- blog landing pages
- feature pages
- “how it works” pages

#### 7) FAQ accordion section
- Contract:
  - Input: list of `{ question, answer, id }`
  - Output: accordion with deep-link support to an item (nice-to-have)
- Acceptance criteria:
  - Keyboard navigation works (Up/Down/Enter/Space)
  - Only one expanded at a time (configurable)
  - Supports rich content in answers (links, lists)
- Primary sources (deepen):
  - `markmead/hyperui`
  - `themesberg/flowbite`
  - `merakiuilabs/merakiui`
  - `saadeghi/daisyui`
  - `ephraimduncan/blocks`
  - `LiveDuo/destack` (bundled TSX/HTML FAQ blocks with previews; see source map)

#### 8) Pricing table (tiers + toggle)
- Contract:
  - Input: tiers with features + monthly/yearly pricing
  - Output: pricing cards + optional comparison table
- Acceptance criteria:
  - Toggle animates prices without layout shift
  - “Most popular” tier highlight is accessible (not color-only)
- Primary sources (deepen):
  - `markmead/hyperui`
  - `mertJF/tailblocks`
  - `themesberg/flowbite`
  - `merakiuilabs/merakiui`
  - `ant-design/ant-design-landing` (Pricing0/1/2 section elements; see source map)
  - `LiveDuo/destack` (pricing + CTA variants bundled as TSX/HTML blocks)
  - `AlexandroMtzG/remix-blocks` (pricing/subscription example route; useful for “pricing + form” glue)

#### 9) Testimonials / reviews section (star rating + quotes)
- Contract:
  - Input: `{ name, title, quote, avatarUrl?, rating? }[]`
  - Output: cards in grid/stack, optional carousel
- Acceptance criteria:
  - Supports 0–5 rating display (read-only)
  - Avoids layout shift when avatars load
- Primary sources (deepen):
  - `markmead/hyperui`
  - `themesberg/flowbite`
  - `saadeghi/daisyui`
  - `LiveDuo/destack` (testimonials variants bundled; see source map)
- Supporting primitive (watch):
  - `voronianski/react-star-rating-component` (kept as the single web star-rating option)

#### 10) Newsletter / waitlist signup section
- Contract:
  - Input: submit handler + email validation strategy
  - Output: email capture form + success/error states
- Acceptance criteria:
  - Basic validation + helpful error message
  - Loading state + success confirmation
  - Spam mitigation hook point (honeypot / rate limit) (nice-to-have)
- Primary sources (deepen):
  - `markmead/hyperui`
  - `themesberg/flowbite`
  - `saadeghi/daisyui`
  - `LiveDuo/destack` (newsletter + form section variants, TSX + previews)
  - `AlexandroMtzG/remix-blocks` (newsletter route example; good end-to-end pattern)

#### Add-on marketing blocks (v1.1)

These are not required for v1 launch, but they are high leverage for:
- blog landing pages
- feature pages
- support/FAQ landing pages

##### `HeroSection` (marketing/blog landing hero)
- Acceptance criteria:
  - responsive stack layout on mobile; no layout shift from hero media
  - CTAs are keyboard accessible and have visible focus
- Primary sources (deepen):
  - `ant-design/ant-design-landing` (Banner* elements; see source map)
  - `LiveDuo/destack` (banner/hero variants in theme packs)

##### `FeatureGrid` (feature list/cards)
- Acceptance criteria:
  - 1-col mobile → 2–3 col desktop; titles/descriptions clamp gracefully
- Primary sources (deepen):
  - `ant-design/ant-design-landing` (Content*/Feature* elements)
  - HyperUI/Flowbite feature blocks (see source map)

##### `StatsSection` (numbers + labels)
- Acceptance criteria:
  - values/labels remain readable across screen sizes; supports small/large numbers
- Primary sources (deepen):
  - `LiveDuo/destack` (Stats* variants)
  - HyperUI stats blocks (see source map)

##### `CtaSection` (call to action)
- Acceptance criteria:
  - CTA is clear and not color-only; works in light/dark themes
- Primary sources (deepen):
  - `LiveDuo/destack` (Cta* variants)
  - HyperUI CTA blocks (see source map)

---

### C) Storefront UI primitives (PDP/PLP/cart) — v1.5 add-on

These blocks are useful for:
- product listing (PLP) pages
- product detail (PDP) pages
- cart drawer / cart page primitives

Practical note:
- These are **pattern mining targets** first. We’ll standardize contracts + a11y + state handling, and only then decide whether to copy snippets (safe licenses only) or implement ourselves.

#### 11) Product card + product grid (PLP)
- Contract:
  - Input: `product` { id, title, handle, images[], price, compareAtPrice?, badges?, availability?, rating? }
  - Output: a card + a grid layout that supports skeleton/loading states
- Acceptance criteria:
  - Responsive grid (1-col mobile, 2–4 cols desktop), consistent aspect ratio handling
  - Handles missing images, long titles, and price-with-discount without layout breakage
  - Accessible link target and focus states; no “click trap” inside the card
- Primary sources (storefront reference set):
  - `Shopify/hydrogen-v1` (poc)
  - `Blazity/enterprise-commerce` (deepen)
  - `vuestorefront/storefront-ui` (poc)

#### 12) Variant selector (size/color/options) (PDP)
- Contract:
  - Input: options + availability model:
    - `options[]` { name, values[] }
    - `selectedOptions` + `disabledCombinations`
  - Output: option pickers with disabled/unavailable states
- Acceptance criteria:
  - Disabled states are obvious and not color-only
  - Keyboard navigation works (tab + arrow patterns where relevant)
  - Selecting an option updates the selected variant deterministically
- Primary sources (storefront reference set):
  - `Shopify/hydrogen-v1` (poc)
  - `Blazity/enterprise-commerce` (deepen)

#### 13) Price display (“Money”) + discounts
- Contract:
  - Input: `amount`, `currency`, `compareAt?`, `discountLabel?`
  - Output: formatted price UI (and compare-at strikethrough when present)
- Acceptance criteria:
  - Currency formatting is correct and stable
  - Compare-at display is accessible (not only via strikethrough color)
- Primary sources:
  - `vuestorefront/storefront-ui` (poc)
  - `Shopify/hydrogen-v1` (poc)

#### 14) Cart lines editor (qty/update/remove) + empty/loading states
- Contract:
  - Input: `cart` { lines[], totals, currency } + actions { updateQty, removeLine }
  - Output: cart UI (drawer or page) with optimistic updates where possible
- Acceptance criteria:
  - Quantity updates are debounced or otherwise don’t spam network calls
  - Empty cart state is clean and provides recovery CTA
  - Loading/error states are explicit; keyboard accessible
- Primary sources (storefront reference set):
  - `Shopify/hydrogen-v1` (poc)
  - `vuestorefront/storefront-ui` (poc)
  - `lambda-curry/medusa2-starter` (deepen)

#### 15) Collection filters / facets (URL-synced)
- Contract:
  - Input: facet definitions + selected state (query params)
  - Output: sidebar filters + “selected chips” bar + “clear all”
- Acceptance criteria:
  - URL is the source of truth for selected filters (shareable links)
  - “Clear all” resets without leaving stale UI state
  - Mobile UX: filters open in a drawer/sheet
- Primary sources:
  - `Blazity/enterprise-commerce` (deepen)
  - Supporting model-side reference: `itemsapi/itemsjs` (deepen)

Related:
- Storefront pattern mining index: `.blackbox/oss-catalog/storefront-reference-set.md`

---

## Primary OSS sources to mine first (deepen set)

From `.blackbox/oss-catalog/curation.json`:
- `saadeghi/daisyui`
- `themesberg/flowbite`
- `markmead/hyperui`
- `mertJF/tailblocks`
- `merakiuilabs/merakiui`
- `ephraimduncan/blocks`
- `lmsqueezy/wedges`
- Blog pipeline: `remarkjs/remark-rehype`, `rehypejs/rehype-react`, `rehypejs/rehype-slug`, `rehypejs/rehype-autolink-headings`
- Storefront references (patterns):
  - `Shopify/hydrogen-v1`
  - `Blazity/enterprise-commerce`
  - `BuilderIO/nextjs-shopify`
  - `lambda-curry/medusa2-starter`
  - `pevey/sveltekit-medusa-starter`
  - `zeon-studio/storeplate`
  - `vuestorefront/storefront-ui`

- Blog/content reference apps (patterns):
  - `shadcn-ui/taxonomy`
  - `timlrx/tailwind-nextjs-starter-blog`

## Reference set (watch)

Use these to cross-check patterns, but don’t mine first:
- `StaticMania/keep-react`
- `hunvreus/basecoat`
- `creativetimofficial/material-tailwind`
- `kokonut-labs/kokonutui`
- `tommyjepsen/twblocks`
- `TailGrids/tailwind-ui-components`
- License-verify first:
  - `themeselection/flyonui`
  - `rakheOmar/Markdrop`
