/**
 * 🚀 Light Focus Work Section - Clean Architecture
 * 
 * Uses dedicated Light Work API and hooks
 * No more workType filtering confusion
 */

import React from 'react';
import { UnifiedWorkSection } from '@/refactored/components/UnifiedWorkSection';
import { useLightWorkTasks } from '@/hooks/useLightWorkTasks';

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
    addSubtask,
    deleteTask,
    deleteSubtask,
    refreshTasks
  } = useLightWorkTasks({ selectedDate });

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
      toggleSubtaskCompletion={async () => {}} // TODO: Implement
      addSubtask={handleAddSubtask}
      deleteTask={deleteTask}
      deleteSubtask={deleteSubtask}
      analyzeTaskWithAI={async () => {}} // TODO: Implement
      pushTaskToAnotherDay={async () => {}} // TODO: Implement
      updateTaskTitle={async () => {}} // TODO: Implement
    />
  );
};