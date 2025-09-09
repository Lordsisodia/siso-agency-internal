import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Terminal,
  Loader2,
  FolderOpen,
  Send,
  Settings
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { api } from "@/shared/lib/claudia-api";
import { ErrorBoundary } from "./ErrorBoundary";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Textarea } from "@/shared/ui/textarea";

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'error';
}

interface ClaudeCodeSessionProps {
  resumeSession?: {
    id: string;
    projectPath: string;
  };
  onBack?: () => void;
  hideBack?: boolean;
  className?: string;
}

export function ClaudeCodeSession({ 
  resumeSession, 
  onBack, 
  hideBack = false,
  className 
}: ClaudeCodeSessionProps) {
  const [projectPath, setProjectPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('claude-3-sonnet');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resumeSession) {
      setProjectPath(resumeSession.projectPath);
      // In a real implementation, you'd load the session history here
    }
  }, [resumeSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'assistant' | 'system', content: string, status?: Message['status']) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date(),
      status
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const handleSelectDirectory = async () => {
    const path = window.prompt('Enter project directory path:');
    if (path) {
      setProjectPath(path);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const userPrompt = prompt.trim();
    setPrompt('');
    setIsLoading(true);

    // Add user message
    addMessage('user', userPrompt);

    // Add pending assistant message
    const assistantMessageId = addMessage('assistant', 'Executing Claude Code...', 'pending');

    try {
      // Use the existing Claudia API to execute Claude Code
      const response = await api.executeClaudeCode(
        projectPath || process.cwd(), 
        userPrompt, 
        model
      );

      updateMessage(assistantMessageId, {
        content: response || 'Claude Code execution completed successfully.',
        status: 'completed'
      });
    } catch (error) {
      updateMessage(assistantMessageId, {
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user':
        return '👤';
      case 'assistant':
        return '🤖';
      case 'system':
        return '⚙️';
      default:
        return '💬';
    }
  };

  return (
    <ErrorBoundary>
      <div className={cn("flex flex-col h-full bg-gray-900", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {!hideBack && onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Terminal className="h-5 w-5 text-orange-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Claude Code Session</h2>
              <p className="text-xs text-gray-400">Using Claudia API</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isLoading ? "destructive" : "secondary"}>
              {isLoading ? 'Running' : 'Ready'}
            </Badge>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
          </div>
        </div>

        {/* Project Path */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Input
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="/path/to/your/project (optional)"
              className="flex-1 bg-gray-800 border-gray-600 text-white"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSelectDirectory}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start by entering a prompt below.</p>
              <p className="text-sm mt-2">This uses the existing Claudia API system</p>
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getMessageIcon(message.type)}</span>
                  <span className="text-sm font-medium text-gray-300 capitalize">
                    {message.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.status && (
                    <Badge variant="outline" className={getMessageStatusColor(message.status)}>
                      {message.status}
                    </Badge>
                  )}
                </div>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono">
                      {message.content}
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt for Claude Code... (e.g., 'Add a new API endpoint for user authentication')"
            className="min-h-[100px] bg-gray-800 border-gray-600 text-white resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              {projectPath ? `Working in: ${projectPath}` : 'Using current directory'}
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Press Cmd/Ctrl + Enter to send • Using model: {model}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}