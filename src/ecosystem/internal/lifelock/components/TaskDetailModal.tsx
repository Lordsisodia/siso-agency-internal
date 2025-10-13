"use client";

import React, { useState } from "react";
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
  dueDate?: string;
}

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

  React.useEffect(() => {
    if (task) {
      setEditingTask({ ...task });
    }
  }, [task]);

  if (!task || !editingTask) return null;

  const intensityConfig = {
    1: { name: 'Light Focus', color: 'bg-blue-500/20 text-blue-300', icon: Clock },
    2: { name: 'Medium Focus', color: 'bg-yellow-500/20 text-yellow-300', icon: Target },
    3: { name: 'Deep Flow', color: 'bg-emerald-500/20 text-emerald-300', icon: Brain },
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

  const saveChanges = () => {
    onTaskUpdate(editingTask);
    onClose();
  };

  const intensity = intensityConfig[editingTask.focusIntensity || 2];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-none overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/20 shadow-2xl backdrop-blur-sm">
        <DialogHeader className="pb-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 to-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className={`p-2.5 rounded-xl ${intensity.color} shadow-lg`}>
                <intensity.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg sm:text-xl font-bold text-white leading-tight pr-2">
                  {editingTask.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className={`text-xs ${intensity.color} shadow-sm`}>
                    {intensity.name}
                  </Badge>
                  <span className="text-xs text-gray-400 capitalize bg-gray-800/50 px-2 py-1 rounded">
                    {editingTask.context}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => onStartFocusSession?.(editingTask.id)}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg font-medium"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Focus
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-4 pb-4">
            <div>
              <h3 className="text-base font-semibold mb-3 text-white">Description</h3>
              <Textarea
                value={editingTask.description}
                onChange={(e) => setEditingTask({
                  ...editingTask,
                  description: e.target.value
                })}
                className="bg-slate-800/60 border-emerald-500/20 text-white placeholder-gray-400 text-sm resize-none focus:border-emerald-400/50 focus:ring-emerald-400/20"
                rows={2}
                placeholder="Add task description..."
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-base font-semibold text-white">
                  Subtasks ({editingTask.subtasks.length})
                </h3>
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg border border-emerald-500/20"
                  onClick={() => {
                    const newSubtask: Subtask = {
                      id: `${editingTask.id}-${Date.now()}`,
                      title: "New subtask",
                      description: "Add description...",
                      status: "pending",
                      priority: "medium",
                      estimatedTime: "30min",
                      tools: []
                    };
                    setEditingTask({
                      ...editingTask,
                      subtasks: [...editingTask.subtasks, newSubtask]
                    });
                  }}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Add Subtask
                </Button>
              </div>

              <div className="space-y-2">
                {editingTask.subtasks.map((subtask) => (
                  <motion.div
                    key={subtask.id}
                    className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/10 shadow-lg hover:bg-slate-800/70 hover:border-emerald-500/20 transition-all duration-200"
                    layout
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
                                className="bg-slate-800/60 border-emerald-500/20 text-white text-sm focus:border-emerald-400/50 focus:ring-emerald-400/20"
                                placeholder="Subtask title"
                              />
                              <Textarea
                                value={subtask.description}
                                onChange={(e) => updateSubtask(subtask.id, { description: e.target.value })}
                                className="bg-slate-800/60 border-emerald-500/20 text-white text-sm resize-none focus:border-emerald-400/50 focus:ring-emerald-400/20"
                                placeholder="Subtask description"
                                rows={2}
                              />
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                  value={subtask.estimatedTime || ""}
                                  onChange={(e) => updateSubtask(subtask.id, { estimatedTime: e.target.value })}
                                  className="bg-gray-700/50 border-gray-600/50 text-white text-sm flex-1"
                                  placeholder="30min"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => setEditingSubtask(null)}
                                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
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
                              {subtask.estimatedTime && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Timer className="w-3 h-3 mr-1" />
                                  {subtask.estimatedTime}
                                </div>
                              )}
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

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onStartFocusSession?.(editingTask.id, subtask.id)}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 p-2 rounded-lg transition-all"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingSubtask(
                              editingSubtask === subtask.id ? null : subtask.id
                            )}
                            className="text-gray-400 hover:text-white hover:bg-slate-600/50 p-2 rounded-lg transition-all"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSubtask(subtask.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-500/20 p-6 bg-gradient-to-r from-emerald-950/20 to-slate-900/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:border-slate-500"
            >
              Cancel
            </Button>
            <Button
              onClick={saveChanges}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg font-medium border border-emerald-500/20"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};