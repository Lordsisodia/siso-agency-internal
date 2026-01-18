#!/bin/bash

# Exit Decision Engine
# Part of Blackbox3 Circuit Breaker Implementation
# Makes intelligent decisions about when to stop autonomous execution

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source dependencies
source "$SCRIPT_DIR/circuit-breaker/circuit-breaker.sh"
source "$SCRIPT_DIR/response-analyzer.sh"

# Configuration file
EXIT_CONFIG_FILE="scripts/lib/exit-decision-engine/config.yaml"
EXIT_STATE_FILE=".ralph/exit-state.json"

# Default thresholds
DEFAULT_MIN_CONFIDENCE=70
DEFAULT_MIN_COMPLETION=80
DEFAULT_MAX_ERRORS=5
DEFAULT_STAGNATION_LOOPS=3


load_exit_config() {
    if [[ -f "$EXIT_CONFIG_FILE" ]]; then
        MIN_CONFIDENCE=$(grep "min_confidence" "$EXIT_CONFIG_FILE" | awk '{print $2}' || echo "$DEFAULT_MIN_CONFIDENCE")
        MIN_COMPLETION=$(grep "min_completion" "$EXIT_CONFIG_FILE" | awk '{print $2}' || echo "$DEFAULT_MIN_COMPLETION")
        MAX_ERRORS=$(grep "max_errors" "$EXIT_CONFIG_FILE" | awk '{print $2}' || echo "$DEFAULT_MAX_ERRORS")
        STAGNATION_LOOPS=$(grep "stagnation_loops" "$EXIT_CONFIG_FILE" | awk '{print $2}' || echo "$DEFAULT_STAGNATION_LOOPS")
    else
        MIN_CONFIDENCE=$DEFAULT_MIN_CONFIDENCE
        MIN_COMPLETION=$DEFAULT_MIN_COMPLETION
        MAX_ERRORS=$DEFAULT_MAX_ERRORS
        STAGNATION_LOOPS=$DEFAULT_STAGNATION_LOOPS
    fi
}


init_exit_state() {
    mkdir -p "$(dirname "$EXIT_STATE_FILE")"

    if [[ ! -f "$EXIT_STATE_FILE" ]]; then
        cat > "$EXIT_STATE_FILE" << 'EOF'
{
  "last_decision": "CONTINUE",
  "decision_reason": "",
  "confidence_history": [],
  "completion_history": [],
  "error_history": [],
  "stagnation_count": 0,
  "total_decisions": 0,
  "continue_count": 0,
  "exit_count": 0
}
EOF
    fi

    EXIT_STATE=$(cat "$EXIT_STATE_FILE")
}


