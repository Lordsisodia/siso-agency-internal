# Prompt: OSS Discovery Agent Cycle (multi-run)

You are working inside `docs/.blackbox/`.

## Goal
Run repeated OSS discovery cycles and turn results into an actionable shortlist for our e-commerce platform.

“Actionable” means:
- We have links + metadata captured (not source code).
- We have a small curated shortlist with owners + next steps.
- We have 3–6 concrete POCs we can run in 1–2 days each.

## Guardrails (non-negotiables)
- Do **not** clone repos or copy/paste third-party source code into this repo during discovery.
- Do **not** store secrets in files (GitHub token must be an env var only).
- Treat GitHub “license” metadata as best-effort; flag anything unclear/restrictive for legal review.

## Recommended environment

```bash
export GITHUB_TOKEN="…"    # strongly recommended to avoid rate limits
```

## Operating loop (repeat)

### 1) Run a discovery cycle

```bash
./.blackbox/scripts/start-oss-discovery-cycle.sh
```

Fast path (cycle → seed curation → render catalog):

```bash
./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "<name>" -- --min-stars 200
```

Open the printed plan folder under `.blackbox/agents/.plans/...` and review:
- `artifacts/oss-ranked.md`
- `artifacts/coverage.md`
- `artifacts/diagnostics.md` (selected/excluded gap tags + rate limit signals)
- Use the triage rubric: `.blackbox/snippets/research/oss-triage-rubric.md`

### 2) Curate 5–15 candidates immediately
Add “human intent” to the cross-run catalog curation file:

```bash
python3 ./.blackbox/scripts/research/oss_catalog_curate.py \
  --curation .blackbox/oss-catalog/curation.json \
  add owner/repo --status triage --priority 10 --owner "<name>" --notes "why it matters"
```

Bulk-seed curation from a run’s extracted output (fast path):

```bash
python3 ./.blackbox/scripts/research/seed_oss_curation_from_extracted.py \
  --extracted-json .blackbox/agents/.plans/<run>/artifacts/extracted.json \
  --curation .blackbox/oss-catalog/curation.json \
  --top 15 --status triage --owner "<name>" --note-prefix "Seeded: "
```

Even faster: auto-pick the most recent run:

```bash
python3 ./.blackbox/scripts/research/seed_oss_curation_from_extracted.py \
  --latest \
  --curation .blackbox/oss-catalog/curation.json \
  --top 15 --status triage --owner "<name>" --note-prefix "Seeded: "
```

Promote the top few to deeper work:
- `status=poc` for “we should try this in 1–2 days”
- `status=deepen` for “needs deeper evaluation”
- `status=adopt` for “strong candidate; integrate when ready”

Then regenerate the shortlist:

```bash
python3 ./.blackbox/scripts/research/render_oss_catalog_shortlist.py \
  --catalog .blackbox/oss-catalog/catalog.json \
  --curation .blackbox/oss-catalog/curation.json \
  --out .blackbox/oss-catalog/shortlist.md
```

Generate an execution-ready POC backlog:

```bash
python3 ./.blackbox/scripts/research/generate_oss_poc_backlog.py \
  --catalog .blackbox/oss-catalog/catalog.json \
  --curation .blackbox/oss-catalog/curation.json \
  --out .blackbox/oss-catalog/poc-backlog.md
```

### 3) Pick POCs (make them concrete)
Pick 3–6 repos and write:
- 1–2 day POC slice
- integration plan (1 week)
- risks + mitigation

Write these in the run plan’s `oss/entries/*.md` and record the essentials in `.blackbox/oss-catalog/curation.json` (suggested optional fields below).

Optional curation fields (preserved by `oss_catalog_curate.py`):

```json
{
  "full_name": "owner/repo",
  "status": "poc",
  "priority": 10,
  "owner": "Alice",
  "notes": "Why we care",
  "poc": {
    "timebox_days": 2,
    "scope": "Concrete slice to prove value",
    "acceptance_criteria": "Measurable success criteria",
    "decision_by": "2026-01-15"
  }
}
```

### 4) Checkpoint
Record what changed:

```bash
./.blackbox/scripts/new-step.sh --plan .blackbox/agents/.plans/<plan> "Checkpoint: ran cycle + curated N + picked POCs"
```

## Stop conditions (when the cycle is “done enough”)
- Shortlist has 10–25 repos with clear statuses and owners.
- 3–6 POCs are written as concrete tasks.
- “Platform primitives” are clear: what we should build vs integrate.
