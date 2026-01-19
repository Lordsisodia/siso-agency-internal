#!/usr/bin/env bash
set -euo pipefail

# Fix common executable permission issues in docs/.blackbox.
#
# Why:
# - new scripts sometimes land without +x
# - this causes confusing "permission denied" failures during long runs
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/fix-perms.sh
# Or from within docs/:
#   ./.blackbox/4-scripts/fix-perms.sh

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"
box_root="$docs_root/.blackbox"

if [[ ! -d "$box_root" ]]; then
  echo "ERROR: Missing docs/.blackbox at: $box_root" >&2
  exit 1
fi

fix_dir() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    return 0
  fi
  local count=0
  while IFS= read -r -d '' f; do
    # Only touch files that have a shebang.
    if head -n 1 "$f" | grep -q '^#!'; then
      if [[ ! -x "$f" ]]; then
        chmod +x "$f"
        count=$((count + 1))
      fi
    fi
  done < <(find "$dir" -maxdepth 1 -type f -print0)
  echo "Fixed executable bits in ${dir#$docs_root/}: $count"
}

fix_dir "$box_root/scripts"
fix_dir "$box_root/_template/scripts"

echo "Done."

