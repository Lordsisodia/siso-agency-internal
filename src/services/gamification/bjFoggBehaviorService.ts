/**
 * 🎯 BJ Fogg Behavior Model Integration
 * Implements the MAT (Motivation-Ability-Trigger) framework for sustainable habit formation
 * Based on Stanford's Behavior Design Lab research + 2024 updates
 */

// =====================================================
// 🧠 BJ FOGG BEHAVIOR MODEL CORE FRAMEWORK
// =====================================================

export interface BehaviorTrigger {
  motivation: number; // 1-10 scale: user's drive to perform behavior
  ability: number; // 1-10 scale: how easy the behavior is to perform
  trigger: TriggerData; // The prompt that initiates behavior
  likelihood: number; // 0-1 calculated probability of behavior occurring
  foggScore: number; // Overall MAT assessment
  optimization: TriggerOptimization;
}

export interface TriggerData {
  type: 'spark' | 'facilitator' | 'signal';
  timing: 'immediate' | 'scheduled' | 'contextual';
  content: string;
  urgency: 'low' | 'medium' | 'high';
  personalization: number; // 0-1 how personalized the trigger is
}

export interface TriggerOptimization {
  suggestedChanges: string[];
  motivationBoosts: MotivationBoost[];
  abilityImprovements: AbilityImprovement[];
  triggerEnhancements: TriggerEnhancement[];
  predictedImprovement: number; // Expected increase in behavior likelihood
}

export interface MotivationBoost {
  type: 'hope' | 'fear' | 'social' | 'achievement' | 'purpose';
  description: string;
  impact: number; // 0-1 expected motivation increase
  ethical: boolean; // Fogg emphasizes hope as most ethical motivator
}

export interface AbilityImprovement {
  factor: 'time' | 'money' | 'physical' | 'brain' | 'routine' | 'social';
  suggestion: string;
  difficultyReduction: number; // 0-1 how much easier this makes the task
}

export interface TriggerEnhancement {
  aspect: 'timing' | 'content' | 'channel' | 'personalization';
  improvement: string;
  effectiveness: number; // 0-1 expected trigger improvement
}

// =====================================================
// 🎯 TINY HABITS IMPLEMENTATION
// =====================================================

export interface TinyHabit {
  anchor: string; // Existing behavior that triggers the tiny habit
  behavior: string; // The tiny behavior to perform
  celebration: string; // Immediate celebration after behavior
  difficulty: number; // 1-3 scale (tiny habits must be easy)
  clarity: number; // 1-10 how clear the behavior definition is
  motivation: number; // Current motivation level for this habit
  successRate: number; // 0-1 recent success rate
}

export interface TinyHabitChain {
  id: string;
  name: string;
  habits: TinyHabit[];
  totalDifficulty: number;
  chainStrength: number; // How well habits connect
  progressTowards: string; // Larger goal this chain serves
}

export interface HabitFormationPlan {
  goalBehavior: string; // Ultimate behavior we want
  tinyHabits: TinyHabit[]; // Chain of tiny habits leading to goal
  timeframe: number; // Days to establish each habit
  milestones: HabitMilestone[];
  celebrationScript: CelebrationScript;
}

export interface HabitMilestone {
  day: number;
  behaviorTarget: string;
  celebration: string;
  difficultyIncrease?: number;
}

export interface CelebrationScript {
  immediate: string[]; // Right after behavior (2-3 seconds)
  daily: string[]; // End of day reflection
  weekly: string[]; // Weekly milestone celebrations
  custom: { trigger: string; celebration: string }[];
}

// =====================================================
// 🎯 BJ FOGG BEHAVIOR ENGINE
// =====================================================

export class BJFoggBehaviorEngine {
  
