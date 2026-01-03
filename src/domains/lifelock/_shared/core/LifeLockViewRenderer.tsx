/**
 * LIFELOCK VIEW RENDERER - Master rendering engine
 *
 * Single source of truth for rendering ALL LifeLock views (Daily/Weekly/Monthly/Yearly)
 * Uses THE CORRECT components from SafeTabContentRenderer
 *
 * SAFETY: This wraps the WORKING AdminLifeLock.tsx logic
 * - Uses SafeTabContentRenderer (the CORRECT renderer)
 * - Same components as the working /admin/life-lock route
 * - Can be rolled back by reverting to old code
 */

import React from 'react';
import { ViewType, getViewConfig } from './view-configs';
import { TabLayoutWrapper } from './TabLayoutWrapper';
import { SafeTabContentRenderer } from './TabContentRenderer';
import { TabId } from '@/services/shared/tab-config';

interface LifeLockViewRendererProps {
  view: ViewType;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  userId?: string | null;
  hideBottomNav?: boolean;
  dayCompletionPercentage?: number;
}

/**
 * MASTER VIEW RENDERER
 * Handles all view types using THE CORRECT components from SafeTabContentRenderer
 */
export const LifeLockViewRenderer: React.FC<LifeLockViewRendererProps> = ({
  view,
  selectedDate,
  onDateChange,
  userId,
  hideBottomNav = false,
  dayCompletionPercentage = 0,
}) => {
  const viewConfig = getViewConfig(view);

  // DAILY VIEW - Tab-based layout using CORRECT components
  if (viewConfig.layoutType === 'tabs') {
    return (
      <TabLayoutWrapper
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        userId={userId}
        hideBottomNav={hideBottomNav}
      >
        {(activeTab, navigateDay) => (
          <SafeTabContentRenderer
            activeTab={activeTab as TabId}
            layoutProps={{
              selectedDate,
              dayCompletionPercentage,
              navigateDay,
              userId: userId || undefined,
            }}
          />
        )}
      </TabLayoutWrapper>
    );
  }

  // WEEKLY VIEW - Grid layout (future implementation)
  if (viewConfig.layoutType === 'grid') {
    return (
      <div className="p-4">
        <div className="text-white text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Weekly View</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </div>
    );
  }

  // MONTHLY VIEW - Calendar layout (future implementation)
  if (viewConfig.layoutType === 'calendar') {
    return (
      <div className="p-4">
        <div className="text-white text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Monthly View</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </div>
    );
  }

  // YEARLY VIEW - Timeline layout (future implementation)
  if (viewConfig.layoutType === 'timeline') {
    return (
      <div className="p-4">
        <div className="text-white text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Yearly View</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </div>
    );
  }

  // Fallback (should never reach here)
  return (
    <div className="p-4">
      <div className="text-white text-center py-8">
        <h2 className="text-2xl font-bold mb-2">Unknown View</h2>
        <p className="text-gray-400">View type: {view}</p>
      </div>
    </div>
  );
};
