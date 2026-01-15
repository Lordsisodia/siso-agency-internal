# Blocks Kit Contracts (v1)

Updated: `2025-12-31`

Purpose: define **stable, implementable contracts** for the Blocks Kit we want to build (or mine patterns for) so we can:
- stop endless OSS discovery loops,
- implement blocks consistently across products (blog, marketing pages, storefront),
- keep UI primitives composable and accessible.

This is *not* framework-specific code. It is an interface + behavior spec.

Related:
- Blocks inventory (what/why): `docs/.blackbox/oss-catalog/blocks-inventory.md`
- Mining method: `docs/.blackbox/oss-catalog/component-mining-playbook.md`
- File pointers (where to look in OSS): `docs/.blackbox/oss-catalog/component-source-map.md`

---

## Global conventions (applies to all blocks)

### IDs + links
- Every block that can be deep-linked should accept `id?: string`.
- If an `id` is provided, it must become the DOM id of the block root.

### Telemetry hook points
- Every interactive block should support:
  - `onEvent?: (event) => void` where `event.type` is stable (e.g. `faq.open`, `pricing.toggle`, `newsletter.submit`).

### States (minimum)
- Interactive blocks must define UI behavior for:
  - `loading` (optional but recommended)
  - `error` (if there is async work)
  - `empty` (when inputs have 0 items)

### Accessibility (non-negotiable)
- Keyboard nav must work.
- Focus indicators must be visible.
- “Selected/active” states must not rely on color alone.

---

## A) Blog / article blocks

### 1) `RichContent` (Markdown/MDX renderer)
Purpose: render blog/article content with a controlled component map.

Props (conceptual):
- `content: string` (mdx or markdown)
- `format: "mdx" | "markdown"`
- `components?: Record<string, ReactComponent>`
- `frontmatter?: Record<string, unknown>`

Behavior requirements:
- Deterministic rendering (same input → same output).
- Sanitization: no script injection; safe HTML handling.
- Link behavior: external links can be styled consistently.

Where to mine:
- MDX/TOC/code pointers live in `docs/.blackbox/oss-catalog/component-source-map.md`.

### 2) `TableOfContents`
Purpose: render a TOC for an article with active-heading highlighting.

Props:
- `items: TocItem[]` where `TocItem = { id: string; title: string; depth: number; children?: TocItem[] }`
- `activeId?: string`
- `onNavigate?: (id: string) => void`

Behavior:
- Desktop: sticky sidebar pattern.
- Mobile: collapsible panel/drawer pattern.
- Active heading updates on scroll (IntersectionObserver recommended).

Where to mine:
- `timlrx/tailwind-nextjs-starter-blog`, `shadcn-ui/taxonomy` (TOC extraction + UI).
- Astro TOC patterns in source map.

### 3) `CodeBlock`
Purpose: highlighted code blocks with copy button and optional filename/title.

Props:
- `code: string`
- `language?: string`
- `title?: string`
- `highlightLines?: number[]` (optional)

Behavior:
- Copy button copies raw code (not HTML).
- Long lines scroll horizontally without breaking layout.
- Optional line highlighting should not break copy behavior.

Where to mine:
- `rehype-pretty/rehype-pretty-code`, `shikijs/shiki`, `code-hike/codehike` (see source map).

### 4) `Callout`
Purpose: admonition/callout box used inside articles and landing pages.

Props:
- `kind: "info" | "warning" | "danger" | "success"`
- `title?: string`
- `children: ReactNode`

Behavior:
- Icon + semantics + spacing consistent across themes.
- Must be readable in light/dark mode.

Where to mine:
- Flowbite/DaisyUI/HyperUI/MerakiUI blocks; see source map.

### `BlogPostCard` (post preview card)
Purpose: a reusable “post preview” card used on blog index pages, tag pages, and related-posts sections.

Props:
- `post: { id: string; title: string; excerpt?: string; date?: string; timeToReadMinutes?: number; tags?: string[]; author?: { name: string; avatarUrl?: string }; image?: { url: string; alt?: string } }`
- `href: string`
- `variant?: "grid" | "list"` (default `grid`)

