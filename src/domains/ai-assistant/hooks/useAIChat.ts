/**
 * useAIChat Hook
 *
 * Manages chat state and interactions
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { aiAssistantAPI } from '../api/ai-assistant-api';
import type { ChatMessage } from '../types/chat';
import type { AIContext } from '../types/context';

interface UseAIChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export function useAIChat() {
  const [state, setState] = useState<UseAIChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const sendMessage = useCallback(
    async (content: string, context?: AIContext) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
        context: context
          ? {
              domain: context.domain,
              actionType: context.section,
            }
          : undefined,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        // Call AI API
        const response = await aiAssistantAPI.sendMessage({
          query: content,
          context,
        });

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          context: context
            ? {
                domain: context.domain,
                actionType: context.section,
              }
            : undefined,
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));

        // If there are suggestions, could add them as follow-up quick actions
        if (response.suggestions && response.suggestions.length > 0) {
          console.log('[AI Chat] Suggestions:', response.suggestions);
        }
      } catch (error: any) {
        console.error('[AI Chat] Error:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error.message ||
            'Sorry, I encountered an error. Please try again.',
        }));
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearMessages,
  };
}
