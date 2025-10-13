/**
 * Photo Nutrition Feature - Type Definitions
 */

export interface FoodPhoto {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  photoUrl: string;
  timestamp: string; // ISO timestamp
  aiDescription: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MacroEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description: string;
}

export interface DailyMacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  photoCount: number;
}

export interface PhotoUploadResult {
  success: boolean;
  photoUrl?: string;
  error?: string;
}

export interface VisionAnalysisResult {
  success: boolean;
  macros?: MacroEstimate;
  error?: string;
}
