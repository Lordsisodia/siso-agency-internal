import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { LightWorkItem, LightWorkSubTask } from '../types';

const defaultLightWorkTasks: LightWorkItem[] = [
  { 
    id: '1', 
    title: 'Email & Communications', 
    description: 'Handle routine communications and administrative tasks.',
    status: 'pending',
    completed: false,
    duration: 30,
    category: 'communication',
    subTasks: [
      { id: '1a', title: 'Check and respond to priority emails', status: 'pending', completed: false },
      { id: '1b', title: 'Review messages and notifications', status: 'pending', completed: false },
      { id: '1c', title: 'Send follow-up communications', status: 'pending', completed: false }
    ]
  },
  { 
    id: '2', 
    title: 'Administrative Tasks',
    description: 'Complete necessary administrative and organizational work.',
    status: 'pending',
    completed: false,
    duration: 45,
    category: 'admin',
    subTasks: [
      { id: '2a', title: 'Update project status', status: 'pending', completed: false },
      { id: '2b', title: 'Review and organize files', status: 'pending', completed: false },
      { id: '2c', title: 'Schedule appointments/meetings', status: 'pending', completed: false },
      { id: '2d', title: 'Process invoices or payments', status: 'pending', completed: false }
    ]
  },
  { 
    id: '3', 
    title: 'Quick Wins',
    description: 'Small tasks that provide immediate value and momentum.',
    status: 'pending',
    completed: false,
    duration: 30,
    category: 'quick-wins',
    subTasks: [
      { id: '3a', title: 'Complete pending small tasks', status: 'pending', completed: false },
      { id: '3b', title: 'Make quick decisions on waiting items', status: 'pending', completed: false },
      { id: '3c', title: 'Update task lists and priorities', status: 'pending', completed: false }
    ]
  },
  { 
    id: '4', 
    title: 'Learning & Research',
    description: 'Light research, reading, or skill development activities.',
    status: 'pending',
    completed: false,
    duration: 30,
    category: 'learning',
    logField: 'Log learning topic: ____',
    subTasks: [
      { id: '4a', title: 'Read industry articles or news', status: 'pending', completed: false },
      { id: '4b', title: 'Watch educational content', status: 'pending', completed: false },
      { id: '4c', title: 'Take notes on key insights', status: 'pending', completed: false }
    ]
  },
  { 
    id: '5', 
    title: 'Planning & Review',
    description: 'Light planning and review activities for next work sessions.',
    status: 'pending',
    completed: false,
    duration: 20,
    category: 'planning',
    subTasks: [
      { id: '5a', title: 'Review today\'s progress', status: 'pending', completed: false },
      { id: '5b', title: 'Plan tomorrow\'s priorities', status: 'pending', completed: false },
      { id: '5c', title: 'Adjust weekly goals if needed', status: 'pending', completed: false }
    ]
  }
];

export interface UseLightWorkManagerReturn {
  // State
  lightWorkTasks: LightWorkItem[];
  expandedTasks: string[];
  isAddingTask: boolean;
  isAddingTaskInline: boolean;
  isAddingSubtask: string | null;
  newTaskTitle: string;
  newTaskDescription: string;
  newInlineTaskTitle: string;
  newSubtaskTitle: string;
  prefersReducedMotion: boolean;

  // State setters
  setExpandedTasks: React.Dispatch<React.SetStateAction<string[]>>;
  setIsAddingTask: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddingTaskInline: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddingSubtask: React.Dispatch<React.SetStateAction<string | null>>;
  setNewTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setNewTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setNewInlineTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setNewSubtaskTitle: React.Dispatch<React.SetStateAction<string>>;

  // Actions
  toggleTaskExpansion: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  toggleSubtaskStatus: (taskId: string, subtaskId: string) => void;
  addNewTask: () => void;
  addNewTaskInline: () => void;
  addNewSubtask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
}

