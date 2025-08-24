import React, { useState, useEffect } from 'react';
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
  MicOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

// Simple block-style task management for light work sessions

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
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
}

interface LightFocusWorkSectionProps {
  selectedDate: Date;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: '1', 
      title: 'Review and respond to emails', 
      completed: true, 
      timeEstimate: '15 min',
      subtasks: [
        { id: '1-1', title: 'Check priority inbox', completed: true },
        { id: '1-2', title: 'Reply to client emails', completed: true }
      ]
    },
    { 
      id: '2', 
      title: 'Update project documentation', 
      completed: false, 
      timeEstimate: '30 min',
      subtasks: [
        { id: '2-1', title: 'Update README file', completed: false },
        { id: '2-2', title: 'Add API documentation', completed: false }
      ]
    },
    { 
      id: '3', 
      title: 'Schedule team check-in meetings', 
      completed: false, 
      timeEstimate: '20 min',
      subtasks: []
    },
    { 
      id: '4', 
      title: 'Organize workspace and files', 
      completed: false, 
      timeEstimate: '25 min',
      subtasks: []
    },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [recordingTaskId, setRecordingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
          )
        };
      }
      return task;
    }));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const title = newTaskTitle.trim() || 'New light work task';
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      timeEstimate: '20 min',
      subtasks: [],
      isEditable: false
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const startAddingSubtask = (taskId: string) => {
    setAddingSubtaskToId(taskId);
    setNewSubtaskTitle('');
    // Auto-expand the task to show subtasks
    const newExpanded = new Set(expandedTasks);
    newExpanded.add(taskId);
    setExpandedTasks(newExpanded);
  };

  const saveNewSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) {
      setAddingSubtaskToId(null);
      return;
    }
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtask: Subtask = {
          id: `${taskId}-${Date.now()}`,
          title: newSubtaskTitle.trim(),
          completed: false
        };
        return { ...task, subtasks: [...task.subtasks, newSubtask] };
      }
      return task;
    }));
    
    setAddingSubtaskToId(null);
    setNewSubtaskTitle('');
  };

  const cancelAddingSubtask = () => {
    setAddingSubtaskToId(null);
    setNewSubtaskTitle('');
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
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

  const saveTaskEdit = (taskId: string) => {
    if (editTaskTitle.trim()) {
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, title: editTaskTitle.trim() } : task
      ));
    }
    setEditingTaskId(null);
    setEditTaskTitle('');
  };

  const saveSubtaskEdit = (taskId: string, subtaskId: string) => {
    if (editSubtaskTitle.trim()) {
      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, title: editSubtaskTitle.trim() } : subtask
            )
          };
        }
        return task;
      }));
    }
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
        
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, thoughtDump: newThoughtDump } : task
        ));
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
        
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, thoughtDump: newThoughtDump } : task
        ));
      }
    } finally {
      setRecordingTaskId(null);
    }
  };

  const removeThoughtDump = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, thoughtDump: undefined } : task
    ));
  };

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Light Work Card */}
        <Card className="bg-green-900/20 border-green-700/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-green-400 text-base sm:text-lg">
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              ☕ Light Work Sessions
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
            
            {/* Quick Add Task & Stats */}
            <div className="mb-6 space-y-4">
              <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter new task..."
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm min-w-[120px] sm:min-w-0"
                >
                  <Plus className="h-4 w-4" />
                  <span className="whitespace-nowrap">Add Task</span>
                </button>
              </form>

              {/* Session Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="text-xl font-bold text-green-400">
                    {tasks.filter(t => t.completed).length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Completed</div>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="text-xl font-bold text-blue-400">
                    {tasks.filter(t => !t.completed).length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Remaining</div>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="text-xl font-bold text-yellow-400">
                    {tasks.length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Total Tasks</div>
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
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {task.timeEstimate}
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
                              deleteTask(task.id);
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
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};