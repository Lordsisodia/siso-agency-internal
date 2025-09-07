import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

interface TaskManagerProps {
  title?: string;
  projectId?: string;
  showQuote?: boolean;
  className?: string;
  storageKey?: string; // For different task lists
}

const getDefaultTasks = (title: string): Task[] => {
  const baseId = Date.now();
  
  if (title.includes('Project')) {
    return [
      { id: `${baseId}1`, text: 'Review project requirements', completed: true, created_at: new Date().toISOString() },
      { id: `${baseId}2`, text: 'Set up development environment', completed: false, created_at: new Date().toISOString() },
      { id: `${baseId}3`, text: 'Create initial wireframes', completed: false, created_at: new Date().toISOString() }
    ];
  } else if (title.includes('Daily')) {
    return [
      { id: `${baseId}1`, text: 'Check emails and respond', completed: true, created_at: new Date().toISOString() },
      { id: `${baseId}2`, text: 'Review daily goals', completed: false, created_at: new Date().toISOString() },
      { id: `${baseId}3`, text: 'Update project status', completed: false, created_at: new Date().toISOString() }
    ];
  } else if (title.includes('Weekly')) {
    return [
      { id: `${baseId}1`, text: 'Weekly team meeting', completed: true, created_at: new Date().toISOString() },
      { id: `${baseId}2`, text: 'Review weekly progress', completed: false, created_at: new Date().toISOString() },
      { id: `${baseId}3`, text: 'Plan next week objectives', completed: false, created_at: new Date().toISOString() }
    ];
  } else {
    return [
      { id: `${baseId}1`, text: 'This is an example of task #1', completed: true, created_at: new Date().toISOString() },
      { id: `${baseId}2`, text: 'This is an example of task #2', completed: false, created_at: new Date().toISOString() },
      { id: `${baseId}3`, text: 'This is an example of task #3', completed: true, created_at: new Date().toISOString() },
      { id: `${baseId}4`, text: 'This is an example of task #4', completed: false, created_at: new Date().toISOString() },
      { id: `${baseId}5`, text: 'This is an example of task #5', completed: false, created_at: new Date().toISOString() }
    ];
  }
};

export function TaskManager({ 
  title = "Your To Do", 
  projectId, 
  showQuote = true,
  className,
  storageKey
}: TaskManagerProps) {
  // Create unique storage key based on title and storageKey
  const taskStorageKey = storageKey || `tasks-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Use localStorage for task persistence
  const [tasks, setTasks] = useLocalStorage<Task[]>(
    taskStorageKey,
    getDefaultTasks(title)
  );
  
  const [newTaskText, setNewTaskText] = useState('');

  const remainingTasks = tasks.filter(task => !task.completed).length;

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        created_at: new Date().toISOString()
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskText('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <Card className={cn("bg-white/95 backdrop-blur-sm border-0 shadow-lg", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-700">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add New Task */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <Input
            type="text"
            placeholder="Add new task"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-0 border-b-2 border-gray-300 rounded-none bg-transparent placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-gray-600 text-base"
          />
          <Button
            onClick={handleAddTask}
            size="sm"
            className="h-10 w-10 p-0 bg-gray-600 hover:bg-gray-700 rounded-full shrink-0"
            disabled={!newTaskText.trim()}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Task Grid - Horizontal Layout */}
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-full border-2 transition-all duration-200 hover:shadow-md",
                  task.completed 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-white border-gray-300 shadow-sm hover:border-gray-400"
                )}
              >
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task.id)}
                  className="data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 h-5 w-5"
                />
                
                <label
                  htmlFor={task.id}
                  className={cn(
                    "flex-1 text-base cursor-pointer transition-all duration-200 select-none",
                    task.completed 
                      ? "text-gray-500 line-through" 
                      : "text-gray-800"
                  )}
                >
                  {task.text}
                </label>
                
                <Button
                  onClick={() => handleDeleteTask(task.id)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Remaining Tasks Counter */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-base text-gray-600 font-medium italic">
            Your remaining todos: {remainingTasks}
          </p>
        </div>

        {/* Inspirational Quote */}
        {showQuote && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 italic leading-relaxed">
              "Doing what you love is the cornerstone of having abundance in your life." - Wayne Dyer
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 