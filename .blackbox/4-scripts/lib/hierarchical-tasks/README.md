# Hierarchical Tasks Library

Blackbox4 hierarchical task management system adapted from CrewAI.

## Overview

This library provides a simple hierarchical task system for managing parent-child task relationships. It allows you to create nested task structures, track dependencies, and serialize tasks for storage or display.

## Source

This code is adapted from [CrewAI](https://github.com/joaomdmoura/crewAI), specifically the Task class from `crewai/src/crewai/task.py`. The original CrewAI implementation is a comprehensive task execution system with agent orchestration, guardrails, and async execution. This version extracts and simplifies the hierarchical task management concepts for Blackbox4.

## Files

- **`hierarchical_task.py`**: Core `HierarchicalTask` class with parent-child relationships
- **`crewai_task.py`**: Original CrewAI Task class (reference implementation)
- **`__init__.py`**: Helper functions and exports

## Installation

The library is located at:
```
4-scripts/lib/hierarchical-tasks/
```

Import it in your Blackbox4 scripts:

```python
import sys
sys.path.append('4-scripts/lib')

from hierarchical_tasks import HierarchicalTask, create_task, create_task_tree
```

## Usage

### Basic Task Creation

```python
from hierarchical_tasks import HierarchicalTask

# Create a parent task
parent = HierarchicalTask(
    description="Build user authentication system",
    expected_output="Complete login and registration flow"
)

# Create child tasks
child1 = HierarchicalTask(
    description="Design database schema",
    parent_task=parent
)

child2 = HierarchicalTask(
    description="Implement login API",
    parent_task=parent
)

print(parent.children)  # [child1, child2]
print(child1.get_depth())  # 1
```

### Using Helper Functions

```python
from hierarchical_tasks import create_task

# Create task chain
root = create_task("Deploy to production")
step1 = create_task("Run tests", parent=root)
step2 = create_task("Build Docker image", parent=step1)
step3 = create_task("Push to registry", parent=step2)

# Get execution order
chain = step3.get_dependency_chain()
for task in chain:
    print(f"{task.description}")
```

### Creating Task Trees from Data

```python
from hierarchical_tasks import create_task_tree

# Define tasks as flat list with parent references
tasks_data = [
    {'description': 'Project Setup'},
    {'description': 'Install dependencies', 'parent': 'Project Setup'},
    {'description': 'Configure environment', 'parent': 'Project Setup'},
    {'description': 'Database Setup'},
    {'description': 'Create schema', 'parent': 'Database Setup'},
    {'description': 'Seed data', 'parent': 'Database Setup'},
]

# Build tree (note: you need to map descriptions to IDs)
# This is simplified - actual implementation needs parent ID mapping
roots = create_task_tree(tasks_data)
```

### Generating Checklists

```python
# Convert task tree to checklist format
root = HierarchicalTask(description="Main Task")
child1 = HierarchicalTask(description="Subtask 1", parent_task=root)
child2 = HierarchicalTask(description="Subtask 2", parent_task=root)

print(root.to_checklist_item())
# Output: - [ ] Main Task

print(child1.to_checklist_item())
# Output:   - [ ] Subtask 1

# Mark as completed
child1.completed = True
print(child1.to_checklist_item())
# Output:   - [x] Subtask 1
```

### Serialization

```python
task = HierarchicalTask(
    description="Example task",
    expected_output="Some output",
    metadata={'priority': 'high', 'assignee': 'AI'}
)

# Convert to dictionary
data = task.to_dict()
print(data)
# {
#     'id': '123e4567-e89b-12d3-a456-426614174000',
#     'description': 'Example task',
#     'expected_output': 'Some output',
#     'completed': False,
#     'depth': 0,
#     'parent_id': None,
#     'children': [],
#     'metadata': {'priority': 'high', 'assignee': 'AI'}
# }
```

## API Reference

### HierarchicalTask

#### Attributes

- **`id`** (str): Unique task identifier (UUID)
- **`description`** (str): Task description
- **`expected_output`** (str): Expected outcome
- **`parent_task`** (HierarchicalTask | None): Parent task
- **`context`** (List[HierarchicalTask]): Tasks this depends on
- **`completed`** (bool): Completion status
- **`children`** (List[HierarchicalTask]): Child tasks
- **`metadata`** (Dict[str, Any]): Additional task information
- **`created_at`** (datetime): Creation timestamp

#### Methods

- **`add_child(child: HierarchicalTask)`**: Add a child task
- **`get_depth() -> int`**: Calculate nesting depth (0 = root task)
- **`get_dependency_chain() -> List[HierarchicalTask]`**: Get ordered list of ancestor tasks
- **`to_checklist_item() -> str`**: Convert to markdown checklist format
- **`to_dict() -> Dict[str, Any]`**: Convert to dictionary for serialization

### Helper Functions

- **`create_task(description, expected_output="", parent=None)`**: Create a task with optional parent
- **`create_task_tree(flat_tasks)`**: Convert flat task list to hierarchical tree

## Comparison with CrewAI

This library simplifies CrewAI's Task class by:

| Feature | CrewAI | Blackbox4 |
|---------|--------|-----------|
| Hierarchical tasks | Yes | Yes |
| Agent execution | Yes | No |
| Guardrails | Yes | No |
| Async execution | Yes | No |
| Output formatting | Yes | No |
| Context management | Yes | Simplified |
| Serialization | Via Pydantic | Via to_dict() |

CrewAI's original implementation includes agent orchestration, LLM integration, guardrails, and async execution. This version focuses solely on hierarchical task management.

## License

This code is derived from CrewAI, which is licensed under the MIT License. The original CrewAI code can be found at:
https://github.com/joaomdmoura/crewAI

## Contributing

When extending this library:

1. Maintain simplicity - this is a lightweight task system
2. Reference `crewai_task.py` for the full CrewAI implementation
3. Add examples to this README for new features
4. Keep the API consistent with CrewAI where applicable

## See Also

- Original CrewAI implementation: `crewai_task.py`
- CrewAI documentation: https://docs.crewai.com/
