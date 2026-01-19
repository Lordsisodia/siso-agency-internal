#!/usr/bin/env python3
"""
Todo Management System - Demo Script

This demonstrates the core functionality of the Todo Management System.
"""

import tempfile
from pathlib import Path
from engine.core.todo_manager import TodoManager, Priority, TodoStatus


def print_section(title):
    """Print a section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)


def print_todo(todo):
    """Print a todo in a nice format"""
    status_emoji = {
        TodoStatus.PENDING: "⏳",
        TodoStatus.IN_PROGRESS: "🔄",
        TodoStatus.COMPLETED: "✅",
        TodoStatus.ARCHIVED: "📦"
    }
    priority_emoji = {
        Priority.URGENT: "🔴",
        Priority.NORMAL: "🟡",
        Priority.LOW: "🟢"
    }

    emoji = status_emoji.get(todo.status, "❓")
    priority = priority_emoji.get(todo.priority, "⚪")

    tags_str = f" [{', '.join(todo.tags)}]" if todo.tags else ""
    print(f"  {emoji} {priority} {todo.id}: {todo.description}{tags_str}")

    if todo.notes:
        for line in todo.notes.split('\n'):
            print(f"      📝 {line}")


def demo():
    """Run the todo management demo"""

    # Use temporary storage for demo
    temp_dir = tempfile.mkdtemp()
    storage_path = Path(temp_dir) / "demo_todos.json"

    print_section("Todo Management System Demo")
    print(f"Storage: {storage_path}")

    # Initialize TodoManager
    tm = TodoManager(storage_path=storage_path)

    # 1. Quick Capture
    print_section("1. Quick Capture - Adding Ideas")

    print("\nAdding todos with different priorities and tags...")
    id1 = tm.quick_add("Fix authentication bug", priority="urgent", tags=["backend", "security"])
    id2 = tm.quick_add("Add dark mode", priority="normal", tags=["frontend", "feature"])
    id3 = tm.quick_add("Update documentation", priority="low", tags=["docs"])
    id4 = tm.quick_add("Refactor API", priority="normal", tags=["backend", "tech-debt"])
    id5 = tm.quick_add("Fix UI rendering issue", priority="urgent", tags=["frontend", "bug"])

    print(f"\nAdded {len(tm.todos)} todos:")
    for todo in tm.list():
        print_todo(todo)

    # 2. Add Context
    print_section("2. Adding Context - Notes")

    tm.add_note(id1, "User-reported issue from support ticket #123")
    tm.add_note(id1, "Occurs when JWT token expires")
    tm.add_note(id4, "Consider using RESTful principles")
    tm.add_note(id5, "Only happens on Safari browsers")

    print("\nUpdated todos with notes:")
    todo1 = tm.get(id1)
    print_todo(todo1)

    # 3. Update Status
    print_section("3. Updating Status")

    print("\nMoving todos through workflow...")
    tm.update(id1, status="in_progress")
    tm.update(id2, status="in_progress")

    print("\nIn-progress todos:")
    for todo in tm.list(status="in_progress"):
        print_todo(todo)

    # 4. Complete Tasks
    print_section("4. Completing Tasks")

    print("\nMarking tasks as complete...")
    tm.complete(id1)
    tm.complete(id2)

    print("\nCompleted todos:")
    for todo in tm.list(status="completed"):
        print_todo(todo)

    # 5. Filtering and Listing
    print_section("5. Filtering and Listing")

    print("\nAll pending todos (sorted by priority):")
    for todo in tm.list(status="pending"):
        print_todo(todo)

    print("\nUrgent todos:")
    for todo in tm.list(priority="urgent"):
        print_todo(todo)

    print("\nBackend todos:")
    for todo in tm.list(tags=["backend"]):
        print_todo(todo)

    # 6. Search
    print_section("6. Search")

    print("\nSearching for 'auth':")
    for todo in tm.search("auth"):
        print_todo(todo)

    print("\nSearching for 'bug':")
    for todo in tm.search("bug"):
        print_todo(todo)

    # 7. Statistics
    print_section("7. Statistics")

    stats = tm.get_statistics()
    print(f"\nTotal todos: {stats['total']}")
    print(f"\nBy status:")
    for status, count in stats['by_status'].items():
        print(f"  {status}: {count}")

    print(f"\nBy priority:")
    for priority, count in stats['by_priority'].items():
        print(f"  {priority}: {count}")

    print(f"\nCompletion rate: {stats['completed_ratio']:.1%}")

    # 8. Persistence
    print_section("8. Persistence")

    print("\nCreating new TodoManager instance (simulating restart)...")
    tm2 = TodoManager(storage_path=storage_path)

    print(f"\nLoaded {len(tm2.todos)} todos from disk:")
    for todo in tm2.list():
        print_todo(todo)

    # 9. Cleanup
    print_section("9. Cleanup")

    print("\nDeleting completed todos...")
    for todo in tm.list(status="completed"):
        tm.delete(todo.id)
        print(f"  Deleted: {todo.id}")

    print(f"\nRemaining todos: {len(tm.todos)}")
    for todo in tm.list():
        print_todo(todo)

    print_section("Demo Complete")

    # Cleanup temp directory
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)
    print("\nTemporary storage cleaned up.")


if __name__ == "__main__":
    demo()
