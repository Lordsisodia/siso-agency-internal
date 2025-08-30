# 🏃‍♂️ Life Tracker XP Integration System

## 🎯 Complete Life Metrics → XP Bonus Framework

Transform your existing health and habits tracking into **powerful XP multipliers** and psychological motivation enhancers.

## 💪 Health-Based XP Multipliers

### **Sleep Quality Integration**
```typescript
interface SleepXPBonus {
  hoursSlept: number
  sleepQuality: number    // 1-10 user rating
  bedtimeConsistency: number // How consistent bedtime is
  xpMultiplier: number    // 0.8x to 1.5x multiplier
  bonusMessage: string
}

export const calculateSleepBonus = (healthMetrics: DailyHealth): SleepXPBonus => {
  const { sleepHours } = healthMetrics
  
  // Optimal sleep = 7-9 hours
  let multiplier = 1.0
  let message = "Normal XP rate"
  
  if (sleepHours >= 7 && sleepHours <= 9) {
    multiplier = 1.2
    message = "🌙 Well-rested bonus: +20% XP!"
  } else if (sleepHours >= 8) {
    multiplier = 1.3
    message = "😴 Perfect sleep bonus: +30% XP!"
  } else if (sleepHours < 6) {
    multiplier = 0.8
    message = "😵 Sleep debt: -20% XP (get some rest!)"
  } else if (sleepHours < 7) {
    multiplier = 0.9
    message = "🥱 Tired: -10% XP (consider more sleep)"
  }
  
  return {
    hoursSlept: sleepHours,
    sleepQuality: healthMetrics.moodLevel || 5,
    bedtimeConsistency: 1.0, // TODO: Calculate from history
    xpMultiplier: multiplier,
    bonusMessage: message
  }
}
```

### **Energy & Mood Integration**
```typescript
interface WellbeingXPBonus {
  energyLevel: number     // 1-10 scale
  moodLevel: number       // 1-10 scale
  combinedMultiplier: number
  psychologyMessage: string
  rewardRecommendation: string
}

export const calculateWellbeingBonus = (healthMetrics: DailyHealth): WellbeingXPBonus => {
  const { energyLevel = 5, moodLevel = 5 } = healthMetrics
  
  // High energy/mood = productivity bonus
  const energyBonus = energyLevel >= 7 ? 1.1 : energyLevel <= 3 ? 0.9 : 1.0
  const moodBonus = moodLevel >= 7 ? 1.1 : moodLevel <= 3 ? 0.9 : 1.0
  
  const combined = energyBonus * moodBonus
  
  let message = "Standard XP earning"
  let rewardRec = "Continue your current pace"
  
  if (combined >= 1.2) {
    message = "🚀 High energy + great mood: Maximum productivity mode!"
    rewardRec = "You're crushing it! Consider a premium reward tonight."
  } else if (combined <= 0.85) {
    message = "😔 Low energy/mood: Take it easy and focus on self-care"
    rewardRec = "Consider relaxation rewards over productivity pushes"
  }
  
  return {
    energyLevel,
    moodLevel, 
    combinedMultiplier: combined,
    psychologyMessage: message,
    rewardRecommendation: rewardRec
  }
}
```

## 🏃‍♂️ Workout Integration

### **Workout Completion Bonuses**
```typescript
interface WorkoutXPBonus {
  completionPercentage: number
  durationMinutes: number
  workoutType: string
  xpBonus: number          // Flat XP bonus
  multiplier: number       // Multiplier for next few hours
  rewardUnlocks: string[]  // Special rewards unlocked
  motivationMessage: string
}

export const calculateWorkoutBonus = (workout: DailyWorkout): WorkoutXPBonus => {
  const { completionPercentage, durationMinutes = 0 } = workout
  
  let xpBonus = 0
  let multiplier = 1.0
  const rewardUnlocks = []
  let message = ""
  
  if (completionPercentage >= 100) {
    xpBonus = 200
    multiplier = 1.3
    message = "💪 Complete workout: +200 XP + 30% multiplier for 4 hours!"
    rewardUnlocks.push("Post-Workout Protein Treat", "Achievement Cannabis Session")
  } else if (completionPercentage >= 80) {
    xpBonus = 150  
    multiplier = 1.2
    message = "🏃‍♂️ Great workout: +150 XP + 20% multiplier for 2 hours!"
    rewardUnlocks.push("Recovery Snack")
  } else if (completionPercentage >= 50) {
    xpBonus = 100
    multiplier = 1.1
    message = "👍 Decent workout: +100 XP + 10% multiplier for 1 hour!"
  } else if (completionPercentage > 0) {
    xpBonus = 50
    message = "🤏 Some movement: +50 XP (better than nothing!)"
  }
  
  // Duration bonuses
  if (durationMinutes >= 60) {
    xpBonus += 100
    rewardUnlocks.push("Long Workout Champion Reward")
  }
  
  return {
    completionPercentage,
    durationMinutes,
    workoutType: "general", // TODO: Add workout type tracking
    xpBonus,
    multiplier,
    rewardUnlocks,
    motivationMessage: message
  }
}
```

