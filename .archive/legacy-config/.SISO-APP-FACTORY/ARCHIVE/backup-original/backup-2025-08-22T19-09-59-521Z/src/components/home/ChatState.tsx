
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessingTree } from '@/components/chat/ProcessingTree';
import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatStateProps {
  messages: ChatMessageType[];
  handleSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatState = ({ messages, handleSubmit, isLoading }: ChatStateProps) => {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = e.currentTarget.querySelector('input')?.value;
    if (message?.trim()) {
      handleSubmit(message.trim());
      e.currentTarget.reset();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col w-full max-w-4xl mx-auto h-full"
    >
      <div className="flex-1 overflow-y-auto space-y-6 p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <AnimatePresence mode="sync">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              assistantType={message.role === 'assistant' ? 'AI Assistant' : undefined}
              isLoading={message.loading}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-white/10">
        <form 
          onSubmit={handleFormSubmit}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full bg-black/30 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-siso-orange/50 border border-white/10"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "absolute right-3 rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-sm",
              "bg-gradient-to-r from-siso-orange to-siso-red hover:from-siso-orange/90 hover:to-siso-red/90",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-siso-orange",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Send
          </button>
        </form>
      </div>
    </motion.div>
  );
};
