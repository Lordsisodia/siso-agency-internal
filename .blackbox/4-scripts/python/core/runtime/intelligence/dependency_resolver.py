"""
Dependency Resolution Module
Builds and manages task dependency graphs for intelligent execution ordering
"""

from typing import List, Dict, Set, Optional
from collections import defaultdict, deque
from dataclasses import dataclass, field

from .models import Task


@dataclass
class DependencyGraph:
    """
    Directed acyclic graph representing task dependencies

    Attributes:
        graph: Adjacency list (task_id -> list of dependent task IDs)
        reverse_graph: Reverse adjacency list (task_id -> list of prerequisite IDs)
        all_tasks: Set of all task IDs in the graph
    """
    graph: Dict[str, List[str]] = field(default_factory=dict)
    reverse_graph: Dict[str, List[str]] = field(default_factory=dict)
    all_tasks: Set[str] = field(default_factory=set)

    def add_edge(self, from_task: str, to_task: str):
        """Add a dependency edge (from_task must complete before to_task)"""
        if from_task not in self.graph:
            self.graph[from_task] = []
        if to_task not in self.graph:
            self.graph[to_task] = []

        if to_task not in self.reverse_graph:
            self.reverse_graph[to_task] = []
        if from_task not in self.reverse_graph:
            self.reverse_graph[from_task] = []

        self.graph[from_task].append(to_task)
        self.reverse_graph[to_task].append(from_task)
        self.all_tasks.update([from_task, to_task])

    def get_prerequisites(self, task_id: str) -> List[str]:
        """Get all prerequisites for a task"""
        return self.reverse_graph.get(task_id, [])

    def get_dependents(self, task_id: str) -> List[str]:
        """Get all tasks that depend on this task"""
        return self.graph.get(task_id, [])

    def topological_sort(self) -> List[str]:
        """
        Perform topological sort to get valid execution order

        Returns:
            List of task IDs in dependency order (prerequisites first)

        Raises:
            ValueError: If graph contains cycles
        """
        in_degree = {task: 0 for task in self.all_tasks}
        for task in self.all_tasks:
            for dependent in self.graph.get(task, []):
                in_degree[dependent] += 1

        queue = deque([task for task in self.all_tasks if in_degree[task] == 0])
        result = []

        while queue:
            task = queue.popleft()
            result.append(task)

            for dependent in self.graph.get(task, []):
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    queue.append(dependent)

        if len(result) != len(self.all_tasks):
            raise ValueError("Dependency graph contains cycles")

        return result


