/**
 * 🎯 Reusable TaskCard Component
 * 
 * Unified task display component that works for both Deep Work and Light Work pages.
 * Features full CRUD operations, state management, and beautiful animations.
 * 
 * Based on the working HOTFIX implementation with enhanced reusability.
 */

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  Timer,
  Play,
  Brain,
  Target,
  Clock,
  Zap
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { TaskDetailModal } from "./TaskDetailModal";

// Core task types
export interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedTime?: string;
  tools?: string[];
}

export interface Task {
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

export interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  expandedSubtasks: { [key: string]: boolean };
  activeFocusSession?: string | null;
  
  // Theme configuration for different pages
  theme?: 'deep-work' | 'light-work' | 'default';
  
  // Event handlers
  onToggleExpansion: (taskId: string) => void;
  onToggleSubtaskExpansion: (taskId: string, subtaskId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onToggleSubtaskStatus: (taskId: string, subtaskId: string) => void;
  onStartFocusSession: (taskId: string, subtaskId?: string) => void;
  onTaskUpdate: (updatedTask: Task) => void;
  onOpenTaskDetail: (task: Task) => void;
  
  // Animation preferences
  prefersReducedMotion?: boolean;
}

// Theme configurations
const themes = {
  'deep-work': {
    background: 'hover:bg-gray-700/30',
    subtaskBackground: 'hover:bg-gray-700/20',
    focusButton: 'bg-orange-600 hover:bg-orange-700',
    subtaskButton: 'bg-blue-600 hover:bg-blue-700',
    borderColor: 'border-gray-600/40'
  },
  'light-work': {
    background: 'hover:bg-emerald-800/20',
    subtaskBackground: 'hover:bg-emerald-800/10',
    focusButton: 'bg-emerald-600 hover:bg-emerald-700',
    subtaskButton: 'bg-teal-600 hover:bg-teal-700',
    borderColor: 'border-emerald-500/30'
  },
  'default': {
    background: 'hover:bg-gray-100/30',
    subtaskBackground: 'hover:bg-gray-100/20',
    focusButton: 'bg-gray-600 hover:bg-gray-700',
    subtaskButton: 'bg-gray-500 hover:bg-gray-600',
    borderColor: 'border-gray-300/40'
  }
};

const intensityConfig = {
  1: { name: 'Light Focus', color: 'bg-blue-500/20 text-blue-300', icon: Clock },
  2: { name: 'Medium Focus', color: 'bg-yellow-500/20 text-yellow-300', icon: Target },
  3: { name: 'Deep Flow', color: 'bg-orange-500/20 text-orange-300', icon: Brain },
  4: { name: 'Ultra-Deep', color: 'bg-red-500/20 text-red-300', icon: Zap }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isExpanded,
  expandedSubtasks,
  activeFocusSession,
  theme = 'default',
  onToggleExpansion,
  onToggleSubtaskExpansion,
  onToggleTaskStatus,
  onToggleSubtaskStatus,
  onStartFocusSession,
  onTaskUpdate,
  onOpenTaskDetail,
  prefersReducedMotion = false
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const themeConfig = themes[theme];
  const isCompleted = task.status === "completed";
  const intensity = intensityConfig[task.focusIntensity || 2];

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
    onOpenTaskDetail(task);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    onTaskUpdate(updatedTask);
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Animation variants
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

  const getStatusIcon = (status: string, size: 'sm' | 'md' = 'md') => {
    const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    
    switch (status) {
      case "completed":
        return <CheckCircle2 className={`${iconClass} text-green-400`} />;
      case "in-progress":
        return <CircleDotDashed className={`${iconClass} text-blue-400`} />;
      case "need-help":
        return <CircleAlert className={`${iconClass} text-yellow-400`} />;
      default:
        return <Circle className={`${iconClass} text-gray-400`} />;
    }
  };

  return (
    <>
      <motion.div
        className="overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={taskVariants}
        layout
      >
        {/* Task Header */}
        <motion.div 
          className={`group flex items-center justify-between px-3 py-2 rounded-md ${themeConfig.background}`}
          layout
        >
          <div className="flex items-center flex-1 min-w-0">
            {/* Task Status Icon */}
            <motion.div
              className="mr-3 flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onToggleTaskStatus(task.id);
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
                  {getStatusIcon(task.status)}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Task Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div
                className="cursor-pointer hover:text-orange-300 transition-colors"
                onClick={() => openTaskDetail(task)}
              >
                <span className={`text-sm font-medium ${isCompleted ? "text-gray-500 line-through" : "text-white"}`}>
                  {task.title}
                </span>
              </div>
              
              {/* Task Metadata */}
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
                
                {/* Expand/Collapse Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(task.id);
                  }}
                  className="text-gray-400 hover:text-white h-6 w-6 p-0"
                >
                  {isExpanded ? "−" : "+"}
                </Button>
              </div>
            </div>
          </div>

          {/* Focus Button */}
          <Button
            size="sm"
            onClick={() => onStartFocusSession(task.id)}
            className={`ml-2 ${themeConfig.focusButton} text-white h-7 px-3`}
          >
            <Play className="w-3 h-3 mr-1" />
            Focus
          </Button>
        </motion.div>

        {/* Subtasks Section */}
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
              {/* Dotted Line Connection */}
              <div className={`absolute top-0 bottom-0 left-[22px] border-l-2 border-dashed ${themeConfig.borderColor}`} />
              
              {/* Subtasks List */}
              <ul className="mt-1 mr-2 mb-2 ml-4 space-y-1">
                {task.subtasks.map((subtask) => {
                  const subtaskKey = `${task.id}-${subtask.id}`;
                  const isSubtaskExpanded = expandedSubtasks[subtaskKey];
                  const isSubtaskCompleted = subtask.status === "completed";

                  return (
                    <motion.li
                      key={subtask.id}
                      className="group flex flex-col pl-6"
                      variants={subtaskVariants}
                      initial="hidden"
                      animate="visible"
                      layout
                    >
                      {/* Subtask Header */}
                      <motion.div 
                        className={`flex items-center justify-between rounded-md p-2 ${themeConfig.subtaskBackground}`}
                        layout
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          {/* Subtask Status */}
                          <motion.div
                            className="mr-2 flex-shrink-0 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSubtaskStatus(task.id, subtask.id);
                            }}
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1 }}
                          >
                            {getStatusIcon(subtask.status, 'sm')}
                          </motion.div>

                          {/* Subtask Content */}
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => onToggleSubtaskExpansion(task.id, subtask.id)}
                          >
                            <span className={`text-sm ${isSubtaskCompleted ? "text-gray-500 line-through" : "text-gray-200"}`}>
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

                        {/* Subtask Focus Button */}
                        <Button
                          size="sm"
                          onClick={() => onStartFocusSession(task.id, subtask.id)}
                          className={`ml-2 ${themeConfig.subtaskButton} text-white h-6 px-2 text-xs`}
                        >
                          <Play className="w-2.5 h-2.5" />
                        </Button>
                      </motion.div>

                      {/* Expanded Subtask Details */}
                      <AnimatePresence mode="wait">
                        {isSubtaskExpanded && (
                          <motion.div 
                            className={`ml-6 mt-1 p-2 border-l border-dashed ${themeConfig.borderColor} pl-3 text-xs text-gray-400 overflow-hidden`}
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
      </motion.div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={handleTaskUpdate}
        onStartFocusSession={(taskId, subtaskId) => {
          setIsModalOpen(false);
          onStartFocusSession(taskId, subtaskId);
        }}
      />
    </>
  );
};