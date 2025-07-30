
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export const useEducationChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "Hi! I'm your Education Assistant. I can help you:\n• Find relevant courses and videos\n• Get learning recommendations\n• Track your progress\n• Answer questions about topics\n\nWhat would you like to learn today?",
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: {
          message: content,
          systemPrompt: `You are an educational assistant for the SISO platform. Help users find educational content, 
          track their learning progress, and understand various topics. Keep responses friendly, encouraging, and focused 
          on learning. You can recommend videos, suggest learning paths, and answer questions about educational content.
          Format your responses using markdown for better readability.`
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Message failed to send",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage
  };
};
