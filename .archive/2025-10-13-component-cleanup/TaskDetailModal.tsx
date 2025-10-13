/**
 * 🎯 TaskDetailModal Component
 * 
 * Full-featured modal for editing tasks and subtasks with CRUD operations.
 * Based on the working HOTFIX implementation with enhanced functionality.
 */

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  X,
  Plus,
  Edit3,
  Trash2,
  Timer,
  Play,
  Save,
  Brain,
  Target,
  Clock,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Task, Subtask } from "./TaskCard";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (updatedTask: Task) => void;
  onStartFocusSession?: (taskId: string, subtaskId?: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdate,
  onStartFocusSession
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setEditingTask({ ...task });
    }
  }, [task]);

  if (!task || !editingTask) return null;

  const intensityConfig = {
    1: { name: 'Light Focus', color: 'bg-blue-500/20 text-blue-300', icon: Clock },
    2: { name: 'Medium Focus', color: 'bg-yellow-500/20 text-yellow-300', icon: Target },
    3: { name: 'Deep Flow', color: 'bg-orange-500/20 text-orange-300', icon: Brain },
    4: { name: 'Ultra-Deep', color: 'bg-red-500/20 text-red-300', icon: Zap }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "in-progress":
        return <CircleDotDashed className="h-4 w-4 text-blue-400" />;
      case "need-help":
        return <CircleAlert className="h-4 w-4 text-yellow-400" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const toggleSubtaskStatus = (subtaskId: string) => {
    const updatedSubtasks = editingTask.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        const newStatus = subtask.status === "completed" ? "pending" : "completed";
        return { ...subtask, status: newStatus };
      }
      return subtask;
    });

    const updatedTask = { ...editingTask, subtasks: updatedSubtasks };
    setEditingTask(updatedTask);
  };

  const deleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = editingTask.subtasks.filter(s => s.id !== subtaskId);
    const updatedTask = { ...editingTask, subtasks: updatedSubtasks };
    setEditingTask(updatedTask);
  };

  const updateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
    const updatedSubtasks = editingTask.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        return { ...subtask, ...updates };
      }
      return subtask;
    });

    const updatedTask = { ...editingTask, subtasks: updatedSubtasks };
    setEditingTask(updatedTask);
  };

  const addNewSubtask = () => {
    const newSubtask: Subtask = {
      id: `${editingTask.id}-${Date.now()}`,
      title: "New subtask",
      description: "Add description...",
      status: "pending",
      priority: "medium",
      estimatedTime: "30min",
      tools: []
    };

    const updatedTask = {
      ...editingTask,
      subtasks: [...editingTask.subtasks, newSubtask]
    };
    setEditingTask(updatedTask);
  };

  const saveChanges = () => {
    onTaskUpdate(editingTask);
    onClose();
  };

  const updateTaskField = (field: keyof Task, value: any) => {
    setEditingTask({
      ...editingTask,
      [field]: value
    });
  };

  const intensity = intensityConfig[editingTask.focusIntensity || 2];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-none overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-gray-700/30">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className={`p-2.5 rounded-xl ${intensity.color} shadow-lg`}>
                <intensity.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  value={editingTask.title}
                  onChange={(e) => updateTaskField('title', e.target.value)}
                  className="text-lg font-bold bg-transparent border-none text-white p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Task title..."
                />
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className={`text-xs ${intensity.color} shadow-sm`}>
                    {intensity.name}
                  </Badge>
                  <Input
                    value={editingTask.context || ''}
                    onChange={(e) => updateTaskField('context', e.target.value)}
                    className="text-xs bg-gray-800/50 px-2 py-1 rounded w-24 h-6"
                    placeholder="context"
                  />
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => onStartFocusSession?.(editingTask.id)}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg font-medium"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Focus
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-4 pb-4">
            {/* Task Description */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-white">Description</h3>
              <Textarea
                value={editingTask.description}
                onChange={(e) => updateTaskField('description', e.target.value)}
                className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-500 text-sm resize-none"
                rows={3}
                placeholder="Add task description..."
              />
            </div>

            {/* Task Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Priority</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => updateTaskField('priority', e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-600/50 text-white text-sm rounded px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Focus Intensity</label>
                <select
                  value={editingTask.focusIntensity || 2}
                  onChange={(e) => updateTaskField('focusIntensity', parseInt(e.target.value) as 1 | 2 | 3 | 4)}
                  className="w-full bg-gray-800/60 border border-gray-600/50 text-white text-sm rounded px-3 py-2"
                >
                  <option value={1}>1 - Light Focus</option>
                  <option value={2}>2 - Medium Focus</option>
                  <option value={3}>3 - Deep Flow</option>
                  <option value={4}>4 - Ultra-Deep</option>
                </select>
              </div>
            </div>

            {/* Subtasks Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-base font-semibold text-white">
                  Subtasks ({editingTask.subtasks.length})
                </h3>
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                  onClick={addNewSubtask}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Add Subtask
                </Button>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {editingTask.subtasks.map((subtask) => (
                    <motion.div
                      key={subtask.id}
                      className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/40 shadow-sm hover:bg-gray-800/60 transition-all"
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => toggleSubtaskStatus(subtask.id)}
                            className="mt-0.5 p-1 hover:bg-gray-700/50 rounded transition-colors"
                          >
                            {getStatusIcon(subtask.status)}
                          </button>
                          
                          <div className="flex-1 space-y-2">
                            {editingSubtask === subtask.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={subtask.title}
                                  onChange={(e) => updateSubtask(subtask.id, { title: e.target.value })}
                                  className="bg-gray-700/50 border-gray-600/50 text-white text-sm"
                                  placeholder="Subtask title"
                                />
                                <Textarea
                                  value={subtask.description}
                                  onChange={(e) => updateSubtask(subtask.id, { description: e.target.value })}
                                  className="bg-gray-700/50 border-gray-600/50 text-white text-sm resize-none"
                                  placeholder="Subtask description"
                                  rows={2}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    value={subtask.estimatedTime || ""}
                                    onChange={(e) => updateSubtask(subtask.id, { estimatedTime: e.target.value })}
                                    className="bg-gray-700/50 border-gray-600/50 text-white text-sm"
                                    placeholder="30min"
                                  />
                                  <select
                                    value={subtask.priority}
                                    onChange={(e) => updateSubtask(subtask.id, { priority: e.target.value })}
                                    className="bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded px-2"
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => setEditingSubtask(null)}
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingSubtask(null)}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${
                                  subtask.status === "completed" 
                                    ? "text-gray-500 line-through" 
                                    : "text-white"
                                }`}>
                                  {subtask.title}
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                  {subtask.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs">
                                  {subtask.estimatedTime && (
                                    <div className="flex items-center text-gray-500">
                                      <Timer className="w-3 h-3 mr-1" />
                                      {subtask.estimatedTime}
                                    </div>
                                  )}
                                  <div className={`capitalize px-2 py-0.5 rounded ${
                                    subtask.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                    subtask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-green-500/20 text-green-300'
                                  }`}>
                                    {subtask.priority}
                                  </div>
                                </div>
                                {subtask.tools && subtask.tools.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {subtask.tools.map((tool, idx) => (
                                      <span
                                        key={idx}
                                        className="bg-gray-700/60 text-gray-300 text-[10px] px-2 py-1 rounded-md"
                                      >
                                        {tool}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subtask Action Buttons */}
                        {editingSubtask !== subtask.id && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onStartFocusSession?.(editingTask.id, subtask.id)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-2"
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingSubtask(subtask.id)}
                                className="text-gray-400 hover:text-white hover:bg-gray-600/50 p-2"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteSubtask(subtask.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="border-t border-gray-700/50 p-4 bg-gray-900/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={saveChanges}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg font-medium"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};