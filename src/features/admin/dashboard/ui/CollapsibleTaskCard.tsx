import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Clock, 
  Plus,
  X,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedTask, SubTask, FocusIntensity, TaskContext } from '@/shared/services/task.service';
import { FlowStateTimer, FlowSession } from './FlowStateTimer';
import { FlowStatsService } from '@/services/flowStatsService';

interface CollapsibleTaskCardProps {
  task: EnhancedTask;
  onTaskToggle: (taskId: string, completed: boolean) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string, completed: boolean) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<EnhancedTask>) => void;
  onTaskClick?: (task: EnhancedTask) => void;
  className?: string;
}

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-300 border-red-500/30',
  critical: 'bg-red-600/30 text-red-200 border-red-600/40'
};

const statusColors = {
  pending: 'bg-gray-500/20 text-gray-300',
  in_progress: 'bg-blue-500/20 text-blue-300',
  completed: 'bg-green-500/20 text-green-300',
  done: 'bg-green-500/20 text-green-300',
  overdue: 'bg-red-500/20 text-red-300',
  blocked: 'bg-yellow-500/20 text-yellow-300'
};

export const CollapsibleTaskCard: React.FC<CollapsibleTaskCardProps> = ({
  task,
  onTaskToggle,
  onSubtaskToggle,
  onAddSubtask,
  onDeleteSubtask,
  onTaskUpdate,
  onTaskClick,
  className
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showFlowTimer, setShowFlowTimer] = useState(false);
  const [flowState, setFlowState] = useState<'not-started' | 'warming-up' | 'in-flow' | 'disrupted' | 'broken'>('not-started');
  
  const isCompleted = task.status === 'done' || task.status === 'completed';
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const totalSubtasks = subtasks.length;
  const hasSubtasks = totalSubtasks > 0;
  
  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };
  
  const handleTaskClick = () => {
    onTaskToggle(task.id, !isCompleted);
  };
  
  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    onSubtaskToggle(task.id, subtaskId, completed);
  };
  
  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    onDeleteSubtask(task.id, subtaskId);
  };

  const handleFlowSessionComplete = (session: FlowSession) => {
    FlowStatsService.saveFlowSession(session);
    setShowFlowTimer(false);
    
    // Update task with actual duration
    onTaskUpdate(task.id, {
      actual_duration: session.duration
    });
  };

  const handleIntensityChange = (intensity: FocusIntensity) => {
    onTaskUpdate(task.id, {
      focus_intensity: intensity
    });
  };

  const handleContextChange = (context: TaskContext) => {
    onTaskUpdate(task.id, {
      task_context: context
    });
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

  const getFlowStateIndicator = () => {
    const colors = {
      'not-started': 'bg-gray-500',
      'warming-up': 'bg-yellow-500',
      'in-flow': 'bg-green-500',
      'disrupted': 'bg-orange-500',
      'broken': 'bg-red-500'
    };
    
    return (
      <div className={cn('w-2 h-2 rounded-full', colors[flowState])} />
    );
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('[role="button"]')) {
      return;
    }
    
    onTaskClick?.(task);
  };

  return (
    <Card 
      className={cn(
        'bg-orange-900/20 border-orange-700/50 hover:bg-orange-900/25 transition-all duration-200',
        isCompleted && 'opacity-75',
        onTaskClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Main task info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={handleTaskClick}
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-orange-500 hover:border-orange-400'
                )}
              >
                {isCompleted && <Check className="w-3 h-3" />}
              </button>
              
              <h3 className={cn(
                'font-semibold text-orange-300 flex-1 transition-all',
                isCompleted && 'line-through opacity-60'
              )}>
                {task.title}
              </h3>
              
              {/* Collapse toggle */}
              <button
                onClick={handleToggleCollapse}
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Task metadata */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn('text-xs', priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              
              <Badge className={cn('text-xs', statusColors[task.status as keyof typeof statusColors] || statusColors.pending)}>
                {task.status}
              </Badge>
              
              {task.estimated_duration && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimated_duration}m</span>
                </div>
              )}
              
              {task.effort_points && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Zap className="w-3 h-3" />
                  <span>{task.effort_points}pts</span>
                </div>
              )}
              
              {hasSubtasks && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Target className="w-3 h-3" />
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
              )}
              
              {/* Flow State Indicator */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {getFlowStateIndicator()}
                <span className="capitalize">{flowState.replace('-', ' ')}</span>
              </div>
              
              {/* Focus Intensity */}
              {task.focus_intensity && (
                <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Level {task.focus_intensity}
                </Badge>
              )}
              
              {/* Task Context */}
              <Badge className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {task.task_context || inferTaskContext()}
              </Badge>
            </div>
            
            {/* Collapsed state summary */}
            {isCollapsed && hasSubtasks && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 space-y-1"
              >
                <div className="text-sm text-gray-400">
                  {completedSubtasks}/{totalSubtasks} subtasks completed
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                  <div 
                    className="h-1.5 bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Description */}
        {task.description && !isCollapsed && (
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </CardHeader>
      
      {/* Subtasks content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
              {/* Subtasks list */}
              {hasSubtasks && (
                <div className="space-y-2 mb-3">
                  <h4 className="text-sm font-medium text-orange-300 mb-2">Subtasks</h4>
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 p-2 bg-orange-950/30 rounded-lg">
                      <button
                        onClick={() => handleSubtaskToggle(subtask.id, !subtask.completed)}
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                          subtask.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-orange-400 hover:border-orange-300'
                        )}
                      >
                        {subtask.completed && <Check className="w-2.5 h-2.5" />}
                      </button>
                      
                      <span className={cn(
                        'flex-1 text-sm transition-all',
                        subtask.completed 
                          ? 'line-through opacity-60 text-gray-400' 
                          : 'text-gray-200'
                      )}>
                        {subtask.title}
                      </span>
                      
                      {subtask.estimated_duration && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{subtask.estimated_duration}m</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add subtask */}
              <div className="space-y-2">
                {showAddSubtask ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Enter subtask title..."
                      className="flex-1 bg-orange-950/30 border-orange-700/50 text-gray-200 placeholder-gray-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                      autoFocus
                    />
                    <Button
                      onClick={handleAddSubtask}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
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
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowAddSubtask(true)}
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-orange-400 hover:text-orange-300 hover:bg-orange-950/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subtask
                  </Button>
                )}
              </div>
              
              {/* Focus Intensity and Context Controls */}
              <div className="space-y-3 mt-4 pt-4 border-t border-orange-700/30">
                <h4 className="text-sm font-medium text-orange-300 mb-2">Focus Settings</h4>
                
                {/* Focus Intensity Selector */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Focus Intensity</label>
                  <div className="grid grid-cols-4 gap-2">
                    {([1, 2, 3, 4] as FocusIntensity[]).map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant={task.focus_intensity === level ? "default" : "outline"}
                        onClick={() => handleIntensityChange(level)}
                        className={cn(
                          'text-xs p-2',
                          task.focus_intensity === level 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500' 
                            : 'border-purple-500/50 text-purple-300 hover:bg-purple-950/20'
                        )}
                      >
                        L{level}
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    L1: 30-45min • L2: 60-90min • L3: 2-3hrs • L4: 4+hrs
                  </div>
                </div>
                
                {/* Task Context Selector */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Task Context</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['coding', 'writing', 'design', 'research', 'planning', 'communication', 'learning', 'creative'] as TaskContext[]).map((context) => (
                      <Button
                        key={context}
                        size="sm"
                        variant={task.task_context === context ? "default" : "outline"}
                        onClick={() => handleContextChange(context)}
                        className={cn(
                          'text-xs p-1.5',
                          task.task_context === context 
                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500' 
                            : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/20'
                        )}
                      >
                        {context.slice(0, 4)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Flow Timer Controls */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400">Flow State Timer</label>
                    <Button
                      size="sm"
                      onClick={() => setShowFlowTimer(!showFlowTimer)}
                      className={cn(
                        'text-xs px-2 py-1',
                        showFlowTimer 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      )}
                    >
                      {showFlowTimer ? 'Hide Timer' : 'Start Flow Session'}
                    </Button>
                  </div>
                  
                  {showFlowTimer && (
                    <FlowStateTimer
                      taskId={task.id}
                      taskTitle={task.title}
                      taskContext={task.task_context || inferTaskContext()}
                      focusIntensity={task.focus_intensity || 2}
                      onSessionComplete={handleFlowSessionComplete}
                      onFlowStateChange={setFlowState}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};