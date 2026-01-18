/**
 * Photo Nutrition Tracker - Main Section Component
 * Clean AI-powered nutrition tracking with photo analysis
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { usePhotoNutrition } from '../hooks/usePhotoNutrition';
import { PhotoCapture } from './PhotoCapture';
import { FoodPhotoCard } from './FoodPhotoCard';
import { DailyMacroSummary } from './DailyMacroSummary';
import { calculateTotalNutritionXP } from '../../../domain/xpCalculations';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/XPPill';

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
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Error Alert (Highest Priority) */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 flex items-start gap-3"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-red-300">{error}</div>
            </motion.div>
          )}

          {/* Daily Summary (Move UP - shows value immediately) */}
          <DailyMacroSummary
            totals={totals}
            goals={dailyGoals}
          />

          {/* Action Area with Visual Divider */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
              <span className="text-xs font-semibold text-green-400/80 uppercase tracking-wider">
                Add Meal
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
            </div>

            <PhotoCapture
              onPhotoSelect={handlePhotoSelect}
              isUploading={uploading}
            />
          </div>

          {/* Meals Section (Only show when content exists) */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-green-400" aria-hidden="true" />
                  Today's Meals
                  <span className="text-sm font-normal text-white/50">
                    ({photos.length})
                  </span>
                </h3>
              </div>

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

          {/* Enhanced Empty State (Only when truly empty) */}
          {photos.length === 0 && !uploading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-6"
            >
              {/* Animated Icon Container */}
              <div className="relative inline-block mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 flex items-center justify-center"
                >
                  <Camera className="h-12 w-12 text-green-400" aria-hidden="true" />
                </motion.div>

                {/* Floating Badge */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-2 -right-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full px-3 py-1.5 border-2 border-[#121212]"
                >
                  <span className="text-xs font-bold text-white">+30 XP</span>
                </motion.div>
              </div>

              {/* Primary Message */}
              <h3 className="text-xl font-bold text-white mb-2">
                Start Your Nutrition Journey
              </h3>

              {/* Secondary Message */}
              <p className="text-base text-green-200/70 mb-6 max-w-sm mx-auto leading-relaxed">
                Take a photo of any meal and our AI will instantly analyze calories, protein, carbs, and fats.
              </p>

              {/* Value Props */}
              <div className="flex items-center justify-center gap-6 text-sm mb-6">
                <div className="flex items-center gap-2 text-green-300/80">
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Instant Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-green-300/80">
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Auto-Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-green-300/80">
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Earn XP</span>
                </div>
              </div>

              {/* CTA Hint */}
              <div className="inline-flex items-center gap-2 bg-green-950/50 border border-green-500/30 rounded-lg px-4 py-2.5">
                <Camera className="h-4 w-4 text-green-400" aria-hidden="true" />
                <span className="text-sm font-medium text-green-200">
                  Tap a button above to get started
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
