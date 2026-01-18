/**
 * Chat Interface Component
 * Main chat UI container
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { TypingIndicator } from './TypingIndicator';
import { useAIChat } from '../../hooks/useAIChat';
import { useAIContext } from '../../hooks/useAIContext';
import type { QuickAction } from '../../types/quick-actions';

interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
  } = useAIChat();

  const { context } = useAIContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, context);
  };

  const handleQuickAction = async (action: QuickAction) => {
    await sendMessage(action.prompt, {
      ...context,
      actionType: action.type,
    });
  };

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className || ''}`}>
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              SISO AI Assistant
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h1>
            <p className="text-xs text-gray-400">
              Your AI-powered task management companion
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Welcome to SISO AI! 👋
              </h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                I'm here to help you manage tasks, boost productivity, and optimize your workflows.
                Try a quick action or ask me anything!
              </p>

              {/* Quick Actions */}
              <div className="mt-8">
                <QuickActions
                  onActionClick={handleQuickAction}
                  disabled={isLoading}
                />
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder={
          messages.length === 0
            ? "How can I help you today?"
            : "Continue the conversation..."
        }
      />
    </div>
  );
};

export default ChatInterface;
