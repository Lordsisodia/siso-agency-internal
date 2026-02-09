# Prompt: Feature Research Program (Orchestrator)

You are running inside `docs/.blackbox/`.

## Goal
Generate evidence-backed market intelligence that turns into **build-ready thin slices**:
- competitor patterns (what exists)
- open-source building blocks (what we can leverage)
- a ranked feature map (what we should build next)

## Mode
- Research + synthesis only (no implementation).
- Output is auditable: links + evidence + file paths.

## Launch (preferred)
From `docs/`:

```bash
./.blackbox/scripts/start-feature-research.sh \
  --target-user-first "merchant admins" \
  --license-policy "prefer permissive; flag GPL/AGPL"
```

Then open the printed synthesis plan path and read:
- `artifacts/kickoff.md` (this is the coordination portal)

## How to run 4 agents in parallel (simple)
1) Create 4 separate agent sessions (one per step 01–04).
2) In each session, open that step’s plan folder and follow:
   - `artifacts/start-here.md`
   - the prompt pack listed inside it
3) Each agent must checkpoint + compact context as they go.

## Human comms (read-aloud / status)
Use these templates when updating humans:
- `docs/07-templates/agent-comms/read-aloud-status-update.md`
- `docs/07-templates/agent-comms/decision-request.md`
- `docs/07-templates/agent-comms/end-of-run-summary.md`

