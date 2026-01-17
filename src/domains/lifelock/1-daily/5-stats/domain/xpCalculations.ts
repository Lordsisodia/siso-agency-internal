/**
 * Stats XP Calculations
 *
 * Consolidated XP calculations for Smoking and Water tracking
 * Re-exported from wellness domain for Stats section
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

  // Streak bonus: +5 XP for 7+ day streak
  const streakBonus = streakDays >= 7 ? 5 : 0;

  return {
    total: baseXP + streakBonus,
    baseXP,
    streakBonus
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

/**
 * Calculate total Stats XP (water + smoking)
 */
export function calculateTotalStatsXP(data: {
  water: { dailyTotalMl: number; goalMl: number; streakDays: number };
  smoking: {
    cigarettesToday: number;
    cravingsResisted: number;
    smokeFreeDays: number;
  };
}): { total: number; waterXP: number; smokingXP: number } {
  const waterResult = calculateWaterXP(
    data.water.dailyTotalMl,
    data.water.goalMl,
    data.water.streakDays
  );
  const smokingResult = calculateSmokingXP(data.smoking);

  return {
    total: waterResult.total + smokingResult.total,
    waterXP: waterResult.total,
    smokingXP: smokingResult.total
  };
}
