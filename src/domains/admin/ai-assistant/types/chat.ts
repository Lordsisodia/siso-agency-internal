/**
 * Chat message types for AI Assistant
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  context?: {
    tasks?: any[];
    domain?: string;
    actionType?: string;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  context: AIContext;
}

export type QuickActionType =
  | 'prioritize_tasks'
  | 'productivity_report'
  | 'optimize_morning'
  | 'deep_work_plan'
  | 'code_review'
  | 'chat';
