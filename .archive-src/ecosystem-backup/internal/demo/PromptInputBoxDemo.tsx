import React, { useState } from 'react';
import { PromptInputBox } from '@/shared/ui/ai-prompt-box';

export const PromptInputBoxDemo: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ 
    id: string; 
    content: string; 
    files?: File[]; 
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (message: string, files?: File[]) => {
    console.log('Message:', message);
    console.log('Files:', files);
    
    // Add the message to our demo message list
    const newMessage = {
      id: Date.now().toString(),
      content: message,
      files: files || [],
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate AI response with loading
    setIsLoading(true);
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${message}"${files && files.length > 0 ? ` with ${files.length} file(s)` : ''}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex w-full h-screen justify-center items-center bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)]">
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-[600px] h-[700px] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-2">🤖 Advanced AI Prompt Box Demo</h1>
          <p className="text-gray-400 text-sm">
            Try the advanced features: file upload, voice recording, search mode, think mode, and canvas mode!
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <p className="text-lg font-medium text-white mb-2">Start a conversation!</p>
                  <p className="text-sm">Try these features:</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 max-w-md mx-auto">
                  <div className="p-2 bg-gray-800 rounded">📎 Drag & drop images</div>
                  <div className="p-2 bg-gray-800 rounded">🎤 Voice recording</div>
                  <div className="p-2 bg-gray-800 rounded">🌐 Search mode</div>
                  <div className="p-2 bg-gray-800 rounded">🧠 Think mode</div>
                  <div className="p-2 bg-gray-800 rounded">🎨 Canvas mode</div>
                  <div className="p-2 bg-gray-800 rounded">⌨️ Paste images</div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {message.content.startsWith('I received') ? '🤖' : '👤'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm mb-1">{message.content}</p>
                      {message.files && message.files.length > 0 && (
                        <div className="mt-2">
                          <p className="text-gray-400 text-xs mb-1">Uploaded files:</p>
                          {message.files.map((file, index) => (
                            <div key={index} className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded inline-block mr-2">
                              {file.name}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                    🤖
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-gray-400 text-sm ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Prompt Box */}
        <div className="p-4 border-t border-gray-700">
          <PromptInputBox 
            onSend={handleSendMessage} 
            isLoading={isLoading}
            placeholder="Try uploading an image, recording voice, or using special modes..."
          />
          
          {/* Instructions */}
          <div className="mt-3 text-xs text-gray-500">
            <p className="mb-1">🎯 <strong>Pro tips:</strong></p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p>• Drag & drop images directly</p>
              <p>• Click mic for voice recording</p>
              <p>• Use 🌐 for web search mode</p>
              <p>• Use 🧠 for deep thinking mode</p>
              <p>• Use 🎨 for canvas creation</p>
              <p>• Paste images from clipboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 