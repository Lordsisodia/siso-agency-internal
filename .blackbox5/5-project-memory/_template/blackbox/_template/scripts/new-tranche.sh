#!/usr/bin/env bash
set -euo pipefail

# new-tranche.sh
#
# Creates the next tranche report file inside a synthesis plan artifacts folder,
# using the tranche report template.
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/new-tranche.sh --synth-plan docs/.blackbox/.plans/<synth> --type live-web
# Or from within docs/:
#   ./.blackbox/4-scripts/new-tranche.sh --synth-plan .blackbox/.plans/<synth> --type live-web

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

synth_plan=""
tranche_type="live-web"   # live-web | live-github | license
title_suffix=""           # optional extra suffix
update_status=false
update_kpis=false
update_index=false
print_next=false
bump_targets=false
target_competitors=""
target_oss_repos=""
target_thin_slices=""

usage() {
  cat <<'EOF' >&2
Usage:
  new-tranche.sh --synth-plan <path> [--type live-web|live-github|license] [--suffix "<text>"] \
    [--update-status] [--update-kpis] [--update-index] [--print-next] \
    [--bump-targets --target-competitors <n> --target-oss-repos <n> --target-thin-slices <n>]

Examples:
  # Create next live-web tranche report
  ./.blackbox/4-scripts/new-tranche.sh \
    --synth-plan .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --type live-web

  # Create next tranche with a short suffix
  ./.blackbox/4-scripts/new-tranche.sh \
    --synth-plan .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --type live-web \
    --suffix "returns-oms"

  # Create tranche + refresh dashboards (recommended)
  ./.blackbox/4-scripts/new-tranche.sh \
    --synth-plan .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --type live-web \
    --suffix "returns-oms" \
    --update-status \
    --update-kpis \
    --update-index \
    --print-next

  # Create tranche + bump KPI targets for the run (optional)
  ./.blackbox/4-scripts/new-tranche.sh \
    --synth-plan .blackbox/.plans/2025-12-29_0154_feature-research-synthesis-agent-zero-015445 \
    --type live-web \
    --suffix "scale-to-200" \
    --bump-targets --target-competitors 200 --target-oss-repos 40 --target-thin-slices 20 \
    --update-kpis --update-status
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --synth-plan)
      shift
      synth_plan="${1:-}"
      shift || true
      ;;
    --type)
      shift
      tranche_type="${1:-}"
      shift || true
      ;;
    --suffix)
      shift
      title_suffix="${1:-}"
      shift || true
      ;;
    --update-status)
      update_status=true
      shift || true
      ;;
    --update-kpis)
      update_kpis=true
      shift || true
      ;;
    --update-index)
      update_index=true
      shift || true
      ;;
    --print-next)
      print_next=true
      shift || true
      ;;
    --bump-targets)
      bump_targets=true
      shift || true
      ;;
    --target-competitors)
      shift
      target_competitors="${1:-}"
      shift || true
      ;;
    --target-oss-repos)
      shift
      target_oss_repos="${1:-}"
      shift || true
      ;;
    --target-thin-slices)
      shift
      target_thin_slices="${1:-}"
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

if [[ "$tranche_type" != "live-web" && "$tranche_type" != "live-github" && "$tranche_type" != "license" ]]; then
  echo "ERROR: --type must be one of: live-web, live-github, license (got: $tranche_type)" >&2
  exit 2
fi

artifacts_dir="$docs_root/$synth_plan/artifacts"
if [[ ! -d "$artifacts_dir" ]]; then
  echo "ERROR: artifacts dir not found: $artifacts_dir" >&2
  exit 2
fi

config_file="$artifacts_dir/feature-research-config.yaml"

prefix=""
case "$tranche_type" in
  live-web) prefix="live-web-research-tranche" ;;
  live-github) prefix="live-github-research-tranche" ;;
  license) prefix="license-verification-tranche" ;;
esac

