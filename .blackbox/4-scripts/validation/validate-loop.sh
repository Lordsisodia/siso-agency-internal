#!/usr/bin/env bash
set -euo pipefail

# .blackbox4 Validation Loop
# Continuously monitors your .blackbox4 workspace
#
# A "validate loop" is a background monitoring daemon that:
# - Runs validation tests periodically
# - Logs results with timestamps
# - Sends notifications on failures
# - Can auto-fix template drift
# - Monitors feature research health
# - Tracks tranche quality
#
# Run from .blackbox4 root:
#   ./4-scripts/validate-loop.sh --interval-min 15
#
# Stop with Ctrl+C

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

# Get .blackbox4 root
blackbox_root="$(cd "$SCRIPT_DIR/.." && pwd)"

interval_min=15
auto_sync=false
notify_local=false
notify_telegram=false
log_file="$blackbox_root/.local/validate-loop.log"
status_file="$blackbox_root/.local/validate-status.json"
status_md=""
max_runs=0
max_failures=0
sync_with_core=false
sync_with_agents=false
sync_prune=false
check_vendor_leaks=false
fail_vendor_leaks=false
once=false
notify_recovery=false
feature_research_synth_plan=""
feature_research_write_status=true
feature_research_auto_compact=false
feature_research_compact_threshold=10
feature_research_refresh_dashboards=false
feature_research_refresh_every_runs=3
feature_research_audit_tranches=false
feature_research_audit_notify=false
feature_research_quality_gates=false
feature_research_max_draft_tranches=2

write_feature_research_telemetry() {
  local synth_plan="$1"
  local ok="$2"
  local feature_ok="$3"
  local ts_utc="$4"
  local run_idx="$5"

  if ! command -v python3 >/dev/null 2>&1; then
    return 0
  fi

  local synth_abs="$blackbox_root/$synth_plan"
  local artifacts_dir="$synth_abs/artifacts"
  mkdir -p "$artifacts_dir"

  local tmp
  tmp="$(mktemp "$blackbox_root/.local/telemetry.XXXXXX" 2>/dev/null || echo "")"
  if [[ -z "$tmp" ]]; then
    return 0
  fi

  python3 "$blackbox_root/4-scripts/research/collect_feature_research_metrics.py" \
    --synth-plan "$synth_plan" \
    --ts-utc "$ts_utc" \
    --run-index "$run_idx" \
    --validate-ok "$ok" \
    --feature-ok "$feature_ok" >"$tmp" 2>/dev/null || {
      rm -f "$tmp" || true
      return 0
    }

  cat "$tmp" >>"$artifacts_dir/telemetry.jsonl" 2>/dev/null || true
  echo "" >>"$artifacts_dir/telemetry.jsonl" 2>/dev/null || true
  cp "$tmp" "$artifacts_dir/telemetry-latest.json" 2>/dev/null || true

  python3 "$blackbox_root/4-scripts/research/update_achievement_log.py" \
    --synth-plan "$synth_plan" \
    --write >/dev/null 2>&1 || true

  # Markdown mirrors (so ops visibility lives in .md, not just JSON).
  python3 "$blackbox_root/4-scripts/research/update_telemetry_md.py" \
    --synth-plan "$synth_plan" \
    --write >/dev/null 2>&1 || true

  # Gap-driven intelligence loop artifacts (MD-first).
  python3 "$blackbox_root/4-scripts/research/audit_intelligence_gaps.py" \
    --synth-plan "$synth_plan" \
    --write >/dev/null 2>&1 || true

  rm -f "$tmp" || true
}

