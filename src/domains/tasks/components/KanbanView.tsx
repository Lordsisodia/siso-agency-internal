/**
 * KanbanView Component
 * Kanban board view for task management
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, TaskStatus } from '@/domains/tasks/types/task.types';
import { TASK_STATUS_CONFIG } from '@/domains/tasks/constants/taskConstants';
import { getStatusColor, getPriorityColor } from '@/domains/tasks/utils/taskHelpers';

interface KanbanViewProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onCreateTask?: () => void;
}

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onCreateTask?: () => void;
}

interface KanbanCardProps {
  task: Task;
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onTaskSelect,
  onTaskEdit
}) => {
  const handleClick = () => {
    onTaskSelect?.(task.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskEdit?.(task.id);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow mb-3"
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm line-clamp-2 flex-1 pr-2">
            {task.title}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-1 mb-2">
          <Badge className={cn(
            'text-xs px-2 py-0.5',
            getPriorityColor(task.priority)
          )}>
            {task.priority}
          </Badge>
          
          {task.category && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {task.category}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          {task.due_date && (
            <span>
              Due: {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
          
          {task.assigned_to && (
            <span className="truncate max-w-20">
              {task.assigned_to}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  onTaskSelect,
  onTaskEdit,
  onCreateTask
}) => {
  const config = TASK_STATUS_CONFIG[status];
  const columnTasks = tasks.filter(task => task.status === status);

  return (
    <div className="flex-1 min-w-80 max-w-sm">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className={cn(
                'w-3 h-3 rounded-full',
                config.bgColor
              )} />
              {config.label}
              <Badge variant="secondary" className="ml-2">
                {columnTasks.length}
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateTask}
              className="p-1 h-auto"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-4">
          <div className="space-y-0 max-h-96 overflow-y-auto">
            {columnTasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onTaskSelect={onTaskSelect}
                onTaskEdit={onTaskEdit}
              />
            ))}
            
            {columnTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No tasks</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCreateTask}
                  className="mt-2 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add task
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  onTaskSelect,
  onTaskEdit,
  onCreateTask
}) => {
  const statuses: TaskStatus[] = [
    'not_started',
    'in_progress', 
    'completed',
    'on_hold'
  ];

  return (
    <div className="kanban-view h-full p-4">
      <div className="flex gap-4 h-full overflow-x-auto">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks}
            onTaskSelect={onTaskSelect}
            onTaskEdit={onTaskEdit}
            onCreateTask={onCreateTask}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanView;