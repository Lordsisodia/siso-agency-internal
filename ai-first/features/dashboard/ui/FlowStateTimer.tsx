import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  Zap, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Coffee,
  Brain,
  Target,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type FocusIntensity = 1 | 2 | 3 | 4;
export type FlowState = 'not-started' | 'warming-up' | 'in-flow' | 'disrupted' | 'broken';
export type TaskContext = 'coding' | 'writing' | 'design' | 'research' | 'planning' | 'communication' | 'learning' | 'creative';

export interface FlowSession {
  id: string;
  taskId: string;
  taskTitle: string;
  context: TaskContext;
  intensity: FocusIntensity;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  flowState: FlowState;
  interruptions: number;
  contextSwitches: number;
  qualityScore: number; // 1-10
}

export interface FlowStats {
  currentStreak: number;
  longestStreak: number;
  totalFlowTime: number; // minutes
  averageSessionLength: number;
  bestFlowDay: string;
  contextSwitchPenalty: number; // productivity loss percentage
}

interface FlowStateTimerProps {
  taskId: string;
  taskTitle: string;
  taskContext: TaskContext;
  focusIntensity: FocusIntensity;
  onSessionComplete: (session: FlowSession) => void;
  onFlowStateChange: (state: FlowState) => void;
  className?: string;
}

const intensityConfig = {
  1: { 
    name: 'Light Focus', 
    duration: [30, 45], 
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: Clock,
    description: 'Quick tasks, emails, planning'
  },
  2: { 
    name: 'Medium Focus', 
    duration: [60, 90], 
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    icon: Target,
    description: 'Focused work, problem solving'
  },
  3: { 
    name: 'Deep Flow', 
    duration: [120, 180], 
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    icon: Brain,
    description: 'Complex projects, deep thinking'
  },
  4: { 
    name: 'Ultra-Deep', 
    duration: [240, 360], 
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
    icon: Zap,
    description: 'Flow state mastery, breakthrough work'
  }
};

