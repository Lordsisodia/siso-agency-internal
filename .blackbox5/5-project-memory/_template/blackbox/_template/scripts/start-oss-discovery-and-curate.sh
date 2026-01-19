#!/usr/bin/env bash
set -euo pipefail

# One-command OSS discovery workflow:
# 1) Run a fresh OSS discovery cycle (creates a run plan).
# 2) Optionally seed curation from that run's extracted candidates.
# 3) Render OSS catalog artifacts (shortlist/backlog/risk/gaps).
#
# This is designed to remove friction when running repeated cycles.
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/start-oss-discovery-and-curate.sh --owner "Alice"
# Or from within docs/:
#   ./.blackbox/4-scripts/start-oss-discovery-and-curate.sh --owner "Alice"

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

if [[ ! -d "$docs_root/.blackbox" ]]; then
  echo "ERROR: Could not locate docs/.blackbox from: $here" >&2
  exit 1
fi

usage() {
  cat <<'EOF' >&2
Usage:
  start-oss-discovery-and-curate.sh [options] [-- <cycle args...>]

Options:
  --no-seed                Do not seed curation from this run (default: seed)
  --top <n>                How many candidates to seed (default: 15)
  --status <status>        Seed status (default: triage)
  --owner <name>           Default owner to set on seeded items (optional)
  --note-prefix <text>     Prefix for notes of newly seeded items (optional)
  --update-existing        Update existing curated items too (default: false)
  --catalog-dir <dir>      Catalog directory (default: .blackbox/oss-catalog)

Notes:
  - Pass through discovery-cycle args after `--`, e.g.:
      start-oss-discovery-and-curate.sh --owner "Alice" -- --min-stars 200
  - Uses `GITHUB_TOKEN` if set to avoid rate limits.
EOF
}

do_seed=true
top=15
status="triage"
owner=""
note_prefix="Seeded: "
update_existing=false
catalog_dir_rel=".blackbox/oss-catalog"

cycle_args=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-seed)
      do_seed=false
      shift || true
      ;;
    --top)
      shift
      top="${1:-}"
      shift || true
      ;;
    --status)
      shift
      status="${1:-}"
      shift || true
      ;;
    --owner)
      shift
      owner="${1:-}"
      shift || true
      ;;
    --note-prefix)
      shift
      note_prefix="${1:-}"
      shift || true
      ;;
    --update-existing)
      update_existing=true
      shift || true
      ;;
    --catalog-dir)
      shift
      catalog_dir_rel="${1:-}"
      shift || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      cycle_args=("$@")
      break
      ;;
    *)
      echo "ERROR: Unknown arg: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if ! [[ "$top" =~ ^[0-9]+$ ]]; then
  echo "ERROR: --top must be an integer (got: $top)" >&2
  exit 2
fi

echo "Running OSS discovery cycle..."
echo "- token: $([[ -n "${GITHUB_TOKEN:-}" || -n "${GH_TOKEN:-}" ]] && echo \"present\" || echo \"missing\")"
echo "- cycle args: ${cycle_args[*]:-(none)}"

tmp_out="$(mktemp)"
trap 'rm -f "$tmp_out" 2>/dev/null || true' EXIT

set +e
"$docs_root/.blackbox/4-scripts/start-oss-discovery-cycle.sh" "${cycle_args[@]}" 2>&1 | tee "$tmp_out"
cycle_exit="${PIPESTATUS[0]}"
set -e

if [[ "$cycle_exit" -ne 0 ]]; then
  echo "ERROR: discovery cycle failed (exit=$cycle_exit)" >&2
  exit "$cycle_exit"
fi

plan_rel="$(sed -n 's/^- plan: //p' "$tmp_out" | tail -n 1 | tr -d '\r')"
if [[ -z "$plan_rel" ]]; then
  # Some paths print "plan: <abs>", fall back to that.
  plan_abs="$(sed -n 's/^[- ]*plan: //p' "$tmp_out" | tail -n 1 | tr -d '\r')"
  if [[ -n "$plan_abs" ]]; then
    plan_rel="$(python3 -c 'import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))' "$plan_abs" "$docs_root" 2>/dev/null || true)"
  fi
fi

if [[ -z "$plan_rel" ]]; then
  echo "WARN: Could not parse plan folder from cycle output; skipping seed step." >&2
  do_seed=false
else
  echo ""
  echo "Cycle completed:"
  echo "- plan: $plan_rel"
fi

curation_path="$docs_root/$catalog_dir_rel/curation.json"
if [[ "$do_seed" == "true" ]]; then
  echo ""
  echo "Seeding curation from run..."
  seed_args=(
    --plan "$plan_rel"
    --curation "$curation_path"
    --top "$top"
    --status "$status"
    --note-prefix "$note_prefix"
  )
  if [[ -n "${owner// /}" ]]; then
    seed_args+=(--owner "$owner")
  fi
  if [[ "$update_existing" == "true" ]]; then
    seed_args+=(--update-existing)
  fi
  python3 "$docs_root/.blackbox/4-scripts/research/seed_oss_curation_from_extracted.py" "${seed_args[@]}"
fi

echo ""
echo "Rendering OSS catalog artifacts..."
"$docs_root/.blackbox/4-scripts/render-oss-catalog.sh" --catalog-dir "$catalog_dir_rel"

echo ""
echo "Done."
echo "- shortlist: $catalog_dir_rel/shortlist.md"
echo "- poc backlog: $catalog_dir_rel/poc-backlog.md"