usage() {
  cat <<'EOF'
.blackbox4 Validation Loop - Continuous Monitoring Daemon

USAGE:
  ./4-scripts/validate-loop.sh [--interval-min <n>] [--max-runs <n>]

DESCRIPTION:
  A validation loop is a background daemon that continuously monitors
  your .blackbox4 workspace for issues. It runs validation tests
  periodically and can automatically fix template drift.

  Think of it as a "health monitor" that runs while you work.

WHAT IT DOES:
  • Runs validate-all.sh every N minutes
  • Logs results with timestamps
  • Sends notifications on failures
  • Can auto-fix template drift with --auto-sync
  • Monitors feature research health
  • Tracks tranche quality and drafts
  • Updates dashboards periodically

COMMON USE CASES:

  1. Basic Monitoring (Every 15 minutes)
     ./4-scripts/validate-loop.sh

  2. Auto-Fix Template Drift
     ./4-scripts/validate-loop.sh --auto-sync

  3. One-Time Validation Check
     ./4-scripts/validate-loop.sh --once

  4. Limited Duration (10 runs, then stop)
     ./4-scripts/validate-loop.sh --max-runs 10

  5. Feature Research Monitoring
     ./4-scripts/validate-loop.sh --feature-research-synth docs/07-synthesis/my-research

KEY PARAMETERS:
  --interval-min <n>     Minutes between checks (default: 15)
  --max-runs <n>         Stop after N iterations (default: 0 = forever)
  --max-failures <n>     Stop after N failures (default: 0 = never stop)
  --once                 Run exactly once, then exit
  --auto-sync            Auto-fix template drift when detected

MONITORING FEATURES:
  --notify-local         Send desktop notifications on failure
  --notify-telegram      Send Telegram alerts (requires setup)
  --notify-recovery      Notify when validation recovers
  --log <path>           Custom log file location

FEATURE RESEARCH FLAGS (Advanced):
  --feature-research-synth <path>     Monitor specific synthesis plan
  --feature-research-refresh-dashboards  Periodically update dashboards
  --feature-research-audit-tranches   Check tranche quality
  --feature-research-quality-gates    Fail on tranche issues

EXAMPLES:

  # Monitor while working on a feature
  ./4-scripts/validate-loop.sh --interval-min 10 --auto-sync

  # Quick validation check
  ./4-scripts/validate-loop.sh --once

  # Monitor with failure limit
  ./4-scripts/validate-loop.sh --max-failures 3

  # Monitor feature research with dashboard refreshes
  ./4-scripts/validate-loop.sh \
    --feature-research-synth docs/07-synthesis/my-research \
    --feature-research-refresh-dashboards \
    --interval-min 20

WHEN TO USE:
  ✓ During long development sessions
  ✓ When working with multiple agents
  ✓ During feature research projects
  ✓ When template drift is a recurring issue
  ✓ For continuous integration monitoring

OUTPUT:
  - Log file: .local/validate-loop.log
  - Status JSON: .local/validate-status.json
  - Optional: Markdown status file

STOPPING:
  Press Ctrl+C to stop the loop gracefully

For advanced flags and feature research monitoring, see:
  ./4-scripts/validate-loop.sh --help-advanced
EOF
}

usage_advanced() {
  cat <<'EOF' >&2
Advanced Usage for validate-loop.sh

SYNC OPTIONS:
  --sync-with-core       Pass --sync-with-core to validate-all.sh
  --sync-with-agents     Pass --sync-with-agents to validate-all.sh
  --sync-prune           Pass --prune to validate-all.sh

VENDOR LEAK CHECKING:
  --check-vendor-leaks   Pass --check-vendor-leaks to validate-all.sh (report-only)
  --fail-vendor-leaks    Pass --fail-vendor-leaks to validate-all.sh (fail if leaks found)

FEATURE RESEARCH HEALTH:
  --feature-research-synth <path>           Monitor specific synthesis plan
  --feature-research-no-write-status        Skip writing run-status.md during health checks
  --feature-research-auto-compact           Auto-compact plans at threshold
  --feature-research-compact-threshold <n>  Auto-compact threshold (default: 10)

DASHBOARD REFRESHES:
  --feature-research-refresh-dashboards        Periodically refresh dashboards
  --feature-research-refresh-every-runs <n>     Refresh cadence (default: 3)

TRANCHE AUDITING:
  --feature-research-audit-tranches            Run tranche audits (non-fatal)
  --feature-research-audit-notify              Notify on audit warnings
  --feature-research-quality-gates             Treat audit issues as failures
  --feature-research-max-draft-tranches <n>    Max draft tranches before gating (default: 2)

STATUS OUTPUT:
  --status-file <path>   Write status JSON to custom location
  --status-md <path>     Write status markdown to custom location
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval-min)
      shift
      interval_min="${1:-}"
      shift || true
      ;;
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
    --feature-research-synth)
      shift
      feature_research_synth_plan="${1:-}"
      shift || true
      ;;
    --feature-research-no-write-status)
      feature_research_write_status=false
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
    --feature-research-refresh-dashboards)
      feature_research_refresh_dashboards=true
      shift || true
      ;;
    --feature-research-refresh-every-runs)
      shift
      feature_research_refresh_every_runs="${1:-}"
      shift || true
      ;;
    --feature-research-audit-tranches)
      feature_research_audit_tranches=true
      shift || true
      ;;
    --feature-research-audit-notify)
      feature_research_audit_notify=true
      shift || true
      ;;
    --feature-research-quality-gates)
      feature_research_quality_gates=true
      shift || true
      ;;
    --feature-research-max-draft-tranches)
      shift
      feature_research_max_draft_tranches="${1:-}"
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
    --notify-recovery)
      notify_recovery=true
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
    --status-file)
      shift
      status_file="${1:-}"
      shift || true
      ;;
    --status-md)
      shift
      status_md="${1:-}"
      shift || true
      ;;
    --once)
      once=true
      shift || true
      ;;
    --log)
      shift
      log_file="${1:-}"
      shift || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --help-advanced)
      usage_advanced
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      echo ""
      echo "Run './4-scripts/validate-loop.sh --help' for usage" >&2
      exit 2
      ;;
  esac
