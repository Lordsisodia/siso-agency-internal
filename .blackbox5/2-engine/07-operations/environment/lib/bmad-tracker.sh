#!/usr/bin/env bash

# Blackbox4 BMAD Phase Tracker (Bash 3.2 Compatible)
# Track and enforce BMAD 4-phase methodology

set -e

BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BMAD_STATE="$BLACKBOX4_HOME/.runtime/bmad-state.json"
PLANS_DIR="$BLACKBOX4_HOME/.plans"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Phase data (using indexed arrays for bash 3.2 compatibility)
PHASE_KEYS="analyze build measure refine"

# Helper functions for phase data
get_phase_name() {
    local phase="$1"
    case "$phase" in
        analyze) echo "Analyze" ;;
        build) echo "Build" ;;
        measure) echo "Measure" ;;
        refine) echo "Refine" ;;
        *) echo "Unknown" ;;
    esac
}

get_phase_description() {
    local phase="$1"
    case "$phase" in
        analyze) echo "Research, competitive analysis, requirements gathering" ;;
        build) echo "Architecture design, implementation, development" ;;
        measure) echo "Testing, validation, metrics collection" ;;
        refine) echo "Optimization, iteration, improvement" ;;
    esac
}

get_phase_criteria() {
    local phase="$1"
    case "$phase" in
        analyze) echo "Research complete, requirements defined, competitors analyzed" ;;
        build) echo "Architecture approved, core features implemented, integration ready" ;;
        measure) echo "Tests passing, metrics collected, validation successful" ;;
        refine) echo "Performance optimized, documentation complete, production ready" ;;
    esac
}

validate_phase() {
    local phase="$1"
    for p in $PHASE_KEYS; do
        if [ "$p" = "$phase" ]; then
            return 0
        fi
    done
    return 1
}

get_phase_index() {
    local phase="$1"
    local index=0
    for p in $PHASE_KEYS; do
        if [ "$p" = "$phase" ]; then
            echo $index
            return
        fi
        index=$((index + 1))
    done
    echo -1
}

# Initialize BMAD tracker
init_bmad() {
    if [ ! -f "$BMAD_STATE" ]; then
        mkdir -p "$(dirname "$BMAD_STATE")"
        cat > "$BMAD_STATE" << 'EOF'
{
  "current_phase": "analyze",
  "phases": {
    "analyze": {
      "status": "pending",
      "started_at": null,
      "completed_at": null,
      "criteria_met": [],
      "notes": ""
    },
    "build": {
      "status": "pending",
      "started_at": null,
      "completed_at": null,
      "criteria_met": [],
      "notes": ""
    },
    "measure": {
      "status": "pending",
      "started_at": null,
      "completed_at": null,
      "criteria_met": [],
      "notes": ""
    },
    "refine": {
      "status": "pending",
      "started_at": null,
      "completed_at": null,
      "criteria_met": [],
      "notes": ""
    }
  },
  "project_start": null,
  "last_update": null
}
EOF
        echo "${GREEN}✓ BMAD tracker initialized${NC}"
    fi
}

# Get current phase
get_current_phase() {
    if [ ! -f "$BMAD_STATE" ]; then
        init_bmad
    fi

    if command -v jq >/dev/null 2>&1; then
        jq -r '.current_phase' "$BMAD_STATE"
    else
        echo "analyze"
    fi
}

# Set current phase
set_phase() {
    local new_phase="$1"
    local force="${2:-false}"

    # Validate phase
    if ! validate_phase "$new_phase"; then
        echo "${RED}Error: Invalid phase '$new_phase'. Valid phases: $PHASE_KEYS${NC}"
        return 1
    fi

    local current_phase=$(get_current_phase)

    # Check phase order (unless force)
    if [ "$force" != "true" ]; then
        local current_index=$(get_phase_index "$current_phase")
        local new_index=$(get_phase_index "$new_phase")

        if [ $new_index -lt $current_index ]; then
            echo "${YELLOW}Warning: Moving backwards in phases. Use --force to confirm.${NC}"
            return 1
        fi
    fi

    # Complete current phase first
    if [ "$current_phase" != "$new_phase" ] && [ "$force" != "true" ]; then
        complete_phase "$current_phase" --auto
    fi

    # Update state
    if command -v jq >/dev/null 2>&1; then
        local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
        local tmpfile="$BMAD_STATE.tmp"

        if [ "$current_phase" = "$new_phase" ]; then
            jq --arg cur "$current_phase" --arg new "$new_phase" --arg ts "$timestamp" \
               '.current_phase = $new | .phases[$new].status = "active" | .phases[$new].started_at = $ts | .phases[$cur].status = "active" | .last_update = $ts' \
               "$BMAD_STATE" > "$tmpfile"
        else
            jq --arg cur "$current_phase" --arg new "$new_phase" --arg ts "$timestamp" \
               '.current_phase = $new | .phases[$new].status = "active" | .phases[$new].started_at = $ts | .phases[$cur].status = "completed" | .last_update = $ts' \
               "$BMAD_STATE" > "$tmpfile"
        fi
        mv "$tmpfile" "$BMAD_STATE"
    fi

    local phase_name=$(get_phase_name "$new_phase")
    echo "${GREEN}✓ Phase set to: $phase_name${NC}"
    show_phase_info "$new_phase"
}

