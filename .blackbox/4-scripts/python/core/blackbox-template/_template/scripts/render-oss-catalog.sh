#!/usr/bin/env bash
set -euo pipefail

# Render all cross-run OSS catalog artifacts (idempotent):
# - shortlist.md
# - poc-backlog.md
# - risk.md
# - gap-queries.md
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/render-oss-catalog.sh
# Or from within docs/:
#   ./.blackbox/4-scripts/render-oss-catalog.sh

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

if [[ ! -d "$docs_root/.blackbox" ]]; then
  echo "ERROR: Could not locate docs/.blackbox from: $here" >&2
  exit 1
fi

usage() {
  cat <<'EOF' >&2
Usage:
  render-oss-catalog.sh [--catalog-dir <dir>]

Defaults:
  --catalog-dir .blackbox/oss-catalog
EOF
}

catalog_dir_rel=".blackbox/oss-catalog"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --catalog-dir)
      shift
      catalog_dir_rel="${1:-}"
      shift || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: Unknown arg: $1" >&2
      usage
      exit 2
      ;;
  esac
done

catalog_dir="$docs_root/$catalog_dir_rel"
catalog_json="$catalog_dir/catalog.json"
curation_json="$catalog_dir/curation.json"

if [[ ! -f "$catalog_json" ]]; then
  echo "ERROR: Missing catalog JSON: $catalog_dir_rel/catalog.json" >&2
  exit 1
fi
if [[ ! -f "$curation_json" ]]; then
  echo "ERROR: Missing curation JSON: $catalog_dir_rel/curation.json" >&2
  exit 1
fi

echo "Rendering OSS catalog artifacts..."
echo "- catalog: $catalog_dir_rel/catalog.json"
echo "- curation: $catalog_dir_rel/curation.json"

python3 "$docs_root/.blackbox/4-scripts/research/render_oss_catalog_shortlist.py" \
  --catalog "$catalog_json" \
  --curation "$curation_json" \
  --out "$catalog_dir/shortlist.md"

python3 "$docs_root/.blackbox/4-scripts/research/generate_oss_poc_backlog.py" \
  --catalog "$catalog_json" \
  --curation "$curation_json" \
  --out "$catalog_dir/poc-backlog.md"

python3 "$docs_root/.blackbox/4-scripts/research/generate_oss_catalog_risk_report.py" \
  --catalog "$catalog_json" \
  --out "$catalog_dir/risk.md"

python3 "$docs_root/.blackbox/4-scripts/research/generate_oss_catalog_gap_queries.py" \
  --catalog-json "$catalog_json" \
  --out "$catalog_dir/gap-queries.md"

echo "Done."
echo "- shortlist: $catalog_dir_rel/shortlist.md"
echo "- poc backlog: $catalog_dir_rel/poc-backlog.md"
echo "- risk: $catalog_dir_rel/risk.md"
echo "- gap queries: $catalog_dir_rel/gap-queries.md"
