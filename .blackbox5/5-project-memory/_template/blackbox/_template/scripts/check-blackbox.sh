#!/usr/bin/env bash
set -euo pipefail

# Run lightweight `.blackbox` hygiene checks, scoped to `docs/.blackbox/`.
#
# Intended to be run either:
# - from repo root: `./docs/.blackbox/4-scripts/check-blackbox.sh`
# - from within docs/: `./.blackbox/4-scripts/check-blackbox.sh`

fail() {
  echo "ERROR: $*" >&2
  if [[ "$*" == Template\ script\ differs\ from\ live:* ]]; then
    echo "Hint: run ./.blackbox/4-scripts/validate-all.sh --auto-sync" >&2
    echo "  (or: ./.blackbox/4-scripts/sync-template.sh then re-run check-blackbox.sh)" >&2
  fi
  exit 1
}

note() {
  echo "OK: $*"
}

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

repo_root=""
if repo_root="$(git -C "$here" rev-parse --show-toplevel 2>/dev/null)"; then
  :
else
  repo_root=""
fi

docs_root=""
if [[ -n "$repo_root" && -d "$repo_root/docs/.blackbox" ]]; then
  docs_root="$repo_root/docs"
elif [[ -d "$here/.." && -d "$here/../context.md" ]]; then
  # unlikely, but keep fallback
  docs_root=""
elif [[ -d "$here/../.." && -d "$here/../.." ]]; then
  # If invoked from within docs/, `.blackbox/scripts` -> docs_root is two levels up.
  # docs/.blackbox/scripts => ../../ == docs
  candidate="$(cd "$here/../.." && pwd)"
  if [[ -d "$candidate/.blackbox" ]]; then
    docs_root="$candidate"
  fi
fi

if [[ -z "$docs_root" ]]; then
  fail "Could not locate docs root (expected either <repo>/docs or current docs/ directory)"
fi

box_root="$docs_root/.blackbox"
if [[ ! -d "$box_root" ]]; then
  fail "Missing .blackbox directory: $box_root"
fi

echo "Blackbox check: $box_root"

