/**
 * 🚀 Light Focus Work Section - Clean Architecture
 *
 * Uses dedicated Light Work API and hooks
 * No more workType filtering confusion
 */

import React from 'react';
import { LightWorkTaskList } from './components/LightWorkTaskList';
import { useLightWorkTasksSupabase } from '@/ecosystem/internal/tasks/hooks/useLightWorkTasksSupabase';

interface LightFocusWorkSectionProps {
  selectedDate: Date;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate,
  onPreviousDate,
  onNextDate
}) => {
  const {
    tasks,
    loading,
    error,
    createTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    addSubtask,
    deleteTask,
    deleteSubtask,
    updateTaskTitle,
    updateTask,
    pushTaskToAnotherDay,
    updateTaskDueDate,
    updateSubtaskDueDate,
    refreshTasks
  } = useLightWorkTasksSupabase({ selectedDate });

  // Transform data to match UnifiedWorkSection interface
  const transformedTasks = tasks.map(task => ({
    ...task,
    workType: 'LIGHT',
    subtasks: task.subtasks.map(subtask => ({
      ...subtask,
      workType: 'LIGHT'
    }))
  }));

  const handleCreateTask = async (taskData: any) => {
    return await createTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'MEDIUM',
      estimatedDuration: taskData.estimatedDuration,
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || []
    });
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    return await toggleTaskCompletion(taskId);
  };

  const handleAddSubtask = async (taskId: string, subtaskTitle: string) => {
    return await addSubtask(taskId, subtaskTitle, 'Med');
  };

  const handleUpdateTaskPriority = async (taskId: string, priority: string) => {
    if (updateTask) {
      await updateTask(taskId, { priority: priority.toUpperCase() });
    }
  };

  const handleUpdateSubtaskPriority = async (subtaskId: string, priority: string) => {
    if (updateTask) {
      const taskWithSubtask = tasks.find(task =>
        task.subtasks.some(subtask => subtask.id === subtaskId)
      );
      if (taskWithSubtask) {
        const updatedSubtasks = taskWithSubtask.subtasks.map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, priority: priority.toUpperCase() }
            : subtask
        );
        await updateTask(taskWithSubtask.id, { subtasks: updatedSubtasks });
      }
    }
  };

  const handleReorderTasks = async (reorderedTasks: any[]) => {
    console.log('Reordering tasks:', reorderedTasks);
  };

  return (
    <LightWorkTaskList
      selectedDate={selectedDate}
      workType="LIGHT"
      tasks={transformedTasks}
      loading={loading}
      error={error}
      createTask={handleCreateTask}
      toggleTaskCompletion={handleToggleTaskCompletion}
      toggleSubtaskCompletion={toggleSubtaskCompletion}
      addSubtask={handleAddSubtask}
      deleteTask={deleteTask}
      deleteSubtask={deleteSubtask}
      analyzeTaskWithAI={async () => {}}
      pushTaskToAnotherDay={pushTaskToAnotherDay}
      updateTaskTitle={updateTaskTitle}
      updateSubtaskDueDate={updateSubtaskDueDate}
      updateTaskPriority={handleUpdateTaskPriority}
      updateSubtaskPriority={handleUpdateSubtaskPriority}
      reorderTasks={handleReorderTasks}
    />
  );
};
