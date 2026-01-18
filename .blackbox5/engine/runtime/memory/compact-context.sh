#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

usage() {
  cat <<'EOF' >&2
Usage:
  compact-context.sh --plan <plan-path> [--max-steps N] [--max-bytes BYTES]
  compact-context.sh [--max-steps N] [--max-bytes BYTES]   # if run from inside the plan folder

Behavior:
  - If there are >= N step files under <plan>/context/steps/, the oldest N are compacted into:
      <plan>/context/compactions/compaction-0001.md
  - The compacted step files are removed (so the agent has fewer files to keep reading).
  - The compaction file is capped to <= BYTES (default: 1MB) by trimming per-step content.
  - Every 10 compactions (≈100 steps), a review scaffold is created under <plan>/context/reviews/.

EOF
}

plan_path=""
max_steps=10
max_bytes="${BLACKBOX_CONTEXT_MAX_BYTES:-1048576}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --plan)
      shift
      plan_path="${1:-}"
      shift
      ;;
    --max-steps)
      shift
      max_steps="${1:-10}"
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

if [[ -z "$plan_path" ]]; then
  plan_path="$(pwd)"
fi

if [[ ! -d "$plan_path" ]]; then
  echo "Plan path not found: $plan_path" >&2
  exit 1
fi

context_dir="${plan_path}/context"
steps_dir="${context_dir}/steps"
compactions_dir="${context_dir}/compactions"
reviews_dir="${context_dir}/reviews"

if [[ ! -d "$steps_dir" ]]; then
  exit 0
fi

steps=()
while IFS= read -r f; do
  steps+=("$f")
done < <(find "$steps_dir" -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]_*.md' -print | sort)
count="${#steps[@]}"

if ((count < max_steps)); then
  echo "No compaction needed (steps=${count}, max=${max_steps})"
  exit 0
fi

mkdir -p "$compactions_dir" "$reviews_dir"

comp_max=0
while IFS= read -r f; do
  bn="$(basename "$f")"
  # compaction-0001.md
  n="${bn#compaction-}"
  n="${n%.md}"
  if [[ "$n" =~ ^[0-9]{4}$ ]]; then
    if ((10#$n > comp_max)); then
      comp_max=$((10#$n))
    fi
  fi
done < <(find "$compactions_dir" -maxdepth 1 -type f -name 'compaction-[0-9][0-9][0-9][0-9].md' -print | sort)

comp_next=$((comp_max + 1))
comp_next_padded="$(printf '%04d' "$comp_next")"
comp_file="${compactions_dir}/compaction-${comp_next_padded}.md"

first="$(basename "${steps[0]}")"
last="$(basename "${steps[$((max_steps-1))]}")"
first_n="${first%%_*}"
last_n="${last%%_*}"

created_at="$(now_timestamp_human)"

build_compaction() {
  local out="$1"
  local per_step_budget="$2"

  {
    echo "---"
    echo "compaction: ${comp_next_padded}"
    echo "created_at: \"${created_at}\""
    echo "range: \"${first_n}-${last_n}\""
    echo "max_bytes: ${max_bytes}"
    echo "per_step_budget_bytes: ${per_step_budget}"
    echo "---"
    echo ""
    echo "# Compaction ${comp_next_padded} (${first_n}–${last_n})"
    echo ""
    echo "## ✅ Summary (fill this after compaction)"
    echo ""
    echo "- <3–7 bullets capturing the durable takeaways>"
    echo ""
    echo "## 🧩 Patterns / heuristics (fill this after compaction)"
    echo ""
    echo "- Prompt improvements:"
    echo "- Checklist improvements:"
    echo "- Better stop conditions:"
    echo ""
    echo "## Steps compacted (trimmed)"
    echo ""

    for f in "${steps[@]:0:$max_steps}"; do
      bn="$(basename "$f")"
      echo "### ${bn}"
      echo ""
      bytes="$(wc -c <"$f" | tr -d ' ')"
      if [[ "$bytes" -le "$per_step_budget" ]]; then
        cat "$f"
      else
        head -c "$per_step_budget" "$f"
        echo ""
        echo ""
        echo "**(truncated to fit compaction size budget)**"
      fi
      echo ""
      echo "---"
      echo ""
    done

    echo "## Cleanup notes"
    echo ""
    echo "- Step files compacted: ${max_steps} (and removed from steps/)"
    echo "- Compaction file is capped at ~${max_bytes} bytes (configurable via BLACKBOX_CONTEXT_MAX_BYTES)."
  } >"$out"
}

reserve_bytes=65536
budget=$((max_bytes - reserve_bytes))
if ((budget < 16384)); then
  budget=$((max_bytes))
fi
per_step_budget=$((budget / max_steps))
if ((per_step_budget < 4096)); then
  per_step_budget=4096
fi

tmp="${comp_file}.tmp"
attempt=0
while :; do
  attempt=$((attempt + 1))
  build_compaction "$tmp" "$per_step_budget"
  size="$(wc -c <"$tmp" | tr -d ' ')"
  if ((size <= max_bytes)); then
    mv "$tmp" "$comp_file"
    break
  fi
  if ((attempt >= 6)); then
    mv "$tmp" "$comp_file"
    break
  fi
  per_step_budget=$((per_step_budget / 2))
  if ((per_step_budget < 1024)); then
    per_step_budget=1024
  fi
done

# Remove the compacted step files so the agent has fewer docs to keep re-reading.
for f in "${steps[@]:0:$max_steps}"; do
  rm -f "$f"
done

echo "Compacted ${max_steps} steps -> ${comp_file}"

# Every 10 compactions, create a review scaffold for pattern extraction + cleanup.
if ((comp_next % 10 == 0)); then
  review_idx=$((comp_next / 10))
  review_padded="$(printf '%04d' "$review_idx")"
  review_file="${reviews_dir}/review-${review_padded}.md"
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
      echo "## 1) Patterns that improve agent performance"
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
      echo "- [ ] Update \`context/context.md\` with durable takeaways"
      echo "- [ ] Remove low-value sections from compaction files (or replace with a short summary)"
      echo "- [ ] If needed, delete old compactions once distilled"
      echo ""
      echo "## 4) References"
      echo ""
      echo "- Compactions:"
      for i in $(seq $((comp_next-9)) $((comp_next))); do
        echo "  - compactions/compaction-$(printf '%04d' "$i").md"
      done
    } >"$review_file"
    echo "Created review scaffold: ${review_file}"
  fi
fi
