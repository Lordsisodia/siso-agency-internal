# Todo Management System - Implementation Guide

## Overview

The Todo Management System is Component 7 of the GSD (Getting Stuff Done) framework. It provides quick capture of ideas with persistent storage and organization, ensuring you never lose ideas and always know what's next.

## What This Does

- **Quick Capture**: Add ideas instantly with minimal friction
- **Persistent Storage**: All todos saved to `~/.blackbox5/todos.json`
- **Organization**: Tag-based grouping, priority levels, status tracking
- **Search**: Full-text search across descriptions, notes, and tags
- **Statistics**: Track completion rates and task distribution

## Architecture

### Core Components

```
.blackbox5/engine/core/todo_manager.py
├── Todo (dataclass)
│   ├── id: str                    # Unique identifier (8-char UUID)
│   ├── description: str           # What needs to be done
│   ├── priority: Priority         # urgent, normal, low
│   ├── status: TodoStatus         # pending, in_progress, completed, archived
│   ├── tags: List[str]           # Organizational tags
│   ├── created_at: datetime      # When created
│   ├── completed_at: datetime    # When completed (optional)
│   ├── notes: str                # Additional context
│   └── estimated_effort: str     # Time estimate (e.g., "2h", "1d")
│
└── TodoManager (class)
    ├── quick_add()              # Fast todo creation
    ├── complete()               # Mark as done
    ├── update()                 # Modify fields
    ├── delete()                 # Remove todo
    ├── list()                   # Filter/sort todos
    ├── get()                    # Get specific todo
    ├── search()                 # Full-text search
    ├── add_note()              # Add context
    └── get_statistics()        # View metrics
```

### Data Models

#### Priority Levels
```python
class Priority(str, Enum):
    URGENT = "urgent"   # Do first
    NORMAL = "normal"   # Default
    LOW = "low"         # Backlog
```

#### Status Values
```python
class TodoStatus(str, Enum):
    PENDING = "pending"           # Not started
    IN_PROGRESS = "in_progress"   # Working on it
    COMPLETED = "completed"       # Done
    ARCHIVED = "archived"         # Saved for reference
```

## Usage Examples

### 1. Quick Capture

The most common use case - capture ideas instantly:

```python
from blackbox5.engine.core.todo_manager import TodoManager

tm = TodoManager()

# Basic capture
todo_id = tm.quick_add("Fix authentication bug")

# With priority
todo_id = tm.quick_add("Server down", priority="urgent")

# With tags
todo_id = tm.quick_add("Add dark mode", tags=["ui", "feature"])
```

**Command-line interface** (when integrated):
```bash
/todo "Fix auth bug"
/todo "Server crash" --priority urgent
/todo "Add dark mode" --tags ui,feature
```

### 2. Organize and Track

```python
# Add context with notes
tm.add_note(todo_id, "Check JWT token expiration logic")

# Update status
tm.update(todo_id, status="in_progress")

# Add more tags
tm.update(todo_id, tags=["backend", "security", "bug"])
```

### 3. Review and Complete

```python
# List urgent items
urgent = tm.list(priority="urgent")
for todo in urgent:
    print(f"{todo.description} ({todo.id})")

# Mark as complete
tm.complete(todo_id)

# Search for similar items
auth_bugs = tm.search("auth")
```

### 4. Track Progress

```python
# Get statistics
stats = tm.get_statistics()
print(f"Total: {stats['total']}")
print(f"Completed: {stats['completed_ratio']:.1%}")
print(f"By Priority: {stats['by_priority']}")
print(f"By Status: {stats['by_status']}")
```

## API Reference

### TodoManager.quick_add()

**Quick add a todo with minimal friction**

```python
quick_add(
    description: str,
    priority: str = "normal",
    tags: Optional[List[str]] = None
) -> str
```

**Parameters:**
- `description`: What needs to be done
- `priority`: "urgent", "normal", or "low" (default: "normal")
- `tags`: Optional list of tags for organization

**Returns:** Todo ID (8-character string)

**Example:**
```python
id = tm.quick_add("Refactor API", priority="urgent", tags=["backend"])
```

