#!/usr/bin/env bash
set -euo pipefail

# Convenience wrapper for the 1909 interchangeability/scalability plan.
#
# From docs/:
#   ./.blackbox/4-scripts/run-1909-loop.sh
#
# This intentionally only orchestrates existing scripts and prints the current signals.

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

plan_rel=".blackbox/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop"
no_refresh=false

usage() {
  cat <<'EOF' >&2
Usage:
  run-1909-loop.sh [--plan <plan-rel-path>] [--no-refresh]

Defaults:
  --plan .blackbox/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop

What it does:
  - Optionally refreshes all 1909 gates + dashboard
  - Prints current stop-point metrics and dashboard location
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --plan)
      shift
      plan_rel="${1:-}"
      shift || true
      ;;
    --no-refresh)
      no_refresh=true
      shift || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown arg: $1" >&2
      usage
      exit 2
      ;;
  esac
done

plan_abs="$docs_root/$plan_rel"
snap_abs="$plan_abs/artifacts/snapshots"
metrics="$snap_abs/stop-point-metrics.latest.txt"
dashboard="$plan_abs/stop-point-status-dashboard.md"

if [[ ! -d "$plan_abs" ]]; then
  echo "error: plan folder not found: $plan_abs" >&2
  exit 2
fi

if [[ "$no_refresh" != true ]]; then
  "$docs_root/.blackbox/4-scripts/refresh-1909-all-gates.sh"
  "$docs_root/.blackbox/4-scripts/refresh-1909-stop-point-dashboard.sh"
fi

echo ""
echo "1909 plan: $plan_rel"
echo "dashboard: $dashboard"
echo ""

if [[ -f "$metrics" ]]; then
  echo "stop-point metrics:"
  cat "$metrics"
else
  echo "warn: metrics missing: $metrics" >&2
fi

echo ""

if [[ -f "$dashboard" ]]; then
  recommended_line="$(grep -E '^- Next:' "$dashboard" | head -n 1 || true)"
  if [[ -n "${recommended_line:-}" ]]; then
    recommended_next="${recommended_line#- Next: }"
    if [[ "${recommended_next:0:2}" == "**" ]]; then
      recommended_next="${recommended_next:2}"
    fi
    if [[ "${recommended_next: -2}" == "**" ]]; then
      recommended_next="${recommended_next%??}"
    fi
    if [[ -n "${recommended_next:-}" ]]; then
      echo "recommended next PR (from dashboard): $recommended_next"
    fi
  fi
fi

echo ""
echo "metric meanings (quick):"
echo "- checkout_proxy_missing_snapshots: should be 0 (frontend can avoid vendor checkout URLs)"
echo "- vendor_leaks_disallowed_lines: should trend to 0 (no vendor IDs above adapters)"
echo "- adapter_imports_ui_client_violations: should be 0 (UI/client must not import adapters)"
echo "- vendor_sdk_imports_nonplatform_total: should stay small (identity UI + explicitly gated embedded flows only)"
echo "- backend_surface_api_only_endpoints: should trend to 0 (single canonical boundary under functions/api/**)"
echo "- contract_gaps_missing_auth/cache: should trend to 0 (contract cues enforced consistently)"
