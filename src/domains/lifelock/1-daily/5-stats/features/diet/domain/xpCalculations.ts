/**
 * Diet XP Calculations
 *
 * Balanced XP rewards for nutrition tracking
 * - Photo tracking: 80 XP max
 * - Macro tracking: 60 XP max
 * - Meal logging: 40 XP max
 */

/**
 * Calculate nutrition XP from photo tracking
 * Max: 80 XP
 */
export function calculatePhotoNutritionXP(
  photosLogged: number,
  dailyGoal: number = 3
): number {
  if (photosLogged === 0) return 0;

  const percentage = (photosLogged / dailyGoal) * 100;

  if (percentage >= 100) return 80; // Hit goal!
  if (percentage >= 66) return 60;  // 2/3 of goal
  if (percentage >= 33) return 40;  // 1/3 of goal
  return 20; // At least one photo
}

/**
 * Calculate macro tracking XP
 * Max: 60 XP
 */
export function calculateMacroTrackingXP(
  trackedMeals: number,
  totalMeals: number = 4 // breakfast, lunch, dinner, snack
): number {
  if (trackedMeals === 0) return 0;

  const percentage = (trackedMeals / totalMeals) * 100;

  if (percentage >= 100) return 60; // All meals tracked
  if (percentage >= 75) return 45;  // 3/4 meals
  if (percentage >= 50) return 30;  // 2/4 meals
  if (percentage >= 25) return 15;  // 1/4 meals
  return 10; // Partial tracking
}

/**
 * Calculate total daily nutrition XP
 * Combines photo tracking + macro tracking
 */
export function calculateTotalNutritionXP(
  photosLogged: number,
  trackedMeals: number,
  totalMeals: number = 4
): { total: number; photoXP: number; macroXP: number; breakdown: string } {
  const photoXP = calculatePhotoNutritionXP(photosLogged);
  const macroXP = calculateMacroTrackingXP(trackedMeals, totalMeals);

  const total = photoXP + macroXP;

  const breakdown = `Photo: ${photoXP} XP + Macros: ${macroXP} XP = ${total} XP`;

  return {
    total,
    photoXP,
    macroXP,
    breakdown
  };
}

/**
 * Calculate streak bonus for consistent nutrition tracking
 * +5 XP per day (max 25 XP for 5+ day streak)
 */
export function calculateNutritionStreakBonus(
  streakDays: number
): number {
  if (streakDays < 3) return 0;
  return Math.min(streakDays * 5, 25);
}
