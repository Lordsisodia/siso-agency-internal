/**
 * Working UI Components - Restored from GitHub
 * 
 * This directory contains the working UI components from the GitHub commit
 * that had the correct 5-button task UI system.
 * 
 * Safe migration strategy:
 * 1. MinimalWorkingUI - Simplified version for initial testing
 * 2. Feature flags control which implementation is used
 * 3. Fallback support prevents breaking existing functionality
 */

export { TaskActionButtons } from './TaskActionButtons';
export { UnifiedTaskCard } from './UnifiedTaskCard';
export { MinimalWorkingUI } from './MinimalWorkingUI';
export { LightWorkTabWrapper } from './LightWorkTabWrapper';
export { WorkingUIDebugger } from './WorkingUIProvider';

// Re-export the safe versions with fallback support
export { 
  SafeTaskActionButtons,
  SafeUnifiedTaskCard,
  SafeUnifiedWorkSection
} from './WorkingUIProvider';