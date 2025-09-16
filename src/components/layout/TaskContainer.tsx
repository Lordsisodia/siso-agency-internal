/**
 * 🎛️ TaskContainer Component (LEGACY)
 * 
 * ⚠️ DEPRECATED: This is the legacy TaskContainer implementation.
 * Please migrate to TaskContainerV2 for better performance and features.
 * 
 * Smart container that manages task state and provides CRUD operations.
 * This component handles all data operations and state management,
 * making TaskCard purely presentational and reusable.
 * 
 * NEW ARCHITECTURE BENEFITS:
 * - React Query integration with optimistic updates
 * - Decomposed hooks for better testability
 * - Type-safe validation system
 * - Enhanced error handling
 * - Performance optimizations
 * 
 * MIGRATION PATH:
 * 1. Import TaskContainerV2 instead of TaskContainer
 * 2. Update taskType prop (workType → taskType)
 * 3. Remove initialTasks prop (auto-loaded)
 * 4. Remove useDatabase prop (always enabled)
 */

import React, { useState, useCallback, useEffect } from "react";
import { LayoutGroup } from "framer-motion";
import { TaskCard, Task } from "./TaskCard";
import { supabaseTaskService } from '@/services/supabaseTaskService';

interface TaskContainerProps {
  initialTasks: Task[];
  theme?: 'deep-work' | 'light-work' | 'default';
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  className?: string;
  useDatabase?: boolean; // Enable/disable database operations
  workType?: 'light_work' | 'deep_work'; // Determines which table to use
}

