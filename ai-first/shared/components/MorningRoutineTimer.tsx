import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Coffee, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AIAssistantFeatureFlags } from '../utils/feature-flags';
import { useAIChatThreadService } from '../services/ai-chat-thread.service';
import { MorningRoutineSession } from '../types/ai-chat.types';

interface MorningRoutineTimerProps {
  featureFlags: AIAssistantFeatureFlags;
  threadId?: string;
  onSessionComplete?: (session: MorningRoutineSession) => void;
  onTaskCreated?: (task: string) => void;
  className?: string;
}

interface RoutinePhase {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const DEFAULT_ROUTINE_PHASES: RoutinePhase[] = [
  {
    id: 'brain-dump',
    name: 'Brain Dump',
    duration: 300, // 5 minutes
    description: 'Voice out everything on your mind',
    icon: Coffee,
    color: 'bg-blue-500'
  },
  {
    id: 'processing',
    name: 'AI Processing',
    duration: 180, // 3 minutes
    description: 'AI organizes your thoughts into tasks',
    icon: Circle,
    color: 'bg-purple-500'
  },
  {
    id: 'review',
    name: 'Review & Refine',
    duration: 900, // 15 minutes
    description: 'Review generated tasks and make adjustments',
    icon: CheckCircle,
    color: 'bg-green-500'
  }
];

/**
 * Morning Routine Timer Component
 * Manages 23-minute morning routine sessions with AI integration
 * Gracefully handles disabled features and provides fallback UI
 */
export const MorningRoutineTimer: React.FC<MorningRoutineTimerProps> = ({
  featureFlags,
  threadId,
  onSessionComplete,
  onTaskCreated,
  className = ''
}) => {
  const [currentSession, setCurrentSession] = useState<MorningRoutineSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [tasksCreated, setTasksCreated] = useState(0);
  const [thoughtsProcessed, setThoughtsProcessed] = useState(0);

  const { startMorningRoutine, completeMorningRoutine } = useAIChatThreadService(featureFlags);

  const currentPhase = DEFAULT_ROUTINE_PHASES[currentPhaseIndex];
  const totalDuration = DEFAULT_ROUTINE_PHASES.reduce((sum, phase) => sum + phase.duration, 0);

  // Timer effect
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        setTotalTimeElapsed(elapsed => elapsed + 1);
        
        // Check if current phase is complete
        if (newTime <= 0 && currentPhaseIndex < DEFAULT_ROUTINE_PHASES.length - 1) {
          setCurrentPhaseIndex(prev => prev + 1);
          return DEFAULT_ROUTINE_PHASES[currentPhaseIndex + 1].duration;
        }
        
        // Check if entire routine is complete
        if (newTime <= 0 && currentPhaseIndex >= DEFAULT_ROUTINE_PHASES.length - 1) {
          handleSessionComplete();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, currentPhaseIndex]);

  const startRoutine = useCallback(async () => {
    if (!featureFlags.enableMorningRoutineTimer) {
      // Fallback mode - just show the timer UI
      setIsRunning(true);
      setCurrentPhaseIndex(0);
      setTimeRemaining(DEFAULT_ROUTINE_PHASES[0].duration);
      setTotalTimeElapsed(0);
      setTasksCreated(0);
      setThoughtsProcessed(0);
      console.log('⏰ Morning routine started (compatibility mode)');
      return;
    }

    try {
      const session = await startMorningRoutine(threadId || 'default', '23-minute');
      setCurrentSession(session);
      setIsRunning(true);
      setCurrentPhaseIndex(0);
      setTimeRemaining(DEFAULT_ROUTINE_PHASES[0].duration);
      setTotalTimeElapsed(0);
      setTasksCreated(0);
      setThoughtsProcessed(0);
      console.log('⏰ Morning routine session started:', session.id);
    } catch (error) {
      console.warn('⏰ Failed to start routine session, using fallback mode:', error);
      // Graceful degradation
      setIsRunning(true);
      setCurrentPhaseIndex(0);
      setTimeRemaining(DEFAULT_ROUTINE_PHASES[0].duration);
    }
  }, [featureFlags.enableMorningRoutineTimer, startMorningRoutine, threadId]);

