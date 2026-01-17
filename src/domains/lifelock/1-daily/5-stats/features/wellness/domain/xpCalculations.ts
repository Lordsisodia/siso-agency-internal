/**
 * Wellness XP Calculations
 *
 * Balanced to match morning routine (~355 XP max)
 * - Water: 75 XP max
 * - Workout: 180 XP max
 * - Nutrition: 100 XP max
 * - Smoking/Health: 100 XP max
 */

/**
 * Calculate water intake XP
 * Goal: 2000ml
 * Max: 75 XP (with streak bonus)
 */
export function calculateWaterXP(
  dailyTotalMl: number,
  goalMl: number = 2000,
  streakDays: number = 0
): { total: number; baseXP: number; streakBonus: number } {
  if (dailyTotalMl === 0) {
    return { total: 0, baseXP: 0, streakBonus: 0 };
  }

  const percentage = (dailyTotalMl / goalMl) * 100;

  let baseXP = 0;
  if (percentage >= 150) {
    baseXP = 70; // 3000ml+ (50% over goal)
  } else if (percentage >= 125) {
    baseXP = 60; // 2500ml+ (25% over goal)
  } else if (percentage >= 100) {
    baseXP = 50; // 2000ml (hit goal!)
  } else if (percentage >= 75) {
    baseXP = 30; // 1500ml (75%)
  } else if (percentage >= 50) {
    baseXP = 20; // 1000ml (50%)
  } else if (percentage >= 25) {
    baseXP = 10; // 500ml (25%)
  }

  // Streak bonus: +1 XP per day (cap at 5 XP for 5+ days)
  const streakBonus = streakDays >= 7 ? 5 : 0;

  return {
    total: baseXP + streakBonus,
    baseXP,
    streakBonus
  };
}

/**
 * Calculate home workout exercise XP
 * Per exercise: 20 XP base, +20 XP for PB
 * Full workout bonus: +20 XP
 * Max: 180 XP
 */
export function calculateWorkoutExerciseXP(
  logged: number,
  target: number,
  isPB: boolean = false
): { xp: number; pbBonus: number } {
  if (logged === 0) {
    return { xp: 0, pbBonus: 0 };
  }

  // Base XP for completing exercise
  const baseXP = 20;

  // PB bonus
  const pbBonus = isPB ? 20 : 0;

  return {
    xp: baseXP + pbBonus,
    pbBonus
  };
}

/**
 * Calculate total workout XP
 * Includes full workout completion bonus
 */
export function calculateTotalWorkoutXP(exercises: Array<{
  completed: boolean;
  logged: number;
  target: number;
  isPB?: boolean;
}>): { total: number; exerciseXP: number; fullWorkoutBonus: number } {
  let exerciseXP = 0;
  let completedCount = 0;

  exercises.forEach(exercise => {
    if (exercise.completed) {
      const result = calculateWorkoutExerciseXP(exercise.logged, exercise.target, exercise.isPB);
      exerciseXP += result.xp;
      completedCount++;
    }
  });

  // Full workout bonus if all exercises completed
  const fullWorkoutBonus = completedCount === exercises.length && exercises.length >= 4 ? 20 : 0;

  return {
    total: exerciseXP + fullWorkoutBonus,
    exerciseXP,
    fullWorkoutBonus
  };
}

/**
 * Calculate photo nutrition XP
 * Per meal: 12 XP
 * AI bonuses for healthy meals
 * Max: 100 XP
 */
export function calculateMealXP(mealData: {
  hasPhoto: boolean;
  calories?: number;
  protein?: number;
  isHealthy?: boolean;
  isBalanced?: boolean;
}): { total: number; baseXP: number; bonuses: number } {
  if (!mealData.hasPhoto) {
    return { total: 0, baseXP: 0, bonuses: 0 };
  }

  const baseXP = 12; // Per meal logged
  let bonuses = 0;

  // AI analysis bonuses
  if (mealData.isHealthy) {
    bonuses += 8; // Healthy meal detected
  }

  if (mealData.protein && mealData.protein >= 30) {
    bonuses += 10; // Protein-rich (30g+)
  }

  if (mealData.isBalanced) {
    bonuses += 10; // Balanced macros
  }

  return {
    total: baseXP + bonuses,
    baseXP,
    bonuses
  };
}

/**
 * Calculate total daily nutrition XP
 */
export function calculateTotalNutritionXP(meals: Array<{
  hasPhoto: boolean;
  calories?: number;
  protein?: number;
  isHealthy?: boolean;
  isBalanced?: boolean;
}>, dailyTotals: {
  calories: number;
  protein: number;
}): { total: number; mealXP: number; dailyGoalBonus: number } {
  let mealXP = 0;

  meals.forEach(meal => {
    const result = calculateMealXP(meal);
    mealXP += result.total;
  });

  // Daily macro goal bonuses
  let dailyGoalBonus = 0;

  // Hit protein goal (150g) → +20 XP
  if (dailyTotals.protein >= 150) {
    dailyGoalBonus += 20;
  }

  return {
    total: mealXP + dailyGoalBonus,
    mealXP,
    dailyGoalBonus
  };
}

/**
 * Calculate total wellness XP (all components)
 */
export function calculateTotalWellnessXP(data: {
  water: { dailyTotalMl: number; goalMl: number; streakDays: number };
  workout: Array<{ completed: boolean; logged: number; target: number; isPB?: boolean }>;
  nutrition: {
    meals: Array<{ hasPhoto: boolean; calories?: number; protein?: number; isHealthy?: boolean; isBalanced?: boolean }>;
    dailyTotals: { calories: number; protein: number };
  };
}): { total: number; waterXP: number; workoutXP: number; nutritionXP: number } {
  const waterResult = calculateWaterXP(data.water.dailyTotalMl, data.water.goalMl, data.water.streakDays);
  const workoutResult = calculateTotalWorkoutXP(data.workout);
  const nutritionResult = calculateTotalNutritionXP(data.nutrition.meals, data.nutrition.dailyTotals);

  return {
    total: waterResult.total + workoutResult.total + nutritionResult.total,
    waterXP: waterResult.total,
    workoutXP: workoutResult.total,
    nutritionXP: nutritionResult.total
  };
}

/**
 * Calculate smoking cessation XP
 * Rewards for smoke-free days and cravings resisted
 * Max: 100 XP per day
 */
export function calculateSmokingXP(data: {
  cigarettesToday: number;
  cravingsResisted: number;
  smokeFreeDays: number;
}): { total: number; smokeFreeBonus: number; cravingsBonus: number } {
  let smokeFreeBonus = 0;
  let cravingsBonus = 0;

  // Smoke-free bonus: 50 XP for smoke-free day
  if (data.cigarettesToday === 0) {
    smokeFreeBonus = 50;

    // Additional streak bonus
    if (data.smokeFreeDays >= 7) {
      smokeFreeBonus += 20; // Bonus for week streak
    } else if (data.smokeFreeDays >= 3) {
      smokeFreeBonus += 10; // Bonus for 3+ day streak
    }
  } else {
    // Reduced smoking bonus (still trying!)
    if (data.cigarettesToday <= 5) {
      smokeFreeBonus = 10;
    } else if (data.cigarettesToday <= 10) {
      smokeFreeBonus = 5;
    }
  }

  // Cravings resisted bonus: 10 XP per craving (max 50 XP)
  cravingsBonus = Math.min(data.cravingsResisted * 10, 50);

  return {
    total: smokeFreeBonus + cravingsBonus,
    smokeFreeBonus,
    cravingsBonus
  };
}
