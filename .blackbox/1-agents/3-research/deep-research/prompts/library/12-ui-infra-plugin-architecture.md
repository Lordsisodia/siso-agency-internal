# Deep Research Prompt 12 — UI ↔ Infrastructure Plug‑In Architecture (Shopify now, Stripe later)

## CONTEXT

Read / paste the shared context pack first:
- `docs/.blackbox/.prompts/deepresearch/context-pack.md`

Local codebase context (read-only audit; do not change code):
- The app uses a domain-first layout under `src/domains/`.
- Vendor/client integrations live under `src/domains/platform/` (e.g. `@platform/commerce/shopify`).

## GOAL

Design an architecture that makes **UI interchangeable** and makes commerce infrastructure (Shopify today, Stripe/others later) a **plug-in adapter**, without changing code yet.

“Done” means we can point to:
1) A clear set of **ports (interfaces/contracts)** UI depends on
2) A mapping of current code to **ports vs adapters** (where Shopify leaks into UI today)
3) A migration plan that can be executed incrementally (low risk)

## SCOPE / RULES

- ✅ You may read files and propose boundaries.
- ❌ Do NOT modify application code in this run.
- ✅ You must reference concrete repo paths when making claims.
- ✅ Assume Shopify is current system of record; Stripe may be introduced later.
- ✅ Focus on separation: UI ↔ domain logic ↔ platform ports ↔ vendor adapters.

## WHAT TO AUDIT (START HERE)

Identify all Shopify touchpoints and categorize them:
- **UI leaks** (UI imports vendor clients, vendor IDs, vendor-specific copy)
- **Domain logic leaks** (client domain logic knows about vendor types)
- **Proper adapters** (platform layer vendor code)

Suggested ripgrep targets:
- `@platform/commerce/shopify`
- `runStorefront`
- `shopifyEnabled`
- `gid://shopify`
- `checkoutUrl`

## OUTPUTS (WRITE THESE FILES IN THE PLAN FOLDER)

You MUST produce these artifacts in the run folder:

1) `final-report.md`
   - Proposed target architecture (ports/adapters) in plain language
   - A “contract catalog”: the ports + DTOs + capability flags UI should use
   - A dependency rule set (what can import what)

2) `artifact-map.md`
   - A list of current files that violate the boundary (with short notes)
   - A list of “already good” files (existing adapter candidates)

3) `rankings.md`
   - Ranked migration steps (0–100) by leverage vs risk

Optional (recommended):
- `sources.md` (internal file paths + brief reasons)
- `checklist.md` (incremental refactor plan; no code yet)

## DESIGN REQUIREMENTS (NON‑NEGOTIABLE)

### A) UI should not know vendors
UI must not:
- import Shopify/Stripe SDK code
- depend on Shopify IDs (GIDs) directly
- show Shopify-specific copy unless explicitly provided by a capability/label

### B) Ports are stable; adapters are replaceable
Define ports such as:
- `CatalogPort` (products)
- `CartPort` (cart operations)
- `CheckoutPort` (begin checkout + capability model)
- `ContentPort` (sections/content blocks)

### C) Capabilities drive UI behavior
Stripe vs Shopify affects checkout UX. The port must expose capability flags so UI can render generically.

### D) “System of record” assumptions are explicit
Document what is authoritative today (Shopify) and what could change later.

## PROMPT

You are an architecture research agent auditing the current Luminelle/Lumelle codebase to design a plug‑in system where:
- UI is swappable/interchangeable
- Infrastructure (Shopify now, Stripe later) is behind stable internal contracts

TASKS:
1) Identify all current infra leaks into UI and domain logic (paths + examples).
2) Propose a target layering model:
   - UI components
   - domain logic/services
   - platform ports (interfaces) + DTOs
   - vendor adapters (Shopify, Stripe, mock)
3) Define the minimum port contracts and DTO shapes needed to support:
   - product fetch (by handle/id)
   - cart state + mutations
   - checkout initiation (redirect vs embedded, etc.)
   - content/sections (today via Shopify metaobjects; later maybe CMS/Supabase)
4) Propose a migration plan in steps:
   - Step 1 should reduce coupling without breaking behavior
   - Each step should name the exact files to touch later
   - Each step should have a “done” definition
5) Provide a short “north star” directory layout that matches the repo’s domain-first conventions.

QUALITY BAR:
- No vague advice. Use concrete file references and explicit interface names.
- Treat Shopify as current backbone, but design for multiple vendors.
- Prioritize incremental, reversible steps.

