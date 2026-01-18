# Scripts

Helper scripts to create plans/agents quickly (and keep `.blackbox` tidy).

Typical usage:

```bash
./.blackbox/scripts/new-plan.sh "my-goal"
./.blackbox/scripts/new-agent.sh "My Agent Name"
```

Create a repeatable “run” (plan + artifacts + run metadata):

```bash
./.blackbox/scripts/new-run.sh deep-research "competitor matrix" \
  --prompt .blackbox/agents/deep-research/prompts/library/01-competitor-matrix.md
```

Promote a run to an evergreen deepresearch note + docs-ledger entry:

```bash
./.blackbox/scripts/promote.sh \
  docs/.blackbox/agents/.plans/2025-12-28_1910_deep-research-competitor-matrix \
  "competitor-matrix"
```

Run local docs + blackbox hygiene checks:

```bash
./.blackbox/scripts/check-blackbox.sh
```

One-command validate (recommended for long runs):

```bash
./.blackbox/scripts/validate-all.sh
./.blackbox/scripts/validate-all.sh --auto-sync
```

Continuous validate loop (for long sessions, writes a log; Ctrl+C to stop):

```bash
./.blackbox/scripts/validate-loop.sh --auto-sync --interval-min 15
```

Bounded validate loop (useful overnight; stops automatically):

```bash
./.blackbox/scripts/validate-loop.sh --auto-sync --interval-min 15 --max-runs 24
```

Stop after repeated failures (useful unattended):

```bash
./.blackbox/scripts/validate-loop.sh --auto-sync --interval-min 15 --max-failures 3
```

Telegram alerts + recovery notifications:

```bash
./.blackbox/scripts/validate-loop.sh --auto-sync --interval-min 15 --notify-telegram --notify-recovery --max-failures 3
```

Status output (optional):

```bash
./.blackbox/scripts/validate-loop.sh --auto-sync --interval-min 15 --status-md .blackbox/.local/validate-status.md
```

Notes:
- `--auto-sync` also attempts to fix missing executable bits via `./.blackbox/scripts/fix-perms.sh`.

Auto-sync options:
- Sync core docs too: `./.blackbox/scripts/validate-all.sh --auto-sync --sync-with-core`
- Sync agents/schemas too: `./.blackbox/scripts/validate-all.sh --auto-sync --sync-with-agents`
- Prune extra template files: `./.blackbox/scripts/validate-all.sh --auto-sync --sync-prune`

Fix template drift (when check-blackbox fails):

```bash
./.blackbox/scripts/sync-template.sh
./.blackbox/scripts/check-blackbox.sh
```

Fix executable permissions (if you see “permission denied”):

```bash
./.blackbox/scripts/fix-perms.sh
```

Optional: scan for vendor ID/copy leaks above adapters (report-only by default):

```bash
./.blackbox/scripts/check-vendor-leaks.sh
./.blackbox/scripts/check-vendor-leaks.sh --fail
```

Run the 1909 backend↔frontend interchangeability loop (refresh gates + print metrics):

```bash
./.blackbox/scripts/run-1909-loop.sh
```

Sync options:
- Preview: `./.blackbox/scripts/sync-template.sh --dry-run`
- Also sync core docs: `./.blackbox/scripts/sync-template.sh --with-core`
- Prune template files that no longer exist in live: `./.blackbox/scripts/sync-template.sh --prune`

Archive old plan folders (optional, keeps `agents/.plans/` readable):

```bash
python3 ./.blackbox/scripts/archive-plans.py --older-than-days 14 --dry-run
python3 ./.blackbox/scripts/archive-plans.py --older-than-days 14
```

Archive high-frequency OSS discovery runs by count (keeps only newest N, protects ledger-referenced + `.keep` plans):

```bash
python3 ./.blackbox/scripts/archive-oss-plans.py --dry-run
python3 ./.blackbox/scripts/archive-oss-plans.py --keep-latest 12
```

Pin a plan so it never archives:

```bash
touch ./.blackbox/agents/.plans/<plan>/.keep
```

Plan-local context (long-run memory):

```bash
# Create a single “step” file (one file per step)
./.blackbox/scripts/new-step.sh --plan .blackbox/agents/.plans/<plan> "Checkpoint: did X"

# Compact every 10 steps (or early if context is getting too big)
./.blackbox/scripts/compact-context.sh --plan .blackbox/agents/.plans/<plan>
```

Scaffold a full 4-agent feature research run (plus synthesis):

```bash
./.blackbox/scripts/start-feature-research.sh
```

Scaffold a long-running agent cycle (e.g. 6–10 hours / ~50 prompts):

```bash
./.blackbox/scripts/start-agent-cycle.sh --hours 8 --prompts 50 "UI ↔ infra plug-in architecture research"
```

Tip: keep the plan from being archived while active:

```bash
./.blackbox/scripts/start-agent-cycle.sh --keep --hours 8 --prompts 50 "My long run"
```

Resume an existing agent cycle (append N more prompts instead of overwriting):

```bash
./.blackbox/scripts/start-agent-cycle.sh --plan .blackbox/agents/.plans/<plan> --resume --prompts 10
```

Run a repeatable OSS “discovery cycle” (GitHub live search → repo tranche → metadata + entry stubs):

```bash
./.blackbox/scripts/start-oss-discovery-cycle.sh
```

One-command workflow (cycle → seed curation → render catalog):

```bash
./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Alice" -- --min-stars 200
```

Render OSS catalog artifacts (shortlist + backlog + risk + gaps):

```bash
./.blackbox/scripts/render-oss-catalog.sh
```

Run multiple cycles as a batch (unattended “agent” mode):

