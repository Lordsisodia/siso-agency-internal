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
  useEffect(() => {
    if (hasLoadedInitialData.current) {
      console.log('🔄 [NUTRITION] Meals changed, saving...', meals);
      saveData(meals, dailyTotals);
    }
  }, [meals, dailyTotals, saveData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);


  return (
    <div className="min-h-screen w-full bg-gray-900 relative">
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
            <div>
              <label className="text-white text-sm font-medium">Breakfast:</label>
              <Textarea
                value={meals.breakfast}
                onChange={(e) => setMeals(prev => ({ ...prev, breakfast: e.target.value }))}
                className="mt-1 bg-pink-900/40 border-pink-600/50 text-white placeholder:text-pink-200/60 focus:border-pink-400 focus:ring-pink-400/20"
                placeholder="Enter breakfast details..."
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium">Lunch:</label>
              <Textarea
                value={meals.lunch}
                onChange={(e) => setMeals(prev => ({ ...prev, lunch: e.target.value }))}
                className="mt-1 bg-pink-900/40 border-pink-600/50 text-white placeholder:text-pink-200/60 focus:border-pink-400 focus:ring-pink-400/20"
                placeholder="Enter lunch details..."
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium">Dinner:</label>
              <Textarea
                value={meals.dinner}
                onChange={(e) => setMeals(prev => ({ ...prev, dinner: e.target.value }))}
                className="mt-1 bg-pink-900/40 border-pink-600/50 text-white placeholder:text-pink-200/60 focus:border-pink-400 focus:ring-pink-400/20"
                placeholder="Enter dinner details..."
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium">Snacks:</label>
              <Textarea
                value={meals.snacks}
                onChange={(e) => setMeals(prev => ({ ...prev, snacks: e.target.value }))}
                className="mt-1 bg-pink-900/40 border-pink-600/50 text-white placeholder:text-pink-200/60 focus:border-pink-400 focus:ring-pink-400/20"
                placeholder="Enter snack details..."
              />
            </div>
          </div>

          <div className="border-t border-gray-600 my-4"></div>
          
          <h4 className="font-semibold text-white mb-5">Daily Totals:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'calories', label: 'Calories', unit: 'cal', steps: [100, 250, 500] },
              { key: 'protein', label: 'Protein', unit: 'g', steps: [10, 25, 50] },
              { key: 'carbs', label: 'Carbs', unit: 'g', steps: [20, 50, 100] },
              { key: 'fats', label: 'Fats', unit: 'g', steps: [5, 15, 30] }
            ].map((macro) => (
              <motion.div 
                key={macro.key}
                className="bg-gradient-to-br from-pink-900/15 via-pink-800/10 to-pink-700/5 backdrop-blur-sm border border-pink-700/20 rounded-lg p-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <label className="text-pink-200 text-sm font-medium block mb-2">
                  {macro.label}:
                </label>
                
                {/* Current Value Display */}
                <div className="flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-white">
                    {dailyTotals[macro.key as keyof typeof dailyTotals] || '0'}
                  </span>
                  <span className="text-pink-300 text-sm ml-1">{macro.unit}</span>
                </div>
                
                {/* Quick Add Buttons */}
                <div className="flex gap-2 mb-4">
                  {macro.steps.map((step) => (
                    <Button
                      key={step}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const current = parseInt(dailyTotals[macro.key as keyof typeof dailyTotals] || '0');
                        setDailyTotals(prev => ({ 
                          ...prev, 
                          [macro.key]: (current + step).toString()
                        }));
                      }}
                      className="flex-1 h-9 text-sm bg-pink-900/20 border-pink-600/40 text-pink-200 hover:bg-pink-800/30 hover:border-pink-500/60 transition-all duration-200 rounded-md"
                    >
                      +{step}
                    </Button>
                  ))}
                </div>
                
                {/* Increment/Decrement Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const current = parseInt(dailyTotals[macro.key as keyof typeof dailyTotals] || '0');
                      if (current > 0) {
                        setDailyTotals(prev => ({ 
                          ...prev, 
                          [macro.key]: Math.max(0, current - 1).toString()
                        }));
                      }
                    }}
                    className="w-9 h-9 p-0 bg-pink-900/20 border-pink-600/40 text-pink-300 hover:bg-pink-800/30 hover:border-pink-500/60 rounded-md"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    value={dailyTotals[macro.key as keyof typeof dailyTotals]}
                    onChange={(e) => setDailyTotals(prev => ({ ...prev, [macro.key]: e.target.value }))}
                    className="flex-1 h-9 text-center bg-pink-900/40 border-pink-600/50 text-white placeholder:text-pink-200/60 focus:border-pink-400 focus:ring-pink-400/20 rounded-md text-base font-medium"
                    placeholder="0"
                  />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const current = parseInt(dailyTotals[macro.key as keyof typeof dailyTotals] || '0');
                      setDailyTotals(prev => ({ 
                        ...prev, 
                        [macro.key]: (current + 1).toString()
                      }));
                    }}
                    className="w-9 h-9 p-0 bg-pink-900/20 border-pink-600/40 text-pink-300 hover:bg-pink-800/30 hover:border-pink-500/60 rounded-md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
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