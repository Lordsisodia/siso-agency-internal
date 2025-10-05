
import { useState, useCallback } from 'react';
import { Bot, Send, Paperclip, Mic } from 'lucide-react';
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from '@/components/ui/expandable-chat';
import { ChatMessageList } from '@/components/ui/chat-message-list';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat-bubble';
import { ChatInput } from '@/components/ui/chat-input';
import { useToast } from '@/hooks/use-toast';

// [Analysis] Define message interface for better type safety
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// [Framework] Using React hooks pattern for chat state management
export function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: "Hello! I'm your AI tools assistant. How can I help you find the right tools for your needs?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // [Framework] Using callback pattern for better component memoization
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSubmitting) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSubmitting(true);
    
    try {
      // [Analysis] Simple response generation logic for now; can be expanded later
      const botResponse: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: generateAssistantResponse(inputValue.trim()),
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      // Simulate a delay to make it feel more natural
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate a response. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }, [inputValue, isSubmitting, toast]);
  
  // [Analysis] Simple response generation based on keywords
  function generateAssistantResponse(userInput: string): string {
    const lowerCaseInput = userInput.toLowerCase();
    
    if (lowerCaseInput.includes('daily summary') || lowerCaseInput.includes('news summary')) {
      return "You can find the daily AI news summary on the AI News page. It provides executive summaries, key points, and industry impacts specifically for agency owners.";
    }
    
    if (lowerCaseInput.includes('ai news') || lowerCaseInput.includes('news')) {
      return "Our AI News section provides daily curated articles about AI developments relevant to agency owners. You can access categorized news, impact assessments, and daily summaries.";
    }
    
    if (lowerCaseInput.includes('tools') || lowerCaseInput.includes('recommendations')) {
      return "We offer various AI tools categorized by function. You can browse them in the Tools section, where you'll find descriptions, ratings, and use cases for each tool.";
    }

    if (lowerCaseInput.includes('hello') || lowerCaseInput.includes('hi') || lowerCaseInput.includes('hey')) {
      return "Hello! I'm here to help you navigate our AI tools and features. What would you like to know about?";
    }
    
    return "I'd be happy to help you with that. You can explore our AI tools, news, and resources through the navigation menu. Is there something specific you're looking for?";
  }

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center">
        <h1 className="text-xl font-semibold">Tools Assistant ✨</h1>
        <p className="text-sm text-muted-foreground">
          Ask me anything about our AI tools
        </p>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble key={message.id} variant={message.sender === 'assistant' ? 'received' : 'sent'}>
              {message.sender === 'assistant' && (
                <ChatBubbleAvatar
                  className="h-8 w-8"
                  src="/lovable-uploads/c482563a-42db-4f47-83f2-c2e7771400b7.png"
                  fallback="AI"
                />
              )}
              <ChatBubbleMessage>
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
          {isSubmitting && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8"
                src="/lovable-uploads/c482563a-42db-4f47-83f2-c2e7771400b7.png"
                fallback="AI"
              />
              <ChatBubbleMessage>
                <div className="flex space-x-1">
                  <div className="animate-bounce delay-0">•</div>
                  <div className="animate-bounce delay-150">•</div>
                  <div className="animate-bounce delay-300">•</div>
                </div>
              </ChatBubbleMessage>
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            placeholder="Type your message..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex">
              <button type="button" className="p-2 hover:bg-accent rounded-md" disabled={isSubmitting}>
                <Paperclip className="size-4" />
              </button>
              <button type="button" className="p-2 hover:bg-accent rounded-md" disabled={isSubmitting}>
                <Mic className="size-4" />
              </button>
            </div>
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
              disabled={!inputValue.trim() || isSubmitting}
            >
              Send <Send className="size-4" />
            </button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}
