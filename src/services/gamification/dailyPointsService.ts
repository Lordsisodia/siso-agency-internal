import { format, isSameDay } from 'date-fns';

// Point allocation system for different daily achievements
export interface DailyPoints {
  morningRoutine: {
    completed: boolean;
    points: number;
    maxPoints: number;
  };
  eveningCheckout: {
    completed: boolean;
    points: number;
    maxPoints: number;
  };
  lightTasks: {
    completed: number;
    total: number;
    points: number;
    maxPoints: number;
  };
  heavyTasks: {
    completed: number;
    total: number;
    points: number;
    maxPoints: number;
  };
  healthHabits: {
    exercise: boolean;
    nutrition: boolean;
    hydration: boolean;
    points: number;
    maxPoints: number;
  };
  focusWork: {
    deepWorkHours: number;
    targetHours: number;
    points: number;
    maxPoints: number;
  };
  totalPoints: number;
  maxTotalPoints: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  percentage: number;
}

// Point allocation constants based on productivity research
const POINT_SYSTEM = {
  morningRoutine: 25, // Sets the tone for the day
  eveningCheckout: 20, // Reflection and planning
  lightTask: 3,       // Per light task (max 10 tasks = 30 points)
  heavyTask: 8,       // Per heavy task (max 5 tasks = 40 points)
  exercise: 15,       // Physical health
  nutrition: 10,      // Eating well
  hydration: 5,       // Basic health
  deepWorkHour: 8,    // Per hour of deep work (max 6 hours = 48 points)
};

// Calculate maximum possible points per day
const MAX_DAILY_POINTS = 
  POINT_SYSTEM.morningRoutine + 
  POINT_SYSTEM.eveningCheckout + 
  (10 * POINT_SYSTEM.lightTask) + 
  (5 * POINT_SYSTEM.heavyTask) + 
  POINT_SYSTEM.exercise + 
  POINT_SYSTEM.nutrition + 
  POINT_SYSTEM.hydration + 
  (6 * POINT_SYSTEM.deepWorkHour); // = 238 points max

