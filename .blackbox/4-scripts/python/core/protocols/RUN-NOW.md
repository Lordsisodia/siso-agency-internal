# Run Now: Docs Black Box

This is a “do the thing right now” cheat sheet for using `docs/.blackbox/` as a personal agent runtime.

## Codex CLI (how you “run” the agent)

Start interactive:

```bash
codex
```

Resume the most recent session:

```bash
codex resume --last
```

## 0) Sanity check (recommended)

From `docs/`:

```bash
./.blackbox/scripts/check-blackbox.sh
```

If this passes, your structure + templates are consistent.

## 0b) Snapshot hygiene (recommended for long runs)

If your run will fetch lots of web pages (competitors, docs, pricing), prefer **stable snapshot names** so you don’t create unbounded disk growth:

```bash
python3 .blackbox/scripts/research/snapshot_urls.py \
  --input <urls.txt> \
  --out-dir <snapshots-dir> \
  --stable-names
```

## 0c) Long-run monitor (recommended for 10–20 hour runs)

If you’re running the feature-research program for many hours, start a monitor that:
- auto-syncs templates if needed
- validates docs/blackbox structure periodically
- checks feature-research run health (optional)

From `docs/`:

```bash
./.blackbox/scripts/start-10h-monitor.sh \
  --feature-research-synth .blackbox/agents/.plans/<synth-plan> \
  --notify-local
```

---

## 1) Start a run (universal)

Create a plan folder (this is your run workspace + audit trail):

```bash
./.blackbox/scripts/new-plan.sh "<goal>"
```

Example:

```bash
./.blackbox/scripts/new-plan.sh "deep-research competitor matrix"
```

Open the created folder under `docs/.blackbox/agents/.plans/` and use:
- `README.md` for goal + context
- `checklist.md` for steps
- `work-queue.md` / `progress-log.md` if it’s a long run
- `artifacts/` for run outputs (seeded templates)

---

## 1b) Run the 4-agent Feature Research program (recommended)

If you want the full “competitors + OSS + synthesis” setup (4 parallel agents + Agent Zero synthesis), use:

From `docs/`:

```bash
./.blackbox/scripts/start-feature-research.sh \
  --target-user-first "merchant admins" \
  --license-policy "prefer permissive; flag GPL/AGPL"
```

This prints 5 plan folders and generates a coordination portal:
- `<synthesis-plan>/artifacts/kickoff.md`

Agent package (read-first):
- `.blackbox/agents/feature-research/`

What “good outputs” look like (from the synthesis plan):
- `artifacts/top-50-market-features.md`
- `artifacts/oss-ranked.md`
- `artifacts/thin-slices/`
- `artifacts/week-1-backlog.md`, `artifacts/week-2-backlog.md`, `artifacts/week-3-backlog.md`

## 1c) OSS discovery (GitHub scan → catalog)

One cycle (creates a plan folder + artifacts under `docs/.blackbox/agents/.plans/...`):

```bash
./.blackbox/scripts/start-oss-discovery-cycle.sh
```

Inspect effective settings without side effects (useful when no-token auto-tune is active):

```bash
./.blackbox/scripts/start-oss-discovery-cycle.sh --print-settings
```

Tip: the cycle prefers “new” repos (not yet in `.blackbox/oss-catalog/catalog.json`) but will keep curated `adopt/poc/deepen` items; if that still yields too few repos it can run an automatic catalog-gap top-up (disable with `--no-catalog-gap-boost`).

Batch / unattended “agent mode” (runs multiple cycles over time; each cycle uses query rotation):

```bash
./.blackbox/scripts/start-oss-discovery-batch.sh --runs 6 --interval-min 60 -- --min-stars 200
```

Cross-run catalog output (metadata only; deduped by `owner/repo`):
- `.blackbox/oss-catalog/catalog.json`
- `.blackbox/oss-catalog/index.md`
- `.blackbox/oss-catalog/risk.md`
- `.blackbox/oss-catalog/gap-queries.md`
- `.blackbox/oss-catalog/shortlist.md` (curated)

## 2) Deep Research (prompts + context pack)

Pick a prompt pack:
- `.blackbox/agents/deep-research/prompts/library/01-competitor-matrix.md` (example)

Shared context pack (copy/paste once per run):
- `.blackbox/agents/deep-research/prompts/context-pack.md`

### UI↔Infra plug-in architecture (Shopify now, Stripe later) — 6–10h / ~50 prompts

If your goal is: **separate UI from infrastructure**, so adapters can be swapped (Shopify now, Stripe later),
use the pinned plan folder:

