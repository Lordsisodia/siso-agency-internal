"use client";

import React, { useMemo } from "react";
import {
  WorkTask,
  WorkTaskListShell,
  WorkTaskListTheme,
} from "@/ecosystem/internal/lifelock/views/daily/_shared/components/WorkTaskListShell";
import {
  useLightWorkTasksSupabase,
  LightWorkTask,
} from "@/ecosystem/internal/tasks/hooks/useLightWorkTasksSupabase";

interface LightWorkTaskListProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date;
}

const lightWorkTheme: WorkTaskListTheme = {
  title: "🌱 Light Work Tasks",
  subtitle: "Light Focus Work",
  description:
    "Light work sessions require focused attention without deep cognitive load. These blocks are designed for your routine, administrative, and quick-turnaround work that creates steady progress.",
  rules: [
    "• Light interruptions allowed for urgent matters",
    "• Phone on normal mode - check periodically",
    "• Work in 1-2 hour focused blocks",
    "• Quick breaks encouraged between tasks",
  ],
  storageKeyPrefix: "lightwork",
  palette: "green",
  newTaskTitle: "New Light Work Task",
  subtaskTheme: {
    text: "text-green-400",
    border: "border-green-400",
    input: "border-gray-600 focus:border-green-400",
    textSecondary: "text-green-300",
  },
};

const transformLightWorkTasks = (tasks: LightWorkTask[]): WorkTask[] =>
  tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: (task.priority || "MEDIUM").toLowerCase() as WorkTask["priority"],
    level: 0,
    dependencies: [],
    focusIntensity: 2,
    context: "operations",
    dueDate: task.dueDate || task.currentDate || task.createdAt,
    timeEstimate: task.timeEstimate || null,
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.text || subtask.title,
      status: subtask.completed ? "completed" : "pending",
      priority: subtask.priority || "medium",
      estimatedTime: subtask.estimatedTime,
      tools: [],
      completed: subtask.completed,
      dueDate: subtask.dueDate,
    })),
  }));

export default function LightWorkTaskList({
  onStartFocusSession,
  selectedDate = new Date(),
}: LightWorkTaskListProps) {
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
    refreshTasks,
  } = useLightWorkTasksSupabase({ selectedDate });

  const tasks = useMemo(() => transformLightWorkTasks(rawTasks), [rawTasks]);

  return (
    <WorkTaskListShell
      onStartFocusSession={onStartFocusSession}
      selectedDate={selectedDate}
      theme={lightWorkTheme}
      tasks={tasks}
      loading={loading}
      error={error}
      handlers={{
        createTask,
        toggleTaskCompletion,
        toggleSubtaskCompletion,
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
        refreshTasks,
      }}
    />
  );
}
