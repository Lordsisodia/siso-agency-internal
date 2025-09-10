import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
  Trash2,
  Plus
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import { TaskCardProps, LightWorkSubTask } from '../types';
import { TaskStatus } from '@/types/task.types';

/**
 * StatusIcon component for displaying task status
 */
const StatusIcon: React.FC<{ status: TaskStatus; size?: string }> = ({ 
  status, 
  size = "h-4 w-4" 
}) => {
  const iconMap = {
    'pending': <Circle className={cn(size, "text-gray-400")} />,
    'in-progress': <CircleDotDashed className={cn(size, "text-blue-400 animate-pulse")} />,
    'completed': <CheckCircle2 className={cn(size, "text-green-400")} />,
    'need-help': <CircleAlert className={cn(size, "text-yellow-400")} />,
    'failed': <CircleX className={cn(size, "text-red-400")} />
  };
  
  return iconMap[status] || iconMap.pending;
};

/**
 * Get status color classes for status badges
 */
const getStatusColor = (status: TaskStatus): string => {
  const colorMap = {
    'pending': 'bg-gray-600/30 text-gray-300 border border-gray-500/50',
    'in-progress': 'bg-blue-600/30 text-blue-300 border border-blue-500/50',
    'completed': 'bg-green-600/30 text-green-300 border border-green-500/50',
    'need-help': 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50',
    'failed': 'bg-red-600/30 text-red-300 border border-red-500/50'
  };
  
  return colorMap[status] || colorMap.pending;
};

/**
 * TaskCard component - Individual task display with subtasks
 * Extracted from enhanced-light-work-manager.tsx for reusability
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isExpanded,
  onToggleExpansion,
  onToggleStatus,
  onDeleteTask,
  onToggleSubtaskStatus,
  onDeleteSubtask,
  onAddSubtask,
  prefersReducedMotion
}) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const isCompleted = task.status === 'completed';

  // Animation variants
  const taskVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : 20,
      scale: prefersReducedMotion ? 1 : 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: "easeOut"
      }
    }
  };

  const subtaskListVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      y: prefersReducedMotion ? 0 : -10
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      y: 0,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: "easeOut"
      }
    }
  };

  const subtaskVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: prefersReducedMotion ? 0 : i * 0.05,
        duration: prefersReducedMotion ? 0 : 0.3
      }
    })
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle);
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  return (
    <motion.div
      className={cn(
        "group rounded-xl transition-all duration-300 hover:shadow-lg",
        isCompleted 
          ? "bg-green-900/5 border border-green-700/20 opacity-75 hover:opacity-90 hover:bg-green-900/10 hover:border-green-600/30 hover:shadow-green-500/10" 
          : "bg-green-900/10 border border-green-700/30 hover:bg-green-900/15 hover:border-green-600/40 hover:shadow-green-500/5"
      )}
      variants={taskVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {/* Main Task Header */}
      <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3">
        <motion.div
          className="mt-1 cursor-pointer"
          onClick={() => onToggleStatus(task.id)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <StatusIcon status={task.status} />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onToggleExpansion(task.id)}
            >
              <h4 className={cn(
                "text-green-100 font-semibold text-sm sm:text-base",
                isCompleted && "line-through text-green-300/70"
              )}>
                {task.title}
                {task.duration && (
                  <span className="ml-2 text-xs text-green-400">
                    ({task.duration} min)
                  </span>
                )}
              </h4>
              {task.description && (
                <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Subtask Progress */}
              {task.subTasks.length > 0 && (
                <div className="relative">
                  <div className="bg-gradient-to-r from-green-500/20 to-green-400/20 border border-green-400/40 rounded-full px-3 py-1.5 shadow-sm">
                    <span className="text-xs text-green-300 font-semibold tracking-wide">
                      {task.subTasks.filter(sub => sub.completed).length}/{task.subTasks.length}
                    </span>
                  </div>
                  {task.subTasks.filter(sub => sub.completed).length === task.subTasks.length && task.subTasks.length > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg">
                      <div className="absolute inset-0.5 bg-green-300 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Badge */}
              <motion.span
                className={`rounded px-1.5 py-0.5 text-xs ${getStatusColor(task.status)}`}
                key={task.status}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {task.status}
              </motion.span>
              
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Log Field */}
          {task.logField && (
            <div className="mt-2">
              <Input
                placeholder={task.logField}
                className="bg-green-900/20 border-green-700/50 text-green-100 text-sm placeholder:text-gray-400 focus:border-green-600"
              />
              <p className="text-xs text-gray-400 mt-1 italic">Track what you learned or researched today.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Subtasks */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="relative overflow-hidden"
            variants={subtaskListVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            layout
          >
            {/* Connecting line */}
            <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-green-500/30" />
            
            <div className="ml-8 mr-4 pb-4 space-y-2">
              {task.subTasks.map((subtask, index) => (
                <motion.div
                  key={subtask.id}
                  className="group flex items-center space-x-3 p-2 hover:bg-green-900/10 rounded-lg transition-all duration-200"
                  variants={subtaskVariants}
                  custom={index}
                  layout
                >
                  <motion.div
                    className="cursor-pointer"
                    onClick={() => onToggleSubtaskStatus(task.id, subtask.id)}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <StatusIcon status={subtask.status} size="h-3.5 w-3.5" />
                  </motion.div>
                  
                  <span className={cn(
                    "text-sm font-medium flex-1",
                    subtask.completed 
                      ? "text-gray-500 line-through" 
                      : "text-green-100/90"
                  )}>
                    {subtask.title}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSubtask(task.id, subtask.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
              
              {/* Add Subtask */}
              <div className="flex items-center space-x-3 p-2">
                {isAddingSubtask ? (
                  <div className="flex-1 flex space-x-2">
                    <Input
                      placeholder="New subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="bg-green-900/20 border-green-700/50 text-green-100 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSubtask();
                        if (e.key === 'Escape') {
                          setIsAddingSubtask(false);
                          setNewSubtaskTitle('');
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleAddSubtask}
                      className="bg-green-600 hover:bg-green-700 h-8"
                    >
                      Add
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingSubtask(true)}
                    className="text-green-400 hover:text-green-300 hover:bg-green-900/20 h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Subtask
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};