### **Workout Streak Multipliers**
```typescript
interface WorkoutStreak {
  currentStreak: number
  longestStreak: number
  streakMultiplier: number
  nextMilestoneReward: string
  streakAnxietyMessage?: string
}

export const calculateWorkoutStreak = (workoutHistory: DailyWorkout[]): WorkoutStreak => {
  const currentStreak = getCurrentConsecutiveDays(workoutHistory, w => w.completionPercentage >= 50)
  const longestStreak = getLongestStreak(workoutHistory, w => w.completionPercentage >= 50)
  
  let streakMultiplier = 1.0 + (currentStreak * 0.05) // +5% per day
  streakMultiplier = Math.min(streakMultiplier, 2.0) // Cap at 2x
  
  const milestones = [
    { days: 7, reward: "Weekly Warrior Badge + Premium Cannabis" },
    { days: 14, reward: "Fitness Champion + Luxury Meal" },
    { days: 30, reward: "Fitness God + Epic Celebration Package" }
  ]
  
  const nextMilestone = milestones.find(m => m.days > currentStreak)
  
  let anxietyMessage
  if (currentStreak >= 3) {
    const lastWorkout = workoutHistory[0]?.durationMinutes || 0
    const hoursSinceWorkout = getHoursSinceLastWorkout()
    
    if (hoursSinceWorkout > 20) {
      anxietyMessage = `⚠️ ${currentStreak}-day streak at risk! Workout expires in ${24 - hoursSinceWorkout} hours!`
    }
  }
  
  return {
    currentStreak,
    longestStreak,
    streakMultiplier,
    nextMilestoneReward: nextMilestone?.reward || "Streak Master Status",
    streakAnxietyMessage: anxietyMessage
  }
}
```

## 🧘‍♀️ Habit Integration

### **Digital Habits Impact**
```typescript
interface DigitalHabitsXPModifier {
  screenTimeMinutes: number
  bullshitContentMinutes: number
  noScrolling: boolean
  noWeed: boolean
  deepWorkHours: number
  xpPenalty: number        // Negative XP for bad habits
  xpBonus: number         // Positive XP for good habits
  rewardRestrictions: string[] // Restricted rewards due to habits
  rewardUnlocks: string[] // Unlocked rewards due to habits
  psychologyMessage: string
}

export const calculateHabitModifier = (habits: DailyHabits): DigitalHabitsXPModifier => {
  const { screenTimeMinutes, bullshitContentMinutes, noScrolling, noWeed, deepWorkHours } = habits
  
  let xpPenalty = 0
  let xpBonus = 0
  const restrictions = []
  const unlocks = []
  let message = ""
  
  // Screen time penalties
  if (screenTimeMinutes > 480) { // 8+ hours
    xpPenalty += 100
    restrictions.push("Entertainment Rewards")
    message += "📱 Excessive screen time detected. "
  }
  
  // Bullshit content penalties  
  if (bullshitContentMinutes > 120) { // 2+ hours
    xpPenalty += 150
    restrictions.push("Social Media Rewards", "Netflix Binge")
    message += "🗑️ Too much junk content consumed. "
  }
  
  // No scrolling bonus
  if (noScrolling) {
    xpBonus += 100
    unlocks.push("Focus Master Rewards", "Mindful Living Bonus")
    message += "🎯 No scrolling achievement! "
  }
  
  // No weed bonus (if applicable)
  if (noWeed) {
    xpBonus += 75
    unlocks.push("Clear Mind Rewards", "Natural High Bonus")
    message += "🧠 Clear minded day! "
  }
  
  // Deep work bonuses
  if (deepWorkHours >= 4) {
    xpBonus += 200
    unlocks.push("Deep Work Master", "Premium Focus Rewards")
    message += "🧠 Deep work champion! "
  } else if (deepWorkHours >= 2) {
    xpBonus += 100
    unlocks.push("Focused Professional")
    message += "💼 Solid focus session! "
  }
  
  return {
    screenTimeMinutes,
    bullshitContentMinutes,
    noScrolling,
    noWeed,
    deepWorkHours,
    xpPenalty,
    xpBonus,
    rewardRestrictions: restrictions,
    rewardUnlocks: unlocks,
    psychologyMessage: message.trim()
  }
}
```