  /**
   * 📊 Assess MAT (Motivation-Ability-Trigger) for any behavior
   * Core of Fogg Behavior Model
   */
  static assessMAT(
    user: {
      currentMotivation?: number;
      skillLevel?: number;
      availableTime?: number;
      energy?: number;
      environmentalFactors?: string[];
    },
    task: {
      title: string;
      description?: string;
      estimatedMinutes?: number;
      difficulty?: number;
      priority?: string;
      requiredSkills?: string[];
    },
    context: {
      timeOfDay?: 'morning' | 'afternoon' | 'evening';
      location?: string;
      distractions?: number; // 0-1 scale
      socialSupport?: number; // 0-1 scale
    } = {}
  ): BehaviorTrigger {
    
    // 🔥 MOTIVATION Assessment (1-10)
    let motivation = user.currentMotivation || 5;
    
    // Adjust for task priority
    if (task.priority === 'CRITICAL') motivation += 2;
    else if (task.priority === 'HIGH') motivation += 1;
    else if (task.priority === 'LOW') motivation -= 1;
    
    // Time-based motivation adjustments
    if (context.timeOfDay === 'morning') motivation += 0.5; // Morning motivation bonus
    if (user.energy && user.energy < 0.3) motivation -= 1; // Low energy penalty
    
    motivation = Math.min(10, Math.max(1, motivation));
    
    // 💪 ABILITY Assessment (1-10)
    let ability = 5; // Base ability
    
    // Time factor (Fogg's 6 simplicity factors)
    if (task.estimatedMinutes) {
      if (task.estimatedMinutes <= 5) ability += 3; // Very quick = high ability
      else if (task.estimatedMinutes <= 15) ability += 2;
      else if (task.estimatedMinutes <= 30) ability += 1;
      else if (task.estimatedMinutes > 60) ability -= 2; // Long tasks = lower ability
    }
    
    // Brain cycles factor
    if (task.difficulty) {
      ability -= Math.floor(task.difficulty / 2); // Harder tasks = lower ability
    }
    
    // Physical effort factor
    if (user.energy) {
      ability += (user.energy - 0.5) * 2; // Higher energy = higher ability
    }
    
    // Money factor (not applicable for most tasks, but included for completeness)
    // Social deviance factor (how much does this go against social norms)
    if (context.socialSupport) {
      ability += context.socialSupport; // Social support increases ability
    }
    
    // Non-routine factor
    const isRoutine = this.isRoutineBehavior(task.title);
    if (!isRoutine) ability -= 0.5;
    
    ability = Math.min(10, Math.max(1, ability));
    
    // 🔔 TRIGGER Assessment
    const trigger = this.generateOptimalTrigger(motivation, ability, task, context);
    
    // 📊 Calculate Fogg Score and Likelihood
    const foggScore = this.calculateFoggScore(motivation, ability, trigger);
    const likelihood = this.calculateBehaviorLikelihood(motivation, ability, trigger);
    
    // 🎯 Generate optimization recommendations
    const optimization = this.generateOptimizationPlan(motivation, ability, trigger, task);
    
    return {
      motivation,
      ability,
      trigger,
      likelihood,
      foggScore,
      optimization
    };
  }
  
  /**
   * 🔔 Generate optimal trigger based on MAT assessment
   */
  private static generateOptimalTrigger(
    motivation: number,
    ability: number,
    task: any,
    context: any
  ): TriggerData {
    let type: TriggerData['type'];
    let content: string;
    let urgency: TriggerData['urgency'] = 'medium';
    let timing: TriggerData['timing'] = 'immediate';
    
    // Determine trigger type based on Fogg's framework
    if (motivation >= 6 && ability >= 6) {
      // High motivation + High ability = Signal (simple reminder)
      type = 'signal';
      content = `⚡ Ready to tackle: ${task.title}`;
      urgency = 'low';
    } else if (motivation >= 6 && ability < 6) {
      // High motivation + Low ability = Facilitator (make it easier)
      type = 'facilitator';
      content = `🛠️ Let's simplify: ${task.title} - start with just 5 minutes`;
      urgency = 'medium';
    } else if (motivation < 6 && ability >= 6) {
      // Low motivation + High ability = Spark (increase motivation)
      type = 'spark';
      content = `🔥 Quick win opportunity: ${task.title} - you've got this!`;
      urgency = 'high';
    } else {
      // Low motivation + Low ability = Complex trigger needed
      type = 'spark';
      content = `🌟 Tiny step forward: Start ${task.title} for just 2 minutes`;
      urgency = 'high';
      timing = 'contextual';
    }
    
    // Personalization based on context
    let personalization = 0.5; // Base personalization
    if (context.timeOfDay) personalization += 0.2;
    if (context.location) personalization += 0.1;
    personalization = Math.min(1.0, personalization);
    
    return {
      type,
      timing,
      content,
      urgency,
      personalization
    };
  }
  
