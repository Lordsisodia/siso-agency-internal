"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
  Timer,
  Play,
  Pause,
  Brain,
  Clock,
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { TaskSeparator } from "../tasks/TaskSeparator";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { SimpleFeedbackButton } from "../../ecosystem/internal/feedback/SimpleFeedbackButton";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TaskDetailModal } from "./task-detail-modal";
import { CustomCalendar } from "./CustomCalendar";
import { SubtaskItem } from "../tasks/SubtaskItem";
import { useDeepWorkTasksSupabase, DeepWorkTask, DeepWorkSubtask } from "@/shared/hooks/useDeepWorkTasksSupabase";

// Type definitions - keeping original UI types
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedTime?: string; // Deep focus time estimate
  tools?: string[]; // Optional array of MCP server tools
  completed: boolean; // Calendar functionality requires this
  dueDate?: string; // Calendar functionality - ISO date string
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
  focusIntensity?: 1 | 2 | 3 | 4;
  context?: string;
  dueDate?: string; // Calendar functionality - ISO date string
}

interface SisoDeepFocusPlanProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date; // Add selectedDate prop for the hook
}

// Transform Supabase data to match original UI format
function transformSupabaseToUITasks(deepWorkTasks: DeepWorkTask[]): Task[] {
  return deepWorkTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: task.priority.toLowerCase(),
    level: 0,
    dependencies: [],
    focusIntensity: (task.focusBlocks || 2) as 1 | 2 | 3 | 4,
    context: "coding",
    dueDate: task.createdAt,
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.text || subtask.title,
      status: subtask.completed ? "completed" : "pending",
      priority: subtask.priority || "medium",
      estimatedTime: "30min", // Default estimate
      tools: [], // Empty array for tools
      completed: subtask.completed,
      dueDate: subtask.dueDate
    }))
  }));
}

