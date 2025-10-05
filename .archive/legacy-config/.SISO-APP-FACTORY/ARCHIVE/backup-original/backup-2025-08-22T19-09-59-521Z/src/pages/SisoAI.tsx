import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Brain, Sparkles, Bot, Wrench, GraduationCap, Network, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

type AssistantType = 'general' | 'tools' | 'education' | 'automations' | 'assistants' | 'ai' | 'networking' | 'news';

const assistantTypes = [
  { id: 'general', label: 'General Assistant', icon: Bot, description: 'Your all-purpose AI assistant for any question' },
  { id: 'tools', label: 'Tools Expert', icon: Wrench, description: 'Specialized in AI tools and their implementation' },
  { id: 'education', label: 'Education Guide', icon: GraduationCap, description: 'Helps with learning resources and paths' },
  { id: 'automations', label: 'Automation Specialist', icon: Bot, description: 'Expert in workflow automation' },
  { id: 'assistants', label: 'AI Assistant Expert', icon: MessageSquare, description: 'Guides you in choosing AI assistants' },
  { id: 'networking', label: 'Networking Guide', icon: Network, description: 'Helps with community connections' },
  { id: 'ai', label: 'AI Specialist', icon: Brain, description: 'Deep expertise in AI implementation' },
] as const;

const getAssistantPrompt = (type: AssistantType) => {
  switch (type) {
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

const SisoAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your SISO AI assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantType>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (message: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: { 
          message,
          systemPrompt: getAssistantPrompt(selectedAssistant)
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from assistant. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssistantChange = (type: AssistantType) => {
    setSelectedAssistant(type);
    setMessages([{ 
      role: 'assistant', 
      content: `Hello! I'm your ${assistantTypes.find(a => a.id === type)?.label}. How can I help you today?` 
    }]);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-siso-bg to-siso-bg/95">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="border-b border-siso-text/10 bg-siso-bg/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-siso-red" />
                <h1 className="text-xl font-semibold text-siso-text-bold">SISO AI</h1>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-siso-text/5 hover:bg-siso-text/10 transition-colors">
                    <div className="flex items-center gap-2">
                      {React.createElement(assistantTypes.find(a => a.id === selectedAssistant)?.icon || Bot, {
                        className: "h-4 w-4 text-siso-orange"
                      })}
                      <span className="text-sm font-medium text-siso-text">
                        {assistantTypes.find(a => a.id === selectedAssistant)?.label}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-siso-text/70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px] bg-siso-bg border border-siso-text/10">
                  <AnimatePresence>
                    {assistantTypes.map((type) => (
                      <DropdownMenuItem
                        key={type.id}
                        className="flex items-start gap-3 p-3 hover:bg-siso-text/5 cursor-pointer"
                        onClick={() => handleAssistantChange(type.id as AssistantType)}
                      >
                        <div className="mt-1">
                          {React.createElement(type.icon, {
                            className: "h-4 w-4 text-siso-orange"
                          })}
                        </div>
                        <div>
                          <div className="font-medium text-siso-text">{type.label}</div>
                          <div className="text-sm text-siso-text/70">{type.description}</div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </AnimatePresence>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-[100px]" /> {/* Spacer for alignment */}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 container mx-auto max-w-5xl px-4">
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1 px-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 py-4"
                >
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      role={message.role}
                      content={message.content}
                      assistantType={assistantTypes.find(a => a.id === selectedAssistant)?.label}
                      isLoading={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </motion.div>
              </ScrollArea>
              
              <div className="py-4">
                <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SisoAI;
