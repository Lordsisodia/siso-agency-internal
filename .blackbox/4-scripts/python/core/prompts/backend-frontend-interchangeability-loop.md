# Backend↔Frontend Interchangeability + Scalability — Prompt Pack (First Principles)

Use this to run a long interactive CLI session (≈6–10h / ≈50 prompts) where the agent:
- inspects the repo architecture
- reasons from first principles (invariants, contracts, failure modes)
- produces a concrete execution plan (docs only; no app code changes unless explicitly requested)

---

## Hard constraints (paste at start)

1) No app code changes (read-only analysis + `.md` planning).
2) Use first principles:
   - define invariants
   - identify boundaries
   - list failure modes
   - propose the simplest architecture that satisfies constraints
3) Every claim must point to a file path (or a command output saved under `artifacts/`).
4) Write outputs into the plan folder.
5) Every 5 prompts: checkpoint (`status.md` + `progress-log.md`).

---

## What “good” looks like

You end with:
- a clear boundary contract (what the frontend needs from backend)
- a scalable tenancy model (even if implemented later)
- a migration plan (phased, reversible, measurable)
- explicit acceptance checks (so you know when you’re done)

---

## The “First Principles” framing (use throughout)

### Invariants (non-negotiable)
- Frontend swappable: UI can be replaced without touching backend logic.
- Backend stable: provider integrations and data model remain stable as you swap UIs.
- Tenancy-ready: request has an explicit tenant context even if there’s only one tenant today.
- Observability: failures should be diagnosable (errors classified, not random).

### Boundaries (where complexity must live)
- Vendor boundaries: Shopify/Stripe/etc. must be behind adapters.
- Data boundary: Supabase is behind a stable interface (direct UI access minimized).
- Edge boundary: Cloudflare resolves tenant + auth and exposes a stable `/api/*`.

---

## Suggested prompt sequence (50 prompts)

### Phase 0 — Setup and invariants (1–5)
1) Restate the objective and constraints in one paragraph (no code changes).
2) List the “invariants” and how we will measure each (acceptance checks).
3) List the key repo areas to inspect (paths only) and why each matters.
4) Write a draft boundary diagram (frontend → `/api/*` → ports → adapters → vendors/DB).
5) Checkpoint: update `status.md` + `progress-log.md`.

### Phase 1 — Data gathering (6–20)
6) Map boot flow: `main.tsx` → `router.tsx` → `App.tsx` (summarize providers and domains).
7) Inventory platform runtimes (`platform/*/runtime.ts`) and their provider selection logic.
8) Inventory platform ports (commerce/content/payments/auth/storage) and list DTOs/operations.
9) Identify where UI/domains talk directly to vendors/DB (paths + why).
10) Identify key identifiers: ProductKey/VariantKey/CartKey; find where raw vendor IDs still exist.
11) Identify tenancy assumptions (where code assumes “single tenant”).
12) Identify edge assumptions (checkout handoff, domain routing, `/api/*` usage).
13) Identify performance scaling hotspots (cart, product, content, admin data).
14) Identify security hotspots (auth, RLS, token usage).
15) Checkpoint.
16) Write a coupling inventory table: “leak type / file / severity / fix direction”.
17) Draft a “backend contract surface v0”: list endpoints aligned to ports.
18) Draft an “auth model”: how requests carry user + tenant identity.
19) Draft a “tenant config model”: tenant_integrations, domains, feature flags.
20) Checkpoint.

### Phase 2 — Architecture proposal (21–35)
21) Propose the stable backend boundary (BFF): what must run server-side vs client-side.
22) Decide tenancy resolution strategy: host-based vs path-based vs auth-based (storefront vs admin).
23) Decide DB access strategy: service-role backend default vs client RLS direct access (justify).
24) Define the “capabilities model” used by UI (checkout/payment/content).
25) Define error semantics end-to-end (PortError codes, retries, fallbacks).
26) Define caching strategy (edge caching vs API caching vs client caching).
27) Define observability: logs/metrics/traces/events (min viable).
28) Checkpoint.
29) Define directory layout rules that enforce boundaries (imports).
30) Identify which existing files violate the rules (paths only; no fixes yet).
31) Define the minimum set of adapters to support multi-tenant (Shopify/content, Stripe, Supabase).
32) Define an interface for tenant config lookup (single tenant now; multi later).
33) Validate proposal against constraints (one-by-one).
34) Write “north star” docs: one page architecture + one page migration.
35) Checkpoint.

### Phase 3 — Migration plan (36–47)
36) Stage plan 0–5 (reversible), with acceptance checks.
37) Identify the smallest first implementation step with highest leverage.
38) Define a regression gate: “vendor leaks” and “boundary import” checks.
39) Define a minimal test plan (contract tests + smoke flows).
40) Checkpoint.
41) Write a “Week 1 execution checklist”.
42) Write a “Week 2/3” expansion list.
43) Define risk log: what can break and how to mitigate.
44) Define stop points: safe intermediate states.
45) Checkpoint.
46) Summarize decisions and open questions (only those that block).
47) Write final rankings (what to do next, why).

### Phase 4 — Wrap (48–50)
48) Write `final-report.md` with links to all docs.
49) Write `artifacts/summary.md` (1-page skim).
50) Checkpoint + next action recommendation.

