# Runbook: OSS Discovery Cycle

## Why this exists
We want a repeatable way to keep an up-to-date pool of OSS repos that can accelerate our platform build (without cloning code or doing implementation work).

## Prereqs
- `python3` available locally
- Optional but recommended: GitHub token to increase API rate limits
  - `export GITHUB_TOKEN="..."`
  - or `export GH_TOKEN="..."`

## Run
From `docs/`:

```bash
./.blackbox/scripts/start-oss-discovery-cycle.sh
```

## Fast path (cycle → curate → backlog)
If you want the “agent loop” in one command (run the cycle, seed curation from that run, and render the catalog artifacts):

```bash
./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "<name>" -- --min-stars 200
```

## Dry run (inspect settings)
If you want to confirm what the runner will do (effective query counts, auto-tune reductions, state file path) without creating a plan folder or calling GitHub:

```bash
./.blackbox/scripts/start-oss-discovery-cycle.sh --print-settings
```

## Tuning (common knobs)

- Increase quality / reduce noise:
  - `--min-stars 200`
  - `--exclude-keywords "template,starter,boilerplate,example,demo"`
- Broaden search (only when you have a token):
  - increase `max_total_queries` + `max_repos` in `.blackbox/agents/oss-discovery/config.yaml`
- Increase long-run coverage:
  - leave rotation enabled (default) so each run scans a different slice of the query bank
  - to disable: `--no-rotate`
- Fill coverage gaps faster:
  - leave gap boost enabled (default) so each run runs a small second-pass search from `artifacts/gap-queries.md`
  - to disable: `--no-gap-boost`
  - if gap boost yields 0 results, it retries once with a relaxed `min_stars` (configurable via `gap_boost_min_stars_relaxed`)
  - optional: if still 0, retry once more with excludes disabled (`gap_boost_relax_excludes_on_empty`)

## Auto-tune (no-token protection)
If you run repeated cycles without a GitHub token, the repo metadata step often gets blocked (HTTP 403). Auto-tune reduces API calls on subsequent runs to keep the cycle usable:

- State is tracked in `.blackbox/.local/oss-discovery-state.json` (gitignored).
- Default behavior: after `consecutive_metadata_failures_no_token >= 2`, reduce `max_total_queries` and `max_repos` unless you explicitly override via CLI flags.
- Disable per-run: `--no-auto-tune`.

## Outputs
The script prints the created plan folder under `.blackbox/agents/.plans/...`.

Start here:
- `artifacts/github-search.md` (what we searched + top candidates)
- `artifacts/oss-triage.md` (sortable-ish table for scanning)
- `artifacts/oss-shortlist.md` (top N heuristic)
- `oss/entries/*.md` (where humans add “integration-ready” notes)
- `artifacts/coverage.md` (coverage by tag + license risk summary)
- `artifacts/gap-queries.md` (suggested queries to fill coverage gaps)

## Cross-run catalog (recommended)
Each cycle also updates a **cross-run** catalog (deduped by `owner/repo`) so you can browse accumulated candidates across weeks:

- `.blackbox/oss-catalog/catalog.json` (canonical merged list)
- `.blackbox/oss-catalog/index.md` (human rollup: tags/languages/top picks)
- `.blackbox/oss-catalog/risk.md` (risk/health rollup)
- `.blackbox/oss-catalog/gap-queries.md` (catalog-driven query suggestions)
- `.blackbox/oss-catalog/curation.json` + `.blackbox/oss-catalog/shortlist.md` (human curation)

### Curation quickstart
Add a repo to the curated shortlist:

```bash
python3 ./.blackbox/scripts/research/oss_catalog_curate.py \
  --curation .blackbox/oss-catalog/curation.json \
  add owner/repo --status triage --priority 10 --owner "<name>" --notes "why"
```

### Bulk-seed curation from a run
If you want to quickly get a shortlist started, seed the top N candidates from a specific run:

```bash
python3 ./.blackbox/scripts/research/seed_oss_curation_from_extracted.py \
  --extracted-json .blackbox/agents/.plans/<run>/artifacts/extracted.json \
  --curation .blackbox/oss-catalog/curation.json \
  --top 15 --status triage --owner "<name>" --note-prefix "Seeded: "
```

Or auto-pick the newest run:

