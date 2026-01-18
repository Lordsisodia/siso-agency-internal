import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Brain, 
  Zap, 
  Target, 
  Coffee,
  Timer,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  Flame,
  CheckCircle2,
  Circle,
  Volume2,
  VolumeX,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedTaskService, EnhancedTask } from '@/services/shared/task.service';
import { format } from 'date-fns';

interface DeepFocusSession {
  id: string;
  taskId?: string;
  startTime: Date;
  plannedDuration: number; // minutes
  actualDuration?: number;
  sessionType: 'deep_focus' | 'pomodoro' | 'timeboxing' | 'flow';
  focusQuality?: number; // 1-10 scale
  distractionsCount?: number;
  energyStart?: number; // 1-10 scale
  energyEnd?: number;
  techniqueUsed?: string;
  environmentNoise?: 'silent' | 'low' | 'moderate' | 'high';
  status: 'planning' | 'active' | 'break' | 'completed' | 'cancelled';
  breaks: {
    startTime: Date;
    duration: number;
    type: 'short' | 'long';
  }[];
}

interface DeepFocusSessionCardProps {
  tasks: EnhancedTask[];
  onSessionComplete?: (session: DeepFocusSession) => void;
  onTaskToggle?: (taskId: string) => void;
  className?: string;
  defaultDuration?: number;
}

