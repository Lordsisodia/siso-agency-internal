#!/usr/bin/env bash
set -euo pipefail

slugify() {
  local input="$1"
  local slug
  slug="$(echo "$input" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
  if [[ -z "$slug" ]]; then
    echo "Could not derive a slug from: $input" >&2
    return 1
  fi
  echo "$slug"
}

sed_inplace() {
  local expr="$1"
  local file="$2"

  if sed --version >/dev/null 2>&1; then
    sed -i -e "$expr" "$file" 2>/dev/null || true
  else
    # macOS/BSD sed requires `-i ''` for in-place edits.
    sed -i '' -e "$expr" "$file" 2>/dev/null || true
  fi
}

now_timestamp_dir() {
  date '+%Y-%m-%d_%H%M'
}

now_timestamp_human() {
  date '+%Y-%m-%d %H:%M'
}

today_ymd() {
  date '+%Y-%m-%d'
}

