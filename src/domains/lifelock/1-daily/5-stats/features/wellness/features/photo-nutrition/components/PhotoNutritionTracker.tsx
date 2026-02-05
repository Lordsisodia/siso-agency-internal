/**
 * Nutrition Tracker - Main Section Component
 * Clean nutrition tracking with photo analysis and manual entry
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertCircle, Apple, ChevronDown, ChevronUp, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { usePhotoNutrition } from '../hooks/usePhotoNutrition';
import { useNutritionSupabase } from '@/domains/lifelock/1-daily/5-stats/domain/useNutritionSupabase';
import { PhotoCapture } from './PhotoCapture';
import { FoodPhotoCard } from './FoodPhotoCard';
import { DailyMacroSummary } from './DailyMacroSummary';
import { MealInput } from '@/domains/lifelock/1-daily/5-stats/features/wellness/ui/components/MealInput';
import { MacroTracker } from '@/domains/lifelock/1-daily/5-stats/features/wellness/ui/components/MacroTracker';
import { calculateTotalNutritionXP } from '../../../domain/xpCalculations';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PhotoNutritionTrackerProps {
  selectedDate: Date;
}

export const PhotoNutritionTracker: React.FC<PhotoNutritionTrackerProps> = ({
  selectedDate
}) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Photo nutrition hook
  const {
    photos,
    totals,
    loading: photosLoading,
    uploading,
    error: photosError,
    uploadPhoto,
    deletePhoto
  } = usePhotoNutrition(internalUserId || '', selectedDate);

  // Manual nutrition hook
  const {
    nutrition,
    loading: nutritionLoading,
    updateMeals,
    updateMacros
  } = useNutritionSupabase(internalUserId || '', dateKey);

  // Local state for manual entry
  const [meals, setMeals] = useState(nutrition.meals);
  const [macros, setMacros] = useState(nutrition.macros);
  const [activeTab, setActiveTab] = useState<'photos' | 'manual'>('photos');
  const [expandedSections, setExpandedSections] = useState({
    meals: true,
    macros: true,
    photos: true
  });

  // Update local state when nutrition loads
  React.useEffect(() => {
    setMeals(nutrition.meals);
    setMacros(nutrition.macros);
  }, [nutrition]);

  const loading = photosLoading || nutritionLoading;

  // Daily goals
  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 70
  };

  const handlePhotoSelect = async (file: File) => {
    try {
      await uploadPhoto(file);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await deletePhoto(id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleMealChange = (mealType: keyof typeof meals, value: string) => {
    const newMeals = { ...meals, [mealType]: value };
    setMeals(newMeals);
    updateMeals(newMeals);
  };

  const handleMacroChange = (macroType: keyof typeof macros, value: string) => {
    const newMacros = { ...macros, [macroType]: value };
    setMacros(newMacros);
    updateMacros(newMacros);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate combined totals (photos + manual)
  const manualCalories = parseInt(macros.calories) || 0;
  const manualProtein = parseInt(macros.protein) || 0;
  const manualCarbs = parseInt(macros.carbs) || 0;
  const manualFats = parseInt(macros.fats) || 0;

  const combinedTotals = {
    calories: totals.calories + manualCalories,
    protein: totals.protein + manualProtein,
    carbs: totals.carbs + manualCarbs,
    fats: totals.fats + manualFats,
    photoCount: totals.photoCount
  };

  // Calculate XP
  const mealsForXP = photos.map(photo => ({
    hasPhoto: true,
    calories: photo.calories,
    protein: photo.protein,
    isHealthy: false,
    isBalanced: false
  }));

  const xpResult = calculateTotalNutritionXP(mealsForXP, totals);

  if (loading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
          <Card className="mb-24 bg-gradient-to-br from-green-950/60 via-emerald-900/60 to-green-950/60 border border-green-500/40 shadow-xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full bg-green-500/30" />
                  <Skeleton className="h-5 w-48 bg-green-400/20" />
                </div>
                <Skeleton className="h-4 w-20 bg-green-400/20" />
              </div>
              <Skeleton className="h-3 w-3/4 bg-green-400/20" />
            </CardHeader>
            <CardContent className="space-y-6 pb-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`nutrition-summary-skeleton-${index}`}
                    className="p-4 rounded-xl border border-green-500/30 bg-slate-950/40 space-y-3 backdrop-blur-lg"
                  >
                    <Skeleton className="h-4 w-1/2 bg-green-400/20" />
                    <Skeleton className="h-8 w-20 bg-green-400/30" />
                    <Skeleton className="h-2 w-full bg-green-400/20 rounded-full" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`nutrition-photo-skeleton-${index}`}
                    className="h-40 w-full bg-slate-950/40 border border-green-500/30 rounded-2xl"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="px-3 py-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Apple className="h-4 w-4 text-green-400" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-white tracking-tight">Nutrition</h1>
                <p className="text-xs text-white/60">Track your meals and macros</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XPPill
                xp={xpResult.total}
                earned={photos.length >= 3}
                showGlow={photos.length >= 3}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-24 bg-gradient-to-br from-green-950/40 via-emerald-900/40 to-green-950/40 border border-green-500/30 shadow-xl">
            <CardContent className="space-y-6 pb-24 pt-6">
              {/* Error Alert */}
              {photosError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-300">{photosError}</div>
                </motion.div>
              )}

              {/* Daily Macro Summary */}
              <DailyMacroSummary
                totals={combinedTotals}
                goals={dailyGoals}
              />

              {/* Tab Switcher */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    activeTab === 'photos'
                      ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-green-900/30 text-green-300/70 hover:bg-green-900/50 hover:text-green-200"
                  )}
                >
                  <Camera className="h-4 w-4 inline mr-2" />
                  Photo Log
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    activeTab === 'manual'
                      ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-green-900/30 text-green-300/70 hover:bg-green-900/50 hover:text-green-200"
                  )}
                >
                  <Utensils className="h-4 w-4 inline mr-2" />
                  Manual Entry
                </button>
              </div>

              {/* Photo Log Tab */}
              {activeTab === 'photos' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Photo Capture Buttons */}
                  <PhotoCapture
                    onPhotoSelect={handlePhotoSelect}
                    isUploading={uploading}
                  />

                  {/* Meals Section */}
                  <div>
                    <div
                      className="flex items-center justify-between mb-4 cursor-pointer"
                      onClick={() => toggleSection('photos')}
                    >
                      <h3 className="text-lg font-semibold text-green-100 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-green-200" />
                        Photo Meals
                        <span className="text-xs text-green-400/70 bg-green-950/50 px-2 py-1 rounded-full">
                          {photos.length}
                        </span>
                      </h3>
                      {expandedSections.photos ? (
                        <ChevronUp className="h-5 w-5 text-green-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-green-400" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedSections.photos && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {photos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <AnimatePresence mode="popLayout">
                                {photos.map((photo) => (
                                  <FoodPhotoCard
                                    key={photo.id}
                                    photo={photo}
                                    onDelete={handleDeletePhoto}
                                  />
                                ))}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12 bg-green-900/20 rounded-xl border border-green-600/30"
                            >
                              <Camera className="h-16 w-16 text-green-400/30 mx-auto mb-4" />
                              <p className="text-green-100 font-medium">
                                No photo meals logged
                              </p>
                              <p className="text-sm text-green-200/60 mt-2">
                                Take a photo of your food to get started
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Manual Entry Tab */}
              {activeTab === 'manual' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Meals Input Section */}
                  <Card className="bg-green-900/20 border-green-700/40">
                    <CardHeader
                      className="p-4 cursor-pointer hover:bg-green-900/10 transition-colors"
                      onClick={() => toggleSection('meals')}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-green-100 text-base flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-green-300" />
                          Meals
                        </CardTitle>
                        {expandedSections.meals ? (
                          <ChevronUp className="h-5 w-5 text-green-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                      {expandedSections.meals && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <CardContent className="p-4 pt-0 space-y-4">
                            <MealInput
                              label="Breakfast"
                              value={meals.breakfast}
                              onChange={(value) => handleMealChange('breakfast', value)}
                              placeholder="What did you have for breakfast?"
                            />
                            <MealInput
                              label="Lunch"
                              value={meals.lunch}
                              onChange={(value) => handleMealChange('lunch', value)}
                              placeholder="What did you have for lunch?"
                            />
                            <MealInput
                              label="Dinner"
                              value={meals.dinner}
                              onChange={(value) => handleMealChange('dinner', value)}
                              placeholder="What did you have for dinner?"
                            />
                            <MealInput
                              label="Snacks"
                              value={meals.snacks}
                              onChange={(value) => handleMealChange('snacks', value)}
                              placeholder="Any snacks today?"
                            />
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>

                  {/* Macro Tracker Section */}
                  <Card className="bg-green-900/20 border-green-700/40">
                    <CardHeader
                      className="p-4 cursor-pointer hover:bg-green-900/10 transition-colors"
                      onClick={() => toggleSection('macros')}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-green-100 text-base flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-green-300" />
                          Macros
                        </CardTitle>
                        {expandedSections.macros ? (
                          <ChevronUp className="h-5 w-5 text-green-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                      {expandedSections.macros && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <CardContent className="p-4 pt-0 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <MacroTracker
                                label="Calories"
                                value={parseInt(macros.calories) || 0}
                                unit="kcal"
                                steps={[50, 100, 250]}
                                onChange={(value) => handleMacroChange('calories', value.toString())}
                              />
                              <MacroTracker
                                label="Protein"
                                value={parseInt(macros.protein) || 0}
                                unit="g"
                                steps={[5, 10, 25]}
                                onChange={(value) => handleMacroChange('protein', value.toString())}
                              />
                              <MacroTracker
                                label="Carbs"
                                value={parseInt(macros.carbs) || 0}
                                unit="g"
                                steps={[5, 10, 25]}
                                onChange={(value) => handleMacroChange('carbs', value.toString())}
                              />
                              <MacroTracker
                                label="Fats"
                                value={parseInt(macros.fats) || 0}
                                unit="g"
                                steps={[5, 10, 25]}
                                onChange={(value) => handleMacroChange('fats', value.toString())}
                              />
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
