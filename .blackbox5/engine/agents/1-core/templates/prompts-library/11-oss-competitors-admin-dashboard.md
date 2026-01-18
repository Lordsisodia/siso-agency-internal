# Prompt Pack: OSS Competitors + “Cool Code” for Admin Dashboard

You are running a **long-run competitive research + OSS harvesting** effort for this repo.

## 🎯 Goal

1) Build a competitor landscape (including adjacent spaces).
2) Identify **open-source code** we can leverage (admin dashboard + core functionality).
3) Prioritize **low-cost setups** and “cool code” we can integrate quickly.

## ✅ Outputs (required)

Produce the following artifacts under the plan folder:

- `artifacts/competitor-matrix.md`
- `artifacts/oss-candidates.md`
- `artifacts/build-vs-buy.md`
- `artifacts/recommendations.md`
- `artifacts/sources.md` (links/citations)
- `artifacts/run-meta.yaml` (run metadata)

## 🧭 Stages (do not skip)

### Stage 0 — Align (15–30 min)

- Restate the mission in 2 sentences.
- Confirm assumptions about our product:
  - We ship repeatable custom builds (agency starter) moving toward SaaS.
  - Admin dashboard is a key surface.
- Confirm constraints:
  - Prefer OSS and low-cost.
  - Prefer code we can realistically integrate into a React/TS + Supabase + Shopify-ish stack.

### Stage 1 — Define what we need (30–60 min)

Write `artifacts/needs-map.md`:

- Admin dashboard surfaces:
  - content editor (pages, blog)
  - media library
  - analytics / experiments
  - customer/segments
  - orders/fulfillment integrations (or stubs)
  - permissions
- Core platform surfaces:
  - auth, billing (if any), notifications, audit logs
  - feature flags / experiments
  - search
  - SEO automation

For each need, capture:
- “Job to be done”
- Integration constraints
- What “done” looks like

### Stage 2 — Competitor sweep (2–6 hours)

Goal: breadth first, but structured.

Create `artifacts/competitor-matrix.md` with categories like:

- Shopify app builders / admin tooling
- Headless commerce platforms
- Ecom ops / retention / CRO tooling
- CMS / page builders / content ops
- Experimentation / analytics stacks
- Customer support / returns / subscriptions adjacent

For each competitor capture:
- What they do (1 paragraph)
- Differentiators
- Pricing model (ballpark; note if uncertain)
- Likely “stealable” patterns (UX, workflow)
- OSS/SDKs they expose (if any)
- Notes for admin dashboard relevance

### Stage 3 — OSS harvesting (4–10 hours)

Goal: find code we can integrate, not just ideas.

Create `artifacts/oss-candidates.md` with entries including:

- Repo name + link
- License (must be permissive or clearly usable)
- What it gives us (feature)
- Integration notes (React/TS? headless? backend?)
- Maintenance health signals (commits, issues, stars are secondary)
- “Adoption path”:
  - POC in 1 day
  - integration in 1 week
  - hardening in 1 month

Focus on:
- Admin UI components (tables, filters, bulk actions)
- Rich text/content editors
- Media libraries / upload + transformations
- Analytics dashboards
- Feature flagging / experiments
- Background jobs + queues
- Audit logging / activity feeds

### Stage 4 — Build vs buy (1–2 hours)

Create `artifacts/build-vs-buy.md`:

- For each high-value need:
  - Build from scratch (est effort)
  - Adapt OSS (candidate + effort)
  - Use managed low-cost tool (cost + tradeoffs)

### Stage 5 — Recommendations (final 60–90 min)

Create `artifacts/recommendations.md`:

- Top 10 recommendations ranked by:
  - Impact
  - Time-to-value
  - Integration fit
  - Ongoing maintenance burden
- Include 3 “cool code” quick wins that can be integrated fastest.

## 🛑 Stop conditions

Stop and ask for a decision if:

- Licensing is unclear for a top candidate.
- The top recommendation requires a product decision (permissions model, data ownership, etc.).
- You need to expand scope beyond admin + core platform.

## 🧪 Communication format (what you tell the user at checkpoints)

At each checkpoint, send:

- ✅ What changed (1–3 bullets)
- 📦 New artifacts (paths)
- 🔥 Top 3 emerging candidates (names + why)
- ❓ Decisions needed (if any)

