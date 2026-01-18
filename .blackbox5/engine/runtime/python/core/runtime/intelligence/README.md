# Blackbox4 Intelligence Layer

**Smart task selection, routing, and dependency resolution for autonomous agent loops**

## Overview

The Intelligence Layer provides intelligent decision-making capabilities for autonomous agent execution:

- **Task Selection**: Multi-factor scoring to select the best task to execute next
- **Dependency Resolution**: Build and manage dependency graphs for correct execution order
- **Context-Aware Routing**: Learn from failures and adapt routing decisions
- **Agent Selection**: Route tasks to appropriate agents based on domain and complexity

## Components

### 1. Task Model (`models.py`)

Enhanced task data model with routing metadata:

```python
from intelligence import Task, TaskPriority, TaskComplexity

task = Task(
    id="task-1",
    title="Implement API",
    description="Build REST API endpoints",
    priority=TaskPriority.HIGH,
    complexity=TaskComplexity.MEDIUM,
    depends_on=["task-0"],
    domain="backend",
    agent="claude-code"
)
```

**Key Attributes:**
- `priority`: Task priority (critical, high, medium, low)
- `complexity`: Task complexity (simple, medium, complex)
- `depends_on`: List of task IDs this task depends on
- `domain`: Domain specialization (frontend, backend, devops, etc.)
- `agent`: Specific agent to route to (optional)

### 2. Dependency Resolver (`dependency_resolver.py`)

Manages task dependencies and execution order:

```python
from intelligence import DependencyResolver

resolver = DependencyResolver()

# Build dependency graph
graph = resolver.resolve(tasks)

# Get execution order
order = resolver.get_execution_order(tasks)

# Check if task is ready
ready = resolver.is_satisfied(task, completed_tasks)

# Get ready tasks
ready_tasks = resolver.get_ready_tasks(tasks, completed)

# Visualize graph
print(resolver.visualize_graph())
```

**Features:**
- Topological sorting for correct execution order
- Circular dependency detection
- Critical path identification
- Ready task identification

### 3. Context-Aware Router (`context_aware.py`)

Intelligent task scoring based on execution context:

```python
from intelligence import ContextAwareRouter, ExecutionContext

context = ExecutionContext()
router = ContextAwareRouter(context)

# Score a task
score = router.score_task(task)

# Rank tasks
ranked = router.rank_tasks(tasks)

# Check if task should be avoided
should_avoid, reason = router.should_avoid_task(task)

# Get suggested agents
agents = router.get_suggested_agents(task)

# Update after execution
router.update_context(task_id, agent_id, success, duration, domain)
```

**Scoring Factors:**
- Priority (35%): Higher priority = higher score
- Complexity (15%): Prefer simpler tasks first
- Domain Freshness (20%): Avoid recently failed domains
- Agent Availability (15%): Available agents get higher score
- Time Match (10%): Tasks suited for current time of day
- User Preference (5%): User-specified preferences

### 4. Task Router (`task_router.py`)

Main orchestrator for task selection and agent routing:

```python
from intelligence import TaskRouter

router = TaskRouter()

# Select next task
task = router.select_next_task(tasks)

# Route to agent
agent = router.route_to_agent(task)

# Make complete routing decision
decision = router.make_routing_decision(tasks)
print(f"Task: {decision.task.id}")
print(f"Agent: {decision.agent_id}")
print(f"Confidence: {decision.confidence}")
print(f"Reasoning: {decision.reasoning}")

# Update after execution
router.update_after_execution(task_id, agent_id, success, duration, domain)

# Get status summary
summary = router.get_status_summary()
```

## Usage Examples

### Example 1: Basic Task Selection

```python
from intelligence import TaskRouter, Task, TaskPriority

router = TaskRouter()

tasks = [
    Task(id="1", title="Fix Bug", priority=TaskPriority.CRITICAL, complexity="simple"),
    Task(id="2", title="Add Feature", priority=TaskPriority.HIGH, complexity="medium"),
]

# Select best task
task = router.select_next_task(tasks)
print(f"Selected: {task.title}")  # "Fix Bug" (critical + simple)
```

### Example 2: Dependency-Aware Execution

```python
from intelligence import TaskRouter, Task

tasks = [
    Task(id="setup", title="Setup", depends_on=[]),
    Task(id="build", title="Build", depends_on=["setup"]),
    Task(id="test", title="Test", depends_on=["build"]),
]

router = TaskRouter()

# Will select setup -> build -> test in order
while True:
    task = router.select_next_task(tasks)
    if not task:
        break
    print(f"Executing: {task.title}")
    router.update_after_execution(task.id, "agent", True, 5.0)
```

### Example 3: Domain-Based Routing

```python
from intelligence import TaskRouter, Task

router = TaskRouter()

tasks = [
    Task(id="ui", title="Build UI", domain="frontend"),
    Task(id="api", title="Build API", domain="backend"),
    Task(id="design", title="Design System", domain="design"),
]

for task in tasks:
    agent = router.route_to_agent(task)
    print(f"{task.title} -> {agent}")
    # Output:
    # Build UI -> claude-code
    # Build API -> claude-code
    # Design System -> human
```

