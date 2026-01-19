# Ralph Runtime - Autonomous Execution Engine

**Phase 4: Autonomous Runtime Capabilities for Blackbox4**

Ralph Runtime is a sophisticated autonomous execution engine that enables self-directing agents to plan, execute, monitor, and recover from errors with minimal human intervention.

---

## Overview

Ralph Runtime provides:

- **Autonomous Task Execution**: Self-directing agents that plan and execute tasks
- **Progress Monitoring**: Real-time tracking with milestone management
- **Error Recovery**: Intelligent error detection, classification, and recovery
- **Decision Making**: AI-powered decisions with confidence scoring
- **Learning**: Agents learn from feedback to improve over time
- **Human Escalation**: Smart escalation when human intervention is needed

---

## Architecture

### Core Components

```
ralph-runtime/
├── ralph_runtime.py       # Main runtime orchestrator
├── autonomous_agent.py    # Self-directing agent
├── decision_engine.py     # AI decision-making
├── progress_tracker.py    # Progress monitoring
├── error_recovery.py      # Error handling & recovery
└── __init__.py           # Exports & configuration
```

### Component Relationships

```
RalphRuntime (Orchestrator)
    ├── AutonomousAgent (Planning & Learning)
    ├── DecisionEngine (Decision Making)
    ├── ProgressTracker (Monitoring)
    └── ErrorRecovery (Error Handling)
```

---

## Integration with Blackbox4

### Phase 1: Context Variables
```python
runtime.set_context_variable("project_root", "/path/to/project")
value = runtime.get_context_variable("project_root")
```

### Phase 2: Hierarchical Tasks
```python
# Execute hierarchical tasks
tasks = load_hierarchical_tasks(plan_path)
for task in tasks:
    runtime.run_task(task)
```

### Phase 3: Spec-Driven Decisions
```python
# Use specs for autonomous decisions
spec = load_spec(".agent-os/specs/my-spec/spec.md")
runtime.make_decision(task, spec_context)
```

---

## Usage Guide

### Basic Usage

```python
from ralph_runtime import RalphRuntime

# Initialize runtime
runtime = RalphRuntime(
    max_retries=3,
    confidence_threshold=0.7,
    human_intervention="ask_first"
)

# Execute a plan
result = runtime.execute_plan(
    plan_path=".plans/my-project",
    autonomous_mode=True
)

print(f"Status: {result['status']}")
print(f"Tasks completed: {result['tasks_completed']}/{result['tasks_total']}")
```

### Advanced Usage

#### Custom Callbacks

```python
def on_progress(progress):
    print(f"Progress: {progress.tasks_completed}/{progress.tasks_total}")

def on_error(error_info):
    print(f"Error: {error_info['error']}")
    # Send notification, log to system, etc.

def on_decision(decision):
    print(f"Decision: {decision.action} (confidence: {decision.confidence})")

def on_complete(result):
    print(f"Execution complete: {result}")

# Set callbacks
runtime.set_progress_callback(on_progress)
runtime.set_error_callback(on_error)
runtime.set_decision_callback(on_complete)
runtime.set_complete_callback(on_complete)
```

#### State Persistence

```python
# Save runtime state
runtime.save_state("/tmp/runtime_state.json")

# Load runtime state
runtime.load_state("/tmp/runtime_state.json")
```

#### Context Management

```python
# Set context variables
runtime.set_context_variable("api_key", "xxx")
runtime.set_context_variable("debug", True)

# Get all context
context = runtime.get_all_context_variables()

# Use context in decisions
decision = runtime.make_decision(task, context)
```

---

## API Reference

### RalphRuntime Class

#### Constructor

```python
RalphRuntime(
    max_retries: int = 3,
    confidence_threshold: float = 0.7,
    timeout_seconds: int = 300,
    session_timeout: int = 3600,
    human_intervention: str = "ask_first"
)
```

**Parameters:**
- `max_retries`: Maximum retry attempts for failed tasks
- `confidence_threshold`: Minimum confidence for autonomous execution (0-1)
- `timeout_seconds`: Timeout for individual task execution
- `session_timeout`: Timeout for entire runtime session
- `human_intervention`: When to request human intervention
  - `"never"`: Fully autonomous
  - `"ask_first"`: Ask before actions (default)
  - `"on_error"`: Only ask on errors
  - `"on_low_confidence"`: Ask when confidence is low

#### Methods

##### execute_plan()

```python
execute_plan(
    plan_path: str,
    autonomous_mode: bool = True,
    human_intervention: Optional[str] = None
) -> Dict[str, Any]
```

Execute a plan autonomously.

**Returns:**
```python
{
    "status": "completed",
    "session_id": "session_id",
    "tasks_completed": 10,
    "tasks_total": 10,
    "results": [...],
    "duration": 123.45
}
```

