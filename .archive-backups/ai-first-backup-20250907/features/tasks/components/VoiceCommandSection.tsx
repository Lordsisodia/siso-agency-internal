import React from 'react';
import { MobileMicrophoneButton } from '../ui/MobileMicrophoneButton';
import { Bot, Zap } from 'lucide-react';

interface VoiceCommandSectionProps {
  onVoiceCommand: (command: string) => void;
  isProcessingVoice: boolean;
}

export const VoiceCommandSection: React.FC<VoiceCommandSectionProps> = ({
  onVoiceCommand,
  isProcessingVoice
}) => {
  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900/90 via-teal-800/80 to-cyan-900/90 border border-cyan-400/20 p-6 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-cyan-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/20">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              AI <span className="text-cyan-400">Assistant</span>
            </h1>
            <p className="text-gray-300 text-sm">Voice-powered task management</p>
          </div>
        </div>
      </div>

      {/* Voice Interface */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-teal-500/15 to-cyan-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full mb-4 shadow-lg shadow-cyan-500/25">
              <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Voice Commands
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-6">
              Speak naturally to manage your tasks and get AI assistance
            </p>
          </div>

          <div className="flex justify-center">
            <MobileMicrophoneButton 
              onVoiceCommand={onVoiceCommand}
              disabled={isProcessingVoice}
            />
          </div>

          {/* Voice Command Examples */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <h3 className="text-cyan-400 font-semibold mb-2">Task Management</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>"Add task: Call client meeting"</li>
                <li>"Mark task completed"</li>
                <li>"Schedule task for tomorrow"</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <h3 className="text-cyan-400 font-semibold mb-2">AI Assistance</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>"Analyze my productivity"</li>
                <li>"Suggest optimal schedule"</li>
                <li>"Break down complex task"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};