#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

usage() {
  cat <<'EOF' >&2
Usage:
  new-step.sh --plan <plan-path> <step title...>
  new-step.sh <step title...>          # if run from inside the plan folder

Examples:
  ./.blackbox/4-scripts/new-step.sh --plan .blackbox/.plans/2025-12-28_1911_deep-research "Defined needs map"
  (cd .blackbox/.plans/<plan> && ../../4-scripts/new-step.sh "Checkpoint: competitor sweep v1")
EOF
}

plan_path=""
if [[ $# -ge 2 && "$1" == "--plan" ]]; then
  plan_path="$2"
  shift 2
fi

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

title="$*"

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

mkdir -p "$steps_dir" "$compactions_dir" "$reviews_dir"

context_file="${context_dir}/context.md"
if [[ ! -f "$context_file" ]]; then
  cat >"$context_file" <<'MD'
# Rolling Context (read first)

Keep this compact and current. This file is the “always read” memory.

## Current goal
- <fill>

## Current assumptions / constraints
- <fill>

## Current best candidates / hypotheses
- <fill>

## Open questions / decisions needed
1) <fill>

## Recent progress (latest 3–5)
- <fill>
MD
fi

max=0

# Determine the next step number robustly:
# - step files under context/steps may have been compacted and deleted
# - compaction files under context/compactions embed the original step frontmatter
#
# So, compute max step from BOTH:
# - filenames in steps/
# - `step: 0001` frontmatter lines in steps/ and compactions/

max_from_filenames=0
while IFS= read -r f; do
  bn="$(basename "$f")"
  n="${bn%%_*}"
  if [[ "$n" =~ ^[0-9]{4}$ ]]; then
    if ((10#$n > max_from_filenames)); then
      max_from_filenames=$((10#$n))
    fi
  fi
done < <(find "$steps_dir" -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]_*.md' -print 2>/dev/null | sort)

max_from_frontmatter=0
while IFS= read -r n; do
  if [[ "$n" =~ ^[0-9]{4}$ ]]; then
    if ((10#$n > max_from_frontmatter)); then
      max_from_frontmatter=$((10#$n))
    fi
  fi
done < <(
  (
    if [[ -d "$steps_dir" ]]; then
      find "$steps_dir" -maxdepth 1 -type f -name '*.md' -print0 2>/dev/null | xargs -0 grep -hE '^step: [0-9]{4}' 2>/dev/null || true
    fi
    if [[ -d "$compactions_dir" ]]; then
      find "$compactions_dir" -maxdepth 1 -type f -name 'compaction-*.md' -print0 2>/dev/null | xargs -0 grep -hE '^step: [0-9]{4}' 2>/dev/null || true
    fi
  ) | sed -E 's/^step: ([0-9]{4}).*/\1/' | sort -u
)

if ((max_from_frontmatter > max_from_filenames)); then
  max=$max_from_frontmatter
else
  max=$max_from_filenames
fi

next=$((max + 1))
next_padded="$(printf '%04d' "$next")"
slug="$(slugify "$title")"
dest="${steps_dir}/${next_padded}_${slug}.md"

created_at="$(now_timestamp_human)"

cat >"$dest" <<MD
---
step: ${next_padded}
created_at: "${created_at}"
title: "${title}"
---

# Step ${next_padded}: ${title}

## ✅ What I did (facts)

- <fill>

## 🧠 What I learned (new information)

- <fill>

## 🧭 What changes because of this

- <fill>

## ➡️ Next step

- <fill>

## 🔗 Links / references

- <fill>
MD

echo "Created step: ${dest}"

# Auto-compact when we hit 10+ step files.
max_bytes="${BLACKBOX_CONTEXT_MAX_BYTES:-1048576}"
"$SCRIPT_DIR/compact-context.sh" --plan "$plan_path" --max-steps 10 --max-bytes "${max_bytes}" >/dev/null 2>&1 || true
