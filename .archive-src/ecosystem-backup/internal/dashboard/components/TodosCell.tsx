
import React from 'react';
import { TodoItem } from '@/types/client.types';

interface TodosCellProps {
  todos: TodoItem[] | null | undefined;
}

export const TodosCell = ({ todos }: TodosCellProps) => {
  if (!todos || todos.length === 0) {
    return <span>-</span>;
  }

  const pendingCount = todos.filter(item => !item.completed).length;
  return (
    <div className="flex items-center gap-2">
      <span className="bg-blue-500/10 text-blue-500 rounded-full px-2 py-0.5 text-xs">
        {pendingCount} pending tasks
      </span>
    </div>
  );
};
