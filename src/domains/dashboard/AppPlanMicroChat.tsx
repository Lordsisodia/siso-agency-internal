import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpIcon, 
  Sparkles, 
  Brain, 
  Rocket, 
  Clock, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppPlanMicroChatProps {
  onNavigateToFullBuilder?: () => void;
}

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

export const AppPlanMicroChat: React.FC<AppPlanMicroChatProps> = ({ 
  onNavigateToFullBuilder 
}) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quickResponse, setQuickResponse] = useState<string | null>(null);
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 44,
    maxHeight: 120,
  });

  const quickPrompts = [
    "Social media app for businesses",
    "E-commerce platform with AI",
    "Fitness tracking app",
    "Task management tool"
  ];

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setQuickResponse(null);

    // Simulate AI processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a quick response
      const responses = [
        `Great idea! A ${input.toLowerCase()} would need user authentication, real-time features, and a scalable backend. Estimated timeline: 12-16 weeks, budget: $25,000-$35,000.`,
        `Interesting concept! Your ${input.toLowerCase()} would benefit from AI integration, mobile-first design, and robust analytics. Timeline: 10-14 weeks, budget: $20,000-$30,000.`,
        `Excellent vision! This ${input.toLowerCase()} needs modern UI/UX, API integrations, and cloud infrastructure. Timeline: 8-12 weeks, budget: $18,000-$28,000.`
      ];
      
      setQuickResponse(responses[Math.floor(Math.random() * responses.length)]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setQuickResponse(null);
    adjustHeight();
  };

  const handleViewFullBuilder = () => {
    if (onNavigateToFullBuilder) {
      onNavigateToFullBuilder();
    } else {
      window.location.href = '/partner/app-plan-generator';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="bg-black/60 backdrop-blur-xl border-orange-500/20 shadow-2xl">
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Quick App Plan Generator</h3>
                <p className="text-sm text-gray-400">Describe your app idea to get started</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewFullBuilder}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Full Builder
            </Button>
          </div>

          {/* Chat Input */}
          <div className="relative bg-gray-900/50 rounded-xl border border-orange-500/20">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Describe your app idea... (e.g., 'A social platform for fitness enthusiasts')"
              className={cn(
                "w-full px-4 py-3 resize-none bg-transparent border-none",
                "text-white text-sm focus:outline-none focus-visible:ring-0",
                "placeholder:text-gray-500 min-h-[44px]"
              )}
              style={{ overflow: "hidden" }}
              disabled={isGenerating}
            />
            
            <div className="absolute bottom-3 right-3">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!input.trim() || isGenerating}
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all",
                  input.trim() && !isGenerating
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Quick Prompts */}
          {!quickResponse && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-medium">Quick ideas to try:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="justify-start text-left h-auto p-2 text-xs text-gray-300 hover:text-white hover:bg-orange-500/10 border border-gray-700/50 hover:border-orange-500/30"
                    disabled={isGenerating}
                  >
                    <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg"
              >
                <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">AI is analyzing your idea...</p>
                  <p className="text-xs text-gray-400">This usually takes a few seconds</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Response */}
          <AnimatePresence>
            {quickResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded bg-green-500/20">
                      <Sparkles className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 leading-relaxed">{quickResponse}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Quick Analysis
                    </Badge>
                    <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs">
                      <Rocket className="h-3 w-3 mr-1" />
                      Estimate
                    </Badge>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={handleViewFullBuilder}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Get Detailed Plan
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};