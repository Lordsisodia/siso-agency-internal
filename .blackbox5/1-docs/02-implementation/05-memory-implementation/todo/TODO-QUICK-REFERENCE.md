# Todo Management System - Quick Reference

## Installation

The Todo Management System is included in BlackBox5. No additional installation needed.

```python
from engine.core.todo_manager import TodoManager
```

## Quick Start

### Initialize

```python
tm = TodoManager()  # Uses ~/.blackbox5/todos.json
```

### Add Todos

```python
# Basic
todo_id = tm.quick_add("Fix authentication bug")

# With priority
todo_id = tm.quick_add("Server down", priority="urgent")

# With tags
todo_id = tm.quick_add("Add dark mode", tags=["ui", "feature"])

# Everything
todo_id = tm.quick_add(
    "Refactor API",
    priority="urgent",
    tags=["backend", "tech-debt"]
)
```

### Work with Todos

```python
# Get a todo
todo = tm.get(todo_id)

# Add notes
tm.add_note(todo_id, "Check JWT token expiration")

# Update status
tm.update(todo_id, status="in_progress")

# Update priority
tm.update(todo_id, priority="urgent")

# Mark complete
tm.complete(todo_id)

# Delete
tm.delete(todo_id)
```

### List and Filter

```python
# All todos
all_todos = tm.list()

# By status
pending = tm.list(status="pending")
in_progress = tm.list(status="in_progress")
completed = tm.list(status="completed")

# By priority
urgent = tm.list(priority="urgent")

# By tags
backend = tm.list(tags=["backend"])
backend_bug = tm.list(tags=["backend", "bug"])

# With limit
top5 = tm.list(limit=5)

# Combined
urgent_backend = tm.list(priority="urgent", tags=["backend"], limit=10)
```

### Search

```python
# Search across descriptions, notes, and tags
results = tm.search("authentication")
bugs = tm.search("bug")
```

### Statistics

```python
stats = tm.get_statistics()

print(f"Total: {stats['total']}")
print(f"Completed: {stats['by_status']['completed']}")
print(f"Urgent: {stats['by_priority']['urgent']}")
print(f"Completion rate: {stats['completed_ratio']:.1%}")
```

## Priority Levels

- **`urgent`** - Do immediately (🔴)
- **`normal`** - Default priority (🟡)
- **`low`** - Backlog/nice-to-have (🟢)

## Status Values

- **`pending`** - Not started (⏳)
- **`in_progress`** - Working on it (🔄)
- **`completed`** - Done (✅)
- **`archived`** - Saved for reference (📦)

## Storage

Todos are saved to: `~/.blackbox5/todos.json`

Format:
```json
{
  "todos": [
    {
      "id": "a1b2c3d4",
      "description": "Fix authentication bug",
      "priority": "urgent",
      "status": "in_progress",
      "tags": ["backend", "security"],
      "created_at": "2026-01-19T10:30:00",
      "completed_at": null,
      "notes": "Check JWT token logic",
      "estimated_effort": "2h"
    }
  ],
  "updated_at": "2026-01-19T14:45:00"
}
```

## Common Workflows

### Idea Inbox

```python
# Throughout day - quick capture
tm.quick_add("Refactor auth module")
tm.quick_add("Add user preferences", tags=["feature"])
tm.quick_add("Fix login crash", priority="urgent")

# End of day - review
urgent = tm.list(priority="urgent")
for todo in urgent:
    print(f"URGENT: {todo.description}")
```

### Project Tracking

```python
# Track multiple projects
tm.quick_add("Design API", tags=["project-alpha", "design"])
tm.quick_add("Implement API", tags=["project-alpha", "backend"])
tm.quick_add("Test API", tags=["project-alpha", "testing"])

# View project progress
project_alpha = tm.list(tags=["project-alpha"])
print(f"Project Alpha: {len(project_alpha)} tasks")
```

### Bug Tracking

```python
# Report bugs
tm.quick_add("Fix auth timeout", tags=["bug", "auth"])
tm.quick_add("Fix UI rendering", tags=["bug", "ui"])

# Find all bugs in a component
auth_bugs = tm.search("auth")
for bug in auth_bugs:
    print(f"{bug.id}: {bug.description}")
```

## CLI Usage (When Integrated)

```bash
# Add todo
/todo "Fix authentication bug"

# With priority
/todo "Server crash" --priority urgent

# With tags
/todo "Add dark mode" --tags ui,feature

# Complete
/todo complete a1b2c3d4

# List
/todo list --status pending
/todo list --priority urgent
/todo list --tags backend

# Search
/todo search "authentication"
```

## Testing

Run tests:
```bash
cd .blackbox5
python3 -m pytest tests/test_todo_manager.py -v
```

Run demo:
```bash
cd .blackbox5
PYTHONPATH=. python3 examples/todo_demo.py
```

## Best Practices

1. **Use tags consistently** - Create a standard set for your workflow
2. **Add context** - Use notes to capture important details
3. **Review regularly** - Check urgent items daily, all items weekly
4. **Archive completed** - Keep completed items for reference, don't delete
5. **Be specific** - Clear descriptions make search more effective

## API Reference Summary

| Method | Purpose |
|--------|---------|
| `quick_add()` | Fast todo creation |
| `complete()` | Mark as done |
| `update()` | Modify fields |
| `delete()` | Remove todo |
| `list()` | Filter/sort todos |
| `get()` | Get specific todo |
| `search()` | Full-text search |
| `add_note()` | Add context |
| `get_statistics()` | View metrics |

## Troubleshooting

**Todos not persisting?**
- Check `~/.blackbox5/` directory exists and is writable
- Check file permissions on `todos.json`

**Search not finding items?**
- Search is case-insensitive
- Searches across description, notes, and tags
- Try broader search terms

**File corruption?**
- System handles gracefully - starts with empty todos
- File uses atomic writes to prevent corruption

## Performance

- Tested up to 10,000 todos
- Search: O(n) - linear scan
- List: O(n log n) - due to sorting
- For >1000 todos, use filters to reduce result set

## Support

For issues or questions:
- Check: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/docs/TODO-MANAGEMENT-IMPLEMENTATION.md`
- Run tests: `pytest tests/test_todo_manager.py`
- View demo: `python3 examples/todo_demo.py`
