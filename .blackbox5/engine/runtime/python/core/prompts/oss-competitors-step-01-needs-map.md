# Prompt Pack: Step 01 — Feature Hunt + OSS Harvest (E‑commerce Clients)

You are Agent 1 of 4 running a parallel competitive research program.

## ✅ Read-first (prevents drift)

Open and follow your plan config:
- `artifacts/feature-research-config.yaml`

If `decisions.target_user_first` or `decisions.license_policy` is still `TBD`, stop and request a decision (use `docs/07-templates/agent-comms/decision-request.md`).

## 🎯 Goal

Research **high-leverage features** other products have built for e-commerce clients and find **open-source repos/tools** we can tailor.

We are in the **research phase** only — do not implement.

Efficiency is the priority: breadth-first, then deepen only the winners.

## ✅ Required outputs (write into the plan folder)

- `artifacts/features-catalog.md` (comprehensive feature list, grouped + tagged)
- `artifacts/oss-catalog.md` (OSS repos/tools mapped to features)
- `artifacts/search-log.md` (query log: where you searched + what worked)
- `artifacts/summary.md` (top 15 features + top 25 OSS candidates)
- `artifacts/sources.md` (links)

## 🧩 Artifact templates (use the seeded structure)

Your plan folder should be scaffolded with templates for:
- `artifacts/features-catalog.md`
- `artifacts/oss-catalog.md`
- `artifacts/search-log.md`
- `artifacts/summary.md`
- `artifacts/sources.md`

Fill them in — don’t delete the headings.

## 🧭 Stages

### Stage 0 — Align

- Confirm scope: features that add value to e-commerce clients and are “reasonably easy to code”.
- Confirm constraints:
  - low-cost setups
  - OSS-first
  - integrate-friendly for a React/TS + Supabase + Shopify-ish stack
  - avoid “enterprise-only” features unless there’s a cheap OSS analog

### Stage 1 — Define feature buckets (10–15 min)

Create a short taxonomy (buckets) and use it consistently:

- Admin / operations
- Merchandising / CRO
- Retention / lifecycle
- Analytics / experiments
- Content / SEO
- Customer / support
- Platform primitives (flags, jobs, audit logs, permissions)

### Stage 2 — Robust search (efficient)

You must search:

1) **GitHub** (primary for OSS)
2) **Web** (adjacent sources: blogs, “awesome lists”, curated roundups, OSS alternatives)

Keep it efficient:

- Timebox: 30–45 min to build a candidate pool, then deepen only winners.
- Maintain `artifacts/search-log.md`:
  - query
  - where you searched
  - how many promising hits
  - what you learned (2 lines)

#### GitHub search playbook (use variations)

Use GitHub search and topics; vary by:

- query keyword set
- language filter (TypeScript, JavaScript, Go, Python)
- stars threshold (e.g. `stars:>200`, `>1000`)
- recent activity (e.g. “updated recently”)

Example query patterns (rotate):

- `ecommerce admin dashboard open source`
- `shopify app admin dashboard open source`
- `headless commerce admin open source`
- `retention lifecycle marketing open source`
- `feature flags open source`
- `ab testing open source`
- `product analytics open source`
- `heatmap open source`
- `cms open source react`
- `rich text editor react open source`
- `media library open source react`
- `workflow automation open source`
- `queue dashboard open source`

Also search by **GitHub topics**:

- `shopify-app`
- `headless-commerce`
- `ecommerce`
- `admin-dashboard`
- `feature-flags`
- `analytics`
- `ab-testing`
- `cms`

Fast query bank (copy/paste):

- `docs/.blackbox/snippets/research/github-search-queries.md`

#### “Everywhere else” (fast sources)

- “awesome-*” GitHub lists relevant to: ecommerce, analytics, OSS SaaS, admin dashboards
- “open source alternative to <tool>”
- OSS directories / aggregators (keep links in `sources.md`)
- Blog posts / roundups for:
  - CRO tooling stacks
  - experimentation stacks
  - ecommerce ops tooling

### Stage 3 — Build the comprehensive features list

Write `artifacts/features-catalog.md` as a structured list.

For each feature:

- Name
- Category (from taxonomy)
- “Job to be done”
- Why it’s high leverage (ROI)
- Complexity guess (S/M/L) + why
- Dependencies (data, integrations)
- Competitors known for it (if any)
- OSS options (links or “none yet”)

### Stage 4 — OSS mapping (code-first)

Write `artifacts/oss-catalog.md` with entries mapped to features:

- Repo/tool name + link
- License
- What it covers (feature(s))
- Integration notes (stack fit)
- Adoption path (1 day POC / 1 week integration / 1 month hardening)
- Risks (maintenance, security, scope mismatch)

### Stage 5 — Prioritize winners

Pick top 15 features and top 25 OSS candidates and explain:

- why it matters now
- why it’s feasible for us
- what we’d build vs adapt vs buy (cheap)

### Stage 3 — Maintain memory

After each meaningful chunk, add a step file:

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "Needs map checkpoint: <what changed>"
```

## 🧪 Communication format

- ✅ Summary (1–3 bullets)
- 🔥 Top 15 features (ranked)
- 🧩 Top 10 OSS repos/tools (ranked)
- ❓ Open questions (numbered)

Preferred “what the agent says” templates:
- `docs/07-templates/agent-comms/read-aloud-status-update.md`
- `docs/07-templates/agent-comms/decision-request.md`
