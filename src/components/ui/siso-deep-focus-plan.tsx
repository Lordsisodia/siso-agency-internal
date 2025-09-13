"use client";

import React, { useState } from "react";
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
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TaskDetailModal } from "./task-detail-modal";
import { CustomCalendar } from "./CustomCalendar";
import { SubtaskItem } from "../tasks/SubtaskItem";

// Type definitions
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

// SISO IDE focused tasks
const sisoTasks: Task[] = [
  {
    id: "1",
    title: "Get the SISO IDE fully functioning",
    description: "Complete development and optimization of the SISO Internal IDE platform",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    focusIntensity: 3,
    context: "coding",
    subtasks: [
      {
        id: "1.1",
        title: "Fix console errors and ReferenceError issues",
        description: "Resolve JavaScript errors preventing proper IDE functionality",
        status: "in-progress",
        priority: "high",
        estimatedTime: "45min",
        tools: ["browser-devtools", "error-debugger", "code-assistant"],
        completed: false,
      },
      {
        id: "1.2",
        title: "Complete Prisma database integration testing",
        description: "Ensure all database operations work seamlessly with zero cold starts",
        status: "pending",
        priority: "high", 
        estimatedTime: "60min",
        tools: ["prisma-client", "database-tester", "performance-monitor"],
        completed: false,
      },
      {
        id: "1.3",
        title: "Optimize bundle size and loading performance",
        description: "Reduce application load times and improve overall performance",
        status: "pending",
        priority: "medium",
        estimatedTime: "90min",
        tools: ["webpack-analyzer", "performance-profiler", "code-splitter"],
        completed: false,
      },
      {
        id: "1.4",
        title: "Enhance mobile responsiveness",
        description: "Improve mobile UX and responsive design across all components",
        status: "pending",
        priority: "medium",
        estimatedTime: "75min",
        tools: ["responsive-tester", "mobile-debugger", "css-optimizer"],
        completed: false,
      },
      {
        id: "1.5",
        title: "Complete missing daily tracking features",
        description: "Implement all planned life management and tracking functionality",
        status: "pending",
        priority: "high",
        estimatedTime: "120min",
        tools: ["react-components", "state-manager", "ui-builder"],
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "Implement advanced flow state tracking",
    description: "Build sophisticated productivity and deep work monitoring system",
    status: "pending",
    priority: "high",
    level: 0,
    dependencies: [],
    focusIntensity: 4,
    context: "coding",
    subtasks: [
      {
        id: "2.1",
        title: "Build real-time focus quality metrics",
        description: "Create system to track and measure focus quality during work sessions",
        status: "pending",
        priority: "high",
        estimatedTime: "90min",
        tools: ["analytics-engine", "metrics-collector", "real-time-tracker"],
        completed: false,
      },
      {
        id: "2.2",
        title: "Implement context switching penalty calculations",
        description: "Develop algorithms to calculate productivity loss from task switching",
        status: "pending",
        priority: "medium",
        estimatedTime: "60min",
        tools: ["algorithm-designer", "calculation-engine", "data-processor"],
        completed: false,
      },
      {
        id: "2.3",
        title: "Create intelligent break suggestions",
        description: "Build AI system to suggest optimal break timing based on work patterns",
        status: "pending",
        priority: "medium",
        estimatedTime: "75min",
        tools: ["ai-assistant", "pattern-analyzer", "notification-system"],
        completed: false,
      },
    ],
  },
  {
    id: "3",
    title: "Enhance task management system",
    description: "Improve the clean, hierarchical task organization and tracking",
    status: "pending",
    priority: "medium",
    level: 1,
    dependencies: ["1"],
    focusIntensity: 2,
    context: "design",
    subtasks: [
      {
        id: "3.1",
        title: "Implement drag-and-drop task reordering",
        description: "Add intuitive drag-and-drop functionality for task organization",
        status: "pending",
        priority: "medium",
        estimatedTime: "45min",
        tools: ["dnd-library", "animation-engine", "gesture-handler"],
        completed: false,
      },
      {
        id: "3.2",
        title: "Add task dependency visualization",
        description: "Create visual representation of task dependencies and blockers",
        status: "pending",
        priority: "low",
        estimatedTime: "60min",
        tools: ["graph-visualizer", "dependency-mapper", "svg-renderer"],
        completed: false,
      },
      {
        id: "3.3",
        title: "Build task templates and quick actions",
        description: "Create reusable task templates and quick action shortcuts",
        status: "pending",
        priority: "low",
        estimatedTime: "30min",
        tools: ["template-engine", "shortcuts-manager", "quick-actions"],
        completed: false,
      },
    ],
  },
];

interface SisoDeepFocusPlanProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
}

export default function SisoDeepFocusPlan({ onStartFocusSession }: SisoDeepFocusPlanProps) {
  const [tasks, setTasks] = useState<Task[]>(sisoTasks);
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

  // Toggle task status
  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const statuses = ["completed", "in-progress", "pending", "need-help"];
          const currentIndex = statuses.indexOf(task.status);
          const newStatus = statuses[(currentIndex + 1) % statuses.length];

          const updatedSubtasks = task.subtasks.map((subtask) => ({
            ...subtask,
            status: newStatus === "completed" ? "completed" : subtask.status,
          }));

          return {
            ...task,
            status: newStatus,
            subtasks: updatedSubtasks,
          };
        }
        return task;
      }),
    );
  };

  // Toggle subtask status
  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((subtask) => {
            if (subtask.id === subtaskId) {
              const newStatus =
                subtask.status === "completed" ? "pending" : "completed";
              return { ...subtask, status: newStatus };
            }
            return subtask;
          });

          const allSubtasksCompleted = updatedSubtasks.every(
            (s) => s.status === "completed",
          );

          return {
            ...task,
            subtasks: updatedSubtasks,
            status: allSubtasksCompleted ? "completed" : task.status,
          };
        }
        return task;
      }),
    );
  };

  const startFocusSession = (taskId: string, subtaskId?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActiveFocusSession(subtaskId ? `${taskId}-${subtaskId}` : taskId);
      onStartFocusSession?.(taskId, task.focusIntensity || 2);
      
      // Update status to in-progress
      if (subtaskId) {
        toggleSubtaskStatus(taskId, subtaskId);
      } else {
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, status: 'in-progress' } : t
        ));
      }
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  // Update subtask due date
  const updateSubtaskDueDate = (taskId: string, subtaskId: string, dueDate: Date | null) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, dueDate: dueDate ? dueDate.toISOString() : undefined }
              : subtask
          )
        };
      }
      return task;
    }));
  };

  // Subtask editing handlers
  const handleSubtaskStartEditing = (subtaskId: string, currentTitle: string) => {
    setEditingSubtask(subtaskId);
    setEditSubtaskTitle(currentTitle);
  };

  const handleSubtaskEditTitleChange = (title: string) => {
    setEditSubtaskTitle(title);
  };

  const handleSubtaskSaveEdit = (taskId: string, subtaskId: string) => {
    if (editSubtaskTitle.trim()) {
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, title: editSubtaskTitle.trim() }
                : subtask
            )
          };
        }
        return task;
      }));
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

  const handleDeleteSubtask = (subtaskId: string) => {
    setTasks(prev => prev.map(task => ({
      ...task,
      subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
    })));
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
                      <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 pt-4 sm:pt-5">
                        <div className="flex items-center flex-1 min-w-0">
                        <motion.div
                          className="mr-3 flex-shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskStatus(task.id);
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

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-blue-100 font-semibold text-sm sm:text-base">
                              {task.title}
                            </h4>
                            {/* Toggle Button */}
                            <motion.button
                              className="flex-shrink-0 p-1 rounded-md hover:bg-blue-900/20 transition-colors"
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
                          
                          {/* Top separator line */}
                          <div className="border-t border-blue-600/50 mb-3"></div>
                          
                          {/* 5 Icons Row */}
                          <div className="px-2 py-1">
                            <div className="flex items-center justify-between">
                              <Brain className="h-4 w-4 text-blue-300 hover:text-blue-200 cursor-pointer transition-colors" />
                              <CheckCircle2 className="h-4 w-4 text-blue-300 hover:text-blue-200 cursor-pointer transition-colors" />
                              <Clock className="h-4 w-4 text-blue-300 hover:text-blue-200 cursor-pointer transition-colors" />
                              <CircleAlert 
                                className="h-4 w-4 text-blue-300 hover:text-blue-200 cursor-pointer transition-colors" 
                                onClick={() => openTaskDetail(task)}
                                title="Task Info"
                              />
                              <CircleX 
                                className="h-4 w-4 text-blue-300 hover:text-red-300 cursor-pointer transition-colors" 
                                onClick={() => {
                                  if (window.confirm('Delete this task?')) {
                                    // Add delete functionality here
                                    console.log('Delete task:', task.id);
                                  }
                                }}
                                title="Delete Task"
                              />
                            </div>
                          </div>
                          
                          {/* Bottom separator line */}
                          <div className="border-t border-blue-600/50 mt-3"></div>
                        </div>
                        </div>
                      </div>

                      {/* Subtasks */}
                    <AnimatePresence mode="wait">
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div 
                          className="relative overflow-hidden"
                          variants={subtaskListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                        >
                          <div className="absolute top-0 bottom-0 left-[22px] border-l-2 border-dashed border-gray-600/40" />
                          <ul className="mt-1 mr-2 mb-2 ml-4 space-y-1">
                            {task.subtasks.map((subtask) => {
                              return (
                                <motion.li
                                  key={subtask.id}
                                  className="pl-6"
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
                                      dueDate: subtask.dueDate
                                    }}
                                    taskId={task.id}
                                    themeConfig={themeConfig}
                                    isEditing={editingSubtask === subtask.id}
                                    editTitle={editSubtaskTitle}
                                    calendarSubtaskId={calendarSubtaskId}
                                    onToggleCompletion={toggleSubtaskStatus}
                                    onStartEditing={handleSubtaskStartEditing}
                                    onEditTitleChange={handleSubtaskEditTitleChange}
                                    onSaveEdit={handleSubtaskSaveEdit}
                                    onKeyDown={handleSubtaskKeyDown}
                                    onCalendarToggle={handleCalendarToggle}
                                    onDeleteSubtask={handleDeleteSubtask}
                                  >
                                    {/* Calendar popup */}
                                    {calendarSubtaskId === subtask.id && (
                                      <div className="calendar-popup absolute top-8 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3 min-w-[280px]">
                                        <CustomCalendar
                                          subtask={subtask}
                                          onDateSelect={(date) => {
                                            updateSubtaskDueDate(task.id, subtask.id, date);
                                            setCalendarSubtaskId(null);
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
                          
                          {/* Progress Summary */}
                          <div className="mt-4 pt-3 pl-6">
                            <TaskSeparator opacity="strong" spacing="normal" />
                            <div className="text-center">
                              <div className="text-xs text-gray-500">
                                {task.subtasks.filter(s => s.status === "completed").length} out of {task.subtasks.length} subtasks completed
                              </div>
                            </div>
                          </div>
                          
                          {/* Add Subtask Button - Below Progress Summary */}
                          <div className="px-6 pb-3 mt-3">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 transition-all duration-200 text-xs border border-blue-700/30 hover:border-blue-600/40"
                              onClick={() => {
                                // Add subtask functionality
                                console.log('Add subtask to task:', task.id);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Subtask
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                onClick={() => {
                  // Add task functionality
                  console.log('Add new task');
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