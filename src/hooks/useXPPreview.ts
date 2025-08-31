/**
 * 🎯 XP Preview React Hook
 * Easy-to-use hook for showing XP potential in UI components
 */

import { useState, useEffect, useCallback } from 'react';
import { XPPreview } from '@/services/xpPreviewService';

interface XPPreviewState {
  preview: XPPreview | null;
  loading: boolean;
  error: string | null;
}

interface ContextualPreviews {
  now: XPPreview;
  morning: XPPreview;
  inFocus: XPPreview;
  withStreak: XPPreview;
}

interface BulkPreviewData {
  totalTasks: number;
  totalEstimatedXP: number;
  previews: Array<XPPreview & { taskId?: string; title: string }>;
  prioritizationSummary: {
    highValue: number;
    mediumValue: number;
    quickWins: number;
  };
}

/**
 * Hook for getting XP preview for existing task
 */
export function useTaskXPPreview(taskId: string | null, includeContextual: boolean = false) {
  const [state, setState] = useState<XPPreviewState>({
    preview: null,
    loading: false,
    error: null
  });
  const [contextualPreviews, setContextualPreviews] = useState<ContextualPreviews | null>(null);

  const fetchPreview = useCallback(async () => {
    if (!taskId) {
      setState({ preview: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/xp-preview?taskId=${taskId}&includeContextual=${includeContextual}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch XP preview: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setState({
          preview: result.data.preview,
          loading: false,
          error: null
        });
        
        if (result.data.contextualPreviews) {
          setContextualPreviews(result.data.contextualPreviews);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch preview');
      }
    } catch (error) {
      setState({
        preview: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [taskId, includeContextual]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  return {
    ...state,
    contextualPreviews,
    refetch: fetchPreview
  };
}

/**
 * Hook for getting XP preview for new task being created
 */
export function useNewTaskXPPreview() {
  const [state, setState] = useState<XPPreviewState>({
    preview: null,
    loading: false,
    error: null
  });
  const [scenarios, setScenarios] = useState<ContextualPreviews | null>(null);

  const previewNewTask = useCallback(async (
    title: string,
    description?: string,
    workType: 'DEEP' | 'LIGHT' | 'MORNING' = 'LIGHT',
    estimatedMinutes?: number,
    includeScenarios: boolean = false
  ) => {
    if (!title.trim()) {
      setState({ preview: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/xp-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description?.trim(),
          workType,
          estimatedMinutes,
          includeMultipleScenarios: includeScenarios
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to preview new task: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setState({
          preview: result.data.preview,
          loading: false,
          error: null
        });
        
        if (result.data.scenarios) {
          setScenarios(result.data.scenarios);
        }
      } else {
        throw new Error(result.error || 'Failed to preview new task');
      }
    } catch (error) {
      setState({
        preview: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  const clearPreview = useCallback(() => {
    setState({ preview: null, loading: false, error: null });
    setScenarios(null);
  }, []);

  return {
    ...state,
    scenarios,
    previewNewTask,
    clearPreview
  };
}

/**
 * Hook for bulk XP preview (task prioritization)
 */
export function useBulkXPPreview() {
  const [data, setData] = useState<BulkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewTasks = useCallback(async (taskIds: string[]) => {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/xp-preview', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds })
      });

      if (!response.ok) {
        throw new Error(`Failed to preview tasks: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to preview tasks');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    previewTasks
  };
}

/**
 * Utility hook for XP preview UI helpers
 */
export function useXPPreviewHelpers() {
  const getXPColorClass = useCallback((xp: number): string => {
    if (xp >= 200) return 'text-purple-600 font-bold';
    if (xp >= 100) return 'text-blue-600 font-semibold';
    if (xp >= 50) return 'text-green-600 font-medium';
    return 'text-gray-600';
  }, []);

  const getXPBadgeClass = useCallback((xp: number): string => {
    if (xp >= 200) return 'bg-purple-100 text-purple-800 border border-purple-200';
    if (xp >= 100) return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (xp >= 50) return 'bg-green-100 text-green-800 border border-green-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  }, []);

  const getXPEmoji = useCallback((xp: number): string => {
    if (xp >= 200) return '💎';
    if (xp >= 100) return '🚀';
    if (xp >= 50) return '✨';
    return '📈';
  }, []);

  const getPriorityColor = useCallback((priority: string): string => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-blue-600';
      case 'LOW': return 'text-gray-500';
      default: return 'text-gray-600';
    }
  }, []);

  const formatXPRange = useCallback((min: number, max: number, estimated: number): string => {
    if (min === max) return `${estimated} XP`;
    return `${min}-${max} XP`;
  }, []);

  return {
    getXPColorClass,
    getXPBadgeClass,
    getXPEmoji,
    getPriorityColor,
    formatXPRange
  };
}