# Ralph Runtime Guide - Phase 4

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [When to Use Autonomous Execution](#when-to-use-autonomous-execution)
3. [Runtime Architecture](#runtime-architecture)
4. [Autonomous Execution Workflow](#autonomous-execution-workflow)
5. [Best Practices](#best-practices)
6. [Common Patterns](#common-patterns)
7. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
8. [Configuration Guide](#configuration-guide)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Ralph Runtime is Blackbox4's autonomous execution system that enables AI agents to work independently with built-in safety mechanisms. It combines the power of autonomous execution with circuit breaker protection, response analysis, and real-time monitoring.

### Key Components

- **Autonomous Loop Wrapper:** Main execution controller
- **Circuit Breaker:** Safety system preventing infinite loops
- **Response Analyzer:** Progress tracking and quality assessment
- **State Management:** Persistent state with backup/recovery
- **Monitoring System:** Real-time visibility into execution

### Core Benefits

1. **Autonomous Execution:** Agents work without constant supervision
2. **Safety First:** Circuit breaker prevents runaway processes
3. **Progress Visibility:** Real-time monitoring and tracking
4. **State Persistence:** Automatic saving and recovery
5. **Production Ready:** Battle-tested safety mechanisms

---

## When to Use Autonomous Execution

### Ideal Use Cases

#### 1. Well-Defined Tasks

```bash
# Task has clear completion criteria
./4-scripts/autonomous-loop.sh run

# Good for:
# - Feature implementation (clear specs)
# - Bug fixes (reproducible issues)
# - Documentation (structured formats)
# - Test generation (defined coverage)
```

**Why:** Clear completion criteria allow response analyzer to detect success.

#### 2. Multi-Step Workflows

```bash
# Complex workflows with multiple steps
./4-scripts/autonomous-loop.sh run

# Good for:
# - Feature development (design → implement → test)
# - Code refactoring (analyze → refactor → verify)
# - Documentation updates (research → write → review)
```

**Why:** Autonomous execution can handle multi-step processes with circuit breaker protection.

#### 3. Repetitive Tasks

```bash
# Similar tasks across multiple projects
for project in project1 project2 project3; do
    cd $project
    ../4-scripts/autonomous-loop.sh run
done

# Good for:
# - Consistent code style enforcement
# - Standard documentation updates
# - Regular maintenance tasks
```

**Why:** Autonomous execution ensures consistency across similar tasks.

#### 4. Exploratory Work

```bash
# Research and exploration
export PROJECT_TYPE="research_task"
./4-scripts/autonomous-loop.sh run

# Good for:
# - Competitive analysis
# - Technology research
# - Proof of concepts
```

**Why:** Research mode allows more loops for exploration.

### When NOT to Use

#### 1. Ambiguous Requirements

```bash
# ❌ AVOID: Unclear what success looks like
./4-scripts/autonomous-loop.sh run

# Problem: Response analyzer can't detect completion
# Risk: Circuit breaker triggers before useful work done
```

**Solution:** Use structured spec creation first (Phase 3) to clarify requirements.

#### 2. Critical Production Systems

```bash
# ❌ AVOID: Direct autonomous execution on production
./4-scripts/autonomous-loop.sh run

# Problem: Too risky for critical systems
# Risk: Unintended changes
```

**Solution:** Use autonomous execution for development, manual deployment for production.

#### 3. Human-Centric Decisions

```bash
# ❌ AVOID: Tasks requiring human judgment
./4-scripts/autonomous-loop.sh run

# Problem: Can't automate subjective decisions
# Risk: Poor outcomes from automated choices
```

**Solution:** Use autonomous execution for preparation, human review for decisions.

---

## Runtime Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     BLACKBOX4 SYSTEM                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Phase 1     │  │  Phase 2     │  │  Phase 3     │
│  Context     │  │  Tasks       │  │  Specs       │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                ┌───────────────────────────┐
                │    RALPH RUNTIME (Phase 4) │
                └───────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Autonomous  │  │  Circuit     │  │  Response    │
│  Loop        │  │  Breaker     │  │  Analyzer    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                ┌───────────────────────────┐
                │  STATE & MONITORING       │
                │  - Progress Tracking      │
                │  - Event Logging          │
                │  - Backup/Recovery        │
                └───────────────────────────┘
```

### Component Details

#### 1. Autonomous Loop Wrapper

**File:** `4-scripts/autonomous-loop.sh`

**Responsibilities:**
- Initialize circuit breaker
- Convert .blackbox4 format to Ralph format
- Execute autonomous loop
- Monitor progress
- Handle state persistence

**Key Functions:**
```bash
init_session()              # Initialize circuit breaker and state
run_autonomous_loop()       # Main autonomous execution loop
monitor_session()           # Real-time progress monitoring
update_progress()           # Update progress tracking
convert_to_ralph_format()   # Format conversion
```

#### 2. Circuit Breaker

**File:** `4-scripts/lib/circuit-breaker/circuit-breaker.sh`

**Responsibilities:**
- Track loop metrics
- Detect stagnation
- Trigger circuit when thresholds exceeded
- Manage state transitions
- Log circuit events

**Key Functions:**
```bash
init_circuit_state()        # Initialize circuit state
check_circuit_breaker()     # Check if circuit should trigger
track_loop_metrics()        # Track loop execution
trigger_circuit_breaker()   # Open circuit (stop execution)
reset_circuit_breaker()     # Close circuit (manual reset)
```

#### 3. Response Analyzer

**File:** `4-scripts/lib/response-analyzer.sh`

**Responsibilities:**
- Analyze AI responses
- Calculate completion scores
- Extract confidence levels
- Detect errors
- Calculate progress delta

**Key Functions:**
```bash
analyze_response()          # Main analysis function
extract_completion_score()  # Calculate completion (0-100)
extract_confidence()        # Extract confidence (0-100)
extract_errors()            # Count error indicators
calculate_progress_delta()  # Measure progress change
```

#### 4. State Management

**Files:**
- `.ralph/circuit-state.json` - Circuit breaker state
- `.ralph/progress.md` - Progress tracking
- `.ralph/last-response.md` - Last AI response
- `.ralph/@fix_plan.md` - Task completion tracking

**Responsibilities:**
- Persistent state storage
- Automatic backups
- State recovery
- Event history

---

## Autonomous Execution Workflow

### Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS EXECUTION                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  1. INITIALIZATION    │
                │  - Load config        │
                │  - Init circuit       │
                │  - Create directories │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  2. FORMAT CONVERSION │
                │  - Read .blackbox4    │
                │  - Generate PROMPT.md │
                │  - Extract tasks      │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  3. EXECUTION LOOP    │
                │  ┌─────────────────┐  │
                │  │ Execute AI Agent│  │
                │  └─────────────────┘  │
                │           │            │
                │           ▼            │
                │  ┌─────────────────┐  │
                │  │ Save Response   │  │
                │  └─────────────────┘  │
                │           │            │
                │           ▼            │
                │  ┌─────────────────┐  │
                │  │ Analyze Response│  │
                │  │ - Completion    │  │
                │  │ - Confidence    │  │
                │  │ - Errors        │  │
                │  └─────────────────┘  │
                │           │            │
                │           ▼            │
                │  ┌─────────────────┐  │
                │  │ Update Circuit  │  │
                │  │ - Loop count    │  │
                │  │ - Stagnation    │  │
                │  └─────────────────┘  │
                │           │            │
                │           ▼            │
                │  ┌─────────────────┐  │
                │  │ Check Circuit   │  │
                │  └─────────────────┘  │
                │     │           │      │
                │  TRIGGERED    NOT      │
                │     │           │      │
                │     ▼           ▼      │
                │  ┌────┐   ┌────────┐  │
                │  │STOP│   │Continue│  │
                │  └────┘   └────────┘  │
                └───────────────────────┘
                            │
                    (Continue loop)
                            │
                            ▼
                ┌───────────────────────┐
                │  4. COMPLETION CHECK  │
                │  - Progress = 100%?   │
                │  - All tasks done?    │
                └───────────────────────┘
                     │           │
                 Complete     Continue
                     │           │
                     ▼           ▼
              ┌──────────┐  ┌──────────┐
              │ SUCCESS  │  │ Next Loop│
              └──────────┘  └──────────┘
```

### Step-by-Step Breakdown

#### Step 1: Initialization

```bash
# Initialize autonomous session
./4-scripts/autonomous-loop.sh init

# What happens:
# 1. Load circuit breaker configuration
# 2. Initialize circuit state (CLOSED)
# 3. Create .ralph directories
# 4. Initialize progress tracking
# 5. Create state files
```

**Output:**
```
🚀 Autonomous loop session initialized
   Circuit breaker: CLOSED
   Max loops: 10
```

#### Step 2: Format Conversion

```bash
# Convert .blackbox4 format to Ralph format
./4-scripts/autonomous-loop.sh convert

# What happens:
# 1. Read README.md (project overview)
# 2. Read checklist.md (task list)
# 3. Generate .ralph/PROMPT.md (combined)
# 4. Extract task items
# 5. Create status tracking
```

**Generated Files:**
```
.ralph/
├── PROMPT.md          # Combined project context
└── status.md          # Status tracking
```

#### Step 3: Execution Loop

```bash
# Run autonomous loop
./4-scripts/autonomous-loop.sh run

# Loop execution (each iteration):
# 1. Execute AI agent with current context
# 2. Save response to .ralph/last-response.md
# 3. Analyze response (completion, confidence, errors)
# 4. Update circuit state (loop count, stagnation)
# 5. Check circuit breaker
# 6. If triggered: stop
# 7. If not triggered: continue
```

**Sample Loop Output:**
```
=== Loop 1 of 10 ===
Working on tasks...
Progress: 10%
⏱️  Loops: 1
⏱️  Stagnations: 0

=== Loop 2 of 10 ===
Working on tasks...
Progress: 25%
⏱️  Loops: 2
⏱️  Stagnations: 0
```

#### Step 4: Completion Check

```bash
# Monitor for completion
./4-scripts/autonomous-loop.sh monitor

# Completion indicators:
# 1. Progress = 100%
# 2. All tasks in @fix_plan.md completed
# 3. "done" or "complete" in response
# 4. No remaining work items
```

**Completion Output:**
```
✅ Session completed!
   Total loops: 7
   Final progress: 100%
```

---

## Best Practices

### 1. Define Clear Success Criteria

```bash
# ✅ GOOD: Clear completion criteria
cat > README.md << 'EOF'
# Feature X Implementation

## Success Criteria
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code review approved
- [ ] Deployed to staging

## Completion
Feature is complete when all tests pass and documentation is updated.
EOF

./4-scripts/autonomous-loop.sh run
```

```bash
# ❌ BAD: Vague criteria
cat > README.md << 'EOF'
# Feature X Implementation

Work on the feature.
EOF

./4-scripts/autonomous-loop.sh run

# Problem: Circuit breaker triggers before clear completion
```

### 2. Set Appropriate Thresholds

```bash
# ✅ GOOD: Project-specific thresholds
cat > 4-scripts/lib/circuit-breaker/config.yaml << 'EOF'
circuit_breaker:
  projects:
    critical_feature:
      max_loops_no_progress: 15
      stagnation_threshold: 2
    research_task:
      max_loops_no_progress: 20
      stagnation_threshold: 5
    simple_script:
      max_loops_no_progress: 3
      stagnation_threshold: 10
EOF

export PROJECT_TYPE="critical_feature"
./4-scripts/autonomous-loop.sh run
```

```bash
# ❌ BAD: One-size-fits-all
export PROJECT_TYPE="generic"
./4-scripts/autonomous-loop.sh run

# Problem: May trigger too early for complex tasks
```

### 3. Monitor Progress

```bash
# ✅ GOOD: Active monitoring
# Terminal 1: Run autonomous loop
./4-scripts/autonomous-loop.sh run

# Terminal 2: Monitor progress
./4-scripts/autonomous-loop.sh monitor

# Terminal 3: Check status periodically
watch -n 5 './4-scripts/autonomous-loop.sh status'
```

```bash
# ❌ BAD: Fire and forget
./4-scripts/autonomous-loop.sh run
# No monitoring, come back hours later

# Problem: Can't intervene if something goes wrong
```

### 4. Use Context Variables

```bash
# ✅ GOOD: Multi-tenant context
export TENANT_ID="acme_001"
export TENANT_NAME="Acme Corp"
export PROJECT_TYPE="critical_feature"

./4-scripts/autonomous-loop.sh run

# Benefits:
# - Context-aware execution
# - Tenant-specific thresholds
# - Isolated progress tracking
```

```bash
# ❌ BAD: No context
./4-scripts/autonomous-loop.sh run

# Problem: Lost context across tenants
```

### 5. Test Before Full Autonomy

```bash
# ✅ GOOD: Test run first
./4-scripts/autonomous-loop.sh init
./4-scripts/autonomous-loop.sh convert
# Review PROMPT.md
# Make adjustments
./4-scripts/autonomous-loop.sh run
```

```bash
# ❌ BAD: Immediate autonomous run
./4-scripts/autonomous-loop.sh run

# Problem: No preview of what will be executed
```

---

## Common Patterns

### Pattern 1: Feature Development

```bash
# 1. Create spec
python3 4-scripts/planning/spec-create.py create \
    --name "User Authentication"

# 2. Break down into tasks
./hierarchical-plan.sh breakdown

# 3. Run autonomous execution
export PROJECT_TYPE="critical_feature"
./4-scripts/autonomous-loop.sh run

# 4. Monitor progress
./4-scripts/autonomous-loop.sh monitor
```

### Pattern 2: Bug Fix

```bash
# 1. Document bug
cat > README.md << 'EOF'
# Bug Fix: Login Not Working

## Issue
Users cannot login with valid credentials

## Steps to Reproduce
1. Go to /login
2. Enter valid credentials
3. Click login
4. Error occurs

## Expected Behavior
User should be logged in

## Success Criteria
- [ ] Bug reproduced
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Tests added
- [ ] Verified working
EOF

# 2. Run autonomous execution
export PROJECT_TYPE="simple_script"
./4-scripts/autonomous-loop.sh run
```

### Pattern 3: Documentation Update

```bash
# 1. Create documentation plan
cat > README.md << 'EOF'
# API Documentation Update

## Sections to Update
- [ ] Authentication
- [ ] Users endpoint
- [ ] Projects endpoint
- [ ] Examples

## Success Criteria
All sections updated with:
- Description
- Parameters
- Response format
- Examples
EOF

# 2. Run autonomous execution
./4-scripts/autonomous-loop.sh run
```

### Pattern 4: Multi-Tenant Development

```bash
# 1. Set tenant context
export TENANT_ID="acme_001"
export TENANT_NAME="Acme Corp"
export PROJECT_TYPE="critical_feature"

# 2. Create tenant-specific spec
python3 4-scripts/planning/spec-create.py create \
    --name "Acme Custom Feature" \
    --context tenant_id=acme_001

# 3. Run autonomous execution
./4-scripts/autonomous-loop.sh run

# 4. Repeat for other tenants
export TENANT_ID="globex_001"
export TENANT_NAME="Globex Inc"
./4-scripts/autonomous-loop.sh run
```

### Pattern 5: Research Task

```bash
# 1. Define research goals
cat > README.md << 'EOF'
# Competitive Analysis Research

## Research Questions
1. What are competitors doing?
2. What are their strengths?
3. What are their weaknesses?
4. What can we learn?

## Success Criteria
- [ ] 5 competitors analyzed
- [ ] Strengths documented
- [ ] Weaknesses documented
- [ ] Recommendations made
EOF

# 2. Run with research thresholds
export PROJECT_TYPE="research_task"
./4-scripts/autonomous-loop.sh run
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Unclear Success Criteria

```bash
# ❌ AVOID
cat > README.md << 'EOF'
# Work on Stuff

Do some work and things.
EOF

./4-scripts/autonomous-loop.sh run

# Problem: Circuit breaker can't detect completion
# Risk: Wasted loops, premature stop
```

**Solution:** Always define clear success criteria.

### Anti-Pattern 2: Ignoring Circuit Breaker

```bash
# ❌ AVOID
# Set too high thresholds
cat > config.yaml << 'EOF'
circuit_breaker:
  max_loops_no_progress: 1000
  absolute_max_loops: 10000
EOF

./4-scripts/autonomous-loop.sh run

# Problem: Defeats safety mechanism
# Risk: Actual infinite loop
```

**Solution:** Use reasonable thresholds appropriate to task complexity.

### Anti-Pattern 3: No Monitoring

```bash
# ❌ AVOID
./4-scripts/autonomous-loop.sh run
# Close terminal, go home

# Problem: Can't intervene if something goes wrong
# Risk: Wasted time, incorrect results
```

**Solution:** Always monitor autonomous execution.

### Anti-Pattern 4: Mixing Contexts

```bash
# ❌ AVOID
export TENANT_ID="acme_001"
./4-scripts/autonomous-loop.sh run &
export TENANT_ID="globex_001"
./4-scripts/autonomous-loop.sh run &

# Problem: Context confusion
# Risk: Cross-contamination between tenants
```

**Solution:** Run autonomous executions sequentially or in separate directories.

### Anti-Pattern 5: Ignoring Warnings

```bash
# ❌ AVOID
./4-scripts/autonomous-loop.sh run

# Output shows:
# ⚠️  Warning: 7 consecutive loops without progress
# ⚠️  Warning: Approaching circuit breaker threshold

# Ignore warnings, let it run

# Problem: Circuit breaker will trigger soon
# Risk: Unexpected stop
```

**Solution:** Pay attention to warnings and intervene if needed.

---

## Configuration Guide

### Circuit Breaker Configuration

**File:** `4-scripts/lib/circuit-breaker/config.yaml`

```yaml
# Default configuration
circuit_breaker:
  # Maximum consecutive loops without meaningful progress
  max_loops_no_progress: 10

  # Minimum progress percentage to avoid stagnation
  stagnation_threshold: 3

  # Cooldown period after circuit trigger (seconds)
  cooldown_seconds: 300

  # Absolute maximum loops regardless of progress
  absolute_max_loops: 20

  # Warning level loops
  warning_threshold: 8

  # Critical level loops
  critical_threshold: 15

  # Project-specific configurations
  projects:
    critical_feature:
      max_loops_no_progress: 15
      stagnation_threshold: 2

    research_task:
      max_loops_no_progress: 20
      stagnation_threshold: 5

    simple_script:
      max_loops_no_progress: 3
      stagnation_threshold: 10

    documentation:
      max_loops_no_progress: 5
      stagnation_threshold: 5
```

### Environment Variables

```bash
# Project type
export PROJECT_TYPE="critical_feature"

# Tenant context (Phase 1)
export TENANT_ID="acme_001"
export TENANT_NAME="Acme Corp"

# Debug mode
export DEBUG="true"

# Custom config file
export CIRCUIT_CONFIG="/path/to/custom-config.yaml"
```

### State File Locations

```bash
# Circuit breaker state
.ralph/circuit-state.json

# Progress tracking
.ralph/progress.md

# Last response
.ralph/last-response.md

# Fix plan (task completion)
.ralph/@fix_plan.md

# Logs
.ralph/logs/circuit_YYYYMMDD.log
.ralph/logs/progress_YYYYMMDD.log

# Backups
.ralph/backups/circuit-state_YYYYMMDD_HHMMSS.json
```

---

## Examples

### Example 1: Simple Feature

```bash
# Setup
mkdir -p my-feature && cd my-feature
cat > README.md << 'EOF'
# User Profile Feature

Add user profile page with:
- Profile picture
- Bio
- Contact information

## Success Criteria
- [ ] Profile page created
- [ ] All fields working
- [ ] Responsive design
- [ ] Tests passing
EOF

# Run
export PROJECT_TYPE="simple_script"
../../4-scripts/autonomous-loop.sh run

# Output
🚀 Autonomous loop session initialized
   Circuit breaker: CLOSED
   Max loops: 3

=== Loop 1 of 3 ===
Working on tasks...
Progress: 33%
✅ Profile page created

=== Loop 2 of 3 ===
Working on tasks...
Progress: 66%
✅ All fields working

=== Loop 3 of 3 ===
Working on tasks...
Progress: 100%
✅ Session completed!
```

### Example 2: Complex Feature with Monitoring

```bash
# Terminal 1: Run autonomous execution
cd complex-feature
export PROJECT_TYPE="critical_feature"
../../4-scripts/autonomous-loop.sh run

# Terminal 2: Monitor in real-time
cd complex-feature
watch -n 2 '../../4-scripts/autonomous-loop.sh status'

# Output (updates every 2 seconds)
=== Circuit Breaker Status ===
Status: CLOSED
Loop count: 5
Consecutive no-progress: 0
Trigger count: 0

=== Progress Tracking ===
Current Task: Implement authentication
Progress: 60%
Loops: 5
Stagnation Count: 0

# Terminal 3: View logs
tail -f .ralph/logs/progress_*.log
```

### Example 3: Research Task

```bash
# Setup research task
mkdir -p research && cd research
cat > README.md << 'EOF'
# AI Framework Comparison

Compare Blackbox4, LangGraph, AutoGen, CrewAI

## Success Criteria
- [ ] All frameworks researched
- [ ] Features compared
- [ ] Pros/cons documented
- [ ] Recommendations made
EOF

# Run with research thresholds
export PROJECT_TYPE="research_task"
../../4-scripts/autonomous-loop.sh run

# Output
🚀 Autonomous loop session initialized
   Circuit breaker: CLOSED
   Max loops: 20

=== Loop 1 of 20 ===
Researching Blackbox4...
Progress: 20%

=== Loop 2 of 20 ===
Researching LangGraph...
Progress: 40%

...

=== Loop 10 of 20 ===
Comparing features...
Progress: 80%

=== Loop 12 of 20 ===
✅ Session completed!
Total loops: 12
Final progress: 100%
```

---

## Troubleshooting

### Issue 1: Circuit Breaker Triggers Too Early

**Symptom:**
```
🚨 CIRCUIT BREAKER TRIGGERED: Stagnation: 10 loops without progress
```

**Solution:**
```bash
# 1. Check what progress was made
cat .ralph/progress.md

# 2. Adjust thresholds if needed
nano 4-scripts/lib/circuit-breaker/config.yaml

# 3. Reset circuit breaker
./4-scripts/autonomous-loop.sh reset

# 4. Run again
./4-scripts/autonomous-loop.sh run
```

### Issue 2: Can't Detect Completion

**Symptom:** Loop reaches max without detecting completion

**Solution:**
```bash
# 1. Check actual response
cat .ralph/last-response.md

# 2. Verify @fix_plan.md
cat .ralph/@fix_plan.md

# 3. Update success criteria in README.md
# Make completion criteria explicit

# 4. Run again
./4-scripts/autonomous-loop.sh run
```

### Issue 3: Progress Not Updating

**Symptom:** Progress stays at same percentage

**Solution:**
```bash
# 1. Check response analyzer
source 4-scripts/lib/response-analyzer.sh
analyze_response "$(cat .ralph/last-response.md)"

# 2. Verify task completion markers
# Use - [x] for completed tasks

# 3. Add explicit completion indicators
# "Complete", "Done", "Finished" in response

# 4. Run again
./4-scripts/autonomous-loop.sh run
```

### Issue 4: State Corruption

**Symptom:** Can't read circuit state

**Solution:**
```bash
# 1. Restore from backup
ls -la .ralph/backups/
cp .ralph/backups/circuit-state_YYYYMMDD_HHMMSS.json \
   .ralph/circuit-state.json

# 2. Verify state
cat .ralph/circuit-state.json | jq '.'

# 3. Run again
./4-scripts/autonomous-loop.sh run
```

### Issue 5: Multiple Sessions Conflicting

**Symptom:** Progress tracking mixed up

**Solution:**
```bash
# 1. Use separate directories for each session
mkdir -p session1 session2

# 2. Run each in its own directory
cd session1
../../4-scripts/autonomous-loop.sh run

cd ../session2
../../4-scripts/autonomous-loop.sh run

# 3. Or use unique session IDs
export SESSION_ID="session_$(date +%s)"
```

---

## Conclusion

Ralph Runtime provides production-ready autonomous execution with built-in safety mechanisms. By following the best practices and avoiding anti-patterns, you can leverage autonomous execution for a wide range of tasks while maintaining control and visibility.

**Key Takeaways:**
1. Always define clear success criteria
2. Set appropriate thresholds for your task type
3. Monitor progress actively
4. Use context variables for multi-tenant scenarios
5. Test before full autonomous execution
6. Pay attention to warnings
7. Leverage the safety systems (circuit breaker, response analyzer)

**Next Steps:**
- Read [Circuit Breaker Guide](CIRCUIT-BREAKER-GUIDE.md) for detailed safety system information
- Read [Response Analyzer Guide](RESPONSE-ANALYZER-GUIDE.md) for progress tracking details
- Check [Examples](EXAMPLES-PHASE4.md) for real-world scenarios
