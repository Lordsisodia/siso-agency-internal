import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  Database,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AIChatView } from './AIChatView';
import LegacyAI from '../LegacyAI';

interface EnhancedAIChatViewProps {
  currentDate: Date;
}

type ChatMode = 'task_assistant' | 'legacy_ai';

export function EnhancedAIChatView({ currentDate }: EnhancedAIChatViewProps) {
  const [activeMode, setActiveMode] = useState<ChatMode>('legacy_ai');

  const modes = [
    {
      id: 'task_assistant' as ChatMode,
      name: 'Task Assistant',
      description: 'Daily planning & productivity',
      icon: Bot,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'legacy_ai' as ChatMode,
      name: 'Legacy AI',
      description: 'System monitoring & intelligence',
      icon: Brain,
      color: 'purple',
      gradient: 'from-purple-500 to-blue-500'
    }
  ];

  const currentMode = modes.find(m => m.id === activeMode)!;

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-900">
      {/* Enhanced Header with Mode Switcher */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border-b border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
        <div className="relative z-10 p-4">
          {/* Mode Switcher */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex bg-gray-800/60 rounded-xl p-1 border border-gray-600/50">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className={cn(
                      "relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      activeMode === mode.id
                        ? "text-white shadow-lg"
                        : "text-gray-400 hover:text-gray-200"
                    )}
                  >
                    {activeMode === mode.id && (
                      <motion.div
                        layoutId="activeMode"
                        className={cn(
                          "absolute inset-0 rounded-lg bg-gradient-to-r",
                          mode.gradient
                        )}
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{mode.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Mode Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                `bg-gradient-to-r ${currentMode.gradient}`
              )}>
                <currentMode.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {currentMode.name}
                </h2>
                <p className="text-sm text-gray-400">
                  {currentMode.description}
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center justify-center space-x-4 text-xs">
              <Badge className={cn(
                "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                activeMode === 'legacy_ai' ? "animate-pulse" : ""
              )}>
                <MessageSquare className="h-3 w-3 mr-1" />
                Active
              </Badge>
              {activeMode === 'legacy_ai' && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">
                  <Database className="h-3 w-3 mr-1" />
                  7 Systems
                </Badge>
              )}
              {activeMode === 'task_assistant' && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40">
                  <Zap className="h-3 w-3 mr-1" />
                  Optimized
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {activeMode === 'task_assistant' && (
            <motion.div
              key="task_assistant"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <div className="h-full">
                <AIChatView currentDate={currentDate} />
              </div>
            </motion.div>
          )}

          {activeMode === 'legacy_ai' && (
            <motion.div
              key="legacy_ai"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <div className="h-full">
                <LegacyAI className="h-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Mode Switch - Mobile Floating Buttons */}
      <div className="fixed bottom-24 right-4 z-50 sm:hidden">
        <div className="flex flex-col space-y-2">
          {modes.map((mode) => {
            if (mode.id === activeMode) return null;
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white",
                  `bg-gradient-to-r ${mode.gradient}`,
                  "hover:scale-110 active:scale-95 transition-transform"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}