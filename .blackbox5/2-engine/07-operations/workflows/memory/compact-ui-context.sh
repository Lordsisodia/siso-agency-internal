#!/usr/bin/env bash
set -euo pipefail

# Compact UI Cycle context to prevent bloat during long-running sessions
# - Compacts run directory logs and artifacts
# - Creates review scaffolds for pattern extraction
# - Keeps recent artifacts accessible

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

BOX_ROOT="$(find_box_root)"
RUNS_DIR="${BOX_ROOT}/.runs"

usage() {
  cat <<'EOF' >&2
Usage:
  compact-ui-context.sh --run <run-dir> [--max-artifacts N] [--max-bytes BYTES]
  compact-ui-context.sh [--max-artifacts N] [--max-bytes BYTES]   # if run from inside run directory

Behavior:
  - If there are >= N artifact files under <run>/artifacts/, the oldest are compacted into:
      <run>/artifacts/compactions/compaction-0001.md
  - Log files are compacted similarly
  - Every 10 compactions, a review scaffold is created for pattern extraction
  - Essential files (cycle.md, cycle.json, screenshots/) are never compacted

Example:
  compact-ui-context.sh --run .runs/ui-cycle-20250113_1430 --max-artifacts 15
EOF
}

run_path=""
max_artifacts=15
max_bytes="${BLACKBOX_CONTEXT_MAX_BYTES:-1048576}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --run)
      shift
      run_path="${1:-}"
      shift
      ;;
    --max-artifacts)
      shift
      max_artifacts="${1:-15}"
      shift
      ;;
    --max-bytes)
      shift
      max_bytes="${1:-1048576}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$run_path" ]]; then
  run_path="$(pwd)"
fi

