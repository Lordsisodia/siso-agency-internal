/**
 * Quick action definitions
 */

import type { QuickActionType } from './chat';

export interface QuickAction {
  id: string;
  type: QuickActionType;
  label: string;
  description: string;
  icon: string;
  prompt: string;
  context?: Record<string, any>;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'prioritize',
    type: 'prioritize_tasks',
    label: 'Prioritize Tasks',
    description: 'Get help organizing your task list',
    icon: '🎯',
    prompt: 'Help me prioritize and organize my tasks for today',
  },
  {
    id: 'productivity',
    type: 'productivity_report',
    label: 'Productivity Tips',
    description: 'Get personalized productivity advice',
    icon: '📊',
    prompt: 'Analyze my productivity and give me actionable tips',
  },
  {
    id: 'morning',
    type: 'optimize_morning',
    label: 'Morning Routine',
    description: 'Optimize your morning routine',
    icon: '🌅',
    prompt: 'How can I improve my morning routine for better energy?',
  },
  {
    id: 'deepwork',
    type: 'deep_work_plan',
    label: 'Deep Work Plan',
    description: 'Plan a focused work session',
    icon: '🧠',
    prompt: 'Help me plan an effective deep work session',
  },
  {
    id: 'code',
    type: 'code_review',
    label: 'Code Review',
    description: 'Get AI code analysis',
    icon: '💻',
    prompt: 'Review my code and suggest improvements',
  },
];
