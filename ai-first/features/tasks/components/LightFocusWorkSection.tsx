import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

interface LightFocusWorkSectionProps {
  selectedDate: Date;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate
}) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  const [lightFocusTasks, setLightFocusTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(`lifelock-${dateKey}-lightFocusTasks`);
    return saved ? JSON.parse(saved) : [
      { id: '1', title: '', completed: false },
      { id: '2', title: '', completed: false },
      { id: '3', title: '', completed: false },
      { id: '4', title: '', completed: false },
      { id: '5', title: '', completed: false }
    ];
  });
  
  const [workHours, setWorkHours] = useState(() => {
    const saved = localStorage.getItem(`lifelock-${dateKey}-workHours`);
    return saved ? JSON.parse(saved) : { lightFocus: '' };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`lifelock-${dateKey}-lightFocusTasks`, JSON.stringify(lightFocusTasks));
  }, [lightFocusTasks, dateKey]);

  useEffect(() => {
    localStorage.setItem(`lifelock-${dateKey}-workHours`, JSON.stringify(workHours));
  }, [workHours, dateKey]);

  const toggleItem = (id: string) => {
    const updatedItems = lightFocusTasks.map((item: TaskItem) => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setLightFocusTasks(updatedItems);
  };

  const updateItemField = (id: string, field: string, value: string) => {
    const updatedItems = lightFocusTasks.map((item: TaskItem) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setLightFocusTasks(updatedItems);
  };

  const lightFocusProgress = (lightFocusTasks.filter(task => task.completed && task.title).length / lightFocusTasks.filter(task => task.title).length) * 100 || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-green-900/20 border-green-700/50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-400">
            <Coffee className="h-5 w-5 mr-2" />
            ☕ Light Focus Work Session
          </CardTitle>
          <div className="border-t border-gray-600 my-4"></div>
          <p className="text-gray-300 text-sm">
            Tackle tasks that don't require as much cognitive load.
          </p>
          <div className="border-t border-gray-600 my-4"></div>
          <div className="space-y-2">
            <label className="text-white font-medium">Total Work Hours Logged:</label>
            <Input
              value={workHours.lightFocus}
              onChange={(e) => setWorkHours(prev => ({ ...prev, lightFocus: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter hours..."
            />
          </div>
          <div className="border-t border-gray-600 my-4"></div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-green-300 mb-2">
              <span>Progress</span>
              <span>{Math.round(lightFocusProgress)}%</span>
            </div>
            <div className="w-full bg-green-900/30 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${lightFocusProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          <h3 className="font-semibold text-white">Main Tasks:</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lightFocusTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleItem(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Input
                    value={task.title}
                    onChange={(e) => updateItemField(task.id, 'title', e.target.value)}
                    className="bg-transparent border-none text-white p-0 focus:ring-0"
                    placeholder="Enter task..."
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};