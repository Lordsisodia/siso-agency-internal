#!/usr/bin/env bash
set -euo pipefail

# Run multiple OSS discovery cycles over time, recording an umbrella run log.
#
# Example:
#   ./.blackbox/4-scripts/start-oss-discovery-batch.sh --runs 6 --interval-min 60 -- --min-stars 200
#
# Notes:
# - Each cycle creates its own plan folder under .blackbox/.plans/...
# - This batch runner creates a separate umbrella plan folder to log/track the batch.

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

usage() {
  cat <<'EOF' >&2
Usage:
  start-oss-discovery-batch.sh [--runs <n>] [--interval-min <n>] [--max-failures <n>] [--no-lock] [--] [cycle args...]

Examples:
  # Run 6 cycles, 1 per hour, passing args through to the cycle runner:
  ./.blackbox/4-scripts/start-oss-discovery-batch.sh --runs 6 --interval-min 60 -- --min-stars 200

  # Run a tight no-token batch (small calls):
  ./.blackbox/4-scripts/start-oss-discovery-batch.sh --runs 4 --interval-min 30 -- --max-total-queries 4 --max-repos 25 --no-gap-boost

Notes:
  - Use `--` to separate batch flags from cycle flags.
  - For best results, set `GITHUB_TOKEN` (avoids GitHub API 403 rate limits).
EOF
}

runs=6
interval_min=60
max_failures=2
use_lock=true

cycle_args=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --runs)
      shift
      runs="${1:-}"
      shift || true
      ;;
    --interval-min)
      shift
      interval_min="${1:-}"
      shift || true
      ;;
    --max-failures)
      shift
      max_failures="${1:-}"
      shift || true
      ;;
    --no-lock)
      use_lock=false
      shift || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      cycle_args+=("$@")
      break
      ;;
    *)
      # allow passing cycle args without explicit "--"
      cycle_args+=("$1")
      shift || true
      ;;
  esac
done

if ! [[ "$runs" =~ ^[0-9]+$ ]] || [[ "$runs" -lt 1 ]]; then
  echo "ERROR: --runs must be a positive integer (got: $runs)" >&2
  exit 2
fi
if ! [[ "$interval_min" =~ ^[0-9]+$ ]] || [[ "$interval_min" -lt 0 ]]; then
  echo "ERROR: --interval-min must be an integer >= 0 (got: $interval_min)" >&2
  exit 2
fi
if ! [[ "$max_failures" =~ ^[0-9]+$ ]] || [[ "$max_failures" -lt 0 ]]; then
  echo "ERROR: --max-failures must be an integer >= 0 (got: $max_failures)" >&2
  exit 2
fi

mkdir -p "$docs_root/.blackbox/.local"
lock_file="$docs_root/.blackbox/.local/oss-discovery-batch.lock"

if [[ "$use_lock" == "true" ]]; then
  if [[ -f "$lock_file" ]]; then
    echo "ERROR: lock file exists: $lock_file" >&2
    echo "If you're sure no batch is running, delete the lock or rerun with --no-lock." >&2
    exit 3
  fi
  {
    echo "pid=$$"
    echo "started_at_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "cwd=$PWD"
  } > "$lock_file"
  trap 'rm -f "$lock_file"' EXIT INT TERM
fi

batch_id="$(date +%H%M%S)"
created="$("$docs_root/.blackbox/4-scripts/new-run.sh" oss-discovery-batch "oss discovery batch ${batch_id}")"
batch_plan="$(echo "$created" | sed -n 's/^- plan: //p')"
if [[ -z "$batch_plan" ]]; then
  echo "ERROR: Failed to determine batch plan path from new-run output." >&2
  exit 1
fi
mkdir -p "$batch_plan/artifacts"

batch_log="$batch_plan/artifacts/batch.log"
batch_md="$batch_plan/artifacts/batch-runs.md"

{
  echo "# OSS Discovery Batch"
  echo ""
  echo "Plan: \`$batch_plan\`"
  echo ""
  echo "Started: \`$(date -u +%Y-%m-%dT%H:%M:%SZ)\`"
  echo "Runs: \`$runs\`"
  echo "Interval (min): \`$interval_min\`"
  echo "Max failures: \`$max_failures\`"
  echo "Cycle args: \`${cycle_args[*]:-<none>}\`"
  echo ""
  echo "## Runs"
  echo ""
} > "$batch_md"

echo "Batch created:"
echo "- plan: $batch_plan"
echo "- runs: $runs"
echo "- interval_min: $interval_min"
echo "- cycle_args: ${cycle_args[*]:-<none>}"
echo ""

failures=0
for ((i = 1; i <= runs; i++)); do
  echo "=== Batch run $i/$runs ($(date -u +%Y-%m-%dT%H:%M:%SZ)) ===" | tee -a "$batch_log"

  set +e
  run_out="$("$docs_root/.blackbox/4-scripts/start-oss-discovery-cycle.sh" "${cycle_args[@]}" 2>&1)"
  status=$?
  set -e

  echo "$run_out" | tee -a "$batch_log"
  plan_path="$(echo "$run_out" | sed -n 's/^- plan: //p' | tail -n 1)"
  if [[ -z "$plan_path" ]]; then
    plan_path="<unknown>"
  fi

  if [[ "$status" -eq 0 ]]; then
    echo "- ✅ Run $i: \`$plan_path\`" >> "$batch_md"
  else
    echo "- ❌ Run $i: \`$plan_path\` (exit=$status)" >> "$batch_md"
    failures=$((failures + 1))
    if [[ "$max_failures" -gt 0 && "$failures" -ge "$max_failures" ]]; then
      echo "Stopping batch after $failures failures (max_failures=$max_failures)." | tee -a "$batch_log"
      break
    fi
  fi

  if [[ "$i" -lt "$runs" && "$interval_min" -gt 0 ]]; then
    echo "Sleeping ${interval_min} minutes..." | tee -a "$batch_log"
    sleep "$((interval_min * 60))"
  fi
done

echo "" | tee -a "$batch_log"
echo "Batch complete." | tee -a "$batch_log"
echo "- plan: $batch_plan"
echo "- log: $batch_log"
echo "- runs: $batch_md"

