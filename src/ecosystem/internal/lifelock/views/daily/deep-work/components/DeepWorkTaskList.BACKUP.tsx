import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Check,
  Clock,
  Target,
  X,
  Edit,
  Mic,
  MicOff,
  Eye,
  Calendar,
  Zap,
  Trash,
  Settings,
  ChevronDown,
  ChevronRight,
  Brain,
  CheckCircle2,
  Circle,
  CircleDotDashed,
  CircleAlert
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { format } from 'date-fns';
import { selectImplementation } from '@/migration/feature-flags';
import { theme } from '@/styles/theme';
import { LoadingState } from '@/shared/ui/loading-state';
import { ErrorState } from '@/shared/ui/error-state';
import {
  TaskActionButtons,
  TaskSeparator,
  TaskProgress,
  SubtaskMetadata,
  TaskHeader,
  SubtaskItem,
  AddSubtaskInput,
  CustomCalendar,
  TaskStatsGrid,
  WorkProtocolCard
} from '../../_shared/components';
import { SimpleFeedbackButton } from '@/internal/feedback/SimpleFeedbackButton';
import { TaskDetailModal } from '@/components/ui/task-detail-modal';
import { useTaskEditing } from '../hooks/useTaskEditing';
import { useThoughtDump } from '@/shared/hooks/useThoughtDump';
import { useTaskFiltering } from '../hooks/useTaskFiltering';
import { useTaskReordering } from '../hooks/useTaskReordering';
import { WORK_THEMES } from '@/config/work-themes';
import { sortSubtasksHybrid } from '../utils/subtaskSorting';


export type WorkType = keyof typeof WORK_THEMES;