done

if ! [[ "$interval_min" =~ ^[0-9]+$ ]] || [[ "$interval_min" -lt 1 ]]; then
  echo "ERROR: --interval-min must be a positive integer (got: $interval_min)" >&2
  exit 2
fi

if ! [[ "$max_runs" =~ ^[0-9]+$ ]] || [[ "$max_runs" -lt 0 ]]; then
  echo "ERROR: --max-runs must be an integer >= 0 (got: $max_runs)" >&2
  exit 2
fi

if ! [[ "$max_failures" =~ ^[0-9]+$ ]] || [[ "$max_failures" -lt 0 ]]; then
  echo "ERROR: --max-failures must be an integer >= 0 (got: $max_failures)" >&2
  exit 2
fi

mkdir -p "$(dirname "$log_file")"
mkdir -p "$(dirname "$status_file")"
if [[ -n "$status_md" ]]; then
  mkdir -p "$(dirname "$status_md")"
fi

args=()
if [[ "$auto_sync" == "true" ]]; then
  args+=(--auto-sync)
fi
if [[ "$sync_with_core" == "true" ]]; then
  args+=(--sync-with-core)
fi
if [[ "$sync_with_agents" == "true" ]]; then
  args+=(--sync-with-agents)
fi
if [[ "$sync_prune" == "true" ]]; then
  args+=(--sync-prune)
fi
if [[ "$check_vendor_leaks" == "true" ]]; then
  args+=(--check-vendor-leaks)
fi
if [[ "$fail_vendor_leaks" == "true" ]]; then
  args+=(--fail-vendor-leaks)
fi

echo "Validate loop starting:"
echo "- interval_min: $interval_min"
echo "- max_runs: $max_runs"
echo "- max_failures: $max_failures"
echo "- once: $once"
echo "- auto_sync: $auto_sync"
echo "- check_vendor_leaks: $check_vendor_leaks"
echo "- fail_vendor_leaks: $fail_vendor_leaks"
echo "- notify_local: $notify_local"
echo "- notify_telegram: $notify_telegram"
echo "- notify_recovery: $notify_recovery"
echo "- log: $log_file"
echo "- status_file: $status_file"
if [[ -n "$status_md" ]]; then
  echo "- status_md: $status_md"
fi
if [[ -n "$feature_research_synth_plan" ]]; then
  echo "- feature_research_synth_plan: $feature_research_synth_plan"
  echo "- feature_research_write_status: $feature_research_write_status"
  echo "- feature_research_auto_compact: $feature_research_auto_compact"
  echo "- feature_research_compact_threshold: $feature_research_compact_threshold"
  echo "- feature_research_refresh_dashboards: $feature_research_refresh_dashboards"
  echo "- feature_research_refresh_every_runs: $feature_research_refresh_every_runs"
  echo "- feature_research_audit_tranches: $feature_research_audit_tranches"
  echo "- feature_research_audit_notify: $feature_research_audit_notify"
  echo "- feature_research_quality_gates: $feature_research_quality_gates"
  echo "- feature_research_max_draft_tranches: $feature_research_max_draft_tranches"
fi
echo ""

