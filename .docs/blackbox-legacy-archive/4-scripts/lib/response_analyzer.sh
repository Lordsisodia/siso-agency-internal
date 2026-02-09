#!/bin/bash

# Response Analyzer & Progress Tracker
# Part of Blackbox3 Circuit Breaker Implementation

# Response file paths
RESPONSE_FILE=".ralph/last-response.md"
FIX_PLAN_FILE=".ralph/@fix_plan.md"
PROGRESS_FILE=".ralph/progress.md"

# Load configuration (via circuit-breaker)
# Find the real directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/circuit-breaker/circuit-breaker.sh"

# Analyze AI response for completion indicators
analyze_response() {
    local response="$1"
    
    # Extract completion score
    local completion_score=$(extract_completion_score "$response")
    
    # Extract confidence
    local confidence=$(extract_confidence "$response")
    
    # Check for errors
    local error_count=$(extract_errors "$response")
    
    # Generate metrics
    local metrics="{
  \"completion_score\": $completion_score,
  \"confidence\": $confidence,
  \"error_count\": $error_count,
  \"response_length\": $(echo "$response" | wc -c)
}"
    
    echo "$metrics"
}

# Extract task completion score (0-100)
extract_completion_score() {
    local response="$1"
    
    # Parse @fix_plan.md for task status
    if [[ ! -f "$FIX_PLAN_FILE" ]]; then
        echo "50"
        return
    fi
    
    local total_tasks=$(grep -c "^\- \[" "$FIX_PLAN_FILE")
    local completed_tasks=$(grep -c "^\- \[x\]" "$FIX_PLAN_FILE")
    
    if (( total_tasks == 0 )); then
        echo "0"
        return
    fi
    
    local score=$((completed_tasks * 100 / total_tasks))
    echo "$score"
}

# Extract confidence (0-100)
extract_confidence() {
    local response="$1"
    
    # Explicit confidence indicators
    local explicit_confidence=0
    if ! echo "$response" | grep -qi "not.*sure\|not.*confident\|not.*certain\|unsure\|uncertain\|might\|maybe"; then
        if echo "$response" | grep -qi "confident\|sure\|certainly\|absolutely\|undoubtedly\|ensured"; then
            explicit_confidence=90
        elif echo "$response" | grep -qi "likely\|probably"; then
            explicit_confidence=60
        fi
    fi
    
    # Implicit confidence from language
    local implicit_confidence=50
    local hedge_words=("maybe" "might" "could" "approximately" "roughly" "basically" "I think")
    local certainty_words=("definitely" "certainly" "absolutely" "undoubtedly" "assured" "guaranteed")
    
    for word in "${hedge_words[@]}"; do
        if echo "$response" | grep -qi "$word"; then
            implicit_confidence=$((implicit_confidence - 10))
        fi
    done

    for word in "${certainty_words[@]}"; do
        if echo "$response" | grep -qi "$word"; then
            implicit_confidence=$((implicit_confidence + 10))
        fi
    done
    
    # Combine explicit and implicit
    local total_confidence=$((explicit_confidence + implicit_confidence))
    
    # Cap at 100
    if (( total_confidence > 100 )); then
        total_confidence=100
    fi
    
    if (( total_confidence < 0 )); then
        total_confidence=0
    fi
    
    echo "$total_confidence"
}

# Extract error count
extract_errors() {
    local response="$1"
    
    local error_patterns=(
        "error"
        "failed"
        "exception"
        "issue"
        "problem"
        "bug"
        "mistake"
    )
    
    local error_count=0
    for pattern in "${error_patterns[@]}"; do
        if echo "$response" | grep -qi "$pattern"; then
            error_count=$((error_count + 1))
        fi
    done
    
    echo "$error_count"
}

# Calculate progress delta from last loop
calculate_progress_delta() {
    local current_response="$1"
    
    if [[ ! -f ".ralph/last-response-backup.md" ]]; then
        echo "0"
        return
    fi
    
    # Compare with previous response
    local current_length=$(echo "$current_response" | wc -c)
    local prev_length=$(cat ".ralph/last-response-backup.md" | wc -c)
    
    local delta=0
    if (( prev_length > 0 )); then
        delta=$((current_length * 100 / prev_length - 100))
    fi
    
    # Cap delta at +/- 50% to avoid false positives
    if (( delta > 50 )); then
        delta=50
    elif (( delta < -50 )); then
        delta=-50
    fi
    
    echo "$delta"
}

# Main interface
main() {
    local mode="${1:-evaluate}"
    
    case "$mode" in
        evaluate)
            analyze_response "$(cat "$RESPONSE_FILE" 2>/dev/null)"
            ;;
        *)
            echo "Usage: $0 evaluate"
            echo "  evaluate - Analyze response for completion and progress"
            ;;
    esac
}

# Call main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi