/**
 * Chat Message Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3 mb-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
            : 'bg-gradient-to-br from-blue-500 to-purple-600'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex-1 max-w-[80%] rounded-2xl px-4 py-2',
          isUser
            ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-tr-sm'
            : 'bg-gray-800 text-gray-100 rounded-tl-sm'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Context info */}
        {message.context && (
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <div className="flex gap-2 flex-wrap">
              {message.context.domain && (
                <span className="text-xs px-2 py-1 bg-gray-700/50 rounded">
                  {message.context.domain}
                </span>
              )}
              {message.context.actionType && (
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                  {message.context.actionType}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={cn(
            'text-xs mt-1 opacity-70',
            isUser ? 'text-yellow-100' : 'text-gray-400'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