export default function SisoDeepFocusPlan({ onStartFocusSession, selectedDate = new Date() }: SisoDeepFocusPlanProps) {
  // Use the Supabase hook
  const { 
    tasks: deepWorkTasks, 
    loading, 
    error,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    createTask,
    addSubtask,
    deleteTask,
    deleteSubtask,
    updateSubtaskDueDate,
    updateSubtaskTitle,
    updateTaskTitle
  } = useDeepWorkTasksSupabase({ selectedDate });
  
  // Transform Supabase data to UI format
  const tasks = useMemo(() => transformSupabaseToUITasks(deepWorkTasks), [deepWorkTasks]);
  
  const [expandedTasks, setExpandedTasks] = useState<string[]>(["1", "2", "3"]); // Expand all by default
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeFocusSession, setActiveFocusSession] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calendar functionality states
  const [calendarSubtaskId, setCalendarSubtaskId] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  
  // Editing states for subtasks
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  
  // Editing states for main tasks
  const [editingMainTask, setEditingMainTask] = useState<string | null>(null);
  const [editMainTaskTitle, setEditMainTaskTitle] = useState('');
  
  // Adding new subtask states
  const [addingSubtaskToTask, setAddingSubtaskToTask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Theme configuration for SubtaskItem
  const themeConfig = {
    colors: {
      text: 'text-green-400',
      border: 'border-green-400',
      input: 'border-gray-600 focus:border-green-400',
      textSecondary: 'text-green-300'
    }
  };

  // Add support for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarSubtaskId && !(event.target as Element).closest('.calendar-popup')) {
        setCalendarSubtaskId(null);
      }
    };
    if (calendarSubtaskId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [calendarSubtaskId]);

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Toggle subtask expansion
  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle task status - use Supabase hook
  const handleToggleTaskStatus = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Optional: Show user feedback
    }
  };

  // Toggle subtask status - use Supabase hook
  const handleToggleSubtaskStatus = async (taskId: string, subtaskId: string) => {
    try {
      await toggleSubtaskCompletion(taskId, subtaskId);
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
      // Optional: Show user feedback
    }
  };

  const startFocusSession = async (taskId: string, subtaskId?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        setActiveFocusSession(subtaskId ? `${taskId}-${subtaskId}` : taskId);
        onStartFocusSession?.(taskId, task.focusIntensity || 2);
        
        // Update status to in-progress
        if (subtaskId) {
          await handleToggleSubtaskStatus(taskId, subtaskId);
        } else {
          await handleToggleTaskStatus(taskId);
        }
      } catch (error) {
        console.error('Error starting focus session:', error);
        // Reset focus session if there was an error
        setActiveFocusSession(null);
      }
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const updateTask = (updatedTask: Task) => {
    // This would need to be implemented with Supabase operations
    console.log('Update task:', updatedTask);
  };

  // Update subtask due date - use Supabase hook
  const handleUpdateSubtaskDueDate = async (taskId: string, subtaskId: string, dueDate: Date | null) => {
    try {
      await updateSubtaskDueDate(subtaskId, dueDate);
    } catch (error) {
      console.error('Error updating subtask due date:', error);
      // Don't close calendar if there's an error, let user try again
      return;
    }
  };

  // Subtask editing handlers
  const handleSubtaskStartEditing = (subtaskId: string, currentTitle: string) => {
    setEditingSubtask(subtaskId);
    setEditSubtaskTitle(currentTitle);
  };

  const handleSubtaskEditTitleChange = (title: string) => {
    setEditSubtaskTitle(title);
  };

  const handleSubtaskSaveEdit = async (taskId: string, subtaskId: string) => {
    if (editSubtaskTitle.trim()) {
      try {
        await updateSubtaskTitle(subtaskId, editSubtaskTitle.trim());
        console.log('✅ Subtask title updated successfully');
      } catch (error) {
        console.error('❌ Failed to update subtask title:', error);
      }
    }
    setEditingSubtask(null);
    setEditSubtaskTitle('');
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent, type: 'subtask', taskId: string, subtaskId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'subtask' && subtaskId) {
        handleSubtaskSaveEdit(taskId, subtaskId);
      }
    } else if (e.key === 'Escape') {
      setEditingSubtask(null);
      setEditSubtaskTitle('');
    }
  };

  const handleCalendarToggle = (subtaskId: string) => {
    setCalendarSubtaskId(prev => prev === subtaskId ? null : subtaskId);
  };

  // Main task editing handlers
  const handleMainTaskStartEditing = (taskId: string, currentTitle: string) => {
    setEditingMainTask(taskId);
    setEditMainTaskTitle(currentTitle);
  };

  const handleMainTaskEditTitleChange = (value: string) => {
    setEditMainTaskTitle(value);
  };

  const handleMainTaskSaveEdit = async (taskId: string) => {
    if (editMainTaskTitle.trim()) {
      try {
        const success = await updateTaskTitle(taskId, editMainTaskTitle.trim());
        if (success) {
          setEditingMainTask(null);
          setEditMainTaskTitle('');
        }
      } catch (error) {
        console.error('Error updating main task title:', error);
      }
    }
  };

  const handleMainTaskKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleMainTaskSaveEdit(taskId);
    } else if (e.key === 'Escape') {
      setEditingMainTask(null);
      setEditMainTaskTitle('');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await deleteSubtask(subtaskId);
  };

  // New subtask creation handlers
  const handleStartAddingSubtask = (taskId: string) => {
    setAddingSubtaskToTask(taskId);
    setNewSubtaskTitle('');
  };

  const handleNewSubtaskTitleChange = (title: string) => {
    setNewSubtaskTitle(title);
  };

  const handleSaveNewSubtask = async (taskId: string) => {
    if (newSubtaskTitle.trim()) {
      try {
        await addSubtask(taskId, newSubtaskTitle.trim());
        console.log('✅ New subtask created successfully');
      } catch (error) {
        console.error('❌ Failed to create new subtask:', error);
      }
    }
    setAddingSubtaskToTask(null);
    setNewSubtaskTitle('');
  };

  const handleNewSubtaskKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveNewSubtask(taskId);
    } else if (e.key === 'Escape') {
      setAddingSubtaskToTask(null);
      setNewSubtaskTitle('');
    }
  };

  // Animation variants with reduced motion support
  const taskVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: prefersReducedMotion ? "tween" : "spring", 
        stiffness: 500, 
        damping: 30,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    },
  };

  const subtaskListVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: { 
      height: "auto", 
      opacity: 1,
      overflow: "visible",
      transition: { 
        duration: 0.25, 
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren",
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    },
  };

  const subtaskVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: prefersReducedMotion ? "tween" : "spring", 
        stiffness: 500, 
        damping: 25,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    },
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-white h-full overflow-auto">
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-blue-300">Loading Deep Work tasks...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-white h-full overflow-auto">
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardContent className="p-6 text-center">
            <div className="text-red-400 mb-4">
              <CircleAlert className="h-8 w-8 mx-auto mb-2" />
              Error loading Deep Work tasks
            </div>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-white h-full overflow-auto">
      <Card className="bg-blue-900/20 border-blue-700/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-blue-400 text-base sm:text-lg">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            🧠 Deep Work Sessions
          </CardTitle>
          <div className="border-t border-blue-600/50 my-4"></div>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-blue-300 mb-2 text-sm sm:text-base">Flow State Protocol</h3>
              <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                Deep work sessions require sustained focus without interruption. These blocks are designed for your most 
                important, cognitively demanding work that creates maximum value.
              </p>
            </div>
            <div className="border-t border-blue-600/50 my-4"></div>
            <div>
              <h3 className="font-bold text-blue-300 mb-2 text-sm sm:text-base">Deep Work Rules</h3>
              <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
                <li>• No interruptions or task switching allowed.</li>
                <li>• Phone on airplane mode or Do Not Disturb.</li>
                <li>• Work in 2-4 hour focused blocks.</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-600/50 my-3 sm:my-4"></div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }
            }}
          >
            <LayoutGroup>
              <div className="overflow-hidden">
                <ul className="space-y-1 overflow-hidden">
              {tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === "completed";

                return (
                  <motion.li
                    key={task.id}
                    className={`${index !== 0 ? "mt-1 pt-2" : ""}`}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    {/* Task Container - Wraps entire task including subtasks */}
                    <div className="group bg-blue-900/10 border border-blue-700/30 rounded-xl hover:bg-blue-900/15 hover:border-blue-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                      {/* Task Header */}
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          {/* Checkbox */}
                          <motion.div
                            className="flex-shrink-0 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTaskStatus(task.id);
                            }}
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={task.status}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                              >
                                {task.status === "completed" ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                                ) : task.status === "in-progress" ? (
                                  <CircleDotDashed className="h-5 w-5 text-blue-400" />
                                ) : task.status === "need-help" ? (
                                  <CircleAlert className="h-5 w-5 text-yellow-400" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </motion.div>


                          {/* Title */}
                          <div className="flex-1 min-w-0">
                            {editingMainTask === task.id ? (
                              <input
                                type="text"
                                value={editMainTaskTitle}
                                onChange={(e) => handleMainTaskEditTitleChange(e.target.value)}
                                onKeyDown={(e) => handleMainTaskKeyDown(e, task.id)}
                                onBlur={() => handleMainTaskSaveEdit(task.id)}
                                className="w-full bg-blue-900/40 text-blue-100 font-semibold text-sm sm:text-base px-2 py-1 rounded border border-blue-600/50 focus:border-blue-400 focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <h4 
                                className="text-blue-100 font-semibold text-sm sm:text-base cursor-pointer hover:text-blue-50 transition-colors truncate"
                                onClick={() => handleMainTaskStartEditing(task.id, task.title)}
                              >
                                {task.title}
                              </h4>
                            )}
                          </div>
                          
                          {/* Toggle Button Only */}
                          <div className="flex items-center flex-shrink-0">
                            <motion.button
                              className="p-1 rounded-md hover:bg-blue-900/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpansion(task.id);
                              }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-blue-300" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-blue-300" />
                              )}
                            </motion.button>
                          </div>
                        </div>
                        
                        {/* Top divider below main task */}
                        <div className="border-t border-blue-600/50 mt-3"></div>
                      </div>

                      {/* Subtasks */}
                    <AnimatePresence mode="wait">
                      {isExpanded && (
                        <motion.div 
                          className="relative overflow-hidden"
                          variants={subtaskListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                        >

                          {task.subtasks.length > 0 && (
                            <ul className="mt-1 mr-2 mb-2 ml-2 space-y-1">
                              {task.subtasks.map((subtask) => {
                              return (
                                <motion.li
                                  key={subtask.id}
                                  className="pl-3"
                                  variants={subtaskVariants}
                                  initial="hidden"
                                  animate="visible"
                                  layout
                                >
                                  <SubtaskItem
                                    subtask={{
                                      id: subtask.id,
                                      title: subtask.title,
                                      completed: subtask.status === "completed",
                                      dueDate: subtask.dueDate,
                                      description: subtask.description,
                                      priority: subtask.priority,
                                      estimatedTime: subtask.estimatedTime,
                                      tools: subtask.tools
                                    }}
                                    taskId={task.id}
                                    themeConfig={themeConfig}
                                    isEditing={editingSubtask === subtask.id}
                                    editTitle={editSubtaskTitle}
                                    calendarSubtaskId={calendarSubtaskId}
                                    isExpanded={expandedSubtasks[`${task.id}-${subtask.id}`] || false}
                                    onToggleCompletion={handleToggleSubtaskStatus}
                                    onToggleExpansion={toggleSubtaskExpansion}
                                    onStartEditing={handleSubtaskStartEditing}
                                    onEditTitleChange={handleSubtaskEditTitleChange}
                                    onSaveEdit={handleSubtaskSaveEdit}
                                    onKeyDown={handleSubtaskKeyDown}
                                    onCalendarToggle={handleCalendarToggle}
                                    onDeleteSubtask={handleDeleteSubtask}
                                  >
                                    {/* Calendar popup */}
                                    {calendarSubtaskId === subtask.id && (
                                      <div className="calendar-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 min-w-[280px] max-w-[90vw] max-h-[90vh] overflow-auto">
                                        <CustomCalendar
                                          subtask={subtask}
                                          onDateSelect={async (date) => {
                                            try {
                                              await handleUpdateSubtaskDueDate(task.id, subtask.id, date);
                                              // Only close calendar if update was successful
                                              setCalendarSubtaskId(null);
                                            } catch (error) {
                                              console.error('Failed to update due date:', error);
                                              // Keep calendar open so user can try again
                                            }
                                          }}
                                          onClose={() => setCalendarSubtaskId(null)}
                                        />
                                      </div>
                                    )}
                                  </SubtaskItem>
                                </motion.li>
                                );
                              })}
                            </ul>
                          )}
                          
                          {/* Add Subtask Button - Above line, below last subtask */}
                          <div className="px-3 pb-2 mt-2">
                            {addingSubtaskToTask === task.id ? (
                              <input
                                type="text"
                                value={newSubtaskTitle}
                                onChange={(e) => handleNewSubtaskTitleChange(e.target.value)}
                                onKeyDown={(e) => handleNewSubtaskKeyDown(e, task.id)}
                                onBlur={() => handleSaveNewSubtask(task.id)}
                                placeholder="Enter subtask title..."
                                className="w-full bg-blue-900/40 text-blue-100 text-xs px-3 py-2 rounded border border-blue-600/50 focus:border-blue-400 focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 transition-all duration-200 text-xs border border-blue-700/30 hover:border-blue-600/40"
                                onClick={() => handleStartAddingSubtask(task.id)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Subtask
                              </Button>
                            )}
                          </div>
                          
                          {/* Bottom divider */}
                          <div className="border-t border-blue-600/50 mt-3"></div>
                          
                          {/* Progress Summary at bottom with action buttons */}
                          {task.subtasks.length > 0 && (
                            <div className="mt-3 pb-2 px-3">
                              <div className="flex items-center justify-between">
                                <CircleAlert 
                                  className="h-4 w-4 text-blue-300 hover:text-blue-200 cursor-pointer transition-colors" 
                                  onClick={() => openTaskDetail(task)}
                                  title="Task Info"
                                />
                                <div className="text-xs text-gray-400">
                                  {task.subtasks.filter(s => s.status === "completed").length} of {task.subtasks.length} subtasks completed
                                </div>
                                <CircleX 
                                  className="h-4 w-4 text-blue-300 hover:text-red-300 cursor-pointer transition-colors" 
                                  onClick={() => {
                                    if (window.confirm('Delete this task?')) {
                                      deleteTask(task.id);
                                    }
                                  }}
                                  title="Delete Task"
                                />
                              </div>
                            </div>
                          )}

                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Progress Summary when collapsed - Always visible when there are subtasks */}
                    {!isExpanded && task.subtasks.length > 0 && (
                      <div className="px-3 pb-3">
                        <div className="flex items-center justify-between">
                          <CircleAlert 
                            className="h-4 w-4 text-blue-300 hover:text-blue-200 cursor-pointer transition-colors" 
                            onClick={() => openTaskDetail(task)}
                            title="Task Info"
                          />
                          <div className="text-xs text-gray-400">
                            {task.subtasks.filter(s => s.status === "completed").length} of {task.subtasks.length} subtasks completed
                          </div>
                          <CircleX 
                            className="h-4 w-4 text-blue-300 hover:text-red-300 cursor-pointer transition-colors" 
                            onClick={() => {
                              if (window.confirm('Delete this task?')) {
                                deleteTask(task.id);
                              }
                            }}
                            title="Delete Task"
                          />
                        </div>
                      </div>
                    )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
            
            {/* Add Task Button */}
            <div className="mt-4 px-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 transition-all duration-200 text-sm border border-blue-700/30 hover:border-blue-600/40"
                onClick={async () => {
                  try {
                    // Create task with default title
                    const newTask = await createTask({ 
                      title: 'New Deep Work Task', 
                      priority: 'HIGH' 
                    });
                    
                    // If task creation was successful, immediately start editing
                    if (newTask) {
                      setTimeout(() => {
                        setEditingMainTask(newTask.id);
                        setEditMainTaskTitle(newTask.title);
                      }, 100); // Small delay to ensure UI updates
                    }
                  } catch (error) {
                    console.error('Error creating new task:', error);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

              </div>
            </LayoutGroup>
          </motion.div>
        </CardContent>
      </Card>

      {/* Feedback Button - Outside card on black background */}
      <div className="mt-4 flex justify-center">
        <SimpleFeedbackButton />
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={updateTask}
        onStartFocusSession={(taskId, subtaskId) => {
          setIsModalOpen(false);
          onStartFocusSession?.(taskId, tasks.find(t => t.id === taskId)?.focusIntensity || 2);
        }}
      />
    </div>
  );
}