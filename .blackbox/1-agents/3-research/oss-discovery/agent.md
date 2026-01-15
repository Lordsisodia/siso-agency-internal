# Agent: oss-discovery

## Purpose
Run a repeatable GitHub “discovery cycle” to find and catalog OSS repos that can accelerate our e-commerce platform.

## Trigger (when to use)
- We want a fresh set of OSS candidates for known feature areas (admin, ops, commerce primitives).
- We want to expand the candidate pool before doing deeper build-vs-integrate decisions.
- We want a periodic “market scan” (weekly/monthly) without cloning code.

## Inputs
- Query bank (recommended): `.blackbox/snippets/research/github-search-queries.md`
- Optional: a GitHub token in env (`GITHUB_TOKEN` or `GH_TOKEN`) to avoid rate limits.
- Optional: a feature list to steer queries (future enhancement).

## Outputs
Creates a plan folder under `.blackbox/agents/.plans/` via `new-run.sh` and writes:
- `artifacts/github-search.md` — markdown report of live search results
- `oss/tranche-001-repos.txt` — de-duped `owner/repo` list (input to fetch)
- `oss/entries/*.json` — raw GitHub repo metadata (API response)
- `oss/entries/*.md` — per-repo “OSS Project Entry” scaffold
- `artifacts/oss-triage.md` — table summary from metadata
- `artifacts/oss-shortlist.md` — top-N shortlist (heuristic)
- `artifacts/oss-index.md` + `artifacts/oss-ranked.md` — scored indexes (heuristic)
- `artifacts/extracted.json` — machine-readable candidate list (for downstream agents)

Also updates a cross-run catalog (metadata only):
- `.blackbox/oss-catalog/catalog.json`
- `.blackbox/oss-catalog/index.md`

## Guardrails
- Don’t clone repos or copy/paste code into this repo during discovery.
- Don’t write secrets (tokens must be env vars only).
- Treat GitHub “license” metadata as best-effort; verify before adoption.
- Flag copyleft/unknown/fair-code for legal review.

## Run loop
0) Optional: inspect effective settings (no side effects) with `./.blackbox/scripts/start-oss-discovery-cycle.sh --print-settings`
1) Create a new run with `./.blackbox/scripts/start-oss-discovery-cycle.sh`
2) Review `artifacts/github-search.md` and `artifacts/oss-triage.md`
3) Deepen the best candidates in their `oss/entries/*.md` files
4) Promote top learnings to evergreen docs if needed

Notes:
- If you run without a token and metadata fetch gets blocked, auto-tune will reduce query volume on subsequent runs (state: `.blackbox/.local/oss-discovery-state.json`).
- For unattended scanning, use the batch runner: `./.blackbox/scripts/start-oss-discovery-batch.sh --runs 6 --interval-min 60 -- --min-stars 200`

## Agent-cycle scaffold (recommended for “run this for hours”)
If you want a long-running, checklist-driven session (run → curate → pick POCs → repeat), scaffold an agent-cycle plan:

```bash
./.blackbox/scripts/start-oss-discovery-agent-cycle.sh
```

It links the prompt pack at `.blackbox/.prompts/oss-discovery-agent-cycle.md`.
