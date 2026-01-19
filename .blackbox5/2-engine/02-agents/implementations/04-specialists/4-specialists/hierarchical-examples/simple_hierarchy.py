#!/usr/bin/env python3
"""
Simple Hierarchical Tasks Example
Demonstrates basic parent-child task relationships
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../', '4-scripts/lib/hierarchical-tasks'))

from hierarchical_task import HierarchicalTask, create_task

print("=== Simple Hierarchical Tasks Example ===\n")

# Create root task
root = HierarchicalTask(
    description="Build User Authentication System",
    expected_output="Complete authentication system with login, logout, and password reset"
)

# Add child tasks
login = create_task("Implement login page", parent=root)
logout = create_task("Implement logout functionality", parent=root)
password_reset = create_task("Add password reset feature", parent=root)

# Add sub-child tasks (grandchildren)
create_task("Design login form UI", parent=login)
create_task("Implement authentication logic", parent=login)
create_task("Add session management", parent=login)

create_task("Add logout button to navbar", parent=logout)
create_task("Clear session data", parent=logout)

create_task("Create forgot password form", parent=password_reset)
create_task("Implement email verification", parent=password_reset)

# Display hierarchy
print("Task Hierarchy:")
print("-" * 50)
for task in [root, login, logout, password_reset]:
    if task.parent_task is None:  # Only print root
        print(task.to_checklist_item())
        for child in task.children:
            print(child.to_checklist_item())
            for grandchild in child.children:
                print(grandchild.to_checklist_item())

print("\nStatistics:")
print(f"  Total tasks: {len([root]) + len(root.children) + sum(len(c.children) for c in root.children)}")
print(f"  Root tasks: 1")
print(f"  Max depth: {max(t.get_depth() for t in [root] + root.children + [gc for c in root.children for gc in c.children])}")
