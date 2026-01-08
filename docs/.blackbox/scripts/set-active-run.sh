#!/usr/bin/env bash
set -euo pipefail

# Set the active run (used by `bin/blackbox.mjs` issue scaffolding).
#
# Usage:
#   ./docs/.blackbox/scripts/set-active-run.sh "2026-01-05_feedback-batch-001"

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"
runs_root="$docs_root/.blackbox/.runs"

run_id="${1:-}"
if [[ -z "$run_id" ]]; then
  echo "ERROR: missing run id" >&2
  exit 2
fi

if [[ ! -d "$runs_root/$run_id" ]]; then
  echo "ERROR: run folder does not exist: $runs_root/$run_id" >&2
  exit 3
fi

echo "$run_id" >"$runs_root/ACTIVE_RUN"
echo "ACTIVE_RUN=$run_id"