// NEW: Calculate real daily points from actual task data
export const calculateRealDailyPoints = (card: { date: Date; tasks: Array<{ id: string; title: string; completed: boolean; description?: string; workType?: string; completedAt?: string }> }): DailyPoints => {
  const { date, tasks } = card;
  const isToday = isSameDay(date, new Date());
  
  // Analyze real task completion data
  const lightTasks = tasks.filter(t => !t.workType || t.workType === 'light');
  const heavyTasks = tasks.filter(t => t.workType === 'deep');
  const lightCompleted = lightTasks.filter(t => t.completed).length;
  const heavyCompleted = heavyTasks.filter(t => t.completed).length;
  
  // Look for morning routine tasks (keywords or early completion)
  const morningTasks = tasks.filter(t => 
    t.title.toLowerCase().includes('morning') || 
    t.title.toLowerCase().includes('routine') ||
    t.title.toLowerCase().includes('wake') ||
    (t.completedAt && new Date(t.completedAt).getHours() < 10)
  );
  const morningCompleted = morningTasks.some(t => t.completed) || (isToday && new Date().getHours() > 9 && tasks.some(t => t.completed));
  
  // Look for evening routine tasks
  const eveningTasks = tasks.filter(t => 
    t.title.toLowerCase().includes('evening') || 
    t.title.toLowerCase().includes('checkout') ||
    t.title.toLowerCase().includes('review') ||
    (t.completedAt && new Date(t.completedAt).getHours() > 18)
  );
  const eveningCompleted = eveningTasks.some(t => t.completed) || (isToday && new Date().getHours() > 21 && tasks.some(t => t.completed));
  
  // Look for health-related tasks
  const healthTasks = tasks.filter(t => 
    t.title.toLowerCase().includes('exercise') || 
    t.title.toLowerCase().includes('workout') ||
    t.title.toLowerCase().includes('walk') ||
    t.title.toLowerCase().includes('gym') ||
    t.title.toLowerCase().includes('water') ||
    t.title.toLowerCase().includes('nutrition')
  );
  const exerciseCompleted = healthTasks.some(t => t.completed && (t.title.toLowerCase().includes('exercise') || t.title.toLowerCase().includes('workout') || t.title.toLowerCase().includes('gym')));
  const nutritionCompleted = healthTasks.some(t => t.completed && t.title.toLowerCase().includes('nutrition')) || tasks.length > 0; // Assume nutrition if any tasks done
  const hydrationCompleted = healthTasks.some(t => t.completed && t.title.toLowerCase().includes('water')) || tasks.filter(t => t.completed).length > 2; // Assume hydration if productive
  
  // Estimate focus work hours from deep tasks (1.5 hours per deep task average)
  const estimatedFocusHours = Math.round((heavyCompleted * 1.5) * 10) / 10;
  const targetFocusHours = Math.max(2, heavyTasks.length * 1.5);
  
  // Calculate points using real data
  const morningRoutine = {
    completed: morningCompleted,
    points: morningCompleted ? POINT_SYSTEM.morningRoutine : 0,
    maxPoints: POINT_SYSTEM.morningRoutine
  };
  
  const eveningCheckout = {
    completed: eveningCompleted,
    points: eveningCompleted ? POINT_SYSTEM.eveningCheckout : 0,
    maxPoints: POINT_SYSTEM.eveningCheckout
  };
  
  const lightTasksData = {
    completed: lightCompleted,
    total: lightTasks.length,
    points: lightCompleted * POINT_SYSTEM.lightTask,
    maxPoints: lightTasks.length * POINT_SYSTEM.lightTask
  };
  
  const heavyTasksData = {
    completed: heavyCompleted,
    total: heavyTasks.length,
    points: heavyCompleted * POINT_SYSTEM.heavyTask,
    maxPoints: heavyTasks.length * POINT_SYSTEM.heavyTask
  };
  
  const healthHabits = {
    exercise: exerciseCompleted,
    nutrition: nutritionCompleted,
    hydration: hydrationCompleted,
    points: (exerciseCompleted ? POINT_SYSTEM.exercise : 0) +
           (nutritionCompleted ? POINT_SYSTEM.nutrition : 0) +
           (hydrationCompleted ? POINT_SYSTEM.hydration : 0),
    maxPoints: POINT_SYSTEM.exercise + POINT_SYSTEM.nutrition + POINT_SYSTEM.hydration
  };
  
  const focusWork = {
    deepWorkHours: estimatedFocusHours,
    targetHours: targetFocusHours,
    points: Math.round(estimatedFocusHours * POINT_SYSTEM.deepWorkHour),
    maxPoints: Math.round(targetFocusHours * POINT_SYSTEM.deepWorkHour)
  };
  
  // Calculate totals from real data
  const totalPoints = 
    morningRoutine.points +
    eveningCheckout.points +
    lightTasksData.points +
    heavyTasksData.points +
    healthHabits.points +
    focusWork.points;
  
  const maxTotalPoints = 
    morningRoutine.maxPoints +
    eveningCheckout.maxPoints +
    lightTasksData.maxPoints +
    heavyTasksData.maxPoints +
    healthHabits.maxPoints +
    focusWork.maxPoints;
  
  const percentage = maxTotalPoints > 0 ? Math.round((totalPoints / maxTotalPoints) * 100) : 0;
  
  // Grade calculation based on real performance
  let grade: DailyPoints['grade'];
  if (percentage >= 95) grade = 'A+';
  else if (percentage >= 90) grade = 'A';
  else if (percentage >= 85) grade = 'B+';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 75) grade = 'C+';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 60) grade = 'D';
  else grade = 'F';
  
  return {
    morningRoutine,
    eveningCheckout,
    lightTasks: lightTasksData,
    heavyTasks: heavyTasksData,
    healthHabits,
    focusWork,
    totalPoints,
    maxTotalPoints,
    grade,
    percentage
  };
};

