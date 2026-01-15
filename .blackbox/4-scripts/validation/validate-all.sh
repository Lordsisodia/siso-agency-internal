#!/usr/bin/env bash
set -euo pipefail

# .blackbox4 Validation Script
# Validates system structure, plans, and optional features
#
# Defaults:
# - Runs check-blackbox.sh
# - Validates all plans/runs
#
# Optional:
# - --auto-sync will run sync-template.sh once if check-blackbox fails due to drift.
#
# Run from .blackbox4 root:
#   ./4-scripts/validate-all.sh
# Or from within 4-scripts/:
#   ./validate-all.sh

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# Go up to .blackbox4 root (validation is 3 levels deep: 4-scripts/validation)
blackbox_root="$(cd "$here/../.." && pwd)"

auto_sync=false

usage() {
  cat <<'EOF' >&2
Usage:
  validate-all.sh [--auto-sync] [--sync-with-core] [--sync-with-agents] [--sync-prune] [--check-vendor-leaks] [--fail-vendor-leaks]

Flags:
  --auto-sync  If check-blackbox.sh fails, run sync-template.sh once and retry.
  --sync-with-core   When auto-syncing, pass --with-core to sync-template.sh.
  --sync-with-agents When auto-syncing, pass --with-agents to sync-template.sh.
  --sync-prune       When auto-syncing, pass --prune to sync-template.sh.
  --check-vendor-leaks  Run check-vendor-leaks.sh (report-only unless --fail-vendor-leaks is set).
  --fail-vendor-leaks   If vendor leaks are found, fail validation (implies --check-vendor-leaks).
EOF
}

sync_with_core=false
sync_with_agents=false
sync_prune=false
check_vendor_leaks=false
fail_vendor_leaks=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --auto-sync)
      auto_sync=true
      shift || true
      ;;
    --sync-with-core)
      sync_with_core=true
      shift || true
      ;;
    --sync-with-agents)
      sync_with_agents=true
      shift || true
      ;;
    --sync-prune)
      sync_prune=true
      shift || true
      ;;
    --check-vendor-leaks)
      check_vendor_leaks=true
      shift || true
      ;;
    --fail-vendor-leaks)
      check_vendor_leaks=true
      fail_vendor_leaks=true
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

check() {
  "$blackbox_root/4-scripts/validation/check-blackbox.sh"
}

fix_perms() {
  if [[ -x "$blackbox_root/4-scripts/fix-perms.sh" ]]; then
    "$blackbox_root/4-scripts/fix-perms.sh" >/dev/null 2>&1 || true
  fi
}

run_validators() {
  # Check for Python validators (optional)
  if [[ -f "$blackbox_root/4-scripts/python/validate-docs.py" ]]; then
    python3 "$blackbox_root/4-scripts/python/validate-docs.py" 2>/dev/null || true
  fi

  # Check for plan/run validation
  if [[ -d "$blackbox_root/.plans" ]]; then
    echo "Validating plans..."
    plan_count=$(find "$blackbox_root/.plans" -mindepth 1 -maxdepth 1 -type d ! -name "_template" | wc -l | tr -d ' ')
    echo "Found $plan_count plan(s)/run(s)"
  fi
}

run_vendor_leaks() {
  if [[ "$check_vendor_leaks" != "true" ]]; then
    return 0
  fi
  local script="$blackbox_root/4-scripts/check-ui-constraints.sh"
  if [[ ! -x "$script" ]]; then
    echo "WARN: UI constraint checker not executable or missing: $script" >&2
    return 0
  fi
  if [[ "$fail_vendor_leaks" == "true" ]]; then
    "$script" --fail
  else
    "$script"
  fi
}

run_ui_cycle_validation() {
  # Validate all UI cycle runs
  local runs_dir="$blackbox_root/.runs"
  if [[ ! -d "$runs_dir" ]]; then
    return 0
  fi

  local validator="$blackbox_root/4-scripts/validate-ui-cycle.py"
  if [[ ! -x "$validator" ]]; then
    return 0
  fi

  echo "Validating UI cycle runs..."
  local run_count=0
  local failed_runs=0

  for run_dir in "$runs_dir"/ui-cycle-*; do
    if [[ -d "$run_dir" ]]; then
      run_count=$((run_count + 1))
      echo "  Checking: $(basename "$run_dir")"
      if ! python3 "$validator" --run "$run_dir" 2>/dev/null; then
        failed_runs=$((failed_runs + 1))
      fi
    fi
  done

  if [[ $run_count -gt 0 ]]; then
    echo "UI cycle validation: $run_count run(s), $failed_runs failed"
  fi
}

if check; then
  run_validators
  run_vendor_leaks
  run_ui_cycle_validation
  exit 0
fi

if [[ "$auto_sync" != "true" ]]; then
  echo "Validation failed. If this is template drift, run:" >&2
  echo "  ./4-scripts/sync-template.sh" >&2
  echo "If this is a permission issue, run:" >&2
  echo "  ./4-scripts/fix-perms.sh" >&2
  exit 1
fi

echo "check-blackbox failed; attempting auto-sync..." >&2
fix_perms
if check; then
  run_validators
  exit 0
fi
sync_args=()
if [[ "$sync_with_core" == "true" ]]; then
  sync_args+=(--with-core)
fi
if [[ "$sync_with_agents" == "true" ]]; then
  sync_args+=(--with-agents)
fi
if [[ "$sync_prune" == "true" ]]; then
  sync_args+=(--prune)
fi

if [[ ${#sync_args[@]} -gt 0 ]]; then
  "$blackbox_root/4-scripts/sync-template.sh" "${sync_args[@]}"
else
  "$blackbox_root/4-scripts/sync-template.sh"
fi
fix_perms
check
run_validators
run_vendor_leaks
run_ui_cycle_validation
