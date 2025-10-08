import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import { format } from 'date-fns';
import { supabaseWorkoutService } from '@/services/supabaseWorkoutService';
import { useClerkUser } from '@/shared/ClerkProvider';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { AnimatedDateHeader } from '@/shared/ui/animated-date-header-v2';

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
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Load workout items from Supabase
  useEffect(() => {
    const loadWorkoutItems = async () => {
      if (!internalUserId) return;
      
      setIsLoading(true);
      try {
        let items = await supabaseWorkoutService.getWorkoutItems(internalUserId, dateKey);
        
        // If no items exist for this date, create default ones
        if (items.length === 0) {
          items = await supabaseWorkoutService.createDefaultWorkoutItems(internalUserId, dateKey);
        }
        
        setWorkoutItems(items);
      } catch (error) {
        console.error('Failed to load workout items:', error);
        // Fallback to default items if database fails (using temp UUIDs)
        setWorkoutItems([
          { id: 'temp-' + Date.now() + '-1', title: 'Push-ups', completed: false, target: '50 reps', logged: '0' },
          { id: 'temp-' + Date.now() + '-2', title: 'Squats', completed: false, target: '100 reps', logged: '0' },
          { id: 'temp-' + Date.now() + '-3', title: 'Plank', completed: false, target: '2 minutes', logged: null },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkoutItems();
  }, [internalUserId, dateKey]);

  const toggleItem = async (id: string) => {
    if (!internalUserId) return;
    
    // Check if this is a temporary item (fallback data)
    if (id.startsWith('temp-')) {
      // Just update locally for temporary items
      const updatedItems = workoutItems.map((item: WorkoutItem) => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      setWorkoutItems(updatedItems);
      return;
    }
    
    try {
      const item = workoutItems.find(item => item.id === id);
      if (!item) return;
      
      const updatedItem = await supabaseWorkoutService.toggleWorkoutItem(id, !item.completed);
      
      setWorkoutItems(prev => 
        prev.map(item => 
          item.id === id ? updatedItem : item
        )
      );
    } catch (error) {
      console.error('Failed to toggle workout item:', error);
      // Fallback to local update if database fails
      const updatedItems = workoutItems.map((item: WorkoutItem) => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      setWorkoutItems(updatedItems);
    }
  };

  const updateItemField = async (id: string, field: string, value: string) => {
    if (!internalUserId) return;
    
    // Check if this is a temporary item (fallback data)
    if (id.startsWith('temp-')) {
      // Just update locally for temporary items
      const updatedItems = workoutItems.map((item: WorkoutItem) => 
        item.id === id ? { ...item, [field]: value } : item
      );
      setWorkoutItems(updatedItems);
      return;
    }
    
    try {
      let updatedItem;
      if (field === 'logged') {
        updatedItem = await supabaseWorkoutService.updateLoggedValue(id, value);
      } else {
        updatedItem = await supabaseWorkoutService.updateWorkoutItem(id, { [field]: value });
      }
      
      setWorkoutItems(prev => 
        prev.map(item => 
          item.id === id ? updatedItem : item
        )
      );
    } catch (error) {
      console.error('Failed to update workout item:', error);
      // Fallback to local update if database fails
      const updatedItems = workoutItems.map((item: WorkoutItem) => 
        item.id === id ? { ...item, [field]: value } : item
      );
      setWorkoutItems(updatedItems);
    }
  };

  const workoutProgress = workoutItems.length > 0 
    ? (workoutItems.filter(item => item.completed).length / workoutItems.length) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="w-full relative">
        <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
          <Card className="mb-24 bg-red-900/20 border-red-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-400">
                <Dumbbell className="h-5 w-5 mr-2" />
                🏋️‍♂️ Home Workout Objective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-red-300">
                Loading workout data...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-gray-900">
      {/* Progress Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50"></div>

      <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        {/* Animated Date Header */}
        <AnimatedDateHeader
          selectedDate={selectedDate}
          earnedXP={0}
          potentialXP={0}
          currentLevel={1}
          streakDays={0}
          badgeCount={0}
          colorScheme="red"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-24 bg-red-900/20 border-red-700/50">
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
            <CardContent className="pb-24">
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
                <div className="flex items-start space-x-3 p-3 bg-red-900/20 border border-red-700/30 rounded-xl hover:border-red-600/50 transition-all duration-300 group">
                  
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
                        <div className="flex gap-1.5 w-full">
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
      </div>
    </div>
  );
};