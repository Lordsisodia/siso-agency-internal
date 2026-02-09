#!/usr/bin/env bash
set -euo pipefail

# Scaffold a 4-agent feature + OSS research run, plus a synthesis plan folder.
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/start-feature-research.sh
# Or from within docs/:
#   ./.blackbox/4-scripts/start-feature-research.sh

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

if [[ ! -d "$docs_root/.blackbox" ]]; then
  echo "ERROR: Could not locate docs/.blackbox from: $here" >&2
  exit 1
fi

usage() {
  cat <<'EOF' >&2
Usage:
  start-feature-research.sh [--target-user-first "<value>"] [--license-policy "<value>"]

Examples:
  # Scaffold only (fill decisions later)
  ./docs/.blackbox/4-scripts/start-feature-research.sh

  # Scaffold + set decisions + validate (recommended)
  ./docs/.blackbox/4-scripts/start-feature-research.sh \
    --target-user-first "merchant admins" \
    --license-policy "prefer permissive; flag GPL/AGPL"
EOF
}

target_user_first=""
license_policy=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target-user-first)
      shift
      target_user_first="${1:-}"
      shift || true
      ;;
    --license-policy)
      shift
      license_policy="${1:-}"
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

if [[ -n "$target_user_first" || -n "$license_policy" ]]; then
  if [[ -z "$target_user_first" || -z "$license_policy" ]]; then
    echo "ERROR: Provide both --target-user-first and --license-policy (or neither)." >&2
    exit 2
  fi
fi

run() {
  "$here/new-run.sh" deep-research "$1" --prompt "$2"
}

extract_plan() {
  # new-run.sh prints:
  # Created run:
  # - plan: <path>
  # ...
  sed -n 's/^- plan: //p'
}

write_feature_research_config() {
  local plan_path="$1"
  local role="$2"          # step-01|step-02|step-03|step-04|synthesis
  local prompt_pack="$3"   # docs/.blackbox/.prompts/...
  local config_file="${plan_path}/artifacts/feature-research-config.yaml"

  mkdir -p "${plan_path}/artifacts"

  # Safe to regenerate only if it contains the AUTO-GENERATED marker.
  if [[ -f "$config_file" ]] && ! grep -q '^# AUTO-GENERATED: feature-research config$' "$config_file" 2>/dev/null; then
    return 0
  fi

  cat >"$config_file" <<EOF
# AUTO-GENERATED: feature-research config
run:
  kind: feature-research
  created_at_utc: "$(date -u +%FT%TZ)"
  role: "${role}"
  plan_path: "${plan_path}"
  prompt_pack: "${prompt_pack}"

decisions:
  # Fill these in early to prevent drift in a 10–20 hour run.
  target_user_first: "TBD"   # "merchant admins" | "internal ops"
  license_policy: "TBD"      # "prefer permissive; flag GPL/AGPL" | "allow GPL/AGPL"

scoring:
  # These become “defaults” for scorecards and ranking decisions.
  prioritize_easy_integration: true
  prefer_low_cost_setup: true

guardrails:
  scope: "research only (no implementation)"

targets:
  # Defaults for long-run progress tracking (used by dashboard scripts).
  competitors: 100
  oss_repos: 20
  thin_slices: 10
EOF
}

