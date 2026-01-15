#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <goal/title...>" >&2
  exit 1
fi

goal="$*"
timestamp_dir="$(now_timestamp_dir)"
timestamp_human="$(now_timestamp_human)"

slug="$(slugify "$goal")"

dest=".blackbox/.plans/${timestamp_dir}_${slug}"
template_dir=".blackbox/.plans/_template"

if [[ -e "$dest" ]]; then
  echo "Plan already exists: $dest" >&2
  exit 1
fi

mkdir -p "$dest"
cp -R "$template_dir"/. "$dest/"

if [[ -f "$dest/README.md" ]]; then
  sed_inplace "s/<short title>/${goal//\//\\/}/g" "$dest/README.md"
  sed_inplace "s/<YYYY-MM-DD HH:MM>/${timestamp_human}/g" "$dest/README.md"
fi

# Seed status timestamp if present.
if [[ -f "$dest/status.md" ]]; then
  sed_inplace "s/<YYYY-MM-DD HH:MM>/${timestamp_human}/g" "$dest/status.md"
fi

echo "Created plan: $dest"