# Optional validator (don’t fail if absent).
validate="$docs_root/.blackbox/4-scripts/validate-docs.py"
if [[ -f "$validate" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    python3 "$validate"
  else
    echo "WARN: python3 not found; skipping validator: $validate" >&2
  fi
fi

# 1) Required core files.
required_files=(
  "$box_root/context.md"
  "$box_root/tasks.md"
  "$box_root/journal.md"
  "$box_root/scratchpad.md"
  "$box_root/manifest.yaml"
  "$box_root/README.md"
)
for f in "${required_files[@]}"; do
  [[ -f "$f" ]] || fail "Missing required file: ${f#$docs_root/}"
done
note "Core files present"

# 1b) Docs-wide routing + ledger (findability) live in docs meta.
required_docs_files=(
  "$docs_root/08-meta/repo/docs-ledger.md"
  "$docs_root/08-meta/repo/information-routing.md"
)
for f in "${required_docs_files[@]}"; do
  [[ -f "$f" ]] || fail "Missing required docs file: ${f#$docs_root/}"
done
note "Docs routing + ledger present (08-meta/repo)"

# 1c) Pointer files should remain pointers (avoid accidental writes to non-canonical files).
ledger_pointer="$box_root/docs-ledger.md"
if [[ -f "$ledger_pointer" ]]; then
  if ! grep -Fq "docs/08-meta/repo/docs-ledger.md" "$ledger_pointer"; then
    fail "docs-ledger pointer missing canonical path: ${ledger_pointer#$docs_root/}"
  fi
fi

routing_pointer="$box_root/information-routing.md"
if [[ -f "$routing_pointer" ]]; then
  if ! grep -Fq "docs/08-meta/repo/information-routing.md" "$routing_pointer"; then
    fail "information-routing pointer missing canonical path: ${routing_pointer#$docs_root/}"
  fi
fi
note "Pointer files reference canonical docs"

# 2) Prompt packs live in `.prompts/` (inputs to long runs).
prompts_dir="$box_root/.prompts"
if [[ ! -d "$prompts_dir" ]]; then
  fail "Missing: docs/.blackbox/.prompts (prompt packs live here)"
fi
if find "$prompts_dir" -mindepth 1 -maxdepth 1 -type d -print | grep -q .; then
  echo "Found directories under .prompts/:" >&2
  find "$prompts_dir" -mindepth 1 -maxdepth 1 -type d -print >&2
  fail ".prompts/ should be flat (put prompt libraries under agents/<agent>/prompts/)"
fi
bad_prompt_files="$(find "$prompts_dir" -mindepth 1 -maxdepth 1 -type f ! -name '*.md' -print || true)"
if [[ -n "${bad_prompt_files}" ]]; then
  echo "Unexpected files under .prompts/ (expected *.md only):" >&2
  echo "${bad_prompt_files}" >&2
  fail ".prompts contains non-markdown files"
fi
if ! find "$prompts_dir" -mindepth 1 -maxdepth 1 -type f -name '*.md' -print | grep -q .; then
  fail "Missing: at least one prompt pack (*.md) under .prompts/"
fi
note ".prompts exists (markdown prompt packs)"

# 3) `.skills/` should be flat: README.md + *.md only.
skills_dir="$box_root/.skills"
if [[ -d "$skills_dir" ]]; then
  if find "$skills_dir" -mindepth 1 -maxdepth 1 -type d -print | grep -q .; then
    echo "Found directories under .skills/:" >&2
    find "$skills_dir" -mindepth 1 -maxdepth 1 -type d -print >&2
    fail ".skills/ must not contain subdirectories (skills are single .md files)"
  fi
  bad_files="$(find "$skills_dir" -mindepth 1 -maxdepth 1 -type f ! -name 'README.md' ! -name '*.md' ! -name '.*' -print || true)"
  if [[ -n "${bad_files}" ]]; then
    echo "Unexpected files under .skills/:" >&2
    echo "${bad_files}" >&2
    fail ".skills/ contains unexpected files"
  fi
note ".skills is flat (README.md + *.md)"
fi

# 3b) Scripts with a shebang should be executable (avoids "permission denied").
check_exec_dir() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    return 0
  fi
  while IFS= read -r -d '' f; do
    if head -n 1 "$f" | grep -q '^#!'; then
      if [[ ! -x "$f" ]]; then
        fail "Script is not executable: ${f#$docs_root/} (run ./.blackbox/4-scripts/fix-perms.sh)"
      fi
    fi
  done < <(find "$dir" -maxdepth 1 -type f -print0)
}

check_exec_dir "$box_root/scripts"
check_exec_dir "$box_root/_template/scripts"
note "Scripts are executable"

# 4) Template drift checks (keep copy-ready template synced with live).
for script in README.md lib.sh new-run.sh new-plan.sh new-agent.sh promote.sh notify-telegram.sh telegram-bootstrap.sh check-blackbox.sh check-vendor-leaks.sh sync-template.sh validate-all.sh validate-loop.sh fix-perms.sh archive-plans.py archive-oss-plans.py new-step.sh compact-context.sh start-feature-research.sh start-oss-discovery-cycle.sh start-agent-cycle.sh; do
  if [[ -f "$box_root/4-scripts/${script}" && -f "$box_root/_template/4-scripts/${script}" ]]; then
    if ! diff -q "$box_root/4-scripts/${script}" "$box_root/_template/4-scripts/${script}" >/dev/null 2>&1; then
      fail "Template script differs from live: _template/4-scripts/${script} (run diff to inspect)"
    fi
  fi
done
note "_template/scripts matches scripts"

# 5) Plan template should include the common long-run artifacts.
required_templates=(README.md checklist.md docs-to-read.md notes.md artifacts.md work-queue.md success-metrics.md progress-log.md final-report.md artifact-map.md rankings.md)
for f in "${required_templates[@]}"; do
  [[ -f "$box_root/.plans/_template/${f}" ]] || fail "Missing: .plans/_template/${f}"
  [[ -f "$box_root/_template/.plans/_template/${f}" ]] || fail "Missing: _template/.plans/_template/${f}"
done
note "Plan templates present (live + _template)"

# 6) Deep Research prompt library should live under the agent package.
dr_context_pack="$box_root/agents/deep-research/prompts/context-pack.md"
dr_library_dir="$box_root/agents/deep-research/prompts/library"
[[ -f "$dr_context_pack" ]] || fail "Missing: agents/deep-research/prompts/context-pack.md"
[[ -d "$dr_library_dir" ]] || fail "Missing: agents/deep-research/prompts/library/"
if ! find "$dr_library_dir" -maxdepth 1 -type f -name '[0-9][0-9]-*.md' -print | grep -q .; then
  fail "Missing: agents/deep-research/prompts/library/<numbered prompt>.md"
fi
note "Deep Research prompt library ok (agent-local)"

echo "All checks passed."