# Complete a phase
complete_phase() {
    local phase="$1"
    local auto="${2:-}"

    # Check criteria
    local criteria=$(get_phase_criteria "$phase")
    local phase_name=$(get_phase_name "$phase")
    echo "${BLUE}Phase completion criteria for $phase_name:${NC}"
    echo "  $criteria"
    echo ""

    if [ "$auto" != "--auto" ]; then
        echo "${YELLOW}Has this criteria been met? (y/n)${NC}"
        read -r response
        if [ "$response" != "y" ] && [ "$response" != "Y" ]; then
            echo "${YELLOW}Phase not completed. Complete the criteria first.${NC}"
            return 1
        fi
    fi

    # Update state
    if command -v jq >/dev/null 2>&1; then
        local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
        local tmpfile="$BMAD_STATE.tmp"
        jq --arg ph "$phase" --arg ts "$timestamp" \
           '.phases[$ph].status = "completed" | .phases[$ph].completed_at = $ts | .last_update = $ts' \
           "$BMAD_STATE" > "$tmpfile"
        mv "$tmpfile" "$BMAD_STATE"
    fi

    echo "${GREEN}✓ Phase $phase_name completed${NC}"
}

# Show phase info
show_phase_info() {
    local phase="${1:-$(get_current_phase)}"

    echo ""
    local phase_name=$(get_phase_name "$phase")
    local description=$(get_phase_description "$phase")
    local criteria=$(get_phase_criteria "$phase")

    echo "${BLUE}=== $phase_name Phase ===${NC}"
    echo "Description: $description"
    echo ""
    echo "Completion Criteria:"
    echo "  $criteria"
    echo ""

    if [ -f "$BMAD_STATE" ] && command -v jq >/dev/null 2>&1; then
        local status=$(jq -r --arg p "$phase" '.phases[$p].status' "$BMAD_STATE")
        local started=$(jq -r --arg p "$phase" '.phases[$p].started_at' "$BMAD_STATE")
        local completed=$(jq -r --arg p "$phase" '.phases[$p].completed_at' "$BMAD_STATE")

        echo "Status: $status"
        if [ "$started" != "null" ] && [ -n "$started" ]; then
            echo "Started: $started"
        fi
        if [ "$completed" != "null" ] && [ -n "$completed" ]; then
            echo "Completed: $completed"
        fi
    fi
    echo ""
}

# Show current status
show_status() {
    if [ ! -f "$BMAD_STATE" ]; then
        init_bmad
    fi

    local current=$(get_current_phase)

    echo "${BLUE}=== BMAD Phase Tracker Status ===${NC}"
    echo ""

    local current_index=$(get_phase_index "$current")

    local index=0
    for phase in $PHASE_KEYS; do
        local status=$(jq -r --arg p "$phase" '.phases[$p].status' "$BMAD_STATE" 2>/dev/null || echo "pending")
        local phase_name=$(get_phase_name "$phase")

        if [ $index -eq $current_index ]; then
            echo "${GREEN}→ $phase_name: $status${NC}"
        elif [ $index -lt $current_index ]; then
            echo "  ✓ $phase_name: $status"
        else
            echo "    $phase_name: $status"
        fi
        index=$((index + 1))
    done

    echo ""
    show_phase_info "$current"
}

