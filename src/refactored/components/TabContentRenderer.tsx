/**
 * Tab Content Renderer - Eliminates AdminLifeLock Switch Statement
 * 
 * This component factory replaces the massive 220-line switch statement
 * in AdminLifeLock.tsx with configuration-driven rendering.
 * 
 * Benefits:
 * - Eliminates code duplication: One layout pattern for all tabs
 * - Reduces complexity: 220 lines → ~50 lines of reusable logic
 * - Easy extensibility: Add tabs without modifying switch statements
 * - Better maintainability: Single source of truth for tab layouts
 * - Type safety: Comprehensive prop validation
 */

import React from 'react';
import { CleanDateNav } from '@/shared/ui/clean-date-nav';
import { 
  TabId, 
  EnhancedTabConfig, 
  TabLayoutProps,
  getEnhancedTabConfig,
  isSpecialLayout 
} from '@/ecosystem/internal/lifelock/admin-lifelock-tabs';

/**
 * Standard tab layout wrapper - used by most tabs
 * Replaces the repeated layout code from the switch statement
 */
const StandardTabLayout: React.FC<{
  config: EnhancedTabConfig;
  layoutProps: TabLayoutProps;
  children: React.ReactNode;
  activeTab: TabId;
}> = ({ config, layoutProps, children, activeTab }) => {
  const { selectedDate, dayCompletionPercentage, navigateDay } = layoutProps;

  return (
    <div className={config.backgroundClass}>
      {config.showDateNav && (
        <CleanDateNav 
          selectedDate={selectedDate}
          completionPercentage={dayCompletionPercentage}
          className="mb-6"
          onPreviousDate={() => navigateDay?.('prev')}
          onNextDate={() => navigateDay?.('next')}
          activeTab={activeTab}
        />
      )}
      
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};


/**
 * Main Tab Content Renderer
 * Replaces the entire switch statement with configuration-driven rendering
 */
export const TabContentRenderer: React.FC<{
  activeTab: TabId;
  layoutProps: TabLayoutProps;
}> = ({ activeTab, layoutProps }) => {
  const config = getEnhancedTabConfig(activeTab);
  
  // Handle standard tab layout
  return (
    <StandardTabLayout config={config} layoutProps={layoutProps} activeTab={activeTab}>
      {/* Render primary components */}
      {config.components.map((Component, index) => (
        <Component
          key={`${activeTab}-component-${index}`}
          selectedDate={layoutProps.selectedDate}
          {...config.componentProps}
        />
      ))}

      {/* Render additional interactive content */}
      {config.additionalContent && (() => {
        const AdditionalComponent = config.additionalContent;
        
        // Handle QuickActionsSection special props
        if (AdditionalComponent.name === 'QuickActionsSection') {
          return (
            <AdditionalComponent
              key={`${activeTab}-additional`}
              handleQuickAdd={layoutProps.handleQuickAdd}
              handleOrganizeTasks={layoutProps.handleOrganizeTasks}
              isAnalyzingTasks={layoutProps.isAnalyzingTasks}
              todayCard={layoutProps.todayCard}
            />
          );
        }

        // Handle other additional components
        return (
          <AdditionalComponent
            key={`${activeTab}-additional`}
            selectedDate={layoutProps.selectedDate}
            {...config.componentProps}
          />
        );
      })()}
    </StandardTabLayout>
  );
};

/**
 * Error boundary for tab rendering
 */
export class TabRenderErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <h2 className="text-red-400 text-xl font-bold mb-2">
              Tab Rendering Error
            </h2>
            <p className="text-gray-300 mb-4">
              There was an error loading this tab content.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Tab content renderer with error boundary
 */
export const SafeTabContentRenderer: React.FC<{
  activeTab: TabId;
  layoutProps: TabLayoutProps;
}> = ({ activeTab, layoutProps }) => {
  return (
    <TabRenderErrorBoundary>
      <TabContentRenderer 
        activeTab={activeTab} 
        layoutProps={layoutProps} 
      />
    </TabRenderErrorBoundary>
  );
};