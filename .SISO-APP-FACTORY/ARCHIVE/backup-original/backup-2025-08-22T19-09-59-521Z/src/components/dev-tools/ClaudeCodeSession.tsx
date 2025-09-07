import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Terminal, 
  Play, 
  Square, 
  FolderOpen,
  Loader2,
  Settings,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClaudeService, getCurrentSession } from '@/services/claude-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ClaudeCodeSessionProps {
  onBack?: () => void;
  initialProjectPath?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'error';
}

export const ClaudeCodeSession: React.FC<ClaudeCodeSessionProps> = ({
  onBack,
  initialProjectPath = ''
}) => {
  const [projectPath, setProjectPath] = useState(initialProjectPath);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const claudeSession = useRef<ClaudeService>(getCurrentSession());

  // Check if API key is configured on mount
  useEffect(() => {
    if (!ClaudeService.isConfigured()) {
      setShowApiKeyDialog(true);
    }
  }, []);

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

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      ClaudeService.saveApiKey(apiKey.trim());
      setShowApiKeyDialog(false);
      setApiKey('');
      addMessage('system', 'API key saved successfully!');
    }
  };

  const handleSelectDirectory = async () => {
    // In a real implementation, you'd use a file picker dialog
    // For now, we'll simulate it
    const mockPath = prompt('Enter project directory path:');
    if (mockPath) {
      setProjectPath(mockPath);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    if (!ClaudeService.isConfigured()) {
      setShowApiKeyDialog(true);
      return;
    }

    const userPrompt = prompt.trim();
    setPrompt('');
    setIsLoading(true);

    // Add user message
    addMessage('user', userPrompt);

    // Add pending assistant message
    const assistantMessageId = addMessage('assistant', 'Thinking...', 'pending');

    try {
      // Create a context-aware prompt
      const contextPrompt = projectPath 
        ? `Working in project: ${projectPath}\n\n${userPrompt}`
        : userPrompt;

      // Get response from Claude
      const response = await claudeSession.current.sendMessage(contextPrompt);

      updateMessage(assistantMessageId, {
        content: response,
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

  const handleStop = () => {
    // In a real implementation, you might have a way to cancel the request
    setIsLoading(false);
    addMessage('system', 'Request cancelled by user');
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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          {onBack && (
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
            <p className="text-xs text-gray-400">AI-powered development assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isLoading ? "destructive" : "secondary"}>
            {isLoading ? 'Running' : 'Ready'}
          </Badge>
          <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Claude API</DialogTitle>
                <DialogDescription>
                  Enter your Anthropic API key to use Claude. Your key will be stored locally.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-..."
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Get your API key from{' '}
                  <a 
                    href="https://console.anthropic.com/settings/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline"
                  >
                    Anthropic Console
                  </a>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                  <Key className="h-4 w-4 mr-2" />
                  Save API Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Project Path Input */}
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
            <p className="text-sm mt-2">Example: "Create a new React component for user authentication"</p>
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
          placeholder="Enter your prompt for Claude... (e.g., 'Add a new API endpoint for user authentication')"
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
            {projectPath ? `Working in: ${projectPath}` : 'No project path set (optional)'}
          </div>
          
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStop}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim()}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                <Play className="h-4 w-4" />
                Send
              </Button>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Press Cmd/Ctrl + Enter to send • {ClaudeService.isConfigured() ? 'API key configured' : 'API key required'}
        </div>
      </div>
    </div>
  );
};