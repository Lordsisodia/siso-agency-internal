#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

usage() {
  cat <<'EOF' >&2
Usage:
  promote.sh <plan-path> <topic>

Examples:
  ./.blackbox/4-scripts/promote.sh \
    docs/.blackbox/.plans/2025-12-28_1910_deep-research-competitor-matrix \
    "competitor-matrix"

What it does:
  - Creates an evergreen research note in `docs/05-planning/research/`
  - Adds a pointer to the plan artifacts
  - Appends a journal entry
  - Appends a docs-ledger entry (docs-wide traceability)
EOF
}

if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

plan_path="$1"
topic="$2"

if [[ ! -d "$plan_path" ]]; then
  echo "Plan path does not exist: $plan_path" >&2
  exit 1
fi

topic_slug="$(slugify "$topic")"
today="$(today_ymd)"

research_dir="docs/05-planning/research"
mkdir -p "$research_dir"

evergreen="${research_dir}/${today}_${topic_slug}.md"

plan_rel="$plan_path"
if [[ "$plan_rel" != docs/* ]]; then
  if [[ "$plan_rel" == .blackbox/* || "$plan_rel" == .blackbox/.plans/* ]]; then
    plan_rel="docs/${plan_rel}"
  fi
fi

if [[ ! -f "$evergreen" ]]; then
  cat > "$evergreen" <<EOF
# ${topic}

## Key takeaways
- <fill>

## Recommendation
- <fill>

## Source artifacts (run folder)
- \`${plan_rel}\`

## Notes
- <fill>
EOF
fi

# Keep the deepresearch index discoverable.
index="docs/.blackbox/deepresearch/index.md"
if [[ -f "$index" ]]; then
  entry="- \`${evergreen}\`"
  if ! grep -Fq "$entry" "$index"; then
    echo "$entry" >> "$index"
  fi
fi

journal="docs/.blackbox/journal.md"
if [[ -f "$journal" ]]; then
  echo "- ${today}: Promoted \`${evergreen}\` from \`${plan_rel}\`." >> "$journal"
fi

ledger="docs/08-meta/repo/docs-ledger.md"
if [[ ! -f "$ledger" ]]; then
  echo "Docs ledger not found (expected canonical): $ledger" >&2
  echo "Run: ./.blackbox/4-scripts/check-blackbox.sh" >&2
  exit 1
fi
echo "- ${today} — research — ${topic_slug} — \`${evergreen}\` — artifacts: \`${plan_rel}\`" >> "$ledger"

echo "Promoted:"
echo "- evergreen: $evergreen"
echo "- journal: $journal"
echo "- ledger: $ledger"