Behavior:
- Title truncation should be graceful (2–3 line clamp acceptable).
- Optional image should reserve space (avoid layout shift).
- Tags render as compact chips; overflow should wrap or clamp based on `variant`.
- Optional meta row can include date + tags + reading time if present.
- Entire card is a clean link target (avoid nested click traps).

Where to mine:
- Gatsby theme post cards + blog list items in `LekoArts/gatsby-themes` (see source map).
- Next.js blog list patterns in `timlrx/tailwind-nextjs-starter-blog` and `shadcn-ui/taxonomy`.

### `ArticleMeta` (date / tags / reading time)
Purpose: consistent “post meta” row that appears under titles on blog/article pages.

Props:
- `publishedAt: string` (ISO or display string)
- `tags?: { name: string; href: string }[]`
- `timeToReadMinutes?: number`
- `canonicalUrl?: string` (optional; also used by SEO layer)

Behavior:
- Use a semantic `<time>` element for the publish date.
- Tags render as links (comma-separated or chips); must be keyboard accessible.
- Reading time shows as “N min read” when present.

Where to mine:
- `LekoArts/gatsby-themes` post shell (`post.tsx`) and tag list (`item-tags.tsx`).
- Next.js blog shells in `timlrx/tailwind-nextjs-starter-blog`.

---

## B) Marketing / content-heavy page sections

### 5) `FaqSection`
Purpose: FAQ accordion with optional deep-link and “single-open” mode.

Props:
- `items: { id: string; question: string; answer: ReactNode }[]`
- `mode?: "single" | "multiple"` (default `single`)
- `defaultOpenId?: string`

Behavior:
- Keyboard accessible accordion/disclosure.
- Optional deep link support: `/page#faq-returns-window` opens + scrolls.
- “Open” state is communicated via aria attributes.

Where to mine:
- HyperUI FAQ HTML blocks.
- MerakiUI FAQ Collapse.
- Flowbite accordion behavior (JS component).
- DaisyUI collapse/accordion conventions.
- `LiveDuo/destack` HyperUI-derived FAQ blocks (TSX + previews; see source map).

### 6) `PricingSection`
Purpose: pricing tiers with monthly/yearly toggle and optional comparison table.

Props:
- `tiers: { id: string; name: string; priceMonthly: string; priceYearly?: string; features: string[]; ctaLabel?: string; badge?: string }[]`
- `billingMode?: "monthly" | "yearly"` (controlled) or `defaultBillingMode?`
- `onBillingModeChange?: (mode: "monthly" | "yearly") => void`

Behavior:
- Toggle changes prices without layout shift.
- “Most popular”/highlight tier must have non-color-only indicator.

Where to mine:
- Tailblocks pricing blocks.
- HyperUI pricing blocks.
- MerakiUI pricing variants.
- `ant-design/ant-design-landing` Pricing elements (Pricing0/1/2; see source map).
- `LiveDuo/destack` pricing sections (TSX + previews; see source map).

### 7) `TestimonialsSection`
Purpose: testimonial cards in grid/stack; optional slider.

Props:
- `items: { id: string; name: string; title?: string; quote: string; avatarUrl?: string; rating?: number }[]`
- `layout?: "grid" | "stack" | "slider"` (default `grid`)

Behavior:
- Avatars should not cause layout shift (reserve space).
- Rating display is read-only; accessible label (e.g. “4 out of 5 stars”).

Where to mine:
- Tailblocks testimonial blocks.
- MerakiUI testimonials (card/centered/slider).
- Flowbite rating pattern (docs).
- `LiveDuo/destack` testimonials variants (TSX + previews; see source map).

### 8) `NewsletterSignup`
Purpose: email capture form with loading/success/error states and an anti-spam hook.

Props:
- `onSubmit: (email: string) => Promise<void>`
- `validateEmail?: (email: string) => string | null` (error message)
- `honeypotFieldName?: string` (optional)

Behavior:
- Loading state disables submit.
- Success state is visible (alert/callout).
- Error state shows a helpful message (not just “failed”).