  const pauseRoutine = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resumeRoutine = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopRoutine = useCallback(() => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setTimeRemaining(0);
    setTotalTimeElapsed(0);
    
    if (currentSession && featureFlags.enableMorningRoutineTimer) {
      completeMorningRoutine(currentSession.id, 'Session stopped by user');
    }
    setCurrentSession(null);
  }, [currentSession, featureFlags.enableMorningRoutineTimer, completeMorningRoutine]);

  const resetRoutine = useCallback(() => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setTimeRemaining(DEFAULT_ROUTINE_PHASES[0].duration);
    setTotalTimeElapsed(0);
    setTasksCreated(0);
    setThoughtsProcessed(0);
    setCurrentSession(null);
  }, []);

  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);
    
    const sessionData: MorningRoutineSession = {
      id: currentSession?.id || 'fallback-session',
      threadId: threadId || 'default',
      routineType: '23-minute',
      startTime: currentSession?.startTime || new Date(),
      endTime: new Date(),
      status: 'completed',
      tasksCreated,
      thoughtsProcessed,
      metadata: {
        totalTimeElapsed,
        phasesCompleted: currentPhaseIndex + 1
      }
    };

    if (currentSession && featureFlags.enableMorningRoutineTimer) {
      await completeMorningRoutine(currentSession.id, 'Session completed successfully');
    }

    onSessionComplete?.(sessionData);
    console.log('⏰ Morning routine completed:', sessionData);
  }, [currentSession, threadId, tasksCreated, thoughtsProcessed, totalTimeElapsed, currentPhaseIndex, featureFlags.enableMorningRoutineTimer, completeMorningRoutine, onSessionComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalTimeElapsed > 0 ? (totalTimeElapsed / totalDuration) * 100 : 0;
  const phaseProgressPercentage = currentPhase ? ((currentPhase.duration - timeRemaining) / currentPhase.duration) * 100 : 0;

  // Show feature disabled message if not enabled
  if (!featureFlags.enableMorningRoutineTimer) {
    return (
      <Card className={`${className} border-dashed border-gray-300`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <Coffee className="w-5 h-5" />
            Morning Routine Timer
            <Badge variant="outline" className="text-xs">Preview Mode</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Enhanced morning routine timer will be available when the feature is enabled.
          </p>
          <div className="space-y-2">
            {DEFAULT_ROUTINE_PHASES.map((phase, index) => (
              <div key={phase.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <phase.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{phase.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{formatTime(phase.duration)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            23-Minute Morning Routine
          </div>
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? 'Active' : 'Ready'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Phase Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-3"
          >
            <div className={`w-16 h-16 mx-auto rounded-full ${currentPhase?.color || 'bg-gray-200'} flex items-center justify-center`}>
              {currentPhase && <currentPhase.icon className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{currentPhase?.name || 'Ready to Start'}</h3>
              <p className="text-sm text-gray-600">{currentPhase?.description || 'Click start to begin your routine'}</p>
            </div>
            <div className="text-3xl font-mono font-bold">
              {formatTime(timeRemaining)}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Current Phase</span>
              <span>{Math.round(phaseProgressPercentage)}%</span>
            </div>
            <Progress value={phaseProgressPercentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{tasksCreated}</div>
            <div className="text-xs text-gray-600">Tasks Created</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{thoughtsProcessed}</div>
            <div className="text-xs text-gray-600">Thoughts Processed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{formatTime(totalTimeElapsed)}</div>
            <div className="text-xs text-gray-600">Time Elapsed</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-2">
          {!isRunning && timeRemaining === 0 ? (
            <Button onClick={startRoutine} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Routine
            </Button>
          ) : !isRunning ? (
            <Button onClick={resumeRoutine} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Resume
            </Button>
          ) : (
            <Button onClick={pauseRoutine} variant="outline" className="flex items-center gap-2">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          
          {(isRunning || timeRemaining > 0) && (
            <Button onClick={stopRoutine} variant="destructive" className="flex items-center gap-2">
              <Square className="w-4 h-4" />
              Stop
            </Button>
          )}
          
          <Button onClick={resetRoutine} variant="ghost" size="icon">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Phase Timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Routine Phases</h4>
          {DEFAULT_ROUTINE_PHASES.map((phase, index) => (
            <div
              key={phase.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                index === currentPhaseIndex 
                  ? 'bg-blue-50 border border-blue-200' 
                  : index < currentPhaseIndex 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50'
              }`}
            >
              <phase.icon className={`w-4 h-4 ${
                index === currentPhaseIndex 
                  ? 'text-blue-600' 
                  : index < currentPhaseIndex 
                    ? 'text-green-600' 
                    : 'text-gray-400'
              }`} />
              <span className={`text-sm ${
                index === currentPhaseIndex 
                  ? 'text-blue-900 font-medium' 
                  : index < currentPhaseIndex 
                    ? 'text-green-900' 
                    : 'text-gray-600'
              }`}>
                {phase.name}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {formatTime(phase.duration)}
              </span>
              {index < currentPhaseIndex && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MorningRoutineTimer;