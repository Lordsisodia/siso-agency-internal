#!/usr/bin/env bash
set -euo pipefail

# Scaffolds a long-running "agent cycle" plan specifically for OSS discovery:
# - Creates a plan folder (via start-agent-cycle.sh)
# - Seeds a work queue tailored to running multiple discovery cycles + curation
# - Links to the OSS discovery agent cycle prompt pack
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/start-oss-discovery-agent-cycle.sh
# Or from within docs/:
#   ./.blackbox/4-scripts/start-oss-discovery-agent-cycle.sh

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

if [[ ! -d "$docs_root/.blackbox" ]]; then
  echo "ERROR: Could not locate docs/.blackbox from: $here" >&2
  exit 1
fi

usage() {
  cat <<'EOF' >&2
Usage:
  start-oss-discovery-agent-cycle.sh [--hours <n>] [--prompts <n>] [--checkpoint-every <n>] [--plan <path>] [--resume | --overwrite] [--keep]

Defaults:
  --hours            8
  --prompts          50
  --checkpoint-every 1

Notes:
  - This script only scaffolds a plan and checklists; it does not run the discovery itself.
  - The actual discovery command is:
      ./.blackbox/4-scripts/start-oss-discovery-cycle.sh
  - Prompt pack:
      .blackbox/.prompts/oss-discovery-agent-cycle.md
EOF
}

args=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    *)
      args+=("$1")
      shift || true
      ;;
  esac
done

goal="OSS discovery agent cycle (multi-run)"

created="$("$docs_root/.blackbox/4-scripts/start-agent-cycle.sh" "${args[@]}" --keep "$goal")"
plan_rel="$(echo "$created" | sed -n 's/^Created plan: //p' | head -n 1)"
if [[ -z "$plan_rel" ]]; then
  # start-agent-cycle.sh prints different output on resume/overwrite; fall back to parsing "- plan: ..."
  plan_rel="$(echo "$created" | sed -n 's/^- plan: //p' | head -n 1)"
fi

if [[ -z "$plan_rel" ]]; then
  echo "ERROR: Failed to parse plan path from start-agent-cycle output:" >&2
  echo "$created" >&2
  exit 1
fi

plan_path="$docs_root/$plan_rel"
if [[ ! -d "$plan_path" ]]; then
  echo "ERROR: Plan folder not found: $plan_path" >&2
  exit 1
fi

cat >"$plan_path/artifacts/oss-discovery-agent-cycle.md" <<EOF
# OSS Discovery Agent Cycle (helper)

Plan: \`$plan_rel\`

## Prompt pack

- \`.blackbox/.prompts/oss-discovery-agent-cycle.md\`

## Commands you will run

- Single cycle:
  - \`./.blackbox/4-scripts/start-oss-discovery-cycle.sh\`
- Batch mode:
  - \`./.blackbox/4-scripts/start-oss-discovery-batch.sh --runs 6 --interval-min 60 -- --min-stars 200\`

## Key outputs

- Per-run plans: \`.blackbox/.plans/<run>/\`
- Cross-run catalog:
  - \`.blackbox/oss-catalog/catalog.json\`
  - \`.blackbox/oss-catalog/curation.json\`
  - \`.blackbox/oss-catalog/shortlist.md\`

## Guardrails

- Metadata only (no cloning / no vendoring).
- Token via env var only (\`GITHUB_TOKEN\`).
EOF

queue="$plan_path/work-queue.md"
cat >"$queue" <<'EOF'
# Work Queue (OSS discovery agent cycle)

## Next actions (keep 5–10)
- [ ] Set `GITHUB_TOKEN` (avoid rate limits)
- [ ] Run 1 discovery cycle: `./.blackbox/4-scripts/start-oss-discovery-cycle.sh`
- [ ] Curate top 10 from `artifacts/oss-ranked.md` into `.blackbox/oss-catalog/curation.json`
- [ ] Render shortlist: `python3 ./.blackbox/4-scripts/research/render_oss_catalog_shortlist.py --catalog .blackbox/oss-catalog/catalog.json --curation .blackbox/oss-catalog/curation.json --out .blackbox/oss-catalog/shortlist.md`
- [ ] Pick 3–6 POCs (1–2 days) and assign owners in curation notes
- [ ] Run batch scan if needed: `./.blackbox/4-scripts/start-oss-discovery-batch.sh --runs 6 --interval-min 60 -- --min-stars 200`
EOF

echo ""
echo "OSS discovery agent cycle scaffolded:"
echo "- plan: $plan_rel"
echo "- guide: ${plan_rel}/artifacts/oss-discovery-agent-cycle.md"
echo "- prompt pack: .blackbox/.prompts/oss-discovery-agent-cycle.md"
