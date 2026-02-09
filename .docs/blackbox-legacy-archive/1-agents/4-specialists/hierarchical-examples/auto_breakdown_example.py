#!/usr/bin/env python3
"""
Auto-Breakdown Example
Demonstrates automatic task breakdown from requirements
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../', '4-scripts/lib/task-breakdown'))

from write_tasks import TaskBreakdownEngine

print("=== Auto-Breakdown Example ===\n")

# Sample requirement
requirement = """
I need to create a user management system for our web application.

1. Implement user registration with email verification
2. Create user profile management interface
3. Add role-based access control (admin, user, guest)
4. Build user search and filtering functionality
5. Develop user activity tracking dashboard

The system should support at least 10,000 concurrent users and integrate
with our existing authentication system.
"""

# Create engine
engine = TaskBreakdownEngine()

# Break down requirement
breakdown = engine.breakdown(requirement)

# Display results
print("Generated Tasks:")
print("-" * 50)
for i, task in enumerate(breakdown, 1):
    deps = f" (depends on: {', '.join(task['dependencies'])})" if task['dependencies'] else ""
    effort = f" [{task['effort']}]" if task.get('effort') else ""
    print(f"{i}. {task['description']}{effort}{deps}")

print(f"\nTotal tasks: {len(breakdown)}")
print(f"Tasks with dependencies: {sum(1 for t in breakdown if t['dependencies'])}")

# Convert to hierarchical tasks
root_tasks = engine.to_hierarchical_tasks(breakdown)

print(f"\nRoot tasks: {len(root_tasks)}")
for root in root_tasks:
    print(f"  - {root.description}")

# Save example plan
output_dir = os.path.join(os.path.dirname(__file__), 'example-plan')
result = engine.breakdown_and_save(requirement, output_dir)

print(f"\n✅ Example plan saved to: {output_dir}")
print(f"   Files created:")
for name, path in result['files'].items():
    print(f"      - {name}")
