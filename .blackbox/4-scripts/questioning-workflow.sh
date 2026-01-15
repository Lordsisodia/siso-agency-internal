#!/usr/bin/env bash
#
# questioning-workflow.sh - Wrapper script for Blackbox4 Questioning Workflow
#
# Usage:
#   ./questioning-workflow.sh start --spec <path> [--type <type>]
#   ./questioning-workflow.sh continue --session <id> --spec <path>
#   ./questioning-workflow.sh list
#   ./questioning-workflow.sh export --session <id> --spec <path> [--output <path>]

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Import shared library
# shellcheck source=4-scripts/lib.sh
source "${SCRIPT_DIR}/4-scripts/lib.sh"

# Default values
SPEC_TYPE="${SPEC_TYPE:-general}"
PYTHON_CMD="${PYTHON_CMD:-python3}"

# Helper functions
print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║     Blackbox4 Questioning Workflow                        ║"
    echo "║     Sequential Questioning for Spec Improvement           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
}

print_usage() {
    cat << EOF
Usage: questioning-workflow.sh <command> [options]

Commands:
  start       Start a new questioning session
  continue    Resume an existing session
  list        List all questioning sessions
  export      Export session transcript

Options:
  --spec <path>     Path to spec JSON file (required for start, continue, export)
  --session <id>    Session ID (required for continue, export)
  --type <type>     Spec type: webapp, mobile, api, general (default: general)
  --output <path>   Output path for export (default: transcript-<id>.md)
  --help            Show this help message

Examples:
  # Start new session
  ./questioning-workflow.sh start --spec .plans/my-project/spec.json --type webapp

  # Continue session
  ./questioning-workflow.sh continue --session abc123 --spec .plans/my-project/spec.json

  # List sessions
  ./questioning-workflow.sh list

  # Export transcript
  ./questioning-workflow.sh export --session abc123 --spec .plans/my-project/spec.json

  # Run gap analysis
  ./questioning-workflow.sh analyze --spec .plans/my-project/spec.json

EOF
}

# Command handlers
cmd_start() {
    local spec_path="$1"
    local spec_type="$2"

    info "Starting questioning session..."
    info "Spec: $spec_path"
    info "Type: $spec_type"

    # Verify spec exists
    if [[ ! -f "$spec_path" ]]; then
        error "Spec file not found: $spec_path"
        exit 1
    fi

    # Run interactive session
    "${PYTHON_CMD}" "${SCRIPT_DIR}/4-scripts/questioning/interactive_questions.py" \
        start \
        --spec "$spec_path" \
        --type "$spec_type"
}

cmd_continue() {
    local session_id="$1"
    local spec_path="$2"

    info "Resuming questioning session..."
    info "Session: $session_id"
    info "Spec: $spec_path"

    # Verify spec exists
    if [[ ! -f "$spec_path" ]]; then
        error "Spec file not found: $spec_path"
        exit 1
    fi

    # Run interactive session
    "${PYTHON_CMD}" "${SCRIPT_DIR}/4-scripts/questioning/interactive_questions.py" \
        continue \
        --spec "$spec_path" \
        --session "$session_id"
}

cmd_list() {
    info "Listing questioning sessions..."
    echo ""

    "${PYTHON_CMD}" "${SCRIPT_DIR}/4-scripts/questioning/questioning_workflow.py" \
        list
}

cmd_export() {
    local session_id="$1"
    local spec_path="$2"
    local output_path="$3"

    info "Exporting session transcript..."
    info "Session: $session_id"

    # Verify spec exists
    if [[ ! -f "$spec_path" ]]; then
        error "Spec file not found: $spec_path"
        exit 1
    fi

    # Export transcript
    "${PYTHON_CMD}" "${SCRIPT_DIR}/4-scripts/questioning/questioning_workflow.py" \
        export \
        --spec "$spec_path" \
        --session "$session_id" \
        --output "$output_path"
}

cmd_analyze() {
    local spec_path="$1"
    local output_file="$2"
    local show_questions="${3:-false}"

    info "Analyzing spec for gaps..."
    info "Spec: $spec_path"

    # Verify spec exists
    if [[ ! -f "$spec_path" ]]; then
        error "Spec file not found: $spec_path"
        exit 1
    fi

    # Build command
    local cmd=("${PYTHON_CMD}" "${SCRIPT_DIR}/4-scripts/questioning/gap_analysis.py")

    if [[ -n "$output_file" ]]; then
        cmd+=(--output "$output_file")
    fi

    if [[ "$show_questions" == "true" ]]; then
        cmd+=(--questions)
    fi

    cmd+=("$spec_path")

    # Run analysis
    "${cmd[@]}"
}

# Main script
main() {
    local command=""
    local spec_path=""
    local session_id=""
    local spec_type="$SPEC_TYPE"
    local output_path=""
    local show_questions="false"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            start|continue|list|export|analyze)
                command="$1"
                shift
                ;;
            --spec)
                spec_path="$2"
                shift 2
                ;;
            --session)
                session_id="$2"
                shift 2
                ;;
            --type)
                spec_type="$2"
                shift 2
                ;;
            --output)
                output_path="$2"
                shift 2
                ;;
            --questions)
                show_questions="true"
                shift
                ;;
            --help|-h)
                print_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done

    # Check if command provided
    if [[ -z "$command" ]]; then
        error "No command specified"
        print_usage
        exit 1
    fi

    # Validate Python
    if ! command_exists "$PYTHON_CMD"; then
        error "Python not found. Please install Python 3 or set PYTHON_CMD"
        exit 1
    fi

    # Execute command
    print_header

    case "$command" in
        start)
            if [[ -z "$spec_path" ]]; then
                error "--spec is required for start command"
                print_usage
                exit 1
            fi
            cmd_start "$spec_path" "$spec_type"
            ;;
        continue)
            if [[ -z "$session_id" ]] || [[ -z "$spec_path" ]]; then
                error "--session and --spec are required for continue command"
                print_usage
                exit 1
            fi
            cmd_continue "$session_id" "$spec_path"
            ;;
        list)
            cmd_list
            ;;
        export)
            if [[ -z "$session_id" ]] || [[ -z "$spec_path" ]]; then
                error "--session and --spec are required for export command"
                print_usage
                exit 1
            fi

            # Generate default output path if not provided
            if [[ -z "$output_path" ]]; then
                output_path="transcript-${session_id}.md"
            fi

            cmd_export "$session_id" "$spec_path" "$output_path"
            ;;
        analyze)
            if [[ -z "$spec_path" ]]; then
                error "--spec is required for analyze command"
                print_usage
                exit 1
            fi
            cmd_analyze "$spec_path" "$output_path" "$show_questions"
            ;;
        *)
            error "Unknown command: $command"
            print_usage
            exit 1
            ;;
    esac
}

# Run main
main "$@"
