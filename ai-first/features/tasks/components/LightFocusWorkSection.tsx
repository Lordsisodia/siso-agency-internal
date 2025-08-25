import React, { useState, useEffect, useMemo } from 'react';
import { 
  Coffee,
  Plus,
  Check,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
  X,
  Edit,
  Mic,
  MicOff,
  Zap,
  Brain,
  Settings,
  Loader2,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedDateHeader } from '@/components/ui/animated-date-header-v2';
import { format } from 'date-fns';
import { PersonalContextModal } from './PersonalContextModal';
import { useTaskDatabase } from '@/ai-first/hooks/useTaskDatabase';

interface LightFocusWorkSectionProps {
  selectedDate: Date;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate,
  onPreviousDate,
  onNextDate
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<{[taskId: string]: string}>({});
  const [showPersonalContextModal, setShowPersonalContextModal] = useState(false);

  // Use the database hook
  const {
    tasks,
    loading,
    error,
    personalContext,
    createTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    analyzeTaskWithAI,
    analyzeSubtaskWithAI,
    updatePersonalContext,
    addSubtask,
    deleteTask
  } = useTaskDatabase({ selectedDate });

  // Filter for light work tasks
  const lightWorkTasks = tasks.filter(task => 
    task.workType === 'LIGHT' || 
    !task.title.toLowerCase().includes('deep') && 
    !task.title.toLowerCase().includes('morning')
  );

  // Toggle task expansion
  const toggleExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Start editing task
  const startEditingTask = (taskId: string, currentTitle: string) => {
    setEditingTask(taskId);
    setEditingTaskTitle(currentTitle);
  };

  // Stop editing task and save
  const stopEditingTask = () => {
    // In the advanced version, this would update the task title
    // For now, we'll just stop editing since our database service doesn't have update title yet
    setEditingTask(null);
    setEditingTaskTitle('');
  };

  // Start editing subtask
  const startEditingSubtask = (subtaskId: string, currentTitle: string) => {
    setEditingSubtask(subtaskId);
    setEditingSubtaskTitle(currentTitle);
  };

  // Stop editing subtask
  const stopEditingSubtask = () => {
    setEditingSubtask(null);
    setEditingSubtaskTitle('');
  };

  // Add subtask to task
  const handleAddSubtask = async (taskId: string) => {
    const title = newSubtaskTitles[taskId]?.trim();
    if (!title) return;

    try {
      await addSubtask(taskId, title);
      setNewSubtaskTitles(prev => ({ ...prev, [taskId]: '' }));
    } catch (error) {
      console.error('❌ Failed to add subtask:', error);
    }
  };

  // Add new task
  const handleAddTask = async () => {
    try {
      await createTask({
        title: 'New Light Work Task',
        description: 'Click to edit this task',
        workType: 'LIGHT',
        priority: 'MEDIUM',
        currentDate: format(selectedDate, 'yyyy-MM-dd'),
        timeEstimate: '20 min',
        estimatedDuration: 20,
        subtasks: []
      });
    } catch (error) {
      console.error('❌ Failed to add task:', error);
    }
  };

  // Parse time estimate to minutes
  const parseTimeEstimate = (timeStr: string): number => {
    const match = timeStr.match(/(\\d+)\\s*(min|hour|h)/i);
    if (!match) return 20;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    return unit.includes('h') ? value * 60 : value;
  };

