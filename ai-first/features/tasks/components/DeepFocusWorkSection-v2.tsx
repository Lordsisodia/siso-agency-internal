/**
 * 🚀 Deep Focus Work Section - Clean Architecture
 * 
 * Uses dedicated Deep Work API and hooks
 * No more workType filtering confusion
 */

import React from 'react';
import { UnifiedWorkSection } from '@/refactored/components/UnifiedWorkSection';
import { useDeepWorkTasks } from '@/hooks/useDeepWorkTasks';

interface DeepFocusWorkSectionProps {
  selectedDate: Date;
}

export const DeepFocusWorkSection: React.FC<DeepFocusWorkSectionProps> = ({
  selectedDate
}) => {
  const {
    tasks,
    loading,
    error,
    createTask,
    toggleTaskCompletion,
    addSubtask,
    refreshTasks
  } = useDeepWorkTasks({ selectedDate });

  // Transform data to match UnifiedWorkSection interface
  const transformedTasks = tasks.map(task => ({
    ...task,
    workType: 'DEEP', // For backward compatibility with UnifiedWorkSection
    subtasks: task.subtasks.map(subtask => ({
      ...subtask,
      workType: 'DEEP'
    }))
  }));

  const handleCreateTask = async (taskData: any) => {
    return await createTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'HIGH',
      estimatedDuration: taskData.estimatedDuration || 120, // Default 2 hours for deep work
      focusBlocks: taskData.focusBlocks || 1,
      breakDuration: taskData.breakDuration || 15,
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || []
    });
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    return await toggleTaskCompletion(taskId);
  };

  const handleAddSubtask = async (taskId: string, subtaskTitle: string) => {
    // Deep work subtasks default to high priority and complexity 3
    return await addSubtask(taskId, subtaskTitle, 'High', 3);
  };

  return (
    <UnifiedWorkSection 
      selectedDate={selectedDate} 
      workType="DEEP"
      tasks={transformedTasks}
      loading={loading}
      error={error}
      createTask={handleCreateTask}
      toggleTaskCompletion={handleToggleTaskCompletion}
      toggleSubtaskCompletion={async () => {}} // TODO: Implement
      addSubtask={handleAddSubtask}
      deleteTask={async () => {}} // TODO: Implement
      deleteSubtask={async () => {}} // TODO: Implement
      analyzeTaskWithAI={async () => {}} // TODO: Implement
      pushTaskToAnotherDay={async () => {}} // TODO: Implement
      updateTaskTitle={async () => {}} // TODO: Implement
    />
  );
};