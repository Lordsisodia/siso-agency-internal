/**
 * AI Progress Indicator Component
 * Beautiful real-time progress visualization for app plan generation
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Search, 
  Cpu, 
  FileText, 
  CheckCircle, 
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TriggerProgress } from '@/services/autoTriggerSystem';

interface AIProgressIndicatorProps {
  progress: TriggerProgress;
  className?: string;
  showDetails?: boolean;
}

export function AIProgressIndicator({ 
  progress, 
  className, 
  showDetails = true 
}: AIProgressIndicatorProps) {
  
  const getStageIcon = (stage: TriggerProgress['stage']) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (stage) {
      case 'initializing':
        return <Loader2 {...iconProps} className="h-5 w-5 animate-spin text-blue-400" />;
      case 'analyzing':
        return <Search {...iconProps} className="h-5 w-5 text-purple-400" />;
      case 'generating':
        return <Cpu {...iconProps} className="h-5 w-5 text-orange-400" />;
      case 'structuring':
        return <FileText {...iconProps} className="h-5 w-5 text-green-400" />;
      case 'finalizing':
        return <Sparkles {...iconProps} className="h-5 w-5 text-yellow-400" />;
      case 'complete':
        return <CheckCircle {...iconProps} className="h-5 w-5 text-green-500" />;
      default:
        return <Bot {...iconProps} className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStageColor = (stage: TriggerProgress['stage']) => {
    switch (stage) {
      case 'initializing': return 'from-blue-600/20 to-blue-500/10 border-blue-500/30';
      case 'analyzing': return 'from-purple-600/20 to-purple-500/10 border-purple-500/30';
      case 'generating': return 'from-orange-600/20 to-orange-500/10 border-orange-500/30';
      case 'structuring': return 'from-green-600/20 to-green-500/10 border-green-500/30';
      case 'finalizing': return 'from-yellow-600/20 to-yellow-500/10 border-yellow-500/30';
      case 'complete': return 'from-green-600/20 to-green-500/10 border-green-500/30';
      default: return 'from-gray-600/20 to-gray-500/10 border-gray-500/30';
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn("w-full", className)}
      >
        <Card className={cn(
          "bg-gradient-to-r",
          getStageColor(progress.stage),
          "backdrop-blur-sm border"
        )}>
          <CardContent className="p-6">
            {/* Header with Icon and Stage */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStageIcon(progress.stage)}
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    AI App Plan Generator
                  </h3>
                  <p className="text-sm text-gray-300 capitalize">
                    {progress.stage.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
              </div>
              
              {progress.estimatedTimeRemaining > 0 && (
                <Badge 
                  variant="secondary" 
                  className="bg-black/20 text-gray-300 border-white/10"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(progress.estimatedTimeRemaining)}
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{progress.message}</span>
                <span className="text-white font-medium">{progress.progress}%</span>
              </div>
              
              <Progress 
                value={progress.progress} 
                className="h-2 bg-black/30"
              />
            </div>

            {/* Detailed Stage Information */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-gray-400 space-y-1"
              >
                {progress.stage === 'initializing' && (
                  <p>• Setting up AI analysis environment and loading industry data</p>
                )}
                {progress.stage === 'analyzing' && (
                  <p>• Analyzing business requirements and market conditions</p>
                )}
                {progress.stage === 'generating' && (
                  <p>• AI generating features, technical architecture, and cost estimates</p>
                )}
                {progress.stage === 'structuring' && (
                  <p>• Organizing recommendations into comprehensive development plan</p>
                )}
                {progress.stage === 'finalizing' && (
                  <p>• Finalizing timeline, budget breakdown, and implementation strategy</p>
                )}
                {progress.stage === 'complete' && (
                  <p>• ✅ App plan generation complete! Redirecting to view your plan...</p>
                )}
              </motion.div>
            )}

            {/* Stage Progress Dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {['initializing', 'analyzing', 'generating', 'structuring', 'finalizing', 'complete'].map((stage, index) => {
                const isActive = stage === progress.stage;
                const isCompleted = ['initializing', 'analyzing', 'generating', 'structuring', 'finalizing', 'complete']
                  .indexOf(progress.stage) > index;
                
                return (
                  <motion.div
                    key={stage}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors duration-300",
                      isActive ? "bg-white shadow-lg" : 
                      isCompleted ? "bg-green-400" : "bg-white/30"
                    )}
                    animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact version for smaller spaces
 */
export function AIProgressIndicatorCompact({ 
  progress, 
  className 
}: Omit<AIProgressIndicatorProps, 'showDetails'>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10",
        className
      )}
    >
      {getStageIcon(progress.stage)}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{progress.message}</p>
        <Progress value={progress.progress} className="h-1 mt-1" />
      </div>
      <Badge variant="secondary" className="bg-black/20 text-xs">
        {progress.progress}%
      </Badge>
    </motion.div>
  );
}

// Helper function for external use
function getStageIcon(stage: TriggerProgress['stage']) {
  const iconProps = { className: "h-4 w-4" };
  
  switch (stage) {
    case 'initializing':
      return <Loader2 {...iconProps} className="h-4 w-4 animate-spin text-blue-400" />;
    case 'analyzing':
      return <Search {...iconProps} className="h-4 w-4 text-purple-400" />;
    case 'generating':
      return <Cpu {...iconProps} className="h-4 w-4 text-orange-400" />;
    case 'structuring':
      return <FileText {...iconProps} className="h-4 w-4 text-green-400" />;
    case 'finalizing':
      return <Sparkles {...iconProps} className="h-4 w-4 text-yellow-400" />;
    case 'complete':
      return <CheckCircle {...iconProps} className="h-4 w-4 text-green-500" />;
    default:
      return <Bot {...iconProps} className="h-4 w-4 text-gray-400" />;
  }
} 