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
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { aiXPService, TaskAnalysis } from '@/ai-first/services/ai-xp-service';
import { PersonalContextModal } from './PersonalContextModal';
import { useTaskDatabase } from '@/ai-first/hooks/useTaskDatabase';

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
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [recordingTaskId, setRecordingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showContextModal, setShowContextModal] = useState(false);

  const toggleTask = (id: string) => {
    toggleTaskCompletion(id);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    toggleSubtaskCompletion(taskId, subtaskId);
  };


  const startAddingSubtask = (taskId: string) => {
    setAddingSubtaskToId(taskId);
    setNewSubtaskTitle('');
    // Auto-expand the task to show subtasks
    const newExpanded = new Set(expandedTasks);
    newExpanded.add(taskId);
    setExpandedTasks(newExpanded);
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

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

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

  // Get default XP for tasks without AI analysis
  const getDefaultTaskXP = (task: Task): number => {
    const timeMinutes = parseTimeEstimate(task.timeEstimate);
    return Math.round(10 + (timeMinutes * 0.5)); // Base 10 + 0.5 per minute
  };

  // Get default XP for subtasks without AI analysis
  const getDefaultSubtaskXP = (subtask: Subtask): number => {
    return 15; // Default subtask XP
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
    <div className="min-h-screen w-full bg-gray-900 relative">
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
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="text-xl font-bold text-green-400">
                    {getTotalRemainingTime()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Time Left</div>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="text-xl font-bold text-blue-400">
                    {tasks.filter(t => !t.completed).length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Remaining</div>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="text-xl font-bold text-yellow-400">
                    {getExpToEarn()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">EXP to Earn</div>
                </div>
              </div>
            </div>

            {/* Task Blocks */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {tasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
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
                      {/* Main task row */}
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
                      </div>
                      
                      {/* Action row */}
                      <div className="flex items-center justify-between pl-8">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="h-3 w-3" />
                            {task.timeEstimate}
                          </div>
                          {task.aiAnalyzed && (
                            <div className="flex items-center gap-1">
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                task.difficulty === 'expert' ? 'bg-red-900/30 text-red-300' :
                                task.difficulty === 'hard' ? 'bg-orange-900/30 text-orange-300' :
                                task.difficulty === 'moderate' ? 'bg-yellow-900/30 text-yellow-300' :
                                task.difficulty === 'easy' ? 'bg-blue-900/30 text-blue-300' :
                                'bg-gray-900/30 text-gray-300'
                              }`}>
                                <Zap className="h-3 w-3" />
                                {task.xpReward} XP
                              </div>
                              {task.priorityRank && (
                                <div className={`flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${
                                  task.priorityRank === 5 ? 'bg-red-500 text-white' :
                                  task.priorityRank === 4 ? 'bg-orange-500 text-white' :
                                  task.priorityRank === 3 ? 'bg-yellow-500 text-black' :
                                  task.priorityRank === 2 ? 'bg-blue-500 text-white' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {task.priorityRank}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startAddingSubtask(task.id);
                            }}
                            className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-green-400 transition-colors"
                            title="Add subtask"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          
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
                            title={task.aiAnalyzed ? `AI Analyzed: ${task.xpReward} XP (${task.difficulty})` : 'Analyze with AI for smart XP allocation'}
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
                              task.thoughtDump ? removeThoughtDump(task.id) : startThoughtDump(task.id);
                            }}
                            className={`p-1 hover:bg-gray-700/50 rounded transition-colors ${
                              task.thoughtDump 
                                ? 'text-blue-400 hover:text-blue-300' 
                                : recordingTaskId === task.id
                                  ? 'text-red-400 animate-pulse'
                                  : 'text-gray-400 hover:text-blue-400'
                            }`}
                            title={task.thoughtDump ? 'View/Remove thought dump' : 'Add thought dump (2min voice note)'}
                          >
                            {recordingTaskId === task.id ? (
                              <MicOff className="h-3 w-3" />
                            ) : (
                              <Mic className="h-3 w-3" />
                            )}
                          </button>
                          
                          {task.subtasks.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(task.id);
                              }}
                              className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-white transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePushToAnotherDay(task.id);
                            }}
                            className="p-1 hover:bg-blue-900/50 rounded text-gray-400 hover:text-blue-400 transition-colors"
                            title="Push to another day"
                          >
                            <Calendar className="h-3 w-3" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete task"
                          >
                            <X className="h-3 w-3" />
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
                    {(task.subtasks.length > 0 || addingSubtaskToId === task.id) && isExpanded && (
                      <div className="mt-4 pt-3 border-t border-current/20 space-y-2">
                        {task.subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="flex items-center gap-3 pl-6 py-1 hover:bg-gray-700/30 rounded transition-colors"
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
                      </div>
                    )}
                    
                    {/* Task Footer */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-4 pt-2 border-t border-current/10">
                        <div className="flex items-center justify-between pl-8">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Target className="h-3 w-3" />
                            Light Work Session
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks done
                          </div>
                        </div>
                      </div>
                    )}
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
    </div>
  );
};