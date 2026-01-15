# Ralph Runtime Examples - Comprehensive Guide

This directory contains comprehensive examples demonstrating Ralph Runtime's autonomous execution capabilities in Blackbox4 Phase 4.

## Overview

Ralph Runtime is the autonomous execution engine that powers Blackbox4. These examples demonstrate its core features:

- **Autonomous Execution**: Hands-off execution with intelligent decision-making
- **Circuit Breaker Pattern**: Protection against cascading failures
- **Multi-Agent Coordination**: Seamless agent handoffs and collaboration
- **Error Recovery**: Automatic detection and recovery from errors
- **Decision Making**: Confidence-based autonomous decisions
- **Progress Monitoring**: Real-time tracking and prediction
- **Interactive Control**: User-guided execution with intervention points

## Examples

### 1. Basic Autonomous Execution (`basic_autonomous_execution.py`)

**Purpose**: Demonstrates the fundamental autonomous execution workflow.

**What it shows**:
- Creating a simple execution plan
- Initializing Ralph Runtime
- Autonomous task execution
- Progress monitoring
- Completion handling
- Result extraction and logging

**Expected Output**:
```
=== Creating Simple Plan ===
✓ Plan created: basic-autonomous-001
✓ Plan name: Basic Autonomous Demo
✓ Number of tasks: 4
✓ Execution mode: autonomous

=== Initializing Ralph Runtime ===
✓ Ralph Runtime initialized
✓ Workspace: /path/to/.blackbox4
✓ Circuit breaker: enabled
✓ Progress monitoring: enabled

=== Starting Autonomous Execution ===
[Progress] Task task-1: completed (25%)
[Decision] task_priority: Prioritized critical tasks first
[Progress] Task task-2: completed (50%)
[Progress] Task task-3: completed (75%)
[Progress] Task task-4: completed (100%)

=== Handling Completion ===
Completion Status: completed
✓ All tasks completed successfully
```

**How to Run**:
```bash
python basic_autonomous_execution.py
```

**Customization Tips**:
- Modify `create_simple_plan()` to add your own tasks
- Adjust `execution_config` for different execution modes
- Change callback function `_progress_callback()` for custom logging

---

### 2. Autonomous with Circuit Breaker (`autonomous_with_circuit_breaker.py`)

**Purpose**: Demonstrates circuit breaker pattern for fault tolerance.

**What it shows**:
- Circuit breaker configuration
- Normal operation (closed state)
- Failure detection and circuit opening
- Request blocking during failures
- Auto-recovery mechanisms
- State transitions (closed → open → half-open → closed)

**Expected Output**:
```
=== Configuring Circuit Breaker ===
✓ Circuit breaker configured:
  - Failure threshold: 3
  - Recovery timeout: 5s
  - Initial state: closed

=== Executing with Circuit Breaker ===
[Progress] Task safe-task-1: completed
[Progress] Task risky-task-1: failed

[⚡ CIRCUIT STATE TRANSITION]
  closed -> open
  Time: 14:32:15
Circuit OPEN - Blocking requests to prevent cascading failures

[⚠ BLOCKED] Request blocked - circuit is OPEN

[⚡ CIRCUIT STATE TRANSITION]
  open -> half_open
  Time: 14:32:20
Circuit HALF-OPEN - Testing if service has recovered

[⚡ CIRCUIT STATE TRANSITION]
  half-open -> closed
  Time: 14:32:22
Circuit CLOSED - Normal operation resumed
```

**How to Run**:
```bash
python autonomous_with_circuit_breaker.py
```

**Key Features**:
- Configurable failure thresholds
- Automatic state transitions
- Request blocking during failures
- Recovery testing
- Metrics and monitoring

**Customization Tips**:
- Adjust `failure_threshold` for sensitivity
- Change `recovery_timeout` for recovery speed
- Modify `risk_level` in tasks to trigger circuit breaker

---

### 3. Multi-Agent Coordination (`multi_agent_coordination.py`)

**Purpose**: Demonstrates autonomous coordination between multiple agents.

**What it shows**:
- Multi-agent plan creation
- Agent role assignment
- Autonomous handoffs between agents
- Conflict detection and resolution
- Progress tracking across agents
- Completion detection

