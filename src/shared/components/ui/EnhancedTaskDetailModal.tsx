import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  Clock, 
  Target, 
  Zap, 
  Brain, 
  Activity, 
  TrendingUp,
  CheckCircle2,
  Circle,
  Plus,
  X,
  Edit2,
  Save,
  Calendar,
  Timer,
  BarChart3,
  Settings,
  Play,
  Pause,
  Coffee,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedTask, SubTask, FocusIntensity, TaskContext } from '@/shared/services/task.service';
import { FlowStateTimer, FlowSession, FlowState } from '@/shared/components/ui/FlowStateTimer';
import { FlowStatsService } from '@/services/flowStatsService';
import { TaskTimer } from '@/shared/components/tasks/TaskTimer';
import { useUser } from '@clerk/clerk-react';

interface EnhancedTaskDetailModalProps {
  task: EnhancedTask | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<EnhancedTask>) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string, completed: boolean) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onTaskToggle: (taskId: string, completed: boolean) => void;
  onReschedule?: (taskId: string) => void;
  onAdjustDuration?: (taskId: string, newDuration: number) => void;
  parentTask?: EnhancedTask | null; // For displaying parent context
}

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-300 border-red-500/30',
  critical: 'bg-red-600/30 text-red-200 border-red-600/40'
};

const intensityConfig = {
  1: { name: 'Light', color: 'bg-blue-500/20 text-blue-300', duration: '30-45min' },
  2: { name: 'Medium', color: 'bg-yellow-500/20 text-yellow-300', duration: '60-90min' },
  3: { name: 'Deep', color: 'bg-orange-500/20 text-orange-300', duration: '2-3hrs' },
  4: { name: 'Ultra', color: 'bg-red-500/20 text-red-300', duration: '4+hrs' }
};

