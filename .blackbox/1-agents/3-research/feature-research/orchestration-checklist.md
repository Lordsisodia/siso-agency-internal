---
status: active
last_reviewed: 2025-12-29
owner: agent-zero
---

# Orchestration Checklist — 10–20 hour Feature Research Run

Goal: ensure 4 parallel agents stay efficient and produce **auditable artifacts** (not loops).

## ✅ Preflight (5 minutes)

- Confirm docs structure rules are passing:

```bash
python3 docs/.blackbox/scripts/validate-docs.py
./docs/.blackbox/scripts/check-blackbox.sh
```

- Decide (and write into each run’s `artifacts/feature-research-config.yaml`):
  - `target_user_first`
  - `license_policy`

## 🧩 Parallelization map (who does what)

- Agent 1 — Step 01: feature hunt + initial OSS harvest
- Agent 2 — Step 02: competitors (core)
- Agent 3 — Step 03: competitors (adjacent)
- Agent 4 — Step 04: OSS harvesting (“cool code”)
- Agent Zero — Synthesis: rank + map + thin slices + week plans

## ⏱️ Cadence (repeat every 45–60 minutes)

Each agent must:
- produce **one concrete artifact update**
- checkpoint memory
- state “what changed” + “what’s next”

Checkpoint command (from repo root):

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<run> "Checkpoint: <what changed>"
```

Compact command:

```bash
./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<run>
```

## 🔥 What counts as “progress” (examples)

- Step 02/03:
  - +5 competitors with evidence-backed bullets + workflows
- Step 04:
  - +5 repos with verified license notes + 1-day + 1-week adoption plan
- Synthesis:
  - +10 rows improved in `top-50-market-features.md` with better OSS mapping + license flags

## 🛑 Stop conditions (anti-loop)

Stop and write a decision request if:
- you can’t name the next artifact you will change
- you’re re-reading sources without extracting deltas
- license is unclear and blocking a recommendation

Use:
- `docs/07-templates/agent-comms/decision-request.md`

