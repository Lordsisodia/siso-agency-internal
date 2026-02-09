# Skill: Docs Routing + Ledger (Information Organization)

## Purpose
Ensure that every meaningful output lands in the **right place** and stays **findable later**.

This skill prevents “we did work but can’t find it” by requiring:
- a canonical destination
- a traceable artifact pointer
- a ledger entry

## Trigger (when to use)
Use this when you:
- create new docs outside `.blackbox/`
- move/rename docs
- promote a result from research into a visible doc

## Outputs (artifacts)
1. A plan folder in `docs/.blackbox/agents/.plans/` (if multi-step)
2. A docs-wide ledger entry appended to `docs/08-meta/repo/docs-ledger.md`
3. Updated index/README in the destination folder (if needed)

## Routing rules (simple)
### 1) Decide “canonical” vs “artifact”
- **Artifacts** (raw dumps, sources, extracts) → stay inside the plan folder (`artifacts/`)
- **Canonical docs** (what the team should read/use) → go in the visible `docs/0X-*/` structure
- **Reusable research** → `docs/.blackbox/deepresearch/` (then link back to the plan artifacts)

### 2) Always leave pointers
Whenever you create/update a canonical doc, include:
- where the supporting artifacts live (plan folder path)
- where the canonical summary lives (doc path)

### 3) Update the ledger (append-only)
Append one line to:
- `docs/08-meta/repo/docs-ledger.md`

Format:
- `YYYY-MM-DD — <type> — <topic> — <canonical path> — artifacts: <plan path>`