const flowStateConfig = {
  'not-started': { color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Ready' },
  'warming-up': { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Warming Up' },
  'in-flow': { color: 'text-green-400', bg: 'bg-green-500/20', label: 'In Flow' },
  'disrupted': { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Disrupted' },
  'broken': { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Flow Broken' }
};

const contextSwitchPenalty = {
  'coding': { 'writing': 15, 'design': 10, 'research': 8, 'planning': 12, 'communication': 20, 'learning': 5, 'creative': 18 },
  'writing': { 'coding': 15, 'design': 8, 'research': 5, 'planning': 3, 'communication': 10, 'learning': 7, 'creative': 12 },
  'design': { 'coding': 12, 'writing': 8, 'research': 10, 'planning': 15, 'communication': 18, 'learning': 10, 'creative': 5 },
  'research': { 'coding': 10, 'writing': 5, 'design': 8, 'planning': 7, 'communication': 12, 'learning': 3, 'creative': 15 },
  'planning': { 'coding': 12, 'writing': 3, 'design': 10, 'research': 5, 'communication': 8, 'learning': 10, 'creative': 18 },
  'communication': { 'coding': 25, 'writing': 10, 'design': 15, 'research': 12, 'planning': 8, 'learning': 15, 'creative': 20 },
  'learning': { 'coding': 8, 'writing': 7, 'design': 10, 'research': 3, 'planning': 12, 'communication': 15, 'creative': 12 },
  'creative': { 'coding': 20, 'writing': 12, 'design': 5, 'research': 15, 'planning': 18, 'communication': 22, 'learning': 10 }
};

export const FlowStateTimer: React.FC<FlowStateTimerProps> = ({
  taskId,
  taskTitle,
  taskContext,
  focusIntensity,
  onSessionComplete,
  onFlowStateChange,
  className
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds
  const [flowState, setFlowState] = useState<FlowState>('not-started');
  const [interruptions, setInterruptions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());
  
  const intensity = intensityConfig[focusIntensity];
  const currentFlowState = flowStateConfig[flowState];
  const minDuration = intensity.duration[0] * 60; // convert to seconds
  const maxDuration = intensity.duration[1] * 60;
  
  // Calculate flow state based on time and activity
  useEffect(() => {
    if (!isRunning) return;
    
    const minutes = Math.floor(timeElapsed / 60);
    let newFlowState: FlowState = flowState;
    
    if (minutes < 5) {
      newFlowState = 'warming-up';
    } else if (minutes >= 5 && minutes <= intensity.duration[1] && interruptions <= Math.floor(minutes / 10)) {
      newFlowState = 'in-flow';
    } else if (interruptions > Math.floor(minutes / 5)) {
      newFlowState = 'broken';
    } else {
      newFlowState = 'disrupted';
    }
    
    if (newFlowState !== flowState) {
      setFlowState(newFlowState);
      onFlowStateChange(newFlowState);
    }
    
    // Suggest break for ultra-long sessions
    if (minutes > maxDuration && !showBreakSuggestion) {
      setShowBreakSuggestion(true);
    }
  }, [timeElapsed, isRunning, interruptions, flowState, intensity.duration, maxDuration, onFlowStateChange, showBreakSuggestion]);
  
  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);
  
  const startSession = () => {
    setIsRunning(true);
    setSessionStartTime(new Date());
    setTimeElapsed(0);
    setInterruptions(0);
    setFlowState('warming-up');
    setShowBreakSuggestion(false);
    lastActivityRef.current = new Date();
  };
  
  const pauseSession = () => {
    setIsRunning(false);
    setInterruptions(prev => prev + 1);
  };
  
  const resumeSession = () => {
    setIsRunning(true);
    lastActivityRef.current = new Date();
  };
  
  const endSession = () => {
    if (sessionStartTime) {
      const session: FlowSession = {
        id: `flow_${Date.now()}`,
        taskId,
        taskTitle,
        context: taskContext,
        intensity: focusIntensity,
        startTime: sessionStartTime,
        endTime: new Date(),
        duration: Math.floor(timeElapsed / 60),
        flowState,
        interruptions,
        contextSwitches: 0, // This would be calculated based on previous sessions
        qualityScore: calculateQualityScore()
      };
      
      onSessionComplete(session);
    }
    
    // Reset state
    setIsRunning(false);
    setTimeElapsed(0);
    setFlowState('not-started');
    setInterruptions(0);
    setSessionStartTime(null);
    setShowBreakSuggestion(false);
  };
  
  const calculateQualityScore = (): number => {
    const minutes = Math.floor(timeElapsed / 60);
    const optimalTime = intensity.duration[0];
    const maxTime = intensity.duration[1];
    
    let score = 10;
    
    // Time quality (prefer optimal duration)
    if (minutes < optimalTime * 0.5) score -= 3;
    else if (minutes > maxTime * 1.5) score -= 2;
    
    // Interruption penalty
    score -= Math.min(interruptions * 0.5, 4);
    
    // Flow state bonus
    if (flowState === 'in-flow') score += 1;
    else if (flowState === 'broken') score -= 2;
    
    return Math.max(1, Math.min(10, score));
  };
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgressPercentage = (): number => {
    return Math.min(100, (timeElapsed / minDuration) * 100);
  };

  return (
    <Card className={cn('bg-gray-900/50 border-gray-700/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', currentFlowState.bg)}>
              <Activity className={cn('w-5 h-5', currentFlowState.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Flow State Timer</h3>
              <p className="text-sm text-gray-400">{taskTitle}</p>
            </div>
          </div>
          
          <Badge className={cn('text-xs', intensity.color)}>
            <intensity.icon className="w-3 h-3 mr-1" />
            {intensity.name}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-white mb-2">
            {formatTime(timeElapsed)}
          </div>
          
          {/* Flow State Indicator */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className={cn('w-3 h-3 rounded-full', currentFlowState.bg)}></div>
            <span className={cn('text-sm font-medium', currentFlowState.color)}>
              {currentFlowState.label}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <motion.div 
              className={cn('h-2 rounded-full transition-all duration-500')}
              style={{ 
                width: `${getProgressPercentage()}%`,
                backgroundColor: flowState === 'in-flow' ? '#10b981' : 
                               flowState === 'disrupted' ? '#f59e0b' : 
                               flowState === 'broken' ? '#ef4444' : '#6b7280'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
        
        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">{Math.floor(timeElapsed / 60)}</div>
            <div className="text-xs text-gray-400">Minutes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{interruptions}</div>
            <div className="text-xs text-gray-400">Interruptions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{calculateQualityScore().toFixed(1)}</div>
            <div className="text-xs text-gray-400">Quality</div>
          </div>
        </div>
        
        {/* Context Info */}
        <div className="text-center text-sm text-gray-400">
          <span className="capitalize">{taskContext}</span> • {intensity.description}
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          {!isRunning && timeElapsed === 0 && (
            <Button onClick={startSession} className="bg-green-600 hover:bg-green-700 text-white">
              <Play className="w-4 h-4 mr-2" />
              Start Focus Session
            </Button>
          )}
          
          {isRunning && (
            <Button onClick={pauseSession} variant="outline" className="border-yellow-500 text-yellow-400">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          
          {!isRunning && timeElapsed > 0 && (
            <>
              <Button onClick={resumeSession} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button onClick={endSession} variant="outline" className="border-green-500 text-green-400">
                <Square className="w-4 h-4 mr-2" />
                Complete
              </Button>
            </>
          )}
          
          {(isRunning || timeElapsed > 0) && (
            <Button onClick={endSession} variant="outline" className="border-red-500 text-red-400">
              <Square className="w-4 h-4 mr-2" />
              End Session
            </Button>
          )}
        </div>
        
        {/* Break Suggestion */}
        <AnimatePresence>
          {showBreakSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                <Coffee className="w-4 h-4" />
                <span className="font-medium">Break Suggestion</span>
              </div>
              <p className="text-sm text-gray-300">
                You've been in deep focus for {Math.floor(timeElapsed / 60)} minutes. 
                Consider taking a 10-15 minute break to maintain peak performance.
              </p>
              <Button
                size="sm"
                onClick={() => setShowBreakSuggestion(false)}
                className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Got it
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default FlowStateTimer;