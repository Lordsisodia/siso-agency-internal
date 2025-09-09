import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { PromptInputBox } from '@/shared/ui/ai-prompt-box';
import { format } from 'date-fns';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Clock,
  Target,
  Calendar
} from 'lucide-react';

interface AIChatViewProps {
  currentDate: Date;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'suggestion' | 'task' | 'normal';
}

const quickCommands = [
  { label: 'Schedule my day', command: 'Help me schedule my tasks for today' },
  { label: 'Add workout', command: 'Add a 30-minute workout to my routine' },
  { label: 'Review progress', command: 'How am I doing this week?' },
  { label: 'Optimize schedule', command: 'Suggest optimizations for my daily routine' }
];

export function AIChatView({ currentDate }: AIChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: `Good ${getTimeOfDay()}! I'm your AI assistant. I can help you organize tasks, optimize your schedule, and track your progress. What would you like to work on today?`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'normal'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (userInput: string, files?: File[]) => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userInput.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'normal'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const lowerInput = userInput.toLowerCase();
    
    let response = "I understand you'd like help with that. ";
    let type: 'suggestion' | 'task' | 'normal' = 'normal';

    if (lowerInput.includes('schedule') || lowerInput.includes('plan')) {
      response = "I can help you optimize your schedule! Based on your current routine, I suggest blocking 2-3 hours for deep work in the morning when your focus is strongest. Would you like me to create a detailed time-blocked schedule for today?";
      type = 'suggestion';
    } else if (lowerInput.includes('workout') || lowerInput.includes('exercise')) {
      response = "Great choice! I've noticed you prefer 30-minute home workouts. I can add a workout session to your schedule. What time works best for you today?";
      type = 'task';
    } else if (lowerInput.includes('progress') || lowerInput.includes('stats')) {
      response = "You're doing fantastic this week! You've completed 91% of your tasks and maintained a 12-day streak. Your daily XP is above average at 850 points. Keep up the great work!";
      type = 'normal';
    } else if (lowerInput.includes('optimize') || lowerInput.includes('improve')) {
      response = "I've analyzed your patterns and have some suggestions: 1) Move your workout earlier to boost morning energy, 2) Group similar tasks together to reduce context switching, 3) Add 15-minute breaks between deep work sessions. Would you like me to implement these changes?";
      type = 'suggestion';
    } else {
      response = "I'm here to help with task management, scheduling, and productivity optimization. You can ask me to schedule tasks, review your progress, or suggest improvements to your routine. What would you like to focus on?";
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'ai',
      timestamp: new Date(),
      type
    };
  };

  const handleQuickCommand = (command: string) => {
    handleSendMessage(command);
  };

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Header */}
      <div className="text-center py-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Bot className="h-6 w-6 text-blue-400" />
          AI Assistant
        </h2>
        <p className="text-gray-400">{format(currentDate, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Quick Commands */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          {quickCommands.map((cmd, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickCommand(cmd.command)}
              className="text-xs h-auto py-2 px-3 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {cmd.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-blue-400" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-1' : ''}`}>
              <div className={`rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'suggestion'
                  ? 'bg-yellow-500/10 border border-yellow-500/30 text-white'
                  : message.type === 'task'
                  ? 'bg-green-500/10 border border-green-500/30 text-white'
                  : 'bg-gray-700 text-white'
              }`}>
                <p className="text-sm">{message.content}</p>
                
                {message.type === 'suggestion' && (
                  <Badge variant="outline" className="mt-2 text-yellow-400 border-yellow-500">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Suggestion
                  </Badge>
                )}
                
                {message.type === 'task' && (
                  <Badge variant="outline" className="mt-2 text-green-400 border-green-500">
                    <Target className="h-3 w-3 mr-1" />
                    Task
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {format(message.timestamp, 'HH:mm')}
              </div>
            </div>

            {message.sender === 'user' && (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-blue-400" />
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* AI Prompt Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <PromptInputBox
          onSend={handleSendMessage}
          isLoading={isTyping}
          placeholder="Ask me to schedule tasks, review progress, or optimize your routine..."
          className="w-full"
        />
      </div>
    </div>
  );
}