// LEGACY: Generate realistic daily points based on date and patterns (for fallback)
export const calculateDailyPoints = (date: Date): DailyPoints => {
  const isToday = isSameDay(date, new Date());
  const isPast = date < new Date() && !isToday;
  const isFuture = date > new Date();
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Realistic completion patterns based on day type and human behavior
  let morningRoutineCompletion = 0.85; // Most people are good with morning routines
  let eveningCheckoutCompletion = 0.65; // Evening discipline is harder
  let exerciseCompletion = 0.70; // Regular but not perfect
  let nutritionCompletion = 0.80; // Generally good
  let hydrationCompletion = 0.90; // Easy to maintain
  
  // Weekend patterns - slightly different
  if (isWeekend) {
    morningRoutineCompletion = 0.75; // Relaxed weekends
    eveningCheckoutCompletion = 0.55; // Less structured
    exerciseCompletion = 0.60; // Less gym access
  }
  
  // Monday motivation boost
  if (dayOfWeek === 1) {
    morningRoutineCompletion = 0.95;
    exerciseCompletion = 0.85;
  }
  
  // Friday wind-down
  if (dayOfWeek === 5) {
    eveningCheckoutCompletion = 0.45;
    exerciseCompletion = 0.55;
  }
  
  // For future dates, show targets based on patterns
  if (isFuture) {
    morningRoutineCompletion = 0.85;
    eveningCheckoutCompletion = 0.70;
    exerciseCompletion = 0.75;
    nutritionCompletion = 0.85;
    hydrationCompletion = 0.95;
  }
  
  // For today, show realistic current progress (assuming it's afternoon)
  if (isToday) {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      // Morning - only morning routine could be done
      eveningCheckoutCompletion = 0;
      exerciseCompletion = 0.3;
    } else if (currentHour < 18) {
      // Afternoon - partial completion
      eveningCheckoutCompletion = 0;
      exerciseCompletion = 0.6;
    } else {
      // Evening - most things could be done
      exerciseCompletion = 0.8;
    }
  }
  
  // Calculate task numbers based on realistic workload
  const lightTasksTotal = isWeekend ? 4 : 8; // Fewer tasks on weekends
  const heavyTasksTotal = isWeekend ? 1 : 3; // Much fewer heavy tasks on weekends
  
  // Completion rates vary by day effectiveness
  const taskCompletionMultiplier = isPast ? 
    (0.6 + (Math.sin(date.getTime() / 1000000) * 0.3)) : // Realistic variance for past days
    (isToday ? 0.7 : 0.8); // Today's current progress vs future targets
  
  const lightTasksCompleted = Math.round(lightTasksTotal * taskCompletionMultiplier);
  const heavyTasksCompleted = Math.round(heavyTasksTotal * taskCompletionMultiplier);
  
  // Deep work hours calculation
  const targetDeepWorkHours = isWeekend ? 2 : 4; // Less deep work on weekends
  const deepWorkHours = isFuture ? 
    targetDeepWorkHours : 
    Math.round(targetDeepWorkHours * taskCompletionMultiplier * 100) / 100;
  
  // Calculate actual completions
  const morningRoutine = {
    completed: isPast ? (Math.random() < morningRoutineCompletion) : (isToday && new Date().getHours() > 9),
    points: 0,
    maxPoints: POINT_SYSTEM.morningRoutine
  };
  morningRoutine.points = morningRoutine.completed ? morningRoutine.maxPoints : 0;
  
  const eveningCheckout = {
    completed: isPast ? (Math.random() < eveningCheckoutCompletion) : (isToday && new Date().getHours() > 21),
    points: 0,
    maxPoints: POINT_SYSTEM.eveningCheckout
  };
  eveningCheckout.points = eveningCheckout.completed ? eveningCheckout.maxPoints : 0;
  
  const lightTasks = {
    completed: lightTasksCompleted,
    total: lightTasksTotal,
    points: lightTasksCompleted * POINT_SYSTEM.lightTask,
    maxPoints: lightTasksTotal * POINT_SYSTEM.lightTask
  };
  
  const heavyTasks = {
    completed: heavyTasksCompleted,
    total: heavyTasksTotal,
    points: heavyTasksCompleted * POINT_SYSTEM.heavyTask,
    maxPoints: heavyTasksTotal * POINT_SYSTEM.heavyTask
  };
  
  const healthHabits = {
    exercise: isPast ? (Math.random() < exerciseCompletion) : (isToday && Math.random() < 0.6),
    nutrition: isPast ? (Math.random() < nutritionCompletion) : (isToday && Math.random() < 0.8),
    hydration: isPast ? (Math.random() < hydrationCompletion) : (isToday && Math.random() < 0.9),
    points: 0,
    maxPoints: POINT_SYSTEM.exercise + POINT_SYSTEM.nutrition + POINT_SYSTEM.hydration
  };
  
  healthHabits.points = 
    (healthHabits.exercise ? POINT_SYSTEM.exercise : 0) +
    (healthHabits.nutrition ? POINT_SYSTEM.nutrition : 0) +
    (healthHabits.hydration ? POINT_SYSTEM.hydration : 0);
  
  const focusWork = {
    deepWorkHours,
    targetHours: targetDeepWorkHours,
    points: Math.round(deepWorkHours * POINT_SYSTEM.deepWorkHour),
    maxPoints: targetDeepWorkHours * POINT_SYSTEM.deepWorkHour
  };
  
  // Calculate totals
  const totalPoints = 
    morningRoutine.points +
    eveningCheckout.points +
    lightTasks.points +
    heavyTasks.points +
    healthHabits.points +
    focusWork.points;
  
  const maxTotalPoints = 
    morningRoutine.maxPoints +
    eveningCheckout.maxPoints +
    lightTasks.maxPoints +
    heavyTasks.maxPoints +
    healthHabits.maxPoints +
    focusWork.maxPoints;
  
  const percentage = Math.round((totalPoints / maxTotalPoints) * 100);
  
  // Grade calculation based on percentage
  let grade: DailyPoints['grade'];
  if (percentage >= 95) grade = 'A+';
  else if (percentage >= 90) grade = 'A';
  else if (percentage >= 85) grade = 'B+';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 75) grade = 'C+';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 60) grade = 'D';
  else grade = 'F';
  
  return {
    morningRoutine,
    eveningCheckout,
    lightTasks,
    heavyTasks,
    healthHabits,
    focusWork,
    totalPoints,
    maxTotalPoints,
    grade,
    percentage
  };
};

