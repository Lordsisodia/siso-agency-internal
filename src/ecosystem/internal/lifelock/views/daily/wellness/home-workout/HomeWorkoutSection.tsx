import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import { format } from 'date-fns';
import { supabaseWorkoutService } from '@/services/supabaseWorkoutService';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { CleanDateNav } from '@/ecosystem/internal/lifelock/views/daily/_shared/components';
import { WorkoutItemCard } from './components/WorkoutItemCard';

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
          { id: 'temp-' + Date.now() + '-2', title: 'Sit-ups', completed: false, target: '50 reps', logged: '0' },
          { id: 'temp-' + Date.now() + '-3', title: 'Squats', completed: false, target: '100 reps', logged: '0' },
          { id: 'temp-' + Date.now() + '-4', title: 'Planks', completed: false, target: '2 minutes', logged: '0' },
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
      <div className="w-full">
        <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
          <Card className="mb-24 bg-red-900/20 border-red-700/50">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full bg-red-500/30" />
                  <Skeleton className="h-5 w-48 bg-red-400/20" />
                </div>
                <Skeleton className="h-4 w-20 bg-red-400/20" />
              </div>
              <Skeleton className="h-2 w-full bg-red-400/20 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-4 pb-24">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`workout-skeleton-${index}`}
                  className="p-4 rounded-xl border border-red-700/40 bg-red-900/30 space-y-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full bg-red-500/20" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-red-400/20" />
                        <Skeleton className="h-3 w-48 bg-red-400/10" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 bg-red-400/20 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full bg-red-400/10 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
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
            {workoutItems.map((item) => (
              <WorkoutItemCard
                key={item.id}
                item={item}
                quickReps={getQuickReps(item.title)}
                onToggle={() => toggleItem(item.id)}
                onUpdateTarget={(value) => updateItemField(item.id, 'target', value)}
                onUpdateLogged={(value) => updateItemField(item.id, 'logged', value)}
              />
            ))}
          </div>
            </CardContent>
          </Card>
    </motion.div>
      </div>
    </div>
  );
};