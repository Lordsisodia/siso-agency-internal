"use client";

/**
 * 🧠 Deep Work Task List - Thin wrapper around WorkTaskList
 *
 * Uses the shared WorkTaskList component with DEEP theme
 */

import React, { useMemo, useCallback } from "react";
import { WorkTaskList, WorkTask } from "@/domains/lifelock/1-daily/_shared/components/WorkTaskList";
import { DEEP_THEME } from "@/domains/lifelock/1-daily/_shared/components/UnifiedTaskCard";
import { useDeepWorkTasksSupabase, DeepWorkTask } from "@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase";
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

function transformToWorkTasks(tasks: DeepWorkTask[]): WorkTask[] {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: (task.priority || 'MEDIUM').toLowerCase(),
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.text || subtask.title,
      status: subtask.completed ? "completed" : "pending",
      priority: subtask.priority || "medium",
      estimatedTime: subtask.estimatedTime,
      tools: [],
      completed: subtask.completed,
      dueDate: subtask.dueDate
    })),
    focusIntensity: (task.focusBlocks || 4) as 1 | 2 | 3 | 4,
    dueDate: task.dueDate || task.taskDate || null,
    timeEstimate: task.timeEstimate || null,
    actualDurationMin: task.actualDurationMin,
    clientId: task.clientId ?? undefined
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
  const awardDeepWorkTaskCompletion = useCallback((task: DeepWorkTask) => {
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

  // Use Deep Work Supabase hook
  const {
    tasks: rawTasks,
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
    updateSubtaskPriority,
    updateSubtaskEstimatedTime,
    updateSubtaskDescription,
    updateTaskTitle,
    updateTaskDueDate,
    updateTaskPriority,
    updateTaskTimeEstimate,
    updateTaskActualDuration,
    pushTaskToAnotherDay
  } = useDeepWorkTasksSupabase({ selectedDate });

  // Transform data
  const tasks = useMemo(() => transformToWorkTasks(rawTasks), [rawTasks]);

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
