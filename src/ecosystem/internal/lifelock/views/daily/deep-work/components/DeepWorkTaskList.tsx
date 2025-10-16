"use client";

import React, { useMemo } from "react";
import {
  WorkTask,
  WorkTaskListShell,
  WorkTaskListTheme,
} from "@/ecosystem/internal/lifelock/views/daily/_shared/components/WorkTaskListShell";
import {
  useDeepWorkTasksSupabase,
  DeepWorkTask,
} from "@/ecosystem/internal/tasks/hooks/useDeepWorkTasksSupabase";

interface DeepWorkTaskListProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date;
}

const deepWorkTheme: WorkTaskListTheme = {
  title: "🧠 Deep Work Sessions",
  subtitle: "Deep Focus Work",
  description:
    "Deep work sessions require sustained focus without interruption. These blocks are designed for your most important, cognitively demanding work that creates maximum value.",
  rules: [
    "• No interruptions or task switching allowed",
    "• Phone on airplane mode or Do Not Disturb",
    "• Work in 2-4 hour focused blocks",
    "• Deep cognitive work only",
  ],
  storageKeyPrefix: "deepwork",
  palette: "blue",
  newTaskTitle: "New Deep Work Task",
  subtaskTheme: {
    text: "text-blue-400",
    border: "border-blue-400",
    input: "border-gray-600 focus:border-blue-400",
    textSecondary: "text-blue-300",
  },
};

const transformDeepWorkTasks = (tasks: DeepWorkTask[]): WorkTask[] =>
  tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: (task.priority || "MEDIUM").toLowerCase() as WorkTask["priority"],
    level: 0,
    dependencies: [],
    focusIntensity: (task.focusBlocks || 2) as 1 | 2 | 3 | 4,
    context: "coding",
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

export default function DeepWorkTaskList({
  onStartFocusSession,
  selectedDate = new Date(),
}: DeepWorkTaskListProps) {
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
  } = useDeepWorkTasksSupabase({ selectedDate });

  const tasks = useMemo(() => transformDeepWorkTasks(rawTasks), [rawTasks]);

  return (
    <WorkTaskListShell
      onStartFocusSession={onStartFocusSession}
      selectedDate={selectedDate}
      theme={deepWorkTheme}
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
