import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { 
  Send, 
  Loader2, 
  MessageSquare, 
  User,
  Bot,
  Smartphone,
  Monitor,
  History,
  Trash2,
  Settings,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  last_message_at: string;
  message_count: number;
}

/**
 * Mobile Claude Code Interface
 * 
 * Full-featured Claude Code experience optimized for phone screens
 * with chat history, streaming responses, and session management.
 */
export const MobileClaudeCodeInterface: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [apiStatus, setApiStatus] = useState<"unknown" | "connected" | "disconnected">("unknown");
  const [streamingContent, setStreamingContent] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkApiConnection();
    loadSessions();
    startNewSession();
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await fetch('http://localhost:3002/health');
      if (response.ok) {
        setApiStatus("connected");
      } else {
        setApiStatus("disconnected");
      }
    } catch (error) {
      setApiStatus("disconnected");
    }
  };

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('claude_sessions')
        .select('*')
        .order('last_message_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const startNewSession = async () => {
    try {
      const sessionId = `session_${Date.now()}`;
      const { error } = await supabase
        .from('claude_sessions')
        .insert({
          id: sessionId,
          title: 'New Claude Session',
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          message_count: 0
        });

      if (error) throw error;
      
      setCurrentSession(sessionId);
      setMessages([]);
      loadSessions();
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('claude_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const loadedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        type: msg.message_type,
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));

      setMessages(loadedMessages);
      setCurrentSession(sessionId);
      setShowSessions(false);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const saveMessage = async (message: ChatMessage) => {
    if (!currentSession) return;

    try {
      await supabase
        .from('claude_messages')
        .insert({
          id: message.id,
          session_id: currentSession,
          message_type: message.type,
          content: message.content,
          created_at: message.timestamp.toISOString()
        });

      // Update session last_message_at
      await supabase
        .from('claude_sessions')
        .update({ 
          last_message_at: message.timestamp.toISOString(),
          message_count: messages.length + 1
        })
        .eq('id', currentSession);

    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const executeClaudeCommand = async () => {
    if (!prompt.trim() || isExecuting) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content: prompt.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessage(userMessage);
    
    const currentPrompt = prompt.trim();
    setPrompt("");
    setIsExecuting(true);

    // Create streaming assistant message
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      type: 'assistant',
      content: "",
      timestamp: new Date(),
      streaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('http://localhost:3002/execute/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentPrompt,
          projectPath: '/Users/shaansisodia/Desktop/Cursor/siso-agency-onboarding-app-main-dev',
          streaming: true
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'output') {
                  fullContent += data.content;
                  
                  // Update the streaming message
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: fullContent }
                      : msg
                  ));
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }

      // Finalize the message
      const finalMessage = {
        ...assistantMessage,
        content: fullContent || "Command executed successfully",
        streaming: false
      };

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id ? finalMessage : msg
      ));

      saveMessage(finalMessage);

    } catch (error) {
      const errorMessage = {
        ...assistantMessage,
        content: `❌ Error: ${error instanceof Error ? error.message : 'Execution failed'}`,
        streaming: false
      };

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id ? errorMessage : msg
      ));

      saveMessage(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeClaudeCommand();
    }
  };

  const clearSession = async () => {
    if (!currentSession) return;
    
    try {
      await supabase
        .from('claude_messages')
        .delete()
        .eq('session_id', currentSession);
        
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:h-[600px] md:rounded-lg md:border md:overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-orange-500" />
            <Monitor className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Claude Code</h1>
            <p className="text-xs text-gray-500">Phone → Mac Mini</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'} text-white border-none`}
          >
            {apiStatus === 'connected' ? 'Connected' : 'Offline'}
          </Badge>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSessions(!showSessions)}
          >
            <History className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={startNewSession}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sessions Sidebar */}
      <AnimatePresence>
        {showSessions && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "200px" }}
            exit={{ height: 0 }}
            className="bg-white border-b overflow-y-auto"
          >
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Recent Sessions</h3>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <Button
                    key={session.id}
                    variant={currentSession === session.id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => loadSession(session.id)}
                  >
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-xs text-gray-500">
                        {session.message_count} messages • {new Date(session.last_message_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Ready to code with Claude</p>
            <p className="text-sm">Type your command below to get started</p>
          </div>
        )}

        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white border'
              }`}
            >
              <pre className={`whitespace-pre-wrap text-sm font-mono ${
                message.type === 'user' ? 'text-white' : 'text-gray-900'
              }`}>
                {message.content}
              </pre>
              
              {message.streaming && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs text-gray-500">Claude is thinking...</span>
                </div>
              )}
              
              <p className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-orange-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your Claude Code command..."
              className="min-h-[50px] max-h-32 resize-none"
              disabled={isExecuting || apiStatus !== 'connected'}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={executeClaudeCommand}
              disabled={isExecuting || !prompt.trim() || apiStatus !== 'connected'}
              size="sm"
              className="px-3"
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            
            {messages.length > 0 && (
              <Button
                onClick={clearSession}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Press Enter to send • Shift+Enter for new line</span>
          {apiStatus === 'connected' && (
            <span className="text-green-600">Mac Mini Connected</span>
          )}
        </div>
      </div>
    </div>
  );
};