write_start_here() {
  local plan_path="$1"
  local title="$2"
  local prompt_pack="$3"
  shift 3
  local artifacts_dir="${plan_path}/artifacts"
  local start_here="${artifacts_dir}/start-here.md"

  mkdir -p "$artifacts_dir"

  # Safe to regenerate only if it contains the AUTO-GENERATED marker.
  if [[ -f "$start_here" ]] && ! grep -q '^<!-- AUTO-GENERATED: feature-research start-here -->$' "$start_here" 2>/dev/null; then
    return 0
  fi

  {
    echo "<!-- AUTO-GENERATED: feature-research start-here -->"
    echo "---"
    echo "status: active"
    echo "last_reviewed: $(date +%F)"
    echo "owner: agent"
    echo "---"
    echo ""
    echo "# ✅ Start Here: ${title}"
    echo ""
    echo "Plan folder: \`${plan_path}\`"
    echo ""
    echo "## 🎯 Your job"
    echo ""
    echo "- Follow the staged workflow: Align → Plan → Research → Synthesize → Report"
    echo "- Write outputs into \`${artifacts_dir}/\` (use the seeded files)"
    echo "- Keep updates human-friendly (use comms templates)"
    echo ""
    echo "## 📌 Prompt pack to paste into your agent session"
    echo ""
    echo "- \`${prompt_pack}\`"
    echo ""
    echo "## 🧾 Expected artifacts (write into these files)"
    echo ""
    for f in "$@"; do
      echo "- \`artifacts/${f}\`"
    done
    echo ""
    echo "## 🧠 Memory + compaction (required for long runs)"
    echo ""
    echo "Checkpoint after meaningful progress:"
    echo ""
    echo '```bash'
    echo "./docs/.blackbox/4-scripts/new-step.sh --plan ${plan_path} \"Checkpoint: <what changed>\""
    echo '```'
    echo ""
    echo "Compact early if context grows:"
    echo ""
    echo '```bash'
    echo "./docs/.blackbox/4-scripts/compact-context.sh --plan ${plan_path}"
    echo '```'
    echo ""
    echo "## 🗣️ What to say to humans (templates)"
    echo ""
    echo "- Read-aloud update: \`docs/07-templates/agent-comms/read-aloud-status-update.md\`"
    echo "- Decision request: \`docs/07-templates/agent-comms/decision-request.md\`"
    echo "- End-of-run summary: \`docs/07-templates/agent-comms/end-of-run-summary.md\`"
    echo ""
    echo "## ✅ Decisions (must be set early)"
    echo ""
    echo "Edit:"
    echo "- \`artifacts/feature-research-config.yaml\`"
    echo ""
  } >"$start_here"
}

touch_artifacts() {
  local plan_path="$1"
  shift
  local artifacts_dir="${plan_path}/artifacts"
  mkdir -p "$artifacts_dir"
  for f in "$@"; do
    # Create only if missing (do not truncate template artifacts like sources.md).
    if [[ ! -f "${artifacts_dir}/${f}" ]]; then
      : > "${artifacts_dir}/${f}"
    fi
  done
}

seed_autopilot_logs_if_missing() {
  local plan_path="$1"
  local artifacts_dir="${plan_path}/artifacts"
  mkdir -p "$artifacts_dir"

  if [[ ! -f "${artifacts_dir}/agent-plan.md" ]]; then
    cat >"${artifacts_dir}/agent-plan.md" <<'MD'
---
status: active
---

# 🧭 Agent Plan (autopilot)

## Current cycle goal
- <fill>

## Current constraints / stop conditions
- Timebox: 45 minutes
- Max N items: <fill>

## Next 3 actions (ranked)
1) <fill>
2) <fill>
3) <fill>

## Risks / blockers
- <fill>
MD
  fi

  if [[ ! -f "${artifacts_dir}/prompt-log.md" ]]; then
    cat >"${artifacts_dir}/prompt-log.md" <<'MD'
---
status: active
---

# 🧾 Prompt Log (append-only)

Append the exact prompt used each cycle so the run is reproducible.

Entry format:
- `YYYY-MM-DDTHH:MM:SSZ` — Cycle N — <1-line intent>
MD
  fi

  if [[ ! -f "${artifacts_dir}/output-index.md" ]]; then
    cat >"${artifacts_dir}/output-index.md" <<'MD'
---
status: active
---

# 📦 Output Index (append-only)

Append what changed each cycle so we can answer “what did we do?” without diffing everything.

Entry format:
- `YYYY-MM-DDTHH:MM:SSZ` — Cycle N
  - changed: `<path>` — <why>
MD
  fi

  if [[ ! -f "${artifacts_dir}/skills-log.md" ]]; then
    cat >"${artifacts_dir}/skills-log.md" <<'MD'
