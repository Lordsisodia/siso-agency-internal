/**
 * Nightly Checkout XP Calculations
 *
 * Based on documented rules - rewards reflection, planning, and healthy sleep
 */

/**
 * Calculate bed time XP
 * Base: 50 XP × time multiplier (earlier = better!)
 */
export function calculateBedTimeXP(bedTime: string): number {
  if (!bedTime) return 0;

  // Parse time to minutes from midnight
  const parseTime = (time: string): number | null => {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const meridiem = match[3]?.toUpperCase();

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const mins = parseTime(bedTime);
  if (mins === null) return 0;

  // Time-based multiplier (earlier sleep = more XP!)
  let multiplier = 1.0;

  // Handle midnight wrap-around (10 PM = 1320 mins, 2 AM = 120 mins)
  // Treat 10 PM - 11:59 PM as evening (high XP)
  // Treat 12 AM - 3 AM as late night (lower XP)

  if (mins >= 1260 && mins <= 1440) {
    // 9 PM - 12 AM
    if (mins <= 1320) multiplier = 2.0;      // ≤ 10:00 PM
    else if (mins <= 1380) multiplier = 1.5; // ≤ 11:00 PM
    else multiplier = 1.0;                   // 11:01 PM - 12:00 AM
  } else if (mins >= 0 && mins < 180) {
    // 12 AM - 3 AM (wrap-around)
    if (mins <= 60) multiplier = 1.0;        // 12:00 AM - 1:00 AM
    else if (mins <= 120) multiplier = 0.7;  // 1:00 AM - 2:00 AM
    else multiplier = 0.4;                   // 2:00 AM - 3:00 AM
  } else if (mins >= 180) {
    // After 3 AM
    multiplier = 0.2;
  }

  return Math.round(50 * multiplier);
}

/**
 * Calculate win of day XP
 */
export function calculateWinOfDayXP(winOfDay: string): number {
  return winOfDay.trim().length > 0 ? 25 : 0;
}

/**
 * Calculate mood selection XP
 */
export function calculateMoodXP(mood: string): number {
  return mood ? 15 : 0;
}

/**
 * Calculate "what went well" XP
 * 10 XP per item (up to 5 items)
 */
export function calculateWentWellXP(items: string[]): number {
  const filledItems = items.filter(item => item.trim().length > 0);
  return Math.min(filledItems.length * 10, 50); // Cap at 5 items
}

/**
 * Calculate "even better if" XP
 * 10 XP per item (up to 5 items)
 */
export function calculateEvenBetterIfXP(items: string[]): number {
  const filledItems = items.filter(item => item.trim().length > 0);
  return Math.min(filledItems.length * 10, 50); // Cap at 5 items
}

/**
 * Calculate daily analysis XP
 * 30 XP if meaningful text (min 50 characters)
 */
export function calculateDailyAnalysisXP(analysis: string): number {
  return analysis.trim().length >= 50 ? 30 : 0;
}

/**
 * Calculate key learnings XP
 * 25 XP if filled
 */
export function calculateKeyLearningsXP(learnings: string): number {
  return learnings.trim().length > 0 ? 25 : 0;
}

/**
 * Calculate tomorrow tasks XP
 * 30 XP if all 3 filled
 */
export function calculateTomorrowTasksXP(tasks: string[]): number {
  const allFilled = tasks.every(t => t.trim().length > 0);
  return allFilled ? 30 : 0;
}

/**
 * Calculate overall rating XP
 * 15 XP for any rating
 */
export function calculateOverallRatingXP(rating?: number): number {
  return rating ? 15 : 0;
}

/**
 * Calculate energy level XP
 * 15 XP for any level
 */
export function calculateEnergyLevelXP(energyLevel?: number): number {
  return energyLevel ? 15 : 0;
}

/**
 * Calculate streak bonus
 * +2 XP per day, cap at 50 XP
 */
export function calculateStreakBonus(streakDays: number): number {
  return Math.min(streakDays * 2, 50);
}

/**
 * Calculate perfect completion bonus
 * +50 XP if everything is filled
 */
export function calculatePerfectCompletionBonus(isComplete: boolean): number {
  return isComplete ? 50 : 0;
}

/**
 * Calculate meditation XP
 * Base: 2 XP per minute, max 50 XP
 * Quality multiplier: 0.5x to 1.5x
 */
export function calculateMeditationXP(minutes: number, quality: number): number {
  if (minutes <= 0) return 0;

  // Base XP: 2 XP per minute, capped at 50 XP
  const baseXP = Math.min(minutes * 2, 50);

  // Quality multiplier: 0.5x (quality 0) to 1.5x (quality 100)
  // Quality is 0-100, map to 0.5-1.5 range
  const qualityMultiplier = 0.5 + (quality / 100) * 1.0;

  return Math.round(baseXP * qualityMultiplier);
}

/**
 * Calculate workout XP
 * Light: 10 XP
 * Moderate 15-30min: 20 XP
 * Moderate 30+ min OR Intense 15+ min: 30 XP
 * Intense 45+ min: 40 XP
 */
export function calculateWorkoutXP(duration: number, intensity: string): number {
  if (duration <= 0) return 0;

  const intensityLower = intensity.toLowerCase();

  if (intensityLower === 'light') {
    return 10;
  }

  if (intensityLower === 'moderate') {
    if (duration >= 30) return 30;
    if (duration >= 15) return 20;
    return 10;
  }

  if (intensityLower === 'intense') {
    if (duration >= 45) return 40;
    if (duration >= 15) return 30;
    return 15;
  }

  // Default for unknown intensity
  return duration >= 30 ? 20 : 10;
}

/**
 * Calculate deep work XP
 * Base: 10 XP for any deep work
 * +5 XP per 30min (up to 2h)
 * +10 XP bonus for flow state
 */
export function calculateDeepWorkXP(hours: number, flowState: boolean): number {
  if (hours <= 0) return 0;

  // Base XP for any deep work
  let xp = 10;

  // +5 XP per 30 minutes, capped at 2 hours (4 intervals)
  const thirtyMinIntervals = Math.min(Math.floor(hours * 2), 4);
  xp += thirtyMinIntervals * 5;

  // Flow state bonus
  if (flowState) {
    xp += 10;
  }

  return xp;
}

/**
 * Calculate research XP
 * Base: 10 XP
 * +5 XP per 30min (up to 2h)
 * +10 XP for notes > 100 chars
 */
export function calculateResearchXP(hours: number, notesLength: number): number {
  if (hours <= 0) return 0;

  // Base XP
  let xp = 10;

  // +5 XP per 30 minutes, capped at 2 hours (4 intervals)
  const thirtyMinIntervals = Math.min(Math.floor(hours * 2), 4);
  xp += thirtyMinIntervals * 5;

  // Notes bonus
  if (notesLength > 100) {
    xp += 10;
  }

  return xp;
}

/**
 * Calculate total nightly checkout XP
 */
export function calculateTotalCheckoutXP(checkout: {
  bedTime: string;
  winOfDay: string;
  mood: string;
  wentWell: string[];
  evenBetterIf: string[];
  dailyAnalysis: string;
  keyLearnings: string;
  tomorrowTopTasks: string[];
  overallRating?: number;
  energyLevel?: number;
}, streakDays: number): { total: number; breakdown: any } {
  const bedTimeXP = calculateBedTimeXP(checkout.bedTime);
  const winOfDayXP = calculateWinOfDayXP(checkout.winOfDay);
  const moodXP = calculateMoodXP(checkout.mood);
  const wentWellXP = calculateWentWellXP(checkout.wentWell);
  const evenBetterIfXP = calculateEvenBetterIfXP(checkout.evenBetterIf);
  const dailyAnalysisXP = calculateDailyAnalysisXP(checkout.dailyAnalysis);
  const keyLearningsXP = calculateKeyLearningsXP(checkout.keyLearnings);
  const tomorrowTasksXP = calculateTomorrowTasksXP(checkout.tomorrowTopTasks);
  const overallRatingXP = calculateOverallRatingXP(checkout.overallRating);
  const energyLevelXP = calculateEnergyLevelXP(checkout.energyLevel);

  const subtotal = bedTimeXP + winOfDayXP + moodXP + wentWellXP + evenBetterIfXP +
                   dailyAnalysisXP + keyLearningsXP + tomorrowTasksXP + overallRatingXP + energyLevelXP;

  const streakBonus = calculateStreakBonus(streakDays);

  // Perfect completion check
  const isComplete =
    checkout.bedTime.length > 0 &&
    checkout.winOfDay.trim().length > 0 &&
    checkout.mood.length > 0 &&
    checkout.wentWell.some(item => item.trim().length > 0) &&
    checkout.evenBetterIf.some(item => item.trim().length > 0) &&
    checkout.dailyAnalysis.trim().length >= 50 &&
    checkout.keyLearnings.trim().length > 0 &&
    checkout.tomorrowTopTasks.every(t => t.trim().length > 0) &&
    checkout.overallRating !== undefined &&
    checkout.energyLevel !== undefined;

  const perfectBonus = calculatePerfectCompletionBonus(isComplete);

  const total = subtotal + streakBonus + perfectBonus;

  return {
    total,
    breakdown: {
      bedTime: bedTimeXP,
      winOfDay: winOfDayXP,
      mood: moodXP,
      wentWell: wentWellXP,
      evenBetterIf: evenBetterIfXP,
      dailyAnalysis: dailyAnalysisXP,
      keyLearnings: keyLearningsXP,
      tomorrowTasks: tomorrowTasksXP,
      overallRating: overallRatingXP,
      energyLevel: energyLevelXP,
      streakBonus,
      perfectBonus
    }
  };
}
