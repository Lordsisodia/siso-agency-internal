# Deep Research Context Pack (Lumelle)

Date: 2025-12-28

This is the **shared context** for multi-hour research runs (Deep Research or similar agents).

It captures:
- product positioning + business model
- current client profile
- architecture constraints (repo conventions)
- what “good output” looks like for us
- long-run agent memory rules (step-by-step + compaction)

---

## 0) Operating Rules (for long runs)

### 0.1 Step-by-step plan-local memory (required)
For any run that lasts longer than ~30 minutes, the agent must maintain context files inside the run folder:
- `<plan>/context/steps/` — **each file = one step**
- `<plan>/context/compactions/` — **every 10 steps → 1 compaction**
- `<plan>/context/reviews/` — **every 10 compactions (~100 steps) → review scaffold**

**Commands:**
```bash
# after each checkpoint
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "Checkpoint: <what changed>"

# manual compaction (optional; auto-runs every 10 steps)
./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<plan>
```

### 0.2 Compaction size cap (to prevent context bloat)
Default compaction target is capped (configurable):
- `BLACKBOX_CONTEXT_MAX_BYTES` (default: 1MB)

Example (increase to ~2MB if needed):
```bash
BLACKBOX_CONTEXT_MAX_BYTES=$((2*1024*1024)) ./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<plan>
```

### 0.3 OSS + licensing guardrails (non-negotiable)
When collecting open-source code candidates:
- Prefer permissive licenses (`MIT`, `Apache-2.0`, `BSD-*`).
- Flag copyleft (`GPL`, `AGPL`, `LGPL`) separately for review.
- Save **repo links + license + why it’s useful** in the artifacts.

---

## 1) Product / Positioning (what we’re building)

### One-line
Shopify-connected ecommerce experiences with a custom admin + Supabase-backed data layer, differentiated by **AI-driven workflows** that make ops faster and safer.

### What it is (today)
- Delivered as **custom builds per client**
- Internally structured like a **SaaS**: ~95% repeatable functionality and code structure; UI and selected options vary per client.
- Shopify is the **system of record** for commerce (orders/products/checkout).
- Supabase is the **data/ops layer** (sync, analytics, workflow state, admin surfaces).
- Future direction: transition into a configurable SaaS where merchants can self-select modules/options.

### What it is *not*
- Not trying to replace Shopify checkout/core primitives right now.
- Not “just a theme”: includes admin, workflows, and backend services.

---

## 2) Current Client Snapshot (research target)

Vertical: women’s beauty products (e.g., shower caps, heatless curlers)

Order volume: ~10,000 orders/month (approx; directionally relevant for ops tooling)

Near-term integrations:
- Shopify (permanent for now)
- Stripe and others later, as other clients come in (multi-integration platform direction)

Key differentiator goal:
- AI-driven workflows embedded in the product (not just “AI copywriting”)

---

## 3) What we want from Deep Research (deliverables)

We want outputs that can be turned into:
- a **feature matrix** (what competitors offer)
- a **module checklist** (Catalog Ops, Returns Ops, CX Ops, etc.)
- a **prioritized build roadmap** (what to build next for the platform)
- a shortlist of **open-source frameworks** that accelerate delivery

Preferred output formats:
- Markdown tables
- CSV-like tables in Markdown
- Clear “top 10 recommendations” with rationale
- Citations/links for every non-obvious claim (features, limits, pricing)

---

## 4) Repo Architecture / Constraints (important for build planning)

### Repo overview (from README.md)
````md
# Lumelle App (Domain-first Vite/React)

Modernized, AI-friendly layout with domain isolation and UI/logic/data separation.

## Quick start
```bash
npm install
npm run dev      # start Vite dev server
npm run typecheck
npm run build
```

## Key paths
- `src/domains/` – bounded contexts:
  - `landing`, `blog`, `shop` (products/cart/checkout/shared), `account`, `auth`, `admin`, `shopify`.
  - Each domain uses `ui/{pages,sections,components,layouts}`, plus `logic/`, `data/`, `hooks/`, `providers/` as needed.
- `src/lib/` – shared helpers (`lib/utils/*`, `lib/ui.ts`).
- `functions/api/**` – **Cloudflare Pages Functions** API implementation (`/api/*` on Cloudflare Pages).
- `api/**` – legacy **Vercel** serverless snapshot (kept for reference; not used on Cloudflare).
- `docs/` – project knowledge base; see `docs/02-engineering/architecture/ARCHITECTURE-HOWTO.md` and `docs/08-meta/repo/meta/domains-README.md`.
- Automated PR reviews (optional): see `docs/02-engineering/tooling/ai-code-review.md`.

## Conventions
- If it renders, it lives in `ui/`.
- Behavior belongs in `logic/`; data fetching in `data/`; co-locate types with their code.
- Use domain aliases: `@landing`, `@shop`, `@blog`, `@admin`, `@auth`, `@account`, `@shopify`, `@/lib/*`.
- Shared UI helpers live in `src/lib/ui.ts`.

## Environment
Copy `.env.example` to `.env` and fill Shopify/Supabase/Clerk keys as needed. See `docs/02-engineering/architecture/ARCHITECTURE-HOWTO.md` for details.

## Shopify webhooks (orders → Supabase)
- Shopify signs Admin API webhooks with your app **API secret / client secret** (`SHOPIFY_API_SECRET`).
- Some older deployments also use `SHOPIFY_WEBHOOK_SECRET`; keep it set to the **same value** as `SHOPIFY_API_SECRET` (or omit it if unused).
- Webhook callback URLs can’t be on your shop’s own domains; use a separate receiver domain (e.g. your Cloudflare Pages `*.pages.dev` URL).
- Quick sanity check: `node scripts/check-orders-webhook.mjs --url=https://<your-app-url>` should return `200 OK` for `SHOPIFY_API_SECRET`.
````

### Architecture conventions (from docs/02-engineering/architecture/ARCHITECTURE-HOWTO.md)
````md
# Architecture How-To

Date: December 10, 2025

## When adding a new feature
1) Pick the domain first (landing, shop/products, shop/cart, shop/checkout, blog, auth, account, admin, shopify).
2) Place UI under `src/domains/<domain>/ui/`:
   - pages/ – route entry components
   - sections/ – reusable page sections
   - components/ – small domain-only UI
   - layouts/ – shell wrappers
3) Put behavior in `logic/` and data fetching in `data/` inside the same domain; keep React out of `logic/`.
4) Types live beside the code that uses them (same folder), not in a global types folder.
````