### **Routine Consistency Bonuses**
```typescript
interface RoutineConsistencyBonus {
  morningRoutineScore: number
  eveningRoutineScore: number
  consistencyMultiplier: number
  specialRewardUnlocks: string[]
  streakBonuses: string[]
}

export const calculateRoutineBonus = (routines: DailyRoutine[]): RoutineConsistencyBonus => {
  const morning = routines.find(r => r.routineType === 'MORNING')
  const evening = routines.find(r => r.routineType === 'EVENING')
  
  const morningScore = morning?.completionPercentage || 0
  const eveningScore = evening?.completionPercentage || 0
  
  let multiplier = 1.0
  const unlocks = []
  const streakBonuses = []
  
  // Perfect day bonus
  if (morningScore >= 90 && eveningScore >= 90) {
    multiplier = 1.4
    unlocks.push("Perfect Day Package", "Routine Master Status")
    streakBonuses.push("Elite Productivity Mode Unlocked")
  } else if (morningScore >= 80 && eveningScore >= 80) {
    multiplier = 1.3
    unlocks.push("Routine Champion", "Balanced Life Reward")
  } else if (morningScore >= 70 || eveningScore >= 70) {
    multiplier = 1.2
    unlocks.push("Routine Builder")
  }
  
  // Morning routine specific bonuses
  if (morningScore >= 90) {
    unlocks.push("Early Bird Special", "Morning Momentum Bonus")
  }
  
  // Evening routine specific bonuses  
  if (eveningScore >= 90) {
    unlocks.push("Evening Wind-down Reward", "Preparation Master")
  }
  
  return {
    morningRoutineScore: morningScore,
    eveningRoutineScore: eveningScore,
    consistencyMultiplier: multiplier,
    specialRewardUnlocks: unlocks,
    streakBonuses
  }
}
```

## 🍎 Nutrition & Hydration Integration

### **Nutrition-Based Rewards**
```typescript
interface NutritionXPBonus {
  waterIntakeMl: number
  milkIntakeMl: number  
  mealsCompleted: number
  macroBalance: number    // 0-10 how balanced macros are
  hydrationBonus: number
  nutritionBonus: number
  rewardModifications: {
    foodRewardDiscount: number  // Discount on food rewards when eating well
    healthyChoiceUnlocks: string[]
  }
}

export const calculateNutritionBonus = (healthMetrics: DailyHealth): NutritionXPBonus => {
  const { waterIntakeMl, milkIntakeMl, meals, macros } = healthMetrics
  
  // Hydration bonus
  let hydrationBonus = 0
  if (waterIntakeMl >= 2000) { // 2L+ water
    hydrationBonus = 50
  } else if (waterIntakeMl >= 3000) { // 3L+ excellent hydration
    hydrationBonus = 100
  }
  
  // Milk bonus (if that's part of your health goals)
  if (milkIntakeMl >= 500) {
    hydrationBonus += 25
  }
  
  // Meal completion bonus
  const mealsCompleted = Object.keys(meals || {}).length
  const nutritionBonus = mealsCompleted * 25 // 25 XP per meal
  
  // Macro balance (if tracked)
  const macroBalance = calculateMacroBalance(macros)
  
  // Food reward discounts when eating well
  let foodDiscount = 0
  const unlocks = []
  
  if (hydrationBonus >= 50 && nutritionBonus >= 75) {
    foodDiscount = 0.3 // 30% off food rewards when eating/drinking well
    unlocks.push("Healthy Living Discount", "Nutrition Champion")
  }
  
  if (macroBalance >= 8) {
    unlocks.push("Macro Master", "Balanced Nutrition Rewards")
  }
  
  return {
    waterIntakeMl,
    milkIntakeMl,
    mealsCompleted,
    macroBalance,
    hydrationBonus,
    nutritionBonus,
    rewardModifications: {
      foodRewardDiscount: foodDiscount,
      healthyChoiceUnlocks: unlocks
    }
  }
}
```

## 🎯 Complete Life Integration Service

