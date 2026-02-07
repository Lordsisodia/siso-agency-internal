"use client";

/**
 * 🌱 Light Work Task List - Thin wrapper around WorkTaskList
 *
 * Uses the shared WorkTaskList component with LIGHT theme
 */

import React, { useCallback, useMemo } from "react";
import { WorkTaskList, WorkTask } from "@/domains/lifelock/1-daily/_shared/components/WorkTaskList";
import { LIGHT_THEME } from "@/domains/lifelock/1-daily/_shared/components/UnifiedTaskCard";
import { useLightWorkTasksSupabase, LightWorkTask } from "@/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase";
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

function transformToWorkTasks(tasks: LightWorkTask[]): WorkTask[] {
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
    focusIntensity: (task.focusBlocks || 2) as 1 | 2 | 3 | 4,
    dueDate: task.dueDate || task.currentDate || null,
    timeEstimate: task.timeEstimate || null,
    actualDurationMin: task.actualDurationMin
  }));
}

export default function LightWorkTaskList({ onStartFocusSession, selectedDate = new Date() }: LightWorkTaskListProps) {
  // Initialize gamification system
  useGamificationInit();

  // Use Light Work Supabase hook
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
  } = useLightWorkTasksSupabase({ selectedDate });

  // Transform data
  const tasks = useMemo(() => transformToWorkTasks(rawTasks), [rawTasks]);

  // Gamification award function
  const awardLightWorkTaskCompletion = useCallback((task: LightWorkTask) => {
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
