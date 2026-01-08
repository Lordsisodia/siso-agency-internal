#!/usr/bin/env bash
set -euo pipefail

# Lightweight hygiene checks for `docs/.blackbox/`.
#
# Run from repo root:
#   ./docs/.blackbox/scripts/check-blackbox.sh
# Or from within docs/:
#   ./.blackbox/scripts/check-blackbox.sh

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

note() {
  echo "OK: $*"
}

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"
repo_root="$(cd "$docs_root/.." && pwd)"
box_root="$docs_root/.blackbox"

[[ -d "$box_root" ]] || fail "Missing .blackbox directory: $box_root"

echo "Blackbox check: $box_root"

# 1) Required core files.
required_files=(
  "$box_root/protocol.md"
  "$box_root/context.md"
  "$box_root/tasks.md"
  "$box_root/journal.md"
  "$box_root/scratchpad.md"
  "$box_root/manifest.yaml"
  "$box_root/README.md"

  "$box_root/domains/_map.md"
  "$box_root/domains/README.md"

  "$box_root/.agents/README.md"
  "$box_root/.agents/research-grouping/agent.md"
  "$box_root/.agents/research-grouping/manifest.yaml"
  "$box_root/.agents/selection-planner/templates/issue_plan.md"

  "$box_root/.runs/README.md"
  "$box_root/.runs/ACTIVE_RUN"
)
for f in "${required_files[@]}"; do
  [[ -f "$f" ]] || fail "Missing required file: ${f#$repo_root/}"
done
note "Core files present"

# 2) Canonical routing + ledger (so docs stay navigable).
required_docs_files=(
  "$docs_root/process/docs-ledger.md"
  "$docs_root/process/information-routing.md"
)
for f in "${required_docs_files[@]}"; do
  [[ -f "$f" ]] || fail "Missing required docs file: ${f#$repo_root/}"
done
note "Docs routing + ledger present (docs/process)"

# 3) Pointer files should reference canonical locations (avoid split-brain).
ledger_pointer="$box_root/docs-ledger.md"
[[ -f "$ledger_pointer" ]] || fail "Missing pointer: ${ledger_pointer#$repo_root/}"
grep -Fq "docs/process/docs-ledger.md" "$ledger_pointer" || fail "docs-ledger pointer missing canonical path: ${ledger_pointer#$repo_root/}"

routing_pointer="$box_root/information-routing.md"
[[ -f "$routing_pointer" ]] || fail "Missing pointer: ${routing_pointer#$repo_root/}"
grep -Fq "docs/process/information-routing.md" "$routing_pointer" || fail "information-routing pointer missing canonical path: ${routing_pointer#$repo_root/}"
note "Pointer files reference canonical docs"

# 4) Prompt packs live in `.prompts/` (inputs to long runs).
prompts_dir="$box_root/.prompts"
[[ -d "$prompts_dir" ]] || fail "Missing: ${prompts_dir#$repo_root/}"
if find "$prompts_dir" -mindepth 1 -maxdepth 1 -type d -print | grep -q .; then
  echo "Found directories under .prompts/:" >&2
  find "$prompts_dir" -mindepth 1 -maxdepth 1 -type d -print >&2
  fail ".prompts/ should be flat (markdown prompt packs only)"
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

# 5) `.skills/` should be flat: README.md + *.md only.
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

# 6) Scripts with a shebang should be executable (avoids "permission denied").
check_exec_dir() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    return 0
  fi
  while IFS= read -r -d '' f; do
    if head -n 1 "$f" | grep -q '^#!'; then
      if [[ ! -x "$f" ]]; then
        fail "Script is not executable: ${f#$repo_root/} (run ./.blackbox/scripts/fix-perms.sh)"
      fi
    fi
  done < <(find "$dir" -maxdepth 1 -type f -print0)
}

check_exec_dir "$box_root/scripts"
note "Scripts are executable"

active_run_id="$(cat "$box_root/.runs/ACTIVE_RUN" | tr -d '\n' | tr -d '\r')"
if [[ -z "$active_run_id" ]]; then
  fail "ACTIVE_RUN is empty: ${box_root#$repo_root/}/.runs/ACTIVE_RUN"
fi
if [[ ! -d "$box_root/.runs/$active_run_id" ]]; then
  fail "ACTIVE_RUN points to missing folder: ${box_root#$repo_root/}/.runs/$active_run_id"
fi
note "ACTIVE_RUN points to an existing run"

echo "All checks passed."
