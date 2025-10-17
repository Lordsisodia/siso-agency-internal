/**
 * 🚀 Quick Task Scheduler
 * 
 * Simple inline task list for easy "Add to Timebox" scheduling
 * Mobile-friendly with large buttons and auto-duration estimation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Zap,
  Target,
  Plus,
  ChevronRight,
  Coffee,
  BookOpen,
  X,
  AlertTriangle,
  CheckCircle,
  FolderOpen,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { format } from 'date-fns';
import { useDeepWorkTasksSupabase } from '@/ecosystem/internal/tasks/hooks/useDeepWorkTasksSupabase';
import { useLightWorkTasksSupabase } from '@/ecosystem/internal/tasks/hooks/useLightWorkTasksSupabase';

// Types for our scheduler
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  estimatedDuration?: number;
  subtasks?: Subtask[];
  category?: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  priority?: string;
  requiresFocus?: boolean;
  complexityLevel?: number;
}

interface TimeSlot {
  start: string;
  end: string;
  duration: number;
  label: string;
}

interface QuickTaskSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onScheduleTask: (task: Task | Subtask, timeSlot: TimeSlot, taskType: 'light' | 'deep') => void;
  onScheduleAndOpenTimer?: (task: Task | Subtask, taskType: 'light' | 'deep', estimatedDuration: number) => void;
}

const QuickTaskScheduler: React.FC<QuickTaskSchedulerProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onScheduleTask,
  onScheduleAndOpenTimer
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<'light' | 'deep'>('light');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [addingTasks, setAddingTasks] = useState<Set<string>>(new Set());

  // Use Supabase hooks directly
  const { 
    tasks: lightWorkTasks = [], 
    loading: lightLoading 
  } = useLightWorkTasksSupabase({ selectedDate });
  
  const { 
    tasks: deepWorkTasks = [], 
    loading: deepLoading 
  } = useDeepWorkTasksSupabase({ selectedDate });

  const loading = lightLoading || deepLoading;

  // Toggle subtasks expansion
  const toggleSubtasks = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Auto-estimate duration based on task type and complexity
  const estimateTaskDuration = (task: Task | Subtask, taskType: 'light' | 'deep'): number => {
    // Check if task has explicit duration
    if ('estimatedDuration' in task && task.estimatedDuration) {
      return task.estimatedDuration;
    }

    // Auto-estimate based on type and complexity
    if (taskType === 'deep') {
      if ('requiresFocus' in task && task.requiresFocus) {
        const complexity = 'complexityLevel' in task ? (task.complexityLevel || 3) : 3;
        return Math.max(60, complexity * 30); // 60-150 minutes based on complexity
      }
      return 90; // Default deep work: 1.5 hours
    } else {
      // Light work estimation
      const titleLength = task.title.length;
      const priority = ('priority' in task) ? task.priority : 'MEDIUM';
      
      let baseDuration = 30; // Default 30 minutes
      
      // Adjust based on title length (complexity indicator)
      if (titleLength > 50) baseDuration = 45;
      if (titleLength > 100) baseDuration = 60;
      
      // Adjust based on priority
      if (priority === 'HIGH' || priority === 'High') baseDuration += 15;
      if (priority === 'LOW' || priority === 'Low') baseDuration -= 10;
      
      return Math.max(15, baseDuration); // Minimum 15 minutes
    }
  };

  // Generate suggested time slot
  const generateTimeSlot = (task: Task | Subtask, taskType: 'light' | 'deep'): TimeSlot => {
    const now = new Date();
    const currentHour = now.getHours();
    const duration = estimateTaskDuration(task, taskType);
    
    // Smart time suggestions based on task type
    let suggestedHour = currentHour + 1;
    if (taskType === 'deep') {
      // Suggest morning hours for deep work (9-12) or afternoon (14-16)
      if (currentHour < 9) suggestedHour = 9;
      else if (currentHour >= 9 && currentHour < 12) suggestedHour = Math.max(currentHour + 1, 10);
      else if (currentHour >= 12 && currentHour < 14) suggestedHour = 14;
      else suggestedHour = Math.min(currentHour + 1, 16);
    } else {
      // Light work can be anytime, but avoid deep work hours
      suggestedHour = currentHour < 22 ? currentHour + 1 : 9;
    }

    const startTime = `${suggestedHour.toString().padStart(2, '0')}:00`;
    const endHour = suggestedHour + Math.floor(duration / 60);
    const endMin = duration % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    return {
      start: startTime,
      end: endTime,
      duration,
      label: `${startTime} - ${endTime} (${duration}min)`
    };
  };

  // Handle quick schedule with visual feedback
  const handleQuickSchedule = async (task: Task | Subtask, taskType: 'light' | 'deep') => {
    const taskId = task.id;
    setAddingTasks(prev => new Set([...prev, taskId]));

    try {
      const timeSlot = generateTimeSlot(task, taskType);
      await onScheduleTask(task, timeSlot, taskType);

      if (onScheduleAndOpenTimer) {
        const estimated = estimateTaskDuration(task, taskType);
        onScheduleAndOpenTimer(task, taskType, estimated);
      }

      // Success feedback
      setTimeout(() => {
        setAddingTasks(prev => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }, 1000);
    } catch (error) {
      // Error feedback
      setAddingTasks(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  // Enhanced priority component
  const PriorityIndicator = ({ priority }: { priority: string }) => {
    const config = {
      HIGH: { 
        icon: AlertTriangle, 
        color: 'text-red-400', 
        bg: 'bg-red-500/10', 
        border: 'border-red-500/30',
        label: 'HIGH'
      },
      MEDIUM: { 
        icon: Clock, 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/10', 
        border: 'border-amber-500/30',
        label: 'MED'
      },
      LOW: { 
        icon: CheckCircle, 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/30',
        label: 'LOW'
      }
    };

    const priorityKey = priority.toUpperCase() as keyof typeof config;
    const { icon: Icon, color, bg, border, label } = config[priorityKey] || config.MEDIUM;
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${color} ${border}`}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
    );
  };

  // Time estimation component
  const TimeEstimate = ({ task, taskType }: { task: Task | Subtask, taskType: 'light' | 'deep' }) => {
    const duration = estimateTaskDuration(task, taskType);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/30">
        <Clock className="h-3.5 w-3.5" />
        {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
      </div>
    );
  };

  // Transform Supabase tasks to match our UI format
  const transformedLightTasks = lightWorkTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    completed: task.completed,
    estimatedDuration: task.estimatedDuration,
    subtasks: task.subtasks || [],
    category: 'light-work'
  }));

  const transformedDeepTasks = deepWorkTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    completed: task.completed,
    estimatedDuration: task.estimatedDuration,
    subtasks: task.subtasks || [],
    category: 'deep-work'
  }));

  const currentTasks = activeTab === 'light' ? transformedLightTasks : transformedDeepTasks;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-slate-900/95 border border-slate-700/70 rounded-2xl shadow-2xl p-6 max-h-[75vh] overflow-hidden flex flex-col backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Add Tasks to Timebox</h3>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Enhanced Tabs */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6 border border-slate-700/50">
          <button
            onClick={() => setActiveTab('light')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'light'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Coffee className="h-4 w-4" />
              <span>Light Work</span>
              <Badge 
                variant={activeTab === 'light' ? 'secondary' : 'outline'} 
                className={`ml-2 ${activeTab === 'light' ? 'bg-blue-500/20 text-blue-100' : ''}`}
              >
                {transformedLightTasks.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('deep')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'deep'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Deep Work</span>
              <Badge 
                variant={activeTab === 'deep' ? 'secondary' : 'outline'} 
                className={`ml-2 ${activeTab === 'deep' ? 'bg-purple-500/20 text-purple-100' : ''}`}
              >
                {transformedDeepTasks.length}
              </Badge>
            </div>
          </button>
        </div>

        {/* Enhanced Task List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-lg">Loading tasks...</span>
            </div>
          ) : currentTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No tasks found</p>
              <p className="text-sm">Create some tasks to get started</p>
            </div>
          ) : (
            currentTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-slate-800/40 border border-slate-600/30 rounded-xl p-4 hover:bg-slate-800/60 hover:border-slate-500/50 transition-all duration-200"
              >
                {/* Main Task Header */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3">
                  <div className="flex-1 space-y-3">
                    {/* Title and Priority Row */}
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-medium text-white text-lg leading-tight flex-1">{task.title}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <PriorityIndicator priority={task.priority} />
                        <TimeEstimate task={task} taskType={activeTab} />
                      </div>
                    </div>

                    {/* Description (if exists) */}
                    {task.description && (
                      <p className="text-slate-400 text-sm leading-relaxed">{task.description}</p>
                    )}

                    {/* Subtasks Indicator */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSubtasks(task.id)}
                          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors py-1 px-2 rounded-md hover:bg-slate-700/30"
                        >
                          <FolderOpen className="h-4 w-4" />
                          <span>{task.subtasks.length} subtasks</span>
                          {expandedTasks.has(task.id) ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Add Button */}
                  <Button
                    onClick={() => handleQuickSchedule(task, activeTab)}
                    disabled={addingTasks.has(task.id)}
                    className={`w-full sm:w-auto px-4 py-3 min-h-[48px] touch-manipulation rounded-xl font-medium transition-all duration-200 ${
                      activeTab === 'light' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {addingTasks.has(task.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Add to Timebox</span>
                        <span className="sm:hidden">Add</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Expanded Subtasks */}
                <AnimatePresence>
                  {expandedTasks.has(task.id) && task.subtasks && task.subtasks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-3 border-t border-slate-600/30"
                    >
                      {task.subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center justify-between py-3 px-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors border border-slate-600/20"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-slate-300 font-medium">{subtask.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              {subtask.priority && <PriorityIndicator priority={subtask.priority} />}
                              <TimeEstimate task={subtask} taskType={activeTab} />
                            </div>
                          </div>
                          <Button
                            onClick={() => handleQuickSchedule(subtask, activeTab)}
                            disabled={addingTasks.has(subtask.id)}
                            variant="outline"
                            className="ml-3 px-4 py-2.5 min-h-[40px] min-w-[100px] bg-slate-600/50 hover:bg-slate-500 text-white border-slate-500 touch-manipulation rounded-lg"
                          >
                            {addingTasks.has(subtask.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                                Adding
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickTaskScheduler;