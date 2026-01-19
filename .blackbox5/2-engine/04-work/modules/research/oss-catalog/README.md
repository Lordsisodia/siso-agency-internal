# OSS Catalog

This folder contains a **cross-run** catalog of OSS candidates discovered by the OSS discovery cycle.

Important: this stores **metadata only** (repo links, tags, license buckets, scoring, timestamps). It does **not** clone repos or ingest source code.

## Files
- `catalog.json` — canonical merged catalog (deduped by `full_name`)
- `index.md` — human-scannable rollup (top tags/languages, top picks)
- `curation.json` — durable human intent (triage/deepen/poc/adopt/reject)
- `shortlist.md` — rendered curated shortlist (generated)
- `poc-backlog.md` — execution-ready POC backlog (generated)
- `risk.md` — risk/health report (generated)
- `gap-queries.md` — suggested queries based on catalog gaps (generated)
- `inventory.md` — inventory snapshot + curated highlights (generated)

## How it’s updated
Each run of:

```bash
./.blackbox/scripts/start-oss-discovery-cycle.sh
```

updates the catalog automatically after `artifacts/extracted.json` is generated.

Fast path (cycle → seed curation → render catalog):

```bash
./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "<name>" -- --min-stars 200
```

If you want to update it manually for a specific run:

```bash
python3 ./.blackbox/scripts/research/update_oss_catalog.py \
  --run-path .blackbox/agents/.plans/<run-folder> \
  --extracted-json .blackbox/agents/.plans/<run-folder>/artifacts/extracted.json \
  --out-catalog .blackbox/oss-catalog/catalog.json \
  --out-index .blackbox/oss-catalog/index.md
```

## Curation workflow
Add a repo to curation:

```bash
python3 ./.blackbox/scripts/research/oss_catalog_curate.py \
  --curation .blackbox/oss-catalog/curation.json \
  add owner/repo --status triage --priority 10 --owner "<name>" --notes "why it matters"
```

Bulk-seed curation from a run’s extracted output:

```bash
python3 ./.blackbox/scripts/research/seed_oss_curation_from_extracted.py \
  --extracted-json .blackbox/agents/.plans/<run>/artifacts/extracted.json \
  --curation .blackbox/oss-catalog/curation.json \
  --top 15 --status triage --owner "<name>" --note-prefix "Seeded: "
```

Render shortlist:

```bash
python3 ./.blackbox/scripts/research/render_oss_catalog_shortlist.py \
  --catalog .blackbox/oss-catalog/catalog.json \
  --curation .blackbox/oss-catalog/curation.json \
  --out .blackbox/oss-catalog/shortlist.md
```

Generate risk report:

```bash
python3 ./.blackbox/scripts/research/generate_oss_catalog_risk_report.py \
  --catalog .blackbox/oss-catalog/catalog.json \
  --out .blackbox/oss-catalog/risk.md
```

Generate catalog gap queries:

```bash
python3 ./.blackbox/scripts/research/generate_oss_catalog_gap_queries.py \
  --catalog-json .blackbox/oss-catalog/catalog.json \
  --out .blackbox/oss-catalog/gap-queries.md
```

Generate POC backlog:

```bash
python3 ./.blackbox/scripts/research/generate_oss_poc_backlog.py \
  --catalog .blackbox/oss-catalog/catalog.json \
  --curation .blackbox/oss-catalog/curation.json \
  --out .blackbox/oss-catalog/poc-backlog.md
```