```bash
./.blackbox/scripts/start-oss-discovery-batch.sh --runs 6 --interval-min 60 -- --min-stars 200
```

Scaffold a long-running OSS discovery “agent cycle” plan (multi-run + curation checklist):

```bash
./.blackbox/scripts/start-oss-discovery-agent-cycle.sh
```

OSS discovery defaults + knobs:

- Defaults file: `.blackbox/agents/oss-discovery/config.yaml`
- Example overrides:
  - `./.blackbox/scripts/start-oss-discovery-cycle.sh --min-stars 200`
  - `./.blackbox/scripts/start-oss-discovery-cycle.sh --exclude-keywords "template,starter,boilerplate"`
  - `./.blackbox/scripts/start-oss-discovery-cycle.sh --exclude-regex "(?i)\\b(shadcn|tailwind)\\b"`
  - `./.blackbox/scripts/start-oss-discovery-cycle.sh --no-rotate`
  - `./.blackbox/scripts/start-oss-discovery-cycle.sh --state-file .blackbox/.local/oss-discovery-state.json`
  - Gap boost controls:
    - `./.blackbox/scripts/start-oss-discovery-cycle.sh --no-gap-boost`
    - `./.blackbox/scripts/start-oss-discovery-cycle.sh --gap-boost-max-total-queries 8`
    - `./.blackbox/scripts/start-oss-discovery-cycle.sh --gap-boost-min-stars 200`
    - `./.blackbox/scripts/start-oss-discovery-cycle.sh --gap-boost-min-stars-relaxed 50`
    - `./.blackbox/scripts/start-oss-discovery-cycle.sh --gap-boost-relax-excludes`
  - Debugging:
    - Check `artifacts/diagnostics.md` inside the run folder
    - Inspect effective settings (no side effects): `./.blackbox/scripts/start-oss-discovery-cycle.sh --print-settings`
  - Auto-tune:
    - If runs repeatedly fail to fetch repo metadata without a token, the script can auto-reduce `--max-total-queries` and `--max-repos`
    - State file (gitignored): `.blackbox/.local/oss-discovery-state.json`
    - Disable: `./.blackbox/scripts/start-oss-discovery-cycle.sh --no-auto-tune`
  - Prefer-new:
    - Filter tranche to prefer repos not already in `.blackbox/oss-catalog/catalog.json`
    - Disable: `./.blackbox/scripts/start-oss-discovery-cycle.sh --no-prefer-new`
    - Disable fallback when everything is already seen: `./.blackbox/scripts/start-oss-discovery-cycle.sh --prefer-new-no-fallback`
    - Keep curated (even if seen): `.blackbox/oss-catalog/curation.json` statuses `adopt,poc,deepen` (configurable)
  - Catalog gap boost:
    - If prefer-new yields too few repos, run a small top-up search using catalog-driven gap queries
    - Disable: `./.blackbox/scripts/start-oss-discovery-cycle.sh --no-catalog-gap-boost`
    - Tune: `catalog_gap_boost_min_tranche_repos`, `catalog_gap_boost_max_total_queries`, `catalog_gap_boost_min_stars_relaxed`, `catalog_gap_boost_max_tags_per_run`, `catalog_gap_boost_avoid_recent_tags`
  - Coverage quota boost:
    - Ensure minimum per-tag coverage in the current run by running a small extra search for under-covered tags
    - Disable: `./.blackbox/scripts/start-oss-discovery-cycle.sh --no-coverage-quota-boost`
    - Tune: `coverage_quota_min_count_per_tag`, `coverage_quota_max_total_queries`, `coverage_quota_min_stars_relaxed`, `coverage_quota_max_tags_per_run`, `coverage_quota_rotate_tags`, `coverage_quota_avoid_recent_tags`
  - Recent tag cache:
    - Avoids repeatedly searching the same “gap tags” across runs (tracked in `.blackbox/.local/oss-discovery-state.json` as `recent_gap_tags`)
    - Tune: `gap_tag_recent_window`
  - Cross-run catalog:
    - Catalog JSON: `.blackbox/oss-catalog/catalog.json`
    - Human index: `.blackbox/oss-catalog/index.md`
    - Risk report: `.blackbox/oss-catalog/risk.md`
    - Catalog gap queries: `.blackbox/oss-catalog/gap-queries.md`
    - Curation + shortlist: `.blackbox/oss-catalog/curation.json`, `.blackbox/oss-catalog/shortlist.md`
    - POC backlog: `.blackbox/oss-catalog/poc-backlog.md` (generate via `python3 ./.blackbox/scripts/research/generate_oss_poc_backlog.py ...`)
    - Bulk seed: add top N from a run into curation via `python3 ./.blackbox/scripts/research/seed_oss_curation_from_extracted.py ...`

Telegram notifications (optional):

```bash
export TELEGRAM_BOT_TOKEN="***"   # do not commit
export TELEGRAM_CHAT_ID="123456789"
./.blackbox/scripts/notify-telegram.sh "[Deep Research] Checkpoint: top 3 ideas identified"
```

Or (no `.env`): create a local markdown file (gitignored) at `docs/.blackbox/.local/telegram.md`:

```bash
mkdir -p ./.blackbox/.local
cat > ./.blackbox/.local/telegram.md <<'EOF'
bot_token: ***
chat_id: 123456789
EOF
./.blackbox/scripts/notify-telegram.sh "[Agent] Test ping"
```

Auto-detect your chat id (after messaging the bot once):

```bash
./.blackbox/scripts/telegram-bootstrap.sh
```

Local notifications (no keys required):

```bash
./.blackbox/scripts/notify-local.sh "[Deep Research] Checkpoint: top 3 ideas identified"
```
