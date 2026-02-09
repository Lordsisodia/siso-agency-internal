# Skill: Long-Run Ops (Anti-looping + Adaptation)

## Purpose
Enable an agent to run for many hours without drifting into loops or low-value work by enforcing:
- checkpoints
- a value function
- exploration → exploitation scheduling
- explicit stopping criteria

## Trigger
- Any run expected to exceed ~60–90 minutes
- Deep research and multi-source synthesis

## Outputs
Inside the plan folder:
- `work-queue.md`
- `success-metrics.md`
- `progress-log.md`
- `blockers.md` (only if stuck)

## Memory + compaction cadence (required for long runs)

Goal: keep context durable and small enough that an agent can run for 10–20 hours without “forgetting”.

- One step = one file:
  - `<plan>/context/steps/####_*.md`
  - Each step file should represent **exactly one unit of work** (not a whole day).
- Every 10 step files:
  - compact into a single compaction file under:
    - `<plan>/context/compactions/`
  - target size: **≤ ~1MB per compaction** (short, information-dense)
- Every 10 compactions (≈100 steps, ≈10MB of compactions):
  - write a review file under:
    - `<plan>/context/reviews/`
  - the review must:
    - identify useful repeated patterns (what the agent should do more of)
    - identify useless noise (what to stop doing)
    - recommend pruning (delete or archive low-value step files if safe)

Commands (from `docs/`):

```bash
./.blackbox/scripts/new-step.sh --plan .blackbox/agents/.plans/<run> "Checkpoint: <what changed>"
./.blackbox/scripts/compact-context.sh --plan .blackbox/agents/.plans/<run>
```

## Checkpoint cadence
Every 30–60 minutes:
- Update the queue
- Record what changed
- Make one prioritization decision

## Value function (must answer before doing work)
Before a step, write:
- “After this step, we will have <artifact/change>”
- “This improves the result because <reason>”
- “If this fails, fallback is <plan B>”

## Stop conditions (hard)
Stop and write `blockers.md` if:
- you cannot name a new artifact you can produce
- you keep scanning sources without updating your hypotheses
- you are rephrasing the same conclusions
