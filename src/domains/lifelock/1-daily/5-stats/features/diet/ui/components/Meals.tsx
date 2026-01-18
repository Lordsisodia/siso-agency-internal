/**
 * Meals Component - Enhanced Version
 *
 * Beautiful meal logging with:
 * - Daily summary dashboard
 * - Visual timeline layout
 * - Quick-add templates
 * - Calorie estimation
 * - Meal completion tracking
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Coffee, Soup, UtensilsCrossed, Apple, Plus, Clock, Flame, Check, X, ChevronDown, ChevronUp, Martini } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { useNutritionSupabase } from '@/lib/domains/lifelock/1-daily/5-stats/domain/useNutritionSupabase';
import { format } from 'date-fns';

interface MealsProps {
  selectedDate: Date;
}

// Meal type configuration
const MEAL_TYPES = {
  breakfast: {
    label: 'Breakfast',
    icon: Coffee,
    time: '7:30 AM',
    color: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-500/20',
    textColor: 'text-orange-300',
    emoji: '☀️'
  },
  lunch: {
    label: 'Lunch',
    icon: Soup,
    time: '12:30 PM',
    color: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-500/20',
    textColor: 'text-blue-300',
    emoji: '🌤️'
  },
  dinner: {
    label: 'Dinner',
    icon: UtensilsCrossed,
    time: '7:00 PM',
    color: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-500/20',
    textColor: 'text-purple-300',
    emoji: '🌙'
  },
  snacks: {
    label: 'Snacks',
    icon: Apple,
    time: 'Throughout day',
    color: 'from-green-500 to-emerald-500',
    bgLight: 'bg-green-500/20',
    textColor: 'text-green-300',
    emoji: '🍎'
  },
  drinks: {
    label: 'Drinks',
    icon: Martini,
    time: 'Throughout day',
    color: 'from-cyan-500 to-blue-500',
    bgLight: 'bg-cyan-500/20',
    textColor: 'text-cyan-300',
    emoji: '🥤'
  }
};

// Quick-add meal templates
const MEAL_TEMPLATES = {
  breakfast: [
    { name: 'Oatmeal with berries', calories: 320, protein: 12 },
    { name: 'Eggs and toast', calories: 380, protein: 22 },
    { name: 'Greek yogurt parfait', calories: 280, protein: 18 },
    { name: 'Avocado toast', calories: 350, protein: 10 }
  ],
  lunch: [
    { name: 'Grilled chicken salad', calories: 450, protein: 35 },
    { name: 'Turkey sandwich', calories: 520, protein: 30 },
    { name: 'Quinoa bowl', calories: 480, protein: 18 },
    { name: 'Soup and bread', calories: 380, protein: 15 }
  ],
  dinner: [
    { name: 'Salmon with veggies', calories: 550, protein: 40 },
    { name: 'Chicken stir-fry', calories: 480, protein: 35 },
    { name: 'Pasta primavera', calories: 520, protein: 18 },
    { name: 'Steak and potatoes', calories: 650, protein: 45 }
  ],
  snacks: [
    { name: 'Apple + peanut butter', calories: 180, protein: 5 },
    { name: 'Greek yogurt', calories: 120, protein: 15 },
    { name: 'Mixed nuts', calories: 200, protein: 6 },
    { name: 'Protein shake', calories: 180, protein: 25 },
    { name: 'Cheese + crackers', calories: 220, protein: 8 }
  ],
  drinks: [
    { name: 'Water (500ml)', calories: 0, protein: 0 },
    { name: 'Black coffee', calories: 5, protein: 0 },
    { name: 'Green tea', calories: 2, protein: 0 },
    { name: 'Protein shake', calories: 180, protein: 25 },
    { name: 'Smoothie', calories: 200, protein: 5 }
  ]
};

// Simple calorie estimation from text
const estimateCalories = (text: string): number => {
  const lowerText = text.toLowerCase();

  // Common foods with their approximate calories
  const foods: Record<string, number> = {
    'oatmeal': 150, 'eggs': 70, 'toast': 80, 'bread': 80,
    'yogurt': 100, 'fruit': 60, 'banana': 105, 'apple': 95,
    'chicken': 165, 'salad': 150, 'sandwich': 350, 'soup': 150,
    'rice': 130, 'pasta': 220, 'salmon': 208, 'steak': 271,
    'vegetables': 50, 'veggies': 50, 'nuts': 180, 'almonds': 160,
    'cheese': 113, 'crackers': 120, 'shake': 180, 'smoothie': 200,
    'burger': 500, 'pizza': 285, 'taco': 250, 'burrito': 400
  };

  let totalCalories = 0;
  const words = lowerText.split(/\s+/);

  for (const word of words) {
    const cleanWord = word.replace(/[,.;:!?]/g, '');
    if (foods[cleanWord]) {
      totalCalories += foods[cleanWord];
    }
  }

  // Base estimate if no known foods found
  return totalCalories > 0 ? totalCalories : 350;
};

// Simple protein estimation (grams)
const estimateProtein = (text: string): number => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('chicken') || lowerText.includes('turkey')) return 30;
  if (lowerText.includes('salmon') || lowerText.includes('fish') || lowerText.includes('steak')) return 35;
  if (lowerText.includes('eggs')) return 12;
  if (lowerText.includes('yogurt')) return 15;
  if (lowerText.includes('nuts') || lowerText.includes('almonds')) return 6;
  if (lowerText.includes('cheese')) return 8;
  if (lowerText.includes('protein') || lowerText.includes('shake')) return 25;

  return 10; // Default
};

export const Meals: React.FC<MealsProps> = ({ selectedDate }) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  const { nutrition, loading, updateMeals } = useNutritionSupabase(
    internalUserId || '',
    dateKey
  );

  const [meals, setMeals] = useState(nutrition.meals);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState<string | null>(null);
  const hasLoadedInitialData = React.useRef(false);

  // Update local state when nutrition data loads from server
  useEffect(() => {
    if (!loading && !hasLoadedInitialData.current) {
      setMeals(nutrition.meals);
      hasLoadedInitialData.current = true;
    }
  }, [nutrition.meals, loading]);

  // Handle meal changes
  const handleMealChange = (meal: keyof typeof meals, value: string) => {
    const newMeals = { ...meals, [meal]: value };
    setMeals(newMeals);

    // Save to Supabase
    if (internalUserId && hasLoadedInitialData.current) {
      updateMeals(newMeals);
    }
  };

  // Calculate total calories for the day
  const dailyTotals = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let mealsLogged = 0;

    (Object.keys(meals) as Array<keyof typeof meals>).forEach(mealKey => {
      const mealText = meals[mealKey];
      if (mealText && mealText.trim().length > 0) {
        totalCalories += estimateCalories(mealText);
        totalProtein += estimateProtein(mealText);
        mealsLogged++;
      }
    });

    return { totalCalories, totalProtein, mealsLogged };
  }, [meals]);

  // Get completion percentage
  const completionPercentage = (dailyTotals.mealsLogged / 4) * 100;

  // Add meal from template
  const addTemplate = (mealType: keyof typeof meals, template: { name: string; calories: number; protein: number }) => {
    const currentMeal = meals[mealType];
    const newMeal = currentMeal
      ? `${currentMeal}\n• ${template.name} (~${template.calories} cal)`
      : `• ${template.name} (~${template.calories} cal)`;

    handleMealChange(mealType, newMeal);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Meal Timeline - 5 Main Meal Cards (Breakfast, Lunch, Dinner, Snacks, Drinks) */}
      <div className="space-y-4">
        {(Object.entries(MEAL_TYPES) as [keyof typeof MEAL_TYPES, typeof MEAL_TYPES[keyof typeof MEAL_TYPES]][])
          .sort(([, a], [, b]) => {
            const order = ['breakfast', 'lunch', 'dinner', 'snacks', 'drinks'];
            return order.indexOf(a.label.toLowerCase()) - order.indexOf(b.label.toLowerCase());
          })
          .map(([mealKey, mealConfig], index) => {
            const Icon = mealConfig.icon;
            const mealValue = meals[mealKey] || '';
            const hasContent = mealValue.trim().length > 0;
            const estimatedCalories = hasContent ? estimateCalories(mealValue) : 0;
            const estimatedProtein = hasContent ? estimateProtein(mealValue) : 0;
            const isExpanded = expandedMeal === mealKey;
            const showingTemplates = showTemplates === mealKey;

            return (
              <motion.div
                key={mealKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-2 transition-all overflow-hidden ${
                  hasContent
                    ? 'border-green-500/60 shadow-lg shadow-green-500/10'
                    : 'border-green-600/40'
                }`}>
                  <CardContent className="relative p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${mealConfig.color} border border-white/10 shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-100">{mealConfig.emoji} {mealConfig.label}</span>
                            {hasContent && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 rounded-full bg-green-400"
                              />
                            )}
                          </div>
                          <div className={`text-xs ${mealConfig.textColor} font-medium flex items-center gap-1.5`}>
                            <Clock className="h-3 w-3" />
                            {mealConfig.time}
                          </div>
                        </div>
                      </div>

                      {hasContent && (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-300">
                              ~{estimatedCalories} cal
                            </div>
                            <div className="text-xs text-green-300/60">
                              {estimatedProtein}g protein
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpandedMeal(isExpanded ? null : mealKey)}
                            className="text-green-400 hover:bg-green-900/30"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Meal Content */}
                    <AnimatePresence>
                      {isExpanded && hasContent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 bg-green-950/50 rounded-lg p-4 border border-green-600/30"
                        >
                          <div className="text-sm text-green-100 whitespace-pre-wrap leading-relaxed">
                            {mealValue}
                          </div>
                          <div className="mt-3 pt-3 border-t border-green-600/20 flex items-center gap-2 text-xs text-green-300/60">
                            <Check className="h-3.5 w-3.5 text-green-400" />
                            <span>Logged • {estimatedCalories} calories • {estimatedProtein}g protein</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Input Area */}
                    {!isExpanded && (
                      <div className="relative">
                        <textarea
                          value={mealValue}
                          onChange={(e) => handleMealChange(mealKey, e.target.value)}
                          placeholder={`What did you have for ${mealConfig.label.toLowerCase()}?`}
                          className="w-full min-h-[80px] bg-green-950/60 border-green-600/40 text-white placeholder:text-green-200/40
                            focus:border-green-400/60 focus:ring-green-400/20 transition-all duration-200
                            resize-none rounded-lg text-sm leading-relaxed p-4 pr-12"
                        />
                        {mealValue && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMealChange(mealKey, '')}
                            className="absolute top-2 right-2 text-green-400/60 hover:text-red-400 hover:bg-red-900/20 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Quick Add Templates - Pill-style buttons */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-green-300/80">Quick Add:</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowTemplates(showingTemplates ? null : mealKey)}
                          className={`text-xs ${mealConfig.textColor} hover:bg-green-900/30 h-7 px-3`}
                        >
                          {showingTemplates ? 'Hide' : 'Show templates'}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showingTemplates && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            {MEAL_TEMPLATES[mealKey].map((template, idx) => (
                              <motion.button
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => addTemplate(mealKey, template)}
                                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${mealConfig.bgLight} ${mealConfig.textColor}
                                  border-green-600/30 hover:border-green-500/60 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                                  flex items-center justify-between group`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${mealConfig.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                                    <Plus className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="text-xs font-semibold">{template.name}</span>
                                </div>
                                <div className="text-xs opacity-70 font-medium">~{template.calories} cal</div>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Snacks - Show multiple entries */}
                    {mealKey === 'snacks' && hasContent && (
                      <div className="mt-3 pt-3 border-t border-green-600/20">
                        <div className="text-xs text-green-300/60 mb-2">
                          {mealValue.split('\n').filter(line => line.trim()).length} snack{mealValue.split('\n').filter(line => line.trim()).length !== 1 ? 's' : ''} logged
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </div>
    </motion.div>
  );
};