make_exit_decision() {
    local response="$1"
    local fix_plan="$2"

    load_exit_config
    init_exit_state

    local metrics=$(bash "$SCRIPT_DIR/response-analyzer.sh" evaluate)
    local completion_score=$(echo "$metrics" | jq -r '.completion_score')
    local confidence=$(echo "$metrics" | jq -r '.confidence')
    local error_count=$(echo "$metrics" | jq -r '.error_count')

    local circuit_state=$(bash "$SCRIPT_DIR/circuit-breaker/circuit-breaker.sh" status)
    local circuit_status=$(echo "$circuit_state" | jq -r '.status')

    local decision="CONTINUE"
    local decision_reason=""

    # CRITICAL: Circuit breaker is OPEN - MUST STOP
    if [[ "$circuit_status" == "OPEN" ]]; then
        decision="EXIT"
        decision_reason="Circuit breaker is OPEN: $(echo "$circuit_state" | jq -r '.trigger_reason')"

    elif (( completion_score >= MIN_COMPLETION )); then
        decision="EXIT"
        decision_reason="Task completion ${completion_score}% >= threshold ${MIN_COMPLETION}%"

    elif (( confidence < MIN_CONFIDENCE )); then
        decision="EXIT"
        decision_reason="AI confidence ${confidence}% < threshold ${MIN_CONFIDENCE}%"

    elif (( error_count > MAX_ERRORS )); then
        decision="EXIT"
        decision_reason="Error count ${error_count} > threshold ${MAX_ERRORS}"

    elif [[ -f "$FIX_PLAN_FILE" ]]; then
        local total_tasks=$(grep -c "^\- \[" "$FIX_PLAN_FILE" 2>/dev/null || echo "0")
        local completed_tasks=$(grep -c "^\- \[x\]" "$FIX_PLAN_FILE" 2>/dev/null || echo "0")

        if (( total_tasks > 0 && completed_tasks == total_tasks )); then
            decision="EXIT"
            decision_reason="All ${total_tasks} tasks completed"

        elif (( total_tasks > 0 )); then
            local last_completion=$(echo "$EXIT_STATE" | jq -r '.completion_history[-1] // empty')

            if [[ "$last_completion" == "empty" ]]; then
                EXIT_STATE=$(jq '.stagnation_count = 0' <<< "$EXIT_STATE")
                decision="CONTINUE"
                decision_reason="Progress detected: ${completed_tasks}/${total_tasks} tasks done"
            elif (( completed_tasks != last_completion )); then
                EXIT_STATE=$(jq '.stagnation_count = 0' <<< "$EXIT_STATE")
                decision="CONTINUE"
                decision_reason="Progress detected: ${completed_tasks}/${total_tasks} tasks done"
            else
                EXIT_STATE=$(jq --arg count "$(echo "$EXIT_STATE" | jq '.stagnation_count + 1')" '.stagnation_count = $count' <<< "$EXIT_STATE")
                local stagnation=$(echo "$EXIT_STATE" | jq -r '.stagnation_count')

                if (( stagnation >= STAGNATION_LOOPS )); then
                    decision="EXIT"
                    decision_reason="No progress for ${stagnation} consecutive loops"
                else
                    decision_reason="No progress ($stagnation/${STAGNATION_LOOPS} loops)"
                fi
            fi
        fi
    else
        decision_reason="Checking progress..."
    fi

    EXIT_STATE=$(jq --arg decision "$decision" --arg reason "$decision_reason" \
        --arg conf_score "$confidence" --arg comp_score "$completion_score" --arg errors "$error_count" \
        '.last_decision = $decision | .decision_reason = $reason | .confidence_history += [$conf_score] | .completion_history += [$comp_score] | .error_history += [$errors] | .total_decisions += 1 | if $decision == "CONTINUE" then .continue_count += 1 else .exit_count += 1 end' <<< "$EXIT_STATE")

    echo "$EXIT_STATE" > "$EXIT_STATE_FILE"

    log_exit_decision "$decision" "$decision_reason" "$metrics"

    if [[ "$decision" == "EXIT" ]]; then
        echo "🛑 EXIT DECISION: $decision_reason"
        return 1
    else
        echo "✅ CONTINUE: $decision_reason"
        return 0
    fi
}


log_exit_decision() {
    local decision="$1"
    local reason="$2"
    local metrics="$3"

    mkdir -p ".ralph/logs"

    local timestamp=$(date -Iseconds)
    local log_file=".ralph/logs/exit-decisions_$(date +%Y%m%d).log"

    {
        echo "[$timestamp] Decision: $decision"
        echo "   Reason: $reason"
        echo "   Metrics: $metrics"
        echo "   Circuit status: $(bash "$SCRIPT_DIR/circuit-breaker/circuit-breaker.sh" status | jq -r '.status')"
        echo ""
    } >> "$log_file"
}


get_exit_state() {
    cat "$EXIT_STATE_FILE"
}


reset_exit_state() {
    init_exit_state
    echo "✅ Exit state reset"
}


should_continue() {
    local response_file="${1:-.ralph/last-response.md}"
    local fix_plan="${2:-.ralph/@fix_plan.md}"

    if [[ ! -f "$response_file" ]]; then
        echo "⚠️ Response file not found: $response_file"
        return 0
    fi

    local response=$(cat "$response_file" 2>/dev/null)

    make_exit_decision "$response" "$fix_plan"
}


main() {
    local command="${1:-check}"
    case "$command" in
        check)
            should_continue "${2:-.ralph/last-response.md}" "${3:-.ralph/@fix_plan.md}"
            ;;
        state)
            get_exit_state
            ;;
        reset)
            reset_exit_state
            ;;
        history)
            tail -n 20 ".ralph/logs/exit-decisions_"*.log 2>/dev/null | cat
            ;;
        *)
            echo "Usage: $0 check|state|reset|history [response_file] [fix_plan_file]"
            echo "  check - Make exit decision"
            echo "  state - Show exit state"
            echo "  reset - Reset exit state"
            echo "  history - Show exit decision history"
            ;;
    esac
}

export -f load_exit_config
export -f init_exit_state
export -f make_exit_decision
export -f log_exit_decision
export -f get_exit_state
export -f reset_exit_state
export -f should_continue

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
