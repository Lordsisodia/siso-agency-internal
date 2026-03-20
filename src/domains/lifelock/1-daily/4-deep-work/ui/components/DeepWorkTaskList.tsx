"use client";

/**
 * 🧠 Deep Work Task List - Wired to Convex
 *
 * Uses the shared WorkTaskList component with DEEP theme
 */

import React, { useMemo, useCallback } from "react";
import { WorkTaskList, WorkTask } from "@/domains/lifelock/1-daily/_shared/components/WorkTaskList";
import { DEEP_THEME } from "@/domains/lifelock/1-daily/_shared/components/UnifiedTaskCard";
import {
  useDeepWorkConvexTasks,
  useCreateTask,
  useUpdateTaskStatus,
  useCompleteTask,
  useDeleteTask,
  ConvexTask,
} from "@/domains/lifelock/_shared/hooks/useConvexTasks";
import { useClientsList } from "@/domains/clients/hooks/useClientsList";
import { GamificationService } from "@/domains/lifelock/_shared/services/gamificationService";
import { getDeepWorkPriorityMultiplier } from "@/domains/lifelock/1-daily/_shared/utils/taskXpCalculations";
import { useGamificationInit } from "@/domains/lifelock/_shared/hooks/useGamificationInit";

interface DeepWorkTaskListProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date;
}

const DEEP_FLOW_PROTOCOL = {
  title: "Deep Work Tasks",
  subtitle: "Deep Focus Work",
  description: "Deep work sessions require your highest cognitive capacity and total focus. These blocks are designed for your most challenging, high-value work that creates breakthrough results.",
  rules: [
    "• Zero interruptions - total focus required",
    "• Phone on Do Not Disturb mode",
    "• Work in 90-minute intense cycles",
    "• No social media or quick email checks"
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
    focusIntensity: 4 as 1 | 2 | 3 | 4,
    dueDate: task.dueDate || null,
    timeEstimate: task.estimatedMinutes ? `${task.estimatedMinutes}m` : null,
    actualDurationMin: task.actualMinutes,
  }));
}

export default function DeepWorkTaskList({ onStartFocusSession, selectedDate = new Date() }: DeepWorkTaskListProps) {
  // Initialize gamification system
  useGamificationInit();

  // Fetch clients for badges
  const { clients } = useClientsList();
  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => {
      map.set(client.id, client.business_name || client.full_name || 'Unnamed Client');
    });
    return map;
  }, [clients]);

  // Gamification award function
  const awardDeepWorkTaskCompletion = useCallback((task: WorkTask) => {
    const priorityMultiplier = getDeepWorkPriorityMultiplier(task.priority);
    const baseXP = 30;
    const desiredXP = Math.round(baseXP * priorityMultiplier);

    if (desiredXP <= 0) return;

    const multiplier = desiredXP / baseXP;
    const awarded = GamificationService.awardXP('deep_task_complete', multiplier);

    if (import.meta.env.DEV) {
      console.debug(
        `[XP] Deep work task complete → priority=${task.priority}, multiplier=${multiplier.toFixed(2)}, awarded=${awarded} XP`
      );
    }
  }, []);

  // Use Convex hooks for Deep Work tasks
  const { tasks: rawTasks, isLoading: loading } = useDeepWorkConvexTasks();
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
      const priorityMultiplier = getDeepWorkPriorityMultiplier(task.priority || 'medium');
      const baseXP = 30;
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
      title: task.title || "New Deep Work Task",
      description: task.description,
      taskType: 'deep',
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

  return (
    <WorkTaskList
      workType="deep"
      tasks={tasks}
      loading={loading}
      error={error}
      selectedDate={selectedDate}
      flowProtocol={DEEP_FLOW_PROTOCOL}
      theme={DEEP_THEME}
      themeName="DEEP"
      baseSubtaskMinutes={45}
      clientMap={clientMap}
      onAwardTaskCompletion={awardDeepWorkTaskCompletion}
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