---
status: active
---

# 🧠 Skills Log (append-only)

Track which skills were used and why (so we can improve prompts and efficiency).

Examples:
- competitor sweep
- evidence snapshotting
- extraction/summarization
- OSS triage + license verification
- ranking + synthesis
MD
  fi
}

seed_artifact_if_empty() {
  local artifacts_dir="$1"
  local artifact_name="$2"
  local seed_path="$3"

  local dest="${artifacts_dir}/${artifact_name}"
  if [[ ! -f "$dest" ]]; then
    return 0
  fi

  # Seed if file is empty/whitespace OR if it still looks like the generic plan-template stub.
  should_seed=false
  if [[ ! -s "$dest" ]] || ! grep -q '[^[:space:]]' "$dest" 2>/dev/null; then
    should_seed=true
  else
    # Upgrade well-known generic stubs to feature-research specific templates.
    # (This keeps the universal plan template intact but still gives feature-research runs a stronger structure.)
    if [[ "$artifact_name" == "summary.md" ]] && grep -q '^# Summary$' "$dest" && grep -q '^## Key takeaways$' "$dest"; then
      should_seed=true
    fi
    if [[ "$artifact_name" == "sources.md" ]] && grep -q '^# Sources$' "$dest" && grep -q 'https://example.com/pricing' "$dest"; then
      should_seed=true
    fi
  fi

  if [[ "$should_seed" == "true" ]]; then
    if [[ -f "$seed_path" ]]; then
      cp "$seed_path" "$dest"
    fi
  fi
}

seed_competitor_seeds_txt() {
  local plan_path="$1"
  local seed_file="${plan_path}/artifacts/competitor-seeds.txt"

  # Only create if missing; do not overwrite if user already started.
  if [[ -f "$seed_file" && -s "$seed_file" ]]; then
    return 0
  fi

  cat >"$seed_file" <<'EOF'
# Competitor seeds (pipe-delimited): name|category|website|notes
#
# Examples:
# Shopify|commerce platform|https://www.shopify.com|Baseline platform
# Medusa|headless commerce|https://medusajs.com|OSS headless backend
EOF
}

seed_feature_research_artifacts() {
  local plan_path="$1"
  local seed_dir="$2"
  local artifacts_dir="${plan_path}/artifacts"

  # Only seed files that exist in the plan (we don't want to create surprise artifacts).
  if [[ ! -d "$seed_dir" ]]; then
    return 0
  fi

  while IFS= read -r seed; do
    rel="${seed#${seed_dir}/}"
    name="$(basename "$rel")"
    seed_artifact_if_empty "$artifacts_dir" "$name" "$seed"
  done < <(find "$seed_dir" -maxdepth 1 -type f -name '*.md' -print 2>/dev/null | sort)
}

echo ""
echo "🧠 Feature Research: scaffolding 4 runs + synthesis"
echo ""

run_suffix="$(date +%H%M%S)"

step1_out="$(run "feature research — step 01 — feature hunt + oss harvest (${run_suffix})" ".blackbox/.prompts/oss-competitors-step-01-needs-map.md")"
step1_plan="$(echo "$step1_out" | extract_plan)"
touch_artifacts "$step1_plan" "features-catalog.md" "oss-catalog.md" "search-log.md" "summary.md" "sources.md"
seed_autopilot_logs_if_missing "$step1_plan"
seed_feature_research_artifacts "$step1_plan" "$docs_root/.blackbox/.plans/_template/artifact-seeds/feature-research/step-01"
write_feature_research_config "$step1_plan" "step-01" "docs/.blackbox/.prompts/oss-competitors-step-01-needs-map.md"
write_start_here "$step1_plan" "Step 01 — Feature hunt + OSS harvest" "docs/.blackbox/.prompts/oss-competitors-step-01-needs-map.md" \
  "feature-research-config.yaml" "run-meta.yaml" "features-catalog.md" "oss-catalog.md" "search-log.md" "summary.md" "sources.md"

