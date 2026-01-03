import { sortSubtasksHybrid, type SortableSubtask } from "../../_shared/utils/subtaskSorting";

export type SortableTask = {
  id: string;
  priority?: string | null;
  dueDate?: string | null;
};

// Hybrid sort for main deep-work tasks: overdue → today → future (weighted) → none, respecting urgency.
export function sortDeepWorkTasksHybrid<T extends SortableTask>(tasks: T[]): T[] {
  type Wrapped = SortableSubtask & { original: T };

  const wrapped: Wrapped[] = tasks.map((task) => ({
    id: task.id,
    priority: task.priority ?? undefined,
    dueDate: task.dueDate ?? undefined,
    original: task,
  }));

  return sortSubtasksHybrid<Wrapped>(wrapped).map((item) => item.original);
}
