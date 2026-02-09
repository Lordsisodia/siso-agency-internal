#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

usage() {
  cat <<'EOF' >&2
Usage:
  new-run.sh <agent-id> <goal/title...> [--prompt <path>]...

Examples:
  ./.blackbox/4-scripts/new-run.sh deep-research "competitor matrix" \
    --prompt .blackbox/agents/deep-research/prompts/library/01-competitor-matrix.md

Notes:
  - Creates a plan folder (via new-plan.sh)
  - Ensures `artifacts/` exists
  - Writes `artifacts/run-meta.yaml` for reproducibility
  - Deep Research context pack lives at:
      .blackbox/agents/deep-research/prompts/context-pack.md
EOF
}

if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

agent_id="$1"
shift

prompts=()
goal_parts=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --prompt)
      shift
      if [[ $# -lt 1 ]]; then
        echo "Missing value after --prompt" >&2
        exit 1
      fi
      prompts+=("$1")
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      goal_parts+=("$1")
      shift
      ;;
  esac
done

if [[ ${#goal_parts[@]} -eq 0 ]]; then
  echo "Missing <goal/title...>" >&2
  usage
  exit 1
fi

goal="${goal_parts[*]}"
plan_title="${agent_id} ${goal}"

created_line="$("$SCRIPT_DIR/new-plan.sh" "$plan_title")"
plan_path="$(echo "$created_line" | sed -n 's/^Location: //p')"
if [[ -z "$plan_path" ]]; then
  echo "Failed to determine created plan path from: $created_line" >&2
  exit 1
fi

artifacts_dir="${plan_path}/artifacts"
mkdir -p "$artifacts_dir"

meta_file="${artifacts_dir}/run-meta.yaml"
created_at="$(date '+%Y-%m-%dT%H:%M:%S%z')"

{
  echo "run:"
  echo "  id: \"$(basename "$plan_path")\""
  echo "  created_at: \"${created_at}\""
  echo "  agent_id: \"${agent_id}\""
  echo ""
  echo "inputs:"
  echo "  prompts:"
  if [[ ${#prompts[@]} -eq 0 ]]; then
    echo "    - \"<add prompt path(s) here>\""
  else
    for p in "${prompts[@]}"; do
      echo "    - \"${p}\""
    done
  fi
  echo "  context_pack:"
  echo "    - \".blackbox/agents/deep-research/prompts/context-pack.md\""
  echo ""
  echo "model:"
  echo "  name: \"<fill>\""
  echo "  temperature: \"<fill>\""
  echo ""
  echo "outputs:"
  echo "  raw: \"artifacts/raw.md\""
  echo "  sources: \"artifacts/sources.md\""
  echo "  extracted: \"artifacts/extracted.json\""
  echo "  summary: \"artifacts/summary.md\""
} > "$meta_file"

echo "Created run:"
echo "- plan: $plan_path"
echo "- artifacts: $artifacts_dir"
echo "- meta: $meta_file"
