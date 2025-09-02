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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
}

const QuickTaskScheduler: React.FC<QuickTaskSchedulerProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onScheduleTask
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<'light' | 'deep'>('light');
  const [lightWorkTasks, setLightWorkTasks] = useState<Task[]>([]);
  const [deepWorkTasks, setDeepWorkTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch tasks when component opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        
        // Fetch Light Work tasks (show ALL incomplete tasks regardless of date)
        const lightResponse = await fetch(`http://localhost:3001/api/light-work/tasks?userId=user_31c4PuaPdFf9abejhmzrN9kcill&showAllIncomplete=true`);
        const lightData = await lightResponse.json();
        if (lightData.success) {
          setLightWorkTasks(lightData.data || []);
        }
        
        // Fetch Deep Work tasks (show ALL incomplete tasks regardless of date)
        const deepResponse = await fetch(`http://localhost:3001/api/deep-work/tasks?userId=user_31c4PuaPdFf9abejhmzrN9kcill&showAllIncomplete=true`);
        const deepData = await deepResponse.json();
        if (deepData.success) {
          setDeepWorkTasks(deepData.data || []);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isOpen, selectedDate]);

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

  // Handle quick schedule
  const handleQuickSchedule = (task: Task | Subtask, taskType: 'light' | 'deep') => {
    const timeSlot = generateTimeSlot(task, taskType);
    onScheduleTask(task, timeSlot, taskType);
  };

  // Get priority styling
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'High': return 'bg-red-500/20 text-red-300';
      case 'MEDIUM':
      case 'Med': return 'bg-yellow-500/20 text-yellow-300';
      case 'LOW':
      case 'Low': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const currentTasks = activeTab === 'light' ? lightWorkTasks : deepWorkTasks;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-gray-900/95 border border-gray-700 rounded-xl shadow-xl p-4 max-h-[70vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Add Tasks to Timebox</h3>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab('light')}
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'light'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Coffee className="h-4 w-4" />
              <span>Light Work</span>
              <Badge variant="outline" className="ml-1">{lightWorkTasks.length}</Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('deep')}
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'deep'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Deep Work</span>
              <Badge variant="outline" className="ml-1">{deepWorkTasks.length}</Badge>
            </div>
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading tasks...</span>
            </div>
          ) : currentTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tasks found</p>
            </div>
          ) : (
            currentTasks.map((task) => (
              <motion.div
                key={task.id}
                className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-3 hover:bg-gray-800 transition-colors"
              >
                {/* Main Task */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-gray-400">
                        ~{estimateTaskDuration(task, activeTab)}min
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleQuickSchedule(task, activeTab)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 ml-3 min-h-[44px] touch-manipulation"
                    size="lg"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Add to Timebox
                  </Button>
                </div>

                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="space-y-1 pl-2 border-l-2 border-gray-600/30">
                    {task.subtasks.slice(0, 3).map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center justify-between py-1 px-2 rounded bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-300 truncate">{subtask.title}</span>
                          <div className="flex items-center space-x-1 mt-0.5">
                            {subtask.priority && (
                              <Badge size="sm" className={getPriorityColor(subtask.priority)}>
                                {subtask.priority}
                              </Badge>
                            )}
                            <Badge size="sm" variant="outline" className="text-xs text-gray-400">
                              ~{estimateTaskDuration(subtask, activeTab)}min
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleQuickSchedule(subtask, activeTab)}
                          variant="outline"
                          className="text-sm px-4 py-2 ml-2 bg-gray-600 hover:bg-gray-500 text-white border-gray-500 min-h-[36px] touch-manipulation"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                    {task.subtasks.length > 3 && (
                      <p className="text-xs text-gray-500 px-2">+ {task.subtasks.length - 3} more subtasks</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickTaskScheduler;