# Autonomy Guide - Phase 4

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Autonomy Levels](#autonomy-levels)
3. [Decision-Making Process](#decision-making-process)
4. [Confidence Scoring](#confidence-scoring)
5. [Human Intervention](#human-intervention)
6. [Learning and Improvement](#learning-and-improvement)
7. [Examples](#examples)

---

## Overview

Autonomous execution enables AI agents to work independently with minimal human supervision. This guide explains the autonomy levels, decision-making process, and how to balance autonomous execution with human oversight.

### What is Autonomy?

**Definition:** The ability of an AI agent to execute tasks without constant human intervention.

**In Blackbox4:**
- AI agents work autonomously within safety boundaries
- Circuit breaker prevents runaway execution
- Response analyzer tracks progress
- Human intervention available when needed

### Autonomy Spectrum

```
No Autonomy ──────────────────────────────────────── Full Autonomy
Manual                              Semi-Autonomous              Fully Autonomous
```

**Manual (Level 0):**
- Human makes all decisions
- AI executes specific commands
- No autonomous execution

**Semi-Autonomous (Level 1-2):**
- AI executes with approval
- Human reviews key decisions
- Circuit breaker protection

**Fully Autonomous (Level 3):**
- AI executes independently
- Circuit breaker protection
- Human intervention on trigger

---

## Autonomy Levels

### Level 0: Manual Execution

**Description:** Human directs every action

**Use When:**
- Learning the system
- Critical production changes
- Complex decision-making required

**Example:**
```bash
# Manual execution
./4-scripts/agents/agent-handoff.sh planner dev
# Human reviews output
# Human decides next action
./4-scripts/agents/agent-handoff.sh dev test
# Human reviews output
# etc.
```

### Level 1: Supervised Autonomy

**Description:** AI executes, human approves each loop

**Use When:**
- New to autonomous execution
- Important but not critical tasks
- Learning autonomous behavior

**Example:**
```bash
# Supervised execution
./4-scripts/autonomous-loop.sh run

# After each loop:
# Review progress
cat .ralph/progress.md

# Approve continuation
echo "continue" > .ralph/continue.signal

# Or stop
echo "stop" > .ralph/stop.signal
```

### Level 2: Guarded Autonomy

**Description:** AI executes autonomously with circuit breaker

**Use When:**
- Well-defined tasks
- Clear success criteria
- Non-critical work

**Example:**
```bash
# Guarded autonomy
export PROJECT_TYPE="simple_script"
./4-scripts/autonomous-loop.sh run

# AI executes autonomously
# Circuit breaker monitors
# Stops if stagnation or max loops
```

### Level 3: Full Autonomy

**Description:** AI executes autonomously, human only on circuit trigger

**Use When:**
- Well-understood tasks
- Tested workflows
- Non-production environments

**Example:**
```bash
# Full autonomy
export PROJECT_TYPE="research_task"
./4-scripts/autonomous-loop.sh run

# AI executes completely autonomously
# Only intervenes if circuit breaker triggers
```

---

## Decision-Making Process

### Autonomous Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│              AUTONOMOUS DECISION MAKING                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Current State        │
                │  - Progress           │
                │  - Context            │
                │  - Resources          │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Assess Situation     │
                │  - What's done?       │
                │  - What's left?       │
                │  - Any blockers?      │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Generate Options     │
                │  - Option A           │
                │  - Option B           │
                │  - Option C           │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Evaluate Options     │
                │  - Feasibility        │
                │  - Risk               │
                │  - Confidence         │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Select Best Option   │
                │  - Highest confidence │
                │  - Lowest risk        │
                │  - Best progress      │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Execute Action       │
                │  - Perform work       │
                │  - Update state       │
                │  - Log results        │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Review Outcome       │
                │  - Success?           │
                │  - Continue?          │
                │  - Adjust?            │
                └───────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
            Success               Need Adjustment
                │                       │
                ▼                       ▼
        ┌──────────┐          ┌──────────────┐
        │ Continue │          │ Reassess     │
        │ Next Loop│          │ New Approach │
        └──────────┘          └──────────────┘
```

### Decision Factors

#### 1. Completion Status

```bash
# Check completion
if completion_score >= 100:
    decision = "STOP - Complete"
elif completion_score >= 80:
    decision = "CONTINUE - Almost done"
elif completion_score >= 50:
    decision = "CONTINUE - Good progress"
elif completion_score >= 20:
    decision = "CONTINUE - Some progress"
else:
    decision = "REASSESS - Low progress"
```

#### 2. Confidence Level

```bash
# Check confidence
if confidence >= 80:
    decision = "CONTINUE - High confidence"
elif confidence >= 50:
    decision = "CONTINUE - Medium confidence"
elif confidence >= 20:
    decision = "CAREFUL - Low confidence"
else:
    decision = "STOP - Too uncertain"
```

#### 3. Error Count

```bash
# Check errors
if error_count == 0:
    decision = "CONTINUE - No errors"
elif error_count < 3:
    decision = "CONTINUE - Few errors"
elif error_count < 5:
    decision = "CAREFUL - Several errors"
else:
    decision = "STOP - Too many errors"
```

#### 4. Circuit State

```bash
# Check circuit
if circuit_status == "OPEN":
    decision = "STOP - Circuit triggered"
elif stagnation_count >= threshold - 2:
    decision = "CAREFUL - Approaching limit"
else:
    decision = "CONTINUE - Safe"
```

---

## Confidence Scoring

### How Confidence is Calculated

**Components:**
1. Explicit confidence (words like "confident", "sure")
2. Implicit confidence (language patterns)
3. Track record (historical success)

### Confidence Levels

**Very High (80-100):**
- Explicit confidence indicators
- No hedge words
- Certainty words present
- Good track record

**High (60-79):**
- Some confidence indicators
- Few hedge words
- Decent track record

**Medium (40-59):**
- Neutral language
- Mix of confidence and uncertainty
- Mixed track record

**Low (20-39):**
- Uncertainty indicators
- Many hedge words
- Poor track record

**Very Low (0-19):**
- Explicit uncertainty
- No confidence indicators
- Very poor track record

### Using Confidence in Decisions

```bash
# Decision based on confidence
if confidence >= 80:
    # Autonomous execution
    execute_without_approval()
elif confidence >= 50:
    # Execute with logging
    execute_with_logging()
elif confidence >= 20:
    # Execute with caution
    execute_with_caution()
else:
    # Require human intervention
    request_human_intervention()
```

---

## Human Intervention

### When to Intervene

**Automatic Intervention (Circuit Breaker):**
- Stagnation detected
- Maximum loops reached
- Absolute maximum reached

**Manual Intervention (Human Decision):**
- Low confidence (<20%)
- High error count (>5)
- Unexpected behavior
- Wrong direction

### How to Intervene

**1. Stop Execution:**
```bash
# Find process
ps aux | grep autonomous-loop

# Stop process
kill <PID>

# Or use circuit breaker
./4-scripts/autonomous-loop.sh reset
```

**2. Adjust and Continue:**
```bash
# Review progress
cat .ralph/progress.md

# Adjust approach
nano README.md  # Update instructions

# Reset circuit
./4-scripts/autonomous-loop.sh reset

# Continue
./4-scripts/autonomous-loop.sh run
```

**3. Take Over Manually:**
```bash
# Stop autonomous execution
./4-scripts/autonomous-loop.sh reset

# Continue manually
./4-scripts/agents/agent-handoff.sh <from> <to>
```

### Intervention Signals

```bash
# Create continue signal
echo "continue" > .ralph/continue.signal

# Create stop signal
echo "stop" > .ralph/stop.signal

# Create reassess signal
echo "reassess" > .ralph/reassess.signal
```

---

## Learning and Improvement

### Learning from Execution

**What to Track:**
1. Success rate (completion %)
2. Average loops to completion
3. Common stagnation points
4. Typical confidence levels
5. Error patterns

**How to Use Data:**

```bash
# Review execution history
cat .ralph/logs/circuit_*.log

# Identify patterns
# - Where does it usually get stuck?
# - What confidence level is typical?
# - How many loops are needed?

# Adjust configuration
nano 4-scripts/lib/circuit-breaker/config.yaml

# Improve over time
```

### Continuous Improvement

**1. Refine Success Criteria:**
```bash
# Make completion criteria explicit
cat > README.md << 'EOF'
# Feature X

## Success Criteria
- [ ] All tests pass (pytest)
- [ ] Coverage > 80% (pytest-cov)
- [ ] Documentation complete (docs/)
- [ ] Code review approved
EOF
```

**2. Adjust Thresholds:**
```bash
# Based on historical data
# If typical tasks need 15 loops:
max_loops_no_progress: 15

# If progress is usually slow:
stagnation_threshold: 2
```

**3. Improve Instructions:**
```bash
# Provide clearer context
cat > README.md << 'EOF'
# Feature X Implementation

## Context
- Using FastAPI framework
- PostgreSQL database
- React frontend

## Constraints
- Must maintain backward compatibility
- No breaking changes to API
- Response time < 200ms
EOF
```

---

## Examples

### Example 1: Level 2 Autonomy (Guarded)

```bash
# Setup
mkdir -p guarded-task && cd guarded-task
cat > README.md << 'EOF'
# Implement User API

## Tasks
- [ ] Create user model
- [ ] Implement CRUD endpoints
- [ ] Add authentication
- [ ] Write tests

## Success Criteria
All tests passing, documented API
EOF

# Execute with guardrails
export PROJECT_TYPE="critical_feature"
../../4-scripts/autonomous-loop.sh run

# Monitor
watch -n 2 '../../4-scripts/autonomous-loop.sh status'

# Result: Executes autonomously, circuit breaker protects
```

### Example 2: Level 3 Autonomy (Full)

```bash
# Setup
mkdir -p research-task && cd research-task
cat > README.md << 'EOF'
# Research AI Frameworks

Compare Blackbox4, LangGraph, AutoGen, CrewAI

## Success Criteria
- [ ] All frameworks analyzed
- [ ] Comparison document created
- [ ] Recommendations made
EOF

# Execute with full autonomy
export PROJECT_TYPE="research_task"
../../4-scripts/autonomous-loop.sh run

# Result: Executes completely autonomously
```

### Example 3: Human Intervention

```bash
# Autonomous execution running
./4-scripts/autonomous-loop.sh run

# In another terminal, check status
./4-scripts/autonomous-loop.sh status

# Output shows:
# Status: OPEN
# Trigger reason: Stagnation: 10 loops without progress

# Decide to intervene
# Option 1: Reset and try again
./4-scripts/autonomous-loop.sh reset

# Option 2: Adjust approach
nano README.md  # Clarify instructions
./4-scripts/autonomous-loop.sh reset
./4-scripts/autonomous-loop.sh run

# Option 3: Take over manually
./4-scripts/autonomous-loop.sh reset
./4-scripts/agents/agent-handoff.sh planner dev
```

---

## Conclusion

Autonomous execution provides powerful capabilities while maintaining safety through circuit breaker protection. By understanding autonomy levels, decision-making processes, and when to intervene, you can effectively leverage autonomous execution for a wide range of tasks.

**Key Takeaways:**
1. Choose autonomy level appropriate to task
2. Monitor circuit status actively
3. Intervene when confidence is low
4. Learn from execution history
5. Continuously improve criteria
6. Always maintain safety boundaries

**Next Steps:**
- Read [Ralph Runtime Guide](RALPH-RUNTIME-GUIDE.md) for complete autonomous execution details
- Read [Integration Guide](INTEGRATION-PHASE4-GUIDE.md) for integration with Phase 1-3
- Check [Examples](EXAMPLES-PHASE4.md) for real-world scenarios
