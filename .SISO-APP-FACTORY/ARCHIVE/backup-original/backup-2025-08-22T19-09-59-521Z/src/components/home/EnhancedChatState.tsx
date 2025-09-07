import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/types/chat';
import { Bot, Command, History, Send, Copy, Notebook, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessingTree } from '@/components/chat/ProcessingTree';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

interface EnhancedChatStateProps {
  messages: ChatMessage[];
  handleSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
}

// [Analysis] Enhanced animations for a more engaging chat experience
const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// [Analysis] Suggestions provide quick access to common queries
const suggestions = [
  "How can I automate my marketing workflows?",
  "What are the best AI tools for agencies?",
  "Tell me about the latest AI news",
  "Find educational content about AI",
];

export const EnhancedChatState = ({ messages, handleSubmit, isLoading }: EnhancedChatStateProps) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(input.trim());
      setInput('');
      setShowSuggestions(false);
    }
  };

  // [Analysis] Added clipboard functionality with user feedback
  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard",
      variant: "default",
    });
  };

  // [Analysis] Added Notion export functionality
  const handleNotionExport = (content: string) => {
    // [Plan] Implement actual Notion integration in the future
    toast({
      title: "Coming soon",
      description: "Notion export functionality will be available soon!",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col w-full max-w-4xl mx-auto h-full"
      role="region"
      aria-label="Chat Interface"
    >
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 p-4 sm:p-6 scrollbar-thin scrollbar-thumb-siso-text/20 scrollbar-track-transparent">
        <AnimatePresence mode="sync">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg",
                message.role === 'assistant' 
                  ? "bg-black/20 border border-siso-text/10" 
                  : "bg-transparent"
              )}
            >
              {message.role === 'assistant' && (
                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-siso-red to-siso-orange flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-siso-text">
                    {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                  </span>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-siso-text/50 hover:text-siso-text"
                        onClick={() => handleCopyToClipboard(message.content)}
                        aria-label="Copy message"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="prose prose-invert max-w-none">
                  {message.loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-siso-orange" />
                      <span className="text-siso-text/80">Thinking...</span>
                    </div>
                  ) : (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced Input Section */}
      <div className="border-t border-siso-text/10 bg-black/30 p-4 sm:p-6">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-2"
            >
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="border-siso-text/20 text-siso-text hover:bg-siso-orange/10 hover:text-siso-orange"
                  onClick={() => {
                    setInput(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </motion.div>
          )}

          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={cn(
                  "w-full bg-black/30 text-white placeholder-siso-text/50",
                  "rounded-lg px-4 py-3 pr-12",
                  "focus:outline-none focus:ring-2 focus:ring-siso-orange/50",
                  "border border-siso-text/10 focus:border-siso-orange/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={isLoading}
                onFocus={() => setShowSuggestions(true)}
                aria-label="Message input"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-siso-text/50 hover:text-siso-text"
                onClick={() => setShowSuggestions(!showSuggestions)}
                aria-label="Show suggestions"
              >
                <Command className="w-4 h-4" />
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                "bg-gradient-to-r from-siso-orange to-siso-red text-white",
                "px-6 py-3 rounded-lg",
                "hover:opacity-90 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-siso-orange/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
