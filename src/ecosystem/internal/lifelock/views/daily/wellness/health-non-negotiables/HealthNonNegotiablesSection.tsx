import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { format } from 'date-fns';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { useNutritionSupabase } from '@/shared/hooks/useNutritionSupabase';
import { CleanDateNav } from '@/ecosystem/internal/lifelock/views/daily/_shared/components';
import { MealInput } from './components/MealInput';
import { MacroTracker } from './components/MacroTracker';

interface HealthNonNegotiablesSectionProps {
  selectedDate: Date;
}

export const HealthNonNegotiablesSection: React.FC<HealthNonNegotiablesSectionProps> = ({
  selectedDate
}) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  
  const { nutrition, loading, saving, updateMeals, updateMacros } = useNutritionSupabase(
    internalUserId || '', 
    dateKey
  );

  const [meals, setMeals] = useState(nutrition.meals);
  const [dailyTotals, setDailyTotals] = useState(nutrition.macros);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedInitialData = useRef(false);

  // Update local state when nutrition data loads from server
  useEffect(() => {
    if (!loading && !hasLoadedInitialData.current) {
      setMeals(nutrition.meals);
      setDailyTotals(nutrition.macros);
      hasLoadedInitialData.current = true;
    }
  }, [nutrition.meals, nutrition.macros, loading]);

  // Handle saving with proper debouncing to prevent loops
  const saveData = useCallback(async (newMeals: typeof meals, newMacros: typeof dailyTotals) => {
    if (!hasLoadedInitialData.current || !internalUserId || saving) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('🍽️ [NUTRITION] Saving nutrition data:', { meals: newMeals, macros: newMacros });
        await updateMeals(newMeals);
        await updateMacros(newMacros);
        console.log('✅ [NUTRITION] Successfully saved nutrition data');
      } catch (error) {
        console.error('❌ [NUTRITION] Error saving nutrition data:', error);
      }
    }, 1000);
  }, [internalUserId, saving, updateMeals, updateMacros]);

  // Save when meals change (from user input only)
  // Note: saveData is memoized with useCallback and doesn't need to be in deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hasLoadedInitialData.current) {
      console.log('🔄 [NUTRITION] Meals changed, saving...', meals);
      saveData(meals, dailyTotals);
    }
  }, [meals, dailyTotals]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);


  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-24 bg-pink-900/20 border-pink-700/50">
        <CardHeader>
          <CardTitle className="flex items-center text-pink-400">
            <Heart className="h-5 w-5 mr-2" />
            💖 Nutrition Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-24">
          
          {/* Daily Calorie & Macro Tracker */}
          <h3 className="font-semibold text-white mb-5">Daily Calorie & Macro Tracker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
            <MealInput
              label="Breakfast"
              value={meals.breakfast}
              onChange={(value) => setMeals(prev => ({ ...prev, breakfast: value }))}
              placeholder="Enter breakfast details..."
            />
            <MealInput
              label="Lunch"
              value={meals.lunch}
              onChange={(value) => setMeals(prev => ({ ...prev, lunch: value }))}
              placeholder="Enter lunch details..."
            />
            <MealInput
              label="Dinner"
              value={meals.dinner}
              onChange={(value) => setMeals(prev => ({ ...prev, dinner: value }))}
              placeholder="Enter dinner details..."
            />
            <MealInput
              label="Snacks"
              value={meals.snacks}
              onChange={(value) => setMeals(prev => ({ ...prev, snacks: value }))}
              placeholder="Enter snack details..."
            />
          </div>

          <div className="border-t border-gray-600 my-4"></div>
          
          <h4 className="font-semibold text-white mb-5">Daily Totals:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MacroTracker
              label="Calories"
              value={dailyTotals.calories}
              unit="cal"
              steps={[100, 250, 500]}
              onChange={(value) => setDailyTotals(prev => ({ ...prev, calories: value }))}
            />
            <MacroTracker
              label="Protein"
              value={dailyTotals.protein}
              unit="g"
              steps={[10, 25, 50]}
              onChange={(value) => setDailyTotals(prev => ({ ...prev, protein: value }))}
            />
            <MacroTracker
              label="Carbs"
              value={dailyTotals.carbs}
              unit="g"
              steps={[20, 50, 100]}
              onChange={(value) => setDailyTotals(prev => ({ ...prev, carbs: value }))}
            />
            <MacroTracker
              label="Fats"
              value={dailyTotals.fats}
              unit="g"
              steps={[5, 15, 30]}
              onChange={(value) => setDailyTotals(prev => ({ ...prev, fats: value }))}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
      </div>
    </div>
  );
};