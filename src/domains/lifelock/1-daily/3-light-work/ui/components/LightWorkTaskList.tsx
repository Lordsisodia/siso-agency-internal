"use client";

/**
 * 🌱 Light Work Task List - Wired to Convex
 *
 * Uses the shared WorkTaskList component with LIGHT theme
 */

import React, { useCallback, useMemo } from "react";
import { WorkTaskList, WorkTask } from "@/domains/lifelock/1-daily/_shared/components/WorkTaskList";
import { LIGHT_THEME } from "@/domains/lifelock/1-daily/_shared/components/UnifiedTaskCard";
import {
  useLightWorkConvexTasks,
  useCreateTask,
  useUpdateTaskStatus,
  useCompleteTask,
  useDeleteTask,
  ConvexTask,
} from "@/domains/lifelock/_shared/hooks/useConvexTasks";
import { GamificationService } from "@/domains/lifelock/_shared/services/gamificationService";
import { getLightWorkPriorityMultiplier } from "@/domains/lifelock/1-daily/_shared/utils/taskXpCalculations";
import { useGamificationInit } from '@/domains/lifelock/_shared/hooks/useGamificationInit';

interface LightWorkTaskListProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date;
}

const LIGHT_FLOW_PROTOCOL = {
  title: "Light Work Tasks",
  subtitle: "Light Focus Work",
  description: "Light work sessions require focused attention without deep cognitive load. These blocks are designed for your routine, administrative, and quick-turnaround work that creates steady progress.",
  rules: [
    "• Light interruptions allowed for urgent matters",
    "• Phone on normal mode - check periodically",
    "• Work in 1-2 hour focused blocks",
    "• Quick breaks encouraged between tasks"
  ]
};

function transformToWorkTasks(tasks: ConvexTask[]): WorkTask[] {
  return tasks.map(task => ({
    id: task._id,
    title: task.title,
    description: task.description || "",
    status: task.status === "completed" ? "completed" : task.status === "in_progress" ? "completed" : "in-progress",
    priority: (task.priority || 'medium'),
    subtasks: [],
    focusIntensity: 2 as 1 | 2 | 3 | 4,
    dueDate: task.dueDate || null,
    timeEstimate: task.estimatedMinutes ? `${task.estimatedMinutes}m` : null,
    actualDurationMin: task.actualMinutes
  }));
}

export default function LightWorkTaskList({ onStartFocusSession, selectedDate = new Date() }: LightWorkTaskListProps) {
  // Initialize gamification system
  useGamificationInit();

  // Use Convex hooks for Light Work tasks
  const { tasks: rawTasks, isLoading: loading } = useLightWorkConvexTasks();
  const { createTask: convexCreateTask } = useCreateTask();
  const { updateStatus } = useUpdateTaskStatus();
  const { completeTask } = useCompleteTask();
  const { deleteTask: convexDeleteTask } = useDeleteTask();

  // Transform data
  const tasks = useMemo(() => transformToWorkTasks(rawTasks), [rawTasks]);

  // Adapter functions for WorkTaskList interface
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = rawTasks.find(t => t._id === taskId);
    if (!task) return;

    if (task.status === "completed") {
      await updateStatus(taskId, "pending");
    } else {
      const priorityMultiplier = getLightWorkPriorityMultiplier(task.priority || 'medium');
      const baseXP = 20;
      const xpEarned = Math.round(baseXP * priorityMultiplier);
      await completeTask(taskId, undefined, xpEarned);
    }
  }, [rawTasks, updateStatus, completeTask]);

  const toggleSubtaskCompletion = useCallback(async (taskId: string, subtaskId: string) => {
    // Subtasks not yet supported in Convex - no-op for now
    console.debug("Subtasks not yet supported in Convex");
  }, []);

  const createTask = useCallback(async (task: Partial<WorkTask>) => {
    await convexCreateTask({
      title: task.title || "New Task",
      description: task.description,
      taskType: 'light',
      priority: task.priority as 'low' | 'medium' | 'high' || 'medium',
      dueDate: task.dueDate || undefined,
      estimatedMinutes: task.timeEstimate ? parseInt(task.timeEstimate) : undefined,
    });
  }, [convexCreateTask]);

  const deleteTask = useCallback(async (taskId: string) => {
    await convexDeleteTask(taskId);
  }, [convexDeleteTask]);

  // No-op adapters for unsupported features
  const addSubtask = useCallback(async () => { }, []);
  const deleteSubtask = useCallback(async () => { }, []);
  const updateSubtaskDueDate = useCallback(async () => { }, []);
  const updateSubtaskTitle = useCallback(async () => { }, []);
  const updateSubtaskPriority = useCallback(async () => { }, []);
  const updateSubtaskEstimatedTime = useCallback(async () => { }, []);
  const updateSubtaskDescription = useCallback(async () => { }, []);
  const updateTaskTitle = useCallback(async () => { }, []);
  const updateTaskDueDate = useCallback(async () => { }, []);
  const updateTaskPriority = useCallback(async () => { }, []);
  const updateTaskTimeEstimate = useCallback(async () => { }, []);
  const updateTaskActualDuration = useCallback(async () => { }, []);
  const pushTaskToAnotherDay = useCallback(async () => { }, []);

  const error = null;

  // Gamification award function
  const awardLightWorkTaskCompletion = useCallback((task: WorkTask) => {
    const priorityMultiplier = getLightWorkPriorityMultiplier(task.priority);
    const baseXP = 20;
    const desiredXP = Math.round(baseXP * priorityMultiplier);

    if (desiredXP <= 0) return;

    const multiplier = desiredXP / baseXP;
    const awarded = GamificationService.awardXP('light_task_complete', multiplier);

    if (import.meta.env.DEV) {
      console.debug(
        `[XP] Light work task complete → priority=${task.priority}, multiplier=${multiplier.toFixed(2)}, awarded=${awarded} XP`
      );
    }
  }, []);

  return (
    <WorkTaskList
      workType="light"
      tasks={tasks}
      loading={loading}
      error={error}
      selectedDate={selectedDate}
      flowProtocol={LIGHT_FLOW_PROTOCOL}
      theme={LIGHT_THEME}
      themeName="LIGHT"
      baseSubtaskMinutes={30}
      onAwardTaskCompletion={awardLightWorkTaskCompletion}
      onToggleTaskCompletion={toggleTaskCompletion}
      onToggleSubtaskCompletion={toggleSubtaskCompletion}
      onCreateTask={createTask}
      onAddSubtask={addSubtask}
      onDeleteTask={deleteTask}
      onDeleteSubtask={deleteSubtask}
      onUpdateSubtaskDueDate={updateSubtaskDueDate}
      onUpdateSubtaskTitle={updateSubtaskTitle}
      onUpdateSubtaskPriority={updateSubtaskPriority}
      onUpdateSubtaskEstimatedTime={updateSubtaskEstimatedTime}
      onUpdateSubtaskDescription={updateSubtaskDescription}
      onUpdateTaskTitle={updateTaskTitle}
      onUpdateTaskDueDate={updateTaskDueDate}
      onUpdateTaskPriority={updateTaskPriority}
      onUpdateTaskTimeEstimate={updateTaskTimeEstimate}
      onPushTaskToAnotherDay={pushTaskToAnotherDay}
      onUpdateTaskActualDuration={updateTaskActualDuration}
      onStartFocusSession={onStartFocusSession}
    />
  );
}