  /**
   * 📊 Calculate Fogg Score (overall MAT effectiveness)
   */
  private static calculateFoggScore(
    motivation: number,
    ability: number,
    trigger: TriggerData
  ): number {
    // Fogg model: Behavior occurs above the activation threshold
    // Score based on how far above the threshold the MAT combination is
    
    const triggerStrength = this.calculateTriggerStrength(trigger);
    const matProduct = motivation * ability * triggerStrength;
    
    // Normalize to 0-10 scale
    return Math.min(10, matProduct / 100);
  }
  
  /**
   * 🎯 Calculate likelihood of behavior occurring (0-1)
   */
  private static calculateBehaviorLikelihood(
    motivation: number,
    ability: number,
    trigger: TriggerData
  ): number {
    const foggScore = this.calculateFoggScore(motivation, ability, trigger);
    
    // Convert Fogg score to probability using logistic function
    // This ensures behaviors above threshold are likely, below are unlikely
    const threshold = 5; // Activation threshold
    const likelihood = 1 / (1 + Math.exp(-(foggScore - threshold)));
    
    return Math.round(likelihood * 100) / 100; // Round to 2 decimal places
  }
  
  private static calculateTriggerStrength(trigger: TriggerData): number {
    let strength = 1.0;
    
    // Type strength
    if (trigger.type === 'spark') strength *= 1.3; // Sparks are strongest
    else if (trigger.type === 'facilitator') strength *= 1.2;
    else strength *= 1.0; // Signals are baseline
    
    // Urgency strength
    if (trigger.urgency === 'high') strength *= 1.2;
    else if (trigger.urgency === 'low') strength *= 0.9;
    
    // Personalization strength
    strength *= (0.8 + trigger.personalization * 0.4); // 0.8 to 1.2 range
    
    return strength;
  }
  
  /**
   * 🎯 Generate optimization plan to improve behavior success
   */
  private static generateOptimizationPlan(
    motivation: number,
    ability: number,
    trigger: TriggerData,
    task: any
  ): TriggerOptimization {
    const suggestedChanges: string[] = [];
    const motivationBoosts: MotivationBoost[] = [];
    const abilityImprovements: AbilityImprovement[] = [];
    const triggerEnhancements: TriggerEnhancement[] = [];
    
    // 🔥 Motivation optimizations
    if (motivation < 6) {
      // Hope-based motivation (Fogg's most ethical approach)
      motivationBoosts.push({
        type: 'hope',
        description: 'Connect this task to your larger goals and aspirations',
        impact: 0.3,
        ethical: true
      });
      
      if (task.priority !== 'HIGH' && task.priority !== 'CRITICAL') {
        motivationBoosts.push({
          type: 'purpose',
          description: 'Clarify why this task matters to you personally',
          impact: 0.25,
          ethical: true
        });
      }
      
      suggestedChanges.push('Increase motivation through hope and purpose connection');
    }
    
    // 💪 Ability optimizations
    if (ability < 6) {
      // Time factor improvement
      abilityImprovements.push({
        factor: 'time',
        suggestion: 'Break task into 5-minute micro-sessions',
        difficultyReduction: 0.4
      });
      
      // Brain cycles improvement
      if (task.difficulty && task.difficulty > 5) {
        abilityImprovements.push({
          factor: 'brain',
          suggestion: 'Simplify the first step - focus only on getting started',
          difficultyReduction: 0.3
        });
      }
      
      // Routine factor improvement
      if (!this.isRoutineBehavior(task.title)) {
        abilityImprovements.push({
          factor: 'routine',
          suggestion: 'Create a consistent context (same time, place, or preceding activity)',
          difficultyReduction: 0.2
        });
      }
      
      suggestedChanges.push('Make behavior easier through simplification and routine');
    }
    
    // 🔔 Trigger optimizations
    if (this.calculateTriggerStrength(trigger) < 1.1) {
      triggerEnhancements.push({
        aspect: 'timing',
        improvement: 'Time trigger when motivation and ability are highest',
        effectiveness: 0.25
      });
      
      if (trigger.personalization < 0.7) {
        triggerEnhancements.push({
          aspect: 'personalization',
          improvement: 'Customize trigger to personal preferences and context',
          effectiveness: 0.2
        });
      }
      
      suggestedChanges.push('Improve trigger timing and personalization');
    }
    
    // Calculate predicted improvement
    const motivationImprovement = motivationBoosts.reduce((sum, boost) => sum + boost.impact, 0);
    const abilityImprovement = abilityImprovements.reduce((sum, imp) => sum + imp.difficultyReduction, 0);
    const triggerImprovement = triggerEnhancements.reduce((sum, enh) => sum + enh.effectiveness, 0);
    
    const predictedImprovement = (motivationImprovement + abilityImprovement + triggerImprovement) / 3;
    
    return {
      suggestedChanges,
      motivationBoosts,
      abilityImprovements,
      triggerEnhancements,
      predictedImprovement: Math.min(1.0, predictedImprovement)
    };
  }
  