Where to mine:
- HyperUI newsletter signup blocks.
- MerakiUI newsletter form blocks.
- Flowbite input + alert patterns.
- `AlexandroMtzG/remix-blocks` newsletter route example (end-to-end form + submit flow).
- `LiveDuo/destack` newsletter/form variants (TSX + previews; see source map).

### `HeroSection` (marketing/blog landing hero)
Purpose: a hero section used on landing pages and blog index pages.

Props:
- `title: string`
- `subtitle?: string`
- `primaryCta?: { label: string; href: string }`
- `secondaryCta?: { label: string; href: string }`
- `image?: { url: string; alt?: string }`

Behavior:
- Must remain readable and CTA-accessible on mobile (stack layout).
- If an image is present, avoid layout shift (reserve aspect ratio).
- CTA buttons must be keyboard reachable with visible focus.

Where to mine:
- `ant-design/ant-design-landing` banner elements (`Banner*`).
- `LiveDuo/destack` hero/banner variants (theme packs; see source map).
- HyperUI/MerakiUI hero sections (see source map / sections lane).

### `FeatureGrid` (feature cards + comparisons)
Purpose: feature list/feature grid used in marketing and “how it works” pages.

Props:
- `items: { id: string; title: string; description?: string; icon?: ReactNode }[]`
- `layout?: "grid" | "list"` (default `grid`)

Behavior:
- Responsive layout (1-col mobile → 2–3 cols desktop).
- Titles/descriptions should clamp gracefully; avoid uneven grid “jank”.

Where to mine:
- `ant-design/ant-design-landing` content/feature elements (`Content*`, `Feature*`).
- HyperUI/Flowbite feature section blocks.

### `StatsSection` (numbers + labels)
Purpose: simple “social proof / metrics” row or grid (e.g. “10k orders processed”).

Props:
- `items: { id: string; value: string; label: string }[]`
- `layout?: "row" | "grid"` (default `row`)

Behavior:
- Values should be readable and not wrap awkwardly.
- Supports small/medium/large counts without breaking layout.

Where to mine:
- `LiveDuo/destack` stats blocks (e.g. `Stats*` variants).
- HyperUI/Flowbite stats blocks.

### `CtaSection` (call to action)
Purpose: mid-page CTA block (email capture, “book a demo”, “join waitlist”).

Props:
- `title: string`
- `body?: string`
- `primaryCta: { label: string; href: string }`
- `secondaryCta?: { label: string; href: string }`

Behavior:
- Clear CTA affordance; not dependent on color alone.
- Works in light/dark themes without contrast issues.

Where to mine:
- `LiveDuo/destack` CTA blocks (e.g. `Cta*` variants).
- HyperUI CTA sections.

---

## C) Storefront UI primitives (pattern mining → implementation contracts)

### 9) `ProductCard` + `ProductGrid`
Purpose: PLP product cards + responsive grid layout.

Props:
- `product: { id: string; title: string; handle?: string; images: { url: string; alt?: string }[]; price: string; compareAtPrice?: string; badges?: string[]; available?: boolean; rating?: number }`
- `href: string`

Behavior:
- Handles missing images and long titles gracefully.
- Sold out / sale / badge states don’t break layout.
- Entire card is a clean link target (avoid nested click traps).

Where to mine:
- Hydrogen demo store ProductCard/ProductGrid.
- Enterprise Commerce product cards.
- Vercel Commerce PLP grid/tiles (App Router patterns).
- Storefront UI product card showcase + primitives.

### 10) `VariantSelector`
Purpose: deterministic option selection with disabled combos.

Props:
- `options: { name: string; values: string[] }[]`
- `selectedOptions: Record<string, string>`
- `disabledValues?: Record<string, string[]>` (or a disabled-combinations model)
- `onChange: (nextSelectedOptions: Record<string, string>) => void`

Behavior:
- Keyboard navigation works.
- Disabled states visible and not color-only.
- URL-sync is optional but recommended in storefronts.

