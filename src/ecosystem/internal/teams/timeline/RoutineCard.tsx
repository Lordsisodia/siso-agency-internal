
import React from 'react';
import { Card } from '@/components/ui/card';
import { Coffee, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface RoutineCardProps {
  type: 'morning' | 'evening';
  time: Date;
  status: 'pending' | 'completed';
  onClick: () => void;
}

export function RoutineCard({ type, time, status, onClick }: RoutineCardProps) {
  const isMorning = type === 'morning';
  const Icon = isMorning ? Coffee : Sparkles;
  const title = isMorning ? "Morning Routine" : "Evening Check-out";
  const position = time.getHours() * 80; // 80px per hour
  
  // Simulate progress for visual consistency
  const progress = status === 'completed' ? 100 : 0;
  
  const routineTasks = isMorning ? [
    { id: 'mr1', title: 'Review agenda', completed: status === 'completed' },
    { id: 'mr2', title: 'Check emails', completed: status === 'completed' },
    { id: 'mr3', title: 'Update task status', completed: status === 'completed' },
    { id: 'mr4', title: 'Prepare for standup', completed: status === 'completed' },
  ] : [
    { id: 'er1', title: 'Review completed tasks', completed: status === 'completed' },
    { id: 'er2', title: 'Document blockers', completed: status === 'completed' },
    { id: 'er3', title: 'Plan tomorrow', completed: status === 'completed' },
  ];

  return (
    <Card 
      className={cn(
        "absolute left-0 right-0 p-4 transition-all duration-200",
        "hover:ring-2 hover:ring-purple-500/50 backdrop-blur-sm",
        "rounded-lg border shadow-lg cursor-pointer",
        "flex flex-col justify-between gap-3",
        "min-h-[160px]",
        status === 'completed' ? 'bg-gray-800/30' : 'bg-gray-800/50 hover:bg-gray-800/70',
        isMorning ? 'border-green-500/30' : 'border-purple-500/30'
      )}
      style={{ 
        top: `${position}px`,
        width: 'calc(100% - 2rem)',
        minHeight: '160px'
      }}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-base">{title}</h3>
              {status === 'completed' && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(time, 'h:mm a')}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </div>
          
          <div className={cn(
            "p-2 rounded-full",
            isMorning ? "bg-green-500/10" : "bg-purple-500/10"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              isMorning ? "text-green-500" : "text-purple-500"
            )} />
          </div>
        </div>

        <ul className="space-y-1 text-sm text-muted-foreground">
          {routineTasks.map(task => (
            <li key={task.id} className="flex items-center gap-2">
              <CheckCircle2 className={cn(
                "h-3 w-3",
                task.completed ? "text-green-500" : "text-gray-500"
              )} />
              <span className={task.completed ? "line-through" : ""}>
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
