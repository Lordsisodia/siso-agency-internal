/**
 * 🚀 Light Focus Work Section - Clean Architecture
 * 
 * Uses dedicated Light Work API and hooks
 * No more workType filtering confusion
 */

import React from 'react';
import { UnifiedWorkSection } from '@/domains/tasks/components/UnifiedWorkSection';
import { TaskHeaderDashboard as TaskHeader } from '@/components/shared/ui';
import { useLightWorkTasksSupabase } from '@/domains/tasks/hooks/useLightWorkTasksSupabase';

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
    updateTask,
    pushTaskToAnotherDay,
    updateTaskDueDate,
    updateSubtaskDueDate,
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

  const handleUpdateTaskPriority = async (taskId: string, priority: string) => {
    if (updateTask) {
      await updateTask(taskId, { priority: priority.toUpperCase() });
    }
  };

  const handleUpdateSubtaskPriority = async (subtaskId: string, priority: string) => {
    if (updateTask) {
      // Find the task containing this subtask and update it
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
    // Update task order in state/database
    console.log('Reordering tasks:', reorderedTasks);
    // TODO: Implement actual reordering logic when backend supports it
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header with "Super Light Work" title and controls */}
      <TaskHeader
        onAddTask={() => createTask({ title: 'New Task', description: '', priority: 'MEDIUM' })}
        onFilterChange={(filter) => console.log('Filter:', filter)}
        onExport={() => console.log('Export tasks')}
      />

      {/* Main Task Management Section */}
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
        updateSubtaskDueDate={updateSubtaskDueDate}
        updateTaskPriority={handleUpdateTaskPriority}
        updateSubtaskPriority={handleUpdateSubtaskPriority}
        reorderTasks={handleReorderTasks}
      />
    </div>
  );
};