/"use client";

import { useState, useEffect, useCallback } from 'react';
import type { TimeboxTask, Subtask } from '../types';

interface UseTaskFormProps {
  task: TimeboxTask | null;
  isOpen: boolean;
}

interface UseTaskFormReturn {
  editingTask: TimeboxTask | null;
  editingSubtaskId: string | null;
  expandedSubtasks: Set<string>;
  setEditingTask: React.Dispatch<React.SetStateAction<TimeboxTask | null>>;
  setEditingSubtaskId: React.Dispatch<React.SetStateAction<string | null>>;
  toggleSubtaskExpansion: (subtaskId: string) => void;
  toggleSubtaskStatus: (subtaskId: string) => void;
  deleteSubtask: (subtaskId: string) => void;
  updateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void;
  addSubtask: () => void;
  updateTaskField: <K extends keyof TimeboxTask>(field: K, value: TimeboxTask[K]) => void;
  toggleTaskCompletion: () => void;
  getTaskForSave: () => TimeboxTask | null;
}

export const useTaskForm = ({ task, isOpen }: UseTaskFormProps): UseTaskFormReturn => {
  const [editingTask, setEditingTask] = useState<TimeboxTask | null>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

  // Initialize editing state when task changes or modal opens
  useEffect(() => {
    if (task && isOpen) {
      setEditingTask({
        ...task,
        subtasks: task.subtasks || []
      });
      setEditingSubtaskId(null);
    }
  }, [task, isOpen]);

  const toggleSubtaskExpansion = useCallback((subtaskId: string) => {
    setExpandedSubtasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subtaskId)) {
        newSet.delete(subtaskId);
      } else {
        newSet.add(subtaskId);
      }
      return newSet;
    });
  }, []);

  const toggleSubtaskStatus = useCallback((subtaskId: string) => {
    setEditingTask(prev => {
      if (!prev?.subtasks) return prev;

      const updatedSubtasks = prev.subtasks.map(subtask => {
        if (subtask.id === subtaskId) {
          const newStatus = subtask.status === "completed" ? "pending" : "completed";
          return {
            ...subtask,
            status: newStatus,
            completed: newStatus === "completed"
          };
        }
        return subtask;
      });
      return { ...prev, subtasks: updatedSubtasks };
    });
  }, []);

  const deleteSubtask = useCallback((subtaskId: string) => {
    setEditingTask(prev => {
      if (!prev?.subtasks) return prev;

      const updatedSubtasks = prev.subtasks.filter(s => s.id !== subtaskId);
      return { ...prev, subtasks: updatedSubtasks };
    });

    if (editingSubtaskId === subtaskId) {
      setEditingSubtaskId(null);
    }
  }, [editingSubtaskId]);

  const updateSubtask = useCallback((subtaskId: string, updates: Partial<Subtask>) => {
    setEditingTask(prev => {
      if (!prev?.subtasks) return prev;

      const updatedSubtasks = prev.subtasks.map(subtask => {
        if (subtask.id === subtaskId) {
          return { ...subtask, ...updates };
        }
        return subtask;
      });
      return { ...prev, subtasks: updatedSubtasks };
    });
  }, []);

  const addSubtask = useCallback(() => {
    setEditingTask(prev => {
      if (!prev) return prev;

      const newSubtask: Subtask = {
        id: `${prev.id}-${Date.now()}`,
        title: "New subtask",
        description: "",
        status: "pending",
        priority: "medium",
        estimatedTime: "30min",
        tools: [],
        completed: false
      };

      return {
        ...prev,
        subtasks: [...(prev.subtasks || []), newSubtask]
      };
    });

    // Set the new subtask to editing mode
    setEditingSubtaskId(`${editingTask?.id}-${Date.now()}`);
  }, [editingTask?.id]);

  const updateTaskField = useCallback(<K extends keyof TimeboxTask>(
    field: K,
    value: TimeboxTask[K]
  ) => {
    setEditingTask(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const toggleTaskCompletion = useCallback(() => {
    setEditingTask(prev => prev ? { ...prev, completed: !prev.completed } : prev);
  }, []);

  const getTaskForSave = useCallback(() => editingTask, [editingTask]);

  return {
    editingTask,
    editingSubtaskId,
    expandedSubtasks,
    setEditingTask,
    setEditingSubtaskId,
    toggleSubtaskExpansion,
    toggleSubtaskStatus,
    deleteSubtask,
    updateSubtask,
    addSubtask,
    updateTaskField,
    toggleTaskCompletion,
    getTaskForSave
  };
};

export default useTaskForm;