##### run_task()

```python
run_task(
    task: Dict[str, Any],
    autonomous_mode: bool = True,
    human_intervention: str = "ask_first"
) -> Dict[str, Any]
```

Execute a single task.

##### handle_agent_handoff()

```python
handle_agent_handoff(
    from_agent: str,
    to_agent: str,
    context: Dict[str, Any]
) -> Dict[str, Any]
```

Manage agent handoff during execution.

##### track_progress()

```python
track_progress(session_id: str) -> SessionProgress
```

Get current execution progress.

##### make_decision()

```python
make_decision(
    task: Dict[str, Any],
    context: Dict[str, Any]
) -> DecisionResult
```

Make execution decision using decision engine.

##### recover_from_error()

```python
recover_from_error(
    error: Exception,
    context: Dict[str, Any]
) -> RecoveryStrategy
```

Recover from execution error.

##### pause() / resume() / stop()

```python
pause() -> bool   # Pause execution
resume() -> bool  # Resume paused execution
stop() -> bool    # Stop execution
```

---

### AutonomousAgent Class

#### Methods

##### plan_next_steps()

```python
plan_next_steps(
    task: Dict[str, Any],
    context: Dict[str, Any]
) -> List[NextStep]
```

Plan upcoming actions based on current task and context.

##### evaluate_completion()

```python
evaluate_completion(
    task: Dict[str, Any],
    context: Dict[str, Any]
) -> AgentConfidence
```

Assess if task is complete and meets requirements.

##### request_help()

```python
request_help(
    task: Dict[str, Any],
    issue: str,
    context: Dict[str, Any],
    urgency: str = "medium"
) -> Dict[str, Any]
```

Request human intervention when needed.

##### learn_from_feedback()

```python
learn_from_feedback(
    task: Dict[str, Any],
    feedback: Dict[str, Any],
    outcome: str
) -> None
```

Learn from human corrections and feedback.

---

### DecisionEngine Class

#### Methods

##### evaluate_context()

```python
evaluate_context(context: DecisionContext) -> DecisionResult
```

Evaluate current context and provide assessment.

##### choose_action()

```python
choose_action(context: DecisionContext) -> DecisionResult
```

Select the best action from available options.

##### assess_risk()

```python
assess_risk(context: DecisionContext) -> Dict[str, float]
```

Assess risks associated with current context.

**Returns:**
```python
{
    "execution": 0.2,
    "resource": 0.5,
    "dependency": 0.0,
    "permission": 0.0,
    "time": 0.1
}
```

##### calculate_confidence()

```python
calculate_confidence(
    context: DecisionContext,
    action: str
) -> float
```

Calculate confidence score for a specific action (0-1).

---

### ProgressTracker Class

#### Methods

##### start_session()

```python
start_session(
    plan_name: str,
    autonomous_mode: bool = False,
    metadata: Optional[Dict[str, Any]] = None
) -> str
```

Start a new progress tracking session.

**Returns:** Session ID

##### update_progress()

```python
update_progress(
    session_id: str,
    task_id: str,
    status: str,
    result: Optional[Dict[str, Any]] = None
) -> None
```

Update progress for a task.

##### add_milestone()

```python
add_milestone(
    session_id: str,
    name: str,
    description: str,
    status: MilestoneStatus = MilestoneStatus.PENDING,
    metadata: Optional[Dict[str, Any]] = None
) -> ProgressMilestone
```

Add a milestone to track.

##### get_status()

```python
get_status(session_id: str) -> SessionProgress
```

Get current status for a session.

##### generate_report()

```python
generate_report(session_id: str) -> Dict[str, Any]
```

Generate a comprehensive progress report.

**Returns:**
```python
{
    "session_id": "session_id",
    "plan_name": "plan_name",
    "status": "in_progress",
    "duration": 123.45,
    "task_summary": {
        "total": 10,
        "completed": 5,
        "failed": 1,
        "completion_rate": 50.0
    },
    "milestone_summary": {
        "total": 5,
        "completed": 2,
        "pending": 3
    },
    "performance_metrics": {
        "average_task_duration": 10.5,
        "total_retries": 2
    }
}
```

---

### ErrorRecovery Class

#### Methods

##### detect_error()

```python
detect_error(error_message: str) -> ErrorInfo
```

Detect and parse error information.

##### classify_error()

```python
classify_error(error_info: ErrorInfo) -> ErrorClassification
```

Classify an error and determine recovery strategy.

##### attempt_recovery()

```python
attempt_recovery(
    classification: ErrorClassification,
    retry_count: int,
    max_retries: int
) -> RecoveryAction
```

Attempt recovery based on error classification.

##### escalate_to_human()

```python
escalate_to_human(
    classification: ErrorClassification,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]
```

Escalate error to human intervention.

