# Prompt Pack: Step 04 — OSS Harvesting (“Cool Code”)

You are Agent 4 of 4 running a parallel competitive research program.

## ✅ Read-first (prevents drift)

Open and follow your plan config:
- `artifacts/feature-research-config.yaml`

If `decisions.target_user_first` or `decisions.license_policy` is still `TBD`, stop and request a decision (use `docs/07-templates/agent-comms/decision-request.md`).

## 🎯 Goal

Find open-source repos/components we can integrate to cover our needs, prioritizing:

- low-cost setups
- fast integration
- high leverage (“cool code” that adds real functionality)

You are in **research only** mode (do not implement).

## ✅ Required outputs (write into the plan folder)

- `artifacts/oss-candidates.md` (longlist grouped by feature area)
- `artifacts/build-vs-buy.md` (only for top ~10 needs)
- `artifacts/summary.md` (top candidates + quick wins + recommended next steps)
- `artifacts/sources.md` (links)

## 🧩 Artifact templates (use the seeded structure)

Your plan folder should be scaffolded with templates for:
- `artifacts/oss-candidates.md`
- `artifacts/build-vs-buy.md`
- `artifacts/summary.md`
- `artifacts/sources.md`

Fill them in — don’t delete the headings.

## 📌 Non-negotiables (long-run safe)

- Efficiency: create a large candidate pool fast, then deepen only winners.
- Every checkpoint creates a plan-local memory step file.
- Use these templates when communicating to humans:
  - `docs/07-templates/agent-comms/read-aloud-status-update.md`
  - `docs/07-templates/agent-comms/decision-request.md`

## 🧭 Stages (do in order)

### Stage 0 — Align (5 minutes)

1) Start from “needs map” assumptions (admin + ops + ecommerce).
2) Define a “good OSS candidate” rubric:
   - license clarity (prefer permissive; flag copyleft/unknown/fair-code)
   - active maintenance (recent updates)
   - integration path (API-first or TS/JS-native)
   - deployability (Docker-friendly; can run in low-cost infra)

### Stage 1 — Harvest fast (45–90 minutes)

1) Generate 50–150 candidates across buckets:
   - admin scaffolding
   - workflow automation / job orchestration
   - search
   - analytics
   - feature flags
   - CMS/content ops
   - “admin primitives”: RBAC/audit logs/forms/tables
2) For each candidate, capture:
   - repo link
   - license (as best as you can quickly confirm)
   - 1-line “what it gives us”
   - which feature(s) it maps to

Write into:
- `artifacts/oss-candidates.md`

### Stage 2 — Deepen winners (majority of time)

Pick the top ~20 repos and “upgrade” them into integration-ready notes.

Use this step template for each deepened repo:
- `docs/07-templates/library/templated/oss-research-step.md`

Minimum for each deepened repo:
- What we’d use it for (1–3 bullets)
- 1 day POC slice (concrete)
- 1 week integration plan (concrete)
- Risks (maintenance/security/scope/license)

### Stage 3 — Build vs buy (top 10 needs)

Write `artifacts/build-vs-buy.md` as a table:

- Need
- Best OSS options (1–3)
- Cheapest “buy” alternative (if obvious)
- Recommendation: build vs integrate vs buy
- Why (1 line)

### Stage 4 — Summary (30–60 minutes)

Write `artifacts/summary.md` with:

- 🧩 Top 20 OSS candidates (ranked; include license notes)
- ⚡ Top 5 “quick wins” we can integrate fast
- 🧱 Top 5 “platform primitives” we must build ourselves
- ❓ Open questions (numbered; mostly licensing/hosting decisions)

## 🧠 Memory rule (required)

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "OSS checkpoint: <what changed>"
```

Compact early if context feels big:

```bash
./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<plan>
```

## 🛑 Stop conditions

Stop and ask for a decision if:

- the license is unclear or restrictive and it affects whether we can integrate
- the candidate is heavy to self-host and violates “low-cost”
- the candidate would “replace our platform” instead of accelerating one slice
