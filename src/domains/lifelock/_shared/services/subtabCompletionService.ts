/**
 * Subtab Completion Service
 *
 * Manages the completion state of subtabs (morning, checkout, etc.)
 * Persists completion state to localStorage for quick access
 * Syncs with backend for cross-device consistency
 */

import React from 'react';
import { format } from 'date-fns';
import { subtabCompletionSyncService } from './subtabCompletionSync';

interface CompletionState {
  [dateKey: string]: {
    [subTabId: string]: {
      completed: boolean;
      completedAt?: string;
    };
  };
}

const STORAGE_KEY = 'lifelock-subtab-completion';

class SubtabCompletionService {
  private cache: CompletionState = {};

  /**
   * Get the storage key for a specific user and date
   */
  private getStorageKey(userId?: string | null): string {
    const userSuffix = userId || 'anonymous';
    return `${STORAGE_KEY}-${userSuffix}`;
  }

  /**
   * Load completion state from localStorage
   */
  private loadFromStorage(userId?: string | null): CompletionState {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const key = this.getStorageKey(userId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load subtab completion state:', error);
      return {};
    }
  }

  /**
   * Save completion state to localStorage
   */
  private saveToStorage(state: CompletionState, userId?: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const key = this.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save subtab completion state:', error);
    }
  }

  /**
   * Check if a specific subtab is completed for a given date
   */
  isCompleted(subTabId: string, date: Date, userId?: string | null): boolean {
    const dateKey = format(date, 'yyyy-MM-dd');

    // Check cache first
    if (this.cache[dateKey]?.[subTabId]?.completed) {
      return true;
    }

    // Load from storage if not in cache
    const state = this.loadFromStorage(userId);
    this.cache = state;

    return state[dateKey]?.[subTabId]?.completed || false;
  }

  /**
   * Mark a subtab as completed or not completed
   */
  async setCompleted(
    subTabId: string,
    date: Date,
    completed: boolean,
    userId?: string | null
  ): Promise<void> {
    const dateKey = format(date, 'yyyy-MM-dd');

    // Initialize state if not exists
    if (!this.cache[dateKey]) {
      this.cache[dateKey] = {};
    }

    // Update completion state
    this.cache[dateKey][subTabId] = {
      completed,
      completedAt: completed ? new Date().toISOString() : undefined
    };

    // Persist to storage
    this.saveToStorage(this.cache, userId);

    // Sync with backend if userId is provided
    if (userId) {
      try {
        await subtabCompletionSyncService.syncCompletion(userId, date, subTabId, completed);
      } catch (error) {
        console.error('Failed to sync completion to backend:', error);
        // Don't throw - localStorage is still updated
      }
    }
  }

  /**
   * Get all completed subtabs for a given date
   */
  getCompletedSubtabs(date: Date, userId?: string | null): string[] {
    const dateKey = format(date, 'yyyy-MM-dd');
    const state = this.loadFromStorage(userId);
    const dateState = state[dateKey] || {};

    return Object.entries(dateState)
      .filter(([_, data]) => data.completed)
      .map(([subTabId, _]) => subTabId);
  }

  /**
   * Clear completion state for a specific date (useful for testing or manual override)
   */
  clearDate(date: Date, userId?: string | null): void {
    const dateKey = format(date, 'yyyy-MM-dd');
    const state = this.loadFromStorage(userId);
    delete state[dateKey];
    this.cache = state;
    this.saveToStorage(state, userId);
  }

  /**
   * Clear all completion state (useful for testing)
   */
  clearAll(userId?: string | null): void {
    this.cache = {};
    this.saveToStorage({}, userId);
  }
}

// Export singleton instance
export const subtabCompletionService = new SubtabCompletionService();

/**
 * React hook for managing subtab completion state
 */
export const useSubtabCompletion = (date: Date, userId?: string | null) => {
  const [completedSubtabs, setCompletedSubtabs] = React.useState<string[]>([]);

  // Load completed subtabs on mount
  React.useEffect(() => {
    const completed = subtabCompletionService.getCompletedSubtabs(date, userId);
    setCompletedSubtabs(completed);

    // Also try to fetch from backend if userId is provided
    if (userId) {
      subtabCompletionSyncService.fetchCompletions(userId, date).then(backendCompletions => {
        const subtabIds = Object.entries(backendCompletions)
          .filter(([_, completed]) => completed)
          .map(([subtabId, _]) => subtabId);

        setCompletedSubtabs(subtabIds);
      }).catch(error => {
        console.error('Failed to fetch completions from backend:', error);
        // Fall back to localStorage values
      });
    }
  }, [date, userId]);

  const toggleCompleted = (subTabId: string) => {
    const isCurrentlyCompleted = completedSubtabs.includes(subTabId);
    const newCompletedState = !isCurrentlyCompleted;

    // Optimistic update
    setCompletedSubtabs(prev =>
      newCompletedState
        ? [...prev, subTabId]
        : prev.filter(id => id !== subTabId)
    );

    // Sync with service (which will sync to backend)
    subtabCompletionService.setCompleted(subTabId, date, newCompletedState, userId);
  };

  const isCompleted = (subTabId: string) => completedSubtabs.includes(subTabId);

  const setCompleted = (subTabId: string, completed: boolean) => {
    // Optimistic update
    setCompletedSubtabs(prev =>
      completed
        ? [...prev, subTabId]
        : prev.filter(id => id !== subTabId)
    );

    // Sync with service (which will sync to backend)
    subtabCompletionService.setCompleted(subTabId, date, completed, userId);
  };

  return {
    completedSubtabs,
    toggleCompleted,
    isCompleted,
    setCompleted
  };
};
