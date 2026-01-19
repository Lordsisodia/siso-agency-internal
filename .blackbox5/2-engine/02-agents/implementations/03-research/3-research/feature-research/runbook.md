# Runbook: Feature Research (4-agent scaffold + synthesis)

## Why this exists
This is the fastest way to run a **long, structured research program** without losing context.

You get:
- 4 parallel runs (feature hunt, competitors core, competitors adjacent, OSS harvesting)
- 1 synthesis run (Agent Zero) that turns it into build-ready outputs

## 0) Preflight (recommended)
From `docs/`:

```bash
./.blackbox/scripts/check-blackbox.sh
```

## 0b) Long-run monitor (recommended for 10–20 hour runs)

For multi-hour runs, start a monitor loop so sessions don’t silently drift:

```bash
./.blackbox/scripts/start-10h-monitor.sh \
  --feature-research-synth .blackbox/agents/.plans/<synth-plan> \
  --notify-local
```

Optional (opt-in): auto-compact plan context once step files hit the threshold:

```bash
./.blackbox/scripts/start-10h-monitor.sh \
  --feature-research-synth .blackbox/agents/.plans/<synth-plan> \
  --notify-local \
  --feature-research-auto-compact \
  --feature-research-compact-threshold 10
```

## 1) Start the 4-agent scaffold
From `docs/`:

```bash
./.blackbox/scripts/start-feature-research.sh \
  --target-user-first "merchant admins" \
  --license-policy "prefer permissive; flag GPL/AGPL"
```

This prints 5 plan paths and creates:
- a kickoff portal doc at: `<synthesis-plan>/artifacts/kickoff.md`

## 2) Launch the agents (what each one does)
Open each plan folder and follow `artifacts/start-here.md`.

- Agent 1 → Step 01 (feature hunt + initial OSS)
- Agent 2 → Step 02 (competitors: core)
- Agent 3 → Step 03 (competitors: adjacent)
- Agent 4 → Step 04 (OSS harvesting: cool code)
- Agent Zero → Synthesis (tie it all together)

## 2b) Autopilot mode (one prompt you can spam)

If you want to paste **the same prompt repeatedly** and have the agent self-direct:

- Universal autopilot prompt:
  - `docs/.blackbox/agents/feature-research/autopilot-loop-prompt.md`

It will:
- read `artifacts/feature-research-config.yaml` to infer role (step-01..04 or synthesis)
- self-pick the next action (gap-driven or output-driven)
- log prompts/plans/outputs/skills into `artifacts/` (MD-first)
- checkpoint every cycle into `context/steps/`

Template reference:
- `docs/07-templates/library/templates/research-autopilot-loop.md`

## 3) Memory + compaction (required)
Each agent must:
- write one step file per meaningful unit of work
- compact every ~10 steps (or earlier if context grows)

From `docs/`:

```bash
./.blackbox/scripts/new-step.sh --plan .blackbox/agents/.plans/<run> "Checkpoint: <what changed>"
./.blackbox/scripts/compact-context.sh --plan .blackbox/agents/.plans/<run>
```

## 3c) Compaction reviews (every ~10MB / 10 compactions)
Every **10 compactions** (≈100 steps), do a quick review to:
1) extract durable patterns that improve the agent (prompt/checklist/stop conditions)
2) delete or trim low-value drift content

From `docs/`:

```bash
# Write a review status file and (optionally) create missing review scaffolds.
./.blackbox/scripts/review-compactions.sh \
  --plan .blackbox/agents/.plans/<run> \
  --write \
  --create-missing-review-scaffolds
```

Review files live in:
- `.blackbox/agents/.plans/<run>/context/reviews/`

## 3b) Orchestration checklist (use for 10–20 hour runs)

- `.blackbox/agents/feature-research/orchestration-checklist.md`

## 3d) “Single pane of glass” (what to show stakeholders)

The synthesis plan maintains a small set of operator-friendly artifacts:

- `artifacts/achievement-log.md` — append-only timeline of KPI deltas
- `artifacts/telemetry.jsonl` + `artifacts/telemetry-latest.json` — structured metrics snapshots
- `artifacts/tranche-audit-status.md` — tranche draft + min-delta audit visibility
- `context/reviews/review-status.md` — whether compaction reviews are due

Repeatable ops plan:
- `docs/08-meta/maintenance/blackbox-ops-integration-plan.md`

## 4) Validate (fast sanity checks)
Use the validation script to confirm each run produced non-empty artifacts:

```bash
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind step-01
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind step-02
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind step-03
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind step-04
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind synthesis
```

## 5) Synthesis output targets (what “done” looks like)
The synthesis run should produce:
- `artifacts/top-50-market-features.md` (execution map, OSS license-flagged)
- `artifacts/oss-ranked.md` (cool-code shortlist)
- `artifacts/thin-slices/` (top 10 build-ready specs)
- `artifacts/week-1-backlog.md` + `artifacts/week-2-backlog.md`
- `artifacts/week-3-backlog.md` (bulk actions + queues + SLAs)
