# `agents/.plans/` (Black Box execution plans)

This folder stores **plan folders** created by the AI before it starts complex work.

Each plan is a directory so it can hold multiple markdown files (checklist, docs-to-read, notes, artifacts, etc.).

## Plan folder naming convention

Use this format:

`YYYY-MM-DD_HHMM_<goal-slug>/`

Examples:
- `2025-12-28_1815_deep-research-theme-migration/`
- `2025-12-28_1820_debug-checkout-extension-install/`

Rules:
- Use **24-hour time** (`HHMM`)
- Keep `<goal-slug>` short and descriptive (kebab-case)

## Required contents inside each plan folder

At minimum:
- `README.md` — goal + created timestamp + context
- `docs-to-read.md` — explicit doc list and why
- `checklist.md` — step list with `[ ]` / `[x]`

Recommended:
- `artifacts.md` — what files were created/updated
- `notes.md` — revisions, decisions, open questions
- `artifacts/` — run outputs (raw, sources, extracted, summary, run-meta)

## Progress tracking rules (ticking steps off)

Use GitHub-style checkboxes:
- `- [ ]` not done
- `- [x]` done

Recommended completion format:
- `- [x] Step name (done: 2025-12-28 18:22)`

If the plan changes mid-way:
- Don’t rewrite history silently
- Record the change in `notes.md`

## Template

Start every plan by copying the folder:
- `_template/`

## Archiving (keep `agents/.plans/` readable)

If `agents/.plans/` gets noisy, archive older runs into `agents/.plans/_archive/`:

```bash
# Preview (recommended)
python3 ./.blackbox/scripts/archive-plans.py --older-than-days 14 --dry-run

# Apply
python3 ./.blackbox/scripts/archive-plans.py --older-than-days 14
```

Pin a plan so it never archives:

```bash
touch ./.blackbox/agents/.plans/<plan>/.keep
```

## Long-run cycles (6–10 hours / ~50 prompts)

For long CLI sessions, scaffold an `agent-cycle.md` inside a plan folder:

```bash
./.blackbox/scripts/start-agent-cycle.sh --keep --hours 8 --prompts 50 "my goal"
```