export const DeepFocusSessionCard: React.FC<DeepFocusSessionCardProps> = ({
  tasks,
  onSessionComplete,
  onTaskToggle,
  className,
  defaultDuration = 25
}) => {
  const [session, setSession] = useState<DeepFocusSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [focusQuality, setFocusQuality] = useState(8);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [distractions, setDistractions] = useState(0);
  const [environmentNoise, setEnvironmentNoise] = useState<'silent' | 'low' | 'moderate' | 'high'>('low');
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pomodoroSettings = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    cyclesBeforeLongBreak: 4
  };

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {}); // Ignore audio errors
    }
    
    if (session) {
      if (session.status === 'active') {
        // Work session completed, suggest break
        setSession(prev => prev ? { ...prev, status: 'break' } : null);
      } else if (session.status === 'break') {
        // Break completed, return to work
        setSession(prev => prev ? { ...prev, status: 'active' } : null);
        setTimeRemaining(pomodoroSettings.work * 60);
      }
    }
  }, [session, pomodoroSettings.work]);

  // Timer logic
  useEffect(() => {
    if (isRunning && session && timeRemaining > 0) {
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
  }, [isRunning, session, timeRemaining, handleTimerComplete]);

  const startSession = (duration: number, type: 'deep_focus' | 'pomodoro' | 'timeboxing' = 'deep_focus') => {
    const newSession: DeepFocusSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      plannedDuration: duration,
      sessionType: type,
      status: 'active',
      breaks: [],
      energyStart: energyLevel,
      environmentNoise,
      distractionsCount: 0
    };

    setSession(newSession);
    setTimeRemaining(duration * 60);
    setIsRunning(true);
    setDistractions(0);
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resumeSession = () => {
    setIsRunning(true);
  };

  const stopSession = () => {
    if (session) {
      const completedSession: DeepFocusSession = {
        ...session,
        status: 'completed',
        actualDuration: session.plannedDuration - Math.floor(timeRemaining / 60),
        focusQuality,
        distractionsCount: distractions,
        energyEnd: energyLevel
      };
      
      onSessionComplete?.(completedSession);
      
      // Record session in database
      if (completedSession.actualDuration && completedSession.actualDuration > 1) {
        EnhancedTaskService.recordDeepWorkSession({
          planned_duration: completedSession.plannedDuration,
          actual_duration: completedSession.actualDuration,
          focus_quality: completedSession.focusQuality || 7,
          distractions_count: completedSession.distractionsCount || 0,
          technique_used: completedSession.sessionType,
          session_type: completedSession.sessionType,
          energy_start: completedSession.energyStart || 7,
          energy_end: completedSession.energyEnd || 7,
          task_id: completedSession.taskId
        }).catch(console.error);
      }
    }
    
    setSession(null);
    setIsRunning(false);
    setTimeRemaining(0);
  };

  const addDistraction = () => {
    setDistractions(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionProgress = () => {
    if (!session) return 0;
    const totalSeconds = session.plannedDuration * 60;
    const elapsed = totalSeconds - timeRemaining;
    return (elapsed / totalSeconds) * 100;
  };

  const getFocusStateColor = () => {
    if (focusQuality >= 8) return 'text-green-400 border-green-500/50';
    if (focusQuality >= 6) return 'text-yellow-400 border-yellow-500/50';
    if (focusQuality >= 4) return 'text-orange-400 border-orange-500/50';
    return 'text-red-400 border-red-500/50';
  };

  const getEnergyIcon = () => {
    if (energyLevel >= 8) return <Zap className="h-4 w-4 text-yellow-400" />;
    if (energyLevel >= 6) return <Sun className="h-4 w-4 text-orange-400" />;
    if (energyLevel >= 4) return <Activity className="h-4 w-4 text-blue-400" />;
    return <Moon className="h-4 w-4 text-purple-400" />;
  };

  const activeTasks = tasks.filter(task => task.status !== 'done');
  const completedTasks = tasks.filter(task => task.status === 'done');

  return (
    <div className={cn('w-full', className)}>
      <Card className="bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl border border-orange-500/30 shadow-xl shadow-orange-500/10 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Deep Focus Session</h3>
                <p className="text-gray-400 text-sm">
                  {session ? `${session.sessionType.replace('_', ' ')} session` : 'Ready to focus'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timer Display */}
          {session && (
            <div className="mt-4">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-white mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <span>{session.status === 'break' ? 'Break Time' : 'Focus Time'}</span>
                  {session.status === 'active' && (
                    <Badge variant="outline" className="text-green-400 border-green-500/50">
                      Active
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/40 backdrop-blur-sm rounded-full h-3 shadow-inner border border-orange-500/20 overflow-hidden mb-4">
                <motion.div 
                  className="bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 h-full rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${getSessionProgress()}%` }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                </motion.div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-3">
                {!isRunning ? (
                  <Button
                    onClick={resumeSession}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {session.status === 'planning' ? 'Start' : 'Resume'}
                  </Button>
                ) : (
                  <Button
                    onClick={pauseSession}
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button
                  onClick={stopSession}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Quick Start Options */}
          {!session && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => startSession(25, 'pomodoro')}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 h-auto flex-col"
                >
                  <Timer className="h-6 w-6 mb-2" />
                  <span className="font-semibold">Pomodoro</span>
                  <span className="text-xs opacity-90">25 min focus</span>
                </Button>
                <Button
                  onClick={() => startSession(45, 'deep_focus')}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white p-4 h-auto flex-col"
                >
                  <Brain className="h-6 w-6 mb-2" />
                  <span className="font-semibold">Deep Focus</span>
                  <span className="text-xs opacity-90">45 min intense</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map(duration => (
                  <Button
                    key={duration}
                    onClick={() => startSession(duration, 'timeboxing')}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-white/10"
                  >
                    {duration}m
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Session Status & Controls */}
          {session && (
            <div className="space-y-4">
              {/* Real-time Metrics */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="h-4 w-4 text-blue-400 mr-1" />
                    <span className={cn('font-semibold', getFocusStateColor())}>
                      {focusQuality}/10
                    </span>
                  </div>
                  <div className="text-gray-400">Focus Quality</div>
                  <div className="flex justify-center space-x-1 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setFocusQuality(Math.max(1, focusQuality - 1))}
                      className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
                    >
                      -
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setFocusQuality(Math.min(10, focusQuality + 1))}
                      className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    {getEnergyIcon()}
                    <span className="font-semibold text-white ml-1">
                      {energyLevel}/10
                    </span>
                  </div>
                  <div className="text-gray-400">Energy Level</div>
                  <div className="flex justify-center space-x-1 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEnergyLevel(Math.max(1, energyLevel - 1))}
                      className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
                    >
                      -
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEnergyLevel(Math.min(10, energyLevel + 1))}
                      className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="h-4 w-4 text-red-400 mr-1" />
                    <span className="font-semibold text-white">
                      {distractions}
                    </span>
                  </div>
                  <div className="text-gray-400">Distractions</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addDistraction}
                    className="mt-2 h-6 px-2 text-orange-400 hover:bg-orange-500/20 text-xs"
                  >
                    +1
                  </Button>
                </div>
              </div>

              {/* Environment Controls */}
              <div className="bg-black/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium">Environment</span>
                  <div className="flex items-center space-x-2">
                    {environmentNoise === 'silent' ? (
                      <VolumeX className="h-4 w-4 text-green-400" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-yellow-400" />
                    )}
                    <span className="text-xs text-gray-400 capitalize">{environmentNoise}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {(['silent', 'low', 'moderate', 'high'] as const).map(level => (
                    <Button
                      key={level}
                      size="sm"
                      variant="ghost"
                      onClick={() => setEnvironmentNoise(level)}
                      className={cn(
                        'flex-1 text-xs h-8',
                        environmentNoise === level
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                          : 'text-gray-400 hover:bg-white/10'
                      )}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-orange-400" />
                Focus Tasks ({activeTasks.length})
              </h4>
              <div className="space-y-2">
                {activeTasks.slice(0, 3).map(task => (
                  <motion.div
                    key={task.id}
                    whileHover={{ x: 4 }}
                    className="flex flex-col space-y-1 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => onTaskToggle?.(task.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Circle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300 flex-1 leading-relaxed">
                        {task.title}
                      </span>
                    </div>
                    {task.focus_level && (
                      <div className="flex items-center ml-7">
                        <Badge variant="outline" className="text-xs px-2 py-0.5 text-orange-400 border-orange-500/50">
                          Focus Level {task.focus_level}
                        </Badge>
                      </div>
                    )}
                  </motion.div>
                ))}
                {activeTasks.length > 3 && (
                  <div className="text-xs text-gray-400 text-center py-2">
                    +{activeTasks.length - 3} more tasks
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                Completed ({completedTasks.length})
              </h4>
              <div className="space-y-1">
                {completedTasks.slice(0, 2).map(task => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 p-2 rounded-lg"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-500 flex-1 line-through truncate">
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio element for timer completion sound */}
      <audio
        ref={audioRef}
        preload="auto"
        className="hidden"
      >
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBC5+zfPTgjMGHm/A7+OZURE=" type="audio/wav" />
      </audio>
    </div>
  );
};

export default DeepFocusSessionCard;