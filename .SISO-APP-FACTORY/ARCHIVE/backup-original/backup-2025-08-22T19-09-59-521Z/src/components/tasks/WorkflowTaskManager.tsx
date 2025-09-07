import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, ArrowRight, Rocket, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMainUserProject } from '@/hooks/useUserProjects';
import { useNavigate } from 'react-router-dom';

interface WorkflowTask {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  priority: 'high' | 'medium' | 'low';
  action?: () => void;
  actionText?: string;
  icon?: React.ReactNode;
}

interface WorkflowTaskManagerProps {
  title?: string;
  className?: string;
}

export function WorkflowTaskManager({ 
  title = "Your Next Steps", 
  className 
}: WorkflowTaskManagerProps) {
  const navigate = useNavigate();
  const { project, hasProjects, loading } = useMainUserProject();
  
  // Use localStorage for custom task persistence
  const [customTasks, setCustomTasks] = useLocalStorage<WorkflowTask[]>(
    'dashboard-workflow-tasks',
    []
  );
  
  const [newTaskText, setNewTaskText] = useState('');

  // Generate workflow tasks based on user state
  const getWorkflowTasks = (): WorkflowTask[] => {
    const workflowTasks: WorkflowTask[] = [];
    
    if (!hasProjects) {
      workflowTasks.push({
        id: 'create-project',
        text: 'Create your first project',
        completed: false,
        created_at: new Date().toISOString(),
        priority: 'high',
        action: () => navigate('/projects/new'),
        actionText: 'Start Now',
        icon: <Rocket className="h-4 w-4" />
      });
    } else if (project) {
      // If project exists, add relevant workflow tasks
      workflowTasks.push({
        id: 'confirm-app-plan',
        text: 'Confirm app plan and requirements',
        completed: project.status === 'active' || project.status === 'completed',
        created_at: new Date().toISOString(),
        priority: 'high',
        action: () => navigate(`/projects/${project.id}`),
        actionText: 'Review Plan',
        icon: <CheckCircle className="h-4 w-4" />
      });
      
      if (project.status === 'active') {
        workflowTasks.push({
          id: 'wait-for-mvp',
          text: 'Wait for MVP development',
          completed: false,
          created_at: new Date().toISOString(),
          priority: 'medium',
          action: () => navigate(`/projects/${project.id}/timeline`),
          actionText: 'View Progress',
          icon: <Clock className="h-4 w-4" />
        });
      }
    }
    
    // Add any custom tasks
    return [...workflowTasks, ...customTasks];
  };

  const allTasks = getWorkflowTasks();
  const remainingTasks = allTasks.filter(task => !task.completed).length;

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: WorkflowTask = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        created_at: new Date().toISOString(),
        priority: 'medium'
      };
      setCustomTasks(prev => [...prev, newTask]);
      setNewTaskText('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    // For workflow tasks, we don't allow toggling - they should use the action
    if (taskId.startsWith('create-project') || taskId.startsWith('confirm-app-plan') || taskId.startsWith('wait-for-mvp')) {
      return;
    }
    
    // Only toggle custom tasks
    setCustomTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    // Only allow deleting custom tasks
    if (!taskId.startsWith('create-project') && !taskId.startsWith('confirm-app-plan') && !taskId.startsWith('wait-for-mvp')) {
      setCustomTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  if (loading) {
    return (
      <Card className={cn("bg-white/95 backdrop-blur-sm border-0 shadow-lg", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white/95 backdrop-blur-sm border-0 shadow-lg", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-700 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add Custom Task */}
        <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
          <Input
            type="text"
            placeholder="Add custom task"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-0 border-b border-gray-300 rounded-none bg-transparent placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-gray-600 text-sm"
          />
          <Button
            onClick={handleAddTask}
            size="sm"
            className="h-8 w-8 p-0 bg-gray-600 hover:bg-gray-700 rounded-full shrink-0"
            disabled={!newTaskText.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Workflow Tasks */}
        <div className="space-y-2">
          <AnimatePresence>
            {allTasks.slice(0, 3).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                  task.completed 
                    ? "bg-gray-50 border-gray-200" 
                    : getPriorityColor(task.priority)
                )}
              >
                <div className="flex items-center gap-2">
                  {task.icon && (
                    <div className="text-orange-500">
                      {task.icon}
                    </div>
                  )}
                  <Checkbox
                    id={task.id}
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-4 w-4"
                    disabled={task.id.startsWith('create-project') || task.id.startsWith('confirm-app-plan') || task.id.startsWith('wait-for-mvp')}
                  />
                </div>
                
                <div className="flex-1">
                  <label
                    htmlFor={task.id}
                    className={cn(
                      "text-sm font-medium cursor-pointer transition-all duration-200 select-none",
                      task.completed 
                        ? "text-gray-500 line-through" 
                        : "text-gray-800"
                    )}
                  >
                    {task.text}
                  </label>
                  {task.priority === 'high' && !task.completed && (
                    <div className="text-xs text-red-600 font-medium mt-1">High Priority</div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {task.action && task.actionText && !task.completed && (
                    <Button
                      onClick={task.action}
                      size="sm"
                      className="h-7 px-3 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                    >
                      {task.actionText}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                  
                  {!task.id.startsWith('create-project') && !task.id.startsWith('confirm-app-plan') && !task.id.startsWith('wait-for-mvp') && (
                    <Button
                      onClick={() => handleDeleteTask(task.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              {remainingTasks > 0 ? `${remainingTasks} tasks remaining` : '🎉 All tasks completed!'}
            </p>
            {allTasks.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/projects/tasks')}
                className="text-orange-500 hover:text-orange-600"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Motivational message */}
        <div className="pt-2">
          <p className="text-xs text-gray-500 italic leading-relaxed">
            "Success is the sum of small efforts repeated day in and day out." - Robert Collier
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 