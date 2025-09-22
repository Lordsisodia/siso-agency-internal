import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
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

// Helper function to get quick rep buttons based on exercise type
const getQuickReps = (exerciseName: string): number[] => {
  const name = exerciseName.toLowerCase();
  if (name.includes('push') || name.includes('burpee')) {
    return [5, 10, 20];
  } else if (name.includes('squat') || name.includes('mountain')) {
    return [10, 25, 50];
  } else if (name.includes('plank')) {
    return [30, 60, 120]; // seconds
  } else {
    return [5, 15, 25]; // default
  }
};

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
          <div className="space-y-4">
            {workoutItems.map((item, index) => (
              <motion.div 
                key={item.id} 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
              >
                {/* Modern Glass Card Design */}
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-red-900/20 via-red-800/15 to-red-700/10 backdrop-blur-sm border border-red-700/30 rounded-xl hover:border-red-600/50 transition-all duration-300 group hover:shadow-lg hover:shadow-red-900/20">
                  
                  {/* Custom Styled Checkbox */}
                  <div className="relative mt-1">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="w-5 h-5 border-2 border-red-400/60 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-400 rounded-md transition-all duration-200 hover:border-red-400 hover:shadow-sm hover:shadow-red-400/20"
                    />
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold transition-colors duration-200 ${
                        item.completed 
                          ? 'text-red-300 line-through' 
                          : 'text-white group-hover:text-red-100'
                      }`}>
                        {item.title}
                      </h4>
                      {item.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-red-400 text-sm font-medium"
                        >
                          ✓ Done
                        </motion.div>
                      )}
                    </div>
                    
                    {item.target && (
                      <p className="text-red-300/70 text-sm mb-3 flex items-center">
                        🎯 Target: <span className="ml-1 font-medium text-red-200">{item.target}</span>
                      </p>
                    )}
                    
                    {item.logged !== undefined && (
                      <div className="space-y-4 mt-5">
                        {/* Quick Rep Buttons - Better spacing */}
                        <div className="flex gap-2">
                          {getQuickReps(item.title).map((rep) => (
                            <Button
                              key={rep}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const current = parseInt(item.logged || '0');
                                updateItemField(item.id, 'logged', (current + rep).toString());
                              }}
                              className="flex-1 h-8 px-3 text-sm font-medium bg-red-900/20 border-red-600/40 text-red-200 hover:bg-red-800/30 hover:border-red-500/60 transition-all duration-200 rounded-md"
                            >
                              +{rep}
                            </Button>
                          ))}
                        </div>
                        
                        {/* Display current vs target - Better styling */}
                        {item.logged && item.target && (
                          <div className="text-center mt-1">
                            <div className="inline-flex items-center px-4 py-2 bg-red-900/20 border border-red-700/30 rounded-full text-sm text-red-300">
                              <span className="font-medium text-red-200">{item.logged}</span>
                              <span className="mx-1 text-red-400">/</span>
                              <span className="text-red-300">{item.target}</span>
                              <span className="ml-1 text-red-400">completed</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Completion Glow Effect */}
                  {item.completed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-400/5 rounded-xl pointer-events-none"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};