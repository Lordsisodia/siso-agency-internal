import React from 'react';
import { UnifiedWorkSection } from '@/refactored/components/UnifiedWorkSection';
import { useTaskDatabase } from '@/ai-first/hooks/useTaskDatabase';

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
    analyzeTaskWithAI,
    pushTaskToAnotherDay,
    updateTaskTitle
  } = useTaskDatabase({ selectedDate });

  return (
    <UnifiedWorkSection 
      selectedDate={selectedDate} 
      workType="DEEP"
      tasks={tasks}
      loading={loading}
      error={error}
      createTask={createTask}
      toggleTaskCompletion={toggleTaskCompletion}
      toggleSubtaskCompletion={toggleSubtaskCompletion}
      addSubtask={addSubtask}
      deleteTask={deleteTask}
      deleteSubtask={deleteSubtask}
      analyzeTaskWithAI={analyzeTaskWithAI}
      pushTaskToAnotherDay={pushTaskToAnotherDay}
      updateTaskTitle={updateTaskTitle}
    />
  );
};