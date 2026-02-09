#!/usr/bin/env bash
# Blackbox4 Hierarchical Step Creation Script
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PLAN_DIR="${SCRIPT_DIR}/../../.plans"

usage() {
    cat <<USAGE
Usage: new-step-hierarchical.sh [options] <step_name>

Creates a new step with hierarchical task support.

Options:
    -p, --parent <parent_step>    Parent step for hierarchical relationship
    -d, --description <desc>      Step description
    -t, --type <type>             Step type (default, feature, fix, refactor)
    -h, --help                    Show this help message

Examples:
    new-step-hierarchical.sh "Implement authentication"
    new-step-hierarchical.sh -p "setup" "Add database schema"
    new-step-hierarchical.sh -p "setup" -t feature "Add user model"

USAGE
    exit 1
}

PARENT=""
DESCRIPTION=""
TYPE="default"

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--parent)
            PARENT="$2"
            shift 2
            ;;
        -d|--description)
            DESCRIPTION="$2"
            shift 2
            ;;
        -t|--type)
            TYPE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            STEP_NAME="$1"
            shift
            ;;
    esac
done

if [[ -z "${STEP_NAME:-}" ]]; then
    usage
fi

# Create step identifier from name
STEP_ID=$(echo "$STEP_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
STEP_DIR="$PLAN_DIR/steps/$STEP_ID"

# Create step directory structure
mkdir -p "$STEP_DIR/tasks"

# Create step metadata
cat > "$STEP_DIR/metadata.yml" <<METADATA
name: "$STEP_NAME"
id: "$STEP_ID"
type: "$TYPE"
created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
parent: "${PARENT:-none}"
description: |
  ${DESCRIPTION:-No description provided}
METADATA

# Create main task file
cat > "$STEP_DIR/tasks/main.md" <<TASKS
# Tasks: $STEP_NAME

> Created: $(date -u +"%Y-%m-%d")
> Step ID: $STEP_ID
> Parent: ${PARENT:-none}

## Overview

${DESCRIPTION:-No description provided}

## Tasks

### Task 1
- [ ] Subtask 1.1
- [ ] Subtask 1.2

## Dependencies

- Dependency 1
- Dependency 2

## Completion Criteria

- [ ] Criterion 1
- [ ] Criterion 2
TASKS

echo "Created hierarchical step: $STEP_ID"
echo "Location: $STEP_DIR"
if [[ -n "$PARENT" ]]; then
    echo "Parent step: $PARENT"
fi
