import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { personalTaskService } from '@/ai-first/core/task.service';
import { format } from 'date-fns';

interface DeepFocusWorkSectionProps {
  selectedDate: Date;
}

export const DeepFocusWorkSection: React.FC<DeepFocusWorkSectionProps> = ({
  selectedDate
}) => {
  const [deepFocusTasks, setDeepFocusTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [workHours, setWorkHours] = useState(() => {
    const saved = localStorage.getItem(`lifelock-${format(selectedDate, 'yyyy-MM-dd')}-workHours`);
    return saved ? JSON.parse(saved) : { deepFocus: '' };
  });

  // Load tasks from Supabase on mount and date change
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoadingTasks(true);
      try {
        const tasks = await personalTaskService.getTasksForDate(selectedDate);
        setDeepFocusTasks(tasks || []);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    loadTasks();
  }, [selectedDate]);

  // Save work hours to localStorage
  useEffect(() => {
    localStorage.setItem(`lifelock-${format(selectedDate, 'yyyy-MM-dd')}-workHours`, JSON.stringify(workHours));
  }, [workHours, selectedDate]);

  // Update task completion
  const handleTaskToggle = async (taskId: string) => {
    try {
      await personalTaskService.toggleTask(taskId);
      // Reload tasks to get updated state
      const updatedTasks = await personalTaskService.getTasksForDate(selectedDate);
      setDeepFocusTasks(updatedTasks || []);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deepFocusProgress = deepFocusTasks.length > 0 
    ? (deepFocusTasks.filter(task => task.completed).length / deepFocusTasks.length) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-purple-900/20 border-purple-700/50">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-400">
            <Brain className="h-5 w-5 mr-2" />
            🧠 Deep Focus Work Session
          </CardTitle>
          <div className="border-t border-gray-600 my-4"></div>
          <p className="text-gray-300 text-sm">
            Tasks that require the most focus to create the most value. (8 hr minimum)
          </p>
          <div className="border-t border-gray-600 my-4"></div>
          <div className="space-y-2">
            <label className="text-white font-medium">Total Work Hours Logged:</label>
            <Input
              value={workHours.deepFocus}
              onChange={(e) => setWorkHours(prev => ({ ...prev, deepFocus: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter hours..."
            />
          </div>
          <div className="border-t border-gray-600 my-4"></div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-purple-300 mb-2">
              <span>Progress</span>
              <span>{Math.round(deepFocusProgress)}%</span>
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${deepFocusProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          <h3 className="font-semibold text-white">Main Tasks:</h3>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading today's tasks...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {deepFocusTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No tasks found for today.</p>
                  <p className="text-sm mt-2">Tasks will appear here when created in the task management system.</p>
                </div>
              ) : (
                deepFocusTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{task.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.priority === 'high' ? 'border-red-400 text-red-400' :
                            task.priority === 'medium' ? 'border-yellow-400 text-yellow-400' :
                            'border-green-400 text-green-400'
                          }`}
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                          {task.category}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-gray-500 text-xs mt-1">Due: {task.due_date}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};