interface UnifiedWorkSectionProps {
  workType: WorkType;
  selectedDate: Date;
  tasks: any[];
  loading: boolean;
  error: string | null;
  // Task management functions
  createTask: (taskData: any) => Promise<any>;
  toggleTaskCompletion: (taskId: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
  analyzeTaskWithAI: (taskId: string) => void;
  pushTaskToAnotherDay: (taskId: string, date: string) => Promise<void>;
  updateTaskTitle: (taskId: string, title: string) => Promise<void>;
  updateTaskPriority?: (taskId: string, priority: string) => Promise<void>;
  updateSubtaskPriority?: (subtaskId: string, priority: string) => Promise<void>;
  updateSubtaskEstimatedTime?: (subtaskId: string, estimatedTime: string) => Promise<void>;
  reorderTasks?: (tasks: any[]) => Promise<void>;
  // Optional features (for Light Work)
  showContextModal?: () => void;
  showStats?: boolean;
  statsData?: {
    timeRemaining?: string;
    avgXP?: number;
    expToEarn?: number;
  };
  // Due date update function
  updateSubtaskDueDate?: (subtaskId: string, dueDate: Date | null) => Promise<void>;
}

export const DeepWorkTaskList: React.FC<UnifiedWorkSectionProps> = ({
  workType,
  selectedDate,
  tasks,
  loading,
  error,
  createTask,
  toggleTaskCompletion,
  toggleSubtaskCompletion,
  addSubtask,
  deleteTask,
  deleteSubtask,
  analyzeTaskWithAI,
  pushTaskToAnotherDay,
  updateTaskTitle,
  updateTaskPriority,
  updateSubtaskPriority,
  updateSubtaskEstimatedTime,
  reorderTasks,
  showContextModal,
  showStats = false,
  statsData,
  updateSubtaskDueDate
}) => {
  // Debug: Log workType
  console.log('🔧 UnifiedWorkSection workType:', workType);
  
  // Task editing hook
  const {
    editingTaskId,
    editTaskTitle,
    setEditTaskTitle,
    editingSubtaskId,
    editSubtaskTitle,
    setEditSubtaskTitle,
    addingSubtaskToId,
    newSubtaskTitle,
    setNewSubtaskTitle,

    viewingTaskId,
    setViewingTaskId,
    calendarSubtaskId,
    setCalendarSubtaskId,
    startEditingTask,
    saveTaskEdit,
    startEditingSubtask,
    saveSubtaskEdit,
    startAddingSubtask,
    saveNewSubtask,
    cancelAddingSubtask,
    handleDeleteTask,
    handlePushToAnotherDay,
    cancelEdit,
    handleKeyDown
  } = useTaskEditing({
    addSubtask,
    updateTaskTitle,
    deleteTask,
    pushTaskToAnotherDay,
    selectedDate
  });

  // Thought dump hook
  const { recordingTaskId, startThoughtDump } = useThoughtDump();

  // Task filtering hook
  const { filteredAndSortedTasks } = useTaskFiltering({ tasks, workType });
  
  // Task reordering hook
  const {
    isDragging,
    draggedId,
    handleDragStart,
    handleDragEnd,
    getDropZoneProps
  } = useTaskReordering(
    filteredAndSortedTasks,
    (reorderedTasks) => {
      // Update local state immediately for smooth UX
      // The parent component will handle persistence
      reorderTasks?.(reorderedTasks);
    },
    (taskId, newIndex) => {
      console.log(`Task ${taskId} moved to position ${newIndex}`);
    }
  );
  
  // Subtask priority handler
  const handleSubtaskPriorityChange = async (subtaskId: string, priority: string) => {
    if (updateSubtaskPriority) {
      try {
        await updateSubtaskPriority(subtaskId, priority);
        console.log(`✅ Updated subtask ${subtaskId} priority to ${priority}`);
      } catch (error) {
        console.error(`❌ Failed to update subtask ${subtaskId} priority:`, error);
      }
    } else {
      console.warn('⚠️ updateSubtaskPriority function not available');
    }
  };

  // Subtask estimated time handler
  const handleSubtaskEstimatedTimeChange = async (subtaskId: string, estimatedTime: string) => {
    if (updateSubtaskEstimatedTime) {
      try {
        await updateSubtaskEstimatedTime(subtaskId, estimatedTime);
        console.log(`✅ Updated subtask ${subtaskId} estimated time to ${estimatedTime}`);
      } catch (error) {
        console.error(`❌ Failed to update subtask ${subtaskId} estimated time:`, error);
      }
    } else {
      console.warn('⚠️ updateSubtaskEstimatedTime function not available');
    }
  };

  // Calendar loading state
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Task expansion state (from SisoDeepFocusPlan)
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]); // Start collapsed, expand on click

  // Subtask expansion state (from SisoDeepFocusPlan)
  const [expandedSubtasks, setExpandedSubtasks] = useState<{[key: string]: boolean}>({});

  // Focus session state (from SisoDeepFocusPlan)
  const [activeFocusSession, setActiveFocusSession] = useState<string | null>(null);

  // Task detail modal state (from SisoDeepFocusPlan)
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subtask visibility toggle state (from SisoDeepFocusPlan)
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState<{[taskId: string]: boolean}>({});

  // Add support for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Get theme configuration
  const themeConfig = WORK_THEMES[workType];
  const IconComponent = themeConfig.icon;

  // Set body background to dark theme (ensures consistent background across entire page)
  useEffect(() => {
    document.body.className = 'bg-gray-900 min-h-screen';
    document.documentElement.className = 'bg-gray-900';
    
    // Cleanup on unmount
    return () => {
      document.body.className = '';
      document.documentElement.className = '';
    };
  }, [workType]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarSubtaskId && !(event.target as Element).closest('.calendar-popup')) {
        setCalendarSubtaskId(null);
      }
    };

    if (calendarSubtaskId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [calendarSubtaskId, setCalendarSubtaskId]);

  // Toggle task expansion (from SisoDeepFocusPlan)
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Toggle subtask expansion (from SisoDeepFocusPlan)
  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Start focus session (from SisoDeepFocusPlan)
  const startFocusSession = async (taskId: string, subtaskId?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        setActiveFocusSession(subtaskId ? `${taskId}-${subtaskId}` : taskId);

        // Update status to in-progress
        if (subtaskId) {
          await toggleSubtaskCompletion(taskId, subtaskId);
        } else {
          await toggleTaskCompletion(taskId);
        }
      } catch (error) {
        console.error('Error starting focus session:', error);
        setActiveFocusSession(null);
      }
    }
  };

  // Open task detail modal (from SisoDeepFocusPlan)
  const openTaskDetail = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Update task (from SisoDeepFocusPlan)
  const updateTask = (updatedTask: any) => {
    // This would need to be implemented with Supabase operations
    console.log('Update task:', updatedTask);
  };

  // Toggle subtask visibility (from SisoDeepFocusPlan)
  const toggleSubtaskVisibility = (taskId: string) => {
    setShowCompletedSubtasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Animation variants with reduced motion support (from SisoDeepFocusPlan)
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

  if (loading) {
    return selectImplementation(
      'useUnifiedLoadingState',
      <LoadingState 
        message={`Loading ${workType.toLowerCase()} work tasks...`}
        variant="spinner"
        size="lg"
        className="min-h-screen w-full"
      />,
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className={themeConfig.colors.text}>Loading {workType.toLowerCase()} work tasks...</div>
      </div>
    );
  }

  if (error) {
    return selectImplementation(
      'useUnifiedErrorState',
      <ErrorState 
        title="Error Loading Tasks"
        message={`Could not load ${workType.toLowerCase()} work tasks: ${error}`}
        type="network"
        className="min-h-screen w-full"
      />,
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-red-400">Error loading tasks: {error}</div>
      </div>
    );
  }

  return (
    <div className={`${workType === 'DEEP' ? "text-blue-50" : "text-emerald-50"} h-full`}>
      <Card className={`${workType === 'DEEP' ? "bg-blue-900/20 border-blue-700/50" : "bg-emerald-900/20 border-emerald-700/50"}`}>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className={`flex items-center ${workType === 'DEEP' ? "text-blue-400" : "text-emerald-400"} text-base sm:text-lg`}>
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {workType === 'DEEP' ? '🧠 Deep Work Sessions' : '🌱 Light Work Tasks'}
          </CardTitle>
          <div className={`border-t ${workType === 'DEEP' ? "border-blue-600/50" : "border-emerald-600/50"} my-4`}></div>
          <div className="space-y-4">
            <div>
              <h3 className={`font-bold ${workType === 'DEEP' ? "text-blue-300" : "text-emerald-300"} mb-2 text-sm sm:text-base`}>
                {themeConfig.protocol.title}
              </h3>
              <p className={`${workType === 'DEEP' ? "text-blue-200" : "text-emerald-200"} text-xs sm:text-sm leading-relaxed`}>
                {themeConfig.protocol.description}
              </p>
            </div>
            <div className={`border-t ${workType === 'DEEP' ? "border-blue-600/50" : "border-emerald-600/50"} my-4`}></div>
            <div>
              <h3 className={`font-bold ${workType === 'DEEP' ? "text-blue-300" : "text-emerald-300"} mb-2 text-sm sm:text-base`}>
                {themeConfig.rules.title}
              </h3>
              <ul className={`${workType === 'DEEP' ? "text-blue-200" : "text-emerald-200"} text-xs sm:text-sm space-y-1`}>
                {themeConfig.rules.items.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className={`border-t ${workType === 'DEEP' ? "border-blue-600/50" : "border-emerald-600/50"} my-3 sm:my-4`}></div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            
            <div className="pt-4">
            {/* Task Blocks - EXACT SisoDeepFocusPlan structure */}
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
                  {filteredAndSortedTasks.map((task, index) => {
                    const isExpanded = expandedTasks.includes(task.id);
                    const isCompleted = task.status === "completed" || task.completed;

                    return (
                      <motion.li
                        key={task.id}
                        className={`${index !== 0 ? "mt-1 pt-2" : ""}`}
                        initial="hidden"
                        animate="visible"
                        variants={taskVariants}
                      >
                        {/* Task Container - Wraps entire task including subtasks */}
                        <div className={`group ${workType === 'DEEP' ? "bg-blue-900/10 border-blue-700/30 hover:bg-blue-900/15 hover:border-blue-600/40 hover:shadow-blue-500/5" : "bg-emerald-900/10 border-emerald-700/30 hover:bg-emerald-900/15 hover:border-emerald-600/40 hover:shadow-emerald-500/5"} rounded-xl transition-all duration-300 hover:shadow-lg`}>
                          {/* Task Header */}
                          <div className="p-3 sm:p-4">
                            <div className="flex items-center gap-3">
                              {/* Checkbox */}
                              <motion.div
                                className="flex-shrink-0 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskCompletion(task.id);
                                }}
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.1 }}
                              >
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={task.status || (task.completed ? "completed" : "pending")}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    ) : task.status === "in-progress" ? (
                                      <CircleDotDashed className={`h-5 w-5 ${workType === 'DEEP' ? "text-blue-400" : "text-emerald-400"}`} />
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
                                {editingTaskId === task.id ? (
                                  <input
                                    type="text"
                                    value={editTaskTitle}
                                    onChange={(e) => setEditTaskTitle(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, 'task', task.id)}
                                    onBlur={() => saveTaskEdit(task.id)}
                                    className={`w-full ${workType === 'DEEP' ? "bg-blue-900/40 text-blue-100 border-blue-600/50 focus:border-blue-400" : "bg-emerald-900/40 text-emerald-100 border-emerald-600/50 focus:border-emerald-400"} font-semibold text-sm sm:text-base px-2 py-1 rounded border focus:outline-none`}
                                    autoFocus
                                  />
                                ) : (
                                  <h4
                                    className={`${workType === 'DEEP' ? "text-blue-100 hover:text-blue-50" : "text-emerald-100 hover:text-emerald-50"} font-semibold text-sm sm:text-base cursor-pointer transition-colors truncate`}
                                    onClick={() => startEditingTask(task.id, task.title)}
                                  >
                                    {task.title}
                                  </h4>
                                )}
                              </div>

                              {/* Toggle Button Only */}
                              <div className="flex items-center flex-shrink-0">
                                <motion.button
                                  className={`p-1 rounded-md ${workType === 'DEEP' ? "hover:bg-blue-900/20" : "hover:bg-emerald-900/20"} transition-colors`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskExpansion(task.id);
                                  }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className={`h-4 w-4 ${workType === 'DEEP' ? "text-blue-300" : "text-emerald-300"}`} />
                                  ) : (
                                    <ChevronRight className={`h-4 w-4 ${workType === 'DEEP' ? "text-blue-300" : "text-emerald-300"}`} />
                                  )}
                                </motion.button>
                              </div>
                            </div>

                            {/* Top divider below main task */}
                            <div className={`border-t ${workType === 'DEEP' ? "border-blue-600/50" : "border-emerald-600/50"} mt-3`}></div>
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

                              {task.subtasks && task.subtasks.length > 0 && (
                                <ul className="mt-1 mr-2 mb-2 ml-2 space-y-1">
                                  {sortSubtasksHybrid(task.subtasks.filter((subtask) => {
                                    // Show incomplete subtasks by default, toggle to show completed when clicked
                                    const shouldShowCompleted = showCompletedSubtasks[task.id];
                                    if (shouldShowCompleted === undefined) return subtask.status !== "completed" && !subtask.completed;
                                    return shouldShowCompleted ? (subtask.status === "completed" || subtask.completed) : (subtask.status !== "completed" && !subtask.completed);
                                  })).map((subtask) => {
                                  return (
                                    <motion.li
                                      key={subtask.id}
                                      className="pl-1"
                                      variants={subtaskVariants}
                                      initial="hidden"
                                      animate="visible"
                                      layout
                                    >
                                      <SubtaskItem
                                        subtask={{
                                          id: subtask.id,
                                          title: subtask.title,
                                          completed: subtask.status === "completed" || subtask.completed,
                                          dueDate: subtask.dueDate,
                                          description: subtask.description,
                                          priority: subtask.priority,
                                          estimatedTime: subtask.estimatedTime,
                                          tools: subtask.tools
                                        }}
                                        taskId={task.id}
                                        themeConfig={themeConfig}
                                        isEditing={editingSubtaskId === subtask.id}
                                        editTitle={editSubtaskTitle}
                                        calendarSubtaskId={calendarSubtaskId}
                                        isExpanded={expandedSubtasks[`${task.id}-${subtask.id}`] || false}
                                        onToggleCompletion={toggleSubtaskCompletion}
                                        onToggleExpansion={toggleSubtaskExpansion}
                                        onStartEditing={startEditingSubtask}
                                        onEditTitleChange={setEditSubtaskTitle}
                                        onSaveEdit={saveSubtaskEdit}
                                        onKeyDown={handleKeyDown}
                                        onCalendarToggle={setCalendarSubtaskId}
                                        onDeleteSubtask={deleteSubtask}
                                        onPriorityUpdate={handleSubtaskPriorityChange}
                                        onEstimatedTimeUpdate={handleSubtaskEstimatedTimeChange}
                                      >
                                        {/* Calendar popup */}
                                        {calendarSubtaskId === subtask.id && (
                                          <div className="calendar-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 min-w-[280px] max-w-[90vw] max-h-[90vh] overflow-auto">
                                            <CustomCalendar
                                              theme={workType}
                                              subtask={subtask}
                                              onDateSelect={async (date) => {
                                                try {
                                                  if (updateSubtaskDueDate) {
                                                    await updateSubtaskDueDate(subtask.id, date);
                                                  }
                                                  setCalendarSubtaskId(null);
                                                } catch (error) {
                                                  console.error('Failed to update due date:', error);
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
                              {addingSubtaskToId === task.id ? (
                                <input
                                  type="text"
                                  value={newSubtaskTitle}
                                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, 'subtask-add', task.id)}
                                  onBlur={() => saveNewSubtask(task.id)}
                                  placeholder="Enter subtask title..."
                                  className={`w-full ${workType === 'DEEP' ? "bg-blue-900/40 text-blue-100 border-blue-600/50 focus:border-blue-400" : "bg-emerald-900/40 text-emerald-100 border-emerald-600/50 focus:border-emerald-400"} text-xs px-3 py-2 rounded border focus:outline-none`}
                                  autoFocus
                                />
                              ) : (
                                <button
                                  className={`w-full ${workType === 'DEEP' ? "text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 border-blue-700/30 hover:border-blue-600/40" : "text-emerald-300 hover:text-emerald-200 hover:bg-emerald-900/20 border-emerald-700/30 hover:border-emerald-600/40"} transition-all duration-200 text-xs border rounded-lg px-3 py-2 flex items-center justify-center gap-1`}
                                  onClick={() => startAddingSubtask(task.id)}
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Subtask
                                </button>
                              )}
                            </div>

                            {/* Bottom divider */}
                            <div className={`border-t ${workType === 'DEEP' ? "border-blue-600/50" : "border-emerald-600/50"} mt-3`}></div>

                            {/* Progress Summary at bottom with action buttons - Always show */}
                            <div className="mt-3 pb-2 px-3">
                              <div className="flex items-center justify-between">
                                <div></div>
                                <button
                                  className={`text-xs ${workType === 'DEEP' ? "text-blue-400 hover:text-blue-300" : "text-emerald-400 hover:text-emerald-300"} cursor-pointer transition-colors`}
                                  onClick={() => toggleSubtaskVisibility(task.id)}
                                  title="Toggle completed subtasks visibility"
                                >
                                  {task.subtasks?.filter((s: any) => s.status === "completed" || s.completed).length || 0} of {task.subtasks?.length || 0} subtasks completed
                                </button>
                                <button
                                  className="text-gray-400 hover:text-red-400 cursor-pointer transition-colors text-lg font-bold leading-none"
                                  onClick={() => deleteTask(task.id)}
                                  title="Delete Task"
                                >
                                  ×
                                </button>
                              </div>
                            </div>

                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Progress Summary when collapsed - Always visible */}
                      {!isExpanded && (
                        <div className="px-3 pb-3">
                          <div className="flex items-center justify-between">
                            <div></div>
                            <button
                              className={`text-xs ${workType === 'DEEP' ? "text-blue-400 hover:text-blue-300" : "text-emerald-400 hover:text-emerald-300"} cursor-pointer transition-colors`}
                              onClick={() => toggleSubtaskVisibility(task.id)}
                              title="Toggle completed subtasks visibility"
                            >
                              {task.subtasks?.filter((s: any) => s.status === "completed" || s.completed).length || 0} of {task.subtasks?.length || 0} subtasks completed
                            </button>
                            <button
                              className="text-gray-400 hover:text-red-400 cursor-pointer transition-colors text-lg font-bold leading-none"
                              onClick={() => deleteTask(task.id)}
                              title="Delete Task"
                            >
                              ×
                            </button>
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
                <button
                  className={`w-full ${workType === 'DEEP' ? "text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 border-blue-700/30 hover:border-blue-600/40" : "text-emerald-300 hover:text-emerald-200 hover:bg-emerald-900/20 border-emerald-700/30 hover:border-emerald-600/40"} transition-all duration-200 text-sm border rounded-lg px-4 py-2 flex items-center justify-center gap-2`}
                  onClick={async () => {
                    try {
                      const taskTitle = workType === 'DEEP' ? 'New Deep Work Task' : 'New Light Work Task';
                      const newTask = await createTask({
                        title: taskTitle,
                        priority: 'HIGH'
                      });

                      // If task creation was successful, immediately start editing
                      if (newTask) {
                        setTimeout(() => {
                          startEditingTask(newTask.id, newTask.title);
                        }, 100);
                      }
                    } catch (error) {
                      console.error('Error creating new task:', error);
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              </div>

                </div>
              </LayoutGroup>
            </motion.div>
            </div>

          </CardContent>
        </Card>

        {/* Feedback Button - Bar below card (from SisoDeepFocusPlan) */}
        <div className="mt-4">
          <SimpleFeedbackButton variant="bar" className="w-full" />
        </div>

        {/* Task Detail Modal (from SisoDeepFocusPlan) */}
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
            startFocusSession(taskId, subtaskId);
          }}
        />
      </div>
  );
};
