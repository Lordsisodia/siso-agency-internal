# API Reference - Phase 4

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Autonomous Loop API](#autonomous-loop-api)
3. [Circuit Breaker API](#circuit-breaker-api)
4. [Response Analyzer API](#response-analyzer-api)
5. [State Management API](#state-management-api)
6. [Monitoring API](#monitoring-api)

---

## Overview

This API reference documents all public functions, commands, and interfaces for Phase 4 (Ralph Runtime) components.

### API Categories

- **Autonomous Loop API:** Main execution interface
- **Circuit Breaker API:** Safety system interface
- **Response Analyzer API:** Progress tracking interface
- **State Management API:** State persistence interface
- **Monitoring API:** Real-time monitoring interface

---

## Autonomous Loop API

### Main Script

**File:** `4-scripts/autonomous-loop.sh`

### Commands

#### init

Initialize autonomous session.

```bash
./4-scripts/autonomous-loop.sh init
```

**Description:**
- Initializes circuit breaker state
- Creates working directories
- Sets up progress tracking
- Loads configuration

**Returns:**
- `0` on success
- `1` on error

**Example:**
```bash
./4-scripts/autonomous-loop.sh init
# Output: 🚀 Autonomous loop session initialized
#         Circuit breaker: CLOSED
#         Max loops: 10
```

#### run

Run autonomous execution loop.

```bash
./4-scripts/autonomous-loop.sh run
```

**Description:**
- Converts .blackbox4 format to Ralph format
- Executes autonomous loop with circuit breaker
- Monitors progress
- Stops on completion or circuit trigger

**Returns:**
- `0` on completion
- `1` on circuit trigger
- `2` on error

**Example:**
```bash
./4-scripts/autonomous-loop.sh run
# Output: === Loop 1 of 10 ===
#         Working on tasks...
#         Progress: 10%
```

#### convert

Convert .blackbox4 format to Ralph format.

```bash
./4-scripts/autonomous-loop.sh convert
```

**Description:**
- Reads README.md and checklist.md
- Generates .ralph/PROMPT.md
- Extracts task items
- Creates status tracking

**Returns:**
- `0` on success
- `1` on error

**Example:**
```bash
./4-scripts/autonomous-loop.sh convert
# Output: ✅ Converted .blackbox4 format to Ralph format
```

#### status

Show circuit breaker and progress status.

```bash
./4-scripts/autonomous-loop.sh status
```

**Description:**
- Displays circuit breaker state
- Shows loop count
- Shows stagnation count
- Shows progress percentage

**Returns:**
- `0` on success

**Example:**
```bash
./4-scripts/autonomous-loop.sh status
# Output: === Circuit Breaker Status ===
#         Status: CLOSED
#         Loop count: 5
#         Consecutive no-progress: 0
```

#### monitor

Monitor autonomous session in real-time.

```bash
./4-scripts/autonomous-loop.sh monitor
```

**Description:**
- Updates every 2 seconds
- Shows current task
- Shows progress percentage
- Shows loop count
- Shows stagnation count
- Detects completion

**Returns:**
- `0` on completion
- `1` on error

**Example:**
```bash
./4-scripts/autonomous-loop.sh monitor
# Output (updates every 2 seconds):
#         === Ralph Autonomous Session Monitor ===
#         📋 Current Task: Implementing feature X
#         📊 Progress: 75%
#         🔄 Loops: 5
#         ⏱️  Stagnations: 0
```

#### reset

Reset circuit breaker (manual override).

```bash
./4-scripts/autonomous-loop.sh reset
```

**Description:**
- Resets circuit breaker to CLOSED state
- Clears trigger reason
- Resets stagnation count
- Logs reset event

**Returns:**
- `0` on success
- `1` on error

**Example:**
```bash
./4-scripts/autonomous-loop.sh reset
# Output: ✅ Circuit breaker reset (manual intervention)
```

---

## Circuit Breaker API

### Main Library

**File:** `4-scripts/lib/circuit-breaker/circuit-breaker.sh`

### Functions

#### init_circuit_state

Initialize circuit breaker state.

```bash
source 4-scripts/lib/circuit-breaker/circuit-breaker.sh
init_circuit_state
```

**Description:**
- Creates circuit state file
- Sets initial state to CLOSED
- Initializes counters to 0
- Creates log directory

**Returns:**
- State JSON on success
- Empty string on error

**Example:**
```bash
source 4-scripts/lib/circuit-breaker/circuit-breaker.sh
state=$(init_circuit_state)
echo "$state" | jq '.'
```

#### check_circuit_breaker

Check if circuit breaker should trigger.

```bash
check_circuit_breaker <state_json>
```

**Parameters:**
- `state_json` (string): Current circuit state as JSON

**Returns:**
- `0` if circuit should trigger (OPEN)
- `1` if circuit should remain closed (CLOSED)

**Example:**
```bash
state=$(get_circuit_state)
if check_circuit_breaker "$state"; then
    echo "Circuit triggered"
else
    echo "Circuit closed, continue"
fi
```

#### track_loop_metrics

Track loop execution metrics.

```bash
track_loop_metrics <progress_delta>
```

**Parameters:**
- `progress_delta` (number): Progress change since last loop

**Description:**
- Increments loop count
- Updates stagnation count
- Checks thresholds
- Saves state

**Example:**
```bash
progress_delta=5
track_loop_metrics $progress_delta
```

#### trigger_circuit_breaker

Trigger circuit breaker (open circuit).

```bash
trigger_circuit_breaker <reason> <state>
```

**Parameters:**
- `reason` (string): Trigger reason
- `state` (string): Current state JSON

**Description:**
- Sets circuit status to OPEN
- Records trigger reason
- Increments trigger count
- Logs trigger event
- Stops execution

**Returns:**
- `1` (signals to stop)

**Example:**
```bash
state=$(get_circuit_state)
trigger_circuit_breaker "Stagnation: 10 loops" "$state"
```

#### reset_circuit_breaker

Reset circuit breaker to CLOSED state.

```bash
reset_circuit_breaker
```

**Description:**
- Sets circuit status to CLOSED
- Clears trigger reason
- Resets stagnation count
- Logs reset event

**Returns:**
- `0` on success

**Example:**
```bash
reset_circuit_breaker
# Output: ✅ Circuit breaker reset
```

#### get_circuit_state

Get current circuit breaker state.

```bash
get_circuit_state
```

**Returns:**
- Circuit state as JSON string

**Example:**
```bash
state=$(get_circuit_state)
echo "$state" | jq '.'
# Output:
# {
#   "status": "CLOSED",
#   "loop_count": 5,
#   "consecutive_no_progress_loops": 0
# }
```

---

## Response Analyzer API

### Main Library

**File:** `4-scripts/lib/response-analyzer.sh`

### Functions

#### analyze_response

Analyze AI response for metrics.

```bash
analyze_response <response_text>
```

**Parameters:**
- `response_text` (string): AI agent response

**Returns:**
- JSON string with metrics:
  - `completion_score` (0-100)
  - `confidence` (0-100)
  - `error_count` (number)
  - `response_length` (number)

**Example:**
```bash
source 4-scripts/lib/response-analyzer.sh
response="I have completed the feature..."
metrics=$(analyze_response "$response")
echo "$metrics" | jq '.'
```

#### extract_completion_score

Extract completion score (0-100).

```bash
extract_completion_score <response_text>
```

**Parameters:**
- `response_text` (string): AI agent response

**Returns:**
- Completion score (0-100)

**Description:**
- Checks @fix_plan.md for task completion
- Looks for percentage mentions
- Searches for completion keywords

**Example:**
```bash
score=$(extract_completion_score "$response")
echo "Completion: $score%"
```

#### extract_confidence

Extract confidence level (0-100).

```bash
extract_confidence <response_text>
```

**Parameters:**
- `response_text` (string): AI agent response

**Returns:**
- Confidence score (0-100)

**Description:**
- Looks for explicit confidence indicators
- Analyzes language patterns
- Detects hedge and certainty words

**Example:**
```bash
confidence=$(extract_confidence "$response")
echo "Confidence: $confidence%"
```

#### extract_errors

Extract error count.

```bash
extract_errors <response_text>
```

**Parameters:**
- `response_text` (string): AI agent response

**Returns:**
- Error count (number)

**Description:**
- Counts error keyword occurrences
- Matches error patterns
- Returns total count

**Example:**
```bash
errors=$(extract_errors "$response")
echo "Errors found: $errors"
```

#### calculate_progress_delta

Calculate progress delta from last loop.

```bash
calculate_progress_delta <current_response>
```

**Parameters:**
- `current_response` (string): Current AI response

**Returns:**
- Progress delta (percentage change)

**Description:**
- Compares with previous response
- Calculates change in completion
- Caps at +/- 50%

**Example:**
```bash
delta=$(calculate_progress_delta "$response")
echo "Progress change: $delta%"
```

---

## State Management API

### State Files

#### Circuit State

**Location:** `.ralph/circuit-state.json`

**Format:**
```json
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
```

**Fields:**
- `status` (string): Circuit state (CLOSED/OPEN)
- `trigger_reason` (string): Reason for last trigger
- `trigger_count` (number): Total trigger count
- `last_progress_timestamp` (number): Unix timestamp
- `loop_count` (number): Total loops executed
- `consecutive_no_progress_loops` (number): Stagnation count
- `last_trigger_time` (number): Last trigger timestamp
- `last_save_time` (number): Last save timestamp
- `backup_count` (number): Total backups created
- `history` (array): Event history

#### Progress File

**Location:** `.ralph/progress.md`

**Format:**
```markdown
# Autonomous Loop Progress Tracking

## Session Info
- **Started:** 2026-01-15 10:00:00
- **Session ID:** 1704123456

## Current Status
**Task:** Implementing feature X
**Progress:** 75%
**Loops:** 5
**Stagnation Count:** 0

## Response Metrics
- Completion: 75%
- Confidence: 85%
- Errors: 0

## Progress History
- 2026-01-15 10:00:00: 0%
- 2026-01-15 10:01:00: 25%
- 2026-01-15 10:02:00: 50%
- 2026-01-15 10:03:00: 75%
```

### Backup Functions

#### backup_state

Create state backup.

```bash
backup_state
```

**Description:**
- Creates timestamped backup
- Stores in `.ralph/backups/`
- Increments backup count
- Logs backup event

**Example:**
```bash
backup_state
# Output: ✅ Backup created: .ralph/backups/circuit-state_20260115_100000.json
```

---

## Monitoring API

### Monitoring Commands

#### Real-Time Monitor

```bash
./4-scripts/autonomous-loop.sh monitor
```

**Update Interval:** 2 seconds

**Display:**
- Current task
- Progress percentage
- Loop count
- Stagnation count
- Elapsed time
- Circuit status

#### Status Check

```bash
./4-scripts/autonomous-loop.sh status
```

**Display:**
- Circuit breaker state
- Loop count
- Stagnation count
- Trigger count
- Progress metrics

#### Log Monitoring

```bash
# Circuit events
tail -f .ralph/logs/circuit_*.log

# Progress events
tail -f .ralph/logs/progress_*.log

# All logs
tail -f .ralph/logs/*.log
```

### Log Formats

#### Circuit Log

**Location:** `.ralph/logs/circuit_YYYYMMDD.log`

**Format:**
```
[2026-01-15T10:00:00] INIT: Circuit breaker initialized
   Status: CLOSED
   Loop count: 0
   Consecutive no-progress: 0
   Trigger count: 0

[2026-01-15T10:05:00] LOOP: Loop 1, progress 10%
   Status: CLOSED
   Loop count: 1
   Consecutive no-progress: 0

[2026-01-15T10:15:00] TRIGGER: Stagnation: 10 loops without progress
   Status: OPEN
   Loop count: 10
   Consecutive no-progress: 10
   Trigger count: 1
```

#### Progress Log

**Location:** `.ralph/logs/progress_YYYYMMDD.log`

**Format:**
```
[2026-01-15T10:00:00] Session initialized
[2026-01-15T10:01:00] Progress updated: 25%, Task: Implementing feature
[2026-01-15T10:02:00] Progress updated: 50%, Task: Testing
[2026-01-15T10:03:00] Progress updated: 75%, Task: Documentation
```

---

## Configuration API

### Configuration File

**Location:** `4-scripts/lib/circuit-breaker/config.yaml`

### Environment Variables

#### PROJECT_TYPE

Set project type for thresholds.

```bash
export PROJECT_TYPE="critical_feature"
```

**Values:**
- `critical_feature`: 15 loops, 2% stagnation
- `research_task`: 20 loops, 5% stagnation
- `simple_script`: 3 loops, 10% stagnation
- `generic`: 10 loops, 3% stagnation (default)

#### TENANT_ID

Set tenant ID for multi-tenant execution.

```bash
export TENANT_ID="acme_001"
```

#### TENANT_NAME

Set tenant name.

```bash
export TENANT_NAME="Acme Corp"
```

#### DEBUG

Enable debug mode.

```bash
export DEBUG="true"
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error / Circuit Triggered |
| 2 | Configuration Error |
| 3 | State Error |

---

## Conclusion

This API reference documents all public interfaces for Phase 4 (Ralph Runtime). Use these APIs to integrate autonomous execution into your workflows.

**Key APIs:**
- `autonomous-loop.sh` - Main execution interface
- `circuit-breaker.sh` - Safety system
- `response-analyzer.sh` - Progress tracking
- State files - Persistent storage
- Monitoring commands - Real-time visibility

**Next Steps:**
- See [Examples](EXAMPLES-PHASE4.md) for usage examples
- Read [Integration Guide](INTEGRATION-PHASE4-GUIDE.md) for integration patterns
