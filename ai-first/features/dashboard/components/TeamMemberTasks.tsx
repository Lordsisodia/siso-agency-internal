
import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'todo' | 'blocked';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface TeamMemberTasksProps {
  memberId: string;
}

export function TeamMemberTasks({ memberId }: TeamMemberTasksProps) {
  // In a real app, you'd fetch tasks for the specific member
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Implement dashboard analytics',
      status: 'in-progress',
      dueDate: '2025-06-15',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Design new logo concepts',
      status: 'completed',
      dueDate: '2025-06-10',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Create onboarding tutorial',
      status: 'blocked',
      dueDate: '2025-06-20',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Update documentation',
      status: 'todo',
      dueDate: '2025-06-25',
      priority: 'low'
    },
    {
      id: '5',
      title: 'Fix navigation bug',
      status: 'completed',
      dueDate: '2025-06-08',
      priority: 'high'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'todo':
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        Assigned Tasks ({mockTasks.length})
      </div>
      
      <div className="space-y-2">
        {mockTasks.map(task => (
          <div 
            key={task.id} 
            className="p-3 border rounded-md flex items-center gap-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex-shrink-0">
              {getStatusIcon(task.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{task.title}</div>
              <div className="text-xs text-muted-foreground">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {getPriorityBadge(task.priority)}
            </div>
          </div>
        ))}
      </div>
      
      {mockTasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No tasks assigned to this team member
        </div>
      )}
    </div>
  );
}
