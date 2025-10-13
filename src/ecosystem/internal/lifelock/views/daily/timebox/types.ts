/**
 * Timebox Section - Type Definitions
 */

import { TimeBlockCategory } from '@/api/timeblocksApi.offline';

// Enhanced task data structure for timeline
export interface TimeboxTask {
  id: string;
  title: string;
  startTime: string; // "09:30"
  endTime: string;   // "11:00"
  duration: number;  // minutes
  category: 'morning' | 'deep-work' | 'light-work' | 'wellness' | 'admin';
  description?: string;
  completed: boolean;
  color: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  intensity?: 'light' | 'moderate' | 'intense' | 'maximum';
}

// Category-specific styling
export interface CategoryStyles {
  border: string;
  shadow: string;
  glow: string;
  accent: string;
}

// Form editing state
export interface EditingBlock {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: TimeBlockCategory;
  notes: string;
}

// Task position for timeline rendering
export interface TaskPosition {
  top: number;
  height: number;
  duration: number;
}

// Category mapping helpers
export const mapCategoryToUI = (dbCategory: TimeBlockCategory): string => {
  const categoryMap: Record<TimeBlockCategory, string> = {
    DEEP_WORK: 'deep-work',
    LIGHT_WORK: 'light-work', 
    MEETING: 'admin',
    BREAK: 'wellness',
    PERSONAL: 'wellness',
    HEALTH: 'wellness',
    LEARNING: 'light-work',
    ADMIN: 'admin'
  };
  return categoryMap[dbCategory] || 'admin';
};

export const mapUIToCategory = (uiCategory: string): TimeBlockCategory => {
  const uiMap: Record<string, TimeBlockCategory> = {
    'deep-work': 'DEEP_WORK',
    'light-work': 'LIGHT_WORK',
    'admin': 'ADMIN',
    'wellness': 'PERSONAL',
    'morning': 'PERSONAL'
  };
  return uiMap[uiCategory] || 'ADMIN';
};

// Enhanced category-specific styling helper
export const getCategoryStyles = (
  category: TimeboxTask['category'],
  completed: boolean
): CategoryStyles => {
  const baseStyles = {
    morning: {
      border: completed ? "border-green-400/70" : "border-amber-400/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-amber-500/50",
      glow: "hover:shadow-amber-400/60 hover:shadow-lg",
      accent: "bg-gradient-to-r from-amber-400/20 to-orange-400/20"
    },
    'deep-work': {
      border: completed ? "border-green-400/70" : "border-blue-500/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-blue-500/60",
      glow: "hover:shadow-blue-400/70 hover:shadow-xl",
      accent: "bg-gradient-to-r from-blue-500/20 to-indigo-500/20"
    },
    'light-work': {
      border: completed ? "border-green-400/70" : "border-emerald-400/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-emerald-500/50",
      glow: "hover:shadow-emerald-400/60 hover:shadow-lg",
      accent: "bg-gradient-to-r from-emerald-400/20 to-teal-400/20"
    },
    wellness: {
      border: completed ? "border-green-400/70" : "border-teal-500/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-teal-500/60",
      glow: "hover:shadow-teal-400/70 hover:shadow-xl",
      accent: "bg-gradient-to-r from-teal-500/20 to-cyan-500/20"
    },
    admin: {
      border: completed ? "border-green-400/70" : "border-indigo-500/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-indigo-500/60",
      glow: "hover:shadow-indigo-400/70 hover:shadow-xl",
      accent: "bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
    }
  };

  return baseStyles[category];
};

// Component Props
export interface TimeboxSectionProps {
  selectedDate: Date;
}

// Drag preview state for live drag feedback
export interface DragPreviewState {
  startTime: string;
  endTime: string;
  top: number;
}

// Gap filler state for smart scheduling
export interface GapFillerState {
  startTime: string;
  duration: number;
  top: number;
}

// Focus sprint types
export type FocusSprintType = 'pomodoro' | 'extended' | 'deep';

// Time slot for timeline rendering
export interface TimeSlot {
  hour: number;
  label: string;
  time24: string;
}

// Daily statistics
export interface TodayStats {
  deepWorkHours: number;
  lightWorkHours: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}