step2_out="$(run "feature research — step 02 — competitors (core) (${run_suffix})" ".blackbox/.prompts/oss-competitors-step-02-competitors-core.md")"
step2_plan="$(echo "$step2_out" | extract_plan)"
touch_artifacts "$step2_plan" "competitor-matrix.md" "competitor-seeds.txt" "summary.md" "sources.md"
seed_autopilot_logs_if_missing "$step2_plan"
seed_feature_research_artifacts "$step2_plan" "$docs_root/.blackbox/.plans/_template/artifact-seeds/feature-research/step-02"
seed_competitor_seeds_txt "$step2_plan"
write_feature_research_config "$step2_plan" "step-02" "docs/.blackbox/.prompts/oss-competitors-step-02-competitors-core.md"
write_start_here "$step2_plan" "Step 02 — Competitors (core)" "docs/.blackbox/.prompts/oss-competitors-step-02-competitors-core.md" \
  "feature-research-config.yaml" "run-meta.yaml" "competitor-seeds.txt" "competitor-matrix.md" "summary.md" "sources.md"

step3_out="$(run "feature research — step 03 — competitors (adjacent) (${run_suffix})" ".blackbox/.prompts/oss-competitors-step-03-competitors-adjacent.md")"
step3_plan="$(echo "$step3_out" | extract_plan)"
touch_artifacts "$step3_plan" "competitor-matrix.md" "competitor-seeds.txt" "summary.md" "sources.md"
seed_autopilot_logs_if_missing "$step3_plan"
seed_feature_research_artifacts "$step3_plan" "$docs_root/.blackbox/.plans/_template/artifact-seeds/feature-research/step-03"
seed_competitor_seeds_txt "$step3_plan"
write_feature_research_config "$step3_plan" "step-03" "docs/.blackbox/.prompts/oss-competitors-step-03-competitors-adjacent.md"
write_start_here "$step3_plan" "Step 03 — Competitors (adjacent)" "docs/.blackbox/.prompts/oss-competitors-step-03-competitors-adjacent.md" \
  "feature-research-config.yaml" "run-meta.yaml" "competitor-seeds.txt" "competitor-matrix.md" "summary.md" "sources.md"

step4_out="$(run "feature research — step 04 — oss harvesting (cool code) (${run_suffix})" ".blackbox/.prompts/oss-competitors-step-04-oss-harvesting.md")"
step4_plan="$(echo "$step4_out" | extract_plan)"
touch_artifacts "$step4_plan" "oss-candidates.md" "build-vs-buy.md" "summary.md" "sources.md"
seed_autopilot_logs_if_missing "$step4_plan"
seed_feature_research_artifacts "$step4_plan" "$docs_root/.blackbox/.plans/_template/artifact-seeds/feature-research/step-04"
write_feature_research_config "$step4_plan" "step-04" "docs/.blackbox/.prompts/oss-competitors-step-04-oss-harvesting.md"
write_start_here "$step4_plan" "Step 04 — OSS harvesting (cool code)" "docs/.blackbox/.prompts/oss-competitors-step-04-oss-harvesting.md" \
  "feature-research-config.yaml" "run-meta.yaml" "oss-candidates.md" "build-vs-buy.md" "summary.md" "sources.md"

synth_plan_line="$("$here/new-plan.sh" "feature research — synthesis (agent zero) (${run_suffix})")"
synth_plan="$(echo "$synth_plan_line" | sed -n 's/^Created plan: //p')"
touch_artifacts "$synth_plan" "final-synthesis.md" "features-ranked.md" "oss-ranked.md" "open-questions.md" "evidence-index.md" "summary.md" "sources.md"
seed_autopilot_logs_if_missing "$synth_plan"
seed_feature_research_artifacts "$synth_plan" "$docs_root/.blackbox/.plans/_template/artifact-seeds/feature-research/synthesis"
write_feature_research_config "$synth_plan" "synthesis" "docs/.blackbox/.prompts/feature-research-orchestrator.md"
write_start_here "$synth_plan" "Synthesis — Agent Zero" "docs/.blackbox/.prompts/feature-research-orchestrator.md" \
  "feature-research-config.yaml" "run-meta.yaml" "final-synthesis.md" "features-ranked.md" "oss-ranked.md" "open-questions.md" "evidence-index.md" "summary.md" "sources.md" "kickoff.md"

