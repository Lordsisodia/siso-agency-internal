/**
 * Chat Input Component
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Ask me anything about your tasks, productivity, or code...',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setMessage('');

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 p-4">
      <div className="flex gap-2 items-end max-w-4xl mx-auto">
        {/* Voice input button (future use) */}
        <button
          disabled={disabled}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            'bg-gray-800 hover:bg-gray-700',
            'text-gray-400 hover:text-white',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Voice input (coming soon)"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-12 rounded-2xl',
              'bg-gray-800 text-white placeholder-gray-500',
              'border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              'resize-none overflow-hidden',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
        </div>

        {/* Send button */}
        <motion.button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-blue-500 to-purple-600',
            'hover:from-blue-600 hover:to-purple-700',
            'text-white shadow-lg',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            !disabled && message.trim() && 'scale-105'
          )}
          whileHover={!disabled && message.trim() ? { scale: 1.1 } : {}}
          whileTap={!disabled && message.trim() ? { scale: 0.95 } : {}}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatInput;
