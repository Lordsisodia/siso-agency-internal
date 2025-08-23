import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface WorkoutItem {
  id: string;
  title: string;
  completed: boolean;
  target?: string;
  logged?: string;
}

interface HomeWorkoutSectionProps {
  selectedDate: Date;
}

export const HomeWorkoutSection: React.FC<HomeWorkoutSectionProps> = ({
  selectedDate
}) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>(() => {
    const saved = localStorage.getItem(`lifelock-${dateKey}-workoutItems`);
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Push-ups', completed: false, target: '50 reps', logged: '' },
      { id: '2', title: 'Squats', completed: false, target: '100 reps', logged: '' },
      { id: '3', title: 'Plank', completed: false, target: '2 minutes', logged: '' },
      { id: '4', title: 'Burpees', completed: false, target: '20 reps', logged: '' },
      { id: '5', title: 'Mountain Climbers', completed: false, target: '50 reps', logged: '' }
    ];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`lifelock-${dateKey}-workoutItems`, JSON.stringify(workoutItems));
  }, [workoutItems, dateKey]);

  const toggleItem = (id: string) => {
    const updatedItems = workoutItems.map((item: WorkoutItem) => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setWorkoutItems(updatedItems);
  };

  const updateItemField = (id: string, field: string, value: string) => {
    const updatedItems = workoutItems.map((item: WorkoutItem) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setWorkoutItems(updatedItems);
  };

  const workoutProgress = (workoutItems.filter(item => item.completed).length / workoutItems.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-red-900/20 border-red-700/50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-400">
            <Dumbbell className="h-5 w-5 mr-2" />
            🏋️‍♂️ Home Workout Objective
          </CardTitle>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-red-300 mb-2">
              <span>Workout Progress</span>
              <span>{Math.round(workoutProgress)}%</span>
            </div>
            <div className="w-full bg-red-900/30 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${workoutProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workoutItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium">{item.title}</h4>
                  {item.target && (
                    <p className="text-gray-400 text-sm mt-1">{item.target}</p>
                  )}
                  {item.logged !== undefined && (
                    <Input
                      value={item.logged}
                      onChange={(e) => updateItemField(item.id, 'logged', e.target.value)}
                      placeholder="Log your result..."
                      className="mt-2 bg-gray-600 border-gray-500 text-white text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};