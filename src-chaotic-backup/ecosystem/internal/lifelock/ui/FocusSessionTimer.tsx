import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Timer, 
  Brain, 
  Zap, 
  Target,
  Volume2,
  VolumeX,
  Settings,
  Coffee,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { EnhancedTaskService, DeepWorkSession } from '@/shared/services/task.service';

export interface FocusSessionConfig {
  id: string;
  name: string;
  duration: number; // minutes
  breakDuration: number; // minutes
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
}

export const SESSION_PRESETS: FocusSessionConfig[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    duration: 25,
    breakDuration: 5,
    description: 'Classic 25min focused work',
    icon: Timer,
    color: 'text-red-400',
    bgGradient: 'from-red-900/20 to-orange-900/20'
  },
  {
    id: 'deep_work',
    name: 'Deep Work',
    duration: 90,
    breakDuration: 15,
    description: 'Extended focused session',
    icon: Brain,
    color: 'text-purple-400',
    bgGradient: 'from-purple-900/20 to-blue-900/20'
  },
  {
    id: 'sprint',
    name: 'Sprint',
    duration: 45,
    breakDuration: 10,
    description: 'Balanced work session',
    icon: Zap,
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-900/20 to-orange-900/20'
  },
  {
    id: 'flow_state',
    name: 'Flow State',
    duration: 120,
    breakDuration: 20,
    description: 'Maximum focus immersion',
    icon: Target,
    color: 'text-green-400',
    bgGradient: 'from-green-900/20 to-teal-900/20'
  }
];

export type SessionState = 'idle' | 'running' | 'paused' | 'break' | 'completed';

interface FocusSessionTimerProps {
  selectedTasks?: string[];
  onSessionComplete?: (session: Partial<DeepWorkSession>) => void;
  onSessionStart?: (config: FocusSessionConfig) => void;
  className?: string;
  compact?: boolean;
}

