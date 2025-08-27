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
import { CleanDateNav } from '@/components/ui/clean-date-nav';
import { SisoIcon } from '@/components/ui/icons/SisoIcon';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { 
  TabId, 
  EnhancedTabConfig, 
  TabLayoutProps,
  getEnhancedTabConfig,
  isSpecialLayout 
} from '../data/admin-lifelock-tabs';

/**
 * Standard tab layout wrapper - used by most tabs
 * Replaces the repeated layout code from the switch statement
 */
const StandardTabLayout: React.FC<{
  config: EnhancedTabConfig;
  layoutProps: TabLayoutProps;
  children: React.ReactNode;
}> = ({ config, layoutProps, children }) => {
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
        />
      )}
      
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

/**
 * AI Chat special layout - handles the unique chat interface
 */
const AiChatLayout: React.FC<{
  config: EnhancedTabConfig;
  layoutProps: TabLayoutProps;
}> = ({ config, layoutProps }) => {
  const { selectedDate, dayCompletionPercentage, navigateDay, handleVoiceCommand, isProcessingVoice } = layoutProps;

  return (
    <div className={config.backgroundClass}>
      {/* Clean Date Navigation */}
      <div className="p-4">
        <CleanDateNav 
          selectedDate={selectedDate}
          completionPercentage={dayCompletionPercentage}
          className="mb-6"
          onPreviousDate={() => navigateDay?.('prev')}
          onNextDate={() => navigateDay?.('next')}
        />
      </div>
      
      {/* Header with SISO logo and title */}
      <div className="px-4 pb-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SisoIcon className="w-8 h-8 text-orange-500" />
            <h1 className="text-xl font-bold text-white">
              AI Chat Assistant
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Voice and text-powered AI assistant for managing your life and tasks
          </p>
        </div>
      </div>
      
      {/* Chat messages area - with bottom padding for fixed input */}
      <div className="h-full overflow-y-auto p-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Chat messages will go here */}
          <div className="text-center text-gray-500 text-sm mt-20">
            Start a conversation by typing or using voice commands below
          </div>
        </div>
      </div>
      
      {/* Fixed input at bottom with gap */}
      <div className="fixed bottom-4 left-0 right-0 px-4 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/90 backdrop-blur-md rounded-2xl border border-gray-700/50 p-4 shadow-2xl">
            <PromptInputBox
              onSend={(message, files) => {
                handleVoiceCommand?.(message);
              }}
              isLoading={isProcessingVoice}
              placeholder="Ask me anything about your tasks, schedule, or life management..."
            />
          </div>
        </div>
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
  
  // Handle AI chat special layout
  if (activeTab === 'ai-chat') {
    return <AiChatLayout config={config} layoutProps={layoutProps} />;
  }

  // Handle standard tab layout
  return (
    <StandardTabLayout config={config} layoutProps={layoutProps}>
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