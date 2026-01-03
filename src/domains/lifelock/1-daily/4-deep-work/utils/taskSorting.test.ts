import { describe, expect, test } from 'vitest';
import { sortDeepWorkTasksHybrid, type SortableTask } from './taskSorting';
import { getSubtaskSortDebugInfo } from '../../_shared/utils/subtaskSorting';

const formatDate = (offsetDays: number) => {
  const date = new Date();
  // Noon local time avoids UTC day-shift when converting to ISO.
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

describe('sortDeepWorkTasksHybrid', () => {
  test('orders tasks by overdue → today → future (weighted) → none, respecting urgency', () => {
    const tasks: SortableTask[] = [
      { id: 'overdue-medium', priority: 'medium', dueDate: formatDate(-1) },
      { id: 'today-low', priority: 'low', dueDate: formatDate(0) },
      { id: 'future-urgent', priority: 'urgent', dueDate: formatDate(3) },
      { id: 'future-medium', priority: 'medium', dueDate: formatDate(1) },
      { id: 'no-date-high', priority: 'high', dueDate: null },
    ];

    // Sanity check the weighted scores we expect to drive the sort
    const debug = tasks.map((t) => ({ id: t.id, ...getSubtaskSortDebugInfo({ id: t.id, priority: t.priority, dueDate: t.dueDate || undefined }) }));
    const futureUrgent = debug.find((d) => d.id === 'future-urgent');
    const futureMedium = debug.find((d) => d.id === 'future-medium');
    expect(futureUrgent?.score).toBeGreaterThan(futureMedium?.score ?? 0);

    const ordered = sortDeepWorkTasksHybrid(tasks).map((t) => t.id);

    // Buckets stay in the same order as subtasks (overdue → today → future → none)
    expect(ordered[0]).toBe('overdue-medium');
    expect(ordered[1]).toBe('today-low');
    expect(ordered[ordered.length - 1]).toBe('no-date-high');

    // Within future bucket, urgency beats proximity when weighted
    expect(ordered.indexOf('future-urgent')).toBeLessThan(ordered.indexOf('future-medium'));
  });
});
