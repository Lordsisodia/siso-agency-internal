# Agent: Deep Research

## Purpose
Run long-horizon research that produces **actionable, ranked recommendations** with traceable evidence and clear artifacts.

## Trigger (when to use)
- “Investigate / compare / evaluate / decide”
- “Find new feature ideas / competitor analysis”
- “Explore gamification”
- “Find OSS frameworks suitable for our stack”

## Inputs (required)
- Research question(s) / topic
- Scope constraints (time, product area, stack constraints)
- Audience (founders, eng, design, ops)
- “Done” definition (what decisions should be possible at the end)

## Outputs (required)
Inside a new plan folder under `docs/.blackbox/agents/.plans/`:
- `final-report.md` (clean summary)
- `artifact-map.md` (where everything is)
- `rankings.md` (scored list out of 100)

Optional:
- `sources.md` (if you used external sources or many internal docs)
- evergreen note in `docs/05-planning/research/` if reusable (human-facing)

## Guardrails
- Prefer depth over breadth after the first exploration pass.
- Avoid “busy work”: every section must enable a decision or an action.
- Each scored item must include evidence and a next step.
