/**
 * useAIContext Hook
 *
 * Provides context from the app (tasks, stats, etc.)
 * TODO: Integrate with actual SISO state management
 */

import { useMemo } from 'react';
import type { AIContext } from '../types/context';

export function useAIContext() {
  // TODO: Pull from actual SISO state
  // For now, using mock data
  const context = useMemo<AIContext>(() => {
    return {
      domain: 'lifelock',
      section: 'deep-work',
      tasks: [
        {
          id: '1',
          title: 'Complete project proposal',
          status: 'in-progress',
        },
        {
          id: '2',
          title: 'Review pull requests',
          status: 'pending',
        },
        {
          id: '3',
          title: 'Team standup meeting',
          status: 'scheduled',
        },
      ],
      stats: {
        tasksCompleted: 5,
        focusTime: 120,
        streak: 7,
        mostProductiveTime: '10am',
      },
      recentActivity: [
        'Completed morning routine',
        'Started deep work session',
        'Finished code review',
      ],
      preferences: {
        focusTime: '9am-11am',
        workStyle: 'deep-work-first',
        goals: ['Increase productivity', 'Better work-life balance'],
      },
    };
  }, []);

  return {
    context,
    updateContext: (newContext: Partial<AIContext>) => {
      
      // TODO: Implement actual context updates
    },
  };
}
