# Circuit Breaker Guide - Phase 4

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [How Circuit Breaker Works](#how-circuit-breaker-works)
3. [Configuration Options](#configuration-options)
4. [State Transitions](#state-transitions)
5. [Failsafe Detection](#failsafe-detection)
6. [Integration with Ralph Runtime](#integration-with-ralph-runtime)
7. [Best Practices](#best-practices)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Circuit Breaker is a safety mechanism adapted from microservices architecture to prevent autonomous AI agents from entering infinite loops or wasting resources on stagnating tasks. It monitors execution progress and automatically stops the autonomous loop when predefined thresholds are exceeded.

### What is Circuit Breaker Pattern?

Originally designed for distributed systems, the Circuit Breaker pattern prevents cascading failures by detecting when a service is failing and temporarily stopping requests to that service. In Blackbox4, we've adapted this pattern for autonomous AI execution:

- **Microservices:** Prevents cascading failures across services
- **Blackbox4:** Prevents infinite loops and resource waste in autonomous execution

### Key Components

1. **State Machine:** CLOSED → OPEN → HALF_OPEN → CLOSED
2. **Thresholds:** Configurable limits for loops and stagnation
3. **Detection:** Automatic detection of stagnation and completion
4. **Triggering:** Automatic stop when thresholds exceeded
5. **Recovery:** Manual reset for intervention

### Why Circuit Breaker for AI?

Without circuit breaker:
```
AI Agent → Works → Stuck → Infinite Loop → Wasted Resources
```

With circuit breaker:
```
AI Agent → Works → Stuck → Detected → Stopped → Safe Recovery
```

---

## How Circuit Breaker Works

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTONOMOUS EXECUTION                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Execute AI Agent     │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Analyze Response     │
                │  - Progress %         │
                │  - Completion         │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Calculate Metrics    │
                │  - Progress Delta     │
                │  - Loop Count         │
                │  - Stagnation Count   │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Check Thresholds     │
                │  - Max Loops?         │
                │  - Stagnation?        │
                │  - Absolute Max?      │
                └───────────────────────┘
                     │           │
                 Exceeded      Within Limits
                     │           │
                     ▼           ▼
              ┌──────────┐  ┌──────────┐
              │ TRIGGER  │  │ CONTINUE │
              │ Circuit  │  │ Loop     │
              └──────────┘  └──────────┘
                     │
                     ▼
          ┌────────────────────┐
          │  STOP EXECUTION    │
          │  Save State        │
          │  Log Event         │
          │  Notify User       │
          └────────────────────┘
```

### Detection Mechanisms

#### 1. Stagnation Detection

**Definition:** Consecutive loops without meaningful progress

**Calculation:**
```bash
# Progress delta = current_progress - previous_progress
# If progress_delta < stagnation_threshold: stagnation_count += 1
# Else: stagnation_count = 0

# Example:
# Loop 1: Progress 0% → 10% (delta = 10%)
# Loop 2: Progress 10% → 15% (delta = 5%, STAGNATION!)
# Loop 3: Progress 15% → 17% (delta = 2%, STAGNATION!)
# Loop 4: Progress 17% → 18% (delta = 1%, STAGNATION!)
# Loop 5: Progress 18% → 50% (delta = 32%, RESET)
```

**Default Stagnation Threshold:** 3%

#### 2. Loop Count Detection

**Definition:** Total number of executed loops

**Calculation:**
```bash
loop_count += 1  # Each iteration

# Check against thresholds:
if consecutive_no_progress >= max_loops_no_progress:
    trigger_circuit_breaker("Stagnation: {consecutive_no_progress} loops")

if loop_count >= absolute_max_loops:
    trigger_circuit_breaker("Absolute max: {loop_count} loops")
```

**Default Max Loops:** 10
**Default Absolute Max:** 20

#### 3. Completion Detection

**Definition:** Task completion indicators

**Indicators:**
```bash
# 1. Progress percentage
if progress >= 100:
    return "COMPLETE"

# 2. Task completion markers
if all_tasks_completed(@fix_plan.md):
    return "COMPLETE"

# 3. Keywords in response
if "done" or "complete" or "finished" in response:
    return "COMPLETE"

# 4. No remaining work items
if no_work_items_remaining():
    return "COMPLETE"
```

---

## Configuration Options

### Configuration File

**Location:** `4-scripts/lib/circuit-breaker/config.yaml`

```yaml
# Circuit Breaker Configuration
circuit_breaker:
  # Maximum consecutive loops without meaningful progress
  # Default: 10
  # Range: 3-50
  max_loops_no_progress: 10

  # Minimum progress percentage to avoid stagnation
  # Default: 3 (%)
  # Range: 1-10
  stagnation_threshold: 3

  # Cooldown period after circuit trigger (seconds)
  # Default: 300 (5 minutes)
  # Range: 60-3600
  cooldown_seconds: 300

  # Absolute maximum loops regardless of progress
  # Default: 20
  # Range: 10-100
  absolute_max_loops: 20

  # Warning level loops
  # Default: 8
  # Range: 5-15
  warning_threshold: 8

  # Critical level loops
  # Default: 15
  # Range: 10-30
  critical_threshold: 15

  # Project-specific configurations
  projects:
    critical_feature:
      max_loops_no_progress: 15      # Allow more loops for critical features
      stagnation_threshold: 2        # Require more progress per loop

    research_task:
      max_loops_no_progress: 20      # Allow many loops for exploration
      stagnation_threshold: 5        # Allow slower progress

    simple_script:
      max_loops_no_progress: 3       # Quick execution expected
      stagnation_threshold: 10       # High progress required

    documentation:
      max_loops_no_progress: 5       # Moderate loops
      stagnation_threshold: 5        # Moderate progress

    debugging:
      max_loops_no_progress: 8       # Some iteration expected
      stagnation_threshold: 2        # Slow but steady progress
```

### Environment Variables

```bash
# Override project type
export PROJECT_TYPE="critical_feature"

# Custom config file
export CIRCUIT_CONFIG="/path/to/custom-config.yaml"

# Debug mode (verbose logging)
export DEBUG="true"

# Disable circuit breaker (NOT RECOMMENDED)
export CIRCUIT_BREAKER_DISABLED="false"
```

### Runtime Overrides

```bash
# Set project type for single run
PROJECT_TYPE="research_task" ./4-scripts/autonomous-loop.sh run

# Use custom config
CIRCUIT_CONFIG="/custom/config.yaml" ./4-scripts/autonomous-loop.sh run
```

---

## State Transitions

### State Machine

```
                    ┌─────────────────────────────────────┐
                    │         CIRCUIT BREAKER             │
                    │            STATES                  │
                    └─────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────┐
        │      CLOSED       │           │       OPEN         │
        │  (Normal Op)      │           │  (Stopped)        │
        └───────────────────┘           └───────────────────┘
        │                     ▲         │                     ▲
        │                     │         │                     │
        │ Threshold Exceeded  │         │ Manual Reset        │
        │ (Stagnation/Max)    │         │                     │
        │                     │         │                     │
        └─────────────────────┘         └─────────────────────┘
```

### State Descriptions

#### CLOSED State

**Description:** Normal operation, circuit is closed

**Behavior:**
- Autonomous execution continues
- Progress tracking active
- Metrics collected
- Thresholds monitored

**Transitions:**
- → OPEN: When threshold exceeded
- → CLOSED: Stays CLOSED (no transition)

**State File:**
```json
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 0,
  "loop_count": 5,
  "consecutive_no_progress_loops": 0
}
```

#### OPEN State

**Description:** Circuit triggered, execution stopped

**Behavior:**
- Autonomous execution stopped
- State saved
- Event logged
- User notified

**Transitions:**
- → CLOSED: Manual reset required

**State File:**
```json
{
  "status": "OPEN",
  "trigger_reason": "Stagnation: 10 loops without progress",
  "trigger_count": 1,
  "loop_count": 10,
  "consecutive_no_progress_loops": 10,
  "last_trigger_time": 1704123456
}
```

### Transition Triggers

#### CLOSED → OPEN

**Trigger Conditions:**

1. **Stagnation Trigger:**
```bash
if consecutive_no_progress_loops >= max_loops_no_progress:
    trigger_circuit_breaker("Stagnation: {count} loops without progress")
```

2. **Absolute Maximum Trigger:**
```bash
if loop_count >= absolute_max_loops:
    trigger_circuit_breaker("Absolute max: {count} loops")
```

**Example:**
```json
// Before (CLOSED)
{
  "status": "CLOSED",
  "loop_count": 9,
  "consecutive_no_progress_loops": 9
}

// After trigger (OPEN)
{
  "status": "OPEN",
  "trigger_reason": "Stagnation: 10 loops without progress",
  "loop_count": 10,
  "consecutive_no_progress_loops": 10
}
```

#### OPEN → CLOSED

**Trigger:** Manual reset only

```bash
# Reset circuit breaker
./4-scripts/autonomous-loop.sh reset

# Or directly
source 4-scripts/lib/circuit-breaker/circuit-breaker.sh
reset_circuit_breaker
```

**Example:**
```json
// Before (OPEN)
{
  "status": "OPEN",
  "trigger_reason": "Stagnation: 10 loops without progress",
  "trigger_count": 1
}

// After reset (CLOSED)
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 1,
  "consecutive_no_progress_loops": 0
}
```

---

## Failsafe Detection

### Multiple Layers of Protection

```
┌─────────────────────────────────────────────────────────────┐
│                    FAILSAFE LAYERS                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Layer 1      │  │  Layer 2      │  │  Layer 3      │
│  Stagnation   │  │  Loop Count   │  │  Absolute Max │
│  Detection    │  │  Limit        │  │  Hard Limit   │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Any Layer Triggered  │
                │  → Stop Execution     │
                └───────────────────────┘
```

### Layer 1: Stagnation Detection

**Purpose:** Detect when progress has stalled

**Configuration:**
```yaml
max_loops_no_progress: 10    # Trigger after 10 stagnant loops
stagnation_threshold: 3      # Progress < 3% = stagnation
```

**Logic:**
```bash
for each loop:
    progress_delta = current_progress - previous_progress

    if progress_delta < stagnation_threshold:
        consecutive_no_progress_loops += 1
    else:
        consecutive_no_progress_loops = 0

    if consecutive_no_progress_loops >= max_loops_no_progress:
        trigger_circuit_breaker("Stagnation: {count} loops")
```

**Example:**
```
Loop 1: 0% → 5% (delta = 5%, not stagnant)
Loop 2: 5% → 7% (delta = 2%, STAGNANT, count = 1)
Loop 3: 7% → 8% (delta = 1%, STAGNANT, count = 2)
Loop 4: 8% → 9% (delta = 1%, STAGNANT, count = 3)
...
Loop 10: 14% → 15% (delta = 1%, STAGNANT, count = 10)
→ TRIGGER CIRCUIT BREAKER
```

### Layer 2: Loop Count Limit

**Purpose:** Prevent excessive loops even with some progress

**Configuration:**
```yaml
max_loops_no_progress: 10    # Same as stagnation limit
```

**Logic:**
```bash
# This is actually the same check as Layer 1
# But conceptualized as "total loops without GOOD progress"

if consecutive_no_progress_loops >= max_loops_no_progress:
    trigger_circuit_breaker("Too many loops without good progress")
```

### Layer 3: Absolute Maximum

**Purpose:** Hard limit regardless of progress

**Configuration:**
```yaml
absolute_max_loops: 20       # Never exceed 20 loops
```

**Logic:**
```bash
if loop_count >= absolute_max_loops:
    trigger_circuit_breaker("Absolute maximum reached: {count} loops")
```

**Example:**
```
Loop 18: 80% → 85% (good progress)
Loop 19: 85% → 90% (good progress)
Loop 20: 90% → 95% (good progress)
→ TRIGGER CIRCUIT BREAKER (absolute max, even though making progress)
```

### Why Multiple Layers?

**Single Layer Problem:**
```
# Only stagnation detection:
Loop 1-10: No progress (triggered)
# But what if progress is very slow but real?
Loop 1: 0% → 1%
Loop 2: 1% → 2%
...
Loop 50: 49% → 50%
# Would run forever!
```

**Multiple Layers Solution:**
```
# Stagnation detection: Catches no progress
# Loop count limit: Catches slow progress
# Absolute maximum: Hard limit regardless

Result: Comprehensive protection
```

---

## Integration with Ralph Runtime

### How They Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                  RALPH RUNTIME                              │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────────┐               ┌───────────────────┐
│  Circuit Breaker  │◄──────────────┤  Response Analyzer│
│  (Safety System)  │               │  (Progress Track) │
└───────────────────┘               └───────────────────┘
        ▲                                       │
        │                                       │
        │         Provides metrics              │
        └───────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Autonomous Loop      │
        │  - Execute            │
        │  - Analyze            │
        │  - Check Circuit      │
        │  - Continue/Stop      │
        └───────────────────────┘
```

### Data Flow

1. **Autonomous Loop** executes AI agent
2. **Response Analyzer** analyzes response for:
   - Completion score (0-100)
   - Progress delta
   - Confidence level
   - Error count
3. **Circuit Breaker** receives metrics:
   - Current progress
   - Progress delta
   - Loop count
4. **Circuit Breaker** checks thresholds:
   - Stagnation detection
   - Loop count limits
   - Absolute maximum
5. **Circuit Breaker** returns decision:
   - CONTINUE: Within thresholds
   - STOP: Threshold exceeded
6. **Autonomous Loop** acts on decision:
   - CONTINUE: Next loop
   - STOP: Save state, notify user

### Code Integration

**In autonomous-loop.sh:**
```bash
run_autonomous_loop() {
    for ((loop = 1; loop <= max_loops; loop++)); do
        # 1. Execute AI agent
        response=$(execute_ai_agent)

        # 2. Analyze response
        source "$RESPONSE_ANALYZER"
        metrics=$(analyze_response "$response")
        progress=$(extract_progress "$metrics")

        # 3. Update circuit state
        source "$CIRCUIT_BREAKER_LIB"
        update_circuit_state "$progress"

        # 4. Check circuit breaker
        if check_circuit_breaker "$(get_circuit_state)"; then
            echo "🛑 Circuit breaker triggered"
            break
        fi

        # 5. Continue or stop
        # ...
    done
}
```

---

## Best Practices

### 1. Choose Appropriate Thresholds

```bash
# ✅ GOOD: Project-specific thresholds
export PROJECT_TYPE="critical_feature"
# Uses: max_loops=15, stagnation=2

# ✅ GOOD: Research gets more loops
export PROJECT_TYPE="research_task"
# Uses: max_loops=20, stagnation=5

# ❌ BAD: Same thresholds for everything
export PROJECT_TYPE="generic"
# Uses: max_loops=10, stagnation=3
# May trigger too early for complex tasks
```

### 2. Monitor Circuit Status

```bash
# ✅ GOOD: Active monitoring
# Terminal 1
./4-scripts/autonomous-loop.sh run

# Terminal 2
watch -n 2 './4-scripts/autonomous-loop.sh status'

# Terminal 3
tail -f .ralph/logs/circuit_*.log

# ❌ BAD: No monitoring
./4-scripts/autonomous-loop.sh run
# Don't know when circuit triggers
```

### 3. Understand Why Circuit Triggered

```bash
# ✅ GOOD: Investigate before reset
./4-scripts/autonomous-loop.sh status
# Output:
# Status: OPEN
# Trigger reason: Stagnation: 10 loops without progress
# Loop count: 10
# Consecutive no-progress: 10

# Check what happened
cat .ralph/progress.md
# Review progress history

# Then decide: reset or adjust
./4-scripts/autonomous-loop.sh reset

# ❌ BAD: Reset without investigation
./4-scripts/autonomous-loop.sh reset
# Same thing will happen again
```

### 4. Adjust Thresholds Based on Experience

```bash
# ✅ GOOD: Learn and adjust
# First run with critical_feature
export PROJECT_TYPE="critical_feature"
./4-scripts/autonomous-loop.sh run
# Triggers at 15 loops

# But work was progressing well
# Adjust config
nano 4-scripts/lib/circuit-breaker/config.yaml
# Increase to 20 for this type of work

# Try again
./4-scripts/autonomous-loop.sh run
# Completes successfully

# ❌ BAD: Never adjust
# Always uses default thresholds
# May not match actual work patterns
```

### 5. Use Absolute Maximum as Safety Net

```bash
# ✅ GOOD: Set reasonable absolute max
# config.yaml
absolute_max_loops: 20  # Hard limit

# Even if stagnation threshold is met,
# absolute max provides final safety

# ❌ BAD: Set absolute max too high
absolute_max_loops: 1000

# Defeats the purpose of circuit breaker
# Could run for hours with no progress
```

### 6. Log Events for Analysis

```bash
# ✅ GOOD: Review logs regularly
cat .ralph/logs/circuit_20260115.log

# Output:
# [2026-01-15T10:23:45] INIT: Circuit breaker initialized
# [2026-01-15T10:24:12] LOOP: Loop 1, progress 10%
# [2026-01-15T10:24:45] STAGNATION: Loop 2, progress 11%
# ...
# [2026-01-15T10:35:23] TRIGGER: Stagnation: 10 loops

# Understand patterns, adjust accordingly

# ❌ BAD: Ignore logs
# Never review what happened
# Can't improve configuration
```

---

## Examples

### Example 1: Normal Execution

```bash
# Run autonomous loop
./4-scripts/autonomous-loop.sh run

# Output
🚀 Autonomous loop session initialized
   Circuit breaker: CLOSED
   Max loops: 10

=== Loop 1 of 10 ===
Working on tasks...
Progress: 10%
Circuit: CLOSED

=== Loop 2 of 10 ===
Working on tasks...
Progress: 25%
Circuit: CLOSED

=== Loop 3 of 10 ===
Working on tasks...
Progress: 40%
Circuit: CLOSED

...

=== Loop 7 of 10 ===
Working on tasks...
Progress: 100%
✅ Session completed!

# Circuit never triggered
# Work completed normally
```

### Example 2: Stagnation Trigger

```bash
# Run autonomous loop
./4-scripts/autonomous-loop.sh run

# Output
🚀 Autonomous loop session initialized
   Circuit breaker: CLOSED
   Max loops: 10

=== Loop 1 of 10 ===
Working on tasks...
Progress: 10%

=== Loop 2 of 10 ===
Working on tasks...
Progress: 12%
⚠️  Stagnation warning: Progress < 3%

=== Loop 3 of 10 ===
Working on tasks...
Progress: 13%
⚠️  Stagnation count: 2

=== Loop 4 of 10 ===
Working on tasks...
Progress: 14%
⚠️  Stagnation count: 3

...

=== Loop 10 of 10 ===
Working on tasks...
Progress: 20%
🚨 CIRCUIT BREAKER TRIGGERED: Stagnation: 10 loops without progress
   Reason: Stagnation: 10 loops without progress
   Loop count: 10
   Consecutive no-progress: 10

🛑 Execution stopped
```

### Example 3: Absolute Maximum Trigger

```bash
# Run with critical_feature (15 loops max)
export PROJECT_TYPE="critical_feature"
./4-scripts/autonomous-loop.sh run

# Output
🚀 Autonomous loop session initialized
   Circuit breaker: CLOSED
   Max loops: 15
   Absolute max: 20

=== Loop 1-15 ===
Making progress...
Progress: 10% → 50%

=== Loop 16 ===
⚠️  Warning: Exceeded max_loops_no_progress
⚠️  Approaching absolute maximum

=== Loop 17-19 ===
Continuing (good progress)...
Progress: 50% → 95%

=== Loop 20 ===
🚨 CIRCUIT BREAKER TRIGGERED: Absolute max: 20 loops
   Reason: Absolute maximum reached
   Loop count: 20

🛑 Execution stopped
# Even though making progress, absolute max reached
```

### Example 4: Reset After Trigger

```bash
# Circuit triggered
./4-scripts/autonomous-loop.sh status

# Output
=== Circuit Breaker Status ===
Status: OPEN
Trigger reason: Stagnation: 10 loops without progress
Loop count: 10
Consecutive no-progress: 10

# Investigate
cat .ralph/progress.md
# See what progress was made

# Decide to reset and try again
./4-scripts/autonomous-loop.sh reset

# Output
✅ Circuit breaker reset (manual intervention)

# Verify
./4-scripts/autonomous-loop.sh status

# Output
=== Circuit Breaker Status ===
Status: CLOSED
Trigger reason: (empty)
Consecutive no-progress: 0

# Run again
./4-scripts/autonomous-loop.sh run
```

---

## Troubleshooting

### Issue 1: Circuit Triggers Too Early

**Symptom:**
```
🚨 CIRCUIT BREAKER TRIGGERED: Stagnation: 3 loops without progress
```

**Diagnosis:**
```bash
# Check stagnation threshold
cat 4-scripts/lib/circuit-breaker/config.yaml | grep stagnation_threshold

# Check actual progress
cat .ralph/progress.md

# Check progress delta
source 4-scripts/lib/response-analyzer.sh
calculate_progress_delta "$(cat .ralph/last-response.md)"
```

**Solution:**
```bash
# Option 1: Increase stagnation threshold
nano 4-scripts/lib/circuit-breaker/config.yaml
# stagnation_threshold: 3 → 5

# Option 2: Increase max loops
# max_loops_no_progress: 10 → 15

# Option 3: Change project type
export PROJECT_TYPE="research_task"
```

### Issue 2: Circuit Never Triggers

**Symptom:** Loop runs indefinitely

**Diagnosis:**
```bash
# Check if circuit breaker enabled
echo $CIRCUIT_BREAKER_DISABLED

# Check circuit state
cat .ralph/circuit-state.json | jq '.status'
```

**Solution:**
```bash
# Enable circuit breaker
export CIRCUIT_BREAKER_DISABLED="false"

# Or stop manually
pkill -f autonomous-loop
```

### Issue 3: Can't Reset Circuit

**Symptom:**
```bash
./4-scripts/autonomous-loop.sh reset
# Error: Can't reset circuit
```

**Diagnosis:**
```bash
# Check circuit state
cat .ralph/circuit-state.json

# Check file permissions
ls -la .ralph/circuit-state.json
```

**Solution:**
```bash
# Fix permissions
chmod 644 .ralph/circuit-state.json

# Or manually edit
nano .ralph/circuit-state.json
# Change "status": "OPEN" to "status": "CLOSED"
```

### Issue 4: State File Corruption

**Symptom:**
```bash
cat .ralph/circuit-state.json
# Error: Invalid JSON
```

**Solution:**
```bash
# Restore from backup
ls -la .ralph/backups/
cp .ralph/backups/circuit-state_YYYYMMDD_HHMMSS.json \
   .ralph/circuit-state.json

# Or recreate
cat > .ralph/circuit-state.json << 'EOF'
{
  "status": "CLOSED",
  "trigger_reason": "",
  "trigger_count": 0,
  "loop_count": 0,
  "consecutive_no_progress_loops": 0
}
EOF
```

---

## Conclusion

The Circuit Breaker is a critical safety component of Ralph Runtime that prevents resource waste and infinite loops. By understanding its configuration, state transitions, and integration with the response analyzer, you can effectively leverage autonomous execution while maintaining safety.

**Key Takeaways:**
1. Circuit breaker prevents infinite loops through multiple detection layers
2. Configure thresholds appropriate to your task type
3. Monitor circuit status actively during execution
4. Investigate triggers before resetting
5. Adjust thresholds based on experience
6. Use absolute maximum as final safety net
7. Review logs to understand patterns

**Next Steps:**
- Read [Response Analyzer Guide](RESPONSE-ANALYZER-GUIDE.md) for progress tracking details
- Read [Autonomy Guide](AUTONOMY-GUIDE.md) for autonomous execution best practices
- Check [Examples](EXAMPLES-PHASE4.md) for real-world scenarios
