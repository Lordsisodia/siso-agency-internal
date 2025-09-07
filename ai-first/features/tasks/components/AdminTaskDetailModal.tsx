import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Calendar } from '@/ecosystem/internal/calendar/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { cn } from '@/shared/lib/utils';
// Removed framer-motion for performance optimization
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Flag,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Tag,
  AlertTriangle
} from 'lucide-react';

// Task interfaces
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: 'overdue' | 'due-today' | 'upcoming' | 'in-progress' | 'blocked' | 'not-started' | 'started' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  category: 'development' | 'design' | 'marketing' | 'client' | 'admin';
  tags?: string[];
  estimatedHours?: number;
  subtasks?: Subtask[];
  progress?: number;
  description?: string;
}

interface AdminTaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string) => void;
}export const AdminTaskDetailModal: React.FC<AdminTaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onSubtaskToggle
}) => {
  const [isEditing, setIsEditing] = useState(true); // Always start in editing mode
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      const taskWithDefaults = {
        ...task,
        // Add default empty subtasks if none exist
        subtasks: task.subtasks && task.subtasks.length > 0 ? task.subtasks : [
          { id: '1', title: '', completed: false },
          { id: '2', title: '', completed: false },
          { id: '3', title: '', completed: false }
        ]
      };
      setEditedTask(taskWithDefaults);
      setIsEditing(true); // Always start in editing mode
      setActiveTab('details');
    }
  }, [task]);

  // Auto-save functionality
  const triggerAutoSave = (updatedTask: Task) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    setIsAutoSaving(true);
    
    const timeout = setTimeout(() => {
      onSave(updatedTask);
      setIsAutoSaving(false);
    }, 1000); // Auto-save after 1 second of inactivity
    
    setAutoSaveTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  if (!task || !editedTask) return null;

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'due-today': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'blocked': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'done': return 'bg-green-500/20 text-green-400 border-green-500/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600/20 text-red-300 border-red-600/40';
      case 'high': return 'bg-orange-600/20 text-orange-300 border-orange-600/40';
      case 'medium': return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/40';
      case 'low': return 'bg-green-600/20 text-green-300 border-green-600/40';
      default: return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'development': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'design': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'marketing': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'client': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'admin': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };  // Event handlers
  const handleInputChange = (field: keyof Task, value: any) => {
    const updatedTask = editedTask ? { ...editedTask, [field]: value } : null;
    setEditedTask(updatedTask);
    
    // Trigger auto-save
    if (updatedTask) {
      triggerAutoSave(updatedTask);
    }
  };

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTask(task ? { ...task } : null);
    setIsEditing(false);
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    if (!editedTask || !editedTask.subtasks) return;
    
    const updatedSubtasks = editedTask.subtasks.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    
    const completedCount = updatedSubtasks.filter(st => st.completed).length;
    const progress = (completedCount / updatedSubtasks.length) * 100;
    
    const updatedTask = {
      ...editedTask,
      subtasks: updatedSubtasks,
      progress: progress
    };
    
    setEditedTask(updatedTask);
    triggerAutoSave(updatedTask);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !editedTask) return;
    
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle,
      completed: false
    };
    
    const updatedSubtasks = [...(editedTask.subtasks || []), newSubtask];
    const completedCount = updatedSubtasks.filter(st => st.completed).length;
    const progress = (completedCount / updatedSubtasks.length) * 100;
    
    const updatedTask = {
      ...editedTask,
      subtasks: updatedSubtasks,
      progress: progress
    };
    
    setEditedTask(updatedTask);
    setNewSubtaskTitle('');
    
    // Trigger auto-save
    triggerAutoSave(updatedTask);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!editedTask || !editedTask.subtasks) return;
    
    const updatedSubtasks = editedTask.subtasks.filter(st => st.id !== subtaskId);
    const completedCount = updatedSubtasks.filter(st => st.completed).length;
    const progress = updatedSubtasks.length > 0 ? (completedCount / updatedSubtasks.length) * 100 : 0;
    
    const updatedTask = {
      ...editedTask,
      subtasks: updatedSubtasks,
      progress: progress
    };
    
    setEditedTask(updatedTask);
    
    // Trigger auto-save
    triggerAutoSave(updatedTask);
  };  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-4xl bg-gradient-to-br from-gray-900/95 to-black/95 border border-orange-500/30 p-0 max-h-[90vh] overflow-hidden rounded-3xl backdrop-blur-xl shadow-2xl shadow-orange-500/20">
        {/* Header */}
        <DialogHeader className="p-8 pb-6 border-b border-orange-500/20 bg-gradient-to-r from-orange-500/20 to-yellow-500/20">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Input
                value={editedTask.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="text-xl font-bold text-white bg-gray-800/80 border border-orange-500/50 focus:border-orange-400/80 rounded-xl px-4 py-3 placeholder:text-gray-400"
                placeholder="Task title..."
              />
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(editedTask.status)}`}>
                  {editedTask.status.replace('-', ' ')}
                </Badge>
                <Badge className={`text-xs px-3 py-1 rounded-full border ${getPriorityColor(editedTask.priority)}`}>
                  {editedTask.priority} priority
                </Badge>
                <Badge className={`text-xs px-3 py-1 rounded-full border ${getCategoryColor(editedTask.category)}`}>
                  {editedTask.category}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {isAutoSaving ? (
                <div className="text-xs text-orange-400 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
                  Auto-saving...
                </div>
              ) : (
                <div className="text-xs text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                  Auto-saved ✓
                </div>
              )}
            </div>
          </div>
        </DialogHeader>        {/* Tabs */}
        <div className="px-8 py-6 overflow-y-auto flex-1 bg-gray-900/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-gray-800/80 border border-orange-500/30 rounded-xl mb-8 p-1 shadow-lg">
              <TabsTrigger value="details" className="rounded-lg text-gray-300 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:font-medium px-6 py-2">Details</TabsTrigger>
              <TabsTrigger value="subtasks" className="rounded-lg text-gray-300 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:font-medium px-6 py-2">Subtasks</TabsTrigger>
              <TabsTrigger value="description" className="rounded-lg text-gray-300 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:font-medium px-6 py-2">Description</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Status</label>
                  {isEditing ? (
                    <Select value={editedTask.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="bg-gray-800/80 border border-orange-500/50 text-white rounded-xl py-3 px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-lg">
                        <SelectItem value="not-started" className="text-gray-700 hover:bg-gray-100">Not Started</SelectItem>
                        <SelectItem value="in-progress" className="text-gray-700 hover:bg-gray-100">In Progress</SelectItem>
                        <SelectItem value="blocked" className="text-gray-700 hover:bg-gray-100">Blocked</SelectItem>
                        <SelectItem value="done" className="text-gray-700 hover:bg-gray-100">Done</SelectItem>
                        <SelectItem value="overdue" className="text-gray-700 hover:bg-gray-100">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={`px-4 py-3 rounded-xl text-sm border ${getStatusColor(editedTask.status)}`}>
                      {editedTask.status.replace('-', ' ')}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Priority</label>
                  {isEditing ? (
                    <Select value={editedTask.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger className="bg-gray-800/80 border border-orange-500/50 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-lg">
                        <SelectItem value="urgent" className="text-gray-700 hover:bg-gray-100">Urgent</SelectItem>
                        <SelectItem value="high" className="text-gray-700 hover:bg-gray-100">High</SelectItem>
                        <SelectItem value="medium" className="text-gray-700 hover:bg-gray-100">Medium</SelectItem>
                        <SelectItem value="low" className="text-gray-700 hover:bg-gray-100">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={`px-4 py-3 rounded-xl text-sm border ${getPriorityColor(editedTask.priority)}`}>
                      {editedTask.priority} priority
                    </div>
                  )}
                </div>
              </div>              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  {isEditing ? (
                    <Select value={editedTask.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="bg-gray-800/80 border border-orange-500/50 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-lg">
                        <SelectItem value="development" className="text-gray-700 hover:bg-gray-100">Development</SelectItem>
                        <SelectItem value="design" className="text-gray-700 hover:bg-gray-100">Design</SelectItem>
                        <SelectItem value="marketing" className="text-gray-700 hover:bg-gray-100">Marketing</SelectItem>
                        <SelectItem value="client" className="text-gray-700 hover:bg-gray-100">Client</SelectItem>
                        <SelectItem value="admin" className="text-gray-700 hover:bg-gray-100">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={`px-4 py-3 rounded-xl text-sm border ${getCategoryColor(editedTask.category)}`}>
                      {editedTask.category}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Due Date</label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-gray-800/80 border border-orange-500/50 text-white hover:bg-gray-800/90 rounded-xl">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedTask.dueDate ? new Date(editedTask.dueDate).toLocaleDateString() : "Set date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border border-orange-500/50 rounded-xl">
                        <Calendar
                          mode="single"
                          selected={editedTask.dueDate ? new Date(editedTask.dueDate) : undefined}
                          onSelect={(date) => handleInputChange('dueDate', date?.toISOString().split('T')[0])}
                          className="rounded-xl"
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="px-4 py-3 rounded-xl text-sm bg-gray-800/80 border border-orange-500/30 text-gray-300 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {editedTask.dueDate ? new Date(editedTask.dueDate).toLocaleDateString() : 'No due date'}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Assignee</label>
                  {isEditing ? (
                    <Input
                      value={editedTask.assignee || ''}
                      onChange={(e) => handleInputChange('assignee', e.target.value)}
                      placeholder="Assign to..."
                      className="bg-gray-800/80 border border-orange-500/50 text-white rounded-xl"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-xl text-sm bg-gray-800/80 border border-orange-500/30 text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {editedTask.assignee || 'Not assigned'}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Estimated Hours</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedTask.estimatedHours || ''}
                      onChange={(e) => handleInputChange('estimatedHours', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Hours..."
                      min="0"
                      step="0.5"
                      className="bg-gray-800/80 border border-orange-500/50 text-white rounded-xl"
                    />
                  ) : (
                    <div className="px-4 py-3 rounded-xl text-sm bg-gray-800/80 border border-orange-500/30 text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {editedTask.estimatedHours ? `${editedTask.estimatedHours}h` : 'Not estimated'}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Subtasks Tab */}
            <TabsContent value="subtasks" className="space-y-4">
              {editedTask.subtasks && editedTask.subtasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-300">
                      Progress: {editedTask.subtasks.filter(st => st.completed).length} of {editedTask.subtasks.length} completed
                    </h4>
                    <div className="text-sm font-medium text-orange-400">
                      {Math.round(((editedTask.subtasks.filter(st => st.completed).length) / editedTask.subtasks.length) * 100)}%
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-800/80 rounded-full h-3 overflow-hidden mb-4 border border-orange-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-500 ease-out rounded-full"
                      style={{ 
                        width: `${((editedTask.subtasks.filter(st => st.completed).length) / editedTask.subtasks.length) * 100}%` 
                      }}
                    />
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {editedTask.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/80 border border-orange-500/30 group hover:bg-gray-800/90 transition-all duration-200"
                      >
                        <button
                          onClick={() => handleSubtaskToggle(subtask.id)}
                          className="flex-shrink-0"
                        >
                          {subtask.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400 hover:text-gray-300" />
                          )}
                        </button>
                        <span className={cn(
                          "text-sm flex-1",
                          subtask.completed ? "line-through text-gray-500" : "text-gray-300"
                        )}>
                          {subtask.title}
                        </span>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSubtask(subtask.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-500/20 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}              {/* Add new subtask - Always show when editing */}
              {isEditing && (
                <div className="space-y-4">
                  <div className="border-t border-gray-700/50 pt-4">
                    <h5 className="text-sm font-medium text-gray-300 mb-3">Add Subtask</h5>
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Add a new subtask..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        className="flex-1 bg-gray-800/80 border border-orange-500/50 text-white rounded-xl placeholder:text-gray-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSubtask();
                          }
                        }}
                      />
                      <Button
                        onClick={handleAddSubtask}
                        size="sm"
                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded-xl"
                        disabled={!newSubtaskTitle.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {(!editedTask.subtasks || editedTask.subtasks.length === 0) && !isEditing && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No subtasks yet</div>
                  <div className="text-sm text-gray-500">Click Edit to add subtasks and break down this task into smaller parts</div>
                </div>
              )}
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Description</label>
                {isEditing ? (
                  <Textarea
                    value={editedTask.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Add a description for this task..."
                    className="min-h-[140px] bg-gray-800/80 border border-orange-500/50 text-white resize-none rounded-xl placeholder:text-gray-400"
                  />
                ) : (
                  <div className="min-h-[140px] p-4 rounded-xl bg-gray-800/80 border border-orange-500/30 text-sm text-gray-300">
                    {editedTask.description || (
                      <span className="text-gray-500 italic">No description provided</span>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};