  // Calculate total remaining time
  const getTotalRemainingTime = (): string => {
    const totalMinutes = lightWorkTasks
      .filter(task => !task.completed)
      .reduce((total, task) => {
        return total + parseTimeEstimate(task.timeEstimate || '20 min');
      }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate XP to earn from remaining tasks
  const getExpToEarn = (): number => {
    const remainingTasks = lightWorkTasks.filter(task => !task.completed);
    
    let totalXP = remainingTasks.reduce((total, task) => {
      const taskXP = task.xpReward || getDefaultTaskXP(task);
      const subtaskXP = task.subtasks
        .filter(sub => !sub.completed)
        .reduce((subTotal, sub) => subTotal + (sub.xpReward || 15), 0);
      return total + taskXP + subtaskXP;
    }, 0);
    
    return totalXP;
  };

  // Get default XP for tasks without AI analysis
  const getDefaultTaskXP = (task: any): number => {
    const timeMinutes = parseTimeEstimate(task.timeEstimate || '20 min');
    return Math.round(10 + (timeMinutes * 0.5));
  };

  // Calculate XP stats
  const xpStats = useMemo(() => {
    let earnedXP = 0;
    let potentialXP = 0;

    lightWorkTasks.forEach(task => {
      const taskXP = task.xpReward || getDefaultTaskXP(task);
      if (task.completed) {
        earnedXP += taskXP;
      } else {
        potentialXP += taskXP;
      }

      task.subtasks.forEach(subtask => {
        const subtaskXP = subtask.xpReward || 15;
        if (subtask.completed) {
          earnedXP += subtaskXP;
        } else {
          potentialXP += subtaskXP;
        }
      });
    });

    return { earned: earnedXP, potential: potentialXP };
  }, [lightWorkTasks]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-green-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading light work tasks...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <Database className="h-12 w-12 mx-auto mb-4" />
          <div>Error loading tasks: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 relative">
      {/* Progress Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50"></div>
      
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Advanced Animated Date Header with XP tracking */}
        <AnimatedDateHeader 
          selectedDate={selectedDate}
          earnedXP={xpStats.earned}
          potentialXP={xpStats.potential}
          currentLevel={Math.floor(xpStats.earned / 100) + 1}
          streakDays={3} // TODO: Implement actual streak tracking
          badgeCount={2} // TODO: Implement actual badge system
          onPreviousDate={onPreviousDate}
          onNextDate={onNextDate}
        />
        
        {/* Light Work Card with Advanced UI */}
        <Card className="bg-green-900/20 border-green-700/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center justify-between text-green-400 text-base sm:text-lg">
              <div className="flex items-center">
                <Coffee className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                ☕ Light Work Sessions
              </div>
              <button
                onClick={() => setShowPersonalContextModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-lg transition-colors text-gray-300 hover:text-blue-300"
                title="Configure AI personal context for better XP analysis"
              >
                <Settings className="h-3 w-3" />
                AI Context
              </button>
            </CardTitle>
            <div className="border-t border-green-600/50 my-4"></div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-green-300 mb-2 text-sm sm:text-base">Momentum Building</h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                  Light work sessions are perfect for administrative tasks, quick wins, and maintaining momentum 
                  when your energy is lower or when you need a mental break from deep focus work.
                </p>
              </div>
              <div className="border-t border-green-600/50 my-4"></div>
              <div>
                <h3 className="font-bold text-green-300 mb-2 text-sm sm:text-base">Light Work Rules</h3>
                <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
                  <li>• Perfect for lower energy periods.</li>
                  <li>• Focus on quick wins and administrative tasks.</li>
                  <li>• Keep sessions between 20-45 minutes.</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-green-600/50 my-3 sm:my-4"></div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 pb-24">
            
            {/* Advanced Session Stats */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="text-xl font-bold text-green-400">
                    {getTotalRemainingTime()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Time Left</div>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="text-xl font-bold text-blue-400">
                    {lightWorkTasks.filter(t => !t.completed).length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Remaining</div>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="text-xl font-bold text-yellow-400">
                    {getExpToEarn()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">XP to Earn</div>
                </div>
              </div>
            </div>

            {/* Advanced Task Blocks with Brain Icons */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {lightWorkTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                return (
                  <div key={task.id} className="bg-gray-800/20 border border-gray-700/30 rounded-xl overflow-hidden hover:bg-gray-800/30 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/5">
                    
                    {/* Task Header with Advanced Icons */}
                    <div className="flex items-start space-x-3 p-4">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <button
                          onClick={() => toggleTaskCompletion(task.id)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${ 
                            task.completed
                              ? 'bg-green-600 border-green-600' 
                              : 'border-gray-600 hover:border-green-500'
                          }`}>
                            {task.completed && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </button>

                        <div className="min-w-0 flex-1">
                          {editingTask === task.id ? (
                            <input
                              type="text"
                              value={editingTaskTitle}
                              onChange={(e) => setEditingTaskTitle(e.target.value)}
                              onBlur={stopEditingTask}
                              onKeyDown={(e) => e.key === 'Enter' && stopEditingTask()}
                              className="bg-gray-700 text-white px-2 py-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                              autoFocus
                            />
                          ) : (
                            <h4
                              className={`font-medium text-sm cursor-pointer hover:text-green-300 transition-colors ${
                                task.completed ? 'text-gray-500 line-through' : 'text-gray-100'
                              }`}
                              onClick={() => startEditingTask(task.id, task.title)}
                            >
                              {task.title}
                            </h4>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.timeEstimate}
                            </span>
                            {task.subtasks.length > 0 && (
                              <span className="text-xs text-gray-400">
                                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Advanced Action Buttons with Brain Icon */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {/* AI Analysis Button with Brain Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            analyzeTaskWithAI(task.id);
                          }}
                          className={`p-1 hover:bg-gray-700/50 rounded transition-colors ${
                            task.aiAnalyzed 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-gray-400 hover:text-yellow-400'
                          }`}
                          title={task.aiAnalyzed ? `Analyzed: ${task.xpReward} XP (${task.difficulty})` : 'Analyze with AI'}
                        >
                          {task.aiAnalyzed ? (
                            <Zap className="h-3 w-3" />
                          ) : (
                            <Brain className="h-3 w-3" />
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpansion(task.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>

                        {/* XP Badge */}
                        {(task.aiAnalyzed && task.xpReward) && (
                          <div className={`px-2 py-1 rounded text-xs font-bold ${
                            task.difficulty === 'expert' ? 'bg-red-900/50 text-red-300 border border-red-700/50' :
                            task.difficulty === 'hard' ? 'bg-orange-900/50 text-orange-300 border border-orange-700/50' :
                            task.difficulty === 'moderate' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50' :
                            task.difficulty === 'easy' ? 'bg-green-900/50 text-green-300 border border-green-700/50' :
                            'bg-gray-900/50 text-gray-300 border border-gray-700/50'
                          }`}>
                            {task.xpReward} XP
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Subtasks Section */}
                    {isExpanded && (
                      <div className="border-t border-gray-700/30 bg-gray-900/20 p-4">
                        {/* Existing Subtasks */}
                        <div className="space-y-2 mb-3">
                          {task.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center space-x-3 group">
                              <button
                                onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
                                className="flex-shrink-0"
                              >
                                <div className={`w-3 h-3 rounded border flex items-center justify-center transition-all duration-200 ${
                                  subtask.completed
                                    ? 'bg-green-600 border-green-600'
                                    : 'border-gray-600 hover:border-green-500'
                                }`}>
                                  {subtask.completed && <Check className="w-2 h-2 text-white" />}
                                </div>
                              </button>

                              <div className="flex-1 min-w-0">
                                {editingSubtask === subtask.id ? (
                                  <input
                                    type="text"
                                    value={editingSubtaskTitle}
                                    onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                    onBlur={stopEditingSubtask}
                                    onKeyDown={(e) => e.key === 'Enter' && stopEditingSubtask()}
                                    className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    className={`text-xs cursor-pointer hover:text-green-300 transition-colors ${
                                      subtask.completed ? 'text-gray-500 line-through' : 'text-gray-200'
                                    }`}
                                    onClick={() => startEditingSubtask(subtask.id, subtask.title)}
                                  >
                                    {subtask.title}
                                  </span>
                                )}
                              </div>

                              {/* Subtask AI Analysis with Brain Icon */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  analyzeSubtaskWithAI(task.id, subtask.id);
                                }}
                                className={`p-1 hover:bg-gray-700/50 rounded transition-colors opacity-0 group-hover:opacity-100 ${
                                  subtask.aiAnalyzed 
                                    ? 'text-yellow-400 hover:text-yellow-300' 
                                    : 'text-gray-400 hover:text-yellow-400'
                                }`}
                                title={subtask.aiAnalyzed ? `Analyzed: ${subtask.xpReward} XP` : 'Analyze with AI'}
                              >
                                {subtask.aiAnalyzed ? (
                                  <Zap className="h-3 w-3" />
                                ) : (
                                  <Brain className="h-3 w-3" />
                                )}
                              </button>

                              {/* Subtask XP Badge */}
                              {(subtask.aiAnalyzed && subtask.xpReward) && (
                                <div className="px-2 py-0.5 rounded text-xs font-bold bg-blue-900/50 text-blue-300 border border-blue-700/50">
                                  {subtask.xpReward} XP
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add New Subtask */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newSubtaskTitles[task.id] || ''}
                            onChange={(e) => setNewSubtaskTitles(prev => ({ ...prev, [task.id]: e.target.value }))}
                            placeholder="Add subtask..."
                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddSubtask(task.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddSubtask(task.id)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Advanced Add Task Button */}
            <button
              onClick={handleAddTask}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-green-600/50 text-green-400 hover:border-green-500 hover:text-green-300 hover:bg-green-900/10 rounded-lg transition-all duration-200 text-sm font-medium w-full justify-center mt-6"
            >
              <Plus className="h-4 w-4" />
              Add Light Work Task
            </button>

          </CardContent>
        </Card>
      </div>

      {/* Personal Context Modal */}
      <PersonalContextModal
        isOpen={showPersonalContextModal}
        onClose={() => setShowPersonalContextModal(false)}
        onSave={(context) => {
          updatePersonalContext(context);
          console.log('🎯 Personal context updated for AI XP analysis');
        }}
      />
    </div>
  );
};