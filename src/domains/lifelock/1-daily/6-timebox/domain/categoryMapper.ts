/**
 * Category Mapper Utilities
 * Maps between database categories and UI categories
 */

import { TimeBlockCategory } from '@/services/api/timeblocksApi.offline';

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

// Category-specific styling helper
export const getCategoryStyles = (category: string, completed: boolean) => {
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
  return baseStyles[category as keyof typeof baseStyles] || baseStyles.admin;
};