### Example 4: Context-Aware Routing

```python
from intelligence import TaskRouter, ExecutionContext, AgentCapability

# Create context with agent capabilities
context = ExecutionContext()
context.agent_capabilities = {
    'claude-code': AgentCapability(
        agent_id='claude-code',
        domains=['frontend', 'backend'],
        success_rate=0.9
    ),
    'specialist': AgentCapability(
        agent_id='specialist',
        domains=['backend'],
        success_rate=0.95
    ),
}

# Add some failures
context.recent_failures_by_domain = {'frontend': 3}

router = TaskRouter(context)

# Frontend tasks will be deprioritized due to failures
# Backend tasks will route to specialist (higher success rate)
```

## Algorithm Details

### Task Selection Algorithm

1. **Filter by Dependencies**: Only consider tasks with satisfied dependencies
2. **Filter by Validation**: Only consider tasks that pass validation
3. **Avoidance Check**: Skip tasks with recent failures or unavailable agents
4. **Multi-Factor Scoring**: Score remaining tasks using context-aware routing
5. **Selection**: Return highest-scoring task

### Agent Routing Logic

1. **Explicit Agent**: Use agent if specified in task
2. **Human Intervention**: Route to human if:
   - Task complexity is "complex"
   - Task priority is "critical"
   - Task has 3+ failed attempts
3. **Domain Specialist**: Route to domain-specific agent if available
4. **Context-Aware Selection**: Use agent with best success rate for domain
5. **Default**: Route to claude-code

### Dependency Resolution

- Uses topological sort for execution order
- Detects circular dependencies
- Identifies critical path (longest dependency chain)
- Tracks ready tasks at each stage

## Configuration

### Domain Agent Mapping

```python
router.configure_domain_agent('frontend', 'claude-code')
router.configure_domain_agent('design', 'human')
```

### Agent Capabilities

```python
router.register_agent_capability(
    agent_id='specialist',
    domains=['backend', 'database'],
    max_complexity='complex',
    initial_success_rate=0.95
)
```

### User Preferences

```python
router.context.user_preferences = {
    'preferred_domains': ['backend', 'testing'],
    'preferred_agents': ['specialist'],
    'auto_complex_tasks': False,  # Route complex tasks to human
    'auto_critical_tasks': False,  # Route critical tasks to human
    'time_preferences': {
        'backend': ['morning', 'afternoon'],
        'testing': ['night'],
    }
}
```

## Testing

Run comprehensive tests:

```bash
cd .blackbox4/4-scripts/python/core/runtime/intelligence
PYTHONPATH=/path/to/runtime python3 tests/test_intelligence.py
```

Tests cover:
- Dependency resolution and graph building
- Topological sorting and critical path
- Task selection and ranking
- Agent routing (domain, complexity, human intervention)
- Context-aware routing (failures, learning)
- Complete autonomous workflow

## File Structure

```
intelligence/
├── __init__.py              # Package exports
├── models.py                # Task and related data models
├── dependency_resolver.py   # Dependency graph management
├── context_aware.py         # Context-aware routing and scoring
├── task_router.py           # Main task selection and routing
├── README.md                # This file
└── tests/
    └── test_intelligence.py # Comprehensive tests
```

## Integration with Blackbox4

The Intelligence Layer integrates with the Blackbox4 runtime:

```python
from runtime.intelligence import TaskRouter
from runtime.orchestrator import UltimateOrchestrator

# Create router
router = TaskRouter()

# Create orchestrator
orchestrator = UltimateOrchestrator()

# Autonomous execution loop
while True:
    # Get tasks from plan
    tasks = orchestrator.get_pending_tasks()

    # Select best task
    decision = router.make_routing_decision(tasks)

    if not decision.task:
        break  # No more tasks

    # Execute task
    result = orchestrator.execute_task(
        decision.task,
        decision.agent_id
    )

    # Update context
    router.update_after_execution(
        decision.task.id,
        decision.agent_id,
        result.success,
        result.duration,
        decision.task.domain
    )
```

## Key Features

✓ **Dependency-Aware**: Respects task dependencies for correct execution order
✓ **Priority-Driven**: Prioritizes critical and high-priority tasks
✓ **Complexity-Aware**: Prefers simpler tasks for quick wins
✓ **Context-Aware**: Learns from failures and adapts routing
✓ **Domain-Specialized**: Routes to agents with domain expertise
✓ **Human-in-the-Loop**: Routes complex/critical tasks to humans
✓ **Confidence Scoring**: Provides confidence scores for decisions
✓ **Explainable**: Generates human-readable reasoning for decisions

## Performance

- **Task Selection**: O(n log n) where n = number of tasks
- **Dependency Resolution**: O(V + E) where V = tasks, E = dependencies
- **Agent Routing**: O(a) where a = number of agents
- **Memory**: O(V + E) for dependency graph + O(h) for execution history

## Future Enhancements

- Machine learning-based task scoring
- Parallel task execution (independent tasks)
- Resource-aware routing (CPU, memory, API limits)
- Time estimation and deadline awareness
- Multi-agent collaboration
- Task splitting and delegation

## License

Part of Blackbox4 AI Agent Orchestration Framework.
