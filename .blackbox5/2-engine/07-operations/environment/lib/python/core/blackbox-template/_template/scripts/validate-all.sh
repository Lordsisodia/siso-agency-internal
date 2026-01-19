#!/usr/bin/env bash
set -euo pipefail

# One-command validation for docs/.blackbox + docs structure.
#
# Defaults:
# - Runs check-blackbox.sh
# - Runs docs validators
#
# Optional:
# - --auto-sync will run sync-template.sh once if check-blackbox fails due to drift.
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/validate-all.sh
# Or from within docs/:
#   ./.blackbox/4-scripts/validate-all.sh

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

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
  "$docs_root/.blackbox/4-scripts/check-blackbox.sh"
}

fix_perms() {
  if [[ -x "$docs_root/.blackbox/4-scripts/fix-perms.sh" ]]; then
    "$docs_root/.blackbox/4-scripts/fix-perms.sh" >/dev/null 2>&1 || true
  fi
}

run_validators() {
  if command -v python3 >/dev/null 2>&1; then
    python3 "$docs_root/.blackbox/4-scripts/validate-docs.py"
    python3 "$docs_root/08-meta/maintenance/validate_docs.py"
  else
    echo "WARN: python3 not found; skipping docs validators." >&2
  fi
}

run_vendor_leaks() {
  if [[ "$check_vendor_leaks" != "true" ]]; then
    return 0
  fi
  local script="$docs_root/.blackbox/4-scripts/check-vendor-leaks.sh"
  if [[ ! -x "$script" ]]; then
    echo "WARN: vendor leak checker not executable or missing: $script" >&2
    return 0
  fi
  if [[ "$fail_vendor_leaks" == "true" ]]; then
    "$script" --fail
  else
    "$script"
  fi
}

if check; then
  run_validators
  run_vendor_leaks
  exit 0
fi

if [[ "$auto_sync" != "true" ]]; then
  echo "Validation failed. If this is template drift, run:" >&2
  echo "  ./.blackbox/4-scripts/sync-template.sh" >&2
  echo "If this is a permission issue, run:" >&2
  echo "  ./.blackbox/4-scripts/fix-perms.sh" >&2
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
  "$docs_root/.blackbox/4-scripts/sync-template.sh" "${sync_args[@]}"
else
  "$docs_root/.blackbox/4-scripts/sync-template.sh"
fi
fix_perms
check
run_validators
run_vendor_leaks