# Create a single “portal” doc for humans to launch the 4-agent run quickly.
# This is safe to regenerate if it contains the AUTO-GENERATED marker.
kickoff_file="${synth_plan}/artifacts/kickoff.md"
if [[ ! -f "$kickoff_file" ]] || grep -q '^<!-- AUTO-GENERATED: feature-research kickoff -->$' "$kickoff_file" 2>/dev/null; then
  cat >"$kickoff_file" <<'EOF'
<!-- AUTO-GENERATED: feature-research kickoff -->
---
status: active
last_reviewed: $(date +%F)
owner: agent-zero
---

# 🚀 Kickoff: Feature + Competitor + OSS Research (4-agent run)

This file is the **single place** you can use to launch and manage the full market-research run.

## 🎯 Goal

- Find the full feature landscape (what exists already)
- Identify “stealable” OSS that accelerates our admin dashboard + core workflows
- Produce ranked recommendations for what to build/integrate next

## 🧩 Plan folders (copy/paste into agent sessions)

- Step 01 (Agent 1): `__STEP1_PLAN__`
- Step 02 (Agent 2): `__STEP2_PLAN__`
- Step 03 (Agent 3): `__STEP3_PLAN__`
- Step 04 (Agent 4): `__STEP4_PLAN__`
- Synthesis (Agent Zero): `__SYNTH_PLAN__`

## 📌 Prompt packs