**Expected Output**:
```
=== Creating Multi-Agent Plan ===
✓ Plan created: multi-agent-coord-001
✓ Number of agents: 5
✓ Number of tasks: 9
✓ Coordination: enabled

Agent Assignments:
  - Planning Agent (planner): 5 task capacity
  - Architecture Agent (architect): 3 task capacity
  - Development Agent (developer): 8 task capacity
  - Testing Agent (tester): 4 task capacity
  - Review Agent (reviewer): 3 task capacity

[PLANNER] Task task-1: completed

[HANDOFF] agent-planner -> agent-architect
  Reason: Architecture design required
  Task: task-2

[ARCHITECT] Task task-2: completed

[⚠ CONFLICT] RESOURCE_CONTENTION
  Resolution: priority_based
```

**How to Run**:
```bash
python multi_agent_coordination.py
```

**Key Features**:
- Multiple agent types and roles
- Intelligent task assignment
- Automatic handoffs
- Conflict resolution
- Coordination metrics

**Customization Tips**:
- Add custom agents in the `agents` array
- Define agent capabilities and capacities
- Configure handoff strategies
- Adjust conflict resolution methods

---

### 4. Error Recovery Demo (`error_recovery_demo.py`)

**Purpose**: Demonstrates comprehensive error handling and recovery.

**What it shows**:
- Various error scenarios (network, timeout, validation, resource)
- Automatic error detection
- Recovery strategy selection
- Automatic recovery attempts
- Human escalation triggers
- Resume after recovery

**Expected Output**:
```
=== Creating Error-Prone Plan ===
✓ Plan created: error-recovery-demo-001
✓ Number of tasks: 8
✓ Error-prone tasks: 5
✓ Error handling: enabled
✓ Auto-recovery: enabled

Configured Error Scenarios:
  - network_error: 1 task(s)
  - timeout_error: 1 task(s)
  - validation_error: 1 task(s)
  - resource_error: 1 task(s)
  - unknown_error: 1 task(s)

[Progress] Task task-1: completed

[✗ ERROR] Task task-2
  Type: network_error
  Severity: medium
  Message: Connection refused

[RECOVERY] RETRY
  Status: attempting
  Attempt: 1/3

[RECOVERY] RETRY
  Status: success
  ✓ Recovery successful

[⚠ ESCALATION] HUMAN_INTERVENTION
  Reason: Critical error requires human intervention
  Action Required: Human intervention needed
```

**How to Run**:
```bash
python error_recovery_demo.py
```

**Key Features**:
- Multiple error types
- Automatic detection
- Strategy selection
- Retry mechanisms
- Human escalation
- Recovery metrics

**Customization Tips**:
- Add custom error types to `ErrorType` enum
- Configure recovery strategies per error type
- Adjust retry attempts and delays
- Define escalation triggers

---

### 5. Decision Making Demo (`decision_making_demo.py`)

**Purpose**: Demonstrates autonomous decision-making capabilities.

**What it shows**:
- Autonomous decisions during execution
- Confidence scoring for each decision
- Risk assessment and analysis
- Decision logging with rationale
- Feedback integration
- Learning from outcomes

**Expected Output**:
```
=== Creating Decision-Intensive Plan ===
✓ Plan created: decision-making-demo-001
✓ Number of tasks: 5
✓ Decision points: 5
✓ Decision-making: enabled
✓ Confidence threshold: 0.7
✓ Risk tolerance: medium

[⚡ DECISION] Task task-1
  Type: task_priority
  Decision: high_priority
  Confidence: 85.00%
  Risk Level: low
  Risk Score: 0.15
  Rationale: Critical path tasks prioritized

[⚡ DECISION] Task task-2
  Type: agent_assignment
  Decision: agent-architect
  Confidence: 92.00%
  Risk Level: low
  Risk Score: 0.08
  Rationale: Best match for task requirements

=== Confidence Scoring ===
Total Decisions Analyzed: 5
Confidence Statistics:
  Average: 81.40%
  Minimum: 65.00%
  Maximum: 95.00%
```

**How to Run**:
```bash
python decision_making_demo.py
```

**Key Features**:
- Multiple decision types
- Confidence scoring
- Risk assessment
- Decision logging
- Learning mechanisms

**Customization Tips**:
- Add custom decision types
- Adjust confidence thresholds
- Configure risk tolerance levels
- Implement custom decision logic

---

### 6. Progress Monitoring Demo (`progress_monitoring_demo.py`)

**Purpose**: Demonstrates comprehensive progress monitoring.

**What it shows**:
- Real-time progress tracking
- Milestone detection and logging
- Status reporting at multiple levels
- Dashboard output with visual indicators
- Completion prediction with confidence
- Performance metrics and trends

