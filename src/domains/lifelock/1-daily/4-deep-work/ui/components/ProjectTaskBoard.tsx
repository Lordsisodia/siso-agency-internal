import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/domains/calendar/ui/calendar';
import { Calendar, AlertCircle, CheckCircle, Code, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'awaiting' | 'development' | 'done';
  progress: number;
  due_date: string;
  assignee: {
    name: string;
    avatar: string;
    initials: string;
  };
  category: string;
  amount?: number;
  phase?: string;
  days_left?: number;
  completed_date?: string;
}

interface TaskColumnProps {
  title: string;
  status: 'awaiting' | 'development' | 'done';
  tasks: ProjectTask[];
  icon: React.ReactNode;
  color: string;
}

const TaskCard: React.FC<{ task: ProjectTask }> = ({ task }) => {
  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500', 
    low: 'bg-green-500'
  };

  const statusColors = {
    awaiting: 'bg-red-500/10 text-red-400',
    development: 'bg-blue-500/10 text-blue-400',
    done: 'bg-green-500/10 text-green-400'
  };

  const getTimeDisplay = () => {
    if (task.status === 'done' && task.completed_date) {
      const completedDate = new Date(task.completed_date);
      return (
        <span className="text-green-400">
          Completed {completedDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      );
    }
    
    if (task.days_left !== undefined) {
      const isOverdue = task.days_left < 0;
      const absDay = Math.abs(task.days_left);
      
      if (isOverdue) {
        return <span className="text-red-400">Overdue by {absDay} day{absDay !== 1 ? 's' : ''}</span>;
      } else if (task.days_left === 0) {
        return <span className="text-yellow-400">Due today</span>;
      } else {
        return <span className="text-gray-400">{task.days_left} day{task.days_left !== 1 ? 's' : ''} left</span>;
      }
    }
    
    return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-600 to-slate-500" />
                <h3 className="font-semibold text-white text-sm">{task.title}</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn("text-xs px-2 py-1", priorityColors[task.priority])}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                {task.assignee.initials}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", statusColors[task.status])}>
              {task.status === 'awaiting' && 'Awaiting Your Action'}
              {task.status === 'development' && 'In Development'}
              {task.status === 'done' && 'Done'}
            </Badge>
          </div>

          {/* Category, Phase, and Due Date */}
          <div className="flex items-center gap-2 text-xs">
            {task.category && (
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {task.category}
              </Badge>
            )}
            {task.phase && (
              <span className="text-slate-400">{task.phase}</span>
            )}
            
            {/* Due Date Pill */}
            <Popover>
              <PopoverTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="border-blue-500/50 text-blue-400 bg-blue-500/10 cursor-pointer hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                >
                  <CalendarIcon className="h-3 w-3" />
                  {format(new Date(task.due_date), 'MMM d')}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={new Date(task.due_date)}
                  onSelect={(date) => {
                    if (date) {
                      // Handle due date change here
                      console.log('Due date changed to:', date);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Progress Bar */}
          {task.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{task.category}: {task.progress}%</span>
                <span className="text-slate-300">{task.progress}%</span>
              </div>
              <Progress 
                value={task.progress} 
                className="h-2 bg-slate-700"
              />
            </div>
          )}

          {/* Time and Amount */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {getTimeDisplay()}
            </div>
            
            {task.amount && (
              <div className="flex items-center gap-1 text-slate-300">
                <DollarSign className="w-3 h-3" />
                £{task.amount.toLocaleString()}
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button 
            size="sm" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {task.status === 'awaiting' && 'Complete Now'}
            {task.status === 'development' && 'View Progress'}
            {task.status === 'done' && 'View Details'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, tasks, icon, color }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <Badge variant="secondary" className="ml-auto">
          {tasks.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <React.Fragment key={task.id}>
            <TaskCard task={task} />
            {index < tasks.length - 1 && (
              <div className="h-px bg-white/40 my-3 mx-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export function ProjectTaskBoard() {
  const [tasks] = useState<ProjectTask[]>([
    {
      id: '1',
      title: 'Collect Project Information',
      priority: 'high',
      status: 'awaiting',
      progress: 0,
      due_date: new Date().toISOString(),
      assignee: { name: 'Project Manager', avatar: '', initials: 'PM' },
      category: 'Onboarding',
      days_left: 0
    },
    {
      id: '2',
      title: 'Approve App Plan',
      priority: 'high', 
      status: 'awaiting',
      progress: 50,
      due_date: new Date(Date.now() + 86400000).toISOString(),
      assignee: { name: 'Project Manager', avatar: '', initials: 'PM' },
      category: 'Planning',
      days_left: 1
    },
    {
      id: '3',
      title: 'Make Deposit Payment',
      priority: 'high',
      status: 'awaiting', 
      progress: 0,
      due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
      assignee: { name: 'Finance Team', avatar: '', initials: 'FT' },
      category: 'Deposit',
      amount: 1000,
      days_left: 2
    },
    {
      id: '4',
      title: 'Review Phase 1 Deliverables',
      priority: 'high',
      status: 'awaiting',
      progress: 50,
      due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      assignee: { name: 'Project Manager', avatar: '', initials: 'PM' },
      category: 'Phase 1',
      days_left: 5
    },
    {
      id: '5',
      title: 'Phase 1: Initial Development',
      priority: 'medium',
      status: 'development',
      progress: 30,
      due_date: new Date(Date.now() + 30 * 86400000).toISOString(),
      assignee: { name: 'Development Team', avatar: '', initials: 'DT' },
      category: 'Phase 1',
      phase: 'Phase 1: 30%',
      days_left: 30
    },
    {
      id: '6',
      title: 'Phase 2: Core Development',
      priority: 'medium',
      status: 'development', 
      progress: 0,
      due_date: new Date(Date.now() + 60 * 86400000).toISOString(),
      assignee: { name: 'Development Team', avatar: '', initials: 'DT' },
      category: 'Phase 2',
      phase: 'Phase 2: 0%',
      days_left: 60
    },
    {
      id: '7',
      title: 'Phase 3: Final Development',
      priority: 'medium',
      status: 'development',
      progress: 0,
      due_date: new Date(Date.now() + 90 * 86400000).toISOString(),
      assignee: { name: 'Development Team', avatar: '', initials: 'DT' },
      category: 'Phase 3',
      phase: 'Phase 3: 0%',
      days_left: 30
    },
    {
      id: '8',
      title: 'Client Kickoff Call',
      priority: 'medium',
      status: 'done',
      progress: 100,
      due_date: new Date(Date.now() - 31 * 86400000).toISOString(),
      assignee: { name: 'Project Manager', avatar: '', initials: 'PM' },
      category: 'Completed',
      completed_date: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: '9',
      title: 'Project Completed',
      priority: 'low',
      status: 'done',
      progress: 100,
      due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      assignee: { name: 'Project Manager', avatar: '', initials: 'PM' },
      category: 'Completed',
      completed_date: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ]);

  const awaitingTasks = tasks.filter(task => task.status === 'awaiting');
  const developmentTasks = tasks.filter(task => task.status === 'development');
  const doneTasks = tasks.filter(task => task.status === 'done');

  return (
    <div className="p-6 bg-slate-900/50 rounded-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TaskColumn
          title="Awaiting Your Action"
          status="awaiting"
          tasks={awaitingTasks}
          icon={<AlertCircle />}
          color="bg-red-500"
        />
        
        <TaskColumn
          title="In Development"
          status="development"
          tasks={developmentTasks}
          icon={<Code />}
          color="bg-blue-500"
        />
        
        <TaskColumn
          title="Done"
          status="done"
          tasks={doneTasks}
          icon={<CheckCircle />}
          color="bg-green-500"
        />
      </div>
    </div>
  );
} 