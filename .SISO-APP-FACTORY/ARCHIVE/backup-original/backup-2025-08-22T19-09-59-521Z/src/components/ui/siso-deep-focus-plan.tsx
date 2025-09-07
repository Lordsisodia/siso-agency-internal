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
  Pause
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TaskDetailModal } from "./task-detail-modal";

// Type definitions
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedTime?: string; // Deep focus time estimate
  tools?: string[]; // Optional array of MCP server tools
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
      },
      {
        id: "1.2",
        title: "Complete Prisma database integration testing",
        description: "Ensure all database operations work seamlessly with zero cold starts",
        status: "pending",
        priority: "high", 
        estimatedTime: "60min",
        tools: ["prisma-client", "database-tester", "performance-monitor"],
      },
      {
        id: "1.3",
        title: "Optimize bundle size and loading performance",
        description: "Reduce application load times and improve overall performance",
        status: "pending",
        priority: "medium",
        estimatedTime: "90min",
        tools: ["webpack-analyzer", "performance-profiler", "code-splitter"],
      },
      {
        id: "1.4",
        title: "Enhance mobile responsiveness",
        description: "Improve mobile UX and responsive design across all components",
        status: "pending",
        priority: "medium",
        estimatedTime: "75min",
        tools: ["responsive-tester", "mobile-debugger", "css-optimizer"],
      },
      {
        id: "1.5",
        title: "Complete missing daily tracking features",
        description: "Implement all planned life management and tracking functionality",
        status: "pending",
        priority: "high",
        estimatedTime: "120min",
        tools: ["react-components", "state-manager", "ui-builder"],
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
      },
      {
        id: "2.2",
        title: "Implement context switching penalty calculations",
        description: "Develop algorithms to calculate productivity loss from task switching",
        status: "pending",
        priority: "medium",
        estimatedTime: "60min",
        tools: ["algorithm-designer", "calculation-engine", "data-processor"],
      },
      {
        id: "2.3",
        title: "Create intelligent break suggestions",
        description: "Build AI system to suggest optimal break timing based on work patterns",
        status: "pending",
        priority: "medium",
        estimatedTime: "75min",
        tools: ["ai-assistant", "pattern-analyzer", "notification-system"],
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
      },
      {
        id: "3.2",
        title: "Add task dependency visualization",
        description: "Create visual representation of task dependencies and blockers",
        status: "pending",
        priority: "low",
        estimatedTime: "60min",
        tools: ["graph-visualizer", "dependency-mapper", "svg-renderer"],
      },
      {
        id: "3.3",
        title: "Build task templates and quick actions",
        description: "Create reusable task templates and quick action shortcuts",
        status: "pending",
        priority: "low",
        estimatedTime: "30min",
        tools: ["template-engine", "shortcuts-manager", "quick-actions"],
      },
    ],
  },
];

interface SisoDeepFocusPlanProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
}

export default function SisoDeepFocusPlan({ onStartFocusSession }: SisoDeepFocusPlanProps) {
  const [tasks, setTasks] = useState<Task[]>(sisoTasks);
  const [expandedTasks, setExpandedTasks] = useState<string[]>(["1"]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeFocusSession, setActiveFocusSession] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add support for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

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
                    {/* Task row */}
                    <motion.div 
                      className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-700/30"
                    >
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

                        <div className="flex-1 min-w-0 space-y-1">
                          <div
                            className="cursor-pointer hover:text-orange-300 transition-colors"
                            onClick={() => openTaskDetail(task)}
                          >
                            <span className={`text-sm font-medium ${isCompleted ? "text-gray-500 line-through" : "text-white"}`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                task.status === "completed" ? "bg-green-500/20 text-green-400" :
                                task.status === "in-progress" ? "bg-blue-500/20 text-blue-400" :
                                task.status === "need-help" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-gray-500/20 text-gray-400"
                              }`}>
                                {task.status}
                              </span>
                              {task.context && (
                                <span className="text-xs text-gray-500">{task.context}</span>
                              )}
                              {task.focusIntensity && (
                                <span className="text-xs text-orange-400">L{task.focusIntensity}</span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpansion(task.id);
                              }}
                              className="text-gray-400 hover:text-white h-6 w-6 p-0"
                            >
                              {isExpanded ? "−" : "+"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => startFocusSession(task.id)}
                        className="ml-2 bg-orange-600 hover:bg-orange-700 text-white h-7 px-3"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Focus
                      </Button>
                    </motion.div>

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
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];

                              return (
                                <motion.li
                                  key={subtask.id}
                                  className="group flex flex-col pl-6"
                                  variants={subtaskVariants}
                                  initial="hidden"
                                  animate="visible"
                                  layout
                                >
                                  <motion.div 
                                    className="flex items-center justify-between rounded-md p-2 hover:bg-gray-700/20"
                                    layout
                                  >
                                    <div className="flex items-center flex-1 min-w-0">
                                      <motion.div
                                        className="mr-2 flex-shrink-0 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSubtaskStatus(task.id, subtask.id);
                                        }}
                                        whileTap={{ scale: 0.9 }}
                                        whileHover={{ scale: 1.1 }}
                                      >
                                        {subtask.status === "completed" ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                                        ) : subtask.status === "in-progress" ? (
                                          <CircleDotDashed className="h-4 w-4 text-blue-400" />
                                        ) : (
                                          <Circle className="h-4 w-4 text-gray-400" />
                                        )}
                                      </motion.div>

                                      <div 
                                        className="flex-1 cursor-pointer"
                                        onClick={() => toggleSubtaskExpansion(task.id, subtask.id)}
                                      >
                                        <span className={`text-sm ${subtask.status === "completed" ? "text-gray-500 line-through" : "text-gray-200"}`}>
                                          {subtask.title}
                                        </span>
                                        {subtask.estimatedTime && (
                                          <div className="text-xs text-gray-500 mt-0.5">
                                            <Timer className="w-3 h-3 inline mr-1" />
                                            {subtask.estimatedTime}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <Button
                                      size="sm"
                                      onClick={() => startFocusSession(task.id, subtask.id)}
                                      className="ml-2 bg-blue-600 hover:bg-blue-700 text-white h-6 px-2 text-xs"
                                    >
                                      <Play className="w-2.5 h-2.5" />
                                    </Button>
                                  </motion.div>

                                  <AnimatePresence mode="wait">
                                    {isSubtaskExpanded && (
                                      <motion.div 
                                        className="ml-6 mt-1 p-2 border-l border-dashed border-gray-600/30 pl-3 text-xs text-gray-400 overflow-hidden"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                      >
                                        <p className="mb-2">{subtask.description}</p>
                                        {subtask.tools && subtask.tools.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            <span className="font-medium text-gray-300">Tools:</span>
                                            {subtask.tools.map((tool, idx) => (
                                              <span
                                                key={idx}
                                                className="bg-gray-700/40 text-gray-300 rounded px-1.5 py-0.5 text-[10px]"
                                              >
                                                {tool}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>

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