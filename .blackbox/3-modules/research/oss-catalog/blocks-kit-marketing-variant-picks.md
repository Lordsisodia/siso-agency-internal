# Blocks Kit — Canonical Variant Picks (blog + marketing)

Updated: `2026-01-01`

Purpose: stop “infinite options” when mining section libraries.
For each block type, pick **1–2 canonical variants** to mine first, with file pointers.

Guardrails:
- Pattern mining only (no vendoring/cloning into this repo).
- Only copy/adapt from `license_bucket=safe` repos (MIT/Apache/BSD etc), with attribution.
- Keep it small: if we need more variants, add them intentionally.

Related:
- Contracts: `docs/.blackbox/oss-catalog/blocks-kit-contracts.md`
- Inventory: `docs/.blackbox/oss-catalog/blocks-inventory.md`
- File pointers: `docs/.blackbox/oss-catalog/component-source-map.md`
- Deepen notes: `docs/.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/deepen-section-kits-marketing-blocks.md`

---

## Canonical picks (mine these first)

### `HeroSection`
Pick A (section kit, many variants):
- `ant-design/ant-design-landing`
  - `site/templates/template/element/Banner0/index.jsx`

Pick B (theme pack + previews):
- `LiveDuo/destack`
  - `lib/themes/hyperui/Banner1/index.tsx` (if present; otherwise pick the closest `Banner*` variant)

What to extract:
- spacing + typography defaults
- CTA button layout (single vs double CTA)
- optional image/illustration handling (avoid layout shift)

### `FeatureGrid`
Pick A:
- `ant-design/ant-design-landing`
  - `site/templates/template/element/Content0/index.jsx` (or any `Content*` / `Feature*` element that matches “feature grid”)

Pick B:
- `markmead/hyperui`
  - feature grid / feature list blocks (see `component-source-map.md` “Marketing / page sections”)

What to extract:
- responsive column rules
- icon/title/description layout tokens
- max widths + heading sizing

### `StatsSection`
Pick A:
- `LiveDuo/destack`
  - `lib/themes/hyperui/Stats1/index.tsx`

What to extract:
- value/label spacing rules
- grid/row variants
- number formatting expectations (optional)

### `CtaSection`
Pick A:
- `LiveDuo/destack`
  - `lib/themes/hyperui/Cta1/index.tsx` (if present; otherwise a nearby `Cta*` variant)

What to extract:
- CTA button placement
- background/contrast patterns
- optional secondary CTA support

---

## Core “must ship” blocks (v1 marketing set)

### `FaqSection`
Pick A (TSX + preview):
- `LiveDuo/destack`
  - `lib/themes/hyperui/Faq1/index.tsx`

Pick B (HTML reference):
- `markmead/hyperui`
  - `public/components/marketing/faqs/1.html`

What to extract:
- keyboard interaction model (single-open vs multi-open)
- deep-linkable item ids (nice-to-have)
- accessibility attributes and focus management

### `PricingSection`
Pick A (section kit):
- `ant-design/ant-design-landing`
  - `site/templates/template/element/Pricing0/index.jsx`

Pick B (simple block library):
- `mertJF/tailblocks`
  - `src/blocks/pricing/light/a.js` (or any canonical pricing variant)

What to extract:
- “most popular” highlight pattern
- monthly/yearly toggle patterns (optional)
- comparison table variant (optional)

### `TestimonialsSection`
Pick A:
- `LiveDuo/destack`
  - `lib/themes/hyperui/Testimonials1/index.tsx`

Pick B:
- `merakiuilabs/merakiui`
  - `components/testimonials/Slider.html` (if we need a slider)

What to extract:
- avatar sizing / layout shift avoidance
- rating display semantics (“X out of 5 stars”)
- grid vs slider tradeoffs

### `NewsletterSignup`
Pick A (end-to-end submit flow reference):
- `AlexandroMtzG/remix-blocks`
  - `app/routes/blocks/email/newsletter-with-convertkit.tsx`

Pick B (TSX section variants):
- `LiveDuo/destack`
  - `lib/themes/hyperui/Form1/index.tsx` (if present; otherwise pick the closest newsletter/email capture form variant)

What to extract:
- loading/success/error states
- validation + anti-spam hook point (honeypot)
- layout variants (compact vs full-width)

---

## Stop rule (avoid churn)
If we have mined the above and can implement the contracts with 1–2 variants each, stop adding more section repos.
Only add a new variant when a real page requires it.

