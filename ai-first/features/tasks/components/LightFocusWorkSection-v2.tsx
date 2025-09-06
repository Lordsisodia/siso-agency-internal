/**
 * 🚀 Light Focus Work Section - Clean Architecture
 * 
 * Uses dedicated Light Work API and hooks
 * No more workType filtering confusion
 */

import React from 'react';
import { UnifiedWorkSection } from '@/refactored/components/UnifiedWorkSection';
import { useLightWorkTasksSupabase } from '@/hooks/useLightWorkTasksSupabase';

interface LightFocusWorkSectionProps {
  selectedDate: Date;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate
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
    pushTaskToAnotherDay,
    updateTaskDueDate,
    refreshTasks
  } = useLightWorkTasksSupabase({ selectedDate });

  // Transform data to match UnifiedWorkSection interface
  const transformedTasks = tasks.map(task => ({
    ...task,
    workType: 'LIGHT', // For backward compatibility with UnifiedWorkSection
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

  return (
    <UnifiedWorkSection 
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
      analyzeTaskWithAI={async () => {}} // TODO: Implement (AI feature)
      pushTaskToAnotherDay={pushTaskToAnotherDay}
      updateTaskTitle={updateTaskTitle}
      updateSubtaskDueDate={updateTaskDueDate}
    />
  );
};