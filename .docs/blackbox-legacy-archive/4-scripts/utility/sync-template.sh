#!/usr/bin/env bash
set -euo pipefail

# Sync the copy-ready template from the current live docs/.blackbox.
#
# Why:
# - check-blackbox.sh enforces that live 4-scripts/templates match _template
# - During iteration it's easy to update only one side
# - This script makes it a 1-command fix: live -> _template
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/sync-template.sh
# Or from within docs/:
#   ./.blackbox/4-scripts/sync-template.sh

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"
box_root="$docs_root/.blackbox"

usage() {
  cat <<'EOF' >&2
Usage:
  sync-template.sh [--dry-run] [--with-core] [--with-agents] [--prune]

Defaults:
  - Sync scripts + plan template files (live -> _template)

Flags:
  --dry-run     Print actions but do not modify files
  --with-core   Also sync core files (README/context/tasks/journal/etc)
  --with-agents Also sync agents/ and schemas/ directories
  --prune       Delete template files that no longer exist in live (scripts + plan templates only)
EOF
}

dry_run=false
with_core=false
with_agents=false
prune=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=true
      shift || true
      ;;
    --with-core)
      with_core=true
      shift || true
      ;;
    --with-agents)
      with_agents=true
      shift || true
      ;;
    --prune)
      prune=true
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

if [[ ! -d "$box_root" ]]; then
  echo "ERROR: Missing docs/.blackbox at: $box_root" >&2
  exit 1
fi

src="$box_root"
dst="$box_root/_template"

if [[ ! -d "$dst" ]]; then
  echo "ERROR: Missing template directory: $dst" >&2
  exit 1
fi

copy_file() {
  local from="$1"
  local to="$2"
  if [[ "$dry_run" == "true" ]]; then
    echo "- copy: ${from#$docs_root/} -> ${to#$docs_root/}"
    return 0
  fi
  mkdir -p "$(dirname "$to")"
  cp -p "$from" "$to"
}

maybe_delete() {
  local path="$1"
  if [[ "$prune" != "true" ]]; then
    return 0
  fi
  if [[ "$dry_run" == "true" ]]; then
    echo "- delete: ${path#$docs_root/}"
    return 0
  fi
  rm -f "$path"
}

echo "Syncing template from live:"
echo "- from: $src"
echo "- to:   $dst"
echo "- dry_run: $dry_run"
echo "- with_core: $with_core"
echo "- with_agents: $with_agents"
echo "- prune: $prune"

mkdir -p "$dst/scripts"
mkdir -p "$dst/.plans/_template"

# Scripts: copy file-by-file so deleted files can be detected manually.
for f in "$src/4-scripts/"*; do
  [[ -f "$f" ]] || continue
  base="$(basename "$f")"
  copy_file "$f" "$dst/4-scripts/$base"
done

# Plan template files
for f in "$src/.plans/_template/"*; do
  [[ -f "$f" ]] || continue
  base="$(basename "$f")"
  copy_file "$f" "$dst/.plans/_template/$base"
done

if [[ "$with_core" == "true" ]]; then
  # Core/pointer docs
  for f in README.md context.md docs-ledger.md information-routing.md tasks.md journal.md scratchpad.md manifest.yaml MAINTENANCE.md; do
    if [[ -f "$src/$f" ]]; then
      copy_file "$src/$f" "$dst/$f"
    fi
  done
fi

if [[ "$with_agents" == "true" ]]; then
  # Keep it simple: copy directories wholesale (no prune).
  for d in agents schemas; do
    if [[ -d "$src/$d" ]]; then
      if [[ "$dry_run" == "true" ]]; then
        echo "- sync-dir: ${src#$docs_root/}/$d -> ${dst#$docs_root/}/$d"
      else
        rm -rf "$dst/$d"
        cp -R "$src/$d" "$dst/$d"
      fi
    fi
  done
fi

if [[ "$prune" == "true" ]]; then
  # Prune extra template scripts and plan template files (only).
  for f in "$dst/4-scripts/"*; do
    [[ -f "$f" ]] || continue
    base="$(basename "$f")"
    if [[ ! -f "$src/4-scripts/$base" ]]; then
      maybe_delete "$f"
    fi
  done
  for f in "$dst/.plans/_template/"*; do
    [[ -f "$f" ]] || continue
    base="$(basename "$f")"
    if [[ ! -f "$src/.plans/_template/$base" ]]; then
      maybe_delete "$f"
    fi
  done
fi

extra_scripts="$(find "$dst/scripts" -maxdepth 1 -type f -print | while read -r p; do b="$(basename "$p")"; [[ -f "$src/4-scripts/$b" ]] || echo "$b"; done)"
if [[ -n "$extra_scripts" && "$prune" != "true" ]]; then
  echo "WARN: template contains scripts not present in live (use --prune to remove):" >&2
  echo "$extra_scripts" | sed 's/^/- /' >&2
fi

echo "Done."
echo "Next: run ./docs/.blackbox/4-scripts/check-blackbox.sh to verify."