max=0
for f in "$artifacts_dir/${prefix}-"*.md; do
  [[ -e "$f" ]] || continue
  base="$(basename "$f")"
  # prefix-007*.md -> 7
  n="$(echo "$base" | sed -E "s/^${prefix}-([0-9]{3}).*$/\\1/")"
  if [[ "$n" =~ ^[0-9]{3}$ ]]; then
    n_int=$((10#$n))
    if [[ "$n_int" -gt "$max" ]]; then
      max="$n_int"
    fi
  fi
done

next=$((max + 1))
next_padded="$(printf "%03d" "$next")"

suffix_part=""
if [[ -n "$title_suffix" ]]; then
  # keep filenames safe
  safe="$(echo "$title_suffix" | tr ' ' '-' | tr -cd '[:alnum:]-_.' | tr '[:upper:]' '[:lower:]')"
  suffix_part="-${safe}"
fi

out="$artifacts_dir/${prefix}-${next_padded}${suffix_part}.md"

template="$docs_root/07-templates/library/templates/tranche-report-template.md"
if [[ ! -f "$template" ]]; then
  echo "ERROR: tranche report template missing: $template" >&2
  exit 2
fi

cp "$template" "$out"

echo "✅ Created tranche report:"
echo "- $out"
echo ""
echo "Next: fill it in, then update at least one key artifact (top-50/features/oss-ranked)."

if [[ "$bump_targets" == "true" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    if [[ -z "$target_competitors" || -z "$target_oss_repos" || -z "$target_thin_slices" ]]; then
      echo "ERROR: --bump-targets requires --target-competitors, --target-oss-repos, and --target-thin-slices" >&2
      exit 2
    fi

    old_competitors=""
    old_oss=""
    old_thin=""
    if [[ -f "$config_file" ]]; then
      old_competitors="$(sed -E -n 's/^\\s*competitors:\\s*([0-9]+)\\s*$/\\1/p' "$config_file" | tail -n 1)"
      old_oss="$(sed -E -n 's/^\\s*oss_repos:\\s*([0-9]+)\\s*$/\\1/p' "$config_file" | tail -n 1)"
      old_thin="$(sed -E -n 's/^\\s*thin_slices:\\s*([0-9]+)\\s*$/\\1/p' "$config_file" | tail -n 1)"
    fi

    echo ""
    echo "🎯 Updating run targets via set_feature_research_config.py..."
    python3 "$docs_root/.blackbox/4-scripts/research/set_feature_research_config.py" \
      --synth-plan "$synth_plan" \
      --target-competitors "$target_competitors" \
      --target-oss-repos "$target_oss_repos" \
      --target-thin-slices "$target_thin_slices"

    # Log “target drift” into the tranche file so humans can understand KPI jumps.
    # Prefer inserting under the dedicated "Target changes" section; fallback to "Concrete deltas"; else append.
    target_note=""
    if [[ -n "$old_competitors" || -n "$old_oss" || -n "$old_thin" ]]; then
      target_note="Targets updated: competitors ${old_competitors:-?}→${target_competitors}, oss_repos ${old_oss:-?}→${target_oss_repos}, thin_slices ${old_thin:-?}→${target_thin_slices}"
    else
      target_note="Targets set: competitors ${target_competitors}, oss_repos ${target_oss_repos}, thin_slices ${target_thin_slices}"
    fi

    if rg -n "^## 🎯 Target changes" "$out" >/dev/null 2>&1; then
      tmp="${out}.tmp"
      awk -v note="$target_note" '
        { print }
        $0 ~ /^## 🎯 Target changes/ {
          print ""
          print "- " note
        }
      ' "$out" >"$tmp"
      mv "$tmp" "$out"
    elif rg -n "## ✅ Concrete deltas" "$out" >/dev/null 2>&1; then
      tmp="${out}.tmp"
      awk -v note="$target_note" '
        { print }
        $0 ~ /^## ✅ Concrete deltas/ {
          print ""
          print "- Targets changed (KPI drift): " note
        }
      ' "$out" >"$tmp"
      mv "$tmp" "$out"
    else
      {
        echo ""
        echo "## 🎯 Target changes"
        echo ""
        echo "- ${target_note}"
      } >>"$out"
    fi
  else
    echo "WARN: python3 not found; skipping --bump-targets" >&2
  fi
fi

if [[ "$update_status" == "true" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    echo ""
    echo "📊 Updating run status..."
    python3 "$docs_root/.blackbox/4-scripts/research/run_status.py" --synth-plan "$synth_plan" --write
  else
    echo "WARN: python3 not found; skipping --update-status" >&2
  fi
fi

if [[ "$update_kpis" == "true" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    echo ""
    echo "📌 Updating progress dashboard KPIs..."
    python3 "$docs_root/.blackbox/4-scripts/research/update_progress_dashboard.py" --synth-plan "$synth_plan" --write
  else
    echo "WARN: python3 not found; skipping --update-kpis" >&2
  fi
fi

if [[ "$update_index" == "true" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    echo ""
    echo "🧾 Updating tranche index..."
    python3 "$docs_root/.blackbox/4-scripts/research/update_tranche_index.py" --synth-plan "$synth_plan" --write
  else
    echo "WARN: python3 not found; skipping --update-index" >&2
  fi
fi

if [[ "$print_next" == "true" ]]; then
  echo ""
  echo "➡️ Quick fill-in guide (don’t stall):"
  echo "- Open: $out"
  echo "- Fill: Goal, Inputs, What we learned, Stealable patterns, OSS accelerators"
  echo "- Check at least 2 items in “Minimum tranche delta checklist”"
  echo "- Update at least one artifact: top-50/features/oss-ranked"
fi