  private static isRoutineBehavior(taskTitle: string): boolean {
    const routineKeywords = [
      'daily', 'morning', 'evening', 'weekly', 'routine', 'regular',
      'check', 'review', 'update', 'maintenance', 'standup'
    ];
    
    return routineKeywords.some(keyword => 
      taskTitle.toLowerCase().includes(keyword)
    );
  }
  
  // =====================================================
  // 🌱 TINY HABITS CREATION ENGINE
  // =====================================================
  
  /**
   * 🌱 Create tiny habit chain for larger behavioral goal
   * Implements Fogg's Tiny Habits method
   */
  static createTinyHabits(goalBehavior: string, context: {
    currentHabits?: string[];
    availableTime?: number; // minutes per day
    skillLevel?: number;
    motivationLevel?: number;
  }): HabitFormationPlan {
    
    // Break down goal into tiny, easy behaviors
    const tinyHabits = this.generateTinyHabitChain(goalBehavior, context);
    
    // Create milestone progression
    const milestones = this.createHabitMilestones(tinyHabits);
    
    // Design celebration script (crucial for habit formation)
    const celebrationScript = this.createCelebrationScript(goalBehavior);
    
    // Calculate timeframe (Fogg recommends 7-14 days per habit)
    const timeframe = Math.max(7, Math.min(21, tinyHabits.length * 10));
    
    return {
      goalBehavior,
      tinyHabits,
      timeframe,
      milestones,
      celebrationScript
    };
  }
  
  /**
   * 🔗 Generate chain of tiny habits leading to goal
   */
  private static generateTinyHabitChain(
    goalBehavior: string,
    context: any
  ): TinyHabit[] {
    const habits: TinyHabit[] = [];
    
    // Analyze goal to determine habit chain
    const goalAnalysis = this.analyzeGoalBehavior(goalBehavior);
    
    // Find existing anchors (current habits to attach new behaviors to)
    const anchors = this.identifyPotentialAnchors(context.currentHabits || []);
    
    // Create progressive tiny habits
    for (let i = 0; i < goalAnalysis.steps.length; i++) {
      const step = goalAnalysis.steps[i];
      const anchor = anchors[i % anchors.length] || 'After I wake up';
      
      habits.push({
        anchor,
        behavior: this.makeTinyBehavior(step),
        celebration: this.generateCelebration(step),
        difficulty: Math.min(3, step.difficulty || 1),
        clarity: this.assessBehaviorClarity(this.makeTinyBehavior(step)),
        motivation: context.motivationLevel || 5,
        successRate: 0 // Will be tracked over time
      });
    }
    
    return habits;
  }
  
