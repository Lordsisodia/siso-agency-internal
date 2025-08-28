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
  ArrowLeft,
  Trash,
  Settings,
  Calendar,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { aiXPService, TaskAnalysis } from '@/ai-first/services/ai-xp-service';
import { PersonalContextModal } from './PersonalContextModal';
import { useTaskDatabase } from '@/ai-first/hooks/useTaskDatabase';
import { theme } from '@/styles/theme';
import { useImplementation } from '@/migration/feature-flags';

// Simple block-style task management for light work sessions

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  xpReward?: number;
  difficulty?: 'trivial' | 'easy' | 'moderate' | 'hard' | 'expert';
  aiAnalyzed?: boolean;
  priorityRank?: number; // 1-5 ranking
  contextualBonus?: number; // Extra XP
}

interface ThoughtDump {
  id: string;
  content: string;
  timestamp: Date;
  duration?: number; // in seconds
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  timeEstimate: string;
  subtasks: Subtask[];
  thoughtDump?: ThoughtDump;
  isEditable?: boolean;
  xpReward?: number;
  difficulty?: 'trivial' | 'easy' | 'moderate' | 'hard' | 'expert';
  aiAnalyzed?: boolean;
  priorityRank?: number; // 1-5 ranking
  contextualBonus?: number; // Extra XP
}

