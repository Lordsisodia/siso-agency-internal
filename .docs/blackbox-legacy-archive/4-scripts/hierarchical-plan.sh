#!/usr/bin/env bash
# Blackbox4 Hierarchical Plan Wrapper
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/4-scripts/planning/lib/hierarchical-tasks/hierarchical_task.py" "$@"