Where to mine:
- Hydrogen product options hooks/provider patterns.
- Enterprise Commerce variant components.
- Vercel Commerce variant selector (URL-sync via form actions).

### 11) `CartDrawer` + `CartLinesEditor`
Purpose: cart drawer with line editing (qty/remove) and robust states.

Props:
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `cart: { id: string; lines: CartLine[]; totals: { subtotal: string; total: string } }`
- `actions: { updateQty(lineId: string, qty: number): Promise<void>; removeLine(lineId: string): Promise<void> }`

Behavior:
- Debounce qty updates or otherwise avoid spamming network.
- Empty state + error state are explicit and accessible.

Where to mine:
- Hydrogen CartDrawer + CartProvider + mutations.
- Enterprise Commerce cart sheet + actions + store.
- Vercel Commerce cart context + server actions + optimistic UI.
- Storefront UI `SfDrawer` primitive.

### 12) `FacetFilters` (desktop sidebar + mobile drawer)
Purpose: URL-synced collection filters with selected “chips” and clear-all.

Props:
- `facets: Facet[]` (category/vendor/price/etc)
- `state: FacetState` (derived from URL)
- `onStateChange: (state: FacetState) => void` (updates URL)

Behavior:
- URL is source of truth.
- Mobile filter opens in drawer/sheet.
- Selected facets show as chips; “clear all” resets.

Where to mine:
- Enterprise Commerce facets components (desktop/mobile/content/price).
- Storefront UI primitives (`SfChip`, `SfAccordionItem`, `SfScrollable`).
- Vercel Commerce search filters (responsive filter list + loading states).

---

## D) Ops/admin primitives (returns + timeline surfaces)

These are “internal admin” blocks we can build once and reuse across:
- Returns Ops
- Support timeline
- Audit/approvals views

They are intentionally API-contract driven (not tied to a specific UI library).

### 13) `ReturnCaseTable` (list + filters + bulk actions)
Purpose: operator list view of return cases with fast filters and bulk actions.

Props:
- `query: { q?: string; status?: string[]; dateFrom?: string; dateTo?: string; page: number; pageSize: number }`
- `rows: { id: string; orderId: string; customerId?: string; status: string; createdAt: string; updatedAt?: string; refundMethod?: "original" | "store_credit" | "split"; amount?: string; currency?: string; itemsCount?: number }[]`
- `total: number`
- `onQueryChange: (nextQuery) => void`
- `actions?: { bulkApprove(ids: string[]): Promise<void>; bulkDeny(ids: string[]): Promise<void>; bulkRequestInfo?(ids: string[]): Promise<void> }`

Behavior:
- Server-side pagination and filtering (no client-side “load everything”).
- Search should support at least: `orderId`, `customerId`, `email` (if available).
- Bulk actions must be role-gated (UI and API).

Where to mine:
- Internal tool builders (e.g., ILLA/React Admin) for UX patterns.
- Timeline components in our catalog for table+detail split patterns.

### 14) `ReturnCaseDetail` (line items + timeline + decision actions)
Purpose: detail view of a return case with:
- line items + inspection outcomes
- timeline of events
- action buttons to approve/deny and trigger refunds/store credit

Props:
- `returnCase: { id: string; orderId: string; status: string; lines: { id: string; orderLineId?: string; sku?: string; title?: string; qty: number; reason?: string; disposition?: "refund" | "exchange" | "deny"; inspection?: { status: "pending" | "pass" | "fail"; notes?: string } }[] }`
- `timeline: { id: string; type: string; at: string; actorId?: string; summary: string; metadata?: Record<string, unknown> }[]`
- `actions: { approve(): Promise<void>; deny(reason: string): Promise<void>; markReceived?(payload): Promise<void>; issueRefund?(payload): Promise<void> }`

Behavior:
- Every action must emit an audit event into the timeline (immutable log).
- Errors are explicit; status transitions are visible and timestamped.

Where to mine:
- Returns/refunds modeling from Saleor/Solidus/Spree (domain semantics).
- Audit/event log primitives (e.g., Retraced) for “immutable actions log” UX.
