"""
Hierarchical Tasks for Blackbox4
Adapted from CrewAI
"""

from .hierarchical_task import HierarchicalTask

__all__ = ['HierarchicalTask']


def create_task(description, expected_output="", parent=None):
    """Helper to create a hierarchical task."""
    return HierarchicalTask(
        description=description,
        expected_output=expected_output,
        parent_task=parent
    )


def create_task_tree(flat_tasks):
    """
    Convert flat task list to hierarchical tree.

    Args:
        flat_tasks: List of dicts with 'description', 'parent' (optional)

    Returns:
        List of root HierarchicalTask objects
    """
    task_map = {}
    root_tasks = []

    # First pass: create all tasks
    for i, task_data in enumerate(flat_tasks):
        task = HierarchicalTask(
            description=task_data['description'],
            expected_output=task_data.get('expected_output', ''),
            metadata={'original_index': i}
        )
        task_map[task.id] = task

        if task_data.get('parent'):
            task_map[task.id] = task
        else:
            root_tasks.append(task)

    # Second pass: link parents
    for task_data, (task_id, task) in zip(flat_tasks, task_map.items()):
        if task_data.get('parent'):
            parent_id = task_data.get('parent')
            if parent_id in task_map:
                task.parent_task = task_map[parent_id]
                task_map[parent_id].add_child(task)
            else:
                root_tasks.append(task)

    return root_tasks
