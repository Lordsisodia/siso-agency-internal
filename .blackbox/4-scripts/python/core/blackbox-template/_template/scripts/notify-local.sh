#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: notify-local.sh \"message\"" >&2
  exit 1
fi

msg="$*"

# macOS: native notification (no dependencies)
if command -v osascript >/dev/null 2>&1; then
  osascript -e "display notification \"${msg//\"/\\\"}\" with title \"Lumelle Agent\""
  exit 0
fi

# Fallback: print to stdout
echo "$msg"

