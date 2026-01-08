# ✅ `.todo/` (Agent-sprinted work tracker)

This folder is a lightweight planning surface that sits *next to* `.blackbox/`.

- `.blackbox/` = issue tracker + plans (problem → options → chosen → steps → verification)
- `.todo/` = sprint board by agent role (“who is doing what this sprint”)

## How this links together

1. Feedback doc lands in `docs/knowledge/feedback/...`
2. We normalize into `.blackbox/inbox/issues.md`
3. We group into `.blackbox/state/groups.md`
4. We sprint it in `.todo/`

## Folder layout

- `.todo/agents/` — per-agent sprint boards + skill files
- `.todo/sprints/` — sprint snapshots (time-boxed)

## Agents (roles)

These mirror `.blackbox/agents/*.md`:

- `01_research_grouping`
- `02_classification_options`
- `03_reasoning_selection`
- `04_implementation_executor`
- `05_review_verification`

## Current batch

4-1-26 (“4126”) feedback:
- `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`
- `docs/knowledge/feedback/4-1-26/4126.todo.md`

