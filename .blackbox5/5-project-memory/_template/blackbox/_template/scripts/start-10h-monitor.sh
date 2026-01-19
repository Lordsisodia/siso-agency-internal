#!/usr/bin/env bash
set -euo pipefail

# Start a long-run validation monitor (good for 10–20 hour runs).
#
# It runs:
# - validate-all (with auto-sync)
# - optional feature research health check
# on a configurable interval, and can notify locally/Telegram on failures.
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/start-10h-monitor.sh --feature-research-synth docs/.blackbox/.plans/<synth>
# Or from within docs/:
#   ./.blackbox/4-scripts/start-10h-monitor.sh --feature-research-synth .blackbox/.plans/<synth>

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

interval_min=20
notify_local=false
notify_telegram=false
notify_recovery=true
feature_research_synth=""
feature_research_write_status=false
feature_research_auto_compact=false
feature_research_compact_threshold=10
feature_research_refresh_dashboards=true
feature_research_refresh_every_runs=3
feature_research_audit_tranches=true
feature_research_audit_notify=false
feature_research_quality_gates=false
feature_research_max_draft_tranches=2

usage() {
  cat <<'EOF' >&2
Usage:
  start-10h-monitor.sh [--interval-min <n>] [--notify-local] [--notify-telegram] \
    --feature-research-synth <path> [--feature-research-write-status] \
    [--feature-research-auto-compact] [--feature-research-compact-threshold <n>] \
    [--no-refresh-dashboards] [--refresh-every-runs <n>] \
    [--no-audit-tranches] [--audit-notify] [--quality-gates] [--max-draft-tranches <n>]

Examples:
  # From docs/ (recommended for long runs)
  ./.blackbox/4-scripts/start-10h-monitor.sh \
    --feature-research-synth .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --notify-local

  # With Telegram notifications (requires env + notify-telegram.sh setup)
  ./.blackbox/4-scripts/start-10h-monitor.sh \
    --feature-research-synth .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --notify-telegram

  # With opt-in auto-compaction (recommended for 10–20h runs)
  ./.blackbox/4-scripts/start-10h-monitor.sh \
    --feature-research-synth .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --notify-local \
    --feature-research-auto-compact \
    --feature-research-compact-threshold 10

  # Disable periodic dashboard refresh
  ./.blackbox/4-scripts/start-10h-monitor.sh \
    --feature-research-synth .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --no-refresh-dashboards

  # Disable tranche audits (draft detector + min-delta validator)
  ./.blackbox/4-scripts/start-10h-monitor.sh \
    --feature-research-synth .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --no-audit-tranches

  # Notify when tranche audits warn
  ./.blackbox/4-scripts/start-10h-monitor.sh \
    --feature-research-synth .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --notify-local \
    --audit-notify

  # Enforce quality gates (treat tranche issues as failures)
  ./.blackbox/4-scripts/start-10h-monitor.sh \
    --feature-research-synth .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --notify-local \
    --audit-notify \
    --quality-gates \
    --max-draft-tranches 2
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval-min)
      shift
      interval_min="${1:-}"
      shift || true
      ;;
    --notify-local)
      notify_local=true
      shift || true
      ;;
    --notify-telegram)
      notify_telegram=true
      shift || true
      ;;
    --feature-research-synth)
      shift
      feature_research_synth="${1:-}"
      shift || true
      ;;
    --feature-research-write-status)
      feature_research_write_status=true
      shift || true
      ;;
    --feature-research-auto-compact)
      feature_research_auto_compact=true
      shift || true
      ;;
    --feature-research-compact-threshold)
      shift
      feature_research_compact_threshold="${1:-}"
      shift || true
      ;;
    --no-refresh-dashboards)
      feature_research_refresh_dashboards=false
      shift || true
      ;;
    --refresh-every-runs)
      shift
      feature_research_refresh_every_runs="${1:-}"
      shift || true
      ;;
    --no-audit-tranches)
      feature_research_audit_tranches=false
      shift || true
      ;;
    --audit-notify)
      feature_research_audit_notify=true
      shift || true
      ;;
    --quality-gates)
      feature_research_quality_gates=true
      shift || true
      ;;
    --max-draft-tranches)
      shift
      feature_research_max_draft_tranches="${1:-}"
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

if [[ -z "$feature_research_synth" ]]; then
  echo "ERROR: --feature-research-synth is required" >&2
  usage
  exit 2
fi

args=(--auto-sync --interval-min "$interval_min" --notify-recovery)
if [[ "$notify_local" == "true" ]]; then
  args+=(--notify-local)
fi
if [[ "$notify_telegram" == "true" ]]; then
  args+=(--notify-telegram)
fi
args+=(--feature-research-synth "$feature_research_synth")
if [[ "$feature_research_write_status" != "true" ]]; then
  args+=(--feature-research-no-write-status)
fi
if [[ "$feature_research_auto_compact" == "true" ]]; then
  args+=(--feature-research-auto-compact --feature-research-compact-threshold "$feature_research_compact_threshold")
fi
if [[ "$feature_research_refresh_dashboards" == "true" ]]; then
  args+=(--feature-research-refresh-dashboards --feature-research-refresh-every-runs "$feature_research_refresh_every_runs")
fi
if [[ "$feature_research_audit_tranches" == "true" ]]; then
  args+=(--feature-research-audit-tranches)
fi
if [[ "$feature_research_audit_notify" == "true" ]]; then
  args+=(--feature-research-audit-notify)
fi
if [[ "$feature_research_quality_gates" == "true" ]]; then
  args+=(--feature-research-quality-gates --feature-research-max-draft-tranches "$feature_research_max_draft_tranches")
fi

echo "🕒 Starting 10-hour monitor (validate loop)"
echo "- interval_min: $interval_min"
echo "- notify_local: $notify_local"
echo "- notify_telegram: $notify_telegram"
echo "- feature_research_synth: $feature_research_synth"
echo "- feature_research_write_status: $feature_research_write_status"
echo "- feature_research_auto_compact: $feature_research_auto_compact"
echo "- feature_research_compact_threshold: $feature_research_compact_threshold"
echo "- refresh_dashboards: $feature_research_refresh_dashboards"
echo "- refresh_every_runs: $feature_research_refresh_every_runs"
echo "- audit_tranches: $feature_research_audit_tranches"
echo "- audit_notify: $feature_research_audit_notify"
echo "- quality_gates: $feature_research_quality_gates"
echo "- max_draft_tranches: $feature_research_max_draft_tranches"
echo ""
echo "Stop with Ctrl+C."
echo ""

"$docs_root/.blackbox/4-scripts/validate-loop.sh" "${args[@]}"