- `.blackbox/agents/.plans/2025-12-28_2014_deep-research-architecture-ui-infra-plug-in-ports-adapters/`

Run it by following:
- `.blackbox/agents/.plans/2025-12-28_2014_deep-research-architecture-ui-infra-plug-in-ports-adapters/RUN-NOW.md`
- `.blackbox/agents/.plans/2025-12-28_2014_deep-research-architecture-ui-infra-plug-in-ports-adapters/agent-cycle.md` (exact 50 prompts)

Optional “copy/paste launcher” prompt pack:
- `.blackbox/.prompts/ui-infra-architecture-cycle.md`

Suggested workflow:
1) Create plan folder
2) Paste `context-pack.md` into your run notes (or keep it open in a split pane)
3) Paste the chosen `01-*.md` prompt into the AI session

---

### Backend↔Frontend interchangeability + scalability loop (10h / ~50 prompts)

If your goal is to reason from first principles about:
- keeping the backend stable while swapping frontends
- scaling both ends (edge/UI + BFF/data)
- preparing for multi-tenant Supabase (later)

Use the prompt pack:
- `.blackbox/.prompts/backend-frontend-interchangeability-loop.md`

And the runnable plan folder:
- `.blackbox/agents/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop/`

Run instructions:
- `.blackbox/agents/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop/RUN-NOW.md`
 - `.blackbox/agents/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop/agent-cycle-prompts-50.md` (exact 50 prompts, docs-only)
4) Write outputs into the plan folder:
   - `final-report.md`
   - `artifact-map.md`
   - `rankings.md`

Pro tip (24-hour runs):
- Create a checkpoint every 30–60 minutes:
  - `./.blackbox/scripts/new-step.sh --plan .blackbox/agents/.plans/<plan> "Checkpoint: <what changed>"`
- Keep the rolling memory compact:
  - `./.blackbox/scripts/compact-context.sh --plan .blackbox/agents/.plans/<plan>`

Runbook:
- `.blackbox/agents/deep-research/runbook.md`

---

## 2b) Competitor deepening (optional, but high leverage)

If you have a competitor list and want to quickly generate “evidence notes” + suggested workflows:

```bash
# 1) Snapshot common variants (pricing/docs/features)
python3 .blackbox/scripts/research/generate_url_variants.py \
  --input <competitor-urls.txt> \
  --output <competitor-variants.txt>

python3 .blackbox/scripts/research/snapshot_urls.py \
  --input <competitor-variants.txt> \
  --out-dir <snapshots/competitors-variants> \
  --stable-names

# 2) Extract evidence notes (headings + links + variant list)
python3 .blackbox/scripts/research/generate_competitor_evidence_batch.py \
  --plan-id <plan-folder-name> \
  --queue <competitors/deepening-queue.md> \
  --snapshots-dir <snapshots/competitors> \
  --variants-dir <snapshots/competitors-variants> \
  --out-dir <competitors/evidence> \
  --limit 10

# 3) Auto-suggest notable features + workflows into competitor entry files
python3 .blackbox/scripts/research/suggest_workflows_from_evidence.py \
  --plan-id <plan-folder-name> \
  --queue <competitors/deepening-queue.md> \
  --entries-dir <competitors/entries> \
  --evidence-dir <competitors/evidence> \
  --top 10
```

## 2c) Feature research run validation (optional, fast)

If you're running the 4-agent feature-research program, you can sanity-check that each agent produced non-empty artifacts:

```bash
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind step-01
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind step-02
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind step-03
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind step-04
python3 .blackbox/scripts/validate-feature-research-run.py --plan <plan-path> --kind synthesis
```

## 2d) Generate synthesis Evidence Index (optional, fast)

Once synthesis scorecards exist, generate a first draft crosswalk automatically:

```bash
python3 .blackbox/scripts/research/generate_evidence_index.py --synth-plan <synthesis-plan-path>
```

---

## 3) Promote evergreen notes (human-facing)

Evergreen research lives in the visible docs:
- `docs/05-planning/research/`

Use:

```bash
./.blackbox/scripts/promote.sh <plan-path> "<topic>"
```

Example:

```bash
./.blackbox/scripts/promote.sh \
  .blackbox/agents/.plans/2025-12-28_1910_deep-research-competitor-matrix \
  "competitor-matrix"
```

---

## 4) Optional: Telegram notifications

Skill:
- `.blackbox/agents/.skills/notifications-telegram.md`

Script:
- `.blackbox/scripts/notify-telegram.sh`

Setup helper:
- `.blackbox/scripts/telegram-bootstrap.sh`
