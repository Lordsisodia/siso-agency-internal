import React, { useState } from 'react';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';

// Types extracted from AdminTasks.tsx
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: 'overdue' | 'due-today' | 'upcoming' | 'in-progress' | 'blocked' | 'not-started' | 'started' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  category: 'development' | 'design' | 'marketing' | 'client' | 'admin';
  tags?: string[];
  estimatedHours?: number;
  subtasks?: Subtask[];
  progress?: number;
  description?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AITaskChatProps {
  tasks: Task[];
  chatMessages: ChatMessage[];
  onTasksUpdate: (updatedTasks: Task[]) => void;
  onChatUpdate: (messages: ChatMessage[]) => void;
  onTaskRefresh: () => void;
  isAIEnabled?: boolean;
}

/**
 * AITaskChat - AI-powered chat interface for task management
 * 
 * Extracted from AdminTasks.tsx (1,338 lines → focused component)
 * Handles all AI chat functionality and task assistance
 */
export const AITaskChat: React.FC<AITaskChatProps> = ({
  tasks,
  chatMessages,
  onTasksUpdate,
  onChatUpdate,
  onTaskRefresh,
  isAIEnabled = true
}) => {
  const [currentMessage, setCurrentMessage] = useState('');

  const sendMessage = (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    const updatedMessages = [...chatMessages, userMessage];
    onChatUpdate(updatedMessages);
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I understand you need help with: "' + message + '". Let me assist you with that task.',
        sender: 'assistant',
        timestamp: new Date()
      };
      onChatUpdate([...updatedMessages, assistantMessage]);
    }, 1000);
  };

  if (!isAIEnabled) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-gray-500/30 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gray-500/20 to-gray-600/10 backdrop-blur-sm shadow-lg">
              <div className="w-8 h-8 border-l-2 border-t-2 border-gray-400 transform rotate-45"></div>
            </div>
          </div>
          <h2 className="text-xl text-gray-400 mb-4 font-medium">
            AI Chat Disabled
          </h2>
          <p className="text-sm text-gray-500">
            Enable AI assistance to get help with your tasks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#252525' }}>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {chatMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-orange-500/30 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-sm shadow-lg">
                  <div className="w-8 h-8 border-l-2 border-t-2 border-orange-400 transform rotate-45"></div>
                </div>
              </div>
              <h2 className="text-2xl text-white mb-8 font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                What can I help with?
              </h2>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="space-y-6">
              {chatMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar/Logo */}
                    <div className="flex-shrink-0 mb-1">
                      {message.sender === 'user' ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-orange-500/30 shadow-lg">
                          <img 
                            src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                            alt="SISO" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30 flex items-center justify-center backdrop-blur-sm shadow-lg">
                          <div className="w-5 h-5 border-l-2 border-t-2 border-orange-400 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`relative p-4 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/20' 
                        : 'bg-gray-800/80 text-gray-100 border border-gray-700/50 shadow-gray-900/20'
                    }`}>
                      <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2 font-medium">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Chat Input with Background */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
        {/* Background behind input box - simplified approach */}
        <div className="bg-red-500 rounded-3xl p-4">
          <PromptInputBox 
            onSend={(message, files) => sendMessage(message)} 
            placeholder="Message SISO..." 
            className="shadow-xl backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );
};