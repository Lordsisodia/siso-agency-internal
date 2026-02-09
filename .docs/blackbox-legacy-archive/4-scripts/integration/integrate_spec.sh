#!/usr/bin/env bash
#
# Spec Integration Wrapper
# Main integration script for spec operations
#
# This script provides an easy command interface for all spec integration
# operations, routing to the appropriate sub-scripts.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="${SCRIPT_DIR}/../lib"
PYTHON_BIN="${PYTHON_BIN:-python3}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show help
show_help() {
    cat << EOF
Blackbox4 Spec Integration

Usage: $0 <command> [args]

Commands:
  create <project>           Create a new specification
  validate <spec-file>       Validate an existing specification
  spec-to-plan <spec> <dir>  Convert spec to hierarchical plan
  plan-to-spec <plan> <dir>  Convert plan to specification
  context <subcommand>       Context-aware spec operations
  handoff <subcommand>       Handoff integration operations
  cli <args>                 Unified spec CLI
  question <spec-file>       Run questioning workflow
  generate <requirement>     Generate spec from requirement

Integration Subcommands:
  context create-spec        Create context-aware spec
  context validate           Validate spec context
  context filter             Filter spec by context
  context enhance            Enhance spec with context

  handoff create             Create spec during handoff
  handoff package            Package spec for handoff
  handoff load               Load spec from handoff
  handoff continue           Create continuation spec

Examples:
  # Create a new spec
  $0 create my-project --interactive

  # Convert spec to plan
  $0 spec-to-plan .specs/my-spec.json .plans/my-project

  # Convert plan to spec
  $0 plan-to-spec .plans/my-project .specs

  # Run questioning workflow
  $0 question .specs/my-spec.json

  # Create context-aware spec
  $0 context create-spec --project my-app --tenant tenant-1

  # Package spec for handoff
  $0 handoff package .specs/my-spec.json --from agent-1 --to agent-2

  # Use unified CLI
  $0 cli create my-project --interactive
  $0 cli validate .specs/my-spec.json
  $0 cli list --verbose

For more help on a specific command:
  $0 <command> --help
  $0 cli --help
EOF
}

# Check Python availability
check_python() {
    if ! command -v "$PYTHON_BIN" &> /dev/null; then
        log_error "Python not found: $PYTHON_BIN"
        log_info "Install Python or set PYTHON_BIN environment variable"
        exit 1
    fi
}

# Create spec
create_spec() {
    check_python

    local project="$1"
    shift

    log_info "Creating spec for: $project"

    "$PYTHON_BIN" "${SCRIPT_DIR}/spec_cli.py" create "$project" "$@"
}

# Validate spec
validate_spec() {
    check_python

    local spec_file="$1"
    shift

    log_info "Validating spec: $spec_file"

    "$PYTHON_BIN" "${SCRIPT_DIR}/spec_cli.py" validate "$spec_file" "$@"
}

# Spec to plan conversion
spec_to_plan() {
    check_python

    local spec_file="$1"
    local plan_dir="$2"
    shift 2

    log_info "Converting spec to plan: $spec_file -> $plan_dir"

    "$PYTHON_BIN" "${SCRIPT_DIR}/spec_to_plan.py" "$spec_file" "$plan_dir" "$@"
}

# Plan to spec conversion
plan_to_spec() {
    check_python

    local plan_dir="$1"
    local output_dir="$2"
    shift 2

    log_info "Converting plan to spec: $plan_dir -> $output_dir"

    "$PYTHON_BIN" "${SCRIPT_DIR}/plan_to_spec.py" "$plan_dir" "$output_dir" "$@"
}

# Context-aware operations
context_ops() {
    check_python

    local subcommand="$1"
    shift

    log_info "Context operation: $subcommand"

    "$PYTHON_BIN" "${SCRIPT_DIR}/context_aware_spec.py" "$subcommand" "$@"
}

# Handoff operations
handoff_ops() {
    check_python

    local subcommand="$1"
    shift

    log_info "Handoff operation: $subcommand"

    "$PYTHON_BIN" "${SCRIPT_DIR}/handoff_to_spec.py" "$subcommand" "$@"
}

# Questioning workflow
question_workflow() {
    check_python

    local spec_file="$1"
    shift

    log_info "Running questioning workflow: $spec_file"

    "$PYTHON_BIN" "${SCRIPT_DIR}/spec_cli.py" question "$spec_file" "$@"
}

# Generate spec from requirement
generate_spec() {
    check_python

    local requirement="$1"
    shift

    log_info "Generating spec from requirement"

    "$PYTHON_BIN" "${SCRIPT_DIR}/spec_cli.py" generate "$requirement" "$@"
}

# Unified CLI
unified_cli() {
    check_python

    "$PYTHON_BIN" "${SCRIPT_DIR}/spec_cli.py" "$@"
}

# Main
main() {
    local command="${1:-help}"

    case "$command" in
        create)
            if [[ $# -lt 2 ]]; then
                log_error "Usage: $0 create <project> [args]"
                exit 1
            fi
            shift
            create_spec "$@"
            ;;
        validate)
            if [[ $# -lt 2 ]]; then
                log_error "Usage: $0 validate <spec-file> [args]"
                exit 1
            fi
            shift
            validate_spec "$@"
            ;;
        spec-to-plan)
            if [[ $# -lt 3 ]]; then
                log_error "Usage: $0 spec-to-plan <spec-file> <plan-dir> [args]"
                exit 1
            fi
            shift
            spec_to_plan "$@"
            ;;
        plan-to-spec)
            if [[ $# -lt 3 ]]; then
                log_error "Usage: $0 plan-to-spec <plan-dir> <output-dir> [args]"
                exit 1
            fi
            shift
            plan_to_spec "$@"
            ;;
        context)
            if [[ $# -lt 2 ]]; then
                log_error "Usage: $0 context <subcommand> [args]"
                exit 1
            fi
            shift
            context_ops "$@"
            ;;
        handoff)
            if [[ $# -lt 2 ]]; then
                log_error "Usage: $0 handoff <subcommand> [args]"
                exit 1
            fi
            shift
            handoff_ops "$@"
            ;;
        cli)
            shift
            unified_cli "$@"
            ;;
        question)
            if [[ $# -lt 2 ]]; then
                log_error "Usage: $0 question <spec-file> [args]"
                exit 1
            fi
            shift
            question_workflow "$@"
            ;;
        generate)
            if [[ $# -lt 2 ]]; then
                log_error "Usage: $0 generate <requirement> [args]"
                exit 1
            fi
            shift
            generate_spec "$@"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
