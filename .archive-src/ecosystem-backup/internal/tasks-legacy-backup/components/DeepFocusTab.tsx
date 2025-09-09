import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target,
  Brain,
  Timer,
  Play,
  Pause,
  Square,
  Zap,
  TrendingUp,
  CheckCircle2,
  Circle,
  Plus,
  Settings,
  BarChart3,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { FlowStateTimer } from '../ui/FlowStateTimer';
import { FocusSessionTimer } from '../ui/FocusSessionTimer';
import { DeepFocusSessionCard } from '../ui/DeepFocusSessionCard';
import { TabProps } from '../DayTabContainer';

interface FocusSession {
  id: string;
  name: string;
  duration: number;
  completed: boolean;
  flowState: 'warming-up' | 'in-flow' | 'completed';
  startTime?: Date;
  quality?: number;
}

interface PriorityTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  completed: boolean;
  sessionId?: string;
}

const mockPriorityTasks: PriorityTask[] = [
  { id: '1', title: 'Complete quarterly review', priority: 'high', estimatedTime: '2h', completed: false },
  { id: '2', title: 'Finish client presentation', priority: 'high', estimatedTime: '1.5h', completed: false },
  { id: '3', title: 'Code review for API changes', priority: 'medium', estimatedTime: '45m', completed: false },
  { id: '4', title: 'Write technical documentation', priority: 'medium', estimatedTime: '1h', completed: true },
];

export const DeepFocusTab: React.FC<TabProps> = ({
  user,
  todayCard,
  refreshTrigger,
  onRefresh,
  onTaskToggle,
  onQuickAdd,
  onOrganizeTasks,
  isAnalyzingTasks
}) => {
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [priorityTasks, setPriorityTasks] = useState<PriorityTask[]>(mockPriorityTasks);
  const [sessionType, setSessionType] = useState<'pomodoro' | 'flow' | 'custom'>('flow');
  const [totalFocusTime, setTotalFocusTime] = useState(125); // minutes today
  const [focusGoal] = useState(240); // 4 hours

  const completedTasks = priorityTasks.filter(t => t.completed).length;
  const highPriorityTasks = priorityTasks.filter(t => t.priority === 'high' && !t.completed);
  const focusProgress = (totalFocusTime / focusGoal) * 100;

  const startFocusSession = (type: 'pomodoro' | 'flow' | 'custom', taskId?: string) => {
    const session: FocusSession = {
      id: Date.now().toString(),
      name: type === 'pomodoro' ? 'Pomodoro Session' : type === 'flow' ? 'Deep Flow Session' : 'Custom Session',
      duration: type === 'pomodoro' ? 25 : type === 'flow' ? 90 : 60,
      completed: false,
      flowState: 'warming-up',
      startTime: new Date()
    };
    setActiveSession(session);
    
    if (taskId) {
      setPriorityTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, sessionId: session.id } : task
      ));
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setPriorityTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    onTaskToggle?.(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-400/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/50';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-400/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/50';
    }
  };

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Deep Focus</h1>
            <p className="text-gray-400 text-sm">Enter the flow state</p>
          </div>
        </div>
        
        {/* Focus Stats */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m today</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span>Goal: {Math.round(focusProgress)}%</span>
          </div>
        </div>
      </motion.div>

      {/* Focus Time Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-blue-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Focus Progress</h3>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">
                {totalFocusTime}min / {focusGoal}min
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={focusProgress} 
              className="h-3 bg-gray-800/60"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Daily Goal</span>
              <span>{Math.round(focusProgress)}% Complete</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Session or Session Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeSession ? (
          <Card className="bg-gradient-to-br from-purple-900/80 via-blue-800/60 to-purple-900/80 border-purple-400/30 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">{activeSession.name}</h3>
                </div>
                <Badge className={`${
                  activeSession.flowState === 'warming-up' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                  activeSession.flowState === 'in-flow' ? 'bg-green-500/20 text-green-300 border-green-500/40' :
                  'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}>
                  {activeSession.flowState === 'warming-up' ? 'Warming Up' :
                   activeSession.flowState === 'in-flow' ? 'In Flow' : 'Completed'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <FlowStateTimer 
                duration={activeSession.duration}
                onComplete={() => {
                  setActiveSession(null);
                  setTotalFocusTime(prev => prev + activeSession.duration);
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-green-400/30 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Start Focus Session</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => startFocusSession('flow')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Deep Flow Session (90min)
                </Button>
                
                <Button 
                  onClick={() => startFocusSession('pomodoro')}
                  variant="outline"
                  className="border-orange-400/50 text-orange-300 hover:bg-orange-500/20 font-semibold py-4 rounded-xl"
                >
                  <Timer className="h-5 w-5 mr-2" />
                  Pomodoro Session (25min)
                </Button>
                
                <Button 
                  onClick={() => startFocusSession('custom')}
                  variant="outline"
                  className="border-gray-500/50 text-gray-300 hover:bg-gray-500/20 font-semibold py-4 rounded-xl"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Custom Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Priority Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-red-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Priority Tasks</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-500/20 text-red-300 border-red-500/40">
                  {completedTasks}/{priorityTasks.length}
                </Badge>
                <Button
                  size="sm"
                  onClick={onOrganizeTasks}
                  disabled={isAnalyzingTasks}
                  className="bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 hover:border-red-400/70 text-xs"
                >
                  {isAnalyzingTasks ? (
                    <motion.div 
                      className="h-3 w-3 mr-1 border border-red-300 border-t-transparent rounded-full" 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Target className="h-3 w-3 mr-1" />
                  )}
                  {isAnalyzingTasks ? 'Organizing...' : 'Organize'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                  ${task.completed 
                    ? 'bg-green-500/20 border-green-400/50 shadow-md shadow-green-500/10' 
                    : 'bg-gray-800/40 border-gray-700/50 hover:border-red-400/30'
                  }
                `}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`
                      font-medium transition-colors
                      ${task.completed ? 'text-green-300 line-through' : 'text-white'}
                    `}>
                      {task.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge 
                        size="sm"
                        className={getPriorityColor(task.priority)}
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {task.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
                
                {!task.completed && !activeSession && (
                  <Button
                    size="sm"
                    onClick={() => startFocusSession('flow', task.id)}
                    className="bg-blue-500/20 border border-blue-400/50 text-blue-300 hover:bg-blue-500/30 text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Focus
                  </Button>
                )}
              </motion.div>
            ))}
            
            {priorityTasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No priority tasks yet</p>
                <Button 
                  onClick={onQuickAdd}
                  className="mt-3 bg-gradient-to-r from-red-500 to-pink-500 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Priority Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* High Priority Alert */}
      {highPriorityTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500/50 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-300">
                    {highPriorityTasks.length} High Priority Task{highPriorityTasks.length > 1 ? 's' : ''} Pending
                  </h4>
                  <p className="text-xs text-red-400/80">
                    Consider starting a focus session for maximum productivity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Focus Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 pt-4"
      >
        <Button 
          onClick={onQuickAdd}
          className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Priority Task
        </Button>
        
        <Button 
          onClick={() => startFocusSession('flow')}
          disabled={!!activeSession}
          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          <Brain className="h-5 w-5 mr-2" />
          Start Deep Focus
        </Button>
      </motion.div>
    </div>
  );
};