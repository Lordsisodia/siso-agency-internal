"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Coffee,
  CheckCircle2,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';

import { Task, Subtask, TaskStatus } from '@/types/task.types';

// Enhanced interfaces - now using standardized types
interface LightWorkSubTask extends Subtask {
  completed?: boolean; // Computed from status for backward compatibility
}

interface LightWorkItem extends Omit<Task, 'category' | 'created_at'> {
  completed?: boolean; // Computed from status for backward compatibility
  duration?: number; // Duration in minutes
  logField?: string;
  subTasks: LightWorkSubTask[];
  category?: 'admin' | 'communication' | 'learning' | 'planning' | 'quick-wins';
}

// Default light work tasks with enhanced structure
const defaultLightWorkTasks: LightWorkItem[] = [
  { 
    id: '1', 
    title: 'Email & Communications', 
    description: 'Handle routine communications and administrative tasks.',
    status: 'pending',
    completed: false,
    duration: 30,
    category: 'communication',
    subTasks: [
      { id: '1a', title: 'Check and respond to priority emails', status: 'pending', completed: false },
      { id: '1b', title: 'Review messages and notifications', status: 'pending', completed: false },
      { id: '1c', title: 'Send follow-up communications', status: 'pending', completed: false }
    ]
  },
  { 
    id: '2', 
    title: 'Administrative Tasks',
    description: 'Complete necessary administrative and organizational work.',
    status: 'pending',
    completed: false,
    duration: 45,
    category: 'admin',
    subTasks: [
      { id: '2a', title: 'Update project status', status: 'pending', completed: false },
      { id: '2b', title: 'Review and organize files', status: 'pending', completed: false },
      { id: '2c', title: 'Schedule appointments/meetings', status: 'pending', completed: false },
      { id: '2d', title: 'Process invoices or payments', status: 'pending', completed: false }
    ]
  },
  { 
    id: '3', 
    title: 'Quick Wins',
    description: 'Small tasks that provide immediate value and momentum.',
    status: 'pending',
    completed: false,
    duration: 30,
    category: 'quick-wins',
    subTasks: [
      { id: '3a', title: 'Complete pending small tasks', status: 'pending', completed: false },
      { id: '3b', title: 'Make quick decisions on waiting items', status: 'pending', completed: false },
      { id: '3c', title: 'Update task lists and priorities', status: 'pending', completed: false }
    ]
  },
  { 
    id: '4', 
    title: 'Learning & Research',
    description: 'Light research, reading, or skill development activities.',
    status: 'pending',
    completed: false,
    duration: 30,
    category: 'learning',
    logField: 'Log learning topic: ____',
    subTasks: [
      { id: '4a', title: 'Read industry articles or news', status: 'pending', completed: false },
      { id: '4b', title: 'Watch educational content', status: 'pending', completed: false },
      { id: '4c', title: 'Take notes on key insights', status: 'pending', completed: false }
    ]
  },
  { 
    id: '5', 
    title: 'Planning & Review',
    description: 'Light planning and review activities for next work sessions.',
    status: 'pending',
    completed: false,
    duration: 20,
    category: 'planning',
    subTasks: [
      { id: '5a', title: 'Review today\'s progress', status: 'pending', completed: false },
      { id: '5b', title: 'Plan tomorrow\'s priorities', status: 'pending', completed: false },
      { id: '5c', title: 'Adjust weekly goals if needed', status: 'pending', completed: false }
    ]
  }
];

interface EnhancedLightWorkManagerProps {
  selectedDate: Date;
}

