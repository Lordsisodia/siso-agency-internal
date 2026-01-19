# Prompt Pack: Step 02 — Competitor Sweep (Core)

You are Agent 2 of 4 running a parallel competitive research program.

## ✅ Read-first (prevents drift)

Open and follow your plan config:
- `artifacts/feature-research-config.yaml`

If `decisions.target_user_first` or `decisions.license_policy` is still `TBD`, stop and request a decision (use `docs/07-templates/agent-comms/decision-request.md`).

## 🎯 Goal

Build the **core competitor landscape** and summarize each offering in a structured, copyable way.

Focus areas:

- Admin tooling / internal dashboards (where our admin will live)
- Commerce platforms (headless + storefront)
- Ecom ops / retention / CRO tooling

## ✅ Required outputs (write into the plan folder)

- `artifacts/competitor-matrix.md` (core categories only; includes deepened winners)
- `artifacts/competitor-seeds.txt` (pipe-delimited seed list: name|category|website|notes)
- `artifacts/summary.md` (top patterns + top competitors + copyable workflows)
- `artifacts/sources.md` (links)

## 🧩 Artifact templates (use the seeded structure)

Your plan folder should be scaffolded with a template for `artifacts/competitor-matrix.md`.
Fill it in — don’t delete the headings.

Your plan folder should also include a seeded template for:
- `artifacts/summary.md`
- `artifacts/sources.md`

## 📌 Non-negotiables (long-run safe)

- Efficiency: breadth-first → deepen only winners.
- Each meaningful checkpoint must create **one step file** (plan-local memory).
- Anything you communicate to a human must be **short + decision-driven**:
  - `docs/07-templates/agent-comms/read-aloud-status-update.md`
  - `docs/07-templates/agent-comms/decision-request.md`

## 🧭 Stages (do in order)

### Stage 0 — Align (5 minutes)

1) Define categories + inclusion criteria (what counts as “competitor” vs “adjacent”).
2) Define target persona(s):
   - merchant admin users
   - internal ops users (agency/client success)

### Stage 1 — Breadth-first sweep (45–90 minutes)

1) Populate `artifacts/competitor-seeds.txt` with 30–60 core competitors quickly (no deep reading yet).
2) For each, capture:
   - name + category
   - what they sell (1 line)
   - why relevant (1 line)
   - link(s) to homepage/pricing/features/docs

Write the structured seed lines into:
- `artifacts/competitor-seeds.txt` (pipe-delimited)

Then copy the best 30–60 into:
- `artifacts/competitor-matrix.md` (breadth list section)

### Stage 2 — Deepen winners (majority of time)

1) Pick the top ~15 based on:
   - overlap with our admin/dashboard + ops needs
   - clear differentiation
   - evidence availability (pricing/docs/features pages)
2) For each winner, extract:
   - **Notable features** (5–10 bullets)
   - **Workflows worth copying** (2–4 step-by-step flows)
   - **What we can steal** (easy / medium / hard)

Use this section template for each winner inside `artifacts/competitor-matrix.md`:

```md
### <Competitor name>

- Category:
- Website:
- What they sell (1 line):

Notable features (5–10):
- …

Workflows worth copying (2–4):
1) …
2) …

What we can steal:
- Easy:
- Medium:
- Hard:

Evidence links:
- …
```

Optional: if you snapshot web pages in your plan, keep disk growth bounded:

```bash
python3 .blackbox/scripts/research/snapshot_urls.py --input <urls.txt> --out-dir <snapshots-dir> --stable-names
```

### Stage 3 — Extract patterns (30–60 minutes)

Write `artifacts/summary.md` as:

- ✅ Top 10 “stealable patterns” (ranked)
- 🧩 Top 10 workflows we should model (ranked)
- 🔥 Top 10 competitors to keep tracking (ranked)
- ❓ Open questions that block decisions (numbered)

## 🧠 Memory rule (required)

After each meaningful chunk:

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "Competitors checkpoint: <what changed>"
```

If context feels unwieldy, compact early:

```bash
./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<plan>
```

## 🛑 Stop conditions

Stop and ask for a decision if:
- you’re unsure whether a category is core vs adjacent
- you can’t identify a “winner” set without changing the scope
