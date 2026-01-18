import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CustomTask {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime?: string;
}

interface CustomTaskInputProps {
  onAddTask: (task: CustomTask) => void;
  placeholder?: string;
  title?: string;
  description?: string;
  maxTasks?: number;
  className?: string;
}

export const CustomTaskInput: React.FC<CustomTaskInputProps> = ({
  onAddTask,
  placeholder = "What needs to be done today?",
  title = "Custom Tasks",
  description = "Add your own tasks and priorities",
  maxTasks = 5,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [addedTasks, setAddedTasks] = useState<CustomTask[]>([]);

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;

    const newTask: CustomTask = {
      id: `custom-${Date.now()}`,
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      priority,
      estimatedTime: estimatedTime.trim() || undefined
    };

    onAddTask(newTask);
    setAddedTasks(prev => [...prev, newTask]);
    
    // Reset form
    setTaskTitle('');
    setTaskDescription('');
    setPriority('medium');
    setEstimatedTime('');
    setIsExpanded(false);
  };

  const handleRemoveTask = (taskId: string) => {
    setAddedTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/40">
          {addedTasks.length}/{maxTasks}
        </Badge>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-300 mb-3">{description}</p>
      )}

      {/* Quick Add Button */}
      {!isExpanded && addedTasks.length < maxTasks && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Button
            variant="outline"
            className="w-full bg-gray-800/40 border-gray-600/50 text-gray-300 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-200 transition-all duration-300 py-6"
            onClick={() => setIsExpanded(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {placeholder}
          </Button>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-lg pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </motion.div>
      )}

      {/* Expanded Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 space-y-4"
          >
            {/* Task Title */}
            <div>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="bg-gray-900/50 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
              />
            </div>

            {/* Task Description */}
            <div>
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="bg-gray-900/50 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                rows={2}
              />
            </div>

            {/* Priority and Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Priority</label>
                <div className="flex space-x-1">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <Button
                      key={p}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'flex-1 text-xs transition-all duration-200',
                        priority === p
                          ? getPriorityColor(p) + ' border-opacity-100'
                          : 'bg-gray-800/40 border-gray-600/50 text-gray-400 hover:bg-gray-700/60'
                      )}
                      onClick={() => setPriority(p)}
                    >
                      {getPriorityIcon(p)} {p}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Est. Time</label>
                <Input
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="2h, 30m, etc."
                  className="bg-gray-900/50 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20 text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={handleAddTask}
                disabled={!taskTitle.trim()}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Target className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsExpanded(false);
                  setTaskTitle('');
                  setTaskDescription('');
                  setPriority('medium');
                  setEstimatedTime('');
                }}
                className="bg-gray-800/40 border-gray-600/50 text-gray-400 hover:bg-gray-700/60"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added Tasks List */}
      <AnimatePresence>
        {addedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-300">Recently Added</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddedTasks([])}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Clear all
              </Button>
            </div>
            {addedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-3 flex items-start justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="text-sm font-medium text-white truncate">{task.title}</h5>
                    <Badge className={cn("text-xs px-1.5 py-0.5", getPriorityColor(task.priority!))}>
                      {task.priority}
                    </Badge>
                    {task.estimatedTime && (
                      <span className="text-xs text-gray-500">• {task.estimatedTime}</span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-400 truncate">{task.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTask(task.id)}
                  className="ml-2 h-6 w-6 p-0 text-gray-500 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Max tasks reached notice */}
      {addedTasks.length >= maxTasks && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
        >
          <p className="text-sm text-amber-300">
            Maximum tasks reached ({maxTasks}). Remove some tasks to add more.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CustomTaskInput;