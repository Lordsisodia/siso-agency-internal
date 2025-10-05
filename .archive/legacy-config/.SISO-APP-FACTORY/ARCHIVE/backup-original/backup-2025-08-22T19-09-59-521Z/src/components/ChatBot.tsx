
import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  steps?: {
    thinking?: string;
    searching?: string;
    response?: string;
  };
}

interface ChatBotProps {
  agentType: 'general' | 'tools' | 'education' | 'automations' | 'assistants' | 'ai' | 'networking' | 'news';
}

const getAgentPrompt = (agentType: ChatBotProps['agentType']) => {
  switch (agentType) {
    case 'tools':
      return "You are a SISO Tools expert. Help users find and understand various tools, their features, pricing, and best use cases. Focus on providing practical advice about tool selection and implementation.";
    case 'education':
      return "You are a SISO Education specialist. Guide users through available courses, educational content, and learning paths. Help them find the most relevant educational resources for their needs.";
    case 'automations':
      return "You are a SISO Automation expert. Help users understand different automation workflows, integration possibilities, and best practices for implementing automations in their business.";
    case 'assistants':
      return "You are a SISO AI Assistants specialist. Guide users in selecting and implementing the right AI assistants for their specific needs, explaining capabilities and use cases.";
    case 'networking':
      return "You are a SISO Networking expert. Help users connect with relevant communities, find networking opportunities, and make the most of SISO's networking resources.";
    case 'ai':
      return "You are SISO's AI Implementation specialist. Guide users in leveraging AI technologies, understanding AI capabilities, and implementing AI solutions in their business.";
    case 'news':
      return "You are SISO's AI News specialist. Help users stay updated with the latest AI news, explain recent developments, and provide context about AI industry trends and breakthroughs.";
    default:
      return "You are SISO's general assistant. Help users navigate the platform, find resources, and answer general questions about SISO's services and features.";
  }
};

export const ChatBot = ({ agentType }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Add initial loading message with first thinking step
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '',
      steps: {
        thinking: "🤔 Analyzing your question..."
      }
    }]);

    // Simulate sequential thinking steps
    setTimeout(() => {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.role === 'assistant') {
          return [...prev.slice(0, -1), {
            ...lastMsg,
            steps: {
              ...lastMsg.steps,
              searching: "🔍 Searching for relevant information..."
            }
          }];
        }
        return prev;
      });
    }, 1000);

    setTimeout(() => {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.role === 'assistant') {
          return [...prev.slice(0, -1), {
            ...lastMsg,
            steps: {
              ...lastMsg.steps,
              response: "✨ Preparing your response..."
            }
          }];
        }
        return prev;
      });
    }, 2000);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: { 
          message: userMessage,
          systemPrompt: getAgentPrompt(agentType)
        },
      });

      if (error) throw error;

      // Replace loading message with actual response
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response. Please try again.",
      });
      // Remove loading message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentTitle = () => {
    switch (agentType) {
      case 'tools': return 'Tools Expert';
      case 'education': return 'Education Guide';
      case 'automations': return 'Automation Specialist';
      case 'assistants': return 'AI Assistant Expert';
      case 'networking': return 'Networking Guide';
      case 'ai': return 'AI Specialist';
      default: return 'SISO Assistant';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 animate-glow"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <div className="w-[350px] h-[500px] bg-siso-bg border border-siso-text/10 rounded-lg shadow-lg flex flex-col">
          <div className="p-4 border-b border-siso-text/10 flex justify-between items-center bg-gradient-to-r from-siso-red/10 to-siso-orange/10">
            <h3 className="font-semibold text-siso-text">{getAgentTitle()}</h3>
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
            {messages.length === 0 && (
              <div className="text-center text-siso-text/70 mt-4">
                👋 Hi! I'm your {getAgentTitle()}. How can I help you today?
              </div>
            )}
            <AnimatePresence mode="wait">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-siso-orange/20 text-siso-text ml-4'
                        : 'bg-siso-text/10 text-siso-text mr-4'
                    }`}
                  >
                    {message.steps ? (
                      <AnimatePresence mode="wait">
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {Object.values(message.steps).map((step, stepIndex) => (
                            <motion.div
                              key={stepIndex}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: stepIndex * 0.3 }}
                              className="text-sm text-siso-text/80"
                            >
                              {step}
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-siso-text/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-siso-text/5 border border-siso-text/10 rounded-lg px-4 py-2 text-siso-text placeholder:text-siso-text/50 focus:outline-none focus:ring-2 focus:ring-siso-orange/50"
                disabled={isLoading}
              />
              <Button 
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-siso-red to-siso-orange text-white hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