export const EnhancedTaskDetailModal: React.FC<EnhancedTaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdate,
  onSubtaskToggle,
  onAddSubtask,
  onDeleteSubtask,
  onTaskToggle,
  onReschedule,
  onAdjustDuration,
  parentTask
}) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const taskSessions = task ? FlowStatsService.getSessionsForTask(task.id) : [];
  const flowStats = FlowStatsService.getFlowStats();

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setIsEditing(false);
      setShowAddSubtask(false);
      setNewSubtaskTitle('');
    }
  }, [task]);

  if (!task) return null;

  const isCompleted = task.status === 'done' || task.status === 'completed';
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleSaveEdit = () => {
    onTaskUpdate(task.id, {
      title: editTitle,
      description: editDescription
    });
    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };


  const calculateQualityScore = (): number => {
    if (taskSessions.length === 0) return 0;
    return taskSessions.reduce((sum, session) => sum + session.qualityScore, 0) / taskSessions.length;
  };

  const getTotalTimeSpent = (): number => {
    return taskSessions.reduce((sum, session) => sum + session.duration, 0);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const inferTaskContext = (): TaskContext => {
    if (task.task_context) return task.task_context;
    
    const title = task.title.toLowerCase();
    if (title.includes('code') || title.includes('dev') || title.includes('api')) return 'coding';
    if (title.includes('write') || title.includes('blog') || title.includes('content')) return 'writing';
    if (title.includes('design') || title.includes('ui') || title.includes('ux')) return 'design';
    if (title.includes('research') || title.includes('analyze') || title.includes('study')) return 'research';
    if (title.includes('plan') || title.includes('strategy') || title.includes('organize')) return 'planning';
    if (title.includes('meeting') || title.includes('call') || title.includes('discuss')) return 'communication';
    if (title.includes('learn') || title.includes('course') || title.includes('tutorial')) return 'learning';
    
    return 'creative';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] overflow-hidden sm:w-full">
        <DialogHeader className="sticky top-0 bg-gray-900 pb-4 z-10 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold flex items-center gap-3 mb-2">
                <button
                  onClick={() => onTaskToggle(task.id, !isCompleted)}
                  className={cn(
                    'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-orange-500 hover:border-orange-400'
                  )}
                >
                  {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                </button>
                
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('line-clamp-2', isCompleted && 'line-through opacity-60')}>
                        {task.title}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {/* Parent Context */}
                    {parentTask && (
                      <div className="text-sm text-gray-400 italic">
                        Part of: {parentTask.title}
                      </div>
                    )}
                  </div>
                )}

              </DialogTitle>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-3 text-sm">
                <Badge className={cn('text-xs', priorityColors[task.priority])}>
                  {task.priority}
                </Badge>
                
                {task.focus_intensity && (
                  <Badge className={cn('text-xs', intensityConfig[task.focus_intensity].color)}>
                    Level {task.focus_intensity} • {intensityConfig[task.focus_intensity].duration}
                  </Badge>
                )}
                
                <Badge className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  {task.task_context || inferTaskContext()}
                </Badge>
                
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(getTotalTimeSpent())}</span>
                </div>
                
                {totalSubtasks > 0 && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Target className="w-3 h-3" />
                    <span>{completedSubtasks}/{totalSubtasks}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        {/* Quick Action Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Timer className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-bold text-white">{formatTime(getTotalTimeSpent())}</span>
            </div>
            <div className="text-xs text-gray-400">Time Spent</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-lg font-bold text-white">{task.effort_points}</span>
            </div>
            <div className="text-xs text-gray-400">Effort Points</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-lg font-bold text-white">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="text-xs text-gray-400">Progress</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-lg font-bold text-white">{calculateQualityScore().toFixed(1)}</span>
            </div>
            <div className="text-xs text-gray-400">Quality Score</div>
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-gray-700">Progress</TabsTrigger>
            <TabsTrigger value="flow" className="data-[state=active]:bg-gray-700">Flow</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="overview" className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2 text-gray-200">Description</h4>
                {isEditing ? (
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add task description..."
                    className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                  />
                ) : (
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {task.description || 'No description provided.'}
                  </p>
                )}
              </div>
              
              {/* Enhanced Subtasks - Clean & Scannable */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-200 text-lg">Subtasks</h4>
                    {totalSubtasks > 0 && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {completedSubtasks}/{totalSubtasks} Complete
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAddSubtask(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Subtask
                  </Button>
                </div>

                <div className="space-y-3">
                  {subtasks.map((subtask, index) => (
                    <motion.div
                      key={subtask.id}
                      layout
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg transition-all",
                        subtask.completed
                          ? "bg-green-900/20 border border-green-500/30"
                          : "bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/80"
                      )}
                    >
                      {/* Index Number */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                        {index + 1}
                      </div>

                      {/* Checkbox */}
                      <button
                        onClick={() => onSubtaskToggle(task.id, subtask.id, !subtask.completed)}
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
                          subtask.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-blue-400 hover:border-blue-300 hover:bg-blue-500/10'
                        )}
                      >
                        {subtask.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      {/* Subtask Title */}
                      <span className={cn(
                        'flex-1 text-base font-medium transition-all',
                        subtask.completed
                          ? 'line-through opacity-60 text-gray-400'
                          : 'text-gray-100'
                      )}>
                        {subtask.title}
                      </span>

                      {/* Duration Badge */}
                      {subtask.estimated_duration && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1 bg-purple-500/10 text-purple-300 border-purple-500/30"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {subtask.estimated_duration}m
                        </Badge>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteSubtask(task.id, subtask.id)}
                        className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  
                  {/* Add New Subtask */}
                  <AnimatePresence>
                    {showAddSubtask && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-600"
                      >
                        <Input
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Enter subtask title..."
                          className="flex-1 bg-gray-700 border-gray-600 text-white"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                          autoFocus
                        />
                        <Button onClick={handleAddSubtask} size="sm" className="bg-green-600 hover:bg-green-700">
                          Add
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowAddSubtask(false);
                            setNewSubtaskTitle('');
                          }}
                          size="sm" 
                          variant="ghost"
                          className="text-gray-400 hover:text-gray-300"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {subtasks.length === 0 && !showAddSubtask && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No subtasks yet. Break this task down into smaller steps!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Simple Timer */}
              {user?.id && (
                <TaskTimer
                  taskId={task.id}
                  userId={user.id}
                  estimatedDuration={task.estimated_duration}
                  onSessionComplete={(totalSeconds) => {
                    // Update task with actual duration
                    onTaskUpdate(task.id, {
                      actual_duration: (task.actual_duration || 0) + Math.round(totalSeconds / 60)
                    });
                  }}
                />
              )}

              {/* Quick Actions */}
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-200 mb-3">⚡ Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  {onReschedule && (
                    <Button
                      onClick={() => onReschedule(task.id)}
                      variant="outline"
                      className="border-blue-500/40 text-blue-300 hover:bg-blue-500/20"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                  )}
                  {onAdjustDuration && (
                    <Button
                      onClick={() => {
                        const newDuration = prompt('Enter new duration (minutes):', task.estimated_duration?.toString() || '60');
                        if (newDuration) {
                          onAdjustDuration(task.id, parseInt(newDuration));
                        }
                      }}
                      variant="outline"
                      className="border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Timer className="w-4 h-4 mr-2" />
                      Adjust Duration
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-6">
              {/* Progress Visualization */}
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold mb-4 text-gray-200">Task Progress</h4>
                
                {/* Progress Ring */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${progressPercentage * 2.51} 251`}
                        className="text-green-500 transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-400">
                  {completedSubtasks} of {totalSubtasks} subtasks completed
                </div>
              </div>
              
              {/* Time Tracking */}
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold mb-4 text-gray-200">Time Analysis</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Estimated</div>
                    <div className="text-lg font-bold text-white">
                      {task.estimated_duration ? `${task.estimated_duration}m` : 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Actual</div>
                    <div className="text-lg font-bold text-white">
                      {formatTime(getTotalTimeSpent())}
                    </div>
                  </div>
                </div>
                
                {task.estimated_duration && getTotalTimeSpent() > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-400 mb-2">Estimation Accuracy</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={cn(
                          'h-2 rounded-full transition-all duration-500',
                          getTotalTimeSpent() <= task.estimated_duration ? 'bg-green-500' : 'bg-red-500'
                        )}
                        style={{ width: `${Math.min(100, (getTotalTimeSpent() / task.estimated_duration) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getTotalTimeSpent() <= task.estimated_duration 
                        ? `${Math.round(((task.estimated_duration - getTotalTimeSpent()) / task.estimated_duration) * 100)}% under estimate`
                        : `${Math.round(((getTotalTimeSpent() - task.estimated_duration) / task.estimated_duration) * 100)}% over estimate`
                      }
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="flow" className="space-y-6">
              {/* Flow Session History */}
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold mb-4 text-gray-200">Flow Session History</h4>
                
                {taskSessions.length > 0 ? (
                  <div className="space-y-3">
                    {taskSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-3 h-3 rounded-full',
                            session.flowState === 'in-flow' ? 'bg-green-500' :
                            session.flowState === 'disrupted' ? 'bg-orange-500' :
                            session.flowState === 'broken' ? 'bg-red-500' : 'bg-gray-500'
                          )} />
                          <div>
                            <div className="text-sm text-white">{formatTime(session.duration)}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(session.startTime).toLocaleDateString()} • Quality: {session.qualityScore.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <Badge className={cn(
                          'text-xs',
                          session.flowState === 'in-flow' ? 'bg-green-500/20 text-green-300' :
                          session.flowState === 'disrupted' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-red-500/20 text-red-300'
                        )}>
                          {session.flowState.replace('-', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No flow sessions recorded yet.</p>
                    <p className="text-xs">Start a focus session to track your flow state!</p>
                  </div>
                )}
              </div>
              
              {/* Flow Quality Metrics */}
              {taskSessions.length > 0 && (
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-4 text-gray-200">Flow Quality</h4>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{calculateQualityScore().toFixed(1)}</div>
                      <div className="text-xs text-gray-400">Avg Quality</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{taskSessions.length}</div>
                      <div className="text-xs text-gray-400">Sessions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {Math.round(taskSessions.reduce((sum, s) => sum + s.duration, 0) / taskSessions.length)}m
                      </div>
                      <div className="text-xs text-gray-400">Avg Duration</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              {/* Context Analysis */}
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold mb-4 text-gray-200">Context Analysis</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Task Context</span>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                      {task.task_context || inferTaskContext()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Context Switch Cost</span>
                    <span className="text-sm text-orange-400">{task.context_switching_cost}min</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Flow State Potential</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-2 h-2 rounded-full',
                            i < task.flow_state_potential ? 'bg-purple-500' : 'bg-gray-600'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Performance Insights */}
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold mb-4 text-gray-200">Performance Insights</h4>
                
                <div className="space-y-4">
                  {taskSessions.length > 0 && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-blue-300">Performance Trend</div>
                          <div className="text-xs text-gray-400">
                            Average session quality is {calculateQualityScore().toFixed(1)}/10
                            {calculateQualityScore() >= 8 ? ' - Excellent focus!' : 
                             calculateQualityScore() >= 6 ? ' - Good focus levels' : 
                             ' - Consider shorter sessions'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {task.estimated_duration && getTotalTimeSpent() > task.estimated_duration && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-orange-300">Time Overrun</div>
                          <div className="text-xs text-gray-400">
                            Task is taking longer than estimated. Consider breaking it down further.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {totalSubtasks === 0 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-yellow-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-yellow-300">Subtask Suggestion</div>
                          <div className="text-xs text-gray-400">
                            Breaking this task into subtasks can improve focus and tracking.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedTaskDetailModal;