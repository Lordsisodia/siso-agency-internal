/**
 * Working UI Provider - Feature Flagged UI Component Wrapper
 * 
 * Provides fallback support for gradual migration to working UI.
 * Uses feature flags to safely switch between old and new implementations.
 */

import React from 'react';
import { useImplementation, isFeatureEnabled } from '@/migration/feature-flags';

// Import working UI components
import { TaskActionButtons } from './TaskActionButtons';
import { UnifiedTaskCard } from './UnifiedTaskCard';
import { UnifiedWorkSection } from './UnifiedWorkSection';

// Fallback components (to be created if needed)
const FallbackTaskActionButtons = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const FallbackUnifiedTaskCard = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const FallbackUnifiedWorkSection = ({ children, ...props }: any) => <div {...props}>{children}</div>;

/**
 * Feature-flagged TaskActionButtons
 */
export const SafeTaskActionButtons: React.FC<any> = (props) => {
  return useImplementation(
    'useWorkingUI',
    <TaskActionButtons {...props} />,
    <FallbackTaskActionButtons {...props} />
  );
};

/**
 * Feature-flagged UnifiedTaskCard
 */
export const SafeUnifiedTaskCard: React.FC<any> = (props) => {
  return useImplementation(
    'useWorkingUI',
    <UnifiedTaskCard {...props} />,
    <FallbackUnifiedTaskCard {...props} />
  );
};

/**
 * Feature-flagged UnifiedWorkSection
 */
export const SafeUnifiedWorkSection: React.FC<any> = (props) => {
  return useImplementation(
    'useWorkingUI',
    <UnifiedWorkSection {...props} />,
    <FallbackUnifiedWorkSection {...props} />
  );
};

/**
 * Development helper - shows which UI is being used
 */
export const WorkingUIDebugger: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  const isUsingWorkingUI = isFeatureEnabled('useWorkingUI');
  
  return (
    <div 
      className="fixed top-2 right-2 z-50 bg-black/80 text-white text-xs px-2 py-1 rounded"
      title={isUsingWorkingUI ? "Using Working UI from GitHub" : "Using Fallback UI"}
    >
      {isUsingWorkingUI ? "🟢 Working UI" : "🔴 Fallback UI"}
    </div>
  );
};