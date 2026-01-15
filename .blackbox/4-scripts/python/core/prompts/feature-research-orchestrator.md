# Prompt Pack: Agent Zero — Orchestrate Feature + OSS Research (4-agent run)

You are Agent Zero. Your job is to **set up**, **coordinate**, and **synthesize** a 4-agent research run.

This is not implementation work — research only.

## ✅ Read-first (prevents drift)

Open and follow the synthesis config:
- `artifacts/feature-research-config.yaml`

If it still contains `TBD` decisions, request a decision before sending agents deep.

## 🎯 Goal

Produce a build-ready research outcome:

1) A comprehensive list of features we should consider building
2) A vetted shortlist of open-source repos/tools we can leverage
3) Clear “what to build next” recommendations with reasoning

## ✅ Required outputs (write into the synthesis plan folder)

- `artifacts/final-synthesis.md` (what we should build + why)
- `artifacts/features-ranked.md` (top 30 features scored)
- `artifacts/oss-ranked.md` (top 50 OSS candidates scored)
- `artifacts/open-questions.md` (decisions needed before building)
- `artifacts/evidence-index.md` (feature ↔ competitor ↔ OSS crosswalk)
- `artifacts/sources.md` (links)

## 🧭 Stage 0 — Setup (2 minutes)

Run the scaffold script to create 4 run folders + a synthesis folder:

```bash
./docs/.blackbox/scripts/start-feature-research.sh
```

You will get printed paths for:
- Step 01 — Feature Hunt + OSS Harvest (Agent 1)
- Step 02 — Competitors (Core) (Agent 2)
- Step 03 — Competitors (Adjacent) (Agent 3)
- Step 04 — OSS Harvesting (“Cool Code”) (Agent 4)
- Synthesis — merge everything (you)

## 🧭 Stage 1 — Kick off the 4 agents

For each agent:

1) Open their plan folder.
2) Paste the matching prompt pack (from `docs/.blackbox/.prompts/*.md`) into that agent session.
3) Ensure they write all outputs into that plan folder’s `artifacts/`.
4) Enforce plan-local memory:

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "Checkpoint: <what changed>"
```

Compaction happens every 10 steps automatically; force it early if needed:

```bash
./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<plan>
```

## 🗣️ “What the agent says” (required)

During long runs, keep human-facing updates short and consistent:

- Read-aloud status update template:
  - `docs/07-templates/agent-comms/read-aloud-status-update.md`
- Decision request template:
  - `docs/07-templates/agent-comms/decision-request.md`
- End-of-run summary template:
  - `docs/07-templates/agent-comms/end-of-run-summary.md`

## 🧭 Stage 2 — Merge and de-duplicate (you)

When the 4 agents have produced their outputs:

1) Merge feature lists → remove duplicates → keep best phrasing.
2) Merge OSS candidates → group by feature area → dedupe repos.
3) Score and rank:
   - **ROI** (impact)
   - **feasibility** (time + stack fit)
   - **maintenance risk** (bus factor, updates, security)
   - **license** (prefer permissive; flag copyleft)

## 🧭 Stage 2b — Evidence hygiene (optional but recommended)

If you snapshot competitor pages, keep disk growth bounded:

```bash
python3 .blackbox/scripts/research/snapshot_urls.py \
  --input <urls.txt> \
  --out-dir <snapshots-dir> \
  --stable-names
```

## 🧭 Stage 3 — Produce “build-ready” recommendations

Write `artifacts/final-synthesis.md` so it can drive execution:

- “Top 10 to build next” (with 1–2 sentence rationale each)
- “Top OSS accelerators” (what it replaces + integration notes)
- “Quick wins” (1–3 day scope)
- “High leverage, medium scope” (1–2 week scope)
- “Danger zones” (avoid until prerequisites exist)

## 🧭 Stage 4 — Build the Evidence Index (high leverage)

Fill `artifacts/evidence-index.md` as the browse-friendly crosswalk:
- top 10 features
- 2–3 competitors proving each feature
- 1–2 OSS accelerators per feature
- direct links into the evidence/artifacts

Optional: auto-generate a first draft (then edit):

```bash
python3 .blackbox/scripts/research/generate_evidence_index.py --synth-plan docs/.blackbox/agents/.plans/<synthesis-plan>
```

## 🛑 Stop conditions

Stop and ask for a decision if:
- we have conflicting priorities (e.g. CRO vs ops tooling)
- licensing policy needs to be clarified (GPL/AGPL handling)
- the “target user” is ambiguous (internal ops vs merchant admins)

When you need a decision, record it in:
- `artifacts/open-questions.md` (use the “Decision Log” structure from the seeded template)