### TodoManager.complete()

**Mark a todo as completed**

```python
complete(todo_id: str) -> bool
```

**Parameters:**
- `todo_id`: ID of todo to complete

**Returns:** `True` if successful, `False` if not found

**Example:**
```python
tm.complete("a1b2c3d4")
```

### TodoManager.update()

**Update todo fields**

```python
update(
    todo_id: str,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    tags: Optional[List[str]] = None,
    notes: Optional[str] = None
) -> bool
```

**Parameters:**
- `todo_id`: ID of todo to update
- All other parameters are optional

**Returns:** `True` if successful, `False` if not found

**Example:**
```python
tm.update("a1b2c3d4", status="in_progress", priority="urgent")
```

### TodoManager.list()

**List todos with filtering and sorting**

```python
list(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[List[str]] = None,
    limit: Optional[int] = None
) -> List[Todo]
```

**Parameters:**
- `status`: Filter by status ("pending", "in_progress", etc.)
- `priority`: Filter by priority ("urgent", "normal", "low")
- `tags`: Filter by tags (must match all)
- `limit`: Maximum number of results

**Returns:** List of Todo objects, sorted by priority then date

**Examples:**
```python
# All pending todos
pending = tm.list(status="pending")

# Urgent backend tasks
urgent_backend = tm.list(priority="urgent", tags=["backend"])

# Top 5 pending items
top5 = tm.list(status="pending", limit=5)
```

### TodoManager.search()

**Full-text search across todos**

```python
search(query: str) -> List[Todo]
```

**Parameters:**
- `query`: Search term (case-insensitive)

**Returns:** List of matching todos

**Searches across:**
- Description
- Notes
- Tags

**Example:**
```python
# Find all auth-related items
auth_items = tm.search("authentication")

# Find bugs
bugs = tm.search("bug")
```

### TodoManager.add_note()

**Add contextual notes to a todo**

```python
add_note(todo_id: str, note: str) -> bool
```

**Parameters:**
- `todo_id`: ID of todo
- `note`: Note text (appended to existing notes)

**Returns:** `True` if successful

**Example:**
```python
tm.add_note("a1b2c3d4", "Remember to check JWT expiration")
```

### TodoManager.get_statistics()

**Get aggregate statistics**

```python
get_statistics() -> Dict[str, Any]
```

**Returns:** Dictionary with:
- `total`: Total number of todos
- `by_status`: Count per status
- `by_priority`: Count per priority
- `completed_ratio`: Fraction completed (0.0 to 1.0)

**Example:**
```python
stats = tm.get_statistics()
# {
#     'total': 42,
#     'by_status': {'pending': 20, 'in_progress': 5, 'completed': 15, 'archived': 2},
#     'by_priority': {'urgent': 3, 'normal': 30, 'low': 9},
#     'completed_ratio': 0.357
# }
```

## Storage

### File Location

Todos are stored in JSON format at:
```
~/.blackbox5/todos.json
```

### File Format

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

### Atomic Writes

The system uses atomic writes to prevent data corruption:
1. Write to temporary file (`todos.json.tmp`)
2. Rename temporary file to actual file
3. This ensures valid JSON even if process crashes during write

## Testing

### Running Tests

```bash
# Run all tests
pytest .blackbox5/tests/test_todo_manager.py

# Run with coverage
pytest .blackbox5/tests/test_todo_manager.py --cov=.blackbox5/engine/core/todo_manager

# Run specific test class
pytest .blackbox5/tests/test_todo_manager.py::TestTodoManagerQuickAdd

# Run specific test
pytest .blackbox5/tests/test_todo_manager.py::TestTodoManagerQuickAdd::test_quick_add_basic
```

### Test Coverage

The test suite covers:

1. **Todo Dataclass** (`TestTodo`)
   - Creation and field access
   - Serialization (`to_dict`)
   - Deserialization (`from_dict`)

2. **Quick Add** (`TestTodoManagerQuickAdd`)
   - Basic creation
   - With priority
   - With tags
   - Multiple todos

