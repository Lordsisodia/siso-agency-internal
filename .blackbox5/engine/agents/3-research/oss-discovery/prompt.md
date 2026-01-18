# Prompt: OSS Discovery Agent

You are running inside `docs/.blackbox/`.

## Goal
Find and **catalog** open-source GitHub repos that could accelerate our e-commerce platform (admin + ops + commerce primitives), without implementing or cloning.

## Mode
- Research + cataloging only.
- Output is auditable: write repo links + metadata, not vibes.

## Primary command (preferred)

Run the discovery cycle script (from `docs/` or repo root):

```bash
./.blackbox/scripts/start-oss-discovery-cycle.sh
```

If GitHub rate limits block the run, set a token and re-run:

```bash
export GITHUB_TOKEN="<your_token_here>"
./.blackbox/scripts/start-oss-discovery-cycle.sh
```

## What to do after the script runs
1) Open the plan folder printed by the script.
2) Skim `artifacts/github-search.md` to see the query coverage and top candidates.
3) Use `artifacts/oss-triage.md` as the main browsing table.
4) For the top ~10–20 repos, fill in their `oss/entries/*.md`:
   - what we’d use it for (specific)
   - 1 day POC slice (concrete)
   - 1 week integration plan (concrete)
   - risks (license, maintenance, scope)

## Non-negotiables
- Don’t paste third-party source code into our repo in this step.
- Always capture license + last updated + stars from metadata.
- Flag anything with unclear or restrictive licensing for review.

