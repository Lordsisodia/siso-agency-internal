#!/usr/bin/env bash
# Action Plan Script
# Creates action plans and assigns agents for user tasks

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

# Default values
TASK_TYPE=""
COMPLEXITY=""
AUTO_CREATE_PLAN=true

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Usage
usage() {
  cat << EOF
${BLUE}Action Plan${NC} - Generate action plans and assign agents

${GREEN}Usage:${NC}
  $0 [OPTIONS] "Task description"

${GREEN}Options:${NC}
  -t, --type TYPE       Task type: feature, bugfix, research, refactor, docs
  -c, --complexity LEVEL Complexity: simple, moderate, complex, critical
  -n, --no-plan         Don't create plan folder automatically
  -h, --help            Show this help message

${GREEN}Examples:${NC}
  $0 "Add user authentication to the app"
  $0 -t feature "Create a new dashboard widget"
  $0 -t bugfix -c moderate "Fix the login bug"
  $0 -t research "Analyze competitor pricing strategies"

${GREEN}Task Types:${NC}
  feature     New functionality development
  bugfix      Bug investigation and fix
  research    Research and analysis
  refactor    Code refactoring
  docs        Documentation creation

${GREEN}Complexity Levels:${NC}
  simple      1 agent, 1-2 hours, < 5 steps
  moderate    2 agents, 2-4 hours, < 10 steps
  complex     3 agents, 4-8 hours, < 20 steps
  critical    Orchestrator, 8+ hours, 20+ steps

EOF
  exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--type)
      TASK_TYPE="$2"
      shift 2
      ;;
    -c|--complexity)
      COMPLEXITY="$2"
      shift 2
      ;;
    -n|--no-plan)
      AUTO_CREATE_PLAN=false
      shift
      ;;
    -h|--help)
      usage
      ;;
    -*)
      error "Unknown option: $1"
      usage
      ;;
    *)
      TASK_DESCRIPTION="$*"
      break
      ;;
  esac
done

# Validate task description
if [[ -z "${TASK_DESCRIPTION:-}" ]]; then
  error "Task description is required"
  usage
fi

# Find .blackbox4 root
BOX_ROOT="$(find_box_root)"
info ".blackbox4 root: $BOX_ROOT"

# Display task info
echo ""
echo "${BLUE}========================================${NC}"
echo "${BLUE}Action Plan Generator${NC}"
echo "${BLUE}========================================${NC}"
echo ""
echo "${GREEN}Task:${NC} $TASK_DESCRIPTION"

if [[ -n "$TASK_TYPE" ]]; then
  echo "${GREEN}Type:${NC} $TASK_TYPE"
else
  echo "${GREEN}Type:${NC} ${YELLOW}Auto-detect${NC}"
fi

if [[ -n "${COMPLEXITY:-}" ]]; then
  echo "${GREEN}Complexity:${NC} $COMPLEXITY"
else
  echo "${GREEN}Complexity:${NC} ${YELLOW}Auto-detect${NC}"
fi
echo ""

# Create plan folder if requested
if [[ "$AUTO_CREATE_PLAN" == true ]]; then
  info "Creating plan folder..."

  # Generate slug from task description
  SLUG=$(echo "$TASK_DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | cut -c1-50)

  # Create plan folder
  PLAN_OUTPUT=$("$SCRIPT_DIR/new-plan.sh" "$SLUG" 2>&1)
  PLAN_FOLDER=$(echo "$PLAN_OUTPUT" | grep "Location:" | sed 's/Location: //')

  if [[ -n "$PLAN_FOLDER" ]]; then
    success "Plan folder created: $PLAN_FOLDER"

    # Generate action plan ID
    PLAN_ID="AP-$(date +%Y)-$(printf "%03d" $(RANDOM % 1000))"
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Create action plan metadata
    cat > "$PLAN_FOLDER/artifacts/action-plan.yaml" << EOF
# Action Plan
# Generated: $TIMESTAMP

action_plan:
  id: "$PLAN_ID"
  created_at: "$TIMESTAMP"
  task:
    description: "$TASK_DESCRIPTION"
    type: "${TASK_TYPE:-auto-detect}"
    complexity: "${COMPLEXITY:-auto-detect}"

# Agent Assignment Matrix
# (Will be populated by Action Plan Agent)

agents:
  primary: "${TASK_TYPE:-auto}"
  supporting: []

# Next Steps
# 1. Use AI chat to analyze the task
# 2. Generate detailed action steps
# 3. Assign appropriate agents
# 4. Execute and track progress
EOF

    echo ""
    success "Action plan metadata created"
    echo ""

    # Show next steps
    echo "${BLUE}========================================${NC}"
    echo "${BLUE}Next Steps${NC}"
    echo "${BLUE}========================================${NC}"
    echo ""
    echo "1. Open your AI chat (Claude Code, Cursor, etc.)"
    echo "2. Use the Action Plan Agent:"
    echo ""
    echo "   ${YELLOW}Read: agents/custom/action-plan.agent.yaml${NC}"
    echo ""
    echo "3. Tell the AI:"
    echo ""
    echo "   ${YELLOW}I want to: $TASK_DESCRIPTION${NC}"
    echo "   ${YELLOW}Use the Action Plan Agent to generate a plan.${NC}"
    echo ""
    echo "4. The AI will:"
    echo "   - Understand and classify your task"
    echo "   - Generate a structured action plan"
    echo "   - Assign the right agent for execution"
    echo "   - Save the plan to: $PLAN_FOLDER"
    echo ""
    echo "5. Work with the assigned agent to execute the plan"
    echo ""

    # Show plan folder location
    echo "${BLUE}========================================${NC}"
    echo "${GREEN}✓ Ready to plan!${NC}"
    echo ""
    echo "Plan folder: ${GREEN}$PLAN_FOLDER${NC}"
    echo ""

  else
    error "Failed to create plan folder"
    exit 1
  fi

else
  info "Skipping plan folder creation (--no-plan flag)"
  echo ""
  echo "Next: Use AI chat with Action Plan Agent"
  echo "  Read: agents/custom/action-plan.agent.yaml"
fi