- Agent Zero orchestrator: \`docs/.blackbox/.prompts/feature-research-orchestrator.md\`
- Agent 1: \`docs/.blackbox/.prompts/oss-competitors-step-01-needs-map.md\`
- Agent 2: \`docs/.blackbox/.prompts/oss-competitors-step-02-competitors-core.md\`
- Agent 3: \`docs/.blackbox/.prompts/oss-competitors-step-03-competitors-adjacent.md\`
- Agent 4: \`docs/.blackbox/.prompts/oss-competitors-step-04-oss-harvesting.md\`

## ✅ Decisions to set (prevents wasted time)

1) **Target user first**
   - merchant admins vs internal ops
2) **License policy**
   - whether GPL/AGPL is allowed (or “flag only”)

Record decisions in:
- `__SYNTH_PLAN__/artifacts/open-questions.md`
- `__SYNTH_PLAN__/artifacts/feature-research-config.yaml`

### 🚀 Fast setup (set decisions once, propagate everywhere)

\`\`\`bash
# 1) Set decisions for this run (updates Step 01–04 + Synthesis configs)
python3 docs/.blackbox/4-scripts/research/set_feature_research_config.py \\
  --synth-plan __SYNTH_PLAN__ \\
  --target-user-first "merchant admins" \\
  --license-policy "prefer permissive; flag GPL/AGPL"

# 2) Confirm the run is ready (no TBD decisions left)
python3 docs/.blackbox/4-scripts/research/validate_feature_research_config.py \\
  --synth-plan __SYNTH_PLAN__
\`\`\`

## 🧠 Memory + compaction rules (long runs)

- One step = one file under: \`<plan>/context/steps/\`
- Every checkpoint:

\`\`\`bash
./docs/.blackbox/4-scripts/new-step.sh --plan <plan> "Checkpoint: <what changed>"
\`\`\`

- Compact early if needed:

\`\`\`bash
./docs/.blackbox/4-scripts/compact-context.sh --plan <plan>
\`\`\`

## 🗣️ What agents should “say” to humans (templates)

- Read-aloud update: \`docs/07-templates/agent-comms/read-aloud-status-update.md\`
- Decision request: \`docs/07-templates/agent-comms/decision-request.md\`
- End-of-run summary: \`docs/07-templates/agent-comms/end-of-run-summary.md\`

## 🧪 Validation (fast sanity checks)

\`\`\`bash
python3 docs/.blackbox/4-scripts/validate-feature-research-run.py --plan __STEP1_PLAN__ --kind step-01
python3 docs/.blackbox/4-scripts/validate-feature-research-run.py --plan __STEP2_PLAN__ --kind step-02
python3 docs/.blackbox/4-scripts/validate-feature-research-run.py --plan __STEP3_PLAN__ --kind step-03
python3 docs/.blackbox/4-scripts/validate-feature-research-run.py --plan __STEP4_PLAN__ --kind step-04
python3 docs/.blackbox/4-scripts/validate-feature-research-run.py --plan __SYNTH_PLAN__ --kind synthesis
\`\`\`

## 🔎 Evidence Index (optional auto-generation)

\`\`\`bash
python3 docs/.blackbox/4-scripts/research/generate_evidence_index.py --synth-plan __SYNTH_PLAN__
\`\`\`

## 📊 Run status dashboard (fast progress check)

\`\`\`bash
python3 docs/.blackbox/4-scripts/research/run_status.py --synth-plan __SYNTH_PLAN__ --write
\`\`\`

## 🌐 Optional: competitor automation (stubs + snapshots)

Once Step 02/03 have a solid `artifacts/competitor-seeds.txt`, you can generate stub entry files and snapshot pages fast.

### Step 02 (core competitors)

\`\`\`bash
# 1) Generate stub entry files (up to 100)
python3 docs/.blackbox/4-scripts/research/generate_competitor_stubs.py \\
  --input __STEP2_PLAN__/artifacts/competitor-seeds.txt \\
  --out-dir __STEP2_PLAN__/competitors/entries \\
  --index __STEP2_PLAN__/competitors/index.md \\
  --limit 100

# 2) Extract URLs for snapshotting
python3 docs/.blackbox/4-scripts/research/extract_urls_from_competitors.py \\
  --input __STEP2_PLAN__/artifacts/competitor-seeds.txt \\
  --output __STEP2_PLAN__/competitors/urls.txt

# 3) Generate common variants (pricing/docs/features)
python3 docs/.blackbox/4-scripts/research/generate_url_variants.py \\
  --input __STEP2_PLAN__/competitors/urls.txt \\
  --output __STEP2_PLAN__/competitors/urls-variants.txt

# 4) Snapshot (stable names to prevent disk explosion)
python3 docs/.blackbox/4-scripts/research/snapshot_urls.py \\
  --input __STEP2_PLAN__/competitors/urls-variants.txt \\
  --out-dir __STEP2_PLAN__/competitors/snapshots \\
  --stable-names \\
  --skip-existing
\`\`\`

### Step 03 (adjacent competitors)

\`\`\`bash
python3 docs/.blackbox/4-scripts/research/generate_competitor_stubs.py \\
  --input __STEP3_PLAN__/artifacts/competitor-seeds.txt \\
  --out-dir __STEP3_PLAN__/competitors/entries \\
  --index __STEP3_PLAN__/competitors/index.md \\
  --limit 100

python3 docs/.blackbox/4-scripts/research/extract_urls_from_competitors.py \\
  --input __STEP3_PLAN__/artifacts/competitor-seeds.txt \\
  --output __STEP3_PLAN__/competitors/urls.txt

python3 docs/.blackbox/4-scripts/research/generate_url_variants.py \\
  --input __STEP3_PLAN__/competitors/urls.txt \\
  --output __STEP3_PLAN__/competitors/urls-variants.txt

python3 docs/.blackbox/4-scripts/research/snapshot_urls.py \\
  --input __STEP3_PLAN__/competitors/urls-variants.txt \\
  --out-dir __STEP3_PLAN__/competitors/snapshots \\
  --stable-names \\
  --skip-existing
\`\`\`
EOF

  # Fill placeholders in a safe way (no command substitution in the heredoc).
  tmp="${kickoff_file}.tmp"
  sed \
    -e "s#__STEP1_PLAN__#${step1_plan}#g" \
    -e "s#__STEP2_PLAN__#${step2_plan}#g" \
    -e "s#__STEP3_PLAN__#${step3_plan}#g" \
    -e "s#__STEP4_PLAN__#${step4_plan}#g" \
    -e "s#__SYNTH_PLAN__#${synth_plan}#g" \
    "$kickoff_file" >"$tmp"
  mv "$tmp" "$kickoff_file"
fi

# Auto-fill synthesis inputs (plan folder paths) for better “hands-free” generation.
sources_file="${synth_plan}/artifacts/sources.md"
if [[ -f "$sources_file" ]]; then
  # Replace placeholder lines like:
  # - Step 01 plan: `<path>`
  # with actual plan paths.
  #
  # We only do this if the file still contains `<path>` placeholders.
  if grep -q '<path>' "$sources_file" 2>/dev/null; then
    tmp="${sources_file}.tmp"
    sed \
      -e "s#^- Step 01 plan: .*#- Step 01 plan: \`${step1_plan}\`#" \
      -e "s#^- Step 02 plan: .*#- Step 02 plan: \`${step2_plan}\`#" \
      -e "s#^- Step 03 plan: .*#- Step 03 plan: \`${step3_plan}\`#" \
      -e "s#^- Step 04 plan: .*#- Step 04 plan: \`${step4_plan}\`#" \
      "$sources_file" >"$tmp"
    mv "$tmp" "$sources_file"
  fi
fi

echo "✅ Created run folders:"
echo ""
echo "🧩 Step 01 (Agent 1): $step1_plan"
echo "🧩 Step 02 (Agent 2): $step2_plan"
echo "🧩 Step 03 (Agent 3): $step3_plan"
echo "🧩 Step 04 (Agent 4): $step4_plan"
echo "🧩 Synthesis (Agent Zero): $synth_plan"
echo ""
echo "🧭 Kickoff portal: ${synth_plan}/artifacts/kickoff.md"
echo ""
echo "📍 Per-agent briefs:"
echo "- Step 01 start-here: ${step1_plan}/artifacts/start-here.md"
echo "- Step 02 start-here: ${step2_plan}/artifacts/start-here.md"
echo "- Step 03 start-here: ${step3_plan}/artifacts/start-here.md"
echo "- Step 04 start-here: ${step4_plan}/artifacts/start-here.md"
echo "- Synthesis start-here: ${synth_plan}/artifacts/start-here.md"
echo ""

echo "📌 Prompt packs:"
echo "- Agent Zero orchestrator: docs/.blackbox/.prompts/feature-research-orchestrator.md"
echo "- Agent 1: docs/.blackbox/.prompts/oss-competitors-step-01-needs-map.md"
echo "- Agent 2: docs/.blackbox/.prompts/oss-competitors-step-02-competitors-core.md"
echo "- Agent 3: docs/.blackbox/.prompts/oss-competitors-step-03-competitors-adjacent.md"
echo "- Agent 4: docs/.blackbox/.prompts/oss-competitors-step-04-oss-harvesting.md"
echo ""

echo "🧠 Memory rule (each agent, every checkpoint):"
echo "  ./docs/.blackbox/4-scripts/new-step.sh --plan docs/.blackbox/.plans/<plan> \"Checkpoint: <what changed>\""
echo ""

if [[ -n "$target_user_first" && -n "$license_policy" ]]; then
  echo "⚙️ Applying decisions across all plans..."
  python3 "$docs_root/.blackbox/4-scripts/research/set_feature_research_config.py" \
    --synth-plan "$synth_plan" \
    --target-user-first "$target_user_first" \
    --license-policy "$license_policy"
  echo ""
  echo "✅ Validating decisions (no TBD)..."
  python3 "$docs_root/.blackbox/4-scripts/research/validate_feature_research_config.py" \
    --synth-plan "$synth_plan"
  echo ""
  echo "🎯 Ready to run: configs are set."
  echo ""
fi
