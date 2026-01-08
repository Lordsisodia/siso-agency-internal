# Documentation

Use this file as the map. Content is organized into six top-level areas with consistent subfolders.

## Blackbox (agent workflow)
- `docs/.blackbox/` — agent-operable runtime for feedback → grouping → plans → implementation → verification
- Canonical docs routing + ledger:
  - `docs/process/information-routing.md`
  - `docs/process/docs-ledger.md`
 - Runs (per-batch workspaces): `docs/.blackbox/.runs/`
 - Domain knowledge (durable context): `docs/.blackbox/domains/`

## Top-Level Areas
- 🏗️ `platform/` — architecture, migrations, offline, BMAD
- 📦 `product/` — LifeLock domain + planning, PRDs, features
- ⚙️ `process/` — guides, AI ops, testing, decisions
- 📚 `knowledge/` — research, feedback, stories, thought-dumps
- 🎨 `design/` — UI/UX design plans
- 🕰️ `history/` — archive + legacy root notes

## Deeper Guide (2–3 levels)
- `platform/`
  - `architecture/` (decisions, patterns, system-maps, risk-reviews, lifelock, database, ecosystem, partner, duplication, tasks, offline-sync, misc)
  - `migration-reports/` (with `completion/` for final reports)
  - `offline/` — strategy/implementation/testing
  - `bmad/` — BMAD framework + outputs
- `product/`
  - `lifelock/` — domain, cleanup, migration, issues, timebox-notes, daily
  - `planning/` — lifelock-timeline, morning-routine, light-deep-work, daily-view, migration, timebox, ai-platform, features
  - `features/` — feature briefs
  - `prd/` — product requirements
- `process/`
  - `guides/` (fixes, qa, ai-sessions)
  - `ai-ops/` — AI session protection & prompt playbooks
  - `testing/` — reports & quick starts
  - `decisions/` — process/cleanup decisions
- `knowledge/`
  - `feedback/` — `pro-dev-feedback/`, `dated/`
  - `research/` — briefs, questions, comparisons
  - `stories/` — narrative docs
  - `thought-dumps/` — brainstorms
- `design/`
  - `ui-ux/` — design plans
- `history/`
  - `archive/` — historical/low-signal
  - `root-notes/` — legacy root markdowns

## Notes
- Root-level under `docs/` now only has this README and the six area folders.
- When in doubt, park old/low-signal items in `history/archive/` instead of deleting.
