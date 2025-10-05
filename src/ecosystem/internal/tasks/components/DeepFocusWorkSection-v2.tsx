/**
 * 🚀 Deep Focus Work Section - Clean Architecture
 * 
 * Uses dedicated Deep Work API and hooks
 * No more workType filtering confusion
 */

import React from 'react';
import { UnifiedWorkSection } from '@/ecosystem/internal/tasks/components/UnifiedWorkSection';
import { useDeepWorkTasksSupabase } from '@/ecosystem/internal/tasks/hooks/useDeepWorkTasksSupabase';

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
  } = useDeepWorkTasksSupabase({ selectedDate });

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
    // Deep work subtasks default to high priority
    return await addSubtask(taskId, subtaskTitle, 'HIGH');
  };

  const handleUpdateTaskPriority = async (taskId: string, priority: string) => {
    if (updateTask) {
      await updateTask(taskId, { priority: priority.toUpperCase() });
    }
  };

  const handleReorderTasks = async (reorderedTasks: any[]) => {
    // Update task order in state/database
    console.log('Reordering deep work tasks:', reorderedTasks);
    // TODO: Implement actual reordering logic when backend supports it
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
      toggleSubtaskCompletion={toggleSubtaskCompletion}
      addSubtask={handleAddSubtask}
      deleteTask={deleteTask}
      deleteSubtask={deleteSubtask}
      analyzeTaskWithAI={async () => {}} // TODO: Implement (AI feature)
      pushTaskToAnotherDay={pushTaskToAnotherDay}
      updateTaskTitle={updateTaskTitle}
      updateSubtaskDueDate={updateSubtaskDueDate}
      updateTaskPriority={handleUpdateTaskPriority}
      reorderTasks={handleReorderTasks}
    />
  );
};