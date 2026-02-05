import { TimeBlockCategory } from '@/services/api/timeblocksApi.offline';
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
    ADMIN: 'admin',
    AVAILABILITY: 'availability'
  };
  return categoryMap[dbCategory] || 'admin';
};

export const mapUIToCategory = (uiCategory: string): TimeBlockCategory => {
  const uiMap: Record<string, TimeBlockCategory> = {
    'deep-work': 'DEEP_WORK',
    'light-work': 'LIGHT_WORK',
    'admin': 'ADMIN',
    'wellness': 'PERSONAL',
    'morning': 'PERSONAL',
    'availability': 'AVAILABILITY'
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

// Infer category based on hour of day
export const inferCategoryFromHour = (hour: number): TimeBlockCategory => {
  if (hour >= 5 && hour < 9) return 'PERSONAL'; // Morning routine
  if (hour >= 9 && hour < 12) return 'DEEP_WORK'; // Morning deep work
  if (hour >= 12 && hour < 14) return 'BREAK'; // Lunch
  if (hour >= 14 && hour < 17) return 'LIGHT_WORK'; // Afternoon light work
  if (hour >= 17 && hour < 19) return 'PERSONAL'; // Evening personal
  if (hour >= 19 && hour < 22) return 'LEARNING'; // Evening learning
  return 'PERSONAL';
};

// Format time display (24h to 12h format)
export const formatTimeDisplay = (time24: string | null): string => {
  if (!time24) return '--:--';

  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
};

// Energy level styling for task intensity visualization
export const getEnergyStyle = (intensity?: string): import('./types').EnergyStyle => {
  const styles: Record<string, import('./types').EnergyStyle> = {
    'maximum': { dots: 3, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Maximum' },
    'intense': { dots: 2, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Intense' },
    'moderate': { dots: 1, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Moderate' },
    'light': { dots: 0, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Light' }
  };
  return styles[intensity || 'moderate'] || styles.moderate;
};

// Get energy-based color for task background
export const getEnergyColor = (intensity?: string, completed: boolean = false): string => {
  if (completed) return 'from-green-900/40 via-emerald-900/30 to-green-800/40';

  const colors: Record<string, string> = {
    'maximum': 'from-red-600/90 via-red-500/80 to-orange-600/80',
    'intense': 'from-orange-600/90 via-orange-500/80 to-amber-600/80',
    'moderate': 'from-yellow-600/90 via-yellow-500/80 to-amber-500/80',
    'light': 'from-green-600/90 via-emerald-500/80 to-teal-500/80'
  };
  return colors[intensity || 'moderate'] || colors.moderate;
};

// Get energy-based border color
export const getEnergyBorder = (intensity?: string, completed: boolean = false): string => {
  if (completed) return 'border-green-400/70';

  const borders: Record<string, string> = {
    'maximum': 'border-red-500/80',
    'intense': 'border-orange-500/80',
    'moderate': 'border-yellow-500/80',
    'light': 'border-green-500/80'
  };
  return borders[intensity || 'moderate'] || borders.moderate;
};

// Get energy-based shadow
export const getEnergyShadow = (intensity?: string, completed: boolean = false): string => {
  if (completed) return 'shadow-green-500/40';

  const shadows: Record<string, string> = {
    'maximum': 'shadow-red-500/60',
    'intense': 'shadow-orange-500/60',
    'moderate': 'shadow-yellow-500/50',
    'light': 'shadow-green-500/50'
  };
  return shadows[intensity || 'moderate'] || shadows.moderate;
};
