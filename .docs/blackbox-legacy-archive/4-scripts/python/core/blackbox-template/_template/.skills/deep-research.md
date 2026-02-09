# Skill: Deep Research

## Purpose
Turn an ambiguous question into a **documented, executable plan** and then execute it while **ticking off** progress.

This skill is designed for “research work” where outcomes matter and you want traceability:
- what sources were used
- what decisions were made
- what remains to do

## Trigger (when to use)
Use when any of the following is true:
- The user asks for “research”, “investigate”, “compare”, “evaluate”, “find options”, “decide between”
- The task has unknowns and requires reading multiple docs/notes
- You expect follow-up iterations and want an audit trail

## Outputs (artifacts)
1. A **plan folder** saved in `.blackbox/agents/.plans/`
2. (Optional) A **research note** saved in `.blackbox/deepresearch/` if the work produces reusable knowledge
3. (Required) Run artifacts captured under the plan folder (recommended: `artifacts/`)
4. (Required when applicable) A “where did we put it?” entry in the domain’s tracking system (ledger/index/journal)

## Key requirements
This skill MUST be able to:
### (A) Identify which docs are needed
Produce an explicit list of docs to read and why.

### (B) Create a plan and save it in the plans folder
Plan folder location: `.blackbox/agents/.plans/`

### (C) Timestamp the plan with a specific goal
Plan must include:
- a **goal**
- a **created timestamp**
- optional **target date** (if the user gave one)

## Step-by-step framework

### 0) Clarify the goal (1–3 questions max)
If the user prompt is missing critical context, ask only what’s needed to proceed.

Minimum info to collect:
- Desired outcome (what “done” looks like)
- Constraints (time, scope, tools, budget, style)
- Where the answer will live (docs vs code vs both)

### 1) Identify docs needed (Doc Map)
Create a list:
- **Must-read**: directly impacts the decision/output
- **Should-read**: useful context
- **Nice-to-have**: optional, if time

For each doc, write:
- path / location
- what you expect to learn from it

### 2) Create the plan (before doing the work)
Create a new plan folder in `.blackbox/agents/.plans/` using the conventions in `.blackbox/agents/.plans/README.md`.

The plan MUST include:
- Goal
- Created timestamp
- A checklist of steps (task list)
- A “Docs to Read” section (from step 1)

### 3) Execute and tick off steps
While working:
- Mark each step `[x]` as it’s completed
- When a step is completed, add an inline completion time if useful (especially for longer work)

Recommended tick format:
- `- [x] Do thing (done: 2025-12-28 18:10)`

Also capture artifacts as you go:
- `artifacts/sources.md` — every source + what it supports
- `artifacts/summary.md` — short synthesis
- `artifacts/extracted.json` — structured data (when possible)
- `artifacts/raw.md` — full raw output (optional; may be gitignored)

### 4) Produce final deliverables
Deliverables depend on the task, but always include:
- Summary of what you concluded
- What docs/sources were used
- Any follow-ups / next plan

### 5) Optional: Write reusable knowledge back into Black Box
If the research is reusable:
- Save a short evergreen write-up in `.blackbox/deepresearch/`
- Link it from the plan under “Artifacts”

### 6) Organize and route deliverables (required)
If you create/update work outside `.blackbox/`:
- Put it in the correct parent-folder structure (don’t hide canonical docs inside `.blackbox/`)
- Update the nearest folder `README.md`/index so it’s discoverable
- If the repo has a docs-wide ledger/index, append an entry (append-only)

## Quality bar (what “good” looks like)
- Plan exists before execution begins
- Docs needed are explicit and not hand-wavy
- Steps are small enough to tick off meaningfully
- The final output references the plan and artifacts