  private static analyzeGoalBehavior(goalBehavior: string): {
    complexity: number;
    steps: { name: string; difficulty: number }[];
    timeRequired: number;
  } {
    // Simple analysis based on keywords and structure
    const words = goalBehavior.toLowerCase().split(' ');
    const complexity = Math.min(5, Math.max(1, words.length / 3));
    
    // Break into logical steps (simplified for demo)
    const steps = [
      { name: `Start ${goalBehavior.toLowerCase()}`, difficulty: 1 },
      { name: `Continue with ${goalBehavior.toLowerCase()}`, difficulty: 2 },
      { name: `Complete ${goalBehavior.toLowerCase()}`, difficulty: 3 }
    ];
    
    return {
      complexity,
      steps,
      timeRequired: complexity * 10 // Rough estimate
    };
  }
  
  private static identifyPotentialAnchors(currentHabits: string[]): string[] {
    const defaultAnchors = [
      'After I pour my morning coffee',
      'After I sit down at my desk',
      'After I finish lunch',
      'After I check my phone',
      'After I close my laptop',
      'Before I go to bed'
    ];
    
    // Use current habits as anchors if provided, otherwise use defaults
    return currentHabits.length > 0 ? 
      currentHabits.map(habit => `After I ${habit.toLowerCase()}`) :
      defaultAnchors;
  }
  
  private static makeTinyBehavior(step: { name: string; difficulty: number }): string {
    // Make behavior as small as possible (Fogg's key principle)
    if (step.difficulty > 2) {
      return `I will do the first 2 minutes of ${step.name}`;
    } else if (step.difficulty > 1) {
      return `I will do ${step.name} for 5 minutes`;
    } else {
      return `I will ${step.name}`;
    }
  }
  
  private static generateCelebration(step: { name: string }): string {
    const celebrations = [
      'Yes! I did it!',
      'I\'m awesome!',
      'Victory dance!',
      'Boom! Nailed it!',
      'I\'m building my habit!',
      'Progress feels great!',
      'I\'m getting stronger!',
      'Success!'
    ];
    
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }
  
  private static assessBehaviorClarity(behavior: string): number {
    // Assess how clear and specific the behavior is (1-10)
    let clarity = 5; // Base clarity
    
    if (behavior.includes('I will')) clarity += 2; // Clear intention
    if (behavior.includes('for') && behavior.includes('minutes')) clarity += 2; // Specific duration
    if (behavior.includes('the first') || behavior.includes('exactly')) clarity += 1; // Specific scope
    
    return Math.min(10, clarity);
  }
  
  private static createHabitMilestones(habits: TinyHabit[]): HabitMilestone[] {
    const milestones: HabitMilestone[] = [];
    
    habits.forEach((habit, index) => {
      milestones.push({
        day: (index + 1) * 7, // Weekly milestones
        behaviorTarget: habit.behavior,
        celebration: `Week ${index + 1} complete! ${habit.celebration}`,
        difficultyIncrease: index > 2 ? 0.5 : 0 // Gradually increase difficulty
      });
    });
    
    return milestones;
  }
  
  private static createCelebrationScript(goalBehavior: string): CelebrationScript {
    return {
      immediate: [
        'Yes!',
        'I did it!',
        'Victory!',
        'Awesome!',
        'Success!'
      ],
      daily: [
        `Another day closer to mastering ${goalBehavior}!`,
        'I\'m building unstoppable habits!',
        'Progress feels amazing!',
        'I\'m becoming the person I want to be!'
      ],
      weekly: [
        `One week stronger in ${goalBehavior}!`,
        'I\'m proving I can stick to my commitments!',
        'Habit formation in action!',
        'This is becoming automatic!'
      ],
      custom: [
        {
          trigger: 'after_difficult_day',
          celebration: 'Even on tough days, I show up for myself!'
        },
        {
          trigger: 'after_missing_day',
          celebration: 'Back on track! Consistency over perfection!'
        }
      ]
    };
  }
  
