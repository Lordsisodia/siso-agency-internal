/**
 * 🎨 Work Themes Configuration
 * 
 * Extracted from UnifiedWorkSection.tsx (Phase 4A Refactoring)
 * Centralized theme configuration for all work types
 * 
 * Benefits:
 * - Reusable across all work pages (Light, Deep, Focus, etc.)
 * - Easy to add new work types
 * - Centralized theme management
 * - Type-safe theme configuration
 */

import { Coffee, Brain } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface WorkThemeColors {
  primary: string;
  bg: string;
  border: string;
  text: string;
  textSecondary: string;
  hover: string;
  completed: string;
  progressLine: string;
  input: string;
  button: string;
  addSubtask: string;
}

export interface WorkThemeRules {
  title: string;
  items: string[];
}

export interface WorkThemeProtocol {
  title: string;
  description: string;
}

export interface WorkTheme {
  name: string;
  icon: LucideIcon;
  emoji: string;
  colors: WorkThemeColors;
  rules: WorkThemeRules;
  protocol: WorkThemeProtocol;
  defaultDuration: number;
  defaultTimeEstimate: string;
}

export type WorkThemes = {
  LIGHT: WorkTheme;
  DEEP: WorkTheme;
};

// Theme configurations for different work types
export const WORK_THEMES: WorkThemes = {
  LIGHT: {
    name: 'Light Work Sessions',
    icon: Coffee,
    emoji: '☕',
    colors: {
      primary: 'emerald',
      bg: 'bg-emerald-900',
      border: 'border-emerald-500/60',
      text: 'text-emerald-400',
      textSecondary: 'text-emerald-300',
      hover: 'hover:border-emerald-400/70 hover:bg-emerald-800/40',
      completed: 'bg-emerald-900/30 border-emerald-500/60 text-emerald-200',
      progressLine: 'bg-emerald-500/60',
      input: 'border-emerald-500 focus:ring-emerald-500',
      button: 'border-emerald-500/60 text-emerald-400 hover:border-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20',
      addSubtask: 'hover:text-emerald-400 hover:bg-emerald-800/20'
    },
    rules: {
      title: 'Light Work Rules',
      items: [
        '• Perfect for lower energy periods.',
        '• Focus on quick wins and administrative tasks.',
        '• Keep sessions between 20-45 minutes.'
      ]
    },
    protocol: {
      title: 'Momentum Building',
      description: 'Light work sessions are perfect for administrative tasks, quick wins, and maintaining momentum when your energy is lower or when you need a mental break from deep focus work.'
    },
    defaultDuration: 20,
    defaultTimeEstimate: '20 min'
  },
  DEEP: {
    name: 'Deep Work Sessions',
    icon: Brain,
    emoji: '🧠',
    colors: {
      primary: 'blue',
      bg: 'bg-blue-900',
      border: 'border-blue-500/60',
      text: 'text-blue-400',
      textSecondary: 'text-blue-300',
      hover: 'hover:border-blue-400/70 hover:bg-blue-800/40',
      completed: 'bg-blue-900/30 border-blue-500/60 text-blue-200',
      progressLine: 'bg-blue-500/60',
      input: 'border-blue-500 focus:ring-blue-500',
      button: 'border-blue-500/60 text-blue-400 hover:border-blue-400 hover:text-blue-300 hover:bg-blue-900/20',
      addSubtask: 'hover:text-blue-400 hover:bg-blue-800/20'
    },
    rules: {
      title: 'Deep Work Rules',
      items: [
        '• No interruptions or task switching allowed.',
        '• Phone on airplane mode or Do Not Disturb.',
        '• Work in 2-4 hour focused blocks.'
      ]
    },
    protocol: {
      title: 'Flow State Protocol',
      description: 'Deep work sessions require sustained focus without interruption. These blocks are designed for your most important, cognitively demanding work that creates maximum value.'
    },
    defaultDuration: 120,
    defaultTimeEstimate: '2 hours'
  }
} as const;

/**
 * Get theme configuration for a specific work type
 */
export function getWorkTheme(workType: keyof WorkThemes): WorkTheme {
  return WORK_THEMES[workType];
}

/**
 * Get all available work themes
 */
export function getAllWorkThemes(): WorkTheme[] {
  return Object.values(WORK_THEMES);
}

/**
 * Check if work type exists
 */
export function isValidWorkType(workType: string): workType is keyof WorkThemes {
  return workType in WORK_THEMES;
}