# Add note to current phase
add_note() {
    local note="$*"

    if [ -z "$note" ]; then
        echo "${RED}Error: Note content required${NC}"
        return 1
    fi

    local current=$(get_current_phase)

    if command -v jq >/dev/null 2>&1; then
        local existing_notes=$(jq -r --arg p "$current" '.phases[$p].notes // ""' "$BMAD_STATE")
        local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S")
        local new_notes="${existing_notes}\\n[${timestamp}] ${note}"

        local tmpfile="$BMAD_STATE.tmp"
        jq --arg p "$current" --arg notes "$new_notes" \
           '.phases[$p].notes = $notes | .last_update = now' \
           "$BMAD_STATE" > "$tmpfile"
        mv "$tmpfile" "$BMAD_STATE"
    fi

    local phase_name=$(get_phase_name "$current")
    echo "${GREEN}✓ Note added to $phase_name phase${NC}"
}

# Show notes
show_notes() {
    local phase="${1:-$(get_current_phase)}"

    if [ -f "$BMAD_STATE" ] && command -v jq >/dev/null 2>&1; then
        local notes=$(jq -r --arg p "$phase" '.phases[$p].notes // ""' "$BMAD_STATE")
        local phase_name=$(get_phase_name "$phase")

        if [ -n "$notes" ] && [ "$notes" != "null" ]; then
            echo "${BLUE}Notes for $phase_name phase:${NC}"
            echo "$notes"
        else
            echo "${YELLOW}No notes for $phase_name phase${NC}"
        fi
    fi
}

# Generate phase report
generate_report() {
    local output_file="${1:-$PLANS_DIR/bmad-report.md}"

    mkdir -p "$(dirname "$output_file")"

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    cat > "$output_file" << REPORT_EOF
# BMAD Phase Report

**Generated**: ${timestamp}

## Phase Progress

REPORT_EOF

    if [ -f "$BMAD_STATE" ] && command -v jq >/dev/null 2>&1; then
        for phase in $PHASE_KEYS; do
            local status=$(jq -r --arg p "$phase" '.phases[$p].status' "$BMAD_STATE")
            local started=$(jq -r --arg p "$phase" '.phases[$p].started_at // "N/A"' "$BMAD_STATE")
            local completed=$(jq -r --arg p "$phase" '.phases[$p].completed_at // "N/A"' "$BMAD_STATE")
            local notes=$(jq -r --arg p "$phase" '.phases[$p].notes // ""' "$BMAD_STATE")

            local phase_name=$(get_phase_name "$phase")
            local description=$(get_phase_description "$phase")
            local criteria=$(get_phase_criteria "$phase")
            local phase_title=$(echo "$phase_name" | tr '[:lower:]' '[:upper:]')

            cat >> "$output_file" << PHASE_EOF
### ${phase_title} Phase (${status})

**Description**: ${description}
**Completion Criteria**: ${criteria}

**Timeline**:
- Started: ${started}
- Completed: ${completed}

**Notes**:
${notes}

PHASE_EOF
        done
    fi

    echo "${GREEN}✓ Report generated: $output_file${NC}"
}

# Show help
show_help() {
    cat << 'HELP'
Blackbox4 BMAD Phase Tracker

Track and enforce BMAD 4-phase methodology.

Phases:
  analyze    Research, competitive analysis, requirements gathering
  build      Architecture design, implementation, development
  measure    Testing, validation, metrics collection
  refine     Optimization, iteration, improvement

Usage:
  bmad-tracker.sh <command> [options]

Commands:
  init                       Initialize BMAD tracker
  status                     Show current status
  phase <phase>              Set current phase
  complete <phase>           Complete a phase
  info [phase]               Show phase information
  note <text>                Add note to current phase
  notes [phase]              Show notes for phase
  report [file]              Generate phase report

Options:
  --force                    Force phase change (skip order check)

Examples:
  # Show current status
  bmad-tracker.sh status

  # Move to next phase
  bmad-tracker.sh phase build

  # Complete current phase
  bmad-tracker.sh complete analyze

  # Add note to current phase
  bmad-tracker.sh note "Competitor analysis complete"

  # Generate report
  bmad-tracker.sh report
HELP
}

# Main
case "${1:-status}" in
    init)
        init_bmad
        ;;
    status)
        show_status
        ;;
    phase)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Phase name required${NC}"
            exit 1
        fi
        set_phase "$2" "${3:-}"
        ;;
    complete)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Phase name required${NC}"
            exit 1
        fi
        complete_phase "$2" "${3:-}"
        ;;
    info)
        show_phase_info "${2:-}"
        ;;
    note)
        shift
        add_note "$@"
        ;;
    notes)
        show_notes "${2:-}"
        ;;
    report)
        generate_report "${2:-}"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