interface LightFocusWorkSectionProps {
  selectedDate: Date;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate
}) => {
  // Use real database connection
  const { 
    tasks: dbTasks, 
    loading, 
    error, 
    createTask, 
    toggleTaskCompletion, 
    toggleSubtaskCompletion,
    personalContext,
    analyzeTaskWithAI,
    analyzeSubtaskWithAI,
    updatePersonalContext,
    addSubtask,
    deleteTask,
    deleteSubtask,
    updateTaskTitle,
    pushTaskToAnotherDay
  } = useTaskDatabase({ selectedDate });

  // Filter only light work tasks and transform to expected format
  const allTasks = dbTasks
    .filter(task => task.workType === 'LIGHT')
    .map(task => ({
      ...task,
      timeEstimate: task.timeEstimate || '20 min', // Default if missing
      subtasks: task.subtasks.map(subtask => ({
        ...subtask,
        xpReward: subtask.xpReward || 0,
        difficulty: subtask.difficulty || 'easy',
        aiAnalyzed: subtask.aiAnalyzed || false,
        priorityRank: subtask.priorityRank || 0,
        contextualBonus: subtask.contextualBonus || 0
      })),
      thoughtDump: undefined, // Not supported in database yet
      isEditable: false,
      xpReward: task.xpReward || 0,
      difficulty: task.difficulty || 'easy',
      aiAnalyzed: task.aiAnalyzed || false,
      priorityRank: task.priorityRank || 0,
      contextualBonus: task.contextualBonus || 0,
      isPushed: task.currentDate !== task.originalDate && task.rollovers > 0
    }));

  // Sort tasks: regular tasks first, then pushed tasks at bottom
  const tasks = allTasks.sort((a, b) => {
    if (a.isPushed && !b.isPushed) return 1;
    if (!a.isPushed && b.isPushed) return -1;
    return 0;
  });

  // All tasks are always expanded - no need for localStorage management
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [recordingTaskId, setRecordingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showContextModal, setShowContextModal] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    toggleTaskCompletion(id);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    toggleSubtaskCompletion(taskId, subtaskId);
  };


  const startAddingSubtask = (taskId: string) => {
    setAddingSubtaskToId(taskId);
    setNewSubtaskTitle('');
    // Tasks are always expanded, no need to manage expansion
  };

  const saveNewSubtask = async (taskId: string) => {
    if (!newSubtaskTitle.trim()) {
      setAddingSubtaskToId(null);
      return;
    }
    
    try {
      await addSubtask(taskId, newSubtaskTitle.trim());
      setAddingSubtaskToId(null);
      setNewSubtaskTitle('');
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const cancelAddingSubtask = () => {
    setAddingSubtaskToId(null);
    setNewSubtaskTitle('');
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handlePushToAnotherDay = async (taskId: string) => {
    try {
      const tomorrow = new Date(selectedDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      await pushTaskToAnotherDay(taskId, tomorrowStr);
    } catch (error) {
      console.error('Failed to push task to another day:', error);
    }
  };

  // Remove toggle functionality - tasks are always expanded
  // const toggleExpanded = (taskId: string) => {
  //   // No longer needed
  // };

  const startEditingTask = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditTaskTitle(currentTitle);
  };

  const startEditingSubtask = (subtaskId: string, currentTitle: string) => {
    setEditingSubtaskId(subtaskId);
    setEditSubtaskTitle(currentTitle);
  };

  const saveTaskEdit = async (taskId: string) => {
    if (editTaskTitle.trim()) {
      try {
        await updateTaskTitle(taskId, editTaskTitle.trim());
      } catch (error) {
        console.error('Failed to update task title:', error);
      }
    }
    setEditingTaskId(null);
    setEditTaskTitle('');
  };

  const saveSubtaskEdit = (taskId: string, subtaskId: string) => {
    console.warn('⚠️ Subtask title editing not yet implemented with database persistence');
    // TODO: Implement subtask title editing with database API
    setEditingSubtaskId(null);
    setEditSubtaskTitle('');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingSubtaskId(null);
    setEditTaskTitle('');
    setEditSubtaskTitle('');
    cancelAddingSubtask();
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'task' | 'subtask' | 'newSubtask', taskId: string, subtaskId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'task') {
        saveTaskEdit(taskId);
      } else if (type === 'subtask' && subtaskId) {
        saveSubtaskEdit(taskId, subtaskId);
      } else if (type === 'newSubtask') {
        saveNewSubtask(taskId);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (type === 'newSubtask') {
        cancelAddingSubtask();
      } else {
        cancelEdit();
      }
    }
  };

  const startThoughtDump = async (taskId: string) => {
    try {
      setRecordingTaskId(taskId);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // For now, just simulate a 2-minute recording with a prompt
      const thoughtContent = prompt('Enter your thought dump for this task (voice recording will be implemented):');
      
      if (thoughtContent?.trim()) {
        const newThoughtDump: ThoughtDump = {
          id: `thought-${Date.now()}`,
          content: thoughtContent.trim(),
          timestamp: new Date(),
          duration: 120 // 2 minutes default
        };
        
        console.warn('⚠️ Thought dump feature disabled - not connected to database yet');
      }
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. You can still add text notes.');
      
      // Fallback to text input
      const thoughtContent = prompt('Enter your thought dump for this task:');
      if (thoughtContent?.trim()) {
        const newThoughtDump: ThoughtDump = {
          id: `thought-${Date.now()}`,
          content: thoughtContent.trim(),
          timestamp: new Date()
        };
        
        console.warn('⚠️ Thought dump feature disabled - not connected to database yet');
      }
    } finally {
      setRecordingTaskId(null);
    }
  };

  const removeThoughtDump = (taskId: string) => {
    console.warn('⚠️ Thought dump feature disabled - not connected to database yet');
  };

  // Helper function to parse time estimate and return total minutes
  const parseTimeEstimate = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)\s*min/);
    return match ? parseInt(match[1]) : 20; // default 20 min if parsing fails
  };

  // Calculate total estimated time for remaining tasks
  const getTotalRemainingTime = (): string => {
    const totalMinutes = tasks
      .filter(task => !task.completed)
      .reduce((total, task) => total + parseTimeEstimate(task.timeEstimate), 0);
    
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${totalMinutes}m`;
  };

  // Calculate XP to earn from remaining tasks using AI-powered analysis
  const getExpToEarn = (): number => {
    const remainingTasks = tasks.filter(task => !task.completed);
    
    // Calculate from main tasks
    let totalXP = remainingTasks.reduce((total, task) => {
      return total + (task.xpReward || getDefaultTaskXP(task));
    }, 0);
    
    // Add XP from incomplete subtasks
    remainingTasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        if (!subtask.completed) {
          totalXP += subtask.xpReward || getDefaultSubtaskXP(subtask);
        }
      });
    });
    
    return totalXP;
  };

  // Calculate average XP per remaining task for strategic insight
  const getAverageXPPerTask = (): number => {
    const remainingTasks = tasks.filter(task => !task.completed);
    if (remainingTasks.length === 0) return 0;
    
    // Calculate total XP from both tasks and their incomplete subtasks
    const totalXP = remainingTasks.reduce((total, task) => {
      let taskTotal = task.xpReward || getDefaultTaskXP(task);
      
      // Add incomplete subtask XP
      const subtaskXP = task.subtasks
        .filter(subtask => !subtask.completed)
        .reduce((subTotal, subtask) => subTotal + (subtask.xpReward || getDefaultSubtaskXP(subtask)), 0);
      
      return total + taskTotal + subtaskXP;
    }, 0);
    
    return Math.round(totalXP / remainingTasks.length);
  };

  // Get default XP for tasks without AI analysis
  const getDefaultTaskXP = (task: Task): number => {
    const timeMinutes = parseTimeEstimate(task.timeEstimate);
    return Math.round(10 + (timeMinutes * 0.5)); // Base 10 + 0.5 per minute
  };

  // Get default XP for subtasks without AI analysis
  const getDefaultSubtaskXP = (subtask: Subtask): number => {
    return 15; // Default subtask XP
  };

  // Clamp priority rank to valid range (1-5)
  const clampPriorityRank = (rank: number): number => {
    return Math.min(Math.max(rank, 1), 5);
  };


  // Calculate total and completed tasks (including subtasks)
  const taskProgress = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;

    tasks.forEach(task => {
      totalItems += 1; // Count the main task
      if (task.completed) completedItems += 1;
      
      // Count subtasks
      task.subtasks.forEach(subtask => {
        totalItems += 1;
        if (subtask.completed) completedItems += 1;
      });
    });

    return { total: totalItems, completed: completedItems };
  }, [tasks]);

  // Calculate XP earned and potential
  const xpStats = useMemo(() => {
    let earnedXP = 0;
    let potentialXP = 0;

    tasks.forEach(task => {
      const taskXP = task.xpReward || getDefaultTaskXP(task);
      
      if (task.completed) {
        earnedXP += taskXP;
      } else {
        potentialXP += taskXP;
      }
      
      // Add subtask XP
      task.subtasks.forEach(subtask => {
        const subtaskXP = subtask.xpReward || getDefaultSubtaskXP(subtask);
        if (subtask.completed) {
          earnedXP += subtaskXP;
        } else {
          potentialXP += subtaskXP;
        }
      });
    });

    return { earned: earnedXP, potential: potentialXP };
  }, [tasks]);

  return (
    <div className={useImplementation(
      'useUnifiedThemeSystem',
      // NEW: Unified theme system
      `min-h-screen w-full relative ${theme.backgrounds.solid.gray900}`,
      // OLD: Original classes (fallback for safety)
      'min-h-screen w-full bg-gray-900 relative'
    )}>
      {/* Progress Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50"></div>
      
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        
        {/* Light Work Card */}
        <Card className="bg-green-900/20 border-green-700/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center justify-between text-green-400 text-base sm:text-lg">
              <div className="flex items-center">
                <Coffee className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                ☕ Light Work Sessions
              </div>
              <button
                onClick={() => setShowContextModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-lg transition-colors text-gray-300 hover:text-blue-300"
                title="Configure AI personal context for better XP analysis"
              >
                <Settings className="h-3 w-3" />
                AI Context
              </button>
            </CardTitle>
            <div className="border-t border-green-600/50 my-4"></div>
            
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-green-400">Loading light work tasks...</div>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-400">Error: {error}</div>
              </div>
            )}
            
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
            
            {/* Session Stats */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-3">
                <div className={useImplementation(
                  'useUnifiedThemeSystem',
                  // NEW: Unified theme system
                  `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-500/30 ${theme.themes.card.secondary}`,
                  // OLD: Original classes (fallback for safety)  
                  'group relative p-4 bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-lg border border-gray-700/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-500/30 hover:from-gray-800/50 hover:to-gray-900/70'
                )}>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center justify-center text-center h-full">
                    <div className="text-2xl font-bold text-green-400 leading-tight">
                      {getTotalRemainingTime()}
                    </div>
                    <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">Time Left</div>
                  </div>
                </div>
                <div className={useImplementation(
                  'useUnifiedThemeSystem',
                  // NEW: Unified theme system
                  `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-blue-500/30 ${theme.themes.card.secondary}`,
                  // OLD: Original classes (fallback for safety)  
                  'group relative p-4 bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-lg border border-gray-700/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-blue-500/30 hover:from-gray-800/50 hover:to-gray-900/70'
                )}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center justify-center text-center h-full">
                    <div className="text-2xl font-bold text-blue-400 leading-tight">
                      {getAverageXPPerTask()}
                    </div>
                    <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">Avg XP</div>
                  </div>
                </div>
                <div className={useImplementation(
                  'useUnifiedThemeSystem',
                  // NEW: Unified theme system
                  `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-yellow-500/30 ${theme.themes.card.secondary}`,
                  // OLD: Original classes (fallback for safety)  
                  'group relative p-4 bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-lg border border-gray-700/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-yellow-500/30 hover:from-gray-800/50 hover:to-gray-900/70'
                )}>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center justify-center text-center h-full">
                    <div className="text-2xl font-bold text-yellow-400 leading-tight">
                      {getExpToEarn()}
                    </div>
                    <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">EXP to Earn</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Blocks */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {tasks.map((task) => {
                const isExpanded = true; // Always expanded
                return (
                  <div
                    key={task.id}
                    className={`
                      p-4 rounded-lg border transition-all duration-200
                      ${task.completed 
                        ? 'bg-green-900/20 border-green-700/50 text-green-100' 
                        : task.isPushed
                          ? 'bg-blue-900/20 border-blue-700/50 text-blue-100 hover:border-blue-600/50 hover:bg-blue-800/30'
                          : 'bg-gray-800/50 border-gray-700/50 text-gray-100 hover:border-green-600/50 hover:bg-gray-800/70'
                      }
                    `}
                  >
                    {/* Task Header */}
                    <div className="space-y-2">
                      {/* Main task row with checkbox, title, and delete button */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id);
                          }}
                          className="flex-shrink-0 hover:scale-110 transition-transform"
                        >
                          {task.completed ? (
                            <Check className="h-5 w-5 text-green-400" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-400 hover:border-green-400 transition-colors" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          {editingTaskId === task.id ? (
                            <input
                              type="text"
                              value={editTaskTitle}
                              onChange={(e) => setEditTaskTitle(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, 'task', task.id)}
                              onBlur={() => saveTaskEdit(task.id)}
                              autoFocus
                              className="w-full text-base font-medium bg-gray-700/50 border border-green-500 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            <h3 
                              className={`text-base font-medium leading-tight cursor-pointer hover:text-green-300 transition-colors ${
                                task.completed ? 'line-through text-green-300/80' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingTask(task.id, task.title);
                              }}
                              title="Click to edit"
                            >
                              {task.title}
                            </h3>
                          )}
                        </div>
                        
                        {/* Action buttons in top right */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingTaskId(task.id);
                            }}
                            className="flex-shrink-0 p-1 hover:bg-blue-900/50 rounded text-gray-400 hover:text-blue-400 transition-colors"
                            title="View task details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="flex-shrink-0 p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete task"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      
                    </div>

                    {/* Thought Dump Display */}
                    {task.thoughtDump && (
                      <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-blue-300 text-xs">
                            <Mic className="h-3 w-3" />
                            <span>Thought Dump</span>
                            <span className="text-blue-400">
                              {format(new Date(task.thoughtDump.timestamp), 'MMM dd, HH:mm')}
                            </span>
                            {task.thoughtDump.duration && (
                              <span className="text-blue-400">
                                ({Math.floor(task.thoughtDump.duration / 60)}:{(task.thoughtDump.duration % 60).toString().padStart(2, '0')})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeThoughtDump(task.id);
                            }}
                            className="p-1 hover:bg-red-900/50 rounded text-blue-400 hover:text-red-400 transition-colors"
                            title="Remove thought dump"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm text-blue-100 leading-relaxed">
                          {task.thoughtDump.content}
                        </p>
                      </div>
                    )}

                    {/* Subtasks */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-current/20 space-y-2">
                        {task.subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="group flex items-center gap-3 pl-6 py-1 hover:bg-gray-700/30 rounded transition-colors"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubtask(task.id, subtask.id);
                              }}
                              className="flex-shrink-0 hover:scale-110 transition-transform"
                            >
                              {subtask.completed ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-gray-400 hover:border-green-400 transition-colors" />
                              )}
                            </button>
                            {editingSubtaskId === subtask.id ? (
                              <input
                                type="text"
                                value={editSubtaskTitle}
                                onChange={(e) => setEditSubtaskTitle(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, 'subtask', task.id, subtask.id)}
                                onBlur={() => saveSubtaskEdit(task.id, subtask.id)}
                                autoFocus
                                className="flex-1 text-sm bg-gray-700/50 border border-green-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                              />
                            ) : (
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <span 
                                    className={`text-sm cursor-pointer hover:text-green-300 transition-colors ${
                                      subtask.completed ? 'line-through text-gray-400' : ''
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditingSubtask(subtask.id, subtask.title);
                                    }}
                                    title="Click to edit"
                                  >
                                    {subtask.title}
                                  </span>
                                  {/* Delete button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteSubtask(subtask.id);
                                    }}
                                    className="ml-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete subtask"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                
                                {/* Subtask AI Analysis - Clean bars only */}
                                {subtask.aiAnalyzed && (
                                  <div className="mt-1 space-y-1.5 pl-2">
                                    {subtask.priorityRank && (
                                      <div>
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="text-xs text-gray-400">Importance</span>
                                          <span className="text-xs text-gray-400">{clampPriorityRank(subtask.priorityRank)}/5</span>
                                        </div>
                                        <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full rounded-full transition-all duration-300 ${
                                              clampPriorityRank(subtask.priorityRank) === 5 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                              clampPriorityRank(subtask.priorityRank) === 4 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                                              clampPriorityRank(subtask.priorityRank) === 3 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                              clampPriorityRank(subtask.priorityRank) === 2 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                                              'bg-gradient-to-r from-gray-500 to-gray-400'
                                            }`}
                                            style={{ width: `${(clampPriorityRank(subtask.priorityRank) / 5) * 100}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {(subtask as any).complexity && (
                                      <div>
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="text-xs text-gray-400">Complexity</span>
                                          <span className="text-xs text-gray-400">{Math.round(((subtask as any).complexity / 10) * 5)}/5</span>
                                        </div>
                                        <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-300"
                                            style={{ width: `${((subtask as any).complexity / 10) * 100}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {(subtask as any).learningValue && (
                                      <div>
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="text-xs text-gray-400">Learning</span>
                                          <span className="text-xs text-gray-400">{Math.round(((subtask as any).learningValue / 10) * 5)}/5</span>
                                        </div>
                                        <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
                                            style={{ width: `${((subtask as any).learningValue / 10) * 100}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Inline Add Subtask */}
                        {addingSubtaskToId === task.id && (
                          <div className="flex items-center gap-3 pl-6 py-1">
                            <div className="h-4 w-4 rounded-full border-2 border-dashed border-green-400 flex-shrink-0" />
                            <input
                              type="text"
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, 'newSubtask', task.id)}
                              onBlur={() => saveNewSubtask(task.id)}
                              placeholder="Enter subtask..."
                              autoFocus
                              className="flex-1 text-sm bg-gray-700/50 border border-green-500 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                        )}
                        
                        {/* Add Subtask Button - Always visible at bottom of subtasks */}
                        {addingSubtaskToId !== task.id && (
                          <div className="pl-6 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startAddingSubtask(task.id);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-green-400 hover:bg-gray-700/30 rounded transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              Add Subtask
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Task Footer - Show subtask progress, action icons, and AI analysis bars */}
                    <div className="mt-4 pt-2 border-t border-current/10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          {task.subtasks.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks completed
                            </div>
                          )}
                        </div>
                        
                        {/* Action icons in footer */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              analyzeTaskWithAI(task.id);
                            }}
                            className={`p-1.5 hover:bg-gray-700/50 rounded transition-colors ${
                              task.aiAnalyzed 
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-gray-400 hover:text-yellow-400'
                            }`}
                            title={task.aiAnalyzed ? `AI Analyzed: ${task.xpReward} XP (${task.difficulty})` : 'Analyze with AI for smart XP allocation'}
                          >
                            {task.aiAnalyzed ? (
                              <Zap className="h-4 w-4" />
                            ) : (
                              <Brain className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              task.thoughtDump ? removeThoughtDump(task.id) : startThoughtDump(task.id);
                            }}
                            className={`p-1.5 hover:bg-gray-700/50 rounded transition-colors ${
                              task.thoughtDump 
                                ? 'text-blue-400 hover:text-blue-300' 
                                : recordingTaskId === task.id
                                  ? 'text-red-400 animate-pulse'
                                  : 'text-gray-400 hover:text-blue-400'
                            }`}
                            title={task.thoughtDump ? 'View/Remove thought dump' : 'Add thought dump (2min voice note)'}
                          >
                            {recordingTaskId === task.id ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePushToAnotherDay(task.id);
                            }}
                            className="p-1.5 hover:bg-blue-900/50 rounded text-gray-400 hover:text-blue-400 transition-colors"
                            title="Push to another day"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Add Task Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={async () => {
                  try {
                    const newTask = await createTask({
                      title: 'New light work task',
                      workType: 'LIGHT',
                      priority: 'MEDIUM',
                      currentDate: format(selectedDate, 'yyyy-MM-dd'),
                      timeEstimate: '20 min',
                      estimatedDuration: 20,
                      subtasks: []
                    });
                    
                    if (newTask) {
                      // Auto-focus on the new task for editing
                      setTimeout(() => startEditingTask(newTask.id, newTask.title), 100);
                      // Auto-analyze with AI after a short delay
                      setTimeout(() => analyzeTaskWithAI(newTask.id), 2000);
                    }
                  } catch (error) {
                    console.error('Failed to create new light work task:', error);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-green-600/50 text-green-400 hover:border-green-500 hover:text-green-300 hover:bg-green-900/10 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
          </CardContent>
        </Card>
        
      </div>

      {/* Personal Context Modal */}
      <PersonalContextModal
        isOpen={showContextModal}
        onClose={() => setShowContextModal(false)}
        onSave={(context) => {
          setPersonalContext(context);
          console.log('🎯 Personal context updated for AI XP analysis');
        }}
      />

      {/* Task Detail Full Page View - Matching Light Tasks UI Style */}
      {viewingTaskId && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingTaskId(null);
            }
          }}
        >
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur border border-gray-600/50 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {(() => {
              const task = tasks.find(t => t.id === viewingTaskId);
              if (!task) return null;
              
              return (
                <div className="p-6">
                  {/* Compact Header */}
                  <div className="flex items-center justify-between mb-4">
                    {/* Task Title & Completion */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                      >
                        {task.completed ? (
                          <Check className="h-5 w-5 text-green-400" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-400 hover:border-green-400 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-white mb-2 pr-4">{task.title}</h1>
                        <div className="flex items-center gap-2 text-sm">
                          {task.aiAnalyzed && task.xpReward && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded">
                              <Zap className="h-3 w-3 text-yellow-400" />
                              <span className="font-bold text-yellow-300">{task.xpReward} XP</span>
                            </div>
                          )}
                          {task.difficulty && (
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              task.difficulty === 'expert' ? 'bg-red-900/30 text-red-300' :
                              task.difficulty === 'hard' ? 'bg-orange-900/30 text-orange-300' :
                              task.difficulty === 'moderate' ? 'bg-yellow-900/30 text-yellow-300' :
                              task.difficulty === 'easy' ? 'bg-blue-900/30 text-blue-300' :
                              'bg-gray-900/30 text-gray-300'
                            }`}>
                              {task.difficulty.toUpperCase()}
                            </div>
                          )}
                          <span className="text-gray-400">
                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Header Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Task"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewingTaskId(null)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Compact AI Analysis Section */}
                  {task.aiAnalyzed && (
                    <div className="mb-8 p-8 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-indigo-900/20 border border-blue-500/30 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
                      {/* Glassmorphism highlight */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl backdrop-blur-sm border border-blue-400/30 shadow-lg">
                          <Brain className="h-7 w-7 text-blue-300 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">AI Analysis</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-transparent"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Enhanced Progress Cards with Glass Effect */}
                        {task.priorityRank && (
                          <div className="group bg-gray-800/20 backdrop-blur-sm p-6 rounded-2xl border border-gray-500/30 hover:border-red-400/50 transition-all duration-500 hover:bg-gray-700/20 hover:scale-105 hover:shadow-2xl">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-semibold text-gray-200">Importance</span>
                              <span className="text-lg font-bold text-gray-300">{clampPriorityRank(task.priorityRank)}/5</span>
                            </div>
                            <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${
                                  clampPriorityRank(task.priorityRank) === 5 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                  clampPriorityRank(task.priorityRank) === 4 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                                  clampPriorityRank(task.priorityRank) === 3 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                  clampPriorityRank(task.priorityRank) === 2 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                                  'bg-gradient-to-r from-gray-500 to-gray-400'
                                }`}
                                style={{ width: `${(clampPriorityRank(task.priorityRank) / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {task.complexity && (
                          <div className="group bg-gray-800/20 backdrop-blur-sm p-6 rounded-2xl border border-gray-500/30 hover:border-purple-400/50 transition-all duration-500 hover:bg-gray-700/20 hover:scale-105 hover:shadow-2xl">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-semibold text-gray-200">Complexity</span>
                              <span className="text-lg font-bold text-gray-300">{Math.round((task.complexity / 10) * 5)}/5</span>
                            </div>
                            <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-700"
                                style={{ width: `${(task.complexity / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {task.learningValue && (
                          <div className="group bg-gray-800/20 backdrop-blur-sm p-6 rounded-2xl border border-gray-500/30 hover:border-green-400/50 transition-all duration-500 hover:bg-gray-700/20 hover:scale-105 hover:shadow-2xl">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-semibold text-gray-200">Learning Value</span>
                              <span className="text-lg font-bold text-gray-300">{Math.round((task.learningValue / 10) * 5)}/5</span>
                            </div>
                            <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700"
                                style={{ width: `${(task.learningValue / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Enhanced AI Time Estimate */}
                      {(task as any).aiTimeEstimate && (
                        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-sm p-8 rounded-3xl border border-blue-500/40 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
                          <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            AI Time Estimate
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Minimum</div>
                              <div className="text-2xl font-bold text-blue-300">{(task as any).aiTimeEstimate.min}m</div>
                            </div>
                            <div className="border-l border-r border-blue-600/30 md:border-l md:border-r-0">
                              <div className="text-sm text-gray-400 mb-1">Most Likely</div>
                              <div className="text-3xl font-bold text-blue-200">{(task as any).aiTimeEstimate.most_likely}m</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Maximum</div>
                              <div className="text-2xl font-bold text-blue-300">{(task as any).aiTimeEstimate.max}m</div>
                            </div>
                          </div>
                          <div className="text-center mt-4 text-sm text-blue-400">
                            {Math.round((task as any).aiTimeEstimate.confidence * 100)}% confidence level
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtasks Section */}
                  {task.subtasks.length > 0 && (
                    <div className="mb-4 p-4 bg-gray-800/40 border border-gray-600/30 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-400" />
                          Subtasks
                        </h3>
                        <span className="text-xs text-gray-400">
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} completed
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {task.subtasks.map((subtask, index) => (
                          <div key={subtask.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                            <button
                              onClick={() => toggleSubtask(task.id, subtask.id)}
                              className="flex-shrink-0"
                            >
                              {subtask.completed ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-gray-400 hover:border-green-400 transition-colors" />
                              )}
                            </button>
                            <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                              {index + 1}. {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-600/30 mt-4">
                    <button
                      onClick={() => analyzeTaskWithAI(task.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        task.aiAnalyzed 
                          ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-200 hover:bg-yellow-500/30' 
                          : 'bg-blue-500/20 border border-blue-500/40 text-blue-200 hover:bg-blue-500/30'
                      }`}
                    >
                      {task.aiAnalyzed ? <Zap className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                      {task.aiAnalyzed ? 'Re-analyze' : 'Analyze'}
                    </button>
                    
                    <button
                      onClick={() => handlePushToAnotherDay(task.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 border border-gray-500/40 text-gray-200 hover:bg-gray-500/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Calendar className="h-4 w-4" />
                      Tomorrow
                    </button>
                    
                    <button
                      onClick={() => {
                        handleDeleteTask(task.id);
                        setViewingTaskId(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};