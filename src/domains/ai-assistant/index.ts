/**
 * AI Assistant Domain
 *
 * GLM 4.0-powered AI assistant for SISO Internal
 * Provides task management, code analysis, and workflow optimization
 */

// Components
export { AIAssistantPage } from './ui/pages/AIAssistantPage';
export { ChatInterface } from './ui/components/ChatInterface';
export { ChatMessage } from './ui/components/ChatMessage';
export { ChatInput } from './ui/components/ChatInput';
export { QuickActions } from './ui/components/QuickActions';
export { TypingIndicator } from './ui/components/TypingIndicator';

// Hooks
export { useAIChat } from './hooks/useAIChat';
export { useAIContext } from './hooks/useAIContext';

// Types
export type { ChatMessage as ChatMessageType } from './types/chat';
export type { QuickAction } from './types/quick-actions';
export type { AIContext } from './types/context';

// API
export { aiAssistantAPI } from './api/ai-assistant-api';
