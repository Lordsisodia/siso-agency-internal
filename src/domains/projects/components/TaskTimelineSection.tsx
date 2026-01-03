import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Filter, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { useTimelineTasks, TimelineTask } from '../hooks/useTimelineTasks';
import { TimelineTaskCard } from './TimelineTaskCard';

interface TaskTimelineSectionProps {
  startDate?: Date;
  endDate?: Date;
}

export function TaskTimelineSection({ startDate, endDate }: TaskTimelineSectionProps) {
  const [selectedCategories, setSelectedCategories] = useState<Array<'morning' | 'light-work' | 'deep-work' | 'wellness'>>([
    'morning', 'light-work', 'deep-work', 'wellness'
  ]);

  const { 
    timelineGroups, 
    loading, 
    totalTasks, 
    totalCompleted, 
    overallCompletionRate,
    updateTask,
    deleteTask
  } = useTimelineTasks({
    startDate,
    endDate,
    categories: selectedCategories
  });

  const [editingTask, setEditingTask] = useState<TimelineTask | null>(null);

  const handleToggleComplete = async (taskId: string) => {
    const group = timelineGroups.find(g => g.tasks.some(t => t.id === taskId));
    const task = group?.tasks.find(t => t.id === taskId);
    
    if (task) {
      try {
        await updateTask(taskId, { completed: !task.completed });
      } catch (error) {
        console.error('Failed to toggle task completion:', error);
      }
    }
  };

  const handleEditTask = (task: TimelineTask) => {
    setEditingTask(task);
    // TODO: Open edit modal
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const toggleCategory = (category: 'morning' | 'light-work' | 'deep-work' | 'wellness') => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400">Loading your task timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Header with Stats */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Task Timeline Overview
            </CardTitle>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-gray-300">{overallCompletionRate.toFixed(1)}% Complete</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span className="text-gray-300">{totalCompleted}/{totalTasks} Tasks</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-sm">Categories:</span>
            
            {[
              { key: 'morning' as const, label: 'Morning', icon: '🌅', color: 'border-yellow-500/50 text-yellow-300' },
              { key: 'light-work' as const, label: 'Light Work', icon: '⚡', color: 'border-blue-500/50 text-blue-300' },
              { key: 'deep-work' as const, label: 'Deep Work', icon: '🧠', color: 'border-purple-500/50 text-purple-300' },
              { key: 'wellness' as const, label: 'Wellness', icon: '💪', color: 'border-green-500/50 text-green-300' }
            ].map(({ key, label, icon, color }) => (
              <Badge
                key={key}
                variant="outline"
                className={`cursor-pointer transition-all ${
                  selectedCategories.includes(key)
                    ? `${color} bg-opacity-20`
                    : 'border-gray-600 text-gray-500 hover:border-gray-500'
                }`}
                onClick={() => toggleCategory(key)}
              >
                <span className="mr-1">{icon}</span>
                {label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Groups */}
      <div className="space-y-8">
        {timelineGroups.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Tasks Found</h3>
              <p className="text-gray-500 mb-4">
                No tasks found for the selected time period and categories.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {timelineGroups.map((group, groupIndex) => (
              <motion.div
                key={group.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                className="space-y-4"
              >
                {/* Date Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">
                      {format(parseISO(group.date), 'EEEE, MMMM d, yyyy')}
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-gray-300 border-gray-600">
                        {group.totalTasks} tasks
                      </Badge>
                      
                      {group.completionRate > 0 && (
                        <Badge 
                          variant="outline" 
                          className={`${
                            group.completionRate === 100 
                              ? 'border-green-500/50 text-green-300'
                              : 'border-blue-500/50 text-blue-300'
                          }`}
                        >
                          {group.completionRate.toFixed(0)}% complete
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                        style={{ width: `${group.completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 min-w-[3rem]">
                      {group.completedTasks}/{group.totalTasks}
                    </span>
                  </div>
                </div>

                {/* Tasks for this date */}
                <div className="space-y-3 pl-4 border-l-2 border-gray-700">
                  <AnimatePresence>
                    {group.tasks.map((task, taskIndex) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, delay: taskIndex * 0.05 }}
                      >
                        <TimelineTaskCard
                          task={task}
                          onToggleComplete={handleToggleComplete}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* TODO: Add task editing modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Edit Task</h3>
            <p className="text-gray-400 mb-4">Task editing modal coming soon...</p>
            <Button onClick={() => setEditingTask(null)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}