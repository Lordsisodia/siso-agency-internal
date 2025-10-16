/**
 * Morning Routine XP Calculations
 *
 * Based on documented rules in docs/features/MORNING-ROUTINE-XP-SYSTEM.md
 */

/**
 * Calculate wake-up time XP
 * Base: 100 XP × time multiplier × weekend bonus
 */
export function calculateWakeUpXP(wakeUpTime: string, date: Date): number {
  if (!wakeUpTime) return 0;

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

  const mins = parseTime(wakeUpTime);
  if (mins === null) return 0;

  // Time-based multiplier
  let multiplier = 1.0;
  if (mins <= 360) multiplier = 2.0;        // ≤ 6:00 AM
  else if (mins <= 420) multiplier = 2.0;   // ≤ 7:00 AM
  else if (mins <= 480) multiplier = 1.5;   // ≤ 8:00 AM
  else if (mins <= 540) multiplier = 1.2;   // ≤ 9:00 AM
  else if (mins <= 600) multiplier = 0.75;  // ≤ 10:00 AM
  else if (mins <= 720) multiplier = 0.5;   // ≤ 12:00 PM
  else if (mins <= 840) multiplier = 0.25;  // ≤ 2:00 PM
  else if (mins <= 960) multiplier = 0.1;   // ≤ 4:00 PM
  else multiplier = 0.05;                   // > 4:00 PM

  // Weekend bonus: +20% on Sat/Sun before 8 AM
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  const isBefore8AM = mins <= 480;
  const weekendBonus = isWeekend && isBefore8AM ? 1.2 : 1.0;

  return Math.round(100 * multiplier * weekendBonus);
}

/**
 * Calculate Freshen Up section XP
 * Individual habits: 10 + 10 + 20 = 40 XP
 * Speed bonus: +25 XP if all done within 25 min of wake-up
 */
export function calculateFreshenUpXP(
  completed: { bathroom: boolean; brushTeeth: boolean; coldShower: boolean },
  wakeUpTime: string,
  completionTime?: Date,
  date?: Date
): { total: number; speedBonus: number } {
  let total = 0;

  if (completed.bathroom) total += 10;
  if (completed.brushTeeth) total += 10;
  if (completed.coldShower) total += 20;

  // Speed bonus calculation
  let speedBonus = 0;
  if (completed.bathroom && completed.brushTeeth && completed.coldShower && wakeUpTime && completionTime && date) {
    // Check if completed within 25 min of wake-up
    const wakeMinutes = getTimeInMinutes(wakeUpTime);
    const completionMinutes = completionTime.getHours() * 60 + completionTime.getMinutes();
    const timeDiff = completionMinutes - wakeMinutes;

    if (timeDiff <= 25 && timeDiff >= 0) {
      speedBonus = 25;
      total += speedBonus;
    }
  }

  return { total, speedBonus };
}

/**
 * Calculate Get Blood Flowing XP
 * Base: 20 XP
 * PB bonus: +50 XP if beat personal best
 * Speed bonus: ×1.5 if within 5 min of previous section
 */
export function calculateGetBloodFlowingXP(
  pushupReps: number,
  personalBest: number,
  completedWithin5Min: boolean
): { total: number; pbBonus: number; speedBonus: number } {
  if (pushupReps === 0) return { total: 0, pbBonus: 0, speedBonus: 0 };

  let base = 20;
  const beatPB = pushupReps > personalBest;
  const pbBonus = beatPB ? 50 : 0;

  // Speed multiplier
  const speedMultiplier = completedWithin5Min ? 1.5 : 1.0;
  const speedBonus = completedWithin5Min ? 10 : 0; // Show as bonus

  const total = Math.round(base * speedMultiplier) + pbBonus;

  return { total, pbBonus, speedBonus };
}

/**
 * Calculate Power Up Brain XP
 * Water: (amount / 500) × 30 XP (scales proportionally)
 * Supplements: 15 XP flat
 */
export function calculatePowerUpBrainXP(
  waterAmount: number,
  supplementsCompleted: boolean
): { total: number; waterXP: number; supplementsXP: number } {
  const waterXP = Math.floor((waterAmount / 500) * 30);
  const supplementsXP = supplementsCompleted ? 15 : 0;

  return {
    total: waterXP + supplementsXP,
    waterXP,
    supplementsXP
  };
}

/**
 * Calculate Plan Day XP
 * Base: 20 XP for completion
 */
export function calculatePlanDayXP(completed: boolean): number {
  return completed ? 20 : 0;
}

/**
 * Calculate Meditation XP
 * Formula: 5 XP per minute
 * Cap: 200 XP (40 minutes max)
 */
export function calculateMeditationXP(duration: string): number {
  if (!duration) return 0;

  const mins = parseInt(duration.replace(/\D/g, ''));
  if (isNaN(mins)) return 0;

  return Math.min(mins * 5, 200);
}

/**
 * Calculate Top 3 Priorities XP
 * 25 XP if all 3 filled with text
 */
export function calculatePrioritiesXP(priorities: string[]): number {
  const allFilled = priorities.every(p => p.trim().length > 0);
  return allFilled ? 25 : 0;
}

/**
 * Helper: Get time in minutes from midnight
 */
function getTimeInMinutes(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Calculate total morning routine XP
 */
export function calculateTotalMorningXP(params: {
  wakeUpTime: string;
  date: Date;
  freshenUp: { bathroom: boolean; brushTeeth: boolean; coldShower: boolean };
  pushupReps: number;
  pushupPB: number;
  waterAmount: number;
  supplementsCompleted: boolean;
  planDayComplete: boolean;
  meditationDuration: string;
  priorities: string[];
}): { total: number; breakdown: any } {
  const wakeUpXP = calculateWakeUpXP(params.wakeUpTime, params.date);
  const freshenUpResult = calculateFreshenUpXP(params.freshenUp, params.wakeUpTime);
  const bloodFlowingResult = calculateGetBloodFlowingXP(params.pushupReps, params.pushupPB, false); // TODO: Track timing
  const powerUpResult = calculatePowerUpBrainXP(params.waterAmount, params.supplementsCompleted);
  const planDayXP = calculatePlanDayXP(params.planDayComplete);
  const meditationXP = calculateMeditationXP(params.meditationDuration);
  const prioritiesXP = calculatePrioritiesXP(params.priorities);

  const total = wakeUpXP + freshenUpResult.total + bloodFlowingResult.total + powerUpResult.total + planDayXP + meditationXP + prioritiesXP;

  return {
    total,
    breakdown: {
      wakeUp: wakeUpXP,
      freshenUp: freshenUpResult.total,
      getBloodFlowing: bloodFlowingResult.total,
      powerUpBrain: powerUpResult.total,
      planDay: planDayXP,
      meditation: meditationXP,
      priorities: prioritiesXP,
      bonuses: {
        freshenUpSpeed: freshenUpResult.speedBonus,
        pushupPB: bloodFlowingResult.pbBonus,
        pushupSpeed: bloodFlowingResult.speedBonus
      }
    }
  };
}
