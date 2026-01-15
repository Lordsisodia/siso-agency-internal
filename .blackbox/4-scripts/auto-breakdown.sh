#!/usr/bin/env bash
# Blackbox4 Task Auto-Breakdown Wrapper
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/4-scripts/lib/task-breakdown/write_tasks.py" "$@"
