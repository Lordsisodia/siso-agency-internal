import { useState } from 'react';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  FolderIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface SimpleChatInterfaceProps {
  projectPath: string;
  onBack?: () => void;
}

export function SimpleChatInterface({ projectPath, onBack }: SimpleChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([]);
  
  const projectName = projectPath.split('/').pop() || 'Project';

  const mockChats = [
    { id: '1', title: 'Fix TypeScript errors', time: '2 min ago', preview: 'Fixed 3 type errors in components...' },
    { id: '2', title: 'Add dark mode', time: '1 hour ago', preview: 'Implemented theme switching with...' },
    { id: '3', title: 'Setup project', time: '2 hours ago', preview: 'Initialized React app with Vite...' },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Simulate Claude response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'll help you with that! Let me analyze your request about: "${message}"\n\nThis is where Claude's response would appear with code, explanations, and actions taken.`
      }]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Project Header */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={onBack}
            className="flex items-center space-x-3 w-full hover:bg-gray-800 rounded-lg p-2 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
            <FolderIcon className="w-5 h-5 text-blue-400" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">{projectName}</p>
              <p className="text-xs text-gray-500 truncate">{projectPath}</p>
            </div>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2.5 px-4 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Recent Chats</p>
          </div>
          <div className="space-y-1 px-2">
            {mockChats.map(chat => (
              <button
                key={chat.id}
                className="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <ClockIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500 truncate">{chat.preview}</p>
                    <p className="text-xs text-gray-600 mt-1">{chat.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <SparklesIcon className="w-4 h-4" />
            <span>Claude 3.5 Sonnet</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-850 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Claude Code Assistant</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">Context: 100K tokens</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl mb-6">
                <SparklesIcon className="w-16 h-16 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to code with Claude</h2>
              <p className="text-gray-400 max-w-md">
                Ask me to write code, fix bugs, explain concepts, or help with any programming task.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                  Fix a bug
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                  Write a function
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                  Explain code
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                  Refactor
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl ${msg.role === 'user' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gray-800 border-gray-700'} border rounded-xl px-5 py-3`}>
                    <p className={`text-sm ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-100'} whitespace-pre-wrap`}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-gray-850 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask Claude anything..."
                  className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[52px] max-h-32"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>⌘K for shortcuts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}