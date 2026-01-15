# Component Mining Playbook (storefront + blog + marketing pages)

This playbook defines how we mine OSS repos for **UI patterns and reusable components** without turning the codebase into a vendor dump.

## Goal

Produce a small, reusable internal “blocks kit” for:
- Blog/article pages (TOC, heading anchors, callouts, code blocks)
- Marketing/content-heavy pages (pricing, testimonials, FAQ, newsletter)
- Storefront surfaces (product cards, grids, filters, cart controls)

## Guardrails (non-negotiable)

1) **No token leaks**
   - Always use GitHub CLI auth + `GITHUB_TOKEN="$(gh auth token)" …` in scripts.
2) **License gating**
   - Only copy/adapt code from `license_bucket=safe` repos (MIT/Apache/BSD/ISC/MPL-2.0).
   - If `verify`, treat as “reference only” until confirmed.
   - If `flagged` (GPL/AGPL/LGPL), do not copy code. Patterns-only notes are OK.
3) **Prefer “patterns” over “code copy”**
   - Start by extracting layout/state/accessibility patterns into notes/specs.
   - Only copy code if it measurably accelerates delivery and license is safe.

## What to extract (checklist)

For each candidate repo/component:
- **Component purpose** (what user job does it do?)
- **States**: default, loading, empty, error, disabled, overflow
- **A11y**: keyboard nav, focus ring, aria labels, reduced motion, contrast
- **API surface**: props, slots/composition, theming tokens
- **Data boundaries**: what is “dumb UI” vs what requires data fetching/state
- **Responsive behavior**: mobile/tablet/desktop layout + breakpoints
- **Visual patterns**: spacing, typography, iconography, shadows/borders

## 1-day “blog page kit” mini-POC (recommended)

Objective: validate we can assemble a high-quality blog/article page from primitives.

Steps:
1) **Rendering pipeline**
   - Use `remark` + `remark-rehype` + `rehype-slug` + `rehype-autolink-headings` + `rehype-react`.
2) **Code blocks**
   - Use `rehype-pretty-code` or `shiki` patterns (already in catalog).
3) **Page sections**
   - Add 3 marketing blocks to the same page:
     - FAQ accordion
     - pricing table
     - testimonials block with star rating
4) **Acceptance criteria**
   - All headings are linkable and TOC works.
   - Keyboard navigation works for TOC + FAQ accordion.
   - Code blocks have copy button + scroll behavior.
   - Blocks are responsive and look good on mobile.

## Where to record mining output

- High-level lane notes:
  - `.blackbox/oss-catalog/lanes/storefront-content.md`
  - `.blackbox/oss-catalog/lanes/sections-components.md`
- Implementation contracts (stable interfaces):
  - `.blackbox/oss-catalog/blocks-kit-contracts.md`
- Repo-specific decisions:
  - `.blackbox/oss-catalog/curation.json` `notes` (append; do not overwrite)
