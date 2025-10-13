import { TimeBlockCategory } from '@/api/timeblocksApi.offline';
import { CategoryStyles, TimeboxTask } from './types';

// Map database categories to UI categories
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

// Enhanced category-specific styling helper with vibrant colors
export const getCategoryStyles = (category: TimeboxTask['category'], completed: boolean): CategoryStyles => {
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
      shadow: completed ? "shadow-green-500/40" : "shadow-indigo-500/50",
      glow: "hover:shadow-indigo-400/60 hover:shadow-lg",
      accent: "bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
    }
  };
  return baseStyles[category] || baseStyles.admin;
};

// Get color based on category and completion
export const getTaskColor = (category: string, completed: boolean): string => {
  if (completed) return 'from-green-900/40 via-emerald-900/30 to-green-800/40';

  const colors: Record<string, string> = {
    'morning': 'from-amber-400/90 via-orange-500/80 to-yellow-500/70',
    'deep-work': 'from-blue-600/90 via-indigo-600/80 to-purple-600/80',
    'light-work': 'from-emerald-500/90 via-green-500/80 to-teal-500/70',
    'wellness': 'from-teal-600/90 via-cyan-500/80 to-blue-500/70',
    'admin': 'from-indigo-700/90 via-purple-700/80 to-violet-700/70'
  };
  return colors[category] || colors.admin;
};

// Format time helper
export const formatTime = (minutes: number): string =>
  `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;

// Parse time to minutes
export const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Validate time format
export const isValidTimeFormat = (time: string): boolean => {
  const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(time);
};
