/**
 * TaskDetailContext - Controls visibility of task detail modal
 * Used to hide bottom nav when task detail is open
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TaskDetailContextType {
  isTaskDetailOpen: boolean;
  openTaskDetail: () => void;
  closeTaskDetail: () => void;
}

const TaskDetailContext = createContext<TaskDetailContextType | undefined>(undefined);

export const TaskDetailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const openTaskDetail = useCallback(() => setIsTaskDetailOpen(true), []);
  const closeTaskDetail = useCallback(() => setIsTaskDetailOpen(false), []);

  return (
    <TaskDetailContext.Provider value={{ isTaskDetailOpen, openTaskDetail, closeTaskDetail }}>
      {children}
    </TaskDetailContext.Provider>
  );
};

export const useTaskDetail = () => {
  const context = useContext(TaskDetailContext);
  if (context === undefined) {
    throw new Error('useTaskDetail must be used within a TaskDetailProvider');
  }
  return context;
};