3. **Completion** (`TestTodoManagerComplete`)
   - Mark as complete
   - Non-existent todos
   - Already completed

4. **Updates** (`TestTodoManagerUpdate`)
   - Individual field updates
   - Multiple fields at once
   - Non-existent todos

5. **Deletion** (`TestTodoManagerDelete`)
   - Delete existing
   - Delete non-existent

6. **Listing** (`TestTodoManagerList`)
   - List all
   - Filter by status
   - Filter by priority
   - Filter by tags
   - Limit results
   - Sorting behavior

7. **Search** (`TestTodoManagerSearch`)
   - Search by description
   - Search by notes
   - Search by tags
   - Case-insensitive
   - Empty results

8. **Notes** (`TestTodoManagerNotes`)
   - Add to new todo
   - Append to existing
   - Non-existent todo

9. **Statistics** (`TestTodoManagerStatistics`)
   - Empty state
   - By status
   - By priority
   - Completed ratio

10. **Persistence** (`TestTodoManagerPersistence`)
    - Save and load
    - Atomic writes
    - Corrupted data handling

11. **Integration** (`TestTodoManagerIntegration`)
    - Idea inbox workflow
    - Project tracking workflow
    - Search and refine workflow

## Common Workflows

### Workflow 1: Idea Inbox

Capture ideas throughout the day, organize later:

```python
tm = TodoManager()

# Throughout day - quick capture
tm.quick_add("Refactor auth module")
tm.quick_add("Add user preferences", tags=["feature"])
tm.quick_add("Fix login crash", priority="urgent")

# End of day - review and organize
urgent = tm.list(priority="urgent")
for todo in urgent:
    print(f"URGENT: {todo.description}")

# Add context
tm.add_note(todo_id, "User-reported issue from support ticket #123")

# Update statuses
tm.update(todo_id, status="in_progress")
```

### Workflow 2: Project Tracking

Track multiple projects with tags:

```python
# Project setup
tm.quick_add("Design API schema", tags=["project-alpha", "design"])
tm.quick_add("Implement endpoints", tags=["project-alpha", "backend"])
tm.quick_add("Write tests", tags=["project-alpha", "testing"])

# View project progress
project_alpha = tm.list(tags=["project-alpha"])
print(f"Project Alpha: {len(project_alpha)} tasks")

# Work through tasks
for todo in project_alpha:
    tm.update(todo.id, status="in_progress")
    # ... do work ...
    tm.complete(todo.id)
```

### Workflow 3: Bug Tracking

Use search to find related bugs:

```python
# Report bugs
tm.quick_add("Fix auth timeout", tags=["bug", "auth"])
tm.quick_add("Fix UI rendering", tags=["bug", "ui"])
tm.quick_add("Fix data loss", tags=["bug", "database"], priority="urgent")

# Find all bugs in a component
auth_bugs = tm.search("auth")
for bug in auth_bugs:
    print(f"{bug.id}: {bug.description}")
    if bug.notes:
        print(f"  Notes: {bug.notes}")

# Add investigation notes
tm.add_note(bug_id, "Occurs when token expires after 1 hour")
```

### Workflow 4: Daily Review

Structured daily workflow:

```python
tm = TodoManager()

# Morning - review urgent items
urgent = tm.list(priority="urgent")
print(f"Focus on {len(urgent)} urgent items")

# During day - add new items
tm.quick_add("New idea from meeting", tags=["idea"])

# Evening - update progress
stats = tm.get_statistics()
print(f"Completed {stats['by_status'].get('completed', 0)} items today")
print(f"Completion rate: {stats['completed_ratio']:.1%}")

# Plan tomorrow
pending = tm.list(status="pending", priority="urgent")
print(f"{len(pending)} urgent items for tomorrow")
```

## Integration with BlackBox5

### Agent Integration

The TodoManager can be integrated with agents to enable todo management:

```python
from blackbox5.engine.core.BaseAgent import BaseAgent
from blackbox5.engine.core.todo_manager import TodoManager

class ProductivityAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.todo_manager = TodoManager()

    def handle_todo_command(self, command: str):
        """Handle /todo commands"""
        # Parse: /todo "Fix bug" --priority urgent
        # ...
```

