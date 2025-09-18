/**
 * 📝 useTaskEditing Hook
 * 
 * Manages all task and subtask editing state and operations
 * Handles inline editing, subtask creation, and keyboard shortcuts
 */

import { useState } from 'react';

interface UseTaskEditingProps {
  addSubtask: (taskId: string, title: string) => Promise<void>;
  updateTaskTitle: (taskId: string, title: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  pushTaskToAnotherDay: (taskId: string, date: string) => Promise<void>;
  selectedDate: Date;
}

export const useTaskEditing = ({
  addSubtask,
  updateTaskTitle,
  deleteTask,
  pushTaskToAnotherDay,
  selectedDate
}: UseTaskEditingProps) => {
  // Task editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  
  // Subtask editing state
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  
  // Subtask creation state
  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Other state
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [calendarSubtaskId, setCalendarSubtaskId] = useState<string | null>(null);

  // Task editing functions
  const startEditingTask = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditTaskTitle(currentTitle);
  };

  const saveTaskEdit = async (taskId: string) => {
    if (editTaskTitle.trim()) {
      try {
        await updateTaskTitle(taskId, editTaskTitle.trim());
      } catch (error) {
        console.error('Failed to update task title:', error);
      }
    }
    setEditingTaskId(null);
    setEditTaskTitle('');
  };

  // Subtask editing functions
  const startEditingSubtask = (subtaskId: string, currentTitle: string) => {
    setEditingSubtaskId(subtaskId);
    setEditSubtaskTitle(currentTitle);
  };

  const saveSubtaskEdit = (taskId: string, subtaskId: string) => {
    console.warn('⚠️ Subtask title editing not yet implemented with database persistence');
    setEditingSubtaskId(null);
    setEditSubtaskTitle('');
  };

  // Subtask creation functions
  const startAddingSubtask = (taskId: string) => {
    setAddingSubtaskToId(taskId);
    setNewSubtaskTitle('');
  };

  const saveNewSubtask = async (taskId: string) => {
    if (!newSubtaskTitle.trim()) {
      setAddingSubtaskToId(null);
      return;
    }
    
    try {
      await addSubtask(taskId, newSubtaskTitle.trim());
      setAddingSubtaskToId(null);
      setNewSubtaskTitle('');
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const cancelAddingSubtask = () => {
    setAddingSubtaskToId(null);
    setNewSubtaskTitle('');
  };

  // Task operations
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handlePushToAnotherDay = async (taskId: string) => {
    try {
      const tomorrow = new Date(selectedDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      await pushTaskToAnotherDay(taskId, tomorrowStr);
    } catch (error) {
      console.error('Failed to push task to another day:', error);
    }
  };

  // Cancel all editing
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingSubtaskId(null);
    setEditTaskTitle('');
    setEditSubtaskTitle('');
    cancelAddingSubtask();
  };

  // Keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent, type: 'task' | 'subtask' | 'newSubtask', taskId: string, subtaskId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'task') {
        saveTaskEdit(taskId);
      } else if (type === 'subtask' && subtaskId) {
        saveSubtaskEdit(taskId, subtaskId);
      } else if (type === 'newSubtask') {
        saveNewSubtask(taskId);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (type === 'newSubtask') {
        cancelAddingSubtask();
      } else {
        cancelEdit();
      }
    }
  };

  return {
    // Task editing state
    editingTaskId,
    editTaskTitle,
    setEditTaskTitle,
    
    // Subtask editing state
    editingSubtaskId,
    editSubtaskTitle,
    setEditSubtaskTitle,
    
    // Subtask creation state
    addingSubtaskToId,
    newSubtaskTitle,
    setNewSubtaskTitle,
    
    // Other state
    viewingTaskId,
    setViewingTaskId,
    calendarSubtaskId,
    setCalendarSubtaskId,

    // Functions
    startEditingTask,
    saveTaskEdit,
    startEditingSubtask,
    saveSubtaskEdit,
    startAddingSubtask,
    saveNewSubtask,
    cancelAddingSubtask,
    handleDeleteTask,
    handlePushToAnotherDay,
    cancelEdit,
    handleKeyDown
  };
};