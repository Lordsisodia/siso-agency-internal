/**
 * Photo Nutrition Tracker - Main Section Component
 * Clean AI-powered nutrition tracking with photo analysis
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { usePhotoNutrition } from '../hooks/usePhotoNutrition';
import { PhotoCapture } from './PhotoCapture';
import { FoodPhotoCard } from './FoodPhotoCard';
import { DailyMacroSummary } from './DailyMacroSummary';
import { calculateTotalNutritionXP } from '../../views/daily/wellness/xpCalculations';
import { XPPill } from '../../views/daily/morning-routine/components/XPPill';

interface PhotoNutritionTrackerProps {
  selectedDate: Date;
}

export const PhotoNutritionTracker: React.FC<PhotoNutritionTrackerProps> = ({
  selectedDate
}) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  // Real data from hook
  const {
    photos,
    totals,
    loading,
    uploading,
    error,
    uploadPhoto,
    deletePhoto
  } = usePhotoNutrition(internalUserId || '', selectedDate);

  // Optional: Daily goals (can be user-configured later)
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

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
          <Card className="mb-24 bg-pink-900/20 border-pink-700/50">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full bg-pink-500/30" />
                  <Skeleton className="h-5 w-48 bg-pink-400/20" />
                </div>
                <Skeleton className="h-4 w-20 bg-pink-400/20" />
              </div>
              <Skeleton className="h-3 w-3/4 bg-pink-400/20" />
            </CardHeader>
            <CardContent className="space-y-6 pb-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`nutrition-summary-skeleton-${index}`}
                    className="p-4 rounded-xl border border-pink-700/40 bg-pink-900/30 space-y-3"
                  >
                    <Skeleton className="h-4 w-1/2 bg-pink-400/20" />
                    <Skeleton className="h-8 w-20 bg-pink-400/30" />
                    <Skeleton className="h-2 w-full bg-pink-400/20 rounded-full" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`nutrition-photo-skeleton-${index}`}
                    className="h-40 w-full bg-pink-900/30 border border-pink-700/40 rounded-2xl"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-24 bg-pink-900/20 border-pink-700/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-pink-400">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  📸 AI Nutrition Tracker
                </div>
                <XPPill
                  xp={(() => {
                    // Calculate XP from logged meals
                    const meals = photos.map(photo => ({
                      hasPhoto: true,
                      calories: photo.calories,
                      protein: photo.protein,
                      isHealthy: photo.is_healthy_meal,
                      isBalanced: photo.is_balanced
                    }));
                    const result = calculateTotalNutritionXP(meals, totals);
                    return result.total;
                  })()}
                  earned={photos.length >= 3}
                  showGlow={photos.length >= 3}
                />
              </CardTitle>
              <p className="text-sm text-pink-300/60 mt-2">
                Snap a photo of your meal and let AI analyze the nutrition automatically
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pb-24">
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-300">{error}</div>
                </motion.div>
              )}

              {/* Photo Capture Buttons */}
              <PhotoCapture
                onPhotoSelect={handlePhotoSelect}
                isUploading={uploading}
              />

              {/* Daily Summary */}
              <DailyMacroSummary
                totals={totals}
                goals={dailyGoals}
              />

              {/* Meals Section */}
              {photos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-pink-300 mb-4 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Today's Meals
                  </h3>

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
                </div>
              )}

              {/* Empty State */}
              {photos.length === 0 && !uploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Camera className="h-16 w-16 text-pink-400/30 mx-auto mb-4" />
                  <p className="text-pink-300/60">
                    No meals logged yet today
                  </p>
                  <p className="text-sm text-pink-400/40 mt-2">
                    Take a photo of your food to get started
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
