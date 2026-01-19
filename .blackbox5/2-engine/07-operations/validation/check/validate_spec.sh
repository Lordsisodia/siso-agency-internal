#!/bin/bash
#
# validate_spec.sh - Wrapper script for Blackbox4 validation system
# Provides easy CLI interface for validation operations
#

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLACKBOX4_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Default values
COMMAND="validate"
FORMAT="text"
OUTPUT=""
PROJECT_DIR=""
ARTIFACTS_DIR=""
DRY_RUN=false
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help function
show_help() {
    cat << EOF
Blackbox4 Validation System

Usage: $0 [COMMAND] [OPTIONS]

Commands:
  validate       Validate a spec file (default)
  cross-artifact Validate across multiple artifacts
  report         Generate validation report
  auto-fix       Automatically fix common issues
  all            Run all validations

Options:
  -p, --project DIR      Project directory containing artifacts
  -a, --artifacts DIR    Artifacts directory
  -s, --spec FILE        Spec file to validate
  -f, --format FORMAT    Output format: text, json, html, markdown (default: text)
  -o, --output FILE      Output file for report
  -d, --dry-run          Show what would be done without making changes
  -v, --verbose          Enable verbose output
  -h, --help             Show this help message

Examples:
  # Validate a spec file
  $0 validate -s my-spec.json

  # Validate and generate HTML report
  $0 validate -s my-spec.json -f html -o report.html

  # Run cross-artifact validation
  $0 cross-artifact -p .plans/my-project

  # Auto-fix issues
  $0 auto-fix -s my-spec.json -o fixed-spec.json

  # Generate all report formats
  $0 report -s my-spec.json -f all -o validation_report

  # Dry run auto-fix
  $0 auto-fix -s my-spec.json --dry-run

Exit Codes:
  0    Success (no critical issues)
  1    Validation failed (critical issues found)
  2    Error in execution

For more information, see: .blackbox4/4-scripts/validation/README.md
EOF
}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "[DEBUG] $1"
    fi
}

# Validate prerequisites
check_prerequisites() {
    log_verbose "Checking prerequisites..."

    # Check Python 3
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed"
        exit 2
    fi

    # Check if validation modules exist
    if [ ! -f "$SCRIPT_DIR/spec_validator.py" ]; then
        log_error "spec_validator.py not found in $SCRIPT_DIR"
        exit 2
    fi

    log_verbose "Prerequisites check passed"
}

# Run spec validation
run_validate() {
    local spec_file="$1"

    if [ ! -f "$spec_file" ]; then
        log_error "Spec file not found: $spec_file"
        exit 2
    fi

    log_info "Validating spec: $spec_file"

    # Build output arguments
    local output_args=""
    if [ -n "$OUTPUT" ]; then
        output_args="--output $OUTPUT"
    fi

    # Run validation
    python3 "$SCRIPT_DIR/spec_validator.py" "$spec_file" \
        --format "$FORMAT" \
        $output_args

    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        log_success "Validation passed"
    else
        log_warning "Validation failed with issues"
    fi

    return $exit_code
}

# Run cross-artifact validation
run_cross_artifact() {
    local artifacts_dir="$1"

    if [ ! -d "$artifacts_dir" ]; then
        log_error "Artifacts directory not found: $artifacts_dir"
        exit 2
    fi

    log_info "Running cross-artifact validation on: $artifacts_dir"

    # Build output arguments
    local output_args=""
    if [ -n "$OUTPUT" ]; then
        output_args="--output $OUTPUT"
    fi

    # Run cross-artifact validation
    python3 "$SCRIPT_DIR/cross_artifact_validator.py" \
        --artifacts-dir "$artifacts_dir" \
        --validate all \
        $output_args

    return $?
}

# Generate validation report
run_report() {
    local spec_file="$1"

    if [ ! -f "$spec_file" ]; then
        log_error "Spec file not found: $spec_file"
        exit 2
    fi

    log_info "Generating validation report for: $spec_file"

    # Build output arguments
    local output_args=""
    if [ -n "$OUTPUT" ]; then
        output_args="--output $OUTPUT"
    fi

    # Run report generation
    python3 "$SCRIPT_DIR/validation_report.py" \
        --format "$FORMAT" \
        $output_args

    log_success "Report generated"
    return 0
}

