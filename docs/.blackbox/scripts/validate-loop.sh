#!/usr/bin/env bash
set -euo pipefail

# Periodically run `docs/.blackbox/scripts/validate-all.sh`.
#
# Run from repo root:
#   ./docs/.blackbox/scripts/validate-loop.sh --interval-min 15
#
# Stop with Ctrl+C.

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"
repo_root="$(cd "$docs_root/.." && pwd)"

interval_min=15
notify_local=false
log_file="$docs_root/.blackbox/.local/validate-loop.log"
max_runs=0
max_failures=0
once=false

usage() {
  cat <<'EOF' >&2
Usage:
  validate-loop.sh [--interval-min <n>] [--max-runs <n>] [--max-failures <n>] [--once] [--notify-local] [--log <path>]

Defaults:
  --interval-min 15

Flags:
  --notify-local  Send a local notification on failure (requires notify-local.sh)
  --log           Log output file (default: docs/.blackbox/.local/validate-loop.log)
  --max-runs      Stop after N iterations (0 = run forever; default: 0)
  --once          Run exactly once (no sleep)
  --max-failures  Stop after N failures (0 = never stop; default: 0)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval-min)
      shift
      interval_min="${1:-}"
      shift || true
      ;;
    --max-runs)
      shift
      max_runs="${1:-}"
      shift || true
      ;;
    --max-failures)
      shift
      max_failures="${1:-}"
      shift || true
      ;;
    --notify-local)
      notify_local=true
      shift || true
      ;;
    --log)
      shift
      log_file="${1:-}"
      shift || true
      ;;
    --once)
      once=true
      shift || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 2
      ;;
  esac
done

mkdir -p "$(dirname "$log_file")"

notify_fail() {
  local message="$1"
  if [[ "$notify_local" == "true" && -x "$docs_root/.blackbox/scripts/notify-local.sh" ]]; then
    "$docs_root/.blackbox/scripts/notify-local.sh" "Blackbox validation failed" "$message" >/dev/null 2>&1 || true
  fi
}

run_once() {
  local ts
  ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  if "$docs_root/.blackbox/scripts/validate-all.sh" >>"$log_file" 2>&1; then
    echo "[$ts] OK" | tee -a "$log_file" >/dev/null
    return 0
  fi

  echo "[$ts] FAIL" | tee -a "$log_file" >/dev/null
  notify_fail "See log: $log_file"
  return 1
}

failures=0
run_idx=0
while true; do
  run_idx=$((run_idx + 1))

  if ! run_once; then
    failures=$((failures + 1))
    if [[ "$max_failures" -gt 0 && "$failures" -ge "$max_failures" ]]; then
      echo "Stopping: max failures reached ($failures)" | tee -a "$log_file" >/dev/null
      exit 1
    fi
  fi

  if [[ "$once" == "true" ]]; then
    exit 0
  fi
  if [[ "$max_runs" -gt 0 && "$run_idx" -ge "$max_runs" ]]; then
    exit 0
  fi

  sleep "$((interval_min * 60))"
done

