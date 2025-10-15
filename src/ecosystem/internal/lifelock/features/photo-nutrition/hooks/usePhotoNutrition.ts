/**
 * Photo Nutrition Hook
 * Main hook for AI-powered photo-based nutrition tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/shared/lib/supabase';
import { photoStorageService } from '../services/photoStorage.service';
import { visionApiService } from '../services/visionApi.service';
import type { FoodPhoto, DailyMacroTotals } from '../types';

export function usePhotoNutrition(userId: string, date: Date) {
  const [photos, setPhotos] = useState<FoodPhoto[]>([]);
  const [totals, setTotals] = useState<DailyMacroTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    photoCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateKey = format(date, 'yyyy-MM-dd');

  // Load photos for the selected date
  const loadPhotos = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📸 [PHOTO NUTRITION] Loading photos for:', { userId, dateKey });

      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateKey)
        .eq('meal_type', 'photo')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to FoodPhoto format (no photo URLs - just data)
      const mappedPhotos: FoodPhoto[] = (data || []).map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        date: entry.date,
        photoUrl: '', // No photo stored
        timestamp: entry.created_at,
        aiDescription: entry.food_description,
        calories: entry.calories || 0,
        protein: entry.protein_g || 0,
        carbs: entry.carbs_g || 0,
        fats: entry.fats_g || 0,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      }));

      setPhotos(mappedPhotos);

      // Calculate totals
      const dailyTotals = mappedPhotos.reduce(
        (acc, photo) => ({
          calories: acc.calories + photo.calories,
          protein: acc.protein + photo.protein,
          carbs: acc.carbs + photo.carbs,
          fats: acc.fats + photo.fats,
          photoCount: acc.photoCount + 1
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0, photoCount: 0 }
      );

      setTotals(dailyTotals);

      console.log('✅ [PHOTO NUTRITION] Loaded photos:', mappedPhotos.length);

    } catch (err) {
      console.error('❌ [PHOTO NUTRITION] Error loading photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [userId, dateKey]);

  // Analyze photo with AI and save macro data (no photo storage)
  const uploadPhoto = useCallback(async (file: File): Promise<void> => {
    if (!userId) throw new Error('User ID required');

    try {
      setUploading(true);
      setError(null);

      console.log('📸 [PHOTO NUTRITION] Starting analysis:', file.name);

      // Step 1: Convert photo to base64 for direct API call
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('✅ [PHOTO NUTRITION] Photo converted to base64');

      // Step 2: Analyze with AI Vision (no storage needed)
      const analysisResult = await visionApiService.analyzeFoodPhoto(base64);

      if (!analysisResult.success || !analysisResult.macros) {
        throw new Error(analysisResult.error || 'AI analysis failed');
      }

      const { calories, protein, carbs, fats, description } = analysisResult.macros;
      console.log('✅ [PHOTO NUTRITION] AI analysis complete:', analysisResult.macros);

      // Step 3: Save only the data to database (no photo URL)
      const { error: dbError } = await supabase
        .from('nutrition_entries')
        .insert({
          user_id: userId,
          date: dateKey,
          meal_type: 'photo',
          meal_time: new Date().toTimeString().slice(0, 5), // HH:MM format
          food_description: description,
          calories,
          protein_g: protein,
          carbs_g: carbs,
          fats_g: fats,
          ai_model_used: 'gpt-4o-mini',
          is_estimate: true,
          confidence_score: 0.85,
          data_source: 'photo_analysis' // Must match DB constraint
        });

      if (dbError) throw dbError;

      console.log('✅ [PHOTO NUTRITION] Saved to database');

      // Reload to update UI
      await loadPhotos();

    } catch (err) {
      console.error('❌ [PHOTO NUTRITION] Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [userId, dateKey, loadPhotos]);

  // Delete meal entry
  const deletePhoto = useCallback(async (photoId: string): Promise<void> => {
    if (!userId) throw new Error('User ID required');

    try {
      setError(null);

      console.log('🗑️ [PHOTO NUTRITION] Deleting meal entry:', photoId);

      // Delete from database only (no photos stored)
      const { error: dbError } = await supabase
        .from('nutrition_entries')
        .delete()
        .eq('id', photoId)
        .eq('user_id', userId); // Security: only delete own entries

      if (dbError) throw dbError;

      console.log('✅ [PHOTO NUTRITION] Meal deleted');

      // Reload to update UI
      await loadPhotos();

    } catch (err) {
      console.error('❌ [PHOTO NUTRITION] Delete failed:', err);
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    }
  }, [userId, loadPhotos]);

  // Load photos on mount and when date/user changes
  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return {
    photos,
    totals,
    loading,
    uploading,
    error,
    uploadPhoto,
    deletePhoto,
    reload: loadPhotos
  };
}
