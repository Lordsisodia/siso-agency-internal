# Prompt Pack: Step 03 — Competitor Sweep (Adjacent Spaces)

You are Agent 3 of 4 running a parallel competitive research program.

## ✅ Read-first (prevents drift)

Open and follow your plan config:
- `artifacts/feature-research-config.yaml`

If `decisions.target_user_first` or `decisions.license_policy` is still `TBD`, stop and request a decision (use `docs/07-templates/agent-comms/decision-request.md`).

## 🎯 Goal

Cover adjacent spaces that influence what we should build in **admin + ops + core platform**.

Adjacent categories (in scope):

- CMS / page builders / content ops
- Analytics / attribution / heatmaps / session replay
- Experimentation / feature flags
- Customer support / returns / subscriptions (adjacent to admin experience)
- Workflow automation / internal tools (only if they have “stealable” admin patterns)

## ✅ Required outputs (write into the plan folder)

- `artifacts/competitor-matrix.md` (adjacent categories only; includes deepened winners)
- `artifacts/competitor-seeds.txt` (pipe-delimited seed list: name|category|website|notes)
- `artifacts/summary.md` (top patterns + top copyable workflows)
- `artifacts/sources.md` (links)

## 🧩 Artifact templates (use the seeded structure)

Your plan folder should be scaffolded with a template for `artifacts/competitor-matrix.md`.
Fill it in — don’t delete the headings.

Your plan folder should also include a seeded template for:
- `artifacts/summary.md`
- `artifacts/sources.md`

## 📌 Non-negotiables (long-run safe)

- Efficiency: breadth-first → deepen only winners.
- Every checkpoint produces a **step file**.
- All human-facing communication uses the short templates:
  - `docs/07-templates/agent-comms/read-aloud-status-update.md`
  - `docs/07-templates/agent-comms/decision-request.md`

## 🧭 Stages (do in order)

### Stage 0 — Align (5 minutes)

1) Define what counts as “adjacent” vs “out of scope”.
2) Define the “transfer test”:
   - If a feature/workflow improves an ecommerce admin workflow, it’s in scope.
   - If it’s pure enterprise infra with no admin UX learnings, deprioritize.

### Stage 1 — Breadth sweep (45–90 minutes)

1) Populate `artifacts/competitor-seeds.txt` with 30–60 tools across the adjacent categories.
2) For each, capture:
   - name + category
   - what they sell (1 line)
   - what we can steal (1 line hypothesis)
   - links (homepage + pricing/features/docs)

Write the structured seed lines into:
- `artifacts/competitor-seeds.txt` (pipe-delimited)

Then copy the best 30–60 into:
- `artifacts/competitor-matrix.md` (breadth list section)

### Stage 2 — Deepen winners (majority of time)

Pick the top ~15 based on:
- clearest reusable patterns
- easiest integration path (vibe coding)

For each winner, extract:
- Notable features (5–10 bullets)
- Copyable workflows (2–4 step-by-step flows)
- “Steal list” (easy / medium / hard)

Use this winner section template (paste per winner into `artifacts/competitor-matrix.md`):

```md
### <Tool name> (adjacent)

- Category:
- Website:
- What they sell:
- Admin/ops transfer insight (why it matters):

Notable features:
- …

Copyable workflows:
1) …
2) …

What we can steal:
- Easy:
- Medium:
- Hard:

Evidence links:
- …
```

### Stage 3 — Synthesis (30–60 minutes)

Write `artifacts/summary.md` as:

- ✅ Top 10 workflows we should model in our admin (ranked)
- 🧩 Top 10 product patterns (ranked)
- 🧪 Top 5 experimentation/analytics learnings (ranked)
- ❓ Open questions / assumptions to verify (numbered)

## 🧠 Memory rule (required)

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "Adjacent sweep checkpoint: <what changed>"
```

Compact early if context feels big:

```bash
./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<plan>
```

## 🛑 Stop conditions

Stop and ask for a decision if:
- you can’t apply the “transfer test” reliably
- a category is expanding too broadly (be strict)
