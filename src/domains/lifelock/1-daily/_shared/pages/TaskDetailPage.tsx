"use client";

import React, { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  Calendar,
  Clock,
  Target,
  Brain,
  Zap,
  Timer,
  ChevronLeft,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useClientsList } from "@/domains/client/hooks/useClientsList";
import { useDeepWorkTasksSupabase } from "@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase";
import { useLightWorkTasksSupabase } from "@/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase";
import { format } from 'date-fns';
import { SubtaskItem } from "../components/subtask/SubtaskItem";

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
  dueDate?: string | null;
  timeEstimate?: string | null;
  clientId?: string;
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const workType = searchParams.get('type') || 'deep'; // 'deep' or 'light'
  const dateParam = searchParams.get('date');
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

  // Fetch clients for client badges
  const { clients } = useClientsList();
  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => {
      map.set(client.id, client.business_name || client.full_name || 'Unnamed Client');
    });
    return map;
  }, [clients]);

  // Fetch tasks based on work type
  const deepWorkHook = useDeepWorkTasksSupabase({ selectedDate });
  const lightWorkHook = useLightWorkTasksSupabase({ selectedDate });

  const tasks = workType === 'deep' ? deepWorkHook.tasks : lightWorkHook.tasks;
  const loading = workType === 'deep' ? deepWorkHook.loading : lightWorkHook.loading;

  // Transform Supabase data to UI format
  const task = useMemo(() => {
    const foundTask = tasks.find(t => t.id === taskId);
    if (!foundTask) return null;

    return {
      id: foundTask.id,
      title: foundTask.title,
      description: foundTask.description || "",
      status: foundTask.completed ? "completed" : "in-progress",
      priority: (foundTask.priority || 'MEDIUM').toLowerCase(),
      level: 0,
      dependencies: [],
      focusIntensity: (foundTask.focusBlocks || 2) as 1 | 2 | 3 | 4,
      context: "coding",
      dueDate: foundTask.dueDate || foundTask.currentDate || foundTask.createdAt,
      timeEstimate: foundTask.timeEstimate || null,
      clientId: foundTask.clientId,
      subtasks: foundTask.subtasks.map(subtask => ({
        id: subtask.id,
        title: subtask.title,
        description: subtask.text || subtask.title,
        status: subtask.completed ? "completed" : "pending",
        priority: subtask.priority || "medium",
        estimatedTime: subtask.estimatedTime,
        tools: [],
        completed: subtask.completed,
        dueDate: subtask.dueDate
      }))
    } as Task;
  }, [tasks, taskId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-white text-center py-20">Loading task...</div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-white text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">Task not found</h2>
            <p className="text-gray-400 mb-6">The task you're looking for doesn't exist</p>
            <Button
              onClick={() => navigate('/admin/lifelock/daily')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Daily Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Theme colors based on work type
  const isDeepWork = workType === 'deep';
  const theme = isDeepWork ? {
    primary: 'blue',
    bg: 'bg-blue-900/20',
    border: 'border-blue-700/50',
    text: 'text-blue-400',
    textSecondary: 'text-blue-300',
    gradient: 'from-blue-950/30 to-slate-900/50',
    button: 'bg-blue-600 hover:bg-blue-700'
  } : {
    primary: 'green',
    bg: 'bg-green-900/20',
    border: 'border-green-700/50',
    text: 'text-green-400',
    textSecondary: 'text-green-300',
    gradient: 'from-green-950/30 to-slate-900/50',
    button: 'bg-green-600 hover:bg-green-700'
  };

  const PRIORITY_CONFIG: Record<string, { icon: string; label: string; badgeClass: string }> = {
    low: { icon: '🟢', label: 'Low', badgeClass: 'text-green-300 bg-green-900/20' },
    medium: { icon: '🟡', label: 'Medium', badgeClass: 'text-yellow-300 bg-yellow-900/20' },
    high: { icon: '🔴', label: 'High', badgeClass: 'text-red-300 bg-red-900/20' },
    urgent: { icon: '🚨', label: 'Urgent', badgeClass: 'text-purple-300 bg-purple-900/20' },
    critical: { icon: '💀', label: 'Critical', badgeClass: 'text-red-400 bg-red-900/40' }
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['medium'];

  const intensityConfig = {
    1: { name: 'Light Focus', color: 'bg-blue-500/20 text-blue-300', icon: Clock },
    2: { name: 'Medium Focus', color: 'bg-yellow-500/20 text-yellow-300', icon: Target },
    3: { name: 'Deep Flow', color: 'bg-emerald-500/20 text-emerald-300', icon: Brain },
    4: { name: 'Ultra-Deep', color: 'bg-red-500/20 text-red-300', icon: Zap }
  };

  const intensity = intensityConfig[task.focusIntensity || 2];

  // Get top 3 subtasks by priority and status
  const getTopSubtasks = (subtasks: Subtask[]) => {
    const priorityOrder = { 'critical': 0, 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
    return [...subtasks]
      .sort((a, b) => {
        // Sort by incomplete first, then by priority
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
      })
      .slice(0, 3);
  };

  const topSubtasks = getTopSubtasks(task.subtasks);
  const completedSubtasks = task.subtasks.filter(s => s.status === 'completed').length;
  const totalSubtasks = task.subtasks.length;

  const formatShortDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'MMM dd, yyyy');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case "in-progress":
        return <CircleDotDashed className="h-5 w-5 text-blue-400" />;
      case "need-help":
        return <CircleAlert className="h-5 w-5 text-yellow-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Theme config for subtasks
  const subtaskThemeConfig = {
    colors: {
      text: isDeepWork ? 'text-blue-400' : 'text-green-400',
      border: isDeepWork ? 'border-blue-400' : 'border-green-400',
      input: 'border-gray-600 focus:border-blue-400',
      textSecondary: isDeepWork ? 'text-blue-300' : 'text-green-300'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/lifelock/daily')}
              className="text-gray-300 hover:text-white hover:bg-slate-800"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-white font-semibold text-lg truncate">Task Details</h1>
              <p className="text-gray-400 text-xs">{isDeepWork ? 'Deep Work' : 'Light Work'} Task</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Task Header Card */}
        <Card className={`${theme.bg} ${theme.border} border-2`}>
          <CardHeader className="pb-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${intensity.color} shadow-lg`}>
                <intensity.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl font-bold text-white mb-3">
                  {task.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`text-sm ${priorityConfig.badgeClass} border border-white/10`}>
                    {priorityConfig.icon} {priorityConfig.label} Priority
                  </Badge>
                  <Badge className={`text-sm ${intensity.color} border border-white/10`}>
                    {intensity.name}
                  </Badge>
                  <Badge className="text-sm bg-slate-700/50 text-gray-300 border border-white/10">
                    {getStatusIcon(task.status)}
                    <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Description */}
            <div>
              <h3 className={`${theme.textSecondary} font-semibold text-sm mb-2`}>Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {task.description || 'No description provided'}
              </p>
            </div>

            {/* Task Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Due Date */}
              <div className={`bg-slate-800/50 rounded-lg p-3 border ${theme.border}`}>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due Date</span>
                </div>
                <p className="text-white font-medium">{formatShortDate(task.dueDate)}</p>
              </div>

              {/* Time Estimate */}
              <div className={`bg-slate-800/50 rounded-lg p-3 border ${theme.border}`}>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Time Estimate</span>
                </div>
                <p className="text-white font-medium">{task.timeEstimate || 'Not set'}</p>
              </div>

              {/* Client Badge (if applicable) */}
              {task.clientId && clientMap.has(task.clientId) && (
                <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700/40 sm:col-span-2">
                  <div className="flex items-center gap-2 text-purple-300 text-xs mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Client</span>
                  </div>
                  <p className="text-white font-medium">{clientMap.get(task.clientId)}</p>
                </div>
              )}

              {/* Subtask Progress */}
              <div className={`bg-slate-800/50 rounded-lg p-3 border ${theme.border} sm:col-span-2`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Subtask Progress</span>
                  </div>
                  <span className={`${theme.text} text-sm font-semibold`}>
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${isDeepWork ? 'bg-blue-500' : 'bg-green-500'} transition-all`}
                    style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Subtasks Card */}
        <Card className={`${theme.bg} ${theme.border} border-2`}>
          <CardHeader>
            <CardTitle className={`${theme.text} text-lg`}>
              Top Priority Subtasks
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Showing the most important subtasks based on priority and completion status
            </p>
          </CardHeader>

          <CardContent>
            {topSubtasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No subtasks yet</div>
                <p className="text-gray-500 text-sm">Add subtasks to break down this task</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topSubtasks.map((subtask, index) => (
                  <motion.div
                    key={subtask.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-slate-800/50 rounded-lg p-4 border ${theme.border} hover:bg-slate-800/70 transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getStatusIcon(subtask.status)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className={`font-semibold text-sm ${
                            subtask.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'
                          }`}>
                            {subtask.title}
                          </h4>
                          <Badge className={`text-xs ${PRIORITY_CONFIG[subtask.priority]?.badgeClass} border border-white/10`}>
                            {PRIORITY_CONFIG[subtask.priority]?.icon} {PRIORITY_CONFIG[subtask.priority]?.label}
                          </Badge>
                        </div>

                        {subtask.description && subtask.description !== subtask.title && (
                          <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                            {subtask.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {subtask.estimatedTime && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Timer className="w-3 h-3" />
                              <span>{subtask.estimatedTime}</span>
                            </div>
                          )}

                          {subtask.dueDate && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span>{formatShortDate(subtask.dueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Subtasks Card */}
        {task.subtasks.length > 0 && (
          <Card className={`${theme.bg} ${theme.border} border-2`}>
            <CardHeader>
              <CardTitle className={`${theme.text} text-lg`}>
                All Subtasks ({task.subtasks.length})
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <SubtaskItem
                    key={subtask.id}
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
                    calendarSubtaskId={null}
                    isExpanded={false}
                    onToggleCompletion={() => {}}
                    onToggleExpansion={() => {}}
                    onStartEditing={() => {}}
                    onEditTitleChange={() => {}}
                    onSaveEdit={() => {}}
                    onKeyDown={() => {}}
                    onCalendarToggle={() => {}}
                    onDeleteSubtask={() => {}}
                    onPriorityUpdate={() => {}}
                    onEstimatedTimeUpdate={() => {}}
                    onDescriptionUpdate={() => {}}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info Card */}
        <Card className={`${theme.bg} ${theme.border} border-2`}>
          <CardHeader>
            <CardTitle className={`${theme.text} text-lg`}>
              Task Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-gray-400 text-sm">Task ID</span>
              <span className="text-white text-sm font-mono">{task.id}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-gray-400 text-sm">Focus Intensity</span>
              <div className="flex items-center gap-2">
                <intensity.icon className="w-4 h-4 text-gray-300" />
                <span className="text-white text-sm">{intensity.name}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-gray-400 text-sm">Context</span>
              <span className="text-white text-sm capitalize">{task.context || 'General'}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-sm">Total Subtasks</span>
              <span className="text-white text-sm">{task.subtasks.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
