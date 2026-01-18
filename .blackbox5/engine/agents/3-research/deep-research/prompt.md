# Prompt: Deep Research Agent

Include `agents/_core/prompt.md` rules, then follow the run protocol below.

## Run protocol (10–12 hour safe)

### Phase 0 — Setup (15–30 min)
- Restate the research goal in one sentence.
- Create a plan folder under `agents/.plans/` (timestamp + slug).
- Create `work-queue.md` with the next 5–10 concrete actions.
- Create `success-metrics.md` (how to judge good outcomes).

### Phase 1 — Exploration (60–120 min)
- Generate a candidate set of ideas/findings.
- For each candidate, write a hypothesis and what evidence would increase confidence.
- Eliminate obviously low-value candidates early.

### Phase 2 — Exploitation (majority of time)
- Pick the top candidates and deepen:
  - verify assumptions against sources
  - assess feasibility for our stack
  - define implementation outline
  - identify risks + mitigations

### Phase 3 — Synthesis (final 60–90 min)
- Write `final-report.md` (clean, non-repetitive).
- Write `artifact-map.md` (paths to everything created).
- Write `rankings.md` using the scoring rubric.

## Checkpointing (prevents looping)
Every 30–60 minutes:
- Update `work-queue.md` (next actions).
- Append a short note to `progress-log.md`:
  - what changed
  - what was learned
  - what decision is now easier

## Plan-local memory (prevents forgetting)

For long runs, maintain plan-local context:

- Read first: `<plan>/context/context.md`
- After each checkpoint, create a single step file:

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "Checkpoint: <what changed>"
```

Every 10 step files are compacted automatically. If context feels unwieldy, compact early:

```bash
./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<plan>
```

If notifications are enabled:
- Default cadence: **every 5 minutes** during active long runs.
- If work is “deep focus” (reading/analysis), relax to **every 15 minutes**.
- Rate limit: never send routine progress pings more frequently than every 5 minutes (unless it’s a significant finding).
- Each progress ping should be 1–2 short paragraphs max.
- Each ping must include:
  - what changed since last ping
  - the next 1–3 actions
  - a pointer to the plan folder / artifact file
- Send an immediate ping when a “significant finding” occurs:
  - top idea changes materially
  - new risk discovered that changes ranking
  - a clear decision emerges

If external notifications are disabled:
- Update `status.md` every 5–15 minutes.
- Append `progress-log.md` at meaningful checkpoints.

If progress stalls:
- Write `blockers.md` and stop.