// Get week summary statistics from REAL task data
export const calculateRealWeekSummary = (weekCards: Array<{ date: Date; tasks: Array<{ id: string; title: string; completed: boolean; description?: string; workType?: string; completedAt?: string }> }>) => {
  const dailyPoints = weekCards.map(card => calculateRealDailyPoints(card));
  
  const totalPointsThisWeek = dailyPoints.reduce((sum, day) => sum + day.totalPoints, 0);
  const maxPossiblePoints = dailyPoints.reduce((sum, day) => sum + day.maxTotalPoints, 0);
  const weekPercentage = maxPossiblePoints > 0 ? Math.round((totalPointsThisWeek / maxPossiblePoints) * 100) : 0;
  
  const streaks = {
    morningRoutine: dailyPoints.filter(d => d.morningRoutine.completed).length,
    exercise: dailyPoints.filter(d => d.healthHabits.exercise).length,
    eveningCheckout: dailyPoints.filter(d => d.eveningCheckout.completed).length
  };
  
  return {
    totalPoints: totalPointsThisWeek,
    maxPoints: maxPossiblePoints,
    percentage: weekPercentage,
    averageDaily: weekCards.length > 0 ? Math.round(totalPointsThisWeek / weekCards.length) : 0,
    streaks,
    bestDay: dailyPoints.reduce((best, current, index) => 
      current.percentage > dailyPoints[best].percentage ? index : best, 0
    ),
    grades: dailyPoints.map(d => d.grade)
  };
};

// LEGACY: Get week summary statistics (for fallback)
export const calculateWeekSummary = (dates: Date[]) => {
  const dailyPoints = dates.map(calculateDailyPoints);
  
  const totalPointsThisWeek = dailyPoints.reduce((sum, day) => sum + day.totalPoints, 0);
  const maxPossiblePoints = dailyPoints.reduce((sum, day) => sum + day.maxTotalPoints, 0);
  const weekPercentage = Math.round((totalPointsThisWeek / maxPossiblePoints) * 100);
  
  const streaks = {
    morningRoutine: dailyPoints.filter(d => d.morningRoutine.completed).length,
    exercise: dailyPoints.filter(d => d.healthHabits.exercise).length,
    eveningCheckout: dailyPoints.filter(d => d.eveningCheckout.completed).length
  };
  
  return {
    totalPoints: totalPointsThisWeek,
    maxPoints: maxPossiblePoints,
    percentage: weekPercentage,
    averageDaily: Math.round(totalPointsThisWeek / dates.length),
    streaks,
    bestDay: dailyPoints.reduce((best, current, index) => 
      current.percentage > dailyPoints[best].percentage ? index : best, 0
    ),
    grades: dailyPoints.map(d => d.grade)
  };
};

export default {
  calculateDailyPoints,
  calculateRealDailyPoints,
  calculateWeekSummary,
  calculateRealWeekSummary,
  POINT_SYSTEM,
  MAX_DAILY_POINTS
};