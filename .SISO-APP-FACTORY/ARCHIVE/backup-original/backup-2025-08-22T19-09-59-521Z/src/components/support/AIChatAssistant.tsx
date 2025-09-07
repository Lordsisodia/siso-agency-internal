/**
 * AI Chat Assistant for Partnership Support
 * 
 * An intelligent chat interface that helps partners find answers to their questions
 * using the knowledge base and AI responses. Provides instant support for
 * partnership-related queries, referral assistance, and technical help.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  sources?: string[];
  helpful?: boolean | null;
}

interface AIChatAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function AIChatAssistant({ isOpen, onToggle, className }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Hi! I'm your SISO Partnership Assistant. I can help you with:\n\n• Partnership program questions\n• Commission and payment inquiries\n• Referral process guidance\n• Technical support\n• Best practices for success\n\nWhat would you like to know?",
      timestamp: new Date(),
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Knowledge base for AI responses
  const knowledgeBase = {
    commission: {
      keywords: ['commission', 'payment', 'earnings', 'rate', 'percentage', 'money'],
      content: "SISO Partnership Commission Structure:\n\n• **Standard Rate**: 15% for basic services\n• **Premium Rate**: 20% for enterprise clients\n• **Recurring**: 10% monthly for ongoing services\n• **Bonus Tiers**: Up to 25% for top performers\n\n**Payment Schedule**: Monthly payouts for earnings above £100\n**Payment Methods**: Bank transfer, PayPal, Wise"
    },
    referrals: {
      keywords: ['referral', 'client', 'submit', 'refer', 'new client', 'lead'],
      content: "How to Submit Referrals:\n\n1. **Complete your partner profile** first\n2. **Use your unique referral link** from the dashboard\n3. **Gather client information**: Company details, project scope, budget\n4. **Submit through the referral form** in your dashboard\n5. **Follow up** within 48 hours\n\n**Best Practices**:\n• Warm introductions work best\n• Understand client needs thoroughly\n• Provide clear value propositions"
    },
    tracking: {
      keywords: ['track', 'tracking', 'status', 'progress', 'dashboard'],
      content: "Referral Tracking System:\n\n• **Real-time updates** on referral status\n• **Commission calculator** shows potential earnings\n• **Progress notifications** via email and dashboard\n• **Performance analytics** to optimize results\n\n**Statuses**:\n• Submitted → Under Review → Approved → In Progress → Completed"
    },
    requirements: {
      keywords: ['requirements', 'qualify', 'criteria', 'eligibility', 'join'],
      content: "Partnership Requirements:\n\n• **Professional network** in business/tech\n• **Commitment** to quality referrals\n• **Understanding** of SISO services\n• **Active communication** with potential clients\n\n**No upfront costs** or minimum commitments required!"
    },
    support: {
      keywords: ['help', 'support', 'contact', 'problem', 'issue', 'assistance'],
      content: "Support Channels:\n\n• **Live Chat**: Available 9AM-6PM GMT (< 5 min response)\n• **Email**: partners@siso.agency (< 4 hours)\n• **Phone**: +44 (0) 20 1234 5678\n• **Training Hub**: Self-paced learning resources\n\n**Emergency Support**: For urgent issues, mark emails as 'URGENT'"
    },
    training: {
      keywords: ['training', 'learn', 'course', 'education', 'guide', 'tutorial'],
      content: "Partnership Training Resources:\n\n• **Video Library**: 45+ training videos\n• **Partner Handbook**: Comprehensive PDF guide\n• **Live Workshops**: Monthly Q&A sessions\n• **Best Practices**: Proven referral strategies\n• **Case Studies**: Success stories and lessons\n\nAccess all training materials in the Training Hub!"
    }
  };

  const getAIResponse = (userMessage: string): { content: string; sources: string[] } => {
    const lowerMessage = userMessage.toLowerCase();
    let bestMatch = { score: 0, response: '', sources: [] as string[] };

    // Check each knowledge base category
    Object.entries(knowledgeBase).forEach(([category, data]) => {
      const score = data.keywords.reduce((acc, keyword) => {
        return lowerMessage.includes(keyword) ? acc + 1 : acc;
      }, 0);

      if (score > bestMatch.score) {
        bestMatch = {
          score,
          response: data.content,
          sources: [`Knowledge Base: ${category.charAt(0).toUpperCase() + category.slice(1)}`]
        };
      }
    });

    // Default response if no good match
    if (bestMatch.score === 0) {
      return {
        content: "I'd be happy to help! Here are some common topics I can assist with:\n\n• **Commission & Payments** - Rates, schedules, methods\n• **Referral Process** - How to submit and track referrals\n• **Partnership Requirements** - Eligibility and criteria\n• **Training Resources** - Guides, videos, and best practices\n• **Technical Support** - Dashboard and platform help\n\nCould you please be more specific about what you'd like to know?",
        sources: ['General Help']
      };
    }

    return {
      content: bestMatch.response,
      sources: bestMatch.sources
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage.content);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        sources: aiResponse.sources
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Chat cleared! How can I help you today?",
      timestamp: new Date(),
      sources: []
    }]);
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={onToggle}
          className="h-14 w-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className={cn(
        "fixed bottom-6 right-6 z-50 w-96 bg-black border border-orange-500/20 rounded-xl shadow-2xl",
        isMinimized ? "h-16" : "h-[600px]",
        className
      )}
    >
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b border-orange-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm text-white">SISO AI Assistant</CardTitle>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <CardContent className="p-0 h-[440px] flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex",
                      message.type === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] rounded-lg p-3 space-y-2",
                      message.type === 'user' 
                        ? "bg-orange-600 text-white ml-4" 
                        : "bg-gray-800 text-gray-100 mr-4"
                    )}>
                      <div className="flex items-start space-x-2">
                        {message.type === 'ai' && (
                          <Sparkles className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.sources.map((source, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                            </span>
                            
                            {message.type === 'ai' && (
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyMessage(message.content)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, true)}
                                  className={cn(
                                    "h-6 w-6 p-0",
                                    message.helpful === true ? "text-green-400" : "text-gray-400 hover:text-green-400"
                                  )}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, false)}
                                  className={cn(
                                    "h-6 w-6 p-0",
                                    message.helpful === false ? "text-red-400" : "text-gray-400 hover:text-red-400"
                                  )}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-800 text-gray-100 mr-4 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 text-orange-400 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex flex-wrap gap-1 mb-3">
                {[
                  "How do commissions work?",
                  "How to submit referrals?",
                  "Payment schedule?",
                  "Training resources?"
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(suggestion)}
                    className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex space-x-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about partnerships, commissions, referrals..."
                  className="flex-1 min-h-[40px] max-h-[100px] bg-gray-800 border-gray-600 text-white resize-none"
                  rows={1}
                />
                <div className="flex flex-col space-y-1">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white p-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    className="border-gray-600 text-gray-400 hover:bg-gray-700 p-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </motion.div>
  );
}