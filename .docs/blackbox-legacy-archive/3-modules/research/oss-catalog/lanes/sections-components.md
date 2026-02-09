# Lane: Page Sections / Components (FAQ, pricing, testimonials, newsletter)

Goal: collect OSS sources for **content-heavy page sections** we can mine into our own component library:
- Blog/article pages (TOC, callouts, related posts)
- Marketing pages (pricing tables, feature grids, testimonials)
- Support-ish pages (FAQ, contact/CTA blocks)

This lane is intentionally **front-end and copy/paste friendly**. We are not “integrating a platform” here — we’re harvesting patterns and primitives.

Where to mine (file pointers, no cloning):
- `docs/.blackbox/oss-catalog/component-source-map.md` → “Marketing / page sections (FAQ, pricing, testimonials, newsletter)”

Deepen notes (net-new section kits):
- `docs/.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/deepen-section-kits-marketing-blocks.md`
Canonical picks (mine 1–2 variants per block; stop searching):
- `docs/.blackbox/oss-catalog/blocks-kit-marketing-variant-picks.md`

## What we’re looking for (high-signal)

### Page sections / blocks
- FAQ (accordion behavior, deep-linking to questions, search within FAQ)
- Pricing tables (monthly/yearly toggle, highlighting tiers, feature comparisons)
- Testimonials (star rating + quote card patterns, carousel/stack layouts)
- Newsletter / waitlist (email capture UX, validation, spam controls)

### Component system traits (what makes a repo worth mining)
- Accessible primitives (keyboard nav, focus states)
- Clear theming tokens (colors, spacing, typography)
- Composition patterns (how blocks are assembled from primitives)
- Examples/screenshots that show real layouts (not just primitives)

## Current curated highlights (from our catalog/curation)

Primary sources (deepen; mine first):
- `saadeghi/daisyui` — Tailwind component system (huge surface area)
- `themesberg/flowbite` — Tailwind component library/framework
- `markmead/hyperui` — copy/paste Tailwind blocks
- `mertJF/tailblocks` — Tailwind “blocks” library
- `merakiuilabs/merakiui` — Tailwind blocks (RTL/dark-mode support)
- `ant-design/ant-design-landing` — ready-made landing page “section” elements (Nav/Banner/Pricing/Teams/Footer)
- `LiveDuo/destack` — Next.js page builder + bundled section themes (HyperUI/Flowbite/Preline/Tailblocks)
- `AlexandroMtzG/remix-blocks` — Remix “blocks” demo (newsletter/contact/forms/table patterns)
- `ephraimduncan/blocks` — shadcn-based UI blocks
- `lmsqueezy/wedges` — React+Radix+Tailwind component library

Secondary references (watch; useful but don’t mine first):
- `StaticMania/keep-react` — React+Tailwind components
- `creativetimofficial/material-tailwind` — Tailwind components w/ Material-ish style
- `hunvreus/basecoat` — general-purpose Tailwind component library
- `kokonut-labs/kokonutui` — shadcn+motion component collection
- `tommyjepsen/twblocks` — Next.js+shadcn copy/paste blocks
- `ObservedObserver/convertfast-ui` — shadcn/tailwind landing-page blocks
- `TailGrids/tailwind-ui-components` — lots of blocks; treat as broad reference
- `themeselection/flyonui` — license NOASSERTION; verify first
- `rakheOmar/Markdrop` — visual markdown builder; license NOASSERTION; verify first

## Recommended run (copy/paste)

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (sections/components pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-sections-components.md --no-derived-queries --min-stars 100 --max-total-queries 24 --max-queries-per-group 8 --max-repos 120 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site|course|homework|assignment|leetcode)\\b"`

## Stop rule (avoid churn)

If we run **2 passes** and get:
- mostly redundant libraries (“yet another Tailwind blocks repo”), or
- lots of “template”/personal-site noise,

…pause this lane and shift to:
- storefront integration code (cart/variants/search), or
- ops primitives (returns/workflows/audit/policy).
