# Hierarchical Task Management Examples

This directory contains example demonstrations of the hierarchical task management system for Blackbox4.

## Overview

The hierarchical task management system extends Blackbox4's existing checklist-based task tracking with powerful features for managing complex, nested task relationships. These examples demonstrate key capabilities:

- **Parent-child relationships**: Tasks can have subtasks, creating natural hierarchies
- **Automatic breakdown**: AI-powered decomposition of requirements into task hierarchies
- **Checklist integration**: Seamless compatibility with existing `checklist.md` files
- **Validation**: Ensure task hierarchies are well-formed
- **Export**: Convert to JSON for external tool integration

## Examples

### 1. Simple Hierarchy (`simple_hierarchy.py`)

Demonstrates basic parent-child task relationships.

**Run:**
```bash
./simple_hierarchy.py
```

**What it does:**
- Creates a root task: "Build User Authentication System"
- Adds three child tasks: login, logout, password reset
- Adds grandchild tasks to each
- Displays the hierarchy with indentation
- Shows statistics (total tasks, depth, etc.)

**Expected output:**
```
=== Simple Hierarchical Tasks Example ===

Task Hierarchy:
--------------------------------------------------
- [ ] Build User Authentication System
  - [ ] Implement login page
    - [ ] Design login form UI
    - [ ] Implement authentication logic
    - [ ] Add session management
  - [ ] Implement logout functionality
    - [ ] Add logout button to navbar
    - [ ] Clear session data
  - [ ] Add password reset feature
    - [ ] Create forgot password form
    - [ ] Implement email verification

Statistics:
  Total tasks: 11
  Root tasks: 1
  Max depth: 3
```

**Use case:** Learning the basic API for creating and displaying hierarchical tasks.

---

### 2. Auto-Breakdown (`auto_breakdown_example.py`)

Demonstrates automatic task breakdown from natural language requirements.

**Run:**
```bash
./auto_breakdown_example.py
```

**What it does:**
- Takes a natural language requirement describing a user management system
- Uses the TaskBreakdownEngine to decompose it into tasks
- Shows dependencies and effort estimates
- Converts to hierarchical tasks
- Saves the plan to a new directory

**Expected output:**
```
=== Auto-Breakdown Example ===

Generated Tasks:
--------------------------------------------------
1. Set up user database schema [large]
2. Implement user registration with email verification (depends on: Set up user database schema) [medium]
3. Create user profile management interface (depends on: Implement user registration with email verification) [medium]
4. Add role-based access control (depends on: Create user profile management interface) [large]
5. Build user search and filtering functionality (depends on: Create user profile management interface) [medium]
6. Develop user activity tracking dashboard (depends on: Add role-based access control) [large]

Total tasks: 6
Tasks with dependencies: 5

Root tasks: 1
  - Set up user database schema

✅ Example plan saved to: .../example-plan
   Files created:
      - checklist.md
      - tasks.md
```

**Use case:** Converting high-level requirements into actionable task hierarchies.

---

### 3. Checklist Integration (`checklist_integration.py`)

Demonstrates integration with existing Blackbox4 checklist files.

**Run:**
```bash
./checklist_integration.py
```

**What it does:**
- Creates a temporary directory with a sample `checklist.md`
- Loads it into a HierarchicalPlanManager
- Validates the hierarchy
- Adds a new task to an existing parent
- Marks a task as complete
- Saves the updated checklist
- Exports to JSON

**Expected output:**
```
=== Checklist Integration Example ===

Using temporary directory: /tmp/blackbox4_plan_...
Loaded 16 tasks from checklist.md
Root tasks: 4

Validation: ✅ VALID
Statistics:
  Total tasks: 16
  Root tasks: 4
  Max depth: 2
  Completed: 0

--- Adding New Task ---
✅ Added: Create documentation
   Parent: Design System Architecture
   Depth: 2

--- Marking Task Complete ---
✅ Marked complete: Design System Architecture

✅ Saved updated checklist.md

--- Final Checklist ---
# Project Tasks

- [x] Design System Architecture
  - [ ] Define component structure
  - [ ] Plan state management
  - [ ] Design API endpoints
  - [ ] Create documentation
- [ ] Implement Frontend
  ...

✅ Exported to JSON: /tmp/blackbox4_plan_.../plan-export.json

✅ Cleaned up temporary directory
```

