import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      bg: 'bg-green-900/20',
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
      bg: 'bg-blue-900/20',
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

  // Filter tasks for current work type
  const filteredTasks = (tasks || []).filter(task => 
    task.workType === workType || 
    task.title.toLowerCase().includes(workType.toLowerCase()) ||
    task.title.toLowerCase().includes('focus')
  );

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
        className={useImplementation(
          'useUnifiedThemeSystem',
          `min-h-screen w-full ${theme.backgrounds.solid.gray900}`,
          'min-h-screen w-full bg-gray-900'
        )}
      />,
      <div className={useImplementation(
        'useUnifiedThemeSystem',
        `min-h-screen w-full flex items-center justify-center ${theme.backgrounds.solid.gray900}`,
        'min-h-screen w-full bg-gray-900 flex items-center justify-center'
      )}>
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
        type="loading_error"
        className={useImplementation(
          'useUnifiedThemeSystem',
          `min-h-screen w-full ${theme.backgrounds.solid.gray900}`,
          'min-h-screen w-full bg-gray-900'
        )}
      />,
      <div className={useImplementation(
        'useUnifiedThemeSystem',
        `min-h-screen w-full flex items-center justify-center ${theme.backgrounds.solid.gray900}`,
        'min-h-screen w-full bg-gray-900 flex items-center justify-center'
      )}>
        <div className="text-red-400">Error loading tasks: {error}</div>
      </div>
    );
  }

  return (
    <div className={useImplementation(
      'useUnifiedThemeSystem',
      `min-h-screen w-full relative ${theme.backgrounds.solid.gray900}`,
      'min-h-screen w-full bg-gray-900 relative'
    )}>
      {/* Progress Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${themeConfig.colors.progressLine}`}></div>
      
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Work Section Card */}
        <Card className={`${themeConfig.colors.bg} ${themeConfig.colors.border}`}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className={`flex items-center justify-between ${themeConfig.colors.text} text-base sm:text-lg`}>
              <div className="flex items-center">
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {themeConfig.emoji} {themeConfig.name}
              </div>
              {showContextModal && (
                <button
                  onClick={showContextModal}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-lg transition-colors text-gray-300 hover:text-blue-300"
                  title="Configure AI personal context for better XP analysis"
                >
                  <Settings className="h-3 w-3" />
                  AI Context
                </button>
              )}
            </CardTitle>
            <div className={`border-t ${themeConfig.colors.border.replace('border-', 'border-').replace('/50', '/50')} my-4`}></div>
            
            {/* Stats Section (for Light Work) */}
            {showStats && statsData && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-3">
                  {statsData.timeRemaining && (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-500/30 ${theme.themes.card.secondary}`,
                      'group relative p-4 bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-lg border border-gray-700/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-500/30 hover:from-gray-800/50 hover:to-gray-900/70'
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
                      'group relative p-4 bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-lg border border-gray-700/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-blue-500/30 hover:from-gray-800/50 hover:to-gray-900/70'
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
                      'group relative p-4 bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-lg border border-gray-700/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-yellow-500/30 hover:from-gray-800/50 hover:to-gray-900/70'
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
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 pb-24">
            {/* Task Blocks */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {sortedTasks.map((task) => {
                const isExpanded = true; // Always expanded
                return (
                  <div
                    key={task.id}
                    className={`
                      p-4 rounded-lg border transition-all duration-200
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
                      {/* Main task row with checkbox, title, and action buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(task.id);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          className="flex-shrink-0 hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center -m-2"
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
                        
                        {/* Action buttons in top right */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingTaskId(task.id);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                            }}
                            className={`flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-${themeConfig.colors.primary}-900/50 rounded text-gray-400 hover:${themeConfig.colors.text} transition-colors -m-1`}
                            title="View task details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                            }}
                            className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors -m-1"
                            title="Delete task"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subtasks */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-current/20 space-y-2">
                        {task.subtasks?.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="group flex items-center gap-3 pl-6 py-1 hover:bg-gray-700/30 rounded transition-colors"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubtaskCompletion(task.id, subtask.id);
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                              }}
                              className="flex-shrink-0 hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center -m-2"
                            >
                              {subtask.completed ? (
                                <Check className={`h-4 w-4 ${themeConfig.colors.text}`} />
                              ) : (
                                <div className={`h-4 w-4 rounded-full border-2 border-gray-400 hover:${themeConfig.colors.border} transition-colors`} />
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
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <span 
                                    className={`text-sm cursor-pointer hover:${themeConfig.colors.textSecondary} transition-colors ${
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
                                    onTouchStart={(e) => {
                                      e.stopPropagation();
                                    }}
                                    className="ml-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center -m-2"
                                    title="Delete subtask"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Inline Add Subtask */}
                        {addingSubtaskToId === task.id && (
                          <div className="flex items-center gap-3 pl-6 py-1">
                            <div className={`h-4 w-4 rounded-full border-2 border-dashed ${themeConfig.colors.border} flex-shrink-0`} />
                            <input
                              type="text"
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, 'newSubtask', task.id)}
                              onBlur={() => saveNewSubtask(task.id)}
                              placeholder="Enter subtask..."
                              autoFocus
                              className={`flex-1 text-sm bg-gray-700/50 border ${themeConfig.colors.input} rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-1 min-h-[44px]`}
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
                              className={`flex items-center gap-1 px-2 py-1 text-xs text-gray-400 ${themeConfig.colors.addSubtask} rounded transition-colors`}
                            >
                              <Plus className="h-3 w-3" />
                              Add Subtask
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Task Footer - Show subtask progress, action icons */}
                    <div className="mt-4 pt-2 border-t border-current/10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          {task.subtasks && task.subtasks.length > 0 && (
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
                            onTouchStart={(e) => {
                              e.stopPropagation();
                            }}
                            className={`min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-700/50 rounded transition-colors ${
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
                            className={`min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-700/50 rounded transition-colors ${
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
                            className={`min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-${themeConfig.colors.primary}-900/50 rounded text-gray-400 hover:${themeConfig.colors.text} transition-colors`}
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
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};