**Expected Output**:
```
=== Creating Multi-Stage Plan ===
✓ Plan created: progress-monitoring-demo-001
✓ Number of tasks: 6
✓ Number of milestones: 5
✓ Total estimated duration: 35s
✓ Progress monitoring: enabled

[████████████████████░░░░░░░░░░░░░░░░░░░░░] 50% - Task task-3: processing

★ MILESTONE REACHED: Halfway Point
  Reached at: 14:35:22
  Progress: 50%

╔════════════════════════════════════════════════════════════╗
║           RALPH RUNTIME PROGRESS DASHBOARD                 ║
╠════════════════════════════════════════════════════════════╣
║ Progress: [████████████████████░░░░░░░░░░░░░░░░░░░░░]  50%     ║
║                                                            ║
║ Tasks:       3 /   6 completed                                 ║
║ Time:      15.2s elapsed                                      ║
║                                                            ║
║ Status:    RUNNING                                         ║
╚════════════════════════════════════════════════════════════╝

=== Completion Prediction ===
Estimated Completion: 2026-01-15 14:35:45
Time Remaining: 20.3s (0.3 minutes)
Prediction Confidence: 87.50%
Confidence Level: High
```

**How to Run**:
```bash
python progress_monitoring_demo.py
```

**Key Features**:
- Real-time updates
- Visual progress bars
- Milestone tracking
- Dashboard output
- Completion prediction
- Performance analysis

**Customization Tips**:
- Define custom milestones
- Adjust update intervals
- Configure prediction algorithms
- Customize dashboard layout

---

### 7. Interactive Ralph (`interactive_ralph.py`)

**Purpose**: Demonstrates interactive control of Ralph Runtime.

**What it shows**:
- Interactive command prompt
- User control over execution (start, pause, resume, stop)
- State inspection capabilities
- Real-time log viewing
- Metrics dashboard
- Intervention points

**Expected Output**:
```
======================================================================
INTERACTIVE RALPH RUNTIME SESSION
======================================================================

Type 'help' for available commands
Type 'start' to begin execution
----------------------------------------------------------------------

[ IDLE ]> start

Starting execution...
✓ Execution started

[ RUNNING ]> status

======================================================================
EXECUTION STATUS
======================================================================

State: RUNNING
Progress: 40%
Tasks Completed: 2/5
Elapsed Time: 8.5s
======================================================================

[ RUNNING ]> inspect tasks

======================================================================
STATE INSPECTION: TASKS
======================================================================

--- Task States ---
  task-1: completed
  task-2: completed
  task-3: in_progress
  task-4: pending
  task-5: pending
======================================================================

[ RUNNING ]> pause

Pausing execution...
✓ Execution paused

[ PAUSED ]> logs 5

======================================================================
LOG ENTRIES (Last 5)
======================================================================

[2026-01-15 14:38:15] INFO
  Task task-1 completed successfully

[2026-01-15 14:38:16] INFO
  Task task-2 completed successfully
======================================================================

[ PAUSED ]> resume

Resuming execution...
✓ Execution resumed

[ RUNNING ]> exit
```

**How to Run**:
```bash
python interactive_ralph.py
```

**Key Features**:
- Interactive command interface
- Real-time control
- State inspection
- Log streaming
- Metrics display
- User intervention

**Customization Tips**:
- Add custom commands to command loop
- Implement additional state inspection options
- Create custom intervention points
- Extend command syntax

---

## Test Scenario (`test_scenario.json`)

The `test_scenario.json` file contains sample plans, test cases, and expected outcomes for testing Ralph Runtime.

### Structure

```json
{
  "scenarios": [
    {
      "scenario_id": "scenario-001",
      "name": "Basic Autonomous Execution",
      "description": "Tests basic autonomous execution workflow",
      "plan": { ... },
      "expected_outcome": { ... }
    }
  ]
}
```

### Usage

Load test scenarios in your code:

```python
import json

with open('test_scenario.json', 'r') as f:
    scenarios = json.load(f)

for scenario in scenarios['scenarios']:
    # Run scenario
    runtime.execute(scenario['plan'])
    # Verify outcome
    assert runtime.results == scenario['expected_outcome']
```

---

## Integration with Blackbox4 Phases

### Phase 1: Context Variables

Ralph Runtime uses context variables from Phase 1 for execution:

```python
context = {
    "project": project_context,
    "workspace": workspace_context,
    "session": session_context
}

runtime = RalphRuntime(context=context)
```

### Phase 2: Hierarchical Tasks

Execute hierarchical tasks from Phase 2:

