#!/usr/bin/env bash
set -euo pipefail

# Create a new run from the feedback-run template and set it active.
#
# Usage:
#   ./docs/.blackbox/scripts/new-run.sh "feedback-batch-002" --owner shaun

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"
box_root="$docs_root/.blackbox"
runs_root="$box_root/.runs"

if [[ ! -d "$runs_root/_templates/feedback-run" ]]; then
  echo "ERROR: missing run template: $runs_root/_templates/feedback-run" >&2
  exit 1
fi

slug="${1:-}"
shift || true
if [[ -z "$slug" ]]; then
  echo "ERROR: missing run slug (e.g. feedback-batch-002)" >&2
  exit 2
fi

owner="unassigned"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --owner)
      shift
      owner="${1:-unassigned}"
      shift || true
      ;;
    -h|--help)
      echo "Usage: new-run.sh <slug> [--owner <name>]" >&2
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

date_str="$(date +%Y-%m-%d)"
run_id="${date_str}_${slug}"
run_dir="$runs_root/$run_id"

if [[ -e "$run_dir" ]]; then
  echo "ERROR: run already exists: $run_dir" >&2
  exit 3
fi

mkdir -p "$run_dir"
cp -R "$runs_root/_templates/feedback-run/"* "$run_dir/"

if [[ -f "$run_dir/run.yaml" ]]; then
  # Simple in-place substitutions (keep it portable; avoid yq dependency).
  sed -i '' "s/id: \"<run-id>\"/id: \"${run_id}\"/g" "$run_dir/run.yaml" 2>/dev/null || true
  sed -i '' "s/created_at: \"<YYYY-MM-DD>\"/created_at: \"${date_str}\"/g" "$run_dir/run.yaml" 2>/dev/null || true
  sed -i '' "s/owner: \"<owner>\"/owner: \"${owner}\"/g" "$run_dir/run.yaml" 2>/dev/null || true
fi

echo "$run_id" >"$runs_root/ACTIVE_RUN"

echo "$run_id"

