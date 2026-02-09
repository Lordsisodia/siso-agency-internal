#!/bin/bash
#
# Blackbox4 PRD Generator Wrapper Script
# Easy CLI interface for PRD generation
#

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_SCRIPT="$SCRIPT_DIR/4-scripts/prd-templates/generate_prd.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print usage
usage() {
    cat << EOF
${BLUE}Blackbox4 PRD Generator${NC}

Generate Product Requirements Documents from spec data.

${YELLOW}Usage:${NC}
    $0 [COMMAND] [OPTIONS]

${YELLOW}Commands:${NC}
    generate    Generate a PRD from spec data
    validate    Validate spec for PRD generation
    list        List available templates
    help        Show this help message

${YELLOW}Generate Command:${NC}
    $0 generate --spec <path> --template <name> --output <path> [OPTIONS]

${YELLOW}Options:${NC}
    --spec, -s          Path to spec JSON file or directory (required)
    --template, -t      Template name: web-app, mobile-app, api-service, fullstack (required)
    --output, -o        Output PRD file path (required)
    --var               Custom template variable (KEY=VALUE) (optional)
    --verbose, -v       Enable verbose output

${YELLOW}Examples:${NC}
    # Generate a web app PRD
    $0 generate \\
        --spec .plans/my-project/spec.json \\
        --template web-app \\
        --output prd.md

    # Generate with custom variables
    $0 generate \\
        --spec spec.json \\
        --template fullstack \\
        --output prd.md \\
        --var "STATUS=In Progress" \\
        --var "VERSION=2.0.0"

    # Validate spec before generating
    $0 validate --spec .plans/my-project/spec.json

    # List available templates
    $0 list

${YELLOW}Templates:${NC}
    web-app         Web application (SPA, PWA, SSR)
    mobile-app      Mobile application (iOS, Android, Cross-platform)
    api-service     API/Service (REST, GraphQL, Microservice)
    fullstack       Full-stack project (Frontend + Backend + Database)

${YELLOW}Integration:${NC}
    Works seamlessly with spec-creation library:
    1. Create spec: ./spec-create.sh --project "my-project"
    2. Generate PRD: ./generate-prd.sh --spec .plans/my-project/spec.json \\
                     --template web-app --output prd.md

EOF
}

# Print error message
error() {
    echo -e "${RED}Error:${NC} $1" >&2
    exit 1
}

# Print success message
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Print warning message
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Print info message
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Python script exists
check_prd_script() {
    if [ ! -f "$PRD_SCRIPT" ]; then
        error "PRD generator script not found at: $PRD_SCRIPT"
    fi

    if [ ! -x "$PRD_SCRIPT" ]; then
        info "Making PRD generator script executable..."
        chmod +x "$PRD_SCRIPT"
    fi
}

# Validate command arguments
validate_generate_args() {
    if [ -z "$SPEC_PATH" ]; then
        error "--spec argument is required for generate command"
    fi

    if [ -z "$TEMPLATE_NAME" ]; then
        error "--template argument is required for generate command"
    fi

    if [ -z "$OUTPUT_PATH" ]; then
        error "--output argument is required for generate command"
    fi

    # Check if spec exists
    if [ ! -e "$SPEC_PATH" ]; then
        error "Spec path does not exist: $SPEC_PATH"
    fi
}

# Validate command arguments
validate_validate_args() {
    if [ -z "$SPEC_PATH" ]; then
        error "--spec argument is required for validate command"
    fi

    # Check if spec exists
    if [ ! -e "$SPEC_PATH" ]; then
        error "Spec path does not exist: $SPEC_PATH"
    fi
}

# Generate PRD
cmd_generate() {
    info "Generating PRD..."
    echo ""

    # Build command
    CMD="python3 \"$PRD_SCRIPT\" generate --spec \"$SPEC_PATH\" --template \"$TEMPLATE_NAME\" --output \"$OUTPUT_PATH\""

    # Add custom variables
    if [ ${#CUSTOM_VARS[@]} -gt 0 ]; then
        for var in "${CUSTOM_VARS[@]}"; do
            CMD="$CMD --var \"$var\""
        done
    fi

    # Execute command
    if [ "$VERBOSE" = true ]; then
        info "Running: $CMD"
        echo ""
    fi

    eval $CMD

    if [ $? -eq 0 ]; then
        echo ""
        success "PRD generated successfully!"
        echo ""
        info "Output: $OUTPUT_PATH"
        echo ""
        info "Next steps:"
        echo "  1. Review the generated PRD"
        echo "  2. Fill in any unfilled placeholders"
        echo "  3. Customize sections as needed"
        echo "  4. Share with stakeholders for feedback"
    else
        error "PRD generation failed"
    fi
}

# Validate spec
cmd_validate() {
    info "Validating spec..."
    echo ""

    CMD="python3 \"$PRD_SCRIPT\" validate --spec \"$SPEC_PATH\""

    if [ "$VERBOSE" = true ]; then
        info "Running: $CMD"
        echo ""
    fi

    eval $CMD

    if [ $? -eq 0 ]; then
        echo ""
        success "Spec is valid!"
        echo ""
        info "You can now generate a PRD with:"
        echo "  $0 generate --spec \"$SPEC_PATH\" --template <name> --output prd.md"
    else
        error "Spec validation failed"
    fi
}

# List templates
cmd_list() {
    info "Available PRD Templates"
    echo "======================"
    echo ""

    python3 "$PRD_SCRIPT" template-list
}

# Main script
main() {
    # Check if PRD script exists
    check_prd_script

    # Parse command
    COMMAND=${1:-}
    shift || true

    case "$COMMAND" in
        generate)
            # Parse arguments
            while [[ $# -gt 0 ]]; do
                case $1 in
                    --spec|-s)
                        SPEC_PATH="$2"
                        shift 2
                        ;;
                    --template|-t)
                        TEMPLATE_NAME="$2"
                        shift 2
                        ;;
                    --output|-o)
                        OUTPUT_PATH="$2"
                        shift 2
                        ;;
                    --var)
                        CUSTOM_VARS+=("$2")
                        shift 2
                        ;;
                    --verbose|-v)
                        VERBOSE=true
                        shift
                        ;;
                    *)
                        error "Unknown option: $1"
                        ;;
                esac
            done

            validate_generate_args
            cmd_generate
            ;;

        validate)
            # Parse arguments
            while [[ $# -gt 0 ]]; do
                case $1 in
                    --spec|-s)
                        SPEC_PATH="$2"
                        shift 2
                        ;;
                    --verbose|-v)
                        VERBOSE=true
                        shift
                        ;;
                    *)
                        error "Unknown option: $1"
                        ;;
                esac
            done

            validate_validate_args
            cmd_validate
            ;;

        list|templates)
            cmd_list
            ;;

        help|--help|-h)
            usage
            exit 0
            ;;

        "")
            usage
            exit 0
            ;;

        *)
            error "Unknown command: $COMMAND"
            ;;
    esac
}

# Run main
main "$@"
