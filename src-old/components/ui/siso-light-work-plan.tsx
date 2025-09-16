"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap,
  Coffee,
  Timer,
  Play,
  Pause,
  Square,
  TrendingUp,
  CheckCircle2,
  Circle,
  Plus,
  Settings,
  BarChart3,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { SharedTaskCard, TaskData } from '@/components/ui/SharedTaskCard';
import { Progress } from '@/shared/ui/progress';
import { useLightWorkTasksSupabase } from '@/shared/hooks/useLightWorkTasksSupabase';

interface LightWorkSectionProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date;
}

export default function SisoLightWorkPlanV2({ 
  onStartFocusSession, 
  selectedDate = new Date() 
}: LightWorkSectionProps) {
  const { 
    tasks: lightWorkTasks, 
    loading, 
    error,
    toggleTaskCompletion,
    createTask,
    deleteTask
  } = useLightWorkTasksSupabase({ selectedDate });

  const [totalFocusTime, setTotalFocusTime] = useState(85); // minutes today
  const [focusGoal] = useState(120); // 2 hours

  // Transform Supabase tasks to TaskData format for SharedTaskCard
  const taskData: TaskData[] = lightWorkTasks.map(task => ({
    id: task.id,
    title: task.title,
    priority: (task.priority.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
    estimatedTime: task.estimatedDuration ? `${task.estimatedDuration}min` : '30min',
    completed: task.completed
  }));

  const completedTasks = taskData.filter(t => t.completed).length;
  const highPriorityTasks = taskData.filter(t => t.priority === 'high' && !t.completed);
  const focusProgress = (totalFocusTime / focusGoal) * 100;

  const toggleTaskComplete = async (taskId: string) => {
    await toggleTaskCompletion(taskId);
  };

  const handleQuickAdd = async () => {
    await createTask({
      title: 'New Light Work Task',
      description: 'Quick task description',
      priority: 'MEDIUM',
      estimatedDuration: 30,
      focusBlocks: 1,
      breakDuration: 5,
      tags: [],
      subtasks: []
    });
  };

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Light Work</h1>
            <p className="text-gray-400 text-sm">Quick wins & momentum</p>
          </div>
        </div>
        
        {/* Focus Stats */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-400" />
            <span>{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m today</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span>Goal: {Math.round(focusProgress)}%</span>
          </div>
        </div>
      </motion.div>

      {/* Focus Time Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-green-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Light Work Progress</h3>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/40">
                {totalFocusTime}min / {focusGoal}min
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={focusProgress} 
              className="h-3 bg-gray-800/60"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Daily Goal</span>
              <span>{Math.round(focusProgress)}% Complete</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Priority Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-green-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coffee className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Light Work Tasks</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/40">
                  {completedTasks}/{taskData.length}
                </Badge>
                <Button
                  onClick={handleQuickAdd}
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {taskData.map((task, index) => (
              <SharedTaskCard
                key={task.id}
                task={task}
                index={index}
                theme="light-work"
                onToggleComplete={(taskId) => toggleTaskComplete(taskId)}
                onStartFocus={(taskId) => onStartFocusSession?.(taskId, 2)}
                showFocusButton={true}
              />
            ))}
            
            {taskData.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Coffee className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No light work tasks yet</p>
                <Button 
                  onClick={handleQuickAdd}
                  className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Light Work Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* High Priority Alert */}
      {highPriorityTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-green-500/10 via-yellow-500/10 to-green-500/10 border-green-400/50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">High Priority Alert</h4>
                  <p className="text-gray-400 text-sm">
                    You have {highPriorityTasks.length} high-priority light work task{highPriorityTasks.length !== 1 ? 's' : ''} pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};