# Task Auto-Breakdown System

Automatically break down requirements into actionable tasks using MetaGPT-inspired patterns.

## Overview

This system extracts tasks from natural language requirements using pattern matching and creates structured task hierarchies compatible with Blackbox4's planning system.

## Components

### project_manager.py
Copied from MetaGPT - Reference implementation for task breakdown patterns.

### write_tasks.py
Main task breakdown engine with:
- Pattern-based requirement extraction
- Dependency detection
- Effort estimation
- Hierarchical task conversion
- JSON and checklist output generation

## Usage

### Command Line

```bash
# From requirement text
python write_tasks.py --requirement "Create user authentication system with login and logout" --output ./plan

# From file
python write_tasks.py --file requirements.txt --output ./plan

# Specify output format
python write_tasks.py --requirement "Build dashboard" --output ./plan --format json
```

### As a Library

```python
from write_tasks import TaskBreakdownEngine

engine = TaskBreakdownEngine()

# Break down requirement
breakdown = engine.breakdown("Create authentication system with login and registration")

# Convert to hierarchical tasks
root_tasks = engine.to_hierarchical_tasks(breakdown)

# Save to directory
result = engine.breakdown_and_save(requirement_text, output_dir)
```

## Supported Patterns

1. **Action Statements**: "Create X", "Build X", "Implement X"
2. **Numbered Lists**: "1. First task", "2. Second task"
3. **Bullet Points**: "- Task one", "* Task two"
4. **User Stories**: "As a user, I want to login"

## Output Format

### JSON (task-breakdown.json)
```json
[
  {
    "id": "task_001",
    "description": "Create user authentication system",
    "expected_output": "Completed: Create user authentication system",
    "dependencies": [],
    "effort": "medium",
    "type": "action"
  }
]
```

### Checklist (checklist.md)
```markdown
# Tasks

- [ ] Create user authentication system
  - [ ] Implement login functionality
  - [ ] Add user registration
```

## Integration

Integrates with:
- `hierarchical_tasks.py` - Creates HierarchicalTask objects
- Blackbox4 planning system - Outputs compatible plan structure

## Dependencies

- `hierarchical_task.py` - Must be in `../hierarchical-tasks/`
- Python 3.7+

## Extension

Add custom patterns in `TaskBreakdownEngine.__init__()`:

```python
self.patterns.append(
    (r'your_pattern_here', 'pattern_name')
)
```

Modify effort estimation in `_estimate_effort()` for domain-specific heuristics.