**Use case:** Migrating existing checklist-based plans to hierarchical task management.

---

## Integration with Blackbox4

### Existing Checklist System

Blackbox4 uses a markdown-based checklist system in `.plans/*/checklist.md`. The hierarchical task system is designed to be compatible:

```markdown
# Project Tasks

- [ ] Root task 1
  - [ ] Child task 1.1
  - [ ] Child task 1.2
- [ ] Root task 2
  - [ ] Child task 2.1
    - [ ] Grandchild 2.1.1
```

The HierarchicalPlanManager can:
- Load these files into the HierarchicalTask model
- Validate hierarchy integrity
- Add, modify, or complete tasks
- Save back to checklist format

### Task Breakdown Engine

The task breakdown system integrates with Blackbox4's planning workflow:

1. **Input**: Natural language requirements from user or agent
2. **Processing**: TaskBreakdownEngine uses AI to decompose into tasks
3. **Output**: Structured task list with dependencies and effort estimates
4. **Conversion**: Convert to hierarchical tasks for execution tracking

### Agent Workflow Integration

Hierarchical tasks enhance agent-driven development:

```python
# In an agent script
from hierarchical_task import create_task
from hierarchical_plan import HierarchicalPlanManager

# Load plan
manager = HierarchicalPlanManager(".plans/my-feature")
tasks = manager.load_from_checklist()

# Get next task to work on
next_task = manager.get_next_task()
print(f"Working on: {next_task.description}")

# Agent completes the task
# ... agent work ...

# Mark complete
manager.mark_complete(next_task.id)
manager.save_to_checklist()
```

## Key Features

### Task Relationships

```python
# Create parent task
root = create_task("Build feature")

# Add children
child1 = create_task("Subtask 1", parent=root)
child2 = create_task("Subtask 2", parent=root)

# Access hierarchy
print(root.children)      # [child1, child2]
print(child1.parent)      # root
print(child1.get_depth()) # 2
```

### Task Metadata

```python
task = HierarchicalTask(
    description="Implement API endpoint",
    expected_output="POST /api/users returning 201 on success",
    acceptance_criteria=["Returns 201", "Validates input", "Handles errors"],
    dependencies=["database schema"],
    effort_estimate="2-3 hours"
)
```

### Validation

```python
report = manager.validate_hierarchy()

if not report['valid']:
    print("Issues found:")
    for issue in report['issues']:
        print(f"  - {issue}")
```

### Export Formats

```python
# Export to JSON
manager.export_json("plan.json")

# Export to Markdown (checklist)
manager.save_to_checklist()

# Get flat list
all_tasks = manager.get_all_tasks()
```

## File Structure

```
hierarchical-examples/
├── README.md                    # This file
├── simple_hierarchy.py          # Basic parent-child example
├── auto_breakdown_example.py    # AI-powered breakdown example
├── checklist_integration.py     # Checklist.md integration example
└── example-plan/                # Generated by auto_breakdown_example.py
    ├── checklist.md
    └── tasks.md
```

## Dependencies

These examples require:

- Python 3.7+
- Blackbox4 hierarchical task libraries:
  - `4-scripts/lib/hierarchical-tasks/hierarchical_task.py`
  - `4-scripts/lib/task-breakdown/write_tasks.py`
  - `4-scripts/planning/hierarchical_plan.py`

## Troubleshooting

### Import Errors

If you see import errors, ensure the path setup is correct:

```python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../', '4-scripts/lib/hierarchical-tasks'))
```

The path should point from the example file to the library directory.

### Missing Libraries

Some examples reference libraries that may not yet be implemented. The code includes try/except blocks to handle this gracefully and show the intended usage.

## Next Steps

1. **Run the examples** to see the system in action
2. **Modify the examples** with your own tasks and requirements
3. **Integrate into your workflow** by importing the libraries into your agent scripts
4. **Extend the system** with new features as needed

## Related Documentation

- `4-scripts/lib/hierarchical-tasks/README.md` - Core hierarchical task library
- `4-scripts/lib/task-breakdown/README.md` - Task breakdown engine
- `4-scripts/planning/README.md` - Planning and workflow integration