# Resolve relative path
if [[ ! "$run_path" = /* ]]; then
  run_path="${BOX_ROOT}/${run_path}"
fi

if [[ ! -d "$run_path" ]]; then
  error "Run path not found: $run_path"
  exit 1
fi

artifacts_dir="${run_path}/artifacts"
logs_dir="${run_path}/logs"
compactions_dir="${artifacts_dir}/compactions"
reviews_dir="${artifacts_dir}/reviews"

mkdir -p "$compactions_dir" "$reviews_dir"

# Compact artifacts
compact_artifacts() {
  local artifacts=()
  while IFS= read -r f; do
    artifacts+=("$f")
  done < <(find "$artifacts_dir" -maxdepth 1 -type f \
    ! -name "*.backup" \
    ! -name "compaction-*.md" \
    ! -name "*.json" \
    -print | sort)

  local count="${#artifacts[@]}"

  if ((count < max_artifacts)); then
    return 0
  fi

  # Find next compaction number
  local comp_max=0
  while IFS= read -r f; do
    local bn="$(basename "$f")"
    local n="${bn#compaction-}"
    n="${n%.md}"
    if [[ "$n" =~ ^[0-9]{4}$ ]]; then
      if ((10#$n > comp_max)); then
        comp_max=$((10#$n))
      fi
    fi
  done < <(find "$compactions_dir" -maxdepth 1 -type f -name 'compaction-[0-9][0-9][0-9][0-9].md' -print 2>/dev/null || true)

  local comp_next=$((comp_max + 1))
  local comp_next_padded="$(printf '%04d' "$comp_next")"
  local comp_file="${compactions_dir}/compaction-${comp_next_padded}.md"

  local first="$(basename "${artifacts[0]}")"
  local last="$(basename "${artifacts[$((max_artifacts-1))]}")"

  local created_at="$(now_timestamp_human)"

  # Build compaction
  {
    echo "---"
    echo "compaction: ${comp_next_padded}"
    echo "created_at: \"${created_at}\""
    echo "type: artifacts"
    echo "max_bytes: ${max_bytes}"
    echo "---"
    echo ""
    echo "# Artifacts Compaction ${comp_next_padded}"
    echo ""
    echo "## Files compacted"
    echo ""
    echo "Range: \`${first}\` to \`${last}\`"
    echo "Count: ${max_artifacts} files"
    echo ""

    local budget=$((max_bytes / 2))

    for f in "${artifacts[@]:0:$max_artifacts}"; do
      local bn="$(basename "$f")"
      echo "### ${bn}"
      echo ""
      local bytes="$(wc -c <"$f" | tr -d ' ')"
      if [[ "$bytes" -le "$budget" ]]; then
        cat "$f"
      else
        head -c "$budget" "$f"
        echo ""
        echo ""
        echo "**(truncated to fit compaction size budget)**"
      fi
      echo ""
      echo "---"
      echo ""
    done

    # Remove compacted files
    for f in "${artifacts[@]:0:$max_artifacts}"; do
      rm -f "$f"
    done

    echo "Compacted ${max_artifacts} artifact files -> ${comp_file}"
  } > "$comp_file"

  # Create review every 10 compactions
  if ((comp_next % 10 == 0)); then
    local review_idx=$((comp_next / 10))
    local review_padded="$(printf '%04d' "$review_idx")"
    local review_file="${reviews_dir}/review-${review_padded}.md"

    if [[ ! -f "$review_file" ]]; then
      {
        echo "---"
        echo "review: ${review_padded}"
        echo "created_at: \"${created_at}\""
        echo "covers_compactions: \"$(printf '%04d' $((comp_next-9)))-$(printf '%04d' $((comp_next)))\""
        echo "---"
        echo ""
        echo "# Review ${review_padded} (compactions $(printf '%04d' $((comp_next-9)))–$(printf '%04d' $((comp_next))))"
        echo ""
        echo "## 1) Patterns that improve UI cycle performance"
        echo ""
        echo "- Prompt improvements:"
        echo "- Checklist improvements:"
        echo "- Better stop conditions:"
        echo ""
        echo "## 2) What data is durable for future runs?"
        echo ""
        echo "- Keep:"
        echo "- Delete:"
        echo ""
        echo "## 3) Cleanup actions"
        echo ""
        echo "- [ ] Update cycle.md with durable takeaways"
        echo "- [ ] Remove low-value sections from compaction files"
        echo "- [ ] If needed, delete old compactions once distilled"
        echo ""
        echo "## 4) References"
        echo ""
        echo "- Compactions:"
        for i in $(seq $((comp_next-9)) $((comp_next))); do
          echo "  - compactions/compaction-$(printf '%04d' "$i").md"
        done
      } > "$review_file"
      echo "Created review scaffold: ${review_file}"
    fi
  fi
}

# Compact logs
compact_logs() {
  local logs=()
  while IFS= read -r f; do
    logs+=("$f")
  done < <(find "$logs_dir" -maxdepth 1 -type f -name "*.json" -print | sort)

  local count="${#logs[@]}"

  if ((count < max_artifacts)); then
    return 0
  fi

  local comp_max=0
  while IFS= read -r f; do
    local bn="$(basename "$f")"
    local n="${bn#log-compaction-}"
    n="${n%.json}"
    if [[ "$n" =~ ^[0-9]{4}$ ]]; then
      if ((10#$n > comp_max)); then
        comp_max=$((10#$n))
      fi
    fi
  done < <(find "$logs_dir" -maxdepth 1 -type f -name 'log-compaction-[0-9][0-9][0-9][0-9].json' -print 2>/dev/null || true)

  local comp_next=$((comp_max + 1))
  local comp_next_padded="$(printf '%04d' "$comp_next")"
  local comp_file="${logs_dir}/log-compaction-${comp_next_padded}.json"

  local first="$(basename "${logs[0]}")"
  local last="$(basename "${logs[$((max_artifacts-1))]}")"

  # Build log compaction
  {
    echo "{"
    echo "  \"compaction\": \"${comp_next_padded}\","
    echo "  \"created_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
    echo "  \"type\": \"logs\","
    echo "  \"range\": \"${first} to ${last}\","
    echo "  \"files\": ["

    local first=true
    for f in "${logs[@]:0:$max_artifacts}"; do
      if [[ "$first" == "true" ]]; then
        first=false
      else
        echo ","
      fi
      echo -n "    \"$(basename "$f")\""
    done

    echo ""
    echo "  ],"
    echo "  \"summary\": {}"
    echo "}"

    # Remove compacted log files
    for f in "${logs[@]:0:$max_artifacts}"; do
      rm -f "$f"
    done

    echo "Compacted ${max_artifacts} log files -> ${comp_file}"
  } > "$comp_file"
}

# Execute compaction
compact_artifacts
compact_logs

echo ""
success "UI Cycle context compaction complete"
info "  run: ${run_path}"
info "  artifacts compactions: $(ls -1 "${compactions_dir}" 2>/dev/null | wc -l | tr -d ' ')"
info "  log compactions: $(ls -1 "${logs_dir}"/log-compaction-*.json 2>/dev/null | wc -l | tr -d ' ')"