### **Master Life Bonus Calculator**
```typescript
export interface CompleteLaifeBonusCalculation {
  sleepBonus: SleepXPBonus
  wellbeingBonus: WellbeingXPBonus  
  workoutBonus: WorkoutXPBonus
  habitModifier: DigitalHabitsXPModifier
  routineBonus: RoutineConsistencyBonus
  nutritionBonus: NutritionXPBonus
  
  // Combined effects
  totalXPMultiplier: number
  totalXPBonus: number
  totalXPPenalty: number
  
  // Reward modifications
  availableRewards: string[]
  restrictedRewards: string[]
  discountedRewards: { name: string, discount: number }[]
  
  // Psychology
  overallMotivation: string
  todaysFocus: string
  rewardRecommendation: string
}

export const calculateCompleteLifeBonus = async (
  userId: string,
  date: string = today()
): Promise<CompleteLaifeBonusCalculation> => {
  
  // Fetch all life data for today
  const [health, habits, routines, workouts] = await Promise.all([
    getDailyHealth(userId, date),
    getDailyHabits(userId, date), 
    getDailyRoutines(userId, date),
    getDailyWorkouts(userId, date)
  ])
  
  // Calculate all bonuses
  const sleepBonus = calculateSleepBonus(health)
  const wellbeingBonus = calculateWellbeingBonus(health)
  const workoutBonus = calculateWorkoutBonus(workouts[0])
  const habitModifier = calculateHabitModifier(habits)
  const routineBonus = calculateRoutineBonus(routines)
  const nutritionBonus = calculateNutritionBonus(health)
  
  // Combine multipliers
  const totalMultiplier = Math.min(3.0, // Cap at 3x
    sleepBonus.xpMultiplier *
    wellbeingBonus.combinedMultiplier *
    workoutBonus.multiplier *
    routineBonus.consistencyMultiplier
  )
  
  // Combine bonuses and penalties
  const totalBonus = workoutBonus.xpBonus + habitModifier.xpBonus + nutritionBonus.hydrationBonus + nutritionBonus.nutritionBonus
  const totalPenalty = habitModifier.xpPenalty
  
  // Determine available/restricted rewards
  const availableRewards = [
    ...workoutBonus.rewardUnlocks,
    ...habitModifier.rewardUnlocks,
    ...routineBonus.specialRewardUnlocks,
    ...nutritionBonus.rewardModifications.healthyChoiceUnlocks
  ]
  
  const restrictedRewards = [...habitModifier.rewardRestrictions]
  
  // Psychology and motivation
  let overallMotivation = "Standard day"
  let todaysFocus = "Balanced productivity"
  let rewardRec = "Standard rewards available"
  
  if (totalMultiplier >= 2.0) {
    overallMotivation = "🚀 PEAK PERFORMANCE DAY! Everything is optimized!"
    todaysFocus = "Maximum achievement - go for big goals!"
    rewardRec = "You've earned premium rewards - treat yourself well!"
  } else if (totalMultiplier >= 1.5) {
    overallMotivation = "💪 Strong performance day - firing on most cylinders"
    todaysFocus = "High productivity with good life balance"
    rewardRec = "Solid performance deserves quality rewards"
  } else if (totalMultiplier < 1.0) {
    overallMotivation = "😔 Recovery needed - focus on self-care"
    todaysFocus = "Gentle productivity, prioritize rest and health" 
    rewardRec = "Focus on health and rest rewards over indulgence"
  }
  
  return {
    sleepBonus,
    wellbeingBonus,
    workoutBonus, 
    habitModifier,
    routineBonus,
    nutritionBonus,
    totalXPMultiplier: totalMultiplier,
    totalXPBonus: totalBonus,
    totalXPPenalty: totalPenalty,
    availableRewards,
    restrictedRewards,
    discountedRewards: [
      {
        name: "Food Rewards",
        discount: nutritionBonus.rewardModifications.foodRewardDiscount
      }
    ],
    overallMotivation,
    todaysFocus,
    rewardRecommendation: rewardRec
  }
}
```

## 🎨 UI Integration Examples

### **Life Stats Dashboard**
```typescript
export const LifeStatsXPDashboard = () => {
  const { lifeBonus, xpBalance } = useEnhancedGamification()
  
  return (
    <div className="life-stats-xp-dashboard">
      <div className="multiplier-display">
        <h3>Today's XP Multiplier: {lifeBonus.totalXPMultiplier.toFixed(1)}x</h3>
        <p className="motivation-message">{lifeBonus.overallMotivation}</p>
      </div>
      
      <div className="bonus-breakdown">
        <div className="bonus-item">
          🌙 Sleep: {lifeBonus.sleepBonus.xpMultiplier}x
          <span className="bonus-message">{lifeBonus.sleepBonus.bonusMessage}</span>
        </div>
        
        <div className="bonus-item">
          💪 Workout: +{lifeBonus.workoutBonus.xpBonus} XP
          <span className="bonus-message">{lifeBonus.workoutBonus.motivationMessage}</span>
        </div>
        
        <div className="bonus-item">
          🧘 Habits: {lifeBonus.habitModifier.xpBonus - lifeBonus.habitModifier.xpPenalty} XP
          <span className="bonus-message">{lifeBonus.habitModifier.psychologyMessage}</span>
        </div>
      </div>
      
      <div className="reward-status">
        {lifeBonus.availableRewards.length > 0 && (
          <div className="unlocked-rewards">
            <h4>🎁 Special Rewards Unlocked:</h4>
            {lifeBonus.availableRewards.map(reward => (
              <span key={reward} className="unlocked-badge">{reward}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

This complete life integration transforms **every aspect of your daily routine** into XP bonuses and psychological motivation - making your entire lifestyle part of the gamification system! 🏃‍♂️💪✨