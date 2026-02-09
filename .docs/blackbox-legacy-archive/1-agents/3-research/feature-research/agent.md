# Agent: feature-research (4-agent program)

## Purpose
Run a structured, multi-agent market research program to:
- scan competitors (core + adjacent)
- harvest “cool code” (OSS) for fast integration
- synthesize an execution map (features → thin slices → week plans)

This agent package is the **orchestrator**: it tells humans/agents how to launch and coordinate the 4 workstreams.

## Trigger (when to use)
- You want a fresh 10–20 hour market scan.
- You’re defining the product surface area for the admin dashboard + core ops.
- You want a ranked set of features + OSS building blocks before building.

## Inputs (required decisions)
Set these early (or you’ll drift):
- Target user first: `"merchant admins"` or `"internal ops"`
- License policy: e.g. `"prefer permissive; flag GPL/AGPL"`

Optional but helpful:
- GitHub token in env (`GITHUB_TOKEN` or `GH_TOKEN`) to reduce API rate limits.
- A seed list of competitors (if you want structured coverage fast).

## Outputs
Creates 5 plan folders under `.blackbox/agents/.plans/`:
- Step 01: feature hunt + initial OSS harvest
- Step 02: competitors (core) matrix + evidence
- Step 03: competitors (adjacent) matrix + evidence
- Step 04: OSS harvesting (cool code) + build-vs-buy
- Synthesis (Agent Zero): feature map, ranked OSS, thin-slice specs, week backlogs

## Guardrails (non-negotiables)
- Research only: don’t implement product code in this run.
- Don’t paste third-party source code into this repo.
- Treat GitHub “license” metadata as best-effort; verify before recommending adoption.
- Timebox each step; ship artifacts, don’t spiral.

## Primary launcher (preferred)
From `docs/`:

```bash
./.blackbox/scripts/start-feature-research.sh \
  --target-user-first "merchant admins" \
  --license-policy "prefer permissive; flag GPL/AGPL"
```

This script prints the created plan paths and generates a “kickoff portal” doc inside the synthesis plan:
- `<synthesis-plan>/artifacts/kickoff.md`