  /**
   * 🎉 Process celebration after behavior completion
   * Critical for habit formation - creates positive emotional association
   */
  static celebrateSuccess(
    completedBehavior: string,
    celebrationScript: CelebrationScript,
    context: {
      streakLength?: number;
      difficulty?: number;
      timeToComplete?: number;
    } = {}
  ): {
    celebration: string;
    emotionalReward: number; // 0-1 scale
    habitStrengthIncrease: number; // How much this strengthens the habit
    nextLevelUnlock?: string;
  } {
    
    // Select appropriate celebration
    let celebration = celebrationScript.immediate[
      Math.floor(Math.random() * celebrationScript.immediate.length)
    ];
    
    // Enhance celebration based on context
    if (context.streakLength && context.streakLength >= 7) {
      celebration = celebrationScript.weekly[
        Math.floor(Math.random() * celebrationScript.weekly.length)
      ];
    } else if (context.streakLength && context.streakLength >= 1) {
      celebration = celebrationScript.daily[
        Math.floor(Math.random() * celebrationScript.daily.length)
      ];
    }
    
    // Calculate emotional reward (higher for harder behaviors and longer streaks)
    let emotionalReward = 0.5; // Base reward
    if (context.difficulty && context.difficulty > 2) emotionalReward += 0.2;
    if (context.streakLength) emotionalReward += Math.min(0.3, context.streakLength * 0.02);
    emotionalReward = Math.min(1.0, emotionalReward);
    
    // Calculate habit strength increase (Fogg's neuroplasticity insights)
    let habitStrengthIncrease = 0.1; // Base increase
    if (context.timeToComplete && context.timeToComplete < 300) { // < 5 minutes
      habitStrengthIncrease += 0.1; // Quick behaviors strengthen faster
    }
    habitStrengthIncrease += emotionalReward * 0.2; // Emotional reward strengthens habit
    
    // Check for level unlocks
    let nextLevelUnlock: string | undefined;
    if (context.streakLength === 7) {
      nextLevelUnlock = 'Habit Novice: 1 week streak achieved!';
    } else if (context.streakLength === 30) {
      nextLevelUnlock = 'Habit Master: 1 month streak achieved!';
    } else if (context.streakLength === 100) {
      nextLevelUnlock = 'Habit Legend: 100 day streak achieved!';
    }
    
    return {
      celebration,
      emotionalReward,
      habitStrengthIncrease: Math.min(1.0, habitStrengthIncrease),
      nextLevelUnlock
    };
  }
}

// =====================================================
// 🎯 BEHAVIOR DESIGN UTILITIES
// =====================================================

export class BehaviorDesignUtilities {
  
  /**
   * 📊 Generate behavior success predictions
   */
  static predictBehaviorSuccess(
    behaviorTrigger: BehaviorTrigger,
    historicalData: {
      similarBehaviors?: { success: boolean; motivation: number; ability: number }[];
      userSuccessRate?: number;
      timeOfDay?: string;
    } = {}
  ): {
    successProbability: number;
    confidenceLevel: number;
    keyRiskFactors: string[];
    successStrategies: string[];
  } {
    
    let successProbability = behaviorTrigger.likelihood;
    
    // Adjust based on historical data
    if (historicalData.userSuccessRate) {
      successProbability = (successProbability + historicalData.userSuccessRate) / 2;
    }
    
    if (historicalData.similarBehaviors && historicalData.similarBehaviors.length > 0) {
      const avgHistoricalSuccess = historicalData.similarBehaviors
        .reduce((sum, b) => sum + (b.success ? 1 : 0), 0) / historicalData.similarBehaviors.length;
      successProbability = (successProbability * 0.7) + (avgHistoricalSuccess * 0.3);
    }
    
    // Identify risk factors
    const keyRiskFactors: string[] = [];
    if (behaviorTrigger.motivation < 5) keyRiskFactors.push('Low motivation');
    if (behaviorTrigger.ability < 5) keyRiskFactors.push('High difficulty');
    if (behaviorTrigger.foggScore < 4) keyRiskFactors.push('Poor MAT alignment');
    
    // Generate success strategies
    const successStrategies: string[] = [];
    if (behaviorTrigger.optimization.motivationBoosts.length > 0) {
      successStrategies.push('Boost motivation through hope and purpose');
    }
    if (behaviorTrigger.optimization.abilityImprovements.length > 0) {
      successStrategies.push('Simplify the behavior');
    }
    if (behaviorTrigger.optimization.triggerEnhancements.length > 0) {
      successStrategies.push('Improve trigger timing and personalization');
    }
    
    // Calculate confidence level based on data quality
    let confidenceLevel = 0.5;
    if (historicalData.similarBehaviors && historicalData.similarBehaviors.length >= 5) {
      confidenceLevel += 0.3;
    }
    if (behaviorTrigger.foggScore > 6) confidenceLevel += 0.2;
    confidenceLevel = Math.min(1.0, confidenceLevel);
    
    return {
      successProbability: Math.round(successProbability * 100) / 100,
      confidenceLevel: Math.round(confidenceLevel * 100) / 100,
      keyRiskFactors,
      successStrategies
    };
  }
  
