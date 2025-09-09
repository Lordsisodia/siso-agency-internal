/**
 * TypeScript types for AdminLifeLock refactoring
 * 
 * Comprehensive type definitions for the switch statement replacement system
 */

import { TabId } from '@/archive/ecosystem-backup/internal/core/tab-config';

/**
 * Props passed to all tab layout components
 */
export interface TabLayoutProps {
  selectedDate: Date;
  dayCompletionPercentage: number;
  navigateDay?: (direction: 'prev' | 'next') => void;
  
  // Handler props for interactive tabs
  handleQuickAdd?: (task: string) => void;
  handleOrganizeTasks?: () => void;
  handleVoiceCommand?: (message: string) => void;
  
  // State props
  isAnalyzingTasks?: boolean;
  isProcessingVoice?: boolean;
  todayCard?: any;
  
  // Additional props for extensibility
  [key: string]: any;
}

/**
 * Props passed to individual tab section components
 */
export interface TabComponentProps {
  selectedDate: Date;
  [key: string]: any;
}

/**
 * Layout types for different tab rendering patterns
 */
export type TabLayoutType = 'standard' | 'chat' | 'full-screen';

/**
 * Tab error boundary props
 */
export interface TabErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

/**
 * Tab error boundary state
 */
export interface TabErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Configuration for individual tab rendering
 */
export interface TabRenderConfig {
  layoutType: TabLayoutType;
  backgroundClass: string;
  showDateNav: boolean;
  errorBoundary: boolean;
}

/**
 * Props for tab content renderer
 */
export interface TabContentRendererProps {
  activeTab: TabId;
  layoutProps: TabLayoutProps;
}

/**
 * Props for safe tab content renderer (with error boundary)
 */
export interface SafeTabContentRendererProps extends TabContentRendererProps {
  errorFallback?: React.ComponentType<{ error: Error }>;
}

/**
 * Migration utility types
 */
export interface MigrationStatus {
  useRefactoredRenderer: boolean;
  linesEliminated: number;
  tabsSupported: number;
  errorsBoundary: boolean;
}

/**
 * Tab testing utility types
 */
export interface TabTestResult {
  tabId: TabId;
  success: boolean;
  error?: string;
  renderTime?: number;
}

export interface TabTestSuite {
  results: TabTestResult[];
  totalTabs: number;
  successCount: number;
  failureCount: number;
  averageRenderTime: number;
}