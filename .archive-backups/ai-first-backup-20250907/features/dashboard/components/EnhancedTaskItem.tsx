import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Flag, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  Archive
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar as CalendarComponent } from '@/ecosystem/internal/calendar/ui/calendar';

// Task types
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: 'overdue' | 'due-today' | 'upcoming' | 'in-progress' | 'blocked' | 'not-started' | 'started' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  category: 'development' | 'design' | 'marketing' | 'client' | 'admin';
  tags?: string[];
  estimatedHours?: number;
  subtasks?: Subtask[];
  progress?: number;
}

interface EnhancedTaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string) => void;
  onDateChange?: (taskId: string, date: Date | undefined) => void;
  showSubtasksOnHover?: boolean;
  isLast?: boolean;
}

export const EnhancedTaskItem: React.FC<EnhancedTaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onSubtaskToggle,
  onDateChange,
  showSubtasksOnHover = true,
  isLast = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [expandedSubtasks, setExpandedSubtasks] = useState(false);

  // Calculate progress based on subtasks
  const progress = task.subtasks 
    ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100
    : task.progress || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'due-today':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'blocked':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'medium':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      default:
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'development':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'design':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'marketing':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'client':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'admin':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (showSubtasksOnHover && !expandedSubtasks) {
          setTimeout(() => setExpandedSubtasks(false), 300);
        }
      }}
    >
      <div 
        className={cn(
          "relative transition-all duration-200 cursor-pointer p-4 rounded-lg border",
          isHovered && "bg-[#2a2a2a] border-white",
          !isHovered && "bg-[#252525] border-transparent",
          task.completed && "opacity-60"
        )}
        onClick={() => onEdit(task)}
      >
        {/* Main Task Content */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className="flex-shrink-0 mt-0.5"
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400 hover:text-gray-300" />
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title */}
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "text-sm font-medium leading-tight",
                task.completed ? "text-gray-500 line-through" : "text-white"
              )}>
                {task.title}
              </h3>
              
              {/* Status Badge */}
              {(task.status === 'overdue' || task.status === 'due-today') && (
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
              )}
            </div>

            {/* Meta Info Row */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-3">
                {/* Category */}
                <span className={`px-2 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
                  {task.category}
                </span>
                
                {/* Priority */}
                <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              
              {/* Due Date */}
              {task.dueDate && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>{task.dueDate}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={task.dueDate ? new Date(task.dueDate) : undefined}
                      onSelect={(date) => {
                        onDateChange?.(task.id, date);
                      }}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Progress Bar (if subtasks exist) */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {task.subtasks.filter(st => st.completed).length} of {task.subtasks.length} subtasks
                  </span>
                  <span className="text-xs font-medium text-orange-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subtasks Section */}
        <AnimatePresence>
          {task.subtasks && task.subtasks.length > 0 && (showSubtasksOnHover && isHovered) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-3"
            >
              <div className="border-t border-white/20 pt-3">
                <div className="space-y-2 ml-7">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 group/subtask"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSubtaskToggle?.(task.id, subtask.id);
                        }}
                        className="flex-shrink-0"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <Circle className="w-3 h-3 text-gray-500 hover:text-gray-400" />
                        )}
                      </button>
                      <span className={cn(
                        "text-xs text-gray-300 flex-1",
                        subtask.completed && "line-through text-gray-500"
                      )}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Spacing between cards */}
      {!isLast && (
        <div className="h-3"></div>
      )}
    </div>
  );
};