  /**
   * 🎯 Generate personalized behavior prompts
   */
  static generatePersonalizedPrompts(
    user: {
      name?: string;
      timezone?: string;
      preferredTime?: string;
      communicationStyle?: 'formal' | 'casual' | 'motivational';
    },
    behaviorTrigger: BehaviorTrigger
  ): {
    primaryPrompt: string;
    alternativePrompts: string[];
    timing: Date;
    channel: 'push' | 'email' | 'in-app' | 'sms';
  } {
    
    const style = user.communicationStyle || 'motivational';
    const name = user.name ? `, ${user.name}` : '';
    
    let primaryPrompt = '';
    let alternativePrompts: string[] = [];
    
    switch (behaviorTrigger.trigger.type) {
      case 'spark':
        if (style === 'motivational') {
          primaryPrompt = `🔥 Time to shine${name}! ${behaviorTrigger.trigger.content}`;
          alternativePrompts = [
            `💪 You've got this${name}! ${behaviorTrigger.trigger.content}`,
            `⭐ Opportunity knocking${name}! ${behaviorTrigger.trigger.content}`
          ];
        } else if (style === 'casual') {
          primaryPrompt = `Hey${name}! ${behaviorTrigger.trigger.content}`;
          alternativePrompts = [
            `Quick one${name}: ${behaviorTrigger.trigger.content}`,
            `Ready when you are${name}! ${behaviorTrigger.trigger.content}`
          ];
        } else {
          primaryPrompt = `Reminder${name}: ${behaviorTrigger.trigger.content}`;
          alternativePrompts = [
            `Task ready${name}: ${behaviorTrigger.trigger.content}`,
            `Action item${name}: ${behaviorTrigger.trigger.content}`
          ];
        }
        break;
        
      case 'facilitator':
        primaryPrompt = `🛠️ Made easier${name}: ${behaviorTrigger.trigger.content}`;
        alternativePrompts = [
          `Simple approach${name}: ${behaviorTrigger.trigger.content}`,
          `Streamlined${name}: ${behaviorTrigger.trigger.content}`
        ];
        break;
        
      case 'signal':
        primaryPrompt = `📍 Ready${name}: ${behaviorTrigger.trigger.content}`;
        alternativePrompts = [
          `Good to go${name}: ${behaviorTrigger.trigger.content}`,
          `All set${name}: ${behaviorTrigger.trigger.content}`
        ];
        break;
    }
    
    // Calculate optimal timing
    const now = new Date();
    let timing = new Date(now.getTime() + 5 * 60 * 1000); // Default: 5 minutes from now
    
    if (behaviorTrigger.trigger.timing === 'scheduled' && user.preferredTime) {
      // TODO: Parse preferred time and set accordingly
    }
    
    // Choose communication channel
    let channel: 'push' | 'email' | 'in-app' | 'sms' = 'in-app';
    if (behaviorTrigger.trigger.urgency === 'high') channel = 'push';
    if (behaviorTrigger.trigger.urgency === 'low') channel = 'email';
    
    return {
      primaryPrompt,
      alternativePrompts,
      timing,
      channel
    };
  }
}

export default {
  BJFoggBehaviorEngine,
  BehaviorDesignUtilities
};