class DependencyResolver:
    """
    Resolves and manages task dependencies

    Features:
    - Build dependency graphs from task lists
    - Validate dependency satisfaction
    - Detect circular dependencies
    - Suggest execution order
    - Find tasks ready for execution
    """

    def __init__(self):
        self.graph: Optional[DependencyGraph] = None

    def resolve(self, tasks: List[Task]) -> DependencyGraph:
        """
        Build dependency graph from task list

        Args:
            tasks: List of tasks with dependencies

        Returns:
            DependencyGraph representing the dependency structure

        Raises:
            ValueError: If circular dependencies detected
        """
        self.graph = DependencyGraph()

        # Build task lookup
        task_map = {task.id: task for task in tasks}

        # Add edges for dependencies
        for task in tasks:
            for dep_id in task.depends_on:
                if dep_id not in task_map:
                    raise ValueError(f"Task {task.id} depends on non-existent task {dep_id}")
                self.graph.add_edge(dep_id, task.id)

            # Ensure all tasks are in the graph
            if task.id not in self.graph.all_tasks:
                self.graph.graph[task.id] = []
                self.graph.reverse_graph[task.id] = []
                self.graph.all_tasks.add(task.id)

        # Validate no cycles
        try:
            self.graph.topological_sort()
        except ValueError as e:
            cycle = self._find_cycle()
            raise ValueError(f"Circular dependency detected: {' -> '.join(cycle)}") from e

        return self.graph

    def is_satisfied(self, task: Task, completed: List[str]) -> bool:
        """
        Check if all task dependencies are satisfied

        Args:
            task: Task to check
            completed: List of completed task IDs

        Returns:
            True if all dependencies satisfied, False otherwise
        """
        if not task.depends_on:
            return True

        return all(dep_id in completed for dep_id in task.depends_on)

    def get_ready_tasks(self, tasks: List[Task], completed: List[str]) -> List[Task]:
        """
        Get all tasks whose dependencies are satisfied

        Args:
            tasks: List of all tasks
            completed: List of completed task IDs

        Returns:
            List of tasks ready for execution
        """
        return [
            task for task in tasks
            if task.status == "pending"
            and self.is_satisfied(task, completed)
        ]

    def get_execution_order(self, tasks: List[Task]) -> List[str]:
        """
        Get suggested execution order based on dependencies

        Args:
            tasks: List of tasks

        Returns:
            List of task IDs in dependency order
        """
        if self.graph is None:
            self.resolve(tasks)

        return self.graph.topological_sort()

    def get_blocking_tasks(self, task: Task, tasks: List[Task]) -> List[Task]:
        """
        Get tasks that are blocking this task (unsatisfied dependencies)

        Args:
            task: Task to check
            tasks: List of all tasks

        Returns:
            List of blocking tasks
        """
        task_map = {t.id: t for t in tasks}
        blocking = []

        for dep_id in task.depends_on:
            if dep_id in task_map:
                dep_task = task_map[dep_id]
                if dep_task.status != "completed":
                    blocking.append(dep_task)

        return blocking

    def get_dependent_tasks(self, task_id: str, tasks: List[Task]) -> List[Task]:
        """
        Get all tasks that depend on the given task

        Args:
            task_id: Task ID to check
            tasks: List of all tasks

        Returns:
            List of dependent tasks
        """
        if self.graph is None:
            self.resolve(tasks)

        dependent_ids = self.graph.get_dependents(task_id)
        task_map = {t.id: t for t in tasks}

        return [task_map[tid] for tid in dependent_ids if tid in task_map]

    def get_critical_path(self, tasks: List[Task]) -> List[str]:
        """
        Get the critical path (longest dependency chain)

        Args:
            tasks: List of tasks

        Returns:
            List of task IDs representing the critical path
        """
        if self.graph is None:
            self.resolve(tasks)

        # Calculate longest path using DFS
        memo = {}

        def dfs(task_id: str) -> int:
            if task_id in memo:
                return memo[task_id]

            max_path = 0
            for dependent in self.graph.get_dependents(task_id):
                max_path = max(max_path, 1 + dfs(dependent))

            memo[task_id] = max_path
            return max_path

        # Find task with longest path
        max_length = 0
        start_task = None

        for task_id in self.graph.all_tasks:
            length = dfs(task_id)
            if length > max_length:
                max_length = length
                start_task = task_id

        # Reconstruct path
        if start_task is None:
            return []

        path = [start_task]
        current = start_task

        while self.graph.get_dependents(current):
            # Choose dependent with longest remaining path
            dependents = self.graph.get_dependents(current)
            next_task = max(dependents, key=lambda d: dfs(d))
            path.append(next_task)
            current = next_task

            if len(path) > 100:  # Safety limit
                break

        return path

    def _find_cycle(self) -> List[str]:
        """
        Find a cycle in the dependency graph using DFS

        Returns:
            List of task IDs forming a cycle
        """
        if self.graph is None:
            return []

        visited = set()
        rec_stack = set()
        path = []

        def dfs(task_id: str) -> bool:
            visited.add(task_id)
            rec_stack.add(task_id)
            path.append(task_id)

            for neighbor in self.graph.get(task_id, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    # Found cycle
                    cycle_start = path.index(neighbor)
                    return path[cycle_start:] + [neighbor]

            path.pop()
            rec_stack.remove(task_id)
            return False

        for task_id in self.graph.all_tasks:
            if task_id not in visited:
                if dfs(task_id):
                    return path

        return []

    def visualize_graph(self) -> str:
        """
        Generate a text-based visualization of the dependency graph

        Returns:
            String representation of the graph
        """
        if self.graph is None:
            return "No dependency graph built yet"

        lines = ["Dependency Graph:", ""]

        # Get topological order
        try:
            order = self.graph.topological_sort()
            lines.append(f"Execution Order ({len(order)} tasks):")
            lines.append(" -> ".join(order))
            lines.append("")
        except ValueError:
            lines.append("WARNING: Graph contains cycles!")
            lines.append("")

        # Show dependencies by task
        lines.append("Task Dependencies:")
        for task_id in sorted(self.graph.all_tasks):
            prereqs = self.graph.get_prerequisites(task_id)
            if prereqs:
                lines.append(f"  {task_id} <- {', '.join(prereqs)}")
            else:
                lines.append(f"  {task_id} (no dependencies)")

        return "\n".join(lines)
