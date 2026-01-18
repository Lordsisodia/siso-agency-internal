"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Calendar,
  Clock,
  Bell,
  ChevronDown,
  Plus,
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubtaskItem } from "@/domains/lifelock/1-daily/_shared/components/subtask/SubtaskItem";
import { CustomCalendar } from "@/domains/lifelock/1-daily/_shared/components";
import { format } from 'date-fns';
import { useClientsList } from '@/domains/admin/clients/hooks/useClientsList';

interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedTime?: string;
  tools?: string[];
  completed: boolean;
  dueDate?: string;
  subtasks?: Subtask[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
  focusIntensity?: 1 | 2 | 3 | 4;
  context?: string;
  dueDate?: string | null;
  timeEstimate?: string | null;
  clientId?: string;
  reminders?: string[];
}

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  workType: 'deep' | 'light';
  selectedDate: Date;
  onToggleSubtaskCompletion?: (taskId: string, subtaskId: string) => void;
  onToggleNestedSubtaskCompletion?: (taskId: string, subtaskId: string, nestedSubtaskId: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onAddNestedSubtask?: (taskId: string, subtaskId: string, title: string) => void;
  onUpdateSubtaskDueDate?: (taskId: string, subtaskId: string, dueDate: Date | null) => void;
  onUpdateSubtaskPriority?: (subtaskId: string, priority: string) => void;
  onUpdateSubtaskDescription?: (subtaskId: string, description: string) => void;
  onUpdateSubtaskEstimatedTime?: (subtaskId: string, estimatedTime: string) => void;
  onDeleteSubtask?: (subtaskId: string) => void;
}

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({
  task,
  isOpen,
  onClose,
  workType,
  selectedDate,
  onToggleSubtaskCompletion,
  onToggleNestedSubtaskCompletion,
  onAddSubtask,
  onAddNestedSubtask,
  onUpdateSubtaskDueDate,
  onUpdateSubtaskPriority,
  onUpdateSubtaskDescription,
  onUpdateSubtaskEstimatedTime,
  onDeleteSubtask
}) => {
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingNestedSubtaskTo, setAddingNestedSubtaskTo] = useState<string | null>(null);
  const [newNestedSubtaskTitle, setNewNestedSubtaskTitle] = useState('');
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
  const [calendarSubtaskId, setCalendarSubtaskId] = useState<string | null>(null);

  // Fetch clients for client badges
  const { clients } = useClientsList();
  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => {
      map.set(client.id, client.business_name || client.full_name || 'Unnamed Client');
    });
    return map;
  }, [clients]);

  const isDeepWork = workType === 'deep';

  const PRIORITY_CONFIG: Record<string, { icon: string; label: string; badgeClass: string }> = {
    low: { icon: '🟢', label: 'Low', badgeClass: 'text-green-300 bg-green-900/20' },
    medium: { icon: '🟡', label: 'Medium', badgeClass: 'text-yellow-300 bg-yellow-900/20' },
    high: { icon: '🔴', label: 'High', badgeClass: 'text-red-300 bg-red-900/20' },
    urgent: { icon: '🚨', label: 'Urgent', badgeClass: 'text-purple-300 bg-purple-900/20' },
    critical: { icon: '💀', label: 'Critical', badgeClass: 'text-red-400 bg-red-900/40' }
  };

  const theme = isDeepWork ? {
    primary: 'blue',
    bg: 'bg-blue-950/95',
    border: 'border-blue-700/60',
    text: 'text-blue-400',
    textSecondary: 'text-blue-300',
    input: 'border-blue-600/60 focus:border-blue-400',
    button: 'bg-blue-600 hover:bg-blue-700',
    card: 'bg-blue-900/30 border-blue-700/40'
  } : {
    primary: 'green',
    bg: 'bg-green-950/95',
    border: 'border-green-700/60',
    text: 'text-green-400',
    textSecondary: 'text-green-300',
    input: 'border-green-600/60 focus:border-green-400',
    button: 'bg-green-600 hover:bg-green-700',
    card: 'bg-green-900/30 border-green-700/40'
  };

  const formatShortDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'MMM dd, yyyy');
  };

  const toggleSubtaskExpansion = (subtaskId: string) => {
    setExpandedSubtasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subtaskId)) {
        newSet.delete(subtaskId);
      } else {
        newSet.add(subtaskId);
      }
      return newSet;
    });
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim() && task && onAddSubtask) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setAddingSubtask(false);
    }
  };

  const handleAddNestedSubtask = (parentSubtaskId: string) => {
    if (newNestedSubtaskTitle.trim() && task && onAddNestedSubtask) {
      onAddNestedSubtask(task.id, parentSubtaskId, newNestedSubtaskTitle.trim());
      setNewNestedSubtaskTitle('');
      setAddingNestedSubtaskTo(null);
    }
  };

  if (!task || !isOpen) return null;

  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['medium'];

  // Theme config for subtasks
  const subtaskThemeConfig = {
    colors: {
      text: isDeepWork ? 'text-blue-400' : 'text-green-400',
      border: isDeepWork ? 'border-blue-400' : 'border-green-400',
      input: 'border-gray-600 focus:border-blue-400',
      textSecondary: isDeepWork ? 'text-blue-300' : 'text-green-300'
    }
  };

  // Recursively render subtasks with nested subtasks
  const renderSubtask = (subtask: Subtask, depth: number = 0) => {
    const isExpanded = expandedSubtasks.has(subtask.id);
    const hasNestedSubtasks = subtask.subtasks && subtask.subtasks.length > 0;
    const isAddingNested = addingNestedSubtaskTo === subtask.id;

    return (
      <motion.div
        key={subtask.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`${depth > 0 ? 'ml-6 mt-2' : ''}`}
      >
        <div className={`${theme.card} rounded-lg border`}>
          <SubtaskItem
            subtask={{
              id: subtask.id,
              title: subtask.title,
              completed: subtask.completed,
              dueDate: subtask.dueDate,
              description: subtask.description,
              priority: subtask.priority,
              estimatedTime: subtask.estimatedTime,
              tools: subtask.tools
            }}
            taskId={task.id}
            themeConfig={subtaskThemeConfig}
            isEditing={false}
            editTitle=""
            calendarSubtaskId={calendarSubtaskId}
            isExpanded={isExpanded}
            onToggleExpansion={() => toggleSubtaskExpansion(subtask.id)}
            onToggleCompletion={() => onToggleSubtaskCompletion?.(task.id, subtask.id)}
            onStartEditing={() => {}}
            onEditTitleChange={() => {}}
            onSaveEdit={() => {}}
            onKeyDown={() => {}}
            onCalendarToggle={(id) => setCalendarSubtaskId(calendarSubtaskId === id ? null : id)}
            onDeleteSubtask={() => onDeleteSubtask?.(subtask.id)}
            onPriorityUpdate={(priority) => onUpdateSubtaskPriority?.(subtask.id, priority)}
            onEstimatedTimeUpdate={(time) => onUpdateSubtaskEstimatedTime?.(subtask.id, time)}
            onDescriptionUpdate={(desc) => onUpdateSubtaskDescription?.(subtask.id, desc)}
          >
            {/* Calendar popup */}
            {calendarSubtaskId === subtask.id && (
              <div className="calendar-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 min-w-[280px] max-w-[90vw] max-h-[90vh] overflow-auto">
                <CustomCalendar
                  theme={isDeepWork ? 'DEEP' : 'LIGHT'}
                  subtask={{ dueDate: subtask.dueDate }}
                  onDateSelect={async (date) => {
                    try {
                      await onUpdateSubtaskDueDate?.(task.id, subtask.id, date);
                      setCalendarSubtaskId(null);
                    } catch (error) {
                      console.error('Failed to update due date:', error);
                    }
                  }}
                  onClose={() => setCalendarSubtaskId(null)}
                />
              </div>
            )}
          </SubtaskItem>

          {/* Add nested subtask button */}
          {depth < 2 && (
            <div className="px-3 pb-2">
              {isAddingNested ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newNestedSubtaskTitle}
                    onChange={(e) => setNewNestedSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNestedSubtask(subtask.id);
                      if (e.key === 'Escape') {
                        setAddingNestedSubtaskTo(null);
                        setNewNestedSubtaskTitle('');
                      }
                    }}
                    placeholder="Nested subtask title..."
                    className={`flex-1 ${isDeepWork ? 'bg-blue-900/40 border-blue-600/50 text-blue-100' : 'bg-green-900/40 border-green-600/50 text-green-100'} text-xs px-3 py-2 rounded border focus:outline-none`}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddNestedSubtask(subtask.id)}
                    className={`text-xs ${isDeepWork ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    Add
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full text-xs ${isDeepWork ? 'text-blue-400 hover:bg-blue-900/20' : 'text-green-400 hover:bg-green-900/20'} mt-2`}
                  onClick={() => setAddingNestedSubtaskTo(subtask.id)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Subtask
                </Button>
              )}
            </div>
          )}

          {/* Nested subtasks */}
          {hasNestedSubtasks && isExpanded && (
            <div className="px-3 pb-3">
              <div className="border-l-2 border-gray-700 pl-3">
                {subtask.subtasks!.map(nestedSubtask => renderSubtask(nestedSubtask, depth + 1))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed inset-x-0 bottom-0 top-[10vh] ${theme.bg} backdrop-blur-xl border-t ${theme.border} rounded-t-3xl shadow-2xl z-50 flex flex-col`}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{task.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${priorityConfig.badgeClass} border border-white/10`}>
                    {priorityConfig.icon} {priorityConfig.label}
                  </Badge>
                  {task.clientId && clientMap.has(task.clientId) && (
                    <Badge className="text-xs bg-purple-900/20 text-purple-300 border border-purple-700/40">
                      {clientMap.get(task.clientId)}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Task Info Pill */}
              <div className={`${theme.card} rounded-xl border p-4 space-y-3`}>
                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <span className="font-semibold">DESCRIPTION</span>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {task.description || 'No description provided'}
                  </p>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-gray-400 text-xs">DUE DATE</div>
                    <div className="text-white text-sm font-medium">{formatShortDate(task.dueDate)}</div>
                  </div>
                </div>

                {/* Time Estimate */}
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-gray-400 text-xs">TIME ESTIMATE</div>
                    <div className="text-white text-sm font-medium">{task.timeEstimate || 'Not set'}</div>
                  </div>
                </div>

                {/* Reminders */}
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-gray-400 text-xs">REMINDERS</div>
                    <div className="text-white text-sm font-medium">
                      {task.reminders && task.reminders.length > 0
                        ? task.reminders.join(', ')
                        : 'No reminders set'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`${theme.textSecondary} font-semibold text-sm`}>
                    Subtasks ({task.subtasks.length})
                  </h3>
                </div>

                {/* Add Subtask Input */}
                {addingSubtask ? (
                  <div className={`${theme.card} rounded-lg border p-3`}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubtask();
                          if (e.key === 'Escape') {
                            setAddingSubtask(false);
                            setNewSubtaskTitle('');
                          }
                        }}
                        placeholder="Enter subtask title..."
                        className={`flex-1 ${isDeepWork ? 'bg-blue-900/40 border-blue-600/50 text-blue-100' : 'bg-green-900/40 border-green-600/50 text-green-100'} text-sm px-3 py-2 rounded border focus:outline-none`}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleAddSubtask}
                        className={isDeepWork ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full ${isDeepWork ? 'text-blue-400 hover:bg-blue-900/20 border-blue-700/30' : 'text-green-400 hover:bg-green-900/20 border-green-700/30'} text-sm border`}
                    onClick={() => setAddingSubtask(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subtask
                  </Button>
                )}

                {/* Subtasks List */}
                <div className="space-y-2">
                  {task.subtasks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No subtasks yet</p>
                    </div>
                  ) : (
                    task.subtasks.map(subtask => renderSubtask(subtask))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
