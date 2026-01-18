#!/usr/bin/env bash
set -euo pipefail

# .blackbox4 Tranche Report Generator
# Creates synthesis reports for long-running research/feature projects
#
# A "tranche" is a periodic summary report (like a financial tranche).
# Use tranches to synthesize progress every 10-20 checkpoints.
#
# Run from .blackbox4 root:
#   ./4-scripts/new-tranche.sh <plan-path> "Tranche Title"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

# Default values
tranche_type="summary"
update_status=false

usage() {
  cat <<'EOF'
.blackbox4 Tranche Report Generator

USAGE:
  ./4-scripts/new-tranche.sh <plan-path> "Tranche Title"

ARGUMENTS:
  plan-path      Path to the plan or run folder
                  Example: .plans/2026-01-12_1400_my-research

  Tranche Title  Descriptive title for this tranche
                  Example: "Phase 1 Complete" or "Week 2 Summary"

DESCRIPTION:
  A tranche is a periodic summary report that synthesizes progress
  from multiple checkpoints. Think of it like a chapter in a book.

  Use tranches to:
  • Summarize progress after a major milestone
  • Synthesize findings from 10-20 checkpoints
  • Create "pause points" in long-running projects
  • Generate deliverables for stakeholders

WHEN TO CREATE A TRANCHE:
  ✓ After 10-20 checkpoints have been created
  ✓ When a major milestone is reached
  ✓ Before switching context or agents
  ✓ When generating deliverables
  ✓ At project phase boundaries

DIFFERENCE: TRANCHE vs CHECKPOINT
  • Checkpoint: Single atomic task (step 1, step 2...)
  • Tranche: Summary of multiple checkpoints (chapter)

EXAMPLES:

  # Create a simple summary tranche
  ./4-scripts/new-tranche.sh .plans/2026-01-12_1400_research "Phase 1 Research"

  # Create milestone tranche
  ./4-scripts/new-tranche.sh .plans/2026-01-12_1500_feature "Design Complete"

  # Create weekly summary
  ./4-scripts/new-tranche.sh .plans/2026-01-12_1600_long-project "Week 2 Summary"

WHAT GETS CREATED:
  - Tranche report: artifacts/tranche-YYYY-MM-DD-title.md
  - Synthesis of recent checkpoints
  - Summary of key findings
  - Next steps or recommendations

BEST PRACTICES:
  1. Create tranches every 10-20 checkpoints
  2. Use descriptive titles that indicate progress
  3. Fill in the summary sections after creation
  4. Share with team or stakeholders
  5. Archive important tranches for reference
EOF
}

# Simplified interface for .blackbox4
if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

# Add help flag support
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  usage
  exit 0
fi

plan_path="$1"
tranche_title="$2"

if [[ ! -d "$plan_path" ]]; then
  error "Plan path does not exist: $plan_path"
  echo ""
  echo "Available plans:"
  find .plans -mindepth 1 -maxdepth 1 -type d ! -name "_template" -printf "  - %f\n" 2>/dev/null | head -5
  exit 1
fi

# Get plan name for display
plan_name="$(basename "$plan_path")"
today_date="$(date +%Y-%m-%d)"
today_time="$(date +%H:%M)"

# Create tranche filename
slug_title="$(slugify "$tranche_title")"
tranche_file="${plan_path}/artifacts/tranche-${today_date}-${slug_title}.md"

# Count checkpoints for context
checkpoint_count=$(find "${plan_path}/context/steps" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
compaction_count=$(find "${plan_path}/context/compactions" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

# Create the tranche report
cat > "$tranche_file" <<EOF
# ${tranche_title}

**Plan:** ${plan_name}
**Date:** ${today_date} at ${today_time}
**Checkpoints:** ${checkpoint_count} active steps
**Compactions:** ${compaction_count} completed

---

## Executive Summary

<!-- Fill in: What was accomplished in this period? -->
<fill>

---

## Key Findings

### What Worked Well
- <finding 1>
- <finding 2>

### What Didn't Work
- <challenge 1>
- <challenge 2>

### Lessons Learned
- <lesson 1>
- <lesson 2>

---

## Detailed Progress

### Major Accomplishments
1. <accomplishment 1>
2. <accomplishment 2>
3. <accomplishment 3>

### Artifacts Created
- <artifact 1>
- <artifact 2>

### Metrics & Results
- <metric 1>: <value>
- <metric 2>: <value>

---

## Blockers & Issues

### Current Blockers
- <blocker 1>: <impact>

### Risks Identified
- <risk 1>: <mitigation>

---

## Next Steps

### Immediate Actions (Next 1-2 checkpoints)
1. <action 1>
2. <action 2>

### Upcoming Work (Next phase)
- <upcoming 1>
- <upcoming 2>

---

## Context

### Checkpoints in This Tranche
${checkpoint_count} checkpoints across $((${compaction_count} + 1)) compaction cycles

### Time Span
From: <start date>
To: ${today_date}

### Team/Agents Involved
- <agent/person 1>
- <agent/person 2>

---

*Tranche generated: ${today_date} ${today_time}*
EOF

success "Tranche created!"
echo ""
echo "Created: $tranche_file"
echo ""
echo "Next steps:"
echo "  1. Fill in the summary sections (Executive Summary, Key Findings)"
echo "  2. Document major accomplishments and artifacts"
echo "  3. Note any blockers or risks"
echo "  4. Update next steps based on current progress"
echo ""
echo "Tips:"
echo "  • Be specific about what was accomplished"
echo "  • Include data/metrics where available"
echo "  • Link to important artifacts or decisions"
echo "  • Use this for stakeholder updates"


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
