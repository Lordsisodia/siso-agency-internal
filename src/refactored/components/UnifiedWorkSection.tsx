import React, { useState, useEffect } from 'react';
import { 
  Brain,
  Coffee,
  Plus,
  Check,
  Clock,
  Target,
  X,
  Edit,
  Mic,
  MicOff,
  Eye,
  Calendar,
  Zap,
  Trash,
  Settings
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { useImplementation } from '@/migration/feature-flags';
import { theme } from '@/styles/theme';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';

// Theme configurations for different work types
export const WORK_THEMES = {
  LIGHT: {
    name: 'Light Work Sessions',
    icon: Coffee,
    emoji: '☕',
    colors: {
      primary: 'green',
      bg: 'bg-gray-900',
      border: 'border-green-700/50',
      text: 'text-green-400',
      textSecondary: 'text-green-300',
      hover: 'hover:border-green-600/50 hover:bg-green-800/30',
      completed: 'bg-green-900/20 border-green-700/50 text-green-100',
      progressLine: 'bg-green-500/50',
      input: 'border-green-500 focus:ring-green-500',
      button: 'border-green-600/50 text-green-400 hover:border-green-500 hover:text-green-300 hover:bg-green-900/10',
      addSubtask: 'hover:text-green-400 hover:bg-gray-700/30'
    },
    rules: {
      title: 'Light Work Rules',
      items: [
        '• Perfect for lower energy periods.',
        '• Focus on quick wins and administrative tasks.',
        '• Keep sessions between 20-45 minutes.'
      ]
    },
    protocol: {
      title: 'Momentum Building',
      description: 'Light work sessions are perfect for administrative tasks, quick wins, and maintaining momentum when your energy is lower or when you need a mental break from deep focus work.'
    },
    defaultDuration: 20,
    defaultTimeEstimate: '20 min'
  },
  DEEP: {
    name: 'Deep Work Sessions',
    icon: Brain,
    emoji: '🧠',
    colors: {
      primary: 'blue',
      bg: 'bg-gray-900',
      border: 'border-blue-700/50',
      text: 'text-blue-400',
      textSecondary: 'text-blue-300',
      hover: 'hover:border-blue-600/50 hover:bg-blue-800/30',
      completed: 'bg-blue-900/20 border-blue-700/50 text-blue-100',
      progressLine: 'bg-blue-500/50',
      input: 'border-blue-500 focus:ring-blue-500',
      button: 'border-blue-600/50 text-blue-400 hover:border-blue-500 hover:text-blue-300 hover:bg-blue-900/10',
      addSubtask: 'hover:text-blue-400 hover:bg-gray-700/30'
    },
    rules: {
      title: 'Deep Work Rules',
      items: [
        '• No interruptions or task switching allowed.',
        '• Phone on airplane mode or Do Not Disturb.',
        '• Work in 2-4 hour focused blocks.'
      ]
    },
    protocol: {
      title: 'Flow State Protocol',
      description: 'Deep work sessions require sustained focus without interruption. These blocks are designed for your most important, cognitively demanding work that creates maximum value.'
    },
    defaultDuration: 120,
    defaultTimeEstimate: '2 hours'
  }
} as const;

export type WorkType = keyof typeof WORK_THEMES;

interface UnifiedWorkSectionProps {
  workType: WorkType;
  selectedDate: Date;
  tasks: any[];
  loading: boolean;
  error: string | null;
  // Task management functions
  createTask: (taskData: any) => Promise<any>;
  toggleTaskCompletion: (taskId: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
  analyzeTaskWithAI: (taskId: string) => void;
  pushTaskToAnotherDay: (taskId: string, date: string) => Promise<void>;
  updateTaskTitle: (taskId: string, title: string) => Promise<void>;
  // Optional features (for Light Work)
  showContextModal?: () => void;
  showStats?: boolean;
  statsData?: {
    timeRemaining?: string;
    avgXP?: number;
    expToEarn?: number;
  };
}

export const UnifiedWorkSection: React.FC<UnifiedWorkSectionProps> = ({
  workType,
  selectedDate,
  tasks,
  loading,
  error,
  createTask,
  toggleTaskCompletion,
  toggleSubtaskCompletion,
  addSubtask,
  deleteTask,
  deleteSubtask,
  analyzeTaskWithAI,
  pushTaskToAnotherDay,
  updateTaskTitle,
  showContextModal,
  showStats = false,
  statsData
}) => {
  // State for task management
  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [recordingTaskId, setRecordingTaskId] = useState<string | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);

  // Get theme configuration
  const themeConfig = WORK_THEMES[workType];
  const IconComponent = themeConfig.icon;

  // Set body background to dark theme (ensures consistent background across entire page)
  useEffect(() => {
    document.body.className = 'bg-gray-900 min-h-screen';
    document.documentElement.className = 'bg-gray-900';
    
    // Cleanup on unmount
    return () => {
      document.body.className = '';
      document.documentElement.className = '';
    };
  }, [workType]);

  // Filter tasks for current work type
  const filteredTasks = (tasks || []).filter(task => {
    if (workType === 'DEEP') {
      // For Deep Work: show DEEP tasks AND any existing tasks (backwards compatibility)
      // This ensures user's existing tasks continue to appear in Deep Work section
      return task.workType === 'DEEP' || 
             task.workType === 'LIGHT' ||  // Show existing LIGHT tasks in Deep Work too
             task.title.toLowerCase().includes('deep') ||
             task.title.toLowerCase().includes('focus');
    } else {
      // For Light Work: only show LIGHT tasks
      return task.workType === 'LIGHT' || 
             task.title.toLowerCase().includes('light');
    }
  });

  // Sort tasks: regular tasks first, then pushed tasks at bottom
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.isPushed && !b.isPushed) return 1;
    if (!a.isPushed && b.isPushed) return -1;
    return 0;
  });

  // Helper functions
  const startAddingSubtask = (taskId: string) => {
    setAddingSubtaskToId(taskId);
    setNewSubtaskTitle('');
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
        console.warn('⚠️ Thought dump feature disabled - not connected to database yet');
      }
    } finally {
      setRecordingTaskId(null);
    }
  };

  if (loading) {
    return useImplementation(
      'useUnifiedLoadingState',
      <LoadingState 
        message={`Loading ${workType.toLowerCase()} work tasks...`}
        variant="spinner"
        size="lg"
        className="min-h-screen w-full"
      />,
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className={themeConfig.colors.text}>Loading {workType.toLowerCase()} work tasks...</div>
      </div>
    );
  }

  if (error) {
    return useImplementation(
      'useUnifiedErrorState',
      <ErrorState 
        title="Error Loading Tasks"
        message={`Could not load ${workType.toLowerCase()} work tasks: ${error}`}
        type="network"
        className="min-h-screen w-full"
      />,
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-red-400">Error loading tasks: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Work Section Content */}
        <Card className={`w-full ${workType === 'DEEP' ? 'bg-blue-900/30 border-blue-700/50' : 'bg-green-900/30 border-green-700/50'}`}>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <h2 className={`flex items-center justify-between ${themeConfig.colors.text} text-base sm:text-lg font-semibold`}>
              <div className="flex items-center">
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {themeConfig.emoji} {themeConfig.name}
              </div>
              {showContextModal && (
                <button
                  onClick={showContextModal}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs bg-transparent border ${themeConfig.colors.border} hover:border-${themeConfig.colors.primary}-500 rounded-lg transition-colors ${themeConfig.colors.text} hover:${themeConfig.colors.textSecondary}`}
                  title="Configure AI personal context for better XP analysis"
                >
                  <Settings className="h-3 w-3" />
                  AI Context
                </button>
              )}
            </h2>
            <div className={`border-t ${themeConfig.colors.border.replace('border-', 'border-').replace('/50', '/50')} my-4`}></div>
            
            {/* Stats Section (for Light Work) */}
            {showStats && statsData && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-3">
                  {statsData.timeRemaining && (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-500/30 ${theme.themes.card.secondary}`,
                      'group relative p-4 bg-transparent rounded-lg border border-green-700/30 shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-500/30 hover:bg-green-900/20'
                    )}>
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center justify-center text-center h-full">
                        <div className="text-2xl font-bold text-green-400 leading-tight">
                          {statsData.timeRemaining}
                        </div>
                        <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">Time Left</div>
                      </div>
                    </div>
                  )}
                  {statsData.avgXP && (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-blue-500/30 ${theme.themes.card.secondary}`,
                      'group relative p-4 bg-transparent rounded-lg border border-blue-700/30 shadow-md hover:shadow-lg transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-900/20'
                    )}>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center justify-center text-center h-full">
                        <div className="text-2xl font-bold text-blue-400 leading-tight">
                          {statsData.avgXP}
                        </div>
                        <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">Avg XP</div>
                      </div>
                    </div>
                  )}
                  {statsData.expToEarn && (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-yellow-500/30 ${theme.themes.card.secondary}`,
                      'group relative p-4 bg-transparent rounded-lg border border-yellow-700/30 shadow-md hover:shadow-lg transition-all duration-300 hover:border-yellow-500/30 hover:bg-yellow-900/20'
                    )}>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center justify-center text-center h-full">
                        <div className="text-2xl font-bold text-yellow-400 leading-tight">
                          {statsData.expToEarn}
                        </div>
                        <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">EXP to Earn</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className={`font-bold ${themeConfig.colors.textSecondary} mb-2 text-sm sm:text-base`}>
                  {themeConfig.protocol.title}
                </h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                  {themeConfig.protocol.description}
                </p>
              </div>
              <div className={`border-t ${themeConfig.colors.border.replace('border-', 'border-').replace('/50', '/50')} my-4`}></div>
              <div>
                <h3 className={`font-bold ${themeConfig.colors.textSecondary} mb-2 text-sm sm:text-base`}>
                  {themeConfig.rules.title}
                </h3>
                <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
                  {themeConfig.rules.items.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={`border-t ${themeConfig.colors.border.replace('border-', 'border-').replace('/50', '/50')} my-3 sm:my-4`}></div>
            
            <div className="pt-4">
            {/* Task Blocks */}
            <div className="flex flex-col items-center gap-4">
              {sortedTasks.map((task) => {
                const isExpanded = true; // Always expanded
                return (
                  <div
                    key={task.id}
                    className={`
                      p-4 rounded-lg border transition-all duration-200 w-full
                      ${task.completed 
                        ? `${themeConfig.colors.completed}` 
                        : task.isPushed
                          ? 'bg-purple-900/20 border-purple-700/50 text-purple-100 hover:border-purple-600/50 hover:bg-purple-800/30'
                          : `bg-gray-800/50 border-gray-700/50 text-gray-100 ${themeConfig.colors.hover}`
                      }
                    `}
                  >
                    {/* Task Header */}
                    <div className="space-y-2">
                      {/* Title row with checkbox and title only */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(task.id);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          className="flex-shrink-0 hover:scale-110 transition-transform min-h-[32px] min-w-[32px] flex items-center justify-center -m-2"
                        >
                          {task.completed ? (
                            <Check className={`h-5 w-5 ${themeConfig.colors.text}`} />
                          ) : (
                            <div className={`h-5 w-5 rounded-full border-2 border-gray-400 hover:${themeConfig.colors.border} transition-colors`} />
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
                              className={`w-full text-base font-medium bg-gray-700/50 border ${themeConfig.colors.input} rounded px-3 py-2 text-white focus:outline-none focus:ring-1 min-h-[44px]`}
                            />
                          ) : (
                            <h3 
                              className={`text-base font-medium leading-tight cursor-pointer hover:${themeConfig.colors.textSecondary} transition-colors ${
                                task.completed ? `line-through ${themeConfig.colors.textSecondary}/80` : ''
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

                      {/* First separator line - more visible white */}
                      <div className="border-t-2 border-white/40"></div>

                      {/* Action icons row - including Eye and Delete */}
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            analyzeTaskWithAI(task.id);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          className={`min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-gray-700/50 rounded transition-colors ${
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
                            startThoughtDump(task.id);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          className={`min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-gray-700/50 rounded transition-colors ${
                            recordingTaskId === task.id
                              ? 'text-red-400 animate-pulse'
                              : `text-gray-400 hover:${themeConfig.colors.text}`
                          }`}
                          title="Add thought dump (2min voice note)"
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
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          className={`min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-${themeConfig.colors.primary}-900/50 rounded text-gray-400 hover:${themeConfig.colors.text} transition-colors`}
                          title="Push to another day"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>

                        {/* Eye icon moved here */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingTaskId(task.id);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          className={`min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-${themeConfig.colors.primary}-900/50 rounded text-gray-400 hover:${themeConfig.colors.text} transition-colors`}
                          title="View task details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {/* Delete icon moved here */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete task"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Second separator line - more visible white */}
                      <div className="border-t-2 border-white/40"></div>
                    </div>

                    {/* Subtasks */}
                    {isExpanded && (
                      <div className="space-y-3 px-1">
                        {task.subtasks?.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="group flex items-start gap-2 py-3 px-4 hover:bg-gray-700/20 rounded-lg transition-all duration-200 w-full border-b border-gradient-to-r from-transparent via-white/10 to-transparent"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubtaskCompletion(task.id, subtask.id);
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                              }}
                              className="flex-shrink-0 hover:scale-110 transition-transform min-h-[32px] min-w-[32px] flex items-center justify-center mt-0.5 hover:bg-gray-600/30 rounded-full"
                            >
                              {subtask.completed ? (
                                <Check className={`h-5 w-5 ${themeConfig.colors.text}`} />
                              ) : (
                                <div className={`h-5 w-5 rounded-full border-2 border-gray-300 hover:${themeConfig.colors.border} hover:border-opacity-80 transition-all duration-200`} />
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
                                className={`flex-1 text-sm bg-gray-700/50 border ${themeConfig.colors.input} rounded px-2 py-1 text-white focus:outline-none focus:ring-1 min-h-[44px]`}
                              />
                            ) : (
                              <div className="flex-1 min-w-0 pr-2 relative">
                                {/* Title row - full width */}
                                <div className="w-full mb-3">
                                  <span 
                                    className={`block text-sm font-medium cursor-pointer hover:${themeConfig.colors.textSecondary} transition-colors leading-relaxed break-words ${
                                      subtask.completed ? 'line-through text-gray-400' : 'text-white'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditingSubtask(subtask.id, subtask.title);
                                    }}
                                    title="Click to edit"
                                  >
                                    {subtask.title}
                                  </span>
                                </div>
                                
                                {/* Bottom row: Due date, Priority, and Delete button */}
                                <div className="flex items-center justify-between">
                                  {/* Left side: Due date and Priority */}
                                  <div className="flex items-center gap-3">
                                    {/* Due date indicator */}
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        
                                        // Simple date picker options
                                        const today = new Date().toISOString().split('T')[0];
                                        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                                        const nextWeek = new Date(Date.now() + 604800000).toISOString().split('T')[0];
                                        
                                        const options = [
                                          { label: 'Today', value: today },
                                          { label: 'Tomorrow', value: tomorrow },
                                          { label: 'Next Week', value: nextWeek },
                                          { label: 'Custom Date', value: 'custom' },
                                          { label: 'Remove Date', value: null }
                                        ];
                                        
                                        const choice = prompt(
                                          'Select due date:\n' + 
                                          options.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n') +
                                          '\n\nEnter number (1-5):'
                                        );
                                        
                                        if (choice && choice >= 1 && choice <= 5) {
                                          const selectedOption = options[choice - 1];
                                          let dueDate = selectedOption.value;
                                          
                                          if (dueDate === 'custom') {
                                            dueDate = prompt('Enter date (YYYY-MM-DD):');
                                            if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
                                              alert('Invalid date format. Please use YYYY-MM-DD');
                                              return;
                                            }
                                          }
                                          
                                          try {
                                            console.log(`Updating due date for subtask ${subtask.id} to:`, dueDate);
                                            
                                            const response = await fetch('/api/subtasks/update-date', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ 
                                                subtaskId: subtask.id, 
                                                dueDate: dueDate 
                                              })
                                            });
                                            
                                            if (!response.ok) {
                                              throw new Error('Failed to update due date');
                                            }
                                            
                                            console.log(`✅ Due date updated to ${dueDate || 'No due date'}`);
                                            
                                            // Refresh to show changes
                                            window.location.reload();
                                            
                                          } catch (error) {
                                            console.error('Failed to update due date:', error);
                                            alert('Failed to update due date. Please try again.');
                                          }
                                        }
                                      }}
                                      className={`text-xs font-normal cursor-pointer hover:opacity-80 transition-opacity ${
                                        subtask.dueDate ? (
                                          new Date(subtask.dueDate) < new Date() ? 'text-red-400 font-medium' : // Overdue
                                          new Date(subtask.dueDate).toDateString() === new Date().toDateString() ? 'text-yellow-400 font-medium' : // Due today
                                          'text-gray-300' // Normal
                                        ) : 'text-gray-500'
                                      }`}
                                      title="Click to set due date"
                                    >
                                      {subtask.dueDate ? (
                                        new Date(subtask.dueDate) < new Date() ? '🔴 Overdue' :
                                        new Date(subtask.dueDate).toDateString() === new Date().toDateString() ? '🟡 Due Today' :
                                        `📅 Due ${new Date(subtask.dueDate).toLocaleDateString()}`
                                      ) : '⏰ No due date'}
                                    </button>
                                    
                                    {/* Priority button */}
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        // Cycle through priorities: High -> Med -> Low -> High
                                        const priorities = ['High', 'Med', 'Low'];
                                        const currentIndex = priorities.indexOf(subtask.priority || 'Low');
                                        const nextIndex = (currentIndex + 1) % priorities.length;
                                        const newPriority = priorities[nextIndex];
                                        
                                        try {
                                          console.log(`Updating priority from ${subtask.priority || 'Low'} to ${newPriority}`);
                                          
                                          const response = await fetch('/api/subtasks/update-priority', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ 
                                              subtaskId: subtask.id, 
                                              priority: newPriority 
                                            })
                                          });
                                          
                                          if (!response.ok) {
                                            throw new Error('Failed to update priority');
                                          }
                                          
                                          // Force a re-render by updating the task data
                                          // This will be handled by the parent component's state management
                                          console.log(`✅ Priority updated to ${newPriority}`);
                                          
                                          // Optionally trigger a refresh of task data
                                          window.location.reload(); // Quick solution - in production we'd use proper state management
                                          
                                        } catch (error) {
                                          console.error('Failed to update priority:', error);
                                          alert('Failed to update priority. Please try again.');
                                        }
                                      }}
                                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200 hover:scale-105 hover:shadow-sm ${
                                        subtask.priority === 'High' ? 'text-red-300 border-red-400/60 bg-red-900/30 hover:bg-red-900/40' :
                                        subtask.priority === 'Med' ? 'text-yellow-300 border-yellow-400/60 bg-yellow-900/30 hover:bg-yellow-900/40' :
                                        'text-gray-300 border-gray-400/60 bg-gray-800/50 hover:bg-gray-700/50'
                                      }`}
                                      title="Click to cycle priority: High → Med → Low"
                                    >
                                      {subtask.priority || 'Low'}
                                    </button>
                                  </div>
                                  
                                  {/* Right side: Delete button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteSubtask(subtask.id);
                                    }}
                                    onTouchStart={(e) => {
                                      e.stopPropagation();
                                    }}
                                    className="text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 opacity-0 group-hover:opacity-100 min-h-[24px] min-w-[24px] flex items-center justify-center rounded-md"
                                    title="Delete subtask"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                
                                {/* Enhanced separator line with gradient effect */}
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Inline Add Subtask */}
                        {addingSubtaskToId === task.id && (
                          <div className="flex items-center gap-1 py-2 px-0 w-full">
                            <div className={`h-4 w-4 rounded-full border-2 border-dashed ${themeConfig.colors.border} flex-shrink-0`} />
                            <input
                              type="text"
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, 'newSubtask', task.id)}
                              onBlur={() => saveNewSubtask(task.id)}
                              placeholder="Enter subtask..."
                              autoFocus
                              className={`flex-1 min-w-0 text-sm bg-gray-700/50 border ${themeConfig.colors.input} rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-1 min-h-[44px]`}
                            />
                          </div>
                        )}
                        
                        {/* Add Subtask Button - Always visible at bottom of subtasks */}
                        {addingSubtaskToId !== task.id && (
                          <div className="mt-2 px-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startAddingSubtask(task.id);
                              }}
                              className={`flex items-center gap-1 px-2 py-1 text-xs text-gray-400 ${themeConfig.colors.addSubtask} rounded transition-colors`}
                            >
                              <Plus className="h-3 w-3" />
                              Add Subtask
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Task Footer - Show subtask progress only */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-4 pt-3">
                        <div className="border-t-2 border-white/40 mb-3"></div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">
                            {task.subtasks.filter(s => s.completed).length} out of {task.subtasks.length} subtasks completed
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add New Task Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={async () => {
                  try {
                    const newTask = await createTask({
                      title: `New ${workType.toLowerCase()} work task`,
                      workType: workType,
                      priority: 'MEDIUM',
                      currentDate: format(selectedDate, 'yyyy-MM-dd'),
                      timeEstimate: themeConfig.defaultTimeEstimate,
                      estimatedDuration: themeConfig.defaultDuration,
                      subtasks: []
                    });
                    
                    if (newTask) {
                      // Auto-focus on the new task for editing
                      setTimeout(() => startEditingTask(newTask.id, newTask.title), 100);
                      // Auto-analyze with AI after a short delay
                      setTimeout(() => analyzeTaskWithAI(newTask.id), 2000);
                    }
                  } catch (error) {
                    console.error(`Failed to create new ${workType.toLowerCase()} work task:`, error);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed ${themeConfig.colors.button} rounded-lg transition-all duration-200 text-sm font-medium`}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};