### CLI Integration

Add to command-line interface:

```python
@click.command()
@click.argument('description')
@click.option('--priority', default='normal')
@click.option('--tags', default='')
def todo(description, priority, tags):
    """Quick add a todo"""
    tm = TodoManager()
    tag_list = tags.split(',') if tags else None
    todo_id = tm.quick_add(description, priority, tag_list)
    click.echo(f"Added todo: {todo_id}")
```

## Best Practices

### 1. Use Tags Consistently

```python
# Good: Clear, consistent tags
tm.quick_add("Fix API", tags=["backend", "bug"])
tm.quick_add("Add tests", tags=["backend", "testing"])
tm.quick_add("Update docs", tags=["documentation"])

# Avoid: Inconsistent or vague tags
tm.quick_add("Fix API", tags=["a", "important"])
tm.quick_add("Add tests", tags=["todo", "backend"])
```

### 2. Priority Levels

```python
# Urgent: Do immediately
tm.quick_add("Server down", priority="urgent")

# Normal: Default priority
tm.quick_add("Refactor module", priority="normal")  # or just omit

# Low: Backlog/nice-to-have
tm.quick_add("Update colors", priority="low")
```

### 3. Add Context

```python
todo_id = tm.quick_add("Investigate performance")

# Add details
tm.add_note(todo_id, "Page load takes 5s on dashboard")
tm.add_note(todo_id, "User reported from Chrome on Windows")

# Update as you learn
tm.update(todo_id, estimated_effort="2h")
```

### 4. Regular Reviews

```python
# Daily: Review urgent
urgent = tm.list(priority="urgent")

# Weekly: Review all pending
pending = tm.list(status="pending")

# Monthly: Archive completed
completed = tm.list(status="completed")
for todo in completed:
    tm.update(todo.id, status="archived")
```

## Troubleshooting

### Issue: Todos Not Persisting

**Symptom:** Todos lost between sessions

**Solution:**
- Check file permissions: `~/.blackbox5/todos.json`
- Ensure write access to directory
- Check logs for save errors

### Issue: Search Not Finding Items

**Symptom:** Search returns empty results

**Solution:**
- Search is case-insensitive
- Searches across description, notes, and tags
- Use broader search terms

### Issue: File Corruption

**Symptom:** Todos fail to load

**Solution:**
```python
# System handles corruption gracefully
# Starts with empty todos if file is invalid
tm = TodoManager()  # Will create new file if needed
```

## Performance Considerations

### Scalability

- **Tested up to:** 10,000 todos
- **Search time:** O(n) - linear scan
- **List time:** O(n log n) - due to sorting

### Optimization Tips

For large numbers of todos (>1000):

```python
# Use filters to reduce result set
backend_urgent = tm.list(priority="urgent", tags=["backend"])

# Use limit for large lists
recent = tm.list(limit=50)

# Archive old todos
old_completed = tm.list(status="completed")
for todo in old_completed:
    tm.update(todo.id, status="archived")
```

## Future Enhancements

Potential improvements:

1. **Due Dates**: Add `due_date` field to Todo
2. **Recurring Todos**: Support for repeated tasks
3. **Dependencies**: Track task dependencies
4. **Categories**: Hierarchical organization
5. **Templates**: Pre-defined task templates
6. **Integrations**: Connect to external tools (Jira, GitHub, etc.)
7. **Search Operators**: Advanced search (AND, OR, NOT)
8. **Bulk Operations**: Update multiple todos at once
9. **Reminders**: Time-based notifications
10. **Collaboration**: Share todos between users

## Related Components

- **Task Types** (`task_types.py`): Task infrastructure for agent workflows
- **BaseAgent** (`BaseAgent.py`): Agent integration point
- **GSD Framework**: Overall Getting Stuff Done system

## Summary

The Todo Management System provides:

✅ Quick capture of ideas
✅ Persistent storage
✅ Flexible organization (tags, priority, status)
✅ Full-text search
✅ Progress tracking
✅ Comprehensive testing

This ensures you never lose ideas and always know what's next.