```bash
python3 ./.blackbox/scripts/research/seed_oss_curation_from_extracted.py \
  --latest \
  --curation .blackbox/oss-catalog/curation.json \
  --top 15 --status triage --owner "<name>" --note-prefix "Seeded: "
```

### Turn curation into a POC backlog
Generate an execution-ready POC backlog from the catalog + curation:

```bash
python3 ./.blackbox/scripts/research/generate_oss_poc_backlog.py \
  --catalog .blackbox/oss-catalog/catalog.json \
  --curation .blackbox/oss-catalog/curation.json \
  --out .blackbox/oss-catalog/poc-backlog.md
```

Tip: use the triage rubric during review:
- `.blackbox/snippets/research/oss-triage-rubric.md`

### Prefer-new repos (reduce repeats)
By default, the cycle will try to **filter out repos already present in the cross-run catalog** when building the tranche list, so each run trends toward new discoveries:

- Disable: `--no-prefer-new`
- If filtering removes everything, it falls back to the original tranche list (disable fallback: `--prefer-new-no-fallback`)
- Curated keep-list: repos in `.blackbox/oss-catalog/curation.json` with status `adopt,poc,deepen` are kept even if already seen (configurable).

### Catalog gap boost (top-up under-filled runs)
If prefer-new filtering yields too few repos, the cycle can automatically run a small “top-up” search using catalog-driven gap queries, then merge + re-apply prefer-new:

- Disable: `--no-catalog-gap-boost`
- Tune:
  - `catalog_gap_boost_min_tranche_repos` (default 12)
  - `catalog_gap_boost_max_total_queries` (default 6)
  - `catalog_gap_boost_min_stars_relaxed` (default 25; used primarily without a token)
  - `catalog_gap_boost_max_tags_per_run` (default 3; caps how many gap tags get queried per run)
  - `catalog_gap_boost_avoid_recent_tags` (default true; avoids repeating tags across runs)

Notes:
- Tag rotation is tracked in `.blackbox/.local/oss-discovery-state.json` (`catalog_gap_rotation_count`).
- “Recent tags” are tracked in the same state file (`recent_gap_tags`) and bounded by `gap_tag_recent_window`.

### Coverage quota boost (ensure per-tag minimums)
After prefer-new (and optional catalog gap boost), the cycle can optionally ensure **minimum per-tag coverage** in the *current run* by:
1) exporting candidates from the merged Search API dump,
2) generating gap queries for any tags with count `< min_count_per_tag`,
3) selecting the first N under-covered tags (so it’s bounded),
4) running one small top-up search, then merging.

- Disable: `--no-coverage-quota-boost`
- Tune:
  - `coverage_quota_min_count_per_tag` (default 2)
  - `coverage_quota_max_total_queries` (default 6)
  - `coverage_quota_min_stars_relaxed` (default 25; used primarily without a token)
  - `coverage_quota_max_tags_per_run` (default 3)
  - `coverage_quota_rotate_tags` (default true; rotates which tags get boosted using `.blackbox/.local/oss-discovery-state.json`)
  - `coverage_quota_avoid_recent_tags` (default true; avoids repeating tags across runs)

Notes:
- Coverage quota excludes any tags already used by the catalog gap boost in the same run (so it doesn’t “double query” the same gap tags).
- Tag rotation is tracked in `.blackbox/.local/oss-discovery-state.json` (`quota_rotation_count`).

## Rate limit handling
GitHub rate limits can block either:
- the **search** step, or
- the **repo metadata fetch** step (common if you run multiple cycles without a token)

If you get blocked (HTTP 403), rerun with a token:

```bash
export GITHUB_TOKEN="<token>"
./.blackbox/scripts/start-oss-discovery-cycle.sh
```

## Batch mode (run as an “agent”)
If you want an unattended scan (e.g. a few cycles over a workday / overnight), use the batch runner. Each cycle uses query rotation, so it gradually covers the full query bank.

```bash
./.blackbox/scripts/start-oss-discovery-batch.sh --runs 6 --interval-min 60 -- --min-stars 200
```

Notes:
- Without a token, GitHub metadata fetch will likely 403; auto-tune helps, but token is strongly recommended for batches.
- The batch runner creates an umbrella plan folder with a log and links to each cycle’s plan folder.

## Cadence suggestion
- Weekly: run once for “market drift”
- On-demand: run immediately after major feature scope changes (new primitives, new vertical)
