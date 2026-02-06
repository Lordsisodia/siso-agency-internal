"use client";

/**
 * useTaskHandlers Hook
 *
 * Consolidates all task operation handlers with proper error handling,
 optimistic updates, and XP awards.
 */

import { useCallback, useState, useRef } from "react";
import { GamificationService } from "@/domains/lifelock/_shared/services/gamificationService";
import {
  getLightWorkPriorityMultiplier,
  getDeepWorkPriorityMultiplier,
  XP_BASE_LIGHT_WORK,
  XP_BASE_DEEP_WORK,
} from "@/domains/lifelock/1-daily/_shared/utils/taskXpCalculations";
import { LightWorkTask } from "@/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase";
import { DeepWorkTask } from "@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase";

// Toast notification type
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface UseTaskHandlersOptions {
  toggleLightTaskCompletion: (id: string) => Promise<LightWorkTask | null>;
  toggleDeepTaskCompletion: (id: string) => Promise<DeepWorkTask | null>;
  toggleLightSubtaskCompletion: (taskId: string, subtaskId: string) => Promise<void>;
  toggleDeepSubtaskCompletion: (taskId: string, subtaskId: string) => Promise<void>;
  createLightTask: (task: Partial<LightWorkTask>) => Promise<LightWorkTask | null>;
  createDeepTask: (task: Partial<DeepWorkTask>) => Promise<DeepWorkTask | null>;
  addLightSubtask: (taskId: string, title: string) => Promise<void>;
  addDeepSubtask: (taskId: string, title: string) => Promise<void>;
  deleteLightTask: (id: string) => Promise<void>;
  deleteDeepTask: (id: string) => Promise<void>;
  deleteLightSubtask: (subtaskId: string) => Promise<void>;
  deleteDeepSubtask: (subtaskId: string) => Promise<void>;
  updateLightSubtaskTitle: (subtaskId: string, title: string) => Promise<void>;
  updateDeepSubtaskTitle: (subtaskId: string, title: string) => Promise<void>;
  updateLightSubtaskPriority: (subtaskId: string, priority: string) => Promise<void>;
  updateDeepSubtaskPriority: (subtaskId: string, priority: string) => Promise<void>;
  updateLightSubtaskDescription: (subtaskId: string, description: string) => Promise<void>;
  updateDeepSubtaskDescription: (subtaskId: string, description: string) => Promise<void>;
  updateLightSubtaskEstimatedTime: (subtaskId: string, time: string) => Promise<void>;
  updateDeepSubtaskEstimatedTime: (subtaskId: string, time: string) => Promise<void>;
  updateLightTaskTitle: (id: string, title: string) => Promise<boolean>;
  updateDeepTaskTitle: (id: string, title: string) => Promise<boolean>;
  updateLightTaskDueDate: (id: string, date: string) => Promise<void>;
  updateDeepTaskDueDate: (id: string, date: string) => Promise<void>;
  updateLightTaskPriority: (id: string, priority: string) => Promise<void>;
  updateDeepTaskPriority: (id: string, priority: string) => Promise<void>;
  updateLightTaskTimeEstimate: (id: string, estimate: string | null) => Promise<void>;
  updateDeepTaskTimeEstimate: (id: string, estimate: string | null) => Promise<void>;
  pushLightTaskToAnotherDay: (id: string, date: string) => Promise<void>;
  pushDeepTaskToAnotherDay: (id: string, date: string) => Promise<void>;
  todayDate: string;
}

interface UseTaskHandlersResult {
  // Task operations
  handleToggleTaskStatus: (taskId: string) => Promise<void>;
  handleToggleSubtaskStatus: (taskId: string, subtaskId: string) => Promise<void>;
  handleCreateNewTask: () => Promise<string | null>;
  handleCreateDeepTask: () => Promise<string | null>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleDeleteSubtask: (subtaskId: string, findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined) => Promise<void>;

  // Task updates
  handleTaskCalendarSelect: (taskId: string, date: Date | null) => Promise<void>;
  handleTaskPrioritySelect: (taskId: string, priority: "low" | "medium" | "high" | "urgent") => Promise<void>;
  handleTaskTimeSave: (taskId: string, value: string) => Promise<void>;
  handleMainTaskSaveEdit: (taskId: string, value: string) => Promise<void>;
  handleAllocateTask: (taskId: string) => Promise<void>;

