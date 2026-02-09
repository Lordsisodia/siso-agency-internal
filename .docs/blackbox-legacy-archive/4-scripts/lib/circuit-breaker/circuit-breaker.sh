#!/bin/bash

# Circuit Breaker State Management Library
# Part of Blackbox3 Circuit Breaker Implementation
# Following Thought Chain Implementation Plan: Feature 1.1

# Configuration file path
CONFIG_FILE="scripts/lib/circuit-breaker/config.yaml"
CIRCUIT_STATE_FILE=".ralph/circuit-state.json"

# Load configuration
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        eval $(grep -A "^[^]" "$CONFIG_FILE" | sed 's/^/CIRCUIT_[A-Z_]*=/')
        eval $(grep -A "^[a-z_]" "$CONFIG_FILE" | sed 's/^\([a-z_]*\)=/\1="/\2/')
    fi
    
    # Set defaults if not defined
    MAX_LOOPS=${MAX_LOOPS:-10}
    STAGNATION_THRESHOLD=${STAGNATION_THRESHOLD:-3}
    COOLDOWN_SECONDS=${COOLDOWN_SECONDS:-300}
    ABSOLUTE_MAX_LOOPS=${ABSOLUTE_MAX_LOOPS:-20}
    LOOPS_WARNING_THRESHOLD=${LOOPS_WARNING_THRESHOLD:-8}
    LOOPS_CRITICAL_THRESHOLD=${LOOPS_CRITICAL_THRESHOLD:-15}
}

# Initialize circuit breaker state
init_circuit_state() {
    mkdir -p "$(dirname "$CIRCUIT_STATE_FILE")"
    mkdir -p "$(dirname "$CIRCUIT_STATE_FILE")/logs"
    
    # Initialize state file if doesn't exist
    if [[ ! -f "$CIRCUIT_STATE_FILE" ]]; then
        cat > "$CIRCUIT_STATE_FILE" << 'EOF'
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 0,
  "last_progress_timestamp": 0,
  "loop_count": 0,
  "consecutive_no_progress_loops": 0,
  "last_trigger_time": 0,
  "last_save_time": 0,
  "backup_count": 0,
  "history": []
}
EOF
        log_circuit_event "INIT" "Circuit breaker state initialized"
    fi
    
    # Load current state
    STATE=$(cat "$CIRCUIT_STATE_FILE")
    echo "$STATE"
}

# Load project-specific configuration
get_project_config() {
    local project_type="$1"
    
    # Try to load from .bb3.yaml
    if [[ -f ".bb3/config.yaml" ]]; then
        case "$project_type" in
            "critical_feature")
                echo "$STATE" | jq -r ".circuit_breaker.projects.critical_feature.max_loops_no_progress // 15"
                echo "$STATE" | jq -r ".circuit_breaker.projects.critical_feature.stagnation_threshold // 2"
                ;;
            "simple_script")
                echo "$STATE" | jq -r ".circuit_breaker.projects.simple_script.max_loops_no_progress // 3"
                ;;
            "research_task")
                echo "$STATE" | jq -r ".circuit_breaker.projects.research_task.max_loops_no_progress // 20"
                ;;
        esac
    else
        # Return defaults
        echo "$MAX_LOOPS"
    fi
}

# Track loop metrics
track_loop_metrics() {
    local timestamp=$(date +%s)
    
    # Update state with current loop info
    STATE=$(jq --arg timestamp "$timestamp" --arg count "$(echo "$STATE" | jq '.loop_count + 1')" '.loop_count += 1; last_progress_timestamp = $timestamp' <<< "$STATE")
    
    # Check stagnation
    local progress_delta=$(calculate_progress_delta "$STATE")
    if (( $(echo "$progress_delta" | jq '.') < STAGNATION_THRESHOLD )); then
        STATE=$(jq --arg count "$(echo "$STATE" | jq '.consecutive_no_progress_loops + 1')" '.consecutive_no_progress_loops = $count' <<< "$STATE")
        log_circuit_event "STAGNATION" "Progress delta: $progress_delta% (< $STAGNATION_THRESHOLD%)"
    else
        # Reset consecutive no-progress counter
        STATE=$(jq '.consecutive_no_progress_loops = 0' <<< "$STATE")
    fi
    
    # Check circuit breaker thresholds
    check_circuit_breaker "$STATE"
    
    # Save state
    save_state
}

# Calculate progress delta
calculate_progress_delta() {
    local response_file=".ralph/last-response.md"
    
    if [[ ! -f "$response_file" ]]; then
        echo "10"
        return
    fi
    
    local response=$(cat "$response_file" 2>/dev/null)
    
    # Heuristic 1: Check for completion keywords
    if echo "$response" | grep -qi "done\|complete\|finished\|success"; then
        echo "100"
        return
    fi
    
    # Heuristic 2: Check task completion markers
    local completed_tasks=$(echo "$response" | grep -c "Completed\|✅" | wc -l)
    local total_tasks=$(echo "$response" | grep -c "\[ \]" | wc -l)
    
    if (( completed_tasks > 0 )) && (( total_tasks > 0 )); then
        local progress=$((completed_tasks * 100 / total_tasks))
        echo "$progress"
        return
    fi
    
    # Heuristic 3: Check for progress percentage mentions
    if echo "$response" | grep -q "[0-9][0-9]%"; then
        local percentage=$(echo "$response" | grep -o "[0-9][0-9]%" | sed 's/[^0-9]//' | head -1)
        echo "$percentage"
        return
    fi
    
    # Default: 10% (assumed minimal progress)
    echo "10"
}