```python
plan = {
    "tasks": hierarchical_task_tree,
    "execution_config": {
        "respect_hierarchy": True
    }
}

runtime.execute_autonomous(plan)
```

### Phase 3: Specifications

Use specs from Phase 3 for execution:

```python
from .agent-os.specs import get_spec

spec = get_spec("user-auth")
plan = spec.to_execution_plan()

runtime.execute_autonomous(plan)
```

---

## Common Patterns

### Pattern 1: Simple Execution

```python
runtime = RalphRuntime()
plan = create_plan()
results = runtime.execute_autonomous(plan)
```

### Pattern 2: With Progress Callback

```python
def callback(progress):
    print(f"Progress: {progress['percent_complete']}%")

results = runtime.execute_autonomous(plan, callback=callback)
```

### Pattern 3: With Circuit Breaker

```python
runtime = RalphRuntime(config={
    "circuit_breaker": {
        "enabled": True,
        "failure_threshold": 3
    }
})

results = runtime.execute_autonomous(plan)
```

### Pattern 4: Interactive Mode

```python
runtime = RalphRuntime(mode="interactive")
runtime.start_interactive_session()
```

---

## Configuration Options

### Circuit Breaker

```python
config = {
    "circuit_breaker": {
        "enabled": True,
        "failure_threshold": 3,
        "recovery_timeout": 60,
        "half_open_max_calls": 2
    }
}
```

### Progress Monitoring

```python
config = {
    "progress_monitoring": {
        "enabled": True,
        "update_interval": 1.0,
        "milestone_detection": True,
        "prediction_enabled": True
    }
}
```

### Error Handling

```python
config = {
    "error_handling": {
        "enabled": True,
        "auto_recovery": True,
        "max_retry_attempts": 3,
        "escalation_threshold": 2
    }
}
```

### Decision Making

```python
config = {
    "decision_making": {
        "enabled": True,
        "confidence_threshold": 0.7,
        "risk_tolerance": "medium",
        "learning_enabled": True
    }
}
```

---

## Troubleshooting

### Issue: Runtime not executing

**Solution**: Ensure workspace path is correct and plan is valid.

```python
runtime = RalphRuntime(
    workspace_path=Path.cwd() / ".blackbox4"
)
runtime.load_plan(plan)
runtime.validate_plan()
```

### Issue: Circuit breaker not triggering

**Solution**: Check failure threshold and error types.

```python
config = {
    "circuit_breaker": {
        "failure_threshold": 3,  # Lower for easier triggering
        "expected_exception": Exception  # Catch all exceptions
    }
}
```

### Issue: Progress updates not showing

**Solution**: Enable progress monitoring and set update interval.

```python
config = {
    "progress_monitoring": {
        "enabled": True,
        "update_interval": 0.5  # More frequent updates
    }
}
```

---

## Best Practices

1. **Always validate plans before execution**
   ```python
   runtime.validate_plan(plan)
   ```

2. **Use callbacks for monitoring**
   ```python
   runtime.execute_autonomous(plan, callback=monitor_callback)
   ```

3. **Handle errors gracefully**
   ```python
   try:
       results = runtime.execute_autonomous(plan)
   except ExecutionError as e:
       handle_error(e)
   ```

4. **Clean up resources**
   ```python
   try:
       # execution code
   finally:
       runtime.shutdown()
   ```

5. **Log important events**
   ```python
   runtime.log_event("execution_started", {"plan_id": plan.id})
   ```

---

## Performance Tips

1. **Use parallel execution for independent tasks**
   ```python
   "execution_config": {
       "max_parallel_tasks": 4
   }
   ```

2. **Adjust update intervals for less overhead**
   ```python
   "update_interval": 2.0  # Less frequent updates
   ```

3. **Cache expensive operations**
   ```python
   runtime.cache_result("expensive_operation", result)
   ```

4. **Use circuit breakers to prevent cascading failures**
   ```python
   "circuit_breaker": {"enabled": True}
   ```

---

## Contributing

To add new examples:

1. Create a new Python file in this directory
2. Follow the naming pattern: `*_demo.py` or `*_example.py`
3. Include comprehensive docstrings
4. Add expected output in comments
5. Update this README with your example

---

## Additional Resources

- [Ralph Runtime Documentation](../ralph-agent/protocol.md)
- [Blackbox4 Architecture](../../../.docs/ARCHITECTURE.md)
- [Agent Specifications](../ralph-agent/manifest.json)

---

## License

These examples are part of Blackbox4 and follow the project's license terms.
