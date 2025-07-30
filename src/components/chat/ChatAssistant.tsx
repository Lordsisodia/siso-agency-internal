
import { useState, useRef, useEffect } from 'react';
import { Bot, User, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageLoading } from '@/components/ui/message-loading';
import { supabase } from '@/integrations/supabase/client';
import { SisoIcon } from '@/components/ui/icons/SisoIcon';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to the dashboard! I'm SISO, your personal assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Simple responses for now, could be connected to AI in the future
      const responses = [
        "I can help you build and manage apps for your clients.",
        "Would you like me to show you how to create a new project?",
        "You can find more tutorials in the Help section.",
        "Let me know if you have any specific questions about the platform.",
        "I can guide you through the onboarding process if you'd like."
      ];
      
      // Simulate API delay
      setTimeout(() => {
        const assistantMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: responses[Math.floor(Math.random() * responses.length)]
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
        >
          <SisoIcon className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-[350px] h-[500px] bg-siso-bg border border-siso-text/10 rounded-lg shadow-lg flex flex-col"
        >
          <div className="p-4 border-b border-siso-text/10 flex justify-between items-center bg-gradient-to-r from-siso-red/10 to-siso-orange/10">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-siso-red to-siso-orange flex items-center justify-center mr-2">
                <SisoIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-siso-text">SISO Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-siso-text/10"
            >
              <X className="h-4 w-4 text-siso-text" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${
                      message.role === 'assistant' 
                        ? 'bg-gradient-to-r from-siso-red to-siso-orange' 
                        : 'bg-siso-text/30'
                    } ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                      {message.role === 'assistant' ? <SisoIcon className="w-4 h-4 text-white" /> : <User size={16} />}
                    </div>
                    
                    <div className="flex flex-col">
                      {message.role === 'assistant' && (
                        <span className="text-xs text-siso-text-muted ml-2 mb-1">SISO</span>
                      )}
                      <div className={`rounded-2xl p-3 ${
                        message.role === 'assistant'
                          ? 'bg-black/40 text-white border border-siso-text/10'
                          : 'bg-siso-orange/90 text-black'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex max-w-[80%] flex-row">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full shrink-0 bg-gradient-to-r from-siso-red to-siso-orange mr-2">
                      <SisoIcon className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-siso-text-muted ml-2 mb-1">SISO</span>
                      <div className="rounded-2xl p-3 bg-black/40 text-white border border-siso-text/10">
                        <MessageLoading />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-siso-text/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && input.trim()) {
                    handleSendMessage();
                  }
                }}
                placeholder="Ask SISO..."
                className="flex-1 bg-black/30 border border-siso-text/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-siso-red/50"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-siso-red to-siso-orange text-white hover:opacity-90"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
