import React from 'react';
import { CheckSquare, Calendar, Clock } from 'lucide-react';
import { DailyTrackerCard } from '@/domains/admin/components-from-root/lifelock/ui/DailyTrackerCard';
import { format } from 'date-fns';

export interface CompletedTask {
  id: string;
  title: string;
  description?: string;
  completedAt: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
  owner: {
    name: string;
    image: string;
  };
}

interface CompletedTasksCardProps {
  tasks: CompletedTask[];
  onTaskClick?: (task: CompletedTask) => void;
}

export const CompletedTasksCard: React.FC<CompletedTasksCardProps> = ({
  tasks,
  onTaskClick
}) => {
  const completedTasksCount = tasks.length;
  const completedToday = tasks.filter(task => 
    format(task.completedAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  // Calculate completion progress (could be based on daily goals or targets)
  const progress = Math.min((completedToday / Math.max(1, completedTasksCount)) * 100, 100);

  return (
    <DailyTrackerCard
      title="✅ Completed Tasks"
      description="Tasks you've successfully completed. Great work!"
      icon={CheckSquare}
      emoji="🎉"
      color="green"
      progress={progress}
      badge={{
        label: `${completedTasksCount} completed`,
        variant: 'outline'
      }}
      headerContent={
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-300/80">Completed Today:</span>
            <span className="text-green-400 font-medium">{completedToday}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-300/80">Total Completed:</span>
            <span className="text-green-400 font-medium">{completedTasksCount}</span>
          </div>
        </div>
      }
    >
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckSquare className="h-12 w-12 text-green-400/30 mb-3" />
          <p className="text-green-300/60 text-sm">
            No completed tasks yet.
          </p>
          <p className="text-green-300/40 text-xs mt-1">
            Complete some tasks to see them here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className="group bg-green-900/20 rounded-lg p-4 border border-green-700/30 hover:border-green-600/50 hover:bg-green-900/30 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="h-4 w-4 text-green-400" />
                    <h4 className="text-sm font-medium text-green-100 group-hover:text-white transition-colors">
                      {task.title}
                    </h4>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-green-300/70 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-green-300/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Completed {format(task.completedAt, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {task.completedAt.toDateString() === new Date().toDateString() 
                          ? 'Today' 
                          : format(task.completedAt, 'MMM d')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {task.priority}
                  </div>
                  <div className="text-xs text-green-300/50 font-medium">
                    {task.category}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-xs text-green-300/60">
                And {tasks.length - 5} more completed tasks...
              </p>
            </div>
          )}
        </div>
      )}
    </DailyTrackerCard>
  );
};

export default CompletedTasksCard;