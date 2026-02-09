#!/bin/bash
#
# OhMyOpenCode Agent Runner for .blackbox4
# Loads and executes OhMyOpenCode agents with proper context
#

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BB3_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
AGENTS_DIR="${SCRIPT_DIR}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Usage
usage() {
    cat << EOF
Usage: $(basename "$0") <agent_id> [task] [options]

OhMyOpenCode Agents for .blackbox4

Arguments:
  agent_id    Agent to run (oracle, librarian, explore)
  task        Task description or prompt (use "-" for stdin)

Options:
  -m, --model MODEL        Override default model
  -t, --temp TEMP          Override temperature
  -b, --background         Run as background task
  -q, --quick              Quick search mode (explore only)
  -v, --very-thorough      Very thorough mode (explore only)
  -h, --help               Show this help

Examples:
  $(basename "$0") oracle "Review authentication architecture"
  $(basename "$0") librarian "How do I implement JWT with Supabase?"
  $(basename "$0") explore "Where is user auth implemented?"
  $(basename "$0") explore "Find API endpoints" --very-thorough
  $(basename "$0") librarian "Research auth" --background

Available Agents:
  oracle      Strategic architecture reviews (GPT-5.2, EXPENSIVE)
  librarian   Documentation research (Claude Sonnet 4.5, CHEAP)
  explore     Fast codebase search (Grok Code, FREE)

EOF
    exit 1
}

# Parse arguments
AGENT_ID=""
TASK=""
MODEL=""
TEMP=""
BACKGROUND=false
THOROUGHNESS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -m|--model)
            MODEL="$2"
            shift 2
            ;;
        -t|--temp)
            TEMP="$2"
            shift 2
            ;;
        -b|--background)
            BACKGROUND=true
            shift
            ;;
        -q|--quick)
            THOROUGHNESS="quick"
            shift
            ;;
        -v|--very-thorough)
            THOROUGHNESS="very thorough"
            shift
            ;;
        -*)
            log_error "Unknown option: $1"
            usage
            ;;
        *)
            if [[ -z "$AGENT_ID" ]]; then
                AGENT_ID="$1"
            elif [[ -z "$TASK" ]]; then
                TASK="$1"
            else
                log_error "Too many arguments"
                usage
            fi
            shift
            ;;
    esac
done

# Validate agent ID
if [[ -z "$AGENT_ID" ]]; then
    log_error "Agent ID is required"
    usage
fi

# Normalize agent ID
case "${AGENT_ID,,}" in
    oracle|oracle-agent)
        AGENT_ID="oracle"
        AGENT_FILE="oracle-agent.md"
        DEFAULT_MODEL="gpt-5.2"
        DEFAULT_TEMP="0.7"
        ;;
    librarian|librarian-agent)
        AGENT_ID="librarian"
        AGENT_FILE="librarian-agent.md"
        DEFAULT_MODEL="claude-sonnet-4.5"
        DEFAULT_TEMP="0.5"
        ;;
    explore|explore-agent)
        AGENT_ID="explore"
        AGENT_FILE="explore-agent.md"
        DEFAULT_MODEL="opencode/grok-code"
        DEFAULT_TEMP="0.1"
        ;;
    *)
        log_error "Unknown agent: $AGENT_ID"
        log_info "Available agents: oracle, librarian, explore"
        exit 1
        ;;
esac

# Check agent file exists
AGENT_PATH="${AGENTS_DIR}/${AGENT_FILE}"
if [[ ! -f "$AGENT_PATH" ]]; then
    log_error "Agent file not found: $AGENT_PATH"
    exit 1
fi

# Get task from stdin if specified as "-"
if [[ "$TASK" == "-" ]]; then
    TASK=$(cat)
fi

# Validate task
if [[ -z "$TASK" ]]; then
    log_error "Task description is required"
    usage
fi

# Set model
MODEL="${MODEL:-$DEFAULT_MODEL}"
TEMP="${TEMP:-$DEFAULT_TEMP}"

# Display execution info
log_info "Agent: ${AGENT_ID}"
log_info "Model: ${MODEL}"
log_info "Temperature: ${TEMP}"
if [[ -n "$THOROUGHNESS" ]]; then
    log_info "Thoroughness: ${THOROUGHNESS}"
fi
if [[ "$BACKGROUND" == true ]]; then
    log_info "Mode: background"
fi
echo

# Add thoroughness to task if specified
if [[ -n "$THOROUGHNESS" ]]; then
    TASK="[Thoroughness: ${THOROUGHNESS}] ${TASK}"
fi

# Build the full prompt with agent context
FULL_PROMPT=$(cat << EOF
# Agent: ${AGENT_ID}
# Definition: ${AGENT_PATH}

${TASK}

---
Agent Context:
$(cat "$AGENT_PATH")
EOF
)

# Execute the task
if [[ "$BACKGROUND" == true ]]; then
    # Create background task directory
    BG_DIR="${BB3_ROOT}/.background/${AGENT_ID}"
    mkdir -p "$BG_DIR"

    # Generate task ID
    TASK_ID="${AGENT_ID}-$(date +%s)"
    TASK_FILE="${BG_DIR}/${TASK_ID}.txt"
    RESULT_FILE="${BG_DIR}/${TASK_ID}-result.json"
    LOG_FILE="${BG_DIR}/${TASK_ID}.log"

    # Save task
    echo "$FULL_PROMPT" > "$TASK_FILE"

    # Start background process
    log_info "Starting background task: ${TASK_ID}"

    # Create a simple execution wrapper
    cat > "${BG_DIR}/${TASK_ID}-run.sh" << RUNSCRIPT
#!/bin/bash
echo "[$(date)] Starting task: ${TASK_ID}" >> "$LOG_FILE"
echo "[$(date)] Agent: ${AGENT_ID}" >> "$LOG_FILE"
echo "[$(date)] Model: ${MODEL}" >> "$LOG_FILE"

# Run Claude Code with the task
cd "$BB3_ROOT"
claude "$FULL_PROMPT" --model "$MODEL" --temperature "$TEMP" 2>&1 | tee -a "$LOG_FILE" | tee "$RESULT_FILE"

echo "[$(date)] Task completed: ${TASK_ID}" >> "$LOG_FILE"
RUNSCRIPT

    chmod +x "${BG_DIR}/${TASK_ID}-run.sh"

    # Run in background
    nohup "${BG_DIR}/${TASK_ID}-run.sh" > /dev/null 2>&1 &
    BG_PID=$!

    # Save PID
    echo "$BG_PID" > "${BG_DIR}/${TASK_ID}.pid"

    log_success "Background task started"
    log_info "Task ID: ${TASK_ID}"
    log_info "PID: ${BG_PID}"
    log_info "Log: ${LOG_FILE}"
    log_info ""
    log_info "Check status: ${AGENTS_DIR}/status.sh ${TASK_ID}"
    log_info "View results: ${AGENTS_DIR}/results.sh ${TASK_ID}"

else
    # Run directly
    log_info "Executing task..."
    echo

    # Change to BB3 root and run Claude
    cd "$BB3_ROOT"
    claude "$FULL_PROMPT" --model "$MODEL" --temperature "$TEMP"

    echo
    log_success "Task completed"
fi
