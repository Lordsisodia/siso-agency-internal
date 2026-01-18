import { Button } from '@/components/ui/button';
import { TaskCard } from '@/domains/task-ui/components/TaskCard';
import { useClientTasks } from '@/domains/client/hooks';

interface TasksTabProps {
  clientId: string;
}

export function TasksTab({ clientId }: TasksTabProps) {
  const { tasks, isLoading } = useClientTasks(clientId);

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading tasks…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Client Tasks</h2>
        <Button className="bg-blue-600 text-white hover:bg-blue-500">+ Add Task</Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/60 text-sm text-gray-400">
          No tasks yet. Create the first task to kick things off.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const dueDate = task.due_date ? new Date(task.due_date) : new Date(task.updated_at);
            const createdAt = task.created_at ? new Date(task.created_at) : new Date();

            return (
              <TaskCard
                key={task.id}
                name={task.title}
                startAt={createdAt}
                endAt={dueDate}
                category="Client Work"
                owner={{ name: 'You', image: '' }}
                priority={task.priority}
                status={{ name: task.completed ? 'Done' : 'In Progress', color: task.completed ? '#10b981' : '#fbbf24' }}
                description={task.description ?? undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