# Check against thresholds
check_circuit_breaker() {
    local state="$1"
    
    # Get configured thresholds (project-specific if possible)
    local project_type=$(detect_project_type)
    local threshold=$(get_project_config "$project_type")
    local max_loops=$(echo "$threshold" | jq -r ".max_loops_no_progress")
    local absolute_max=$(echo "$STATE" | jq '.absolute_max_loops')
    
    # Check loop-based triggers
    local consecutive_no_progress=$(echo "$state" | jq '.consecutive_no_progress_loops')
    local loop_count=$(echo "$state" | jq '.loop_count')
    
    # Check if threshold exceeded
    if (( consecutive_no_progress >= max_loops )); then
        trigger_circuit_breaker "Stagnation: $consecutive_no_progress loops without progress" "$state"
        return 0 # Circuit open
    fi
    
    # Check absolute max
    if (( loop_count >= absolute_max )); then
        trigger_circuit_breaker "Absolute max: $loop_count loops" "$state"
        return 0 # Circuit open
    fi
}

# Trigger circuit breaker
trigger_circuit_breaker() {
    local reason="$1"
    local state="$2"
    
    # Update state
    STATE=$(jq --arg reason "$reason" --arg count "$(echo "$state" | jq '.trigger_count + 1')" --arg timestamp "$(date +%s)" '.trigger_count += 1; last_trigger_time = $timestamp; trigger_reason = $reason' <<< "$state")
    
    # Update circuit status
    STATE=$(jq '.status = "OPEN"' <<< "$STATE")
    
    # Log trigger
    log_circuit_event "TRIGGER" "$reason" "$state"
    
    echo "🚨 CIRCUIT BREAKER TRIGGERED: $reason"
    echo "   Reason: $reason"
    echo "   Loop count: $(echo "$STATE" | jq '.loop_count')"
    echo "   Consecutive no-progress: $(echo "$STATE" | jq '.consecutive_no_progress_loops')"
    
    # Stop execution
    return 1 # Signal to stop
}

# Reset circuit breaker
reset_circuit_breaker() {
    STATE=$(jq '.status = "CLOSED"; trigger_reason = ""; consecutive_no_progress_loops = 0' <<< "$STATE")
    
    log_circuit_event "RESET" "Manual reset" "$STATE"
    
    echo "✅ Circuit breaker reset (manual intervention)"
    return 1
}

# Detect project type
detect_project_type() {
    # Read from .bb3.yaml if exists
    if [[ -f ".bb3/config.yaml" ]]; then
        jq -r '.project.type' "$BB3_CONFIG" 2>/dev/null || echo "generic"
    else
        echo "generic"
    fi
}

# Log circuit events
log_circuit_event() {
    local event="$1"
    local details="$2"
    local state="$3"
    
    mkdir -p ".ralph/logs"
    
    local timestamp=$(date -Iseconds)
    local log_file=".ralph/logs/circuit_$(date +%Y%m%d).log"
    
    echo "[$timestamp] $event: $details]" >> "$log_file"
    echo "   Status: $(echo "$state" | jq -r '.status')" >> "$log_file"
    echo "   Loop count: $(echo "$state" | jq -r '.loop_count')" >> "$log_file"
    echo "   Consecutive no-progress: $(echo "$state" | $jqr '.consecutive_no_progress_loops')" >> "$log_file"
    echo "   Trigger count: $(echo "$state" | jq -r '.trigger_count')" >> "$log_file"
    
    echo "   Logged to $log_file"
}

# Save state
save_state() {
    local current_time=$(date +%s)
    STATE=$(jq --arg save_time "$current_time" '.last_save_time = $save_time' <<< "$STATE")
    
    echo "$STATE" > "$CIRCUIT_STATE_FILE"
}

# Get current state
get_circuit_state() {
    cat "$CIRCUIT_STATE_FILE"
}

# Backup state
backup_state() {
    local backup_dir=".ralph/backups"
    mkdir -p "$backup_dir"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/circuit-state_$timestamp.json"
    
    cp "$CIRCUIT_STATE_FILE" "$backup_file"
    
    STATE=$(jq --arg count "$(echo "$STATE" | jq '.backup_count + 1')" '.backup_count += 1' <<< "$STATE")
    
    log_circuit_event "BACKUP" "Created backup $backup_file"
    
    # Keep only last N backups
    ls -t "$backup_dir" | tail -n $(ls -1 "$backup_dir" | wc -l) | xargs rm
}

# Main interface
main() {
    local command="${1:-check}"
    local project_type="${2:-}"
    
    case "$command" in
        check)
            init_circuit_state
            load_config
            check_circuit_breaker "$(get_circuit_state)"
            ;;
        status)
            get_circuit_state
            ;;
        reset)
            reset_circuit_breaker
            ;;
        track)
            track_loop_metrics
            ;;
        history)
            tail -n 20 ".ralph/logs"/*.log 2>/dev/null | cat
            ;;
        backup)
            backup_state
            ;;
        *)
            echo "Usage: $0 check|status|reset|track|history|backup [project_type]"
            echo "  check - Check circuit breaker state"
            echo "  status - Show circuit breaker state"
            echo "  reset - Reset circuit breaker (manual override)"
            echo "  track - Track loop metrics"
            echo "  history - Show circuit breaker event history"
            echo "  backup - Create state backup"
            ;;
    esac
}

# Export functions for sourcing
export -f init_circuit_state
export -f check_circuit_breaker
export -f trigger_circuit_breaker
export -f reset_circuit_breaker
export -f track_loop_metrics
export -f log_circuit_event
export -f save_state
export -f get_circuit_state
export -f backup_state