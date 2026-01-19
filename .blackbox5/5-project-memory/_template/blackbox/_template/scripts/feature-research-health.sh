#!/usr/bin/env bash
set -euo pipefail

# Feature Research Health Check
#
# Validates:
# - docs structure rules
# - blackbox integrity
# - feature-research run artifacts for step-01..04 + synthesis
# - writes/refreshes run status (run-status.md) for the synthesis plan
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/feature-research-health.sh --synth-plan docs/.blackbox/.plans/<synth>
# Or from within docs/:
#   ./.blackbox/4-scripts/feature-research-health.sh --synth-plan .blackbox/.plans/<synth>

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

synth_plan=""
write_status=true
auto_compact=false
compact_threshold=10

usage() {
  cat <<'EOF' >&2
Usage:
  feature-research-health.sh --synth-plan <path> [--no-write-status] [--auto-compact] [--compact-threshold <n>]
  feature-research-health.sh --plan <path>       [--no-write-status] [--auto-compact] [--compact-threshold <n>]

Examples:
  # From docs/
  ./.blackbox/4-scripts/feature-research-health.sh \
    --synth-plan .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445

  # From repo root
  ./docs/.blackbox/4-scripts/feature-research-health.sh \
    --synth-plan docs/.blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445

  # Auto-compact when a plan has 10+ step files (useful for 10–20 hour runs)
  ./.blackbox/4-scripts/feature-research-health.sh \
    --synth-plan .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --auto-compact \
    --compact-threshold 10
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --synth-plan)
      shift
      synth_plan="${1:-}"
      shift || true
      ;;
    --plan)
      shift
      synth_plan="${1:-}"
      shift || true
      ;;
    --no-write-status)
      write_status=false
      shift || true
      ;;
    --auto-compact)
      auto_compact=true
      shift || true
      ;;
    --compact-threshold)
      shift
      compact_threshold="${1:-}"
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

if [[ -z "$synth_plan" ]]; then
  echo "ERROR: --synth-plan is required" >&2
  usage
  exit 2
fi

if [[ ! -d "$docs_root/.blackbox" ]]; then
  echo "ERROR: Could not locate docs/.blackbox from: $here" >&2
  exit 1
fi

echo "✅ Feature Research Health Check"
echo "- docs_root: $docs_root"
echo "- synth_plan: $synth_plan"
echo "- write_status: $write_status"
echo "- auto_compact: $auto_compact"
echo "- compact_threshold: $compact_threshold"
echo ""

echo "🧱 1) Validate docs structure"
python3 "$docs_root/.blackbox/4-scripts/validate-docs.py"
echo ""

echo "🧠 2) Validate blackbox integrity"
"$docs_root/.blackbox/4-scripts/check-blackbox.sh"
echo ""

if [[ "$write_status" == "true" ]]; then
  echo "📊 3) Refresh run status dashboard"
  python3 "$docs_root/.blackbox/4-scripts/research/run_status.py" --synth-plan "$synth_plan" --write
  echo ""
fi

echo "🧪 4) Validate each run produced artifacts"

# We infer step plan paths from synthesis artifacts/sources.md.
sources_file="$docs_root/$synth_plan/artifacts/sources.md"
if [[ ! -f "$sources_file" ]]; then
  echo "ERROR: Missing synthesis sources.md: $sources_file" >&2
  exit 2
fi

step1="$(sed -E -n 's/^- Step 01 plan: `([^`]+)`$/\1/p' "$sources_file" | tail -n 1)"
step2="$(sed -E -n 's/^- Step 02 plan: `([^`]+)`$/\1/p' "$sources_file" | tail -n 1)"
step3="$(sed -E -n 's/^- Step 03 plan: `([^`]+)`$/\1/p' "$sources_file" | tail -n 1)"
step4="$(sed -E -n 's/^- Step 04 plan: `([^`]+)`$/\1/p' "$sources_file" | tail -n 1)"

if [[ -z "$step1" || -z "$step2" || -z "$step3" || -z "$step4" ]]; then
  echo "ERROR: Could not extract step plan paths from synthesis sources.md" >&2
  exit 2
fi

python3 "$docs_root/.blackbox/4-scripts/validate-feature-research-run.py" --plan "$step1" --kind step-01
python3 "$docs_root/.blackbox/4-scripts/validate-feature-research-run.py" --plan "$step2" --kind step-02
python3 "$docs_root/.blackbox/4-scripts/validate-feature-research-run.py" --plan "$step3" --kind step-03
python3 "$docs_root/.blackbox/4-scripts/validate-feature-research-run.py" --plan "$step4" --kind step-04
python3 "$docs_root/.blackbox/4-scripts/validate-feature-research-run.py" --plan "$synth_plan" --kind synthesis

echo ""
echo "🧠 5) Compaction warnings (non-fatal)"
count_steps() {
  local plan="$1"
  local dir="$docs_root/$plan/context/steps"
  if [[ ! -d "$dir" ]]; then
    echo "0"
    return 0
  fi
  # exclude README.md
  find "$dir" -maxdepth 1 -type f -name '*.md' ! -name 'README.md' | wc -l | tr -d ' '
}

s1="$(count_steps "$step1")"
s2="$(count_steps "$step2")"
s3="$(count_steps "$step3")"
s4="$(count_steps "$step4")"
ss="$(count_steps "$synth_plan")"

warn_threshold=10
warn_threshold="$compact_threshold"

compact_plan_if_needed() {
  local plan="$1"
  local steps="$2"
  if [[ "$auto_compact" != "true" ]]; then
    return 0
  fi
  if [[ "$steps" -lt "$warn_threshold" ]]; then
    return 0
  fi
  if [[ ! -x "$docs_root/.blackbox/4-scripts/compact-context.sh" ]]; then
    echo "WARN: compact-context.sh not executable; skipping auto-compact for $plan" >&2
    return 0
  fi
  echo "AUTO-COMPACT: $plan (steps=$steps)"
  "$docs_root/.blackbox/4-scripts/compact-context.sh" --plan "$plan" >/dev/null 2>&1 || true
}

compact_plan_if_needed "$step1" "$s1"
compact_plan_if_needed "$step2" "$s2"
compact_plan_if_needed "$step3" "$s3"
compact_plan_if_needed "$step4" "$s4"
compact_plan_if_needed "$synth_plan" "$ss"

if [[ "$s1" -ge "$warn_threshold" ]]; then
  echo "WARN: Step 01 has ${s1} context step files; consider compaction:"
  echo "  ./.blackbox/4-scripts/compact-context.sh --plan $step1"
fi
if [[ "$s2" -ge "$warn_threshold" ]]; then
  echo "WARN: Step 02 has ${s2} context step files; consider compaction:"
  echo "  ./.blackbox/4-scripts/compact-context.sh --plan $step2"
fi
if [[ "$s3" -ge "$warn_threshold" ]]; then
  echo "WARN: Step 03 has ${s3} context step files; consider compaction:"
  echo "  ./.blackbox/4-scripts/compact-context.sh --plan $step3"
fi
if [[ "$s4" -ge "$warn_threshold" ]]; then
  echo "WARN: Step 04 has ${s4} context step files; consider compaction:"
  echo "  ./.blackbox/4-scripts/compact-context.sh --plan $step4"
fi
if [[ "$ss" -ge "$warn_threshold" ]]; then
  echo "WARN: Synthesis has ${ss} context step files; consider compaction:"
  echo "  ./.blackbox/4-scripts/compact-context.sh --plan $synth_plan"
fi

echo ""
echo "✅ Health check OK"
