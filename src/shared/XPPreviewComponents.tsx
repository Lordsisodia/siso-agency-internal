/**
 * 🎯 XP Preview UI Components
 * Ready-to-use components for showing XP potential in tasks
 */

import React, { useState } from 'react';
import { useTaskXPPreview, useNewTaskXPPreview, useBulkXPPreview, useXPPreviewHelpers } from '@/shared/hooks/useXPPreview';
import { XPPreview } from '@/services/xpPreviewService';

// Types
interface TaskPreviewCardProps {
  taskId: string;
  taskTitle?: string;
  showContextualPreviews?: boolean;
  compact?: boolean;
}

interface NewTaskXPPreviewProps {
  title: string;
  description?: string;
  workType?: 'DEEP' | 'LIGHT' | 'MORNING';
  estimatedMinutes?: number;
  showScenarios?: boolean;
}

interface TaskPrioritizationProps {
  taskIds: string[];
}

/**
 * 📋 Task XP Preview Card
 * Shows XP potential for an existing task
 */
export function TaskXPPreviewCard({ 
  taskId, 
  taskTitle,
  showContextualPreviews = false,
  compact = false 
}: TaskPreviewCardProps) {
  const { preview, contextualPreviews, loading, error } = useTaskXPPreview(taskId, showContextualPreviews);
  const helpers = useXPPreviewHelpers();

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error || !preview) {
    return compact ? null : (
      <div className="text-sm text-gray-500 p-2">
        {error || 'Unable to preview XP'}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${helpers.getXPBadgeClass(preview.estimatedXP)}`}>
        <span>{helpers.getXPEmoji(preview.estimatedXP)}</span>
        <span className="font-medium">{preview.estimatedXP} XP</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{helpers.getXPEmoji(preview.estimatedXP)}</span>
          <span className={`text-xl font-bold ${helpers.getXPColorClass(preview.estimatedXP)}`}>
            {preview.estimatedXP} XP
          </span>
          {preview.minXP !== preview.maxXP && (
            <span className="text-sm text-gray-500">
              ({helpers.formatXPRange(preview.minXP, preview.maxXP, preview.estimatedXP)})
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {preview.confidence}% confidence
        </div>
      </div>

      {/* Motivation Message */}
      <div className="text-sm font-medium text-gray-800 mb-2">
        {preview.motivationMessage}
      </div>

      {/* Priority Reason */}
      <div className="text-xs text-gray-600 mb-3">
        {preview.priorityReason}
      </div>

      {/* XP Breakdown */}
      <details className="mb-3">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
          XP Breakdown
        </summary>
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          {preview.breakdown.map((item, index) => (
            <div key={index} className="pl-3 border-l-2 border-gray-200">
              {item}
            </div>
          ))}
        </div>
      </details>

      {/* Bonus Opportunities */}
      {preview.bonusOpportunities.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">💡 Bonus Opportunities:</div>
          <div className="space-y-1">
            {preview.bonusOpportunities.map((opportunity, index) => (
              <div key={index} className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                {opportunity}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contextual Previews */}
      {contextualPreviews && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">🔮 Different Scenarios:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-yellow-50 rounded px-2 py-1">
              🌅 Morning: <span className="font-medium">{contextualPreviews.morning.estimatedXP} XP</span>
            </div>
            <div className="bg-purple-50 rounded px-2 py-1">
              🧘 In Focus: <span className="font-medium">{contextualPreviews.inFocus.estimatedXP} XP</span>
            </div>
            <div className="bg-orange-50 rounded px-2 py-1">
              🔥 With Streak: <span className="font-medium">{contextualPreviews.withStreak.estimatedXP} XP</span>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1">
              📍 Right Now: <span className="font-medium">{contextualPreviews.now.estimatedXP} XP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ✨ New Task XP Preview
 * Shows XP potential while creating a new task
 */
export function NewTaskXPPreview({ 
  title, 
  description, 
  workType, 
  estimatedMinutes,
  showScenarios = false 
}: NewTaskXPPreviewProps) {
  const { preview, scenarios, loading, error, previewNewTask } = useNewTaskXPPreview();
  const helpers = useXPPreviewHelpers();

  // Update preview when inputs change
  React.useEffect(() => {
    if (title.trim()) {
      previewNewTask(title, description, workType, estimatedMinutes, showScenarios);
    }
  }, [title, description, workType, estimatedMinutes, previewNewTask, showScenarios]);

  if (!title.trim()) {
    return (
      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
        💡 Enter a task title to see XP potential
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-3">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="text-sm text-red-500 p-3 bg-red-50 rounded-lg">
        {error || 'Unable to preview XP'}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      {/* XP Preview Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{helpers.getXPEmoji(preview.estimatedXP)}</span>
          <span className={`text-lg font-bold ${helpers.getXPColorClass(preview.estimatedXP)}`}>
            {preview.estimatedXP} XP
          </span>
          <span className="text-xs text-gray-600">
            ({preview.confidence}% confidence)
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Preview
        </div>
      </div>

      {/* Motivation */}
      <div className="text-sm font-medium text-gray-800 mb-2">
        {preview.motivationMessage}
      </div>

      {/* Quick breakdown */}
      <div className="text-xs text-gray-600 mb-3">
        {preview.priorityReason}
      </div>

      {/* Scenarios */}
      {scenarios && showScenarios && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/60 rounded px-2 py-1">
            ⏰ Now: <span className="font-medium">{scenarios.now.estimatedXP} XP</span>
          </div>
          <div className="bg-white/60 rounded px-2 py-1">
            🌅 Morning: <span className="font-medium">{scenarios.morning.estimatedXP} XP</span>
          </div>
          <div className="bg-white/60 rounded px-2 py-1">
            🧘 Focus: <span className="font-medium">{scenarios.inFocus.estimatedXP} XP</span>
          </div>
          <div className="bg-white/60 rounded px-2 py-1">
            🔥 Streak: <span className="font-medium">{scenarios.withStreak.estimatedXP} XP</span>
          </div>
        </div>
      )}

      {/* Top bonus opportunity */}
      {preview.bonusOpportunities.length > 0 && (
        <div className="mt-3 text-xs text-blue-700 bg-blue-100/60 rounded px-2 py-1">
          💡 {preview.bonusOpportunities[0]}
        </div>
      )}
    </div>
  );
}

/**
 * 🎯 Task Prioritization View
 * Shows XP potential for multiple tasks to help prioritize
 */
export function TaskPrioritizationView({ taskIds }: TaskPrioritizationProps) {
  const { data, loading, error, previewTasks } = useBulkXPPreview();
  const helpers = useXPPreviewHelpers();

  React.useEffect(() => {
    if (taskIds.length > 0) {
      previewTasks(taskIds);
    }
  }, [taskIds, previewTasks]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        {error || 'Unable to load task priorities'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">📊 Task Prioritization</h3>
          <div className="text-2xl font-bold text-purple-600">
            {data.totalEstimatedXP} XP
          </div>
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          <div>🚀 {data.prioritizationSummary.highValue} high-value</div>
          <div>✨ {data.prioritizationSummary.mediumValue} medium</div>
          <div>📈 {data.prioritizationSummary.quickWins} quick wins</div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {data.previews.map((preview, index) => (
          <div 
            key={preview.taskId || index}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 
              'bg-white border-gray-200'
            }`}
          >
            <div className="flex-1">
              <div className="font-medium text-gray-800 truncate">
                {index === 0 && '👑 '}{preview.title}
              </div>
              <div className="text-sm text-gray-600">
                {preview.priorityReason}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {preview.bonusOpportunities.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  +{preview.bonusOpportunities.length} bonus
                </span>
              )}
              <div className={`text-lg font-bold ${helpers.getXPColorClass(preview.estimatedXP)}`}>
                {helpers.getXPEmoji(preview.estimatedXP)} {preview.estimatedXP}
              </div>
              {index < 3 && (
                <div className="text-xs text-orange-600 font-medium">
                  TOP {index + 1}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 🎮 XP Preview Badge (for task lists)
 * Compact XP preview badge for task cards
 */
export function XPPreviewBadge({ taskId, showTooltip = true }: { taskId: string; showTooltip?: boolean }) {
  const { preview, loading } = useTaskXPPreview(taskId, false);
  const helpers = useXPPreviewHelpers();
  const [showTooltipState, setShowTooltipState] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-full w-16 h-6"></div>
    );
  }

  if (!preview) return null;

  const badge = (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-help ${helpers.getXPBadgeClass(preview.estimatedXP)}`}
      onMouseEnter={() => showTooltip && setShowTooltipState(true)}
      onMouseLeave={() => setShowTooltipState(false)}
    >
      <span>{helpers.getXPEmoji(preview.estimatedXP)}</span>
      <span>{preview.estimatedXP}</span>
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <div className="relative">
      {badge}
      {showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 min-w-48">
          <div className="font-medium mb-1">{preview.motivationMessage}</div>
          <div className="text-gray-300">{preview.priorityReason}</div>
          {preview.bonusOpportunities.length > 0 && (
            <div className="mt-2 text-blue-300">
              💡 {preview.bonusOpportunities[0]}
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}