run_idx=0
failures=0
prev_ok="unknown"
while true; do
  run_idx=$((run_idx + 1))
  ts="$(date "+%Y-%m-%d %H:%M:%S")"
  ts_utc="$(date -u "+%Y-%m-%dT%H:%M:%SZ")"
  tmp="$(mktemp "$blackbox_root/.local/validate-loop.XXXXXX")"
  code=0
  ok="false"
  if "$blackbox_root/4-scripts/validate-all.sh" "${args[@]}" >"$tmp" 2>&1; then
    ok="true"
  else
    code="$?"
    ok="false"
    failures=$((failures + 1))
  fi

  {
    echo "=== ${ts} ==="
    cat "$tmp"
    if [[ "$ok" == "true" ]]; then
      echo "OK"
    else
      echo "FAIL (exit=$code)"
    fi
    echo "SUMMARY: ts_utc=${ts_utc} ok=${ok} failures=${failures} run=${run_idx}"
    echo ""
  } | tee -a "$log_file"
  rm -f "$tmp" || true

  # Optional: feature research health check (after validate-all)
  feature_ok="unknown"
  if [[ -n "$feature_research_synth_plan" ]]; then
    fr_args=(--synth-plan "$feature_research_synth_plan")
    if [[ "$feature_research_write_status" == "false" ]]; then
      fr_args+=(--no-write-status)
    fi
    if [[ "$feature_research_auto_compact" == "true" ]]; then
      fr_args+=(--auto-compact --compact-threshold "$feature_research_compact_threshold")
    fi
    if "$blackbox_root/4-scripts/feature-research-health.sh" "${fr_args[@]}" >>"$log_file" 2>&1; then
      feature_ok="true"
    else
      feature_ok="false"
      failures=$((failures + 1))
    fi
  fi

  if [[ "$feature_ok" == "false" ]]; then
    if [[ "$notify_local" == "true" && -x "$blackbox_root/4-scripts/notify-local.sh" ]]; then
      "$blackbox_root/4-scripts/notify-local.sh" "[.blackbox4] feature research health failed (synth=${feature_research_synth_plan})"
    fi
    if [[ "$notify_telegram" == "true" && -x "$blackbox_root/4-scripts/notify-telegram.sh" ]]; then
      "$blackbox_root/4-scripts/notify-telegram.sh" "[.blackbox4] feature research health failed (synth=${feature_research_synth_plan}) log=${log_file}"
    fi
  fi

  # Optional: periodically refresh dashboards (best-effort; does not change OK/FAIL)
  if [[ -n "$feature_research_synth_plan" && "$feature_research_refresh_dashboards" == "true" ]]; then
    if [[ "$feature_research_refresh_every_runs" =~ ^[0-9]+$ && "$feature_research_refresh_every_runs" -ge 1 ]]; then
      if (( run_idx % feature_research_refresh_every_runs == 0 )); then
        if command -v python3 >/dev/null 2>&1; then
          {
            echo "DASHBOARD_REFRESH: synth=${feature_research_synth_plan} run=${run_idx}"
            python3 "$blackbox_root/4-scripts/research/run_status.py" --synth-plan "$feature_research_synth_plan" --write || true
            python3 "$blackbox_root/4-scripts/research/update_progress_dashboard.py" --synth-plan "$feature_research_synth_plan" --write || true
            python3 "$blackbox_root/4-scripts/research/update_tranche_index.py" --synth-plan "$feature_research_synth_plan" --write || true
            python3 "$blackbox_root/4-scripts/research/update_tranche_ledger.py" --synth-plan "$feature_research_synth_plan" --write || true
            echo "DASHBOARD_REFRESH: done"
          } >>"$log_file" 2>&1
        fi
      fi
    fi
  fi

  # Optional: tranche audits (non-fatal; warnings only)
  if [[ -n "$feature_research_synth_plan" && "$feature_research_audit_tranches" == "true" ]]; then
    if command -v python3 >/dev/null 2>&1; then
      tranche_audit_code=0
      tranche_min_delta_code=0
      drafts_count=0
      tranche_drafts_out=""
      tranche_min_delta_out=""

      tranche_drafts_out="$(mktemp "$blackbox_root/.local/tranche-drafts.XXXXXX" 2>/dev/null || echo "")"
      tranche_min_delta_out="$(mktemp "$blackbox_root/.local/tranche-min-delta.XXXXXX" 2>/dev/null || echo "")"

      if [[ -n "$tranche_drafts_out" ]]; then
        python3 "$blackbox_root/4-scripts/research/audit_tranche_drafts.py" --synth-plan "$feature_research_synth_plan" >"$tranche_drafts_out" 2>&1 || tranche_audit_code="$?"
      else
        python3 "$blackbox_root/4-scripts/research/audit_tranche_drafts.py" --synth-plan "$feature_research_synth_plan" >/dev/null 2>&1 || tranche_audit_code="$?"
      fi

      if [[ -n "$tranche_min_delta_out" ]]; then
        python3 "$blackbox_root/4-scripts/research/validate_tranche_min_delta.py" --synth-plan "$feature_research_synth_plan" --last-n 5 >"$tranche_min_delta_out" 2>&1 || tranche_min_delta_code="$?"
      else
        python3 "$blackbox_root/4-scripts/research/validate_tranche_min_delta.py" --synth-plan "$feature_research_synth_plan" --last-n 5 >/dev/null 2>&1 || tranche_min_delta_code="$?"
      fi

      {
        echo "TRANCHE_AUDIT: synth=${feature_research_synth_plan} run=${run_idx}"
        if [[ -n "$tranche_drafts_out" ]]; then
          cat "$tranche_drafts_out"
        fi
        if [[ -n "$tranche_min_delta_out" ]]; then
          cat "$tranche_min_delta_out"
        fi
        echo "TRANCHE_AUDIT: done"
      } >>"$log_file" 2>&1

      # Parse draft count (used for optional quality gates + status artifacts)
      if [[ -n "$tranche_drafts_out" && -f "$tranche_drafts_out" ]]; then
        # Expected formats:
        # - "OK: ...", or
        # - "WARN: X/Y tranche files look like drafts ..."
        drafts_count="$(python3 -c 'import re,sys; t=sys.stdin.read(); m=re.search(r"^WARN: (\d+)/", t, re.M); print(m.group(1) if m else "0")' <"$tranche_drafts_out" 2>/dev/null || echo "0")"
        if ! [[ "${drafts_count}" =~ ^[0-9]+$ ]]; then drafts_count=0; fi
      fi

      tranche_warn=false
      if [[ "$tranche_audit_code" != "0" || "$tranche_min_delta_code" != "0" ]]; then
        tranche_warn=true
      fi

      # Optional: quality gates (treat tranche issues as failures)
      if [[ "$feature_research_quality_gates" == "true" ]]; then
        # Gate on min-delta failures (non-zero)
        if [[ "$tranche_min_delta_code" != "0" ]]; then
          failures=$((failures + 1))
        fi
        # Gate on draft count threshold if the draft audit output contains "WARN: X/Y"
        if [[ "$feature_research_max_draft_tranches" =~ ^[0-9]+$ ]]; then
          if [[ "$drafts_count" -gt "$feature_research_max_draft_tranches" ]]; then
            failures=$((failures + 1))
          fi
        fi
      fi

      # Write a visible tranche audit status artifact (best-effort).
      # This makes tranche drift observable even when validate-all passes.
      audit_status_md="$blackbox_root/$feature_research_synth_plan/artifacts/tranche-audit-status.md"
      {
        echo "---"
        echo "status: active"
        echo "updated_at_utc: ${ts_utc}"
        echo "synth_plan: ${feature_research_synth_plan}"
        echo "run_index: ${run_idx}"
        echo "draft_audit_exit_code: ${tranche_audit_code}"
        echo "min_delta_exit_code: ${tranche_min_delta_code}"
        echo "draft_like_tranches_count: ${drafts_count}"
        echo "---"
        echo ""
        echo "# 🧾 Tranche Audit Status"
        echo ""
        echo "This file is updated by \`4-scripts/validate-loop.sh\` when tranche audits are enabled."
        echo ""
        echo "## Summary"
        echo ""
        echo "- Updated (UTC): \`${ts_utc}\`"
        echo "- Run index: \`${run_idx}\`"
        echo "- Draft-like tranche files: \`${drafts_count}\`"
        echo "- Min-delta check exit: \`${tranche_min_delta_code}\` (0 = OK)"
        echo ""
        echo "## Draft audit output"
        echo ""
        echo '```'
        if [[ -n "$tranche_drafts_out" && -f "$tranche_drafts_out" ]]; then
          tail -n 200 "$tranche_drafts_out" || true
        else
          echo "(no output captured)"
        fi
        echo '```'
        echo ""
        echo "## Min-delta output (last 5)"
        echo ""
        echo '```'
        if [[ -n "$tranche_min_delta_out" && -f "$tranche_min_delta_out" ]]; then
          tail -n 200 "$tranche_min_delta_out" || true
        else
          echo "(no output captured)"
        fi
        echo '```'
      } >"$audit_status_md" 2>/dev/null || true

      # Optional: notifications on tranche audit warnings
      if [[ "$feature_research_audit_notify" == "true" && "$tranche_warn" == "true" ]]; then
        if [[ "$notify_local" == "true" && -x "$blackbox_root/4-scripts/notify-local.sh" ]]; then
          "$blackbox_root/4-scripts/notify-local.sh" "[.blackbox4] tranche audit warnings (synth=${feature_research_synth_plan})"
        fi
        if [[ "$notify_telegram" == "true" && -x "$blackbox_root/4-scripts/notify-telegram.sh" ]]; then
          "$blackbox_root/4-scripts/notify-telegram.sh" "[.blackbox4] tranche audit warnings (synth=${feature_research_synth_plan}) log=${log_file}"
        fi
      fi

      # Clean up temp files (after gates/status/notify)
      if [[ -n "$tranche_drafts_out" ]]; then rm -f "$tranche_drafts_out" || true; fi
      if [[ -n "$tranche_min_delta_out" ]]; then rm -f "$tranche_min_delta_out" || true; fi
    fi
  fi

  if [[ "$ok" == "false" ]]; then
    if [[ "$notify_local" == "true" && -x "$blackbox_root/4-scripts/notify-local.sh" ]]; then
      "$blackbox_root/4-scripts/notify-local.sh" "[.blackbox4] validate failed (exit=${code})"
    fi
    if [[ "$notify_telegram" == "true" && -x "$blackbox_root/4-scripts/notify-telegram.sh" ]]; then
      "$blackbox_root/4-scripts/notify-telegram.sh" "[.blackbox4] validate failed (exit=${code}) log=${log_file}"
    fi
  fi

  if [[ "$notify_recovery" == "true" && "$prev_ok" == "false" && "$ok" == "true" ]]; then
    if [[ "$notify_local" == "true" && -x "$blackbox_root/4-scripts/notify-local.sh" ]]; then
      "$blackbox_root/4-scripts/notify-local.sh" "[.blackbox4] validate recovered (OK)"
    fi
    if [[ "$notify_telegram" == "true" && -x "$blackbox_root/4-scripts/notify-telegram.sh" ]]; then
      "$blackbox_root/4-scripts/notify-telegram.sh" "[.blackbox4] validate recovered (OK)"
    fi
  fi

  prev_ok="$ok"

  # Write status JSON (best-effort).
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<PY 2>/dev/null || true
import json, os, sys
ok_str = "${ok}"
feature_ok_str = "${feature_ok}"
status = {
  "updated_at_utc": "${ts_utc}",
  "ok": (ok_str == "true"),
  "feature_research_ok": (feature_ok_str == "true") if feature_ok_str in ("true","false") else None,
  "run_index": ${run_idx},
  "failures": ${failures},
  "max_failures": ${max_failures},
  "log_file": "${log_file}",
}
with open("${status_file}", "w", encoding="utf-8") as f:
  json.dump(status, f, indent=2)
PY
  fi

  if [[ -n "$status_md" ]]; then
    cat >"$status_md" <<EOF
# Validate Status

- Updated (UTC): \`${ts_utc}\`
- OK: \`${ok}\`
- Run index: \`${run_idx}\`
- Failures: \`${failures}\` (max: \`${max_failures}\`)
- Log: \`${log_file}\`
EOF
  fi

  # Feature research telemetry + achievement log (best-effort).
  if [[ -n "$feature_research_synth_plan" ]]; then
    write_feature_research_telemetry "$feature_research_synth_plan" "$ok" "$feature_ok" "$ts_utc" "$run_idx" || true
  fi

  if [[ "$once" == "true" ]]; then
    exit 0
  fi

  if [[ "$max_failures" -gt 0 && "$failures" -ge "$max_failures" ]]; then
    echo "Reached --max-failures ${max_failures}; stopping." | tee -a "$log_file"
    exit 1
  fi

  if [[ "$max_runs" -gt 0 && "$run_idx" -ge "$max_runs" ]]; then
    echo "Reached --max-runs ${max_runs}; stopping." | tee -a "$log_file"
    exit 0
  fi

  sleep "$((interval_min * 60))"
done