---

## Best Practices

### 1. Set Appropriate Confidence Thresholds

```python
# High-risk operations require higher confidence
runtime = RalphRuntime(confidence_threshold=0.9)

# Low-risk operations can use lower threshold
runtime = RalphRuntime(confidence_threshold=0.6)
```

### 2. Use Context Variables Effectively

```python
# Set up context before execution
runtime.set_context_variable("project_root", project_path)
runtime.set_context_variable("env", "production")
runtime.set_context_variable("dry_run", False)
```

### 3. Implement Proper Error Handling

```python
def on_error(error_info):
    if error_info["severity"] == "critical":
        send_alert(error_info)
    log_error(error_info)

runtime.set_error_callback(on_error)
```

### 4. Monitor Progress

```python
# Track progress in real-time
def on_progress(progress):
    update_dashboard(progress)
    check_thresholds(progress)

runtime.set_progress_callback(on_progress)
```

### 5. Use State Persistence

```python
# Save state periodically
runtime.save_state("/backup/runtime_state.json")

# Load state on restart
runtime.load_state("/backup/runtime_state.json")
```

### 6. Configure Human Intervention Appropriately

```python
# Development: Ask for guidance
runtime = RalphRuntime(human_intervention="ask_first")

# Production: Only escalate on errors
runtime = RalphRuntime(human_intervention="on_error")

# Fully autonomous system
runtime = RalphRuntime(human_intervention="never")
```

---

## Integration Examples

### Integration with Agent Handoff

```bash
# .blackbox4/4-scripts/lib/agent-handoff.sh
python3 -c "
from lib.ralph_runtime import RalphRuntime
runtime = RalphRuntime()
result = runtime.handle_agent_handoff('planner', 'executor', context)
print(result['approved'])
"
```

### Integration with Circuit Breaker

```python
# Check circuit breaker before execution
from lib.circuit_breaker import CircuitBreaker

breaker = CircuitBreaker("task_execution")
if breaker.is_closed():
    result = runtime.execute_plan(plan_path)
else:
    print("Circuit breaker is open - execution blocked")
```

### Integration with Response Analyzer

```python
# Analyze responses during execution
from lib.response_analyzer import ResponseAnalyzer

analyzer = ResponseAnalyzer()

def on_decision(decision):
    analysis = analyzer.analyze_decision(decision)
    if analysis["confidence"] < 0.5:
        request_review(decision)
```

---

## Error Handling

### Error Types

- **VALIDATION**: Input validation errors
- **EXECUTION**: Runtime execution errors
- **RESOURCE**: Resource availability errors
- **PERMISSION**: Access/permission errors
- **NETWORK**: Network connectivity errors
- **DEPENDENCY**: Missing dependency errors
- **UNKNOWN**: Unclassified errors

### Recovery Strategies

- **RETRY**: Attempt the operation again
- **ALTERNATIVE**: Try an alternative approach
- **SKIP**: Skip the operation
- **ESCALATE**: Request human intervention
- **ABORT**: Abort the execution

### Error Recovery Flow

```
Error Occurs
    ↓
Detect Error
    ↓
Classify Error
    ↓
Attempt Recovery
    ↓
Success? ──No──→ Escalate to Human
    ↓ Yes
Continue Execution
```

---

## Performance Considerations

### Memory Management

```python
# Clean up old sessions periodically
runtime.progress_tracker.cleanup_old_sessions(max_age_hours=24)
```

### Concurrency

```python
# Currently Ralph Runtime is single-threaded
# For concurrent execution, run multiple instances
import multiprocessing

with multiprocessing.Pool() as pool:
    results = pool.map(execute_plan, plan_list)
```

### Logging

```python
# Adjust logging level as needed
import logging
logging.getLogger('ralph_runtime').setLevel(logging.WARNING)
```

---

## Troubleshooting

### Common Issues

**Issue**: Runtime hangs indefinitely
```python
# Set appropriate timeouts
runtime = RalphRuntime(
    timeout_seconds=60,
    session_timeout=600
)
```

**Issue**: Too many human interventions
```python
# Adjust confidence threshold
runtime = RalphRuntime(
    confidence_threshold=0.5,  # Lower threshold
    human_intervention="on_error"
)
```

**Issue**: Tasks failing repeatedly
```python
# Check error statistics
stats = runtime.error_recovery.get_error_statistics()
print(stats)
# Adjust max_retries based on error patterns
runtime = RalphRuntime(max_retries=5)
```

---

## Version History

### v1.0.0 (Current)
- Initial release
- Autonomous execution capabilities
- Progress tracking
- Error recovery
- Decision engine
- Learning from feedback

---

## License

Part of Blackbox4 - Internal use only.

---

## Support

For issues, questions, or contributions, contact the Blackbox4 team.
