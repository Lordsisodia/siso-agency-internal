# Lane: Storefront + Content UI (pattern mining)

Goal: find **storefront reference implementations** and **reusable content components** we can mine for patterns,
without drifting into “replace Shopify”.

This lane is about:
- learning how good OSS storefronts structure UI + data fetching
- harvesting component ideas (cart drawers, variant selectors, filters, blog blocks)
- validating what we should build vs integrate

## What we’re looking for (high-signal)

### Storefront primitives
- Product grid + product card patterns (image handling, skeletons, pricing badges)
- Collection/category filtering (facets, URL state, “clear all”, saved filters)
- Variant selectors (size/color, availability, optimistic selection, disabled options)
- Cart patterns (cart drawer, line item editing, promo codes, persistence)
- Search UX (autocomplete, facets, empty states, “did you mean”, synonyms)

### Content/blog primitives
- MDX/Markdown rendering components (rehype/remark pipelines)
- TOC + anchor links + reading time
- Code blocks (Shiki / rehype-pretty-code), callouts, footnotes
- Content blocks: FAQ, pricing, testimonials, newsletter signup

## Current curated highlights (from our catalog/curation)

Storefront frameworks / starters:
- `Shopify/hydrogen` (triage)
- `Blazity/enterprise-commerce` (deepen) — Next.js storefront patterns (Shopify backend + search layer)
- `BuilderIO/nextjs-shopify` (deepen) — headless Shopify starter (concrete PLP/PDP/cart patterns)
- `vercel/commerce` (deepen) — Next.js Commerce; canonical PLP/PDP/cart/search patterns + Storefront API boundaries
- `lambda-curry/medusa2-starter` (deepen) — Medusa2 + Remix + Stripe starter (end-to-end reference)
- `pevey/sveltekit-medusa-starter` (deepen) — SvelteKit + Medusa storefront patterns
- `saleor/storefront` (triage)
- `vuestorefront/vue-storefront` (triage)
- `vuestorefront-community/vendure` (triage)
- `aexol-studio/vendure-nextjs-storefront` (triage)
- `GatsbyStorefront/gatsby-theme-storefront-shopify` (watch)
- `netlify/gocommerce` (watch) — headless commerce backend reference (JAMstack patterns)

Reusable storefront/component primitives:
- `basementstudio/commerce-toolkit` (deepen) — storefront toolkit patterns
- `itemsapi/itemsjs` (deepen) — JS faceted search engine (filters/facets)
- `DivanteLtd/storefront-integration-sdk` (deepen) — integration SDK / adapter boundaries for storefront ↔ backend
- `vuestorefront/vue-storefront-api` (watch) — storefront API layer patterns (caching/catalog/cart boundaries)
- `vuestorefront/magento2` (watch) — integration mapping patterns
- `bagisto/vuestorefront` (watch) — additional adapter reference

Blog/content references:
- `codebucks27/Nextjs-contentlayer-blog` (triage)
- `EasyFrontendHQ/html-tailwindcss-components` (triage) — generic UI blocks (triage carefully)
- `shadcn-ui/taxonomy` (deepen) — content app reference (layout + component composition patterns)
- `timlrx/tailwind-nextjs-starter-blog` (deepen) — blog starter reference (MDX, TOC, SEO, code blocks)
- Page sections / UI blocks (FAQ/pricing/testimonials/newsletter):
  - `saadeghi/daisyui` (deepen) — Tailwind component system; great source of reusable primitives
  - `markmead/hyperui` (deepen) — copy/paste Tailwind blocks for common marketing layouts
  - `themesberg/flowbite` (deepen) — Tailwind component library/framework
  - `mertJF/tailblocks` (deepen) — Tailwind “blocks” library
  - `merakiuilabs/merakiui` (deepen) — Tailwind blocks (RTL/dark-mode support)
  - `ephraimduncan/blocks` (deepen) — shadcn-based UI blocks
  - `lmsqueezy/wedges` (deepen) — React+Radix+Tailwind component library
- `mdx-js/mdx` (deepen) — MDX foundation for content rendering
- `remarkjs/react-markdown` (deepen) — React Markdown rendering
- `remarkjs/remark` (deepen) — Markdown pipeline (TOC/headings/transforms)
- `remarkjs/remark-rehype` (deepen) — bridge Markdown AST → HTML AST (needed for most rehype pipelines)
- `rehypejs/rehype-react` (deepen) — render rehype AST to React/Preact/Vue/etc
- `rehypejs/rehype-slug` (deepen) — generate heading ids (anchors/TOC)
- `rehypejs/rehype-autolink-headings` (deepen) — add link icons to headings (copy-link UX)
- `shikijs/shiki` (deepen) — code highlighting (code blocks)
- `code-hike/codehike` (deepen) — rich code blocks/annotations for MDX
- `mdx-editor/editor` (deepen) — markdown editor component (content authoring)

Storefront reference index (pattern mining):
- `docs/.blackbox/oss-catalog/storefront-reference-set.md`

## How we evaluate quickly (keep it tactical)

1) **Does it map to a primitive?**
   - If it’s a full “platform”, we only keep it if it teaches us patterns we’ll reuse.
2) **Is it a component library vs a personal site?**
   - Prefer libraries, starters, themes, and “toolkit” repos.
3) **Can we mine concrete UI patterns?**
   - Screenshots, storybooks, component APIs, route structure, hooks/state.
4) **License risk**
   - Prefer `safe`; if `verify`, keep as `watch` until verified.

## Recommended next runs (commands)

Storefront templates/starters (best for mining real commerce UI code):
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (storefront templates pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-storefront-templates.md --no-derived-queries --min-stars 50 --max-total-queries 30 --max-queries-per-group 6 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "wordpress,woocommerce,magento,prestashop,opencart,shopware,drupal" --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site)\\b"`

Blog + content blocks (MDX/markdown + reusable sections):
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (content blocks pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-content-blocks.md --no-derived-queries --min-stars 50 --max-total-queries 30 --max-queries-per-group 6 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "awesome" --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site|course|homework|assignment|leetcode)\\b"`

## Stop rule (avoid churn)

If we run **2 passes** in this lane and get:
- <3 new repos added to curation, **or**
- mostly personal sites/templates,

…pause this lane and rotate to ops primitives (returns/shipping/workflows) for the next cycle.
