import React from 'react';

export interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number;
  onSubmit?: () => void;
  disabled: boolean;
}

/**
 * PromptInput context for sharing state between components
 * Extracted from ai-prompt-box.tsx for reusability
 */
export const PromptInputContext = React.createContext<PromptInputContextType | undefined>(undefined);

export const usePromptInput = (): PromptInputContextType => {
  const context = React.useContext(PromptInputContext);
  if (!context) {
    throw new Error('usePromptInput must be used within a PromptInputProvider');
  }
  return context;
};