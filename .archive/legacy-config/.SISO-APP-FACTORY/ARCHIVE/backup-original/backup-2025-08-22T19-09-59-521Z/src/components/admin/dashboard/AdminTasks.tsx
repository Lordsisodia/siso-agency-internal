import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Plus, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

export function AdminTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete client onboarding for XYZ Corp',
      completed: false,
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
    },
    {
      id: '2',
      title: 'Review and approve new website design',
      completed: false,
      priority: 'medium',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day from now
    },
    {
      id: '3',
      title: 'Send invoice to Acme Inc.',
      completed: true,
      priority: 'high',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      id: '4',
      title: 'Schedule meeting with marketing team',
      completed: false,
      priority: 'low',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    }
  ]);

  const handleToggleCompleted = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed).slice(0, 3);

  return (
    <Card className="border border-gray-800 bg-black/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle>Priority Tasks</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-neutral-100 hover:text-white"
          onClick={() => navigate('/admin/tasks')}
        >
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {pendingTasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white">All caught up! No pending tasks.</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="mr-1 h-4 w-4" />
              Create Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3 p-3 rounded-md bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => handleToggleCompleted(task.id)}
                  className="mt-1"
                />
                <div className="space-y-1 flex-1">
                  <p className={`${task.completed ? 'line-through text-neutral-400' : 'text-white'} font-medium`}>
                    {task.title}
                  </p>
                  <div className="flex items-center text-xs space-x-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <div className="flex items-center text-neutral-100">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatRelativeTime(task.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => navigate('/admin/tasks')}
            >
              <Plus className="mr-1 h-4 w-4" />
              New Task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