  // Subtask operations
  handleSubtaskSaveEdit: (subtaskId: string, value: string, findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined) => Promise<void>;
  handleUpdateSubtaskPriority: (subtaskId: string, priority: string, findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined) => Promise<void>;
  handleUpdateSubtaskDescription: (subtaskId: string, description: string, findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined) => Promise<void>;
  handleUpdateSubtaskEstimatedTime: (subtaskId: string, time: string, findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined) => Promise<void>;
  handleSaveNewSubtask: (taskId: string, value: string) => Promise<void>;

  // Toast notifications
  toasts: Toast[];
  removeToast: (id: string) => void;

  // Loading states for specific operations
  loadingOperations: Record<string, boolean>;
}

// Parse task ID into workType and originalId
function parseTaskId(taskId: string): { workType: "light" | "deep"; originalId: string } {
  const parts = taskId.split("-");
  const workType = parts[0] as "light" | "deep";
  const originalId = parts.slice(1).join("-");
  return { workType, originalId };
}

export function useTaskHandlers({
  toggleLightTaskCompletion,
  toggleDeepTaskCompletion,
  toggleLightSubtaskCompletion,
  toggleDeepSubtaskCompletion,
  createLightTask,
  createDeepTask,
  addLightSubtask,
  addDeepSubtask,
  deleteLightTask,
  deleteDeepTask,
  deleteLightSubtask,
  deleteDeepSubtask,
  updateLightSubtaskTitle,
  updateDeepSubtaskTitle,
  updateLightSubtaskPriority,
  updateDeepSubtaskPriority,
  updateLightSubtaskDescription,
  updateDeepSubtaskDescription,
  updateLightSubtaskEstimatedTime,
  updateDeepSubtaskEstimatedTime,
  updateLightTaskTitle,
  updateDeepTaskTitle,
  updateLightTaskDueDate,
  updateDeepTaskDueDate,
  updateLightTaskPriority,
  updateDeepTaskPriority,
  updateLightTaskTimeEstimate,
  updateDeepTaskTimeEstimate,
  pushLightTaskToAnotherDay,
  pushDeepTaskToAnotherDay,
  todayDate,
}: UseTaskHandlersOptions): UseTaskHandlersResult {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loadingOperations, setLoadingOperations] = useState<Record<string, boolean>>({});

  // Track in-flight requests to prevent race conditions
  const inFlightRequests = useRef<Set<string>>(new Set());

  const addToast = useCallback((message: string, type: Toast["type"] = "info", duration = 3000) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const withLoading = useCallback(
    async <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
      // Prevent duplicate in-flight requests
      if (inFlightRequests.current.has(key)) {
        throw new Error("Operation already in progress");
      }

      inFlightRequests.current.add(key);
      setLoadingOperations((prev) => ({ ...prev, [key]: true }));

      try {
        const result = await fn();
        return result;
      } finally {
        inFlightRequests.current.delete(key);
        setLoadingOperations((prev) => ({ ...prev, [key]: false }));
      }
    },
    []
  );

  const handleToggleTaskStatus = useCallback(
    async (taskId: string) => {
      const { workType, originalId } = parseTaskId(taskId);

      await withLoading(`toggle-${taskId}`, async () => {
        try {
          if (workType === "light") {
            const updatedTask = await toggleLightTaskCompletion(originalId);
            if (updatedTask && !updatedTask.completed) {
              const multiplier = getLightWorkPriorityMultiplier(updatedTask.priority);
              GamificationService.awardXP("light_task_complete", multiplier);
              addToast(`Task completed! +${Math.round(XP_BASE_LIGHT_WORK * multiplier)} XP`, "success");
            }
          } else {
            const updatedTask = await toggleDeepTaskCompletion(originalId);
            if (updatedTask && !updatedTask.completed) {
              const multiplier = getDeepWorkPriorityMultiplier(updatedTask.priority);
              GamificationService.awardXP("deep_task_complete", multiplier);
              addToast(`Deep work task completed! +${Math.round(XP_BASE_DEEP_WORK * multiplier)} XP`, "success");
            }
          }
        } catch (error) {
          console.error("Error toggling task completion:", error);
          addToast("Failed to update task status", "error");
          throw error;
        }
      });
    },
    [
      toggleLightTaskCompletion,
      toggleDeepTaskCompletion,
      withLoading,
      addToast,
    ]
  );

  const handleToggleSubtaskStatus = useCallback(
    async (taskId: string, subtaskId: string) => {
      const { workType, originalTaskId } = parseTaskId(taskId);

      await withLoading(`toggle-subtask-${subtaskId}`, async () => {
        try {
          if (workType === "light") {
            await toggleLightSubtaskCompletion(originalTaskId, subtaskId);
          } else {
            await toggleDeepSubtaskCompletion(originalTaskId, subtaskId);
          }
        } catch (error) {
          console.error("Error toggling subtask completion:", error);
          addToast("Failed to update subtask", "error");
          throw error;
        }
      });
    },
    [
      toggleLightSubtaskCompletion,
      toggleDeepSubtaskCompletion,
      withLoading,
      addToast,
    ]
  );

  const handleCreateNewTask = useCallback(async () => {
    return withLoading("create-task", async () => {
      try {
        const newTask = await createLightTask({
          title: "New Task",
          priority: "HIGH",
          currentDate: todayDate,
          dueDate: todayDate,
        });

        if (newTask) {
          addToast("Task created successfully", "success");
          return `light-${newTask.id}`;
        }
        return null;
      } catch (error) {
        console.error("Error creating new task:", error);
        addToast("Failed to create task", "error");
        throw error;
      }
    });
  }, [createLightTask, todayDate, withLoading, addToast]);

  const handleCreateDeepTask = useCallback(async () => {
    return withLoading("create-deep-task", async () => {
      try {
        const newTask = await createDeepTask({
          title: "New Deep Work Task",
          priority: "HIGH",
          taskDate: todayDate,
          dueDate: todayDate,
          focusBlocks: 4,
        });

        if (newTask) {
          addToast("Deep work task created successfully", "success");
          return `deep-${newTask.id}`;
        }
        return null;
      } catch (error) {
        console.error("Error creating deep work task:", error);
        addToast("Failed to create task", "error");
        throw error;
      }
    });
  }, [createDeepTask, todayDate, withLoading, addToast]);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      const { workType, originalId } = parseTaskId(taskId);

      await withLoading(`delete-${taskId}`, async () => {
        try {
          if (workType === "light") {
            await deleteLightTask(originalId);
          } else {
            await deleteDeepTask(originalId);
          }
          addToast("Task deleted", "info");
        } catch (error) {
          console.error("Error deleting task:", error);
          addToast("Failed to delete task", "error");
          throw error;
        }
      });
    },
    [deleteLightTask, deleteDeepTask, withLoading, addToast]
  );

  const handleDeleteSubtask = useCallback(
    async (subtaskId: string, findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined) => {
      if (!findParentTask) return;

      const parentTask = findParentTask(subtaskId);
      if (!parentTask) {
        console.error("Could not find parent task for subtask:", subtaskId);
        addToast("Failed to delete subtask", "error");
        return;
      }

      const { workType } = parentTask;

      await withLoading(`delete-subtask-${subtaskId}`, async () => {
        try {
          if (workType === "light") {
            await deleteLightSubtask(subtaskId);
          } else {
            await deleteDeepSubtask(subtaskId);
          }
          addToast("Subtask deleted", "info");
        } catch (error) {
          console.error("Error deleting subtask:", error);
          addToast("Failed to delete subtask", "error");
          throw error;
        }
      });
    },
    [deleteLightSubtask, deleteDeepSubtask, withLoading, addToast]
  );

  const handleTaskCalendarSelect = useCallback(
    async (taskId: string, date: Date | null) => {
      const { workType, originalId } = parseTaskId(taskId);

      await withLoading(`calendar-${taskId}`, async () => {
        try {
          const dateString = date ? date.toISOString().split("T")[0] : null;
          if (dateString) {
            if (workType === "light") {
              await pushLightTaskToAnotherDay(originalId, dateString);
            } else {
              await pushDeepTaskToAnotherDay(originalId, dateString);
            }
            addToast(`Task moved to ${dateString}`, "success");
          }
        } catch (error) {
          console.error("Error updating task date:", error);
          addToast("Failed to move task", "error");
          throw error;
        }
      });
    },
    [pushLightTaskToAnotherDay, pushDeepTaskToAnotherDay, withLoading, addToast]
  );

  const handleTaskPrioritySelect = useCallback(
    async (taskId: string, priority: "low" | "medium" | "high" | "urgent") => {
      const { workType, originalId } = parseTaskId(taskId);

      await withLoading(`priority-${taskId}`, async () => {
        try {
          const upperPriority = priority.toUpperCase() as
            | "LOW"
            | "MEDIUM"
            | "HIGH"
            | "URGENT";
          if (workType === "light") {
            await updateLightTaskPriority(originalId, upperPriority);
          } else {
            await updateDeepTaskPriority(originalId, upperPriority);
          }
          addToast(`Priority updated to ${priority}`, "success");
        } catch (error) {
          console.error("Error updating task priority:", error);
          addToast("Failed to update priority", "error");
          throw error;
        }
      });
    },
    [updateLightTaskPriority, updateDeepTaskPriority, withLoading, addToast]
  );

  const handleTaskTimeSave = useCallback(
    async (taskId: string, value: string) => {
      const { workType, originalId } = parseTaskId(taskId);

      await withLoading(`time-${taskId}`, async () => {
        try {
          const trimmed = value.trim();
          if (workType === "light") {
            await updateLightTaskTimeEstimate(originalId, trimmed ? trimmed : null);
          } else {
            await updateDeepTaskTimeEstimate(originalId, trimmed ? trimmed : null);
          }
          addToast("Time estimate updated", "success");
        } catch (error) {
          console.error("Error updating task time estimate:", error);
          addToast("Failed to update time estimate", "error");
          throw error;
        }
      });
    },
    [updateLightTaskTimeEstimate, updateDeepTaskTimeEstimate, withLoading, addToast]
  );

  const handleMainTaskSaveEdit = useCallback(
    async (taskId: string, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      const { workType, originalId } = parseTaskId(taskId);

      await withLoading(`edit-title-${taskId}`, async () => {
        try {
          const success =
            workType === "light"
              ? await updateLightTaskTitle(originalId, trimmed)
              : await updateDeepTaskTitle(originalId, trimmed);

          if (success) {
            addToast("Task title updated", "success");
          }
        } catch (error) {
          console.error("Error updating main task title:", error);
          addToast("Failed to update title", "error");
          throw error;
        }
      });
    },
    [updateLightTaskTitle, updateDeepTaskTitle, withLoading, addToast]
  );

  const handleAllocateTask = useCallback(
    async (taskId: string) => {
      const { workType, originalId } = parseTaskId(taskId);

      await withLoading(`allocate-${taskId}`, async () => {
        try {
          if (workType === "light") {
            await pushLightTaskToAnotherDay(originalId, todayDate);
          } else {
            await pushDeepTaskToAnotherDay(originalId, todayDate);
          }
          addToast("Task added to today", "success");
        } catch (error) {
          console.error("Error allocating task:", error);
          addToast("Failed to add task to today", "error");
          throw error;
        }
      });
    },
    [pushLightTaskToAnotherDay, pushDeepTaskToAnotherDay, todayDate, withLoading, addToast]
  );

  const handleSubtaskSaveEdit = useCallback(
    async (
      subtaskId: string,
      value: string,
      findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined
    ) => {
      if (!findParentTask) return;

      const trimmed = value.trim();
      if (!trimmed) return;

      const parentTask = findParentTask(subtaskId);
      if (!parentTask) {
        console.error("Could not find parent task for subtask:", subtaskId);
        addToast("Failed to update subtask", "error");
        return;
      }

      const { workType } = parentTask;

      await withLoading(`edit-subtask-${subtaskId}`, async () => {
        try {
          if (workType === "light") {
            await updateLightSubtaskTitle(subtaskId, trimmed);
          } else {
            await updateDeepSubtaskTitle(subtaskId, trimmed);
          }
          addToast("Subtask updated", "success");
        } catch (error) {
          console.error("Failed to update subtask title:", error);
          addToast("Failed to update subtask", "error");
          throw error;
        }
      });
    },
    [updateLightSubtaskTitle, updateDeepSubtaskTitle, withLoading, addToast]
  );

  const handleUpdateSubtaskPriority = useCallback(
    async (
      subtaskId: string,
      priority: string,
      findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined
    ) => {
      if (!findParentTask) return;

      const parentTask = findParentTask(subtaskId);
      if (!parentTask) {
        console.error("Could not find parent task for subtask:", subtaskId);
        addToast("Failed to update subtask priority", "error");
        return;
      }

      const { workType } = parentTask;

      await withLoading(`subtask-priority-${subtaskId}`, async () => {
        try {
          if (workType === "light") {
            await updateLightSubtaskPriority(subtaskId, priority);
          } else {
            await updateDeepSubtaskPriority(subtaskId, priority);
          }
          addToast("Subtask priority updated", "success");
        } catch (error) {
          console.error("Error updating subtask priority:", error);
          addToast("Failed to update priority", "error");
          throw error;
        }
      });
    },
    [updateLightSubtaskPriority, updateDeepSubtaskPriority, withLoading, addToast]
  );

  const handleUpdateSubtaskDescription = useCallback(
    async (
      subtaskId: string,
      description: string,
      findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined
    ) => {
      if (!findParentTask) return;

      const parentTask = findParentTask(subtaskId);
      if (!parentTask) {
        console.error("Could not find parent task for subtask:", subtaskId);
        addToast("Failed to update subtask description", "error");
        return;
      }

      const { workType } = parentTask;

      await withLoading(`subtask-desc-${subtaskId}`, async () => {
        try {
          if (workType === "light") {
            await updateLightSubtaskDescription(subtaskId, description);
          } else {
            await updateDeepSubtaskDescription(subtaskId, description);
          }
          addToast("Subtask description updated", "success");
        } catch (error) {
          console.error("Error updating subtask description:", error);
          addToast("Failed to update description", "error");
          throw error;
        }
      });
    },
    [updateLightSubtaskDescription, updateDeepSubtaskDescription, withLoading, addToast]
  );

  const handleUpdateSubtaskEstimatedTime = useCallback(
    async (
      subtaskId: string,
      time: string,
      findParentTask: (subtaskId: string) => { workType: "light" | "deep" } | undefined
    ) => {
      if (!findParentTask) return;

      const parentTask = findParentTask(subtaskId);
      if (!parentTask) {
        console.error("Could not find parent task for subtask:", subtaskId);
        addToast("Failed to update subtask time", "error");
        return;
      }

      const { workType } = parentTask;

      await withLoading(`subtask-time-${subtaskId}`, async () => {
        try {
          if (workType === "light") {
            await updateLightSubtaskEstimatedTime(subtaskId, time);
          } else {
            await updateDeepSubtaskEstimatedTime(subtaskId, time);
          }
          addToast("Subtask time estimate updated", "success");
        } catch (error) {
          console.error("Error updating subtask estimated time:", error);
          addToast("Failed to update time estimate", "error");
          throw error;
        }
      });
    },
    [updateLightSubtaskEstimatedTime, updateDeepSubtaskEstimatedTime, withLoading, addToast]
  );

  const handleSaveNewSubtask = useCallback(
    async (taskId: string, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      const { workType, originalId } = parseTaskId(taskId);

      await withLoading(`add-subtask-${taskId}`, async () => {
        try {
          if (workType === "light") {
            await addLightSubtask(originalId, trimmed);
          } else {
            await addDeepSubtask(originalId, trimmed);
          }
          addToast("Subtask added", "success");
        } catch (error) {
          console.error("Failed to create new subtask:", error);
          addToast("Failed to add subtask", "error");
          throw error;
        }
      });
    },
    [addLightSubtask, addDeepSubtask, withLoading, addToast]
  );

  return {
    handleToggleTaskStatus,
    handleToggleSubtaskStatus,
    handleCreateNewTask,
    handleCreateDeepTask,
    handleDeleteTask,
    handleDeleteSubtask,
    handleTaskCalendarSelect,
    handleTaskPrioritySelect,
    handleTaskTimeSave,
    handleMainTaskSaveEdit,
    handleAllocateTask,
    handleSubtaskSaveEdit,
    handleUpdateSubtaskPriority,
    handleUpdateSubtaskDescription,
    handleUpdateSubtaskEstimatedTime,
    handleSaveNewSubtask,
    toasts,
    removeToast,
    loadingOperations,
  };
}
