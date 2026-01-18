#!/usr/bin/env python3
"""
Checklist Integration Example
Demonstrates integration with existing checklist.md system
"""

import sys
import os
import tempfile
import shutil
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../', '4-scripts/planning'))

# Import after path setup
try:
    from hierarchical_plan import HierarchicalPlanManager
except ImportError:
    print("Note: hierarchical_plan.py not yet implemented")
    print("This example demonstrates the intended usage")

print("=== Checklist Integration Example ===\n")

# Create temporary plan directory
temp_dir = tempfile.mkdtemp(prefix='blackbox4_plan_')
print(f"Using temporary directory: {temp_dir}")

try:
    # Create sample checklist with hierarchy
    checklist_path = os.path.join(temp_dir, 'checklist.md')
    with open(checklist_path, 'w') as f:
        f.write("""# Project Tasks

- [ ] Design System Architecture
  - [ ] Define component structure
  - [ ] Plan state management
  - [ ] Design API endpoints
- [ ] Implement Frontend
  - [ ] Create React components
  - [ ] Implement routing
  - [ ] Add styling
- [ ] Implement Backend
  - [ ] Set up database schema
  - [ ] Create API endpoints
  - [ ] Implement authentication
- [ ] Testing & Deployment
  - [ ] Write unit tests
  - [ ] Integration testing
  - [ ] Deploy to production
""")

    # Create manager and load
    manager = HierarchicalPlanManager(temp_dir)
    tasks = manager.load_from_checklist()

    print(f"Loaded {len(tasks)} tasks from checklist.md")
    print(f"Root tasks: {len(manager.root_tasks)}")

    # Validate hierarchy
    report = manager.validate_hierarchy()
    print(f"\nValidation: {'✅ VALID' if report['valid'] else '❌ INVALID'}")
    print(f"Statistics:")
    print(f"  Total tasks: {report['stats']['total_tasks']}")
    print(f"  Root tasks: {report['stats']['root_tasks']}")
    print(f"  Max depth: {report['stats']['max_depth']}")
    print(f"  Completed: {report['stats']['completed']}")

    # Add a new task
    print(f"\n--- Adding New Task ---")
    new_task = manager.add_task(
        description="Create documentation",
        parent_id=manager.root_tasks[0].id
    )
    print(f"✅ Added: {new_task.description}")
    print(f"   Parent: {new_task.parent_task.description}")
    print(f"   Depth: {new_task.get_depth()}")

    # Mark a task complete
    print(f"\n--- Marking Task Complete ---")
    first_task = manager.root_tasks[0]
    manager.mark_complete(first_task.id, complete=True)
    print(f"✅ Marked complete: {first_task.description}")

    # Save updated checklist
    manager.save_to_checklist()
    print(f"\n✅ Saved updated checklist.md")

    # Display final checklist
    print(f"\n--- Final Checklist ---")
    with open(checklist_path) as f:
        print(f.read())

    # Export to JSON
    json_path = os.path.join(temp_dir, 'plan-export.json')
    manager.export_json(json_path)
    print(f"✅ Exported to JSON: {json_path}")

finally:
    # Cleanup
    shutil.rmtree(temp_dir)
    print(f"\n✅ Cleaned up temporary directory")