export const TaskContainer: React.FC<TaskContainerProps> = ({
  initialTasks,
  theme = 'default',
  onStartFocusSession,
  className = "",
  useDatabase = true,
  workType = 'light_work'
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<string[]>(
    // Expand first task by default for better UX
    initialTasks.length > 0 ? [initialTasks[0].id] : []
  );
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeFocusSession, setActiveFocusSession] = useState<string | null>(null);

  // Detect reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

  // Load tasks from database on mount
  useEffect(() => {
    if (useDatabase) {
      loadTasksFromDatabase();
    }
  }, [useDatabase, workType, loadTasksFromDatabase]);

  const loadTasksFromDatabase = useCallback(async () => {
    setLoading(true);
    try {
      const dbTasks = workType === 'light_work' 
        ? await supabaseTaskService.getLightWorkTasks()
        : await supabaseTaskService.getDeepWorkTasks();
      
      setTasks(dbTasks);
      // Expand first task if available
      if (dbTasks.length > 0) {
        setExpandedTasks([dbTasks[0].id]);
      }
    } catch (error) {
      console.error('Failed to load tasks from database:', error);
      // Fall back to initial tasks on error
      setTasks(initialTasks);
    } finally {
      setLoading(false);
    }
  }, [workType, initialTasks]);

  // Toggle task expansion
  const handleToggleExpansion = useCallback((taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  }, []);

  // Toggle subtask expansion
  const handleToggleSubtaskExpansion = useCallback((taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Toggle task status (cycles through all statuses)
  const handleToggleTaskStatus = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const statuses = ["completed", "in-progress", "pending", "need-help"];
          const currentIndex = statuses.indexOf(task.status);
          const newStatus = statuses[(currentIndex + 1) % statuses.length];

          // Persist to database if enabled
          if (useDatabase) {
            supabaseTaskService.updateTaskStatus(
              taskId, 
              newStatus === "completed", 
              workType
            ).catch(error => {
              console.error('Failed to update task status in database:', error);
            });
          }

          // If marking task as completed, also complete all subtasks
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
  }, [useDatabase, workType]);

  // Toggle subtask status
  const handleToggleSubtaskStatus = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((subtask) => {
            if (subtask.id === subtaskId) {
              const newStatus =
                subtask.status === "completed" ? "pending" : "completed";
              
              // Persist to database if enabled
              if (useDatabase) {
                supabaseTaskService.updateSubtaskStatus(
                  subtaskId, 
                  newStatus === "completed", 
                  workType
                ).catch(error => {
                  console.error('Failed to update subtask status in database:', error);
                });
              }
              
              return { ...subtask, status: newStatus };
            }
            return subtask;
          });

          // Auto-complete parent task if all subtasks are completed
          const allSubtasksCompleted = updatedSubtasks.every(
            (s) => s.status === "completed",
          );

          // Also persist parent task completion to database
          if (useDatabase && allSubtasksCompleted && task.status !== "completed") {
            supabaseTaskService.updateTaskStatus(taskId, true, workType)
              .catch(error => {
                console.error('Failed to update parent task completion in database:', error);
              });
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            status: allSubtasksCompleted && task.status !== "completed" ? "completed" : task.status,
          };
        }
        return task;
      }),
    );
  }, [useDatabase, workType]);

  // Start focus session
  const handleStartFocusSession = useCallback((taskId: string, subtaskId?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const sessionKey = subtaskId ? `${taskId}-${subtaskId}` : taskId;
      setActiveFocusSession(sessionKey);
      
      // Call external focus handler
      onStartFocusSession?.(taskId, task.focusIntensity || 2);
      
      // Update status to in-progress if not already
      if (subtaskId) {
        handleToggleSubtaskStatus(taskId, subtaskId);
      } else {
        setTasks(prev => prev.map(t => 
          t.id === taskId && t.status === "pending" ? { ...t, status: 'in-progress' } : t
        ));
      }
    }
  }, [tasks, onStartFocusSession, handleToggleSubtaskStatus]);

  // Update entire task (from modal)
  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  }, []);

  // Add new task
  const addTask = useCallback((newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
    };
    setTasks(prev => [...prev, task]);
    return task.id;
  }, []);

  // Delete task
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setExpandedTasks(prev => prev.filter(id => id !== taskId));
    // Clear any expanded subtasks for this task
    setExpandedSubtasks(prev => {
      const filtered: { [key: string]: boolean } = {};
      Object.keys(prev).forEach(key => {
        if (!key.startsWith(`${taskId}-`)) {
          filtered[key] = prev[key];
        }
      });
      return filtered;
    });
  }, []);

  // Handle opening task detail
  const handleOpenTaskDetail = useCallback((task: Task) => {
    // This could trigger analytics, recent items, etc.
    console.log('Opening task detail for:', task.title);
  }, []);

  if (loading && useDatabase) {
    return (
      <div className={`text-white h-full overflow-auto flex items-center justify-center ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="text-lg">Loading {workType === 'light_work' ? 'Light Work' : 'Deep Work'} tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-white h-full overflow-auto ${className}`}>
      <LayoutGroup>
        <div className="overflow-hidden">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-2">No tasks available</p>
                <p className="text-sm">
                  {useDatabase 
                    ? `No ${workType === 'light_work' ? 'light work' : 'deep work'} tasks found in database`
                    : 'No initial tasks provided'
                  }
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-1 overflow-hidden">
              {tasks.map((task, index) => (
                <li
                  key={task.id}
                  className={`${index !== 0 ? "mt-1 pt-2" : ""}`}
                >
                  <TaskCard
                    task={task}
                    isExpanded={expandedTasks.includes(task.id)}
                    expandedSubtasks={expandedSubtasks}
                    activeFocusSession={activeFocusSession}
                    theme={theme}
                    onToggleExpansion={handleToggleExpansion}
                    onToggleSubtaskExpansion={handleToggleSubtaskExpansion}
                    onToggleTaskStatus={handleToggleTaskStatus}
                    onToggleSubtaskStatus={handleToggleSubtaskStatus}
                    onStartFocusSession={handleStartFocusSession}
                    onTaskUpdate={handleTaskUpdate}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </LayoutGroup>
    </div>
  );
};

// Export additional utilities for external use
export const useTaskContainer = () => {
  return {
    addTask: (container: React.RefObject<any>, task: Omit<Task, 'id'>) => {
      // This would be implemented if we need external access to container methods
      // For now, tasks are managed internally
    }
  };
};