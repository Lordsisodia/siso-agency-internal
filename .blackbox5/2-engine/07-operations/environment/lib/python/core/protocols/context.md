# 🧠 Docs Black Box — Context (read first)

## Purpose of this parent folder (`docs/`)
- This directory is the documentation workspace for Lumelle: product notes, architecture, research, and operational playbooks.

## How `.blackbox/` is used here
- Agent-local “runtime” lives in `docs/.blackbox/` so AI work stays scoped to docs.
- Long-running work should get a plan in `agents/.plans/`.
- Reusable playbooks live in `agents/.skills/`.
- Reusable evergreen notes can go in `deepresearch/`.

## Constraints / rules
- Don’t store secrets in `.blackbox/` (use env var names + placeholders only).
- Keep outputs scannable: short sections, checklists, explicit artifacts.
- Prefer adding reusable knowledge to `deepresearch/` instead of burying it in plan notes.

## Quick links
- `docs/.blackbox/protocol.md` (canonical protocol)
- `docs/.blackbox/README.md` (this box’s index)
- `docs/.blackbox/agents/deep-research/prompts/` (deep research prompt library)
- `docs/08-meta/repo/information-routing.md` (where to put new docs)
- `docs/08-meta/repo/docs-ledger.md` (docs-wide “where did we put it?” registry)