# Run auto-fix
run_auto_fix() {
    local spec_file="$1"

    if [ ! -f "$spec_file" ]; then
        log_error "Spec file not found: $spec_file"
        exit 2
    fi

    log_info "Running auto-fix on: $spec_file"

    # Build arguments
    local dry_run_args=""
    if [ "$DRY_RUN" = true ]; then
        dry_run_args="--dry-run"
        log_warning "Dry run mode - no changes will be made"
    fi

    local output_args=""
    if [ -n "$OUTPUT" ]; then
        output_args="--output $OUTPUT"
    fi

    local report_args=""
    local report_file="${OUTPUT%.json}_fix_report.json"
    if [ -n "$OUTPUT" ]; then
        report_args="--report $report_file"
    fi

    # Run auto-fix
    python3 "$SCRIPT_DIR/auto_fix.py" \
        "$spec_file" \
        $dry_run_args \
        $output_args \
        $report_args

    log_success "Auto-fix completed"
    return 0
}

# Run all validations
run_all() {
    local project_dir="$1"

    if [ ! -d "$project_dir" ]; then
        log_error "Project directory not found: $project_dir"
        exit 2
    fi

    log_info "Running all validations on: $project_dir"

    # Find spec file
    local spec_file=$(find "$project_dir" -name "*-spec.json" -type f | head -1)
    if [ -z "$spec_file" ]; then
        log_error "No spec file found in $project_dir"
        exit 2
    fi

    log_info "Found spec file: $spec_file"

    # Run spec validation
    log_info "Step 1: Validating spec..."
    run_validate "$spec_file"

    # Run cross-artifact validation
    log_info "Step 2: Running cross-artifact validation..."
    run_cross_artifact "$project_dir"

    # Generate report
    if [ -n "$OUTPUT" ]; then
        log_info "Step 3: Generating validation report..."
        run_report "$spec_file"
    fi

    log_success "All validations completed"
    return 0
}

# Parse command-line arguments
parse_args() {
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    # First argument is command
    COMMAND="$1"
    shift

    # Parse options
    while [ $# -gt 0 ]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -p|--project)
                PROJECT_DIR="$2"
                shift 2
                ;;
            -a|--artifacts)
                ARTIFACTS_DIR="$2"
                shift 2
                ;;
            -s|--spec)
                SPEC_FILE="$2"
                shift 2
                ;;
            -f|--format)
                FORMAT="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT="$2"
                shift 2
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 2
                ;;
        esac
    done
}

# Main execution
main() {
    parse_args "$@"

    check_prerequisites

    # Use artifacts dir as project dir if project dir not set
    if [ -z "$PROJECT_DIR" ] && [ -n "$ARTIFACTS_DIR" ]; then
        PROJECT_DIR="$ARTIFACTS_DIR"
    fi

    # Execute command
    case $COMMAND in
        validate)
            if [ -z "$SPEC_FILE" ]; then
                log_error "Spec file required for validate command"
                show_help
                exit 2
            fi
            run_validate "$SPEC_FILE"
            ;;
        cross-artifact)
            if [ -z "$PROJECT_DIR" ] && [ -z "$ARTIFACTS_DIR" ]; then
                log_error "Project or artifacts directory required for cross-artifact validation"
                show_help
                exit 2
            fi
            run_cross_artifact "${PROJECT_DIR:-$ARTIFACTS_DIR}"
            ;;
        report)
            if [ -z "$SPEC_FILE" ]; then
                log_error "Spec file required for report command"
                show_help
                exit 2
            fi
            run_report "$SPEC_FILE"
            ;;
        auto-fix)
            if [ -z "$SPEC_FILE" ]; then
                log_error "Spec file required for auto-fix command"
                show_help
                exit 2
            fi
            run_auto_fix "$SPEC_FILE"
            ;;
        all)
            if [ -z "$PROJECT_DIR" ]; then
                log_error "Project directory required for 'all' command"
                show_help
                exit 2
            fi
            run_all "$PROJECT_DIR"
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            show_help
            exit 2
            ;;
    esac
}

# Run main
main "$@"