export const EnhancedLightWorkManager: React.FC<EnhancedLightWorkManagerProps> = ({
  selectedDate
}) => {
  const [lightWorkTasks, setLightWorkTasks] = useState<LightWorkItem[]>(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const saved = localStorage.getItem(`lifelock-${dateKey}-enhancedLightWorkTasks`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse enhanced light work data, using defaults');
        return defaultLightWorkTasks;
      }
    }
    return defaultLightWorkTasks;
  });

  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingTaskInline, setIsAddingTaskInline] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newInlineTaskTitle, setNewInlineTaskTitle] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Add support for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

  // Save to localStorage whenever tasks change
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`lifelock-${dateKey}-enhancedLightWorkTasks`, JSON.stringify(lightWorkTasks));
  }, [lightWorkTasks, selectedDate]);

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Toggle task status with enhanced status cycle
  const toggleTaskStatus = (taskId: string) => {
    setLightWorkTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const statuses: Array<'pending' | 'in-progress' | 'completed' | 'need-help' | 'failed'> = 
          ['pending', 'in-progress', 'completed', 'need-help', 'failed'];
        const currentIndex = statuses.indexOf(task.status);
        const newStatus = statuses[(currentIndex + 1) % statuses.length];
        
        // Update subtasks when main task is completed
        const updatedSubTasks = task.subTasks.map(sub => ({
          ...sub,
          status: newStatus === 'completed' ? 'completed' as const : sub.status,
          completed: newStatus === 'completed' ? true : sub.completed
        }));

        return {
          ...task,
          status: newStatus,
          completed: newStatus === 'completed',
          subTasks: updatedSubTasks
        };
      }
      return task;
    }));
  };

  // Toggle subtask status
  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    setLightWorkTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedSubTasks = task.subTasks.map(sub => {
          if (sub.id === subtaskId) {
            const newStatus = sub.status === 'completed' ? 'pending' as const : 'completed' as const;
            return { 
              ...sub, 
              status: newStatus,
              completed: newStatus === 'completed'
            };
          }
          return sub;
        });

        // Auto-complete main task if all subtasks are completed
        const allSubTasksCompleted = updatedSubTasks.every(sub => sub.status === 'completed');
        
        return {
          ...task,
          subTasks: updatedSubTasks,
          status: allSubTasksCompleted ? 'completed' : task.status,
          completed: allSubTasksCompleted
        };
      }
      return task;
    }));
  };

  // Add new task
  const addNewTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: LightWorkItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      status: 'pending',
      completed: false,
      duration: 30,
      category: 'quick-wins',
      subTasks: []
    };

    setLightWorkTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAddingTask(false);
  };

  // Add new task inline (like subtask functionality)
  const addNewTaskInline = () => {
    if (!newInlineTaskTitle.trim()) return;
    
    const newTask: LightWorkItem = {
      id: `task-${Date.now()}`,
      title: newInlineTaskTitle,
      status: 'pending',
      completed: false,
      duration: 30,
      category: 'quick-wins',
      subTasks: []
    };

    setLightWorkTasks(prev => [...prev, newTask]);
    setNewInlineTaskTitle('');
    setIsAddingTaskInline(false);
  };

  // Add new subtask
  const addNewSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: LightWorkSubTask = {
      id: `${taskId}-subtask-${Date.now()}`,
      title: newSubtaskTitle,
      status: 'pending',
      completed: false
    };

    setLightWorkTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, subTasks: [...task.subTasks, newSubtask] }
        : task
    ));

    setNewSubtaskTitle('');
    setIsAddingSubtask(null);
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setLightWorkTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Delete subtask
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setLightWorkTasks(prev => prev.map(task => 
      task.id === taskId
        ? { ...task, subTasks: task.subTasks.filter(sub => sub.id !== subtaskId) }
        : task
    ));
  };

  // Animation variants
  const taskVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : -5 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: prefersReducedMotion ? "tween" : "spring", 
        stiffness: 500, 
        damping: 30,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    }
  };

  const subtaskListVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      overflow: "hidden" 
    },
    visible: { 
      height: "auto", 
      opacity: 1,
      overflow: "visible",
      transition: { 
        duration: 0.25, 
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren"
      }
    }
  };

  const subtaskVariants = {
    hidden: { 
      opacity: 0, 
      x: prefersReducedMotion ? 0 : -10 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: prefersReducedMotion ? "tween" : "spring", 
        stiffness: 500, 
        damping: 25,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    }
  };

  // Status icon component
  const StatusIcon = ({ status, size = "h-4 w-4" }: { status: string, size?: string }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className={`${size} text-green-500`} />;
      case 'in-progress':
        return <CircleDotDashed className={`${size} text-blue-500`} />;
      case 'need-help':
        return <CircleAlert className={`${size} text-yellow-500`} />;
      case 'failed':
        return <CircleX className={`${size} text-red-500`} />;
      default:
        return <Circle className={`${size} text-muted-foreground`} />;
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'need-help': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Calculate total progress
  const getTotalProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    lightWorkTasks.forEach(task => {
      if (task.subTasks.length > 0) {
        totalTasks += task.subTasks.length;
        completedTasks += task.subTasks.filter(sub => sub.completed).length;
      } else {
        totalTasks += 1;
        if (task.completed) completedTasks += 1;
      }
    });
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  // Calculate XP progress
  const getXPProgress = () => {
    let totalXP = 0;
    let earnedXP = 0;
    
    lightWorkTasks.forEach(task => {
      // Main task XP (base points)
      const mainTaskXP = 10;
      totalXP += mainTaskXP;
      if (task.completed) earnedXP += mainTaskXP;
      
      // Subtask XP (smaller points per subtask)
      task.subTasks.forEach(subtask => {
        const subtaskXP = 5;
        totalXP += subtaskXP;
        if (subtask.completed) earnedXP += subtaskXP;
      });
    });
    
    return { earnedXP, totalXP, percentage: totalXP > 0 ? (earnedXP / totalXP) * 100 : 0 };
  };

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Enhanced Light Work Card */}
        <Card className="bg-green-900/20 border-green-700/50">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-green-400 text-base sm:text-lg">
                <Coffee className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                ☕ Enhanced Light Work Sessions
              </CardTitle>
              
              <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 animate-pulse hover:animate-none"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    ➕ Add New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-green-400">Add New Light Work Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Task title..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Textarea
                      placeholder="Task description (optional)..."
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={addNewTask}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Add Task
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsAddingTask(false);
                          setNewTaskTitle('');
                          setNewTaskDescription('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="border-t border-green-600/50 my-4"></div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-300">Progress</span>
                <span className="text-green-400">{Math.round(getTotalProgress())}%</span>
              </div>
              <div className="w-full bg-green-900/30 rounded-full h-2">
                <motion.div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getTotalProgress()}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${getTotalProgress()}%` }}
                />
              </div>
            </div>

            {/* XP Bar */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-green-300 flex items-center">
                  ⚡ XP Today
                </span>
                <span className="text-green-400 font-bold">
                  {getXPProgress().earnedXP} / {getXPProgress().totalXP} XP
                </span>
              </div>
              <div className="w-full bg-green-900/30 rounded-full h-3 border border-green-700/30">
                <motion.div 
                  className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                  style={{ width: `${getXPProgress().percentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${getXPProgress().percentage}%` }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-green-300/70">
                <span>Level 1</span>
                <span>{Math.round(getXPProgress().percentage)}% Complete</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6 pt-0">
            <LayoutGroup>
              <div className="space-y-2 sm:space-y-3">
                {/* Sort tasks: pending/in-progress/need-help/failed first, completed last */}
                {(() => {
                  const sortedTasks = [...lightWorkTasks].sort((a, b) => {
                    // Completed tasks go to bottom
                    if (a.status === 'completed' && b.status !== 'completed') return 1;
                    if (b.status === 'completed' && a.status !== 'completed') return -1;
                    return 0; // Keep original order for same status
                  });
                  
                  const activeTasks = sortedTasks.filter(task => task.status !== 'completed');
                  const completedTasks = sortedTasks.filter(task => task.status === 'completed');
                  
                  return (
                    <>
                      {/* Active Tasks */}
                      {activeTasks.map((task) => {
                  const isExpanded = expandedTasks.includes(task.id);
                  const isCompleted = task.status === 'completed';
                  
                  return (
                    <motion.div
                      key={task.id}
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
                          onClick={() => toggleTaskStatus(task.id)}
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <StatusIcon status={task.status} />
                        </motion.div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => toggleTaskExpansion(task.id)}
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
                                onClick={() => deleteTask(task.id)}
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
                              {task.subTasks.map((subtask) => (
                                <motion.div
                                  key={subtask.id}
                                  className="group flex items-center space-x-3 p-2 hover:bg-green-900/10 rounded-lg transition-all duration-200"
                                  variants={subtaskVariants}
                                  layout
                                >
                                  <motion.div
                                    className="cursor-pointer"
                                    onClick={() => toggleSubtaskStatus(task.id, subtask.id)}
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
                                    onClick={() => deleteSubtask(task.id, subtask.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </motion.div>
                              ))}
                              
                              {/* Add Subtask */}
                              <div className="flex items-center space-x-3 p-2">
                                {isAddingSubtask === task.id ? (
                                  <div className="flex-1 flex space-x-2">
                                    <Input
                                      placeholder="New subtask..."
                                      value={newSubtaskTitle}
                                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                      className="bg-green-900/20 border-green-700/50 text-green-100 text-sm"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') addNewSubtask(task.id);
                                        if (e.key === 'Escape') {
                                          setIsAddingSubtask(null);
                                          setNewSubtaskTitle('');
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => addNewSubtask(task.id)}
                                      className="bg-green-600 hover:bg-green-700 h-8"
                                    >
                                      Add
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAddingSubtask(task.id)}
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
                      })}
                      
                      {/* Completed Tasks Section */}
                      {completedTasks.length > 0 && (
                        <>
                          <motion.div 
                            className="flex items-center my-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="flex-1 border-t border-green-600/30"></div>
                            <div className="px-4 py-2 bg-green-900/20 border border-green-600/40 rounded-full">
                              <span className="text-green-300 text-sm font-semibold flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Completed ({completedTasks.length})
                              </span>
                            </div>
                            <div className="flex-1 border-t border-green-600/30"></div>
                          </motion.div>
                          
                          {completedTasks.map((task) => {
                            const isExpanded = expandedTasks.includes(task.id);
                            const isCompleted = task.status === 'completed';
                            
                            return (
                              <motion.div
                                key={task.id}
                                className={cn(
                                  "group rounded-xl transition-all duration-300 hover:shadow-lg",
                                  "bg-green-900/5 border border-green-700/20 opacity-75 hover:opacity-90 hover:bg-green-900/10 hover:border-green-600/30 hover:shadow-green-500/10"
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
                                    onClick={() => toggleTaskStatus(task.id)}
                                    whileTap={{ scale: 0.9 }}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <StatusIcon status={task.status} />
                                  </motion.div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div 
                                        className="flex-1 cursor-pointer"
                                        onClick={() => toggleTaskExpansion(task.id)}
                                      >
                                        <h4 className={cn(
                                          "text-green-100 font-semibold text-sm sm:text-base",
                                          "line-through text-green-300/70"
                                        )}>
                                          {task.title}
                                          {task.duration && (
                                            <span className="ml-2 text-xs text-green-400">
                                              ({task.duration} min)
                                            </span>
                                          )}
                                        </h4>
                                        {task.description && (
                                          <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed line-through">
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
                                          onClick={() => deleteTask(task.id)}
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
                                
                                {/* Subtasks for Completed Tasks */}
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
                                      <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-green-500/30" />
                                      
                                      <div className="ml-8 mr-4 pb-4 space-y-2">
                                        {task.subTasks.map((subtask) => (
                                          <motion.div
                                            key={subtask.id}
                                            className="group flex items-center space-x-3 p-2 hover:bg-green-900/10 rounded-lg transition-all duration-200"
                                            variants={subtaskVariants}
                                            layout
                                          >
                                            <motion.div
                                              className="cursor-pointer"
                                              onClick={() => toggleSubtaskStatus(task.id, subtask.id)}
                                              whileTap={{ scale: 0.9 }}
                                              whileHover={{ scale: 1.1 }}
                                            >
                                              <StatusIcon status={subtask.status} size="h-3.5 w-3.5" />
                                            </motion.div>
                                            
                                            <span className="text-sm font-medium flex-1 text-gray-500 line-through">
                                              {subtask.title}
                                            </span>
                                            
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deleteSubtask(task.id, subtask.id)}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </>
                      )}
                    </>
                  );
                })()}
                
                {/* Inline Add Task at Bottom */}
                <motion.div 
                  className="mt-6 pt-4 border-t border-green-600/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {isAddingTaskInline ? (
                    <div className="flex items-center space-x-3 p-3 bg-green-900/10 border border-green-700/30 rounded-xl">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <Circle className="h-3.5 w-3.5 text-green-400" />
                      </div>
                      <div className="flex-1 flex space-x-2">
                        <Input
                          placeholder="New task title..."
                          value={newInlineTaskTitle}
                          onChange={(e) => setNewInlineTaskTitle(e.target.value)}
                          className="bg-green-900/20 border-green-700/50 text-green-100 text-sm flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addNewTaskInline();
                            if (e.key === 'Escape') {
                              setIsAddingTaskInline(false);
                              setNewInlineTaskTitle('');
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={addNewTaskInline}
                          className="bg-green-600 hover:bg-green-700 h-8 px-3"
                        >
                          Add
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAddingTaskInline(false);
                            setNewInlineTaskTitle('');
                          }}
                          className="h-8 px-3 text-gray-400 hover:text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      className="flex items-center justify-center p-3 border-2 border-dashed border-green-600/40 rounded-xl hover:border-green-500/60 hover:bg-green-900/5 transition-all duration-200 cursor-pointer group"
                      onClick={() => setIsAddingTaskInline(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="h-4 w-4 mr-2 text-green-400 group-hover:text-green-300" />
                      <span className="text-green-400 group-hover:text-green-300 font-medium">
                        Add New Task
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </LayoutGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};