export const useLightWorkManager = (selectedDate: Date): UseLightWorkManagerReturn => {
  const [lightWorkTasks, setLightWorkTasks] = useState<LightWorkItem[]>(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const saved = localStorage.getItem(`lifelock-${dateKey}-enhancedLightWorkTasks`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse enhanced light work data, using defaults');
        return defaultLightWorkTasks;
      }
    }
    return defaultLightWorkTasks;
  });

  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingTaskInline, setIsAddingTaskInline] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newInlineTaskTitle, setNewInlineTaskTitle] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Add support for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

  // Save to localStorage whenever tasks change
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`lifelock-${dateKey}-enhancedLightWorkTasks`, JSON.stringify(lightWorkTasks));
  }, [lightWorkTasks, selectedDate]);

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Toggle task status with enhanced status cycle
  const toggleTaskStatus = (taskId: string) => {
    setLightWorkTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const statuses: Array<'pending' | 'in-progress' | 'completed' | 'need-help' | 'failed'> = 
          ['pending', 'in-progress', 'completed', 'need-help', 'failed'];
        const currentIndex = statuses.indexOf(task.status);
        const newStatus = statuses[(currentIndex + 1) % statuses.length];
        
        // Update subtasks when main task is completed
        const updatedSubTasks = task.subTasks.map(sub => ({
          ...sub,
          status: newStatus === 'completed' ? 'completed' as const : sub.status,
          completed: newStatus === 'completed' ? true : sub.completed
        }));

        return {
          ...task,
          status: newStatus,
          completed: newStatus === 'completed',
          subTasks: updatedSubTasks
        };
      }
      return task;
    }));
  };

  // Toggle subtask status
  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    setLightWorkTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedSubTasks = task.subTasks.map(sub => {
          if (sub.id === subtaskId) {
            const newStatus = sub.status === 'completed' ? 'pending' as const : 'completed' as const;
            return { 
              ...sub, 
              status: newStatus,
              completed: newStatus === 'completed'
            };
          }
          return sub;
        });

        // Auto-complete main task if all subtasks are completed
        const allSubTasksCompleted = updatedSubTasks.every(sub => sub.status === 'completed');
        
        return {
          ...task,
          subTasks: updatedSubTasks,
          status: allSubTasksCompleted ? 'completed' : task.status,
          completed: allSubTasksCompleted
        };
      }
      return task;
    }));
  };

  // Add new task
  const addNewTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: LightWorkItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      status: 'pending',
      completed: false,
      duration: 30,
      category: 'quick-wins',
      subTasks: []
    };

    setLightWorkTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAddingTask(false);
  };

  // Add new task inline (like subtask functionality)
  const addNewTaskInline = () => {
    if (!newInlineTaskTitle.trim()) return;
    
    const newTask: LightWorkItem = {
      id: `task-${Date.now()}`,
      title: newInlineTaskTitle,
      status: 'pending',
      completed: false,
      duration: 30,
      category: 'quick-wins',
      subTasks: []
    };

    setLightWorkTasks(prev => [...prev, newTask]);
    setNewInlineTaskTitle('');
    setIsAddingTaskInline(false);
  };

  // Add new subtask
  const addNewSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: LightWorkSubTask = {
      id: `${taskId}-subtask-${Date.now()}`,
      title: newSubtaskTitle,
      status: 'pending',
      completed: false
    };

    setLightWorkTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, subTasks: [...task.subTasks, newSubtask] }
        : task
    ));

    setNewSubtaskTitle('');
    setIsAddingSubtask(null);
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setLightWorkTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Delete subtask
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setLightWorkTasks(prev => prev.map(task => 
      task.id === taskId
        ? { ...task, subTasks: task.subTasks.filter(sub => sub.id !== subtaskId) }
        : task
    ));
  };

  return {
    // State
    lightWorkTasks,
    expandedTasks,
    isAddingTask,
    isAddingTaskInline,
    isAddingSubtask,
    newTaskTitle,
    newTaskDescription,
    newInlineTaskTitle,
    newSubtaskTitle,
    prefersReducedMotion,

    // State setters
    setExpandedTasks,
    setIsAddingTask,
    setIsAddingTaskInline,
    setIsAddingSubtask,
    setNewTaskTitle,
    setNewTaskDescription,
    setNewInlineTaskTitle,
    setNewSubtaskTitle,

    // Actions
    toggleTaskExpansion,
    toggleTaskStatus,
    toggleSubtaskStatus,
    addNewTask,
    addNewTaskInline,
    addNewSubtask,
    deleteTask,
    deleteSubtask
  };
};