export const FocusSessionTimer: React.FC<FocusSessionTimerProps> = ({
  selectedTasks = [],
  onSessionComplete,
  onSessionStart,
  className,
  compact = false
}) => {
  const [selectedConfig, setSelectedConfig] = useState<FocusSessionConfig>(SESSION_PRESETS[0]);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [distractionsCount, setDistractionsCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentSessionData, setCurrentSessionData] = useState<Partial<DeepWorkSession> | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      // You could add notification sounds here
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (sessionState === 'running' || sessionState === 'break') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionState]);

  const handleTimerComplete = useCallback(() => {
    if (soundEnabled) {
      // Play completion sound
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Handle audio play failure silently
        });
      }
    }

    if (sessionState === 'running') {
      // Work session completed, start break
      setSessionState('break');
      setTimeRemaining(selectedConfig.breakDuration * 60);
    } else if (sessionState === 'break') {
      // Break completed, session fully done
      handleSessionEnd(true);
    }
  }, [sessionState, selectedConfig, soundEnabled]);

  const startSession = useCallback(() => {
    const startTime = new Date();
    setSessionStartTime(startTime);
    setSessionState('running');
    setTimeRemaining(selectedConfig.duration * 60);
    setDistractionsCount(0);
    
    const sessionData: Partial<DeepWorkSession> = {
      date: startTime.toISOString().split('T')[0],
      start_time: startTime.toTimeString().split(' ')[0],
      planned_duration: selectedConfig.duration,
      session_type: selectedConfig.id === 'deep_work' || selectedConfig.id === 'flow_state' ? 'deep_focus' : 'light_focus',
      technique_used: selectedConfig.name.toLowerCase(),
      tasks_completed: selectedTasks,
      distractions_count: 0
    };
    
    setCurrentSessionData(sessionData);
    onSessionStart?.(selectedConfig);
  }, [selectedConfig, selectedTasks, onSessionStart]);

  const pauseSession = useCallback(() => {
    setSessionState('paused');
  }, []);

  const resumeSession = useCallback(() => {
    setSessionState('running');
  }, []);

  const stopSession = useCallback(() => {
    handleSessionEnd(false);
  }, []);

  const handleSessionEnd = useCallback(async (completed: boolean) => {
    const endTime = new Date();
    const actualDuration = sessionStartTime 
      ? Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 60000)
      : 0;

    const finalSessionData: Partial<DeepWorkSession> = {
      ...currentSessionData,
      end_time: endTime.toTimeString().split(' ')[0],
      actual_duration: actualDuration,
      distractions_count: distractionsCount,
      energy_start: 7, // Could be user input
      energy_end: completed ? 8 : 6, // Could be user input
      focus_quality: completed ? 8 : 5, // Could be user input
      session_notes: `${selectedConfig.name} session - ${completed ? 'Completed' : 'Stopped early'}`
    };

    setSessionState(completed ? 'completed' : 'idle');
    setCurrentSessionData(null);
    setSessionStartTime(null);
    
    // Record session in database
    if (actualDuration > 0) {
      await EnhancedTaskService.recordDeepWorkSession(finalSessionData);
      onSessionComplete?.(finalSessionData);
    }
  }, [currentSessionData, sessionStartTime, distractionsCount, selectedConfig, onSessionComplete]);

  const addDistraction = useCallback(() => {
    setDistractionsCount(prev => prev + 1);
    setCurrentSessionData(prev => prev ? { ...prev, distractions_count: distractionsCount + 1 } : null);
  }, [distractionsCount]);

  const resetTimer = useCallback(() => {
    setSessionState('idle');
    setTimeRemaining(selectedConfig.duration * 60);
    setDistractionsCount(0);
    setCurrentSessionData(null);
    setSessionStartTime(null);
  }, [selectedConfig]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = selectedConfig.duration > 0 
    ? ((selectedConfig.duration * 60 - timeRemaining) / (selectedConfig.duration * 60)) * 100 
    : 0;

  if (compact) {
    return (
      <Card className={cn(
        'bg-gradient-to-br from-black/40 to-gray-900/40 border-gray-700/50',
        selectedConfig.bgGradient,
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <selectedConfig.icon className={cn('h-5 w-5', selectedConfig.color)} />
              <span className="text-white font-medium">{selectedConfig.name}</span>
            </div>
            
            {sessionState === 'idle' ? (
              <Button 
                onClick={startSession}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Start
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono">{formatTime(timeRemaining)}</span>
                {sessionState === 'running' ? (
                  <Button onClick={pauseSession} size="sm" variant="outline">
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : sessionState === 'paused' ? (
                  <Button onClick={resumeSession} size="sm" variant="outline">
                    <Play className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      className={cn(
        'w-full max-w-md mx-auto',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        'bg-gradient-to-br from-black/40 to-gray-900/40 border-gray-700/50 overflow-hidden',
        selectedConfig.bgGradient
      )}>
        <CardContent className="p-6">
          {/* Session Preset Selection */}
          {sessionState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <h3 className="text-white font-semibold mb-3">Choose Your Focus Session</h3>
              <div className="grid grid-cols-2 gap-2">
                {SESSION_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.id}
                    onClick={() => setSelectedConfig(preset)}
                    className={cn(
                      'p-3 rounded-lg border transition-all text-left',
                      selectedConfig.id === preset.id
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <preset.icon className={cn('h-4 w-4', preset.color)} />
                      <span className="text-white text-sm font-medium">{preset.name}</span>
                    </div>
                    <p className="text-xs text-gray-400">{preset.duration}min + {preset.breakDuration}min break</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Timer Display */}
          <div className="text-center mb-6">
            <motion.div
              className="relative mx-auto mb-4"
              style={{ width: 120, height: 120 }}
            >
              {/* Progress Ring */}
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-700"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className={cn(selectedConfig.color)}
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 54 * (1 - progress / 100)
                  }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              
              {/* Timer Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-mono text-white font-bold">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {sessionState === 'break' ? 'Break Time' : selectedConfig.name}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Session Status */}
            <AnimatePresence mode="wait">
              <motion.div
                key={sessionState}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center space-x-2 mb-4"
              >
                {sessionState === 'running' && (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm">Focus Session Active</span>
                  </>
                )}
                {sessionState === 'paused' && (
                  <>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="text-yellow-400 text-sm">Session Paused</span>
                  </>
                )}
                {sessionState === 'break' && (
                  <>
                    <Coffee className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 text-sm">Break Time</span>
                  </>
                )}
                {sessionState === 'completed' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm">Session Completed!</span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-3 mb-4">
            {sessionState === 'idle' && (
              <Button 
                onClick={startSession}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            )}
            
            {sessionState === 'running' && (
              <Button onClick={pauseSession} variant="outline" className="border-yellow-500 text-yellow-400">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            {sessionState === 'paused' && (
              <>
                <Button onClick={resumeSession} className="bg-green-500 hover:bg-green-600 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
                <Button onClick={stopSession} variant="outline" className="border-red-500 text-red-400">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}

            {(sessionState === 'running' || sessionState === 'paused') && (
              <Button onClick={resetTimer} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            {sessionState === 'completed' && (
              <Button onClick={resetTimer} className="bg-orange-500 hover:bg-orange-600 text-white">
                <RotateCcw className="h-4 w-4 mr-2" />
                New Session
              </Button>
            )}
          </div>

          {/* Session Stats */}
          {(sessionState === 'running' || sessionState === 'paused' || sessionState === 'break') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4 text-center"
            >
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-orange-400 font-semibold">{distractionsCount}</div>
                <div className="text-xs text-gray-400">Distractions</div>
                <Button 
                  onClick={addDistraction}
                  size="sm"
                  variant="ghost"
                  className="mt-1 text-xs text-gray-400 hover:text-white"
                >
                  +1
                </Button>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-green-400 font-semibold">
                  {sessionStartTime ? Math.floor((Date.now() - sessionStartTime.getTime()) / 60000) : 0}m
                </div>
                <div className="text-xs text-gray-400">Elapsed</div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FocusSessionTimer;