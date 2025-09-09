/**
 * 🧠 Neuroplasticity-Based Game Engine
 * Implements 2024 neuroscience research for brain optimization through gamification
 * Focuses on neural pathway strengthening and cognitive enhancement
 */

// =====================================================
// 🧠 NEUROPLASTICITY OPTIMIZATION SYSTEM
// =====================================================

export interface NeuralPathway {
  skillId: string;
  skillName: string;
  pathwayStrength: number; // 0-1 (how strong the neural connection is)
  lastActivation: Date;
  activationCount: number;
  learningVelocity: number; // How quickly this pathway is strengthening
  retentionRate: number; // How well knowledge is retained over time
  transferability: number; // How well this skill transfers to related areas
}

export interface CognitiveChalenge {
  targetPathway: string;
  challengeType: 'repetition' | 'variation' | 'complexity' | 'speed' | 'combination';
  difficultyLevel: number; // 1-10
  neurologicalFocus: 'working_memory' | 'attention' | 'processing_speed' | 'pattern_recognition';
  expectedPathwayGrowth: number; // Predicted strengthening amount
  synapticConsolidationTime: number; // Minutes for memory consolidation
}

export interface NeuroplasticityMetrics {
  overallBrainHealth: number; // 0-1 cognitive fitness score
  activePathways: NeuralPathway[];
  learningEfficiency: number; // How efficiently user acquires new skills
  cognitiveReserve: number; // Mental resilience and capacity
  neuroplasticityPotential: number; // Capacity for brain change
  consolidationOptimization: number; // How well memories are being formed
}

export interface BrainOptimizedTask {
  originalTask: any;
  neuralTargets: string[]; // Which neural pathways this will strengthen
  cognitiveLoad: number; // Mental effort required (1-10)
  learningPhase: 'acquisition' | 'consolidation' | 'mastery' | 'transfer';
  spacingOptimization: SpacingSchedule;
  challengeProgression: CognitiveChalenge[];
  consolidationRewards: NeuralReward[];
}

export interface SpacingSchedule {
  initialInterval: number; // Minutes until first review
  intervals: number[]; // Subsequent review intervals (spaced repetition)
  forgettingCurve: number[]; // Predicted retention over time
  optimalTiming: Date[]; // When to present this skill again
}

export interface NeuralReward {
  timing: 'immediate' | 'consolidation' | 'recall' | 'transfer';
  neurotransmitter: 'dopamine' | 'serotonin' | 'oxytocin' | 'endorphins';
  trigger: string;
  brainRegion: string;
  expectedBenefit: string;
}

// =====================================================
// 🧠 NEUROPLASTICITY ENGINE
// =====================================================

export class NeuroplasticityGameEngine {
  
  /**
   * 🧠 Optimize task for neuroplasticity and brain development
   * Based on 2024 neuroscience research on skill acquisition
   */
  static optimizeTaskForBrainGrowth(
    task: {
      title: string;
      description?: string;
      skillsRequired?: string[];
      difficulty?: number;
      estimatedMinutes?: number;
    },
    userBrainProfile: {
      currentSkills: { [skillId: string]: number }; // 0-1 proficiency
      learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
      cognitiveStrengths: string[];
      neuroplasticityHistory: NeuralPathway[];
      lastLearningSession?: Date;
    }
  ): BrainOptimizedTask {
    
    // 🎯 Identify target neural pathways
    const neuralTargets = this.identifyTargetPathways(task, userBrainProfile);
    
    // 🧮 Calculate optimal cognitive load
    const cognitiveLoad = this.calculateOptimalCognitiveLoad(task, userBrainProfile);
    
    // 📚 Determine learning phase
    const learningPhase = this.assessLearningPhase(neuralTargets, userBrainProfile);
    
    // ⏰ Create spaced repetition schedule
    const spacingOptimization = this.createSpacingSchedule(learningPhase, neuralTargets);
    
    // 🎯 Design cognitive challenges
    const challengeProgression = this.designCognitiveProgression(
      neuralTargets,
      learningPhase,
      cognitiveLoad
    );
    
    // 🧬 Plan consolidation rewards
    const consolidationRewards = this.planNeuralRewards(learningPhase, neuralTargets);
    
    return {
      originalTask: task,
      neuralTargets,
      cognitiveLoad,
      learningPhase,
      spacingOptimization,
      challengeProgression,
      consolidationRewards
    };
  }
  
  /**
   * 🎯 Track neuroplasticity progress and brain development
   */
  static trackNeuroplasticityProgress(
    userId: string,
    completedTask: BrainOptimizedTask,
    performance: {
      timeToComplete: number;
      errorRate: number;
      confidenceLevel: number;
      cognitiveEffort: number; // 1-10 perceived difficulty
    },
    historicalData: NeuralPathway[]
  ): {
    updatedPathways: NeuralPathway[];
    neuroplasticityGains: { pathway: string; strengthIncrease: number }[];
    consolidationNeeded: boolean;
    nextOptimalChallenge: Date;
    brainHealthImpact: number;
  } {
    
    const updatedPathways: NeuralPathway[] = [...historicalData];
    const neuroplasticityGains: { pathway: string; strengthIncrease: number }[] = [];
    
    // 🧠 Update each targeted neural pathway
    completedTask.neuralTargets.forEach(pathwayId => {
      const existingPathway = updatedPathways.find(p => p.skillId === pathwayId);
      
      if (existingPathway) {
        // Calculate strength increase based on performance
        const baseIncrease = this.calculatePathwayStrengthening(
          performance,
          completedTask.learningPhase,
          existingPathway.pathwayStrength
        );
        
        // Apply neuroplasticity multipliers
        const plasticityMultiplier = this.getNeuroplasticityMultiplier(
          existingPathway.lastActivation,
          completedTask.spacingOptimization
        );
        
        const finalIncrease = baseIncrease * plasticityMultiplier;
        
        // Update pathway
        existingPathway.pathwayStrength = Math.min(1.0, 
          existingPathway.pathwayStrength + finalIncrease
        );
        existingPathway.lastActivation = new Date();
        existingPathway.activationCount += 1;
        existingPathway.learningVelocity = this.calculateLearningVelocity(
          existingPathway.activationCount,
          finalIncrease
        );
        
        neuroplasticityGains.push({
          pathway: pathwayId,
          strengthIncrease: finalIncrease
        });
      } else {
        // Create new pathway
        const newPathway: NeuralPathway = {
          skillId: pathwayId,
          skillName: this.getSkillName(pathwayId),
          pathwayStrength: 0.1 + (performance.confidenceLevel / 10) * 0.1,
          lastActivation: new Date(),
          activationCount: 1,
          learningVelocity: 0.1,
          retentionRate: 0.5, // Will improve with repetition
          transferability: 0.3 // Will improve with mastery
        };
        
        updatedPathways.push(newPathway);
        neuroplasticityGains.push({
          pathway: pathwayId,
          strengthIncrease: newPathway.pathwayStrength
        });
      }
    });
    
    // 🧬 Assess consolidation needs
    const consolidationNeeded = this.assessConsolidationNeeds(
      neuroplasticityGains,
      performance.cognitiveEffort
    );
    
    // ⏰ Calculate next optimal challenge timing
    const nextOptimalChallenge = this.calculateNextChallengeTiming(
      completedTask.spacingOptimization,
      neuroplasticityGains
    );
    
    // 🏥 Calculate brain health impact
    const brainHealthImpact = this.calculateBrainHealthImpact(
      neuroplasticityGains,
      completedTask.cognitiveLoad,
      performance
    );
    
    return {
      updatedPathways,
      neuroplasticityGains,
      consolidationNeeded,
      nextOptimalChallenge,
      brainHealthImpact
    };
  }
  
  // PRIVATE HELPER METHODS
  
  private static identifyTargetPathways(task: any, userProfile: any): string[] {
    const pathways: string[] = [];
    
    // Analyze task requirements for neural pathway targeting
    if (task.skillsRequired) {
      pathways.push(...task.skillsRequired);
    }
    
    // Infer pathways from task content
    const taskContent = (task.title + ' ' + (task.description || '')).toLowerCase();
    
    if (taskContent.includes('problem') || taskContent.includes('debug')) {
      pathways.push('problem_solving', 'analytical_thinking');
    }
    if (taskContent.includes('creative') || taskContent.includes('design')) {
      pathways.push('creative_thinking', 'pattern_recognition');
    }
    if (taskContent.includes('write') || taskContent.includes('document')) {
      pathways.push('linguistic_processing', 'working_memory');
    }
    if (taskContent.includes('plan') || taskContent.includes('organize')) {
      pathways.push('executive_function', 'strategic_thinking');
    }
    
    return [...new Set(pathways)]; // Remove duplicates
  }
  
  private static calculateOptimalCognitiveLoad(task: any, userProfile: any): number {
    let cognitiveLoad = 5; // Base load
    
    // Adjust based on task complexity
    if (task.difficulty) {
      cognitiveLoad = task.difficulty;
    }
    
    // Adjust based on user's cognitive strengths
    const relevantStrengths = userProfile.cognitiveStrengths || [];
    const taskAlignment = this.calculateTaskAlignmentWithStrengths(task, relevantStrengths);
    
    // Reduce cognitive load if task aligns with user strengths
    cognitiveLoad *= (1 - taskAlignment * 0.2);
    
    // Time pressure affects cognitive load
    if (task.estimatedMinutes && task.estimatedMinutes < 15) {
      cognitiveLoad += 1; // Time pressure increases load
    }
    
    return Math.min(10, Math.max(1, Math.round(cognitiveLoad)));
  }
  
  private static assessLearningPhase(
    neuralTargets: string[],
    userProfile: any
  ): 'acquisition' | 'consolidation' | 'mastery' | 'transfer' {
    
    const userSkills = userProfile.currentSkills || {};
    const relevantSkillLevels = neuralTargets.map(target => userSkills[target] || 0);
    const averageSkillLevel = relevantSkillLevels.reduce((a, b) => a + b, 0) / relevantSkillLevels.length;
    
    if (averageSkillLevel < 0.3) return 'acquisition'; // Learning new skills
    if (averageSkillLevel < 0.6) return 'consolidation'; // Strengthening existing skills
    if (averageSkillLevel < 0.9) return 'mastery'; // Perfecting skills
    return 'transfer'; // Applying skills to new contexts
  }
  
  private static createSpacingSchedule(
    learningPhase: 'acquisition' | 'consolidation' | 'mastery' | 'transfer',
    neuralTargets: string[]
  ): SpacingSchedule {
    
    // Spaced repetition intervals based on Ebbinghaus forgetting curve + 2024 research
    let intervals: number[] = [];
    
    switch (learningPhase) {
      case 'acquisition':
        intervals = [10, 60, 240, 1440, 4320]; // 10min, 1hr, 4hr, 1day, 3days
        break;
      case 'consolidation':
        intervals = [60, 480, 1440, 7200, 21600]; // 1hr, 8hr, 1day, 5days, 15days
        break;
      case 'mastery':
        intervals = [1440, 10080, 43200, 129600]; // 1day, 1week, 1month, 3months
        break;
      case 'transfer':
        intervals = [10080, 43200, 129600, 259200]; // 1week, 1month, 3months, 6months
        break;
    }
    
    // Calculate forgetting curve prediction
    const forgettingCurve = intervals.map((interval, index) => {
      // Exponential decay with repetition strengthening
      const decayRate = 0.3 / (index + 1); // Decay slows with repetition
      return Math.exp(-decayRate * interval / 1440); // Normalize to days
    });
    
    // Generate optimal timing dates
    const now = new Date();
    const optimalTiming = intervals.map(interval => 
      new Date(now.getTime() + interval * 60 * 1000)
    );
    
    return {
      initialInterval: intervals[0],
      intervals,
      forgettingCurve,
      optimalTiming
    };
  }
  
  private static designCognitiveProgression(
    neuralTargets: string[],
    learningPhase: string,
    cognitiveLoad: number
  ): CognitiveChalenge[] {
    const challenges: CognitiveChalenge[] = [];
    
    neuralTargets.forEach(pathway => {
      // Create challenges that progressively strengthen this pathway
      const baseDifficulty = Math.max(1, cognitiveLoad - 2);
      
      // Repetition challenge (strengthen existing connections)
      challenges.push({
        targetPathway: pathway,
        challengeType: 'repetition',
        difficultyLevel: baseDifficulty,
        neurologicalFocus: this.getPathwayFocus(pathway),
        expectedPathwayGrowth: 0.05,
        synapticConsolidationTime: 10
      });
      
      // Variation challenge (create new neural branches)
      if (learningPhase !== 'acquisition') {
        challenges.push({
          targetPathway: pathway,
          challengeType: 'variation',
          difficultyLevel: baseDifficulty + 1,
          neurologicalFocus: this.getPathwayFocus(pathway),
          expectedPathwayGrowth: 0.08,
          synapticConsolidationTime: 15
        });
      }
      
      // Complexity challenge (integrate multiple pathways)
      if (learningPhase === 'mastery' || learningPhase === 'transfer') {
        challenges.push({
          targetPathway: pathway,
          challengeType: 'complexity',
          difficultyLevel: baseDifficulty + 2,
          neurologicalFocus: 'pattern_recognition',
          expectedPathwayGrowth: 0.12,
          synapticConsolidationTime: 20
        });
      }
    });
    
    return challenges;
  }
  
  private static planNeuralRewards(
    learningPhase: string,
    neuralTargets: string[]
  ): NeuralReward[] {
    const rewards: NeuralReward[] = [];
    
    // Immediate dopamine reward (during task execution)
    rewards.push({
      timing: 'immediate',
      neurotransmitter: 'dopamine',
      trigger: 'Progress indicator shows advancement',
      brainRegion: 'Ventral striatum',
      expectedBenefit: 'Motivation maintenance during task'
    });
    
    // Serotonin reward (remembering past success)
    rewards.push({
      timing: 'recall',
      neurotransmitter: 'serotonin',
      trigger: 'Achievement gallery shows previous successes',
      brainRegion: 'Raphe nuclei',
      expectedBenefit: 'Mood boost and confidence building'
    });
    
    // Consolidation reward (memory formation)
    if (learningPhase === 'acquisition' || learningPhase === 'consolidation') {
      rewards.push({
        timing: 'consolidation',
        neurotransmitter: 'dopamine',
        trigger: 'Skill mastery milestone reached',
        brainRegion: 'Hippocampus-striatum circuit',
        expectedBenefit: 'Long-term memory formation'
      });
    }
    
    // Social reward (oxytocin for cooperation)
    if (neuralTargets.includes('collaboration') || neuralTargets.includes('communication')) {
      rewards.push({
        timing: 'immediate',
        neurotransmitter: 'oxytocin',
        trigger: 'Successful team interaction or helping others',
        brainRegion: 'Hypothalamus',
        expectedBenefit: 'Social bonding and cooperation motivation'
      });
    }
    
    return rewards;
  }
  
  /**
   * 🧬 Calculate neuroplasticity gains from completed activity
   */
  private static calculatePathwayStrengthening(
    performance: any,
    learningPhase: string,
    currentStrength: number
  ): number {
    let baseIncrease = 0.02; // 2% base increase
    
    // Performance-based multipliers
    if (performance.errorRate < 0.1) baseIncrease *= 1.5; // Low errors = good learning
    if (performance.confidenceLevel > 7) baseIncrease *= 1.3; // High confidence = solid learning
    if (performance.cognitiveEffort >= 6 && performance.cognitiveEffort <= 8) {
      baseIncrease *= 1.4; // Optimal effort zone (not too easy, not overwhelming)
    }
    
    // Learning phase multipliers
    switch (learningPhase) {
      case 'acquisition':
        baseIncrease *= 2.0; // Maximum growth during initial learning
        break;
      case 'consolidation':
        baseIncrease *= 1.5; // Good growth during strengthening
        break;
      case 'mastery':
        baseIncrease *= 1.0; // Standard growth during refinement
        break;
      case 'transfer':
        baseIncrease *= 0.8; // Slower but higher quality growth
        break;
    }
    
    // Diminishing returns for very strong pathways
    if (currentStrength > 0.8) {
      baseIncrease *= (1 - currentStrength); // Logarithmic growth curve
    }
    
    return Math.min(0.1, baseIncrease); // Cap at 10% per session
  }
  
  private static getNeuroplasticityMultiplier(
    lastActivation: Date,
    spacingSchedule: SpacingSchedule
  ): number {
    const timeSinceLastActivation = Date.now() - lastActivation.getTime();
    const hoursSince = timeSinceLastActivation / (1000 * 60 * 60);
    
    // Optimal spacing enhances neuroplasticity
    const optimalHours = spacingSchedule.initialInterval / 60;
    
    if (hoursSince < optimalHours * 0.5) {
      return 0.7; // Too soon - reduced plasticity
    } else if (hoursSince <= optimalHours * 1.5) {
      return 1.3; // Optimal timing - enhanced plasticity
    } else if (hoursSince <= optimalHours * 3) {
      return 1.0; // Good timing - normal plasticity
    } else {
      return 0.8; // Too late - some forgetting occurred
    }
  }
  
  private static calculateLearningVelocity(
    activationCount: number,
    recentIncrease: number
  ): number {
    // Learning velocity shows how quickly pathways are strengthening
    const baseVelocity = recentIncrease * 10; // Scale to 0-1
    
    // Account for learning curve (fast initial learning, then plateaus)
    const learningCurveAdjustment = 1 / Math.sqrt(activationCount + 1);
    
    return Math.min(1.0, baseVelocity * (0.5 + learningCurveAdjustment));
  }
  
  private static assessConsolidationNeeds(
    gains: { pathway: string; strengthIncrease: number }[],
    cognitiveEffort: number
  ): boolean {
    // High cognitive effort or significant gains indicate need for consolidation
    const totalGains = gains.reduce((sum, gain) => sum + gain.strengthIncrease, 0);
    
    return cognitiveEffort >= 7 || totalGains > 0.15;
  }
  
  private static calculateNextChallengeTiming(
    spacingSchedule: SpacingSchedule,
    gains: { pathway: string; strengthIncrease: number }[]
  ): Date {
    // More significant gains = longer consolidation time needed
    const totalGains = gains.reduce((sum, gain) => sum + gain.strengthIncrease, 0);
    const consolidationMultiplier = 1 + totalGains * 2; // More gains = more time
    
    const baseInterval = spacingSchedule.intervals[0] * consolidationMultiplier;
    return new Date(Date.now() + baseInterval * 60 * 1000);
  }
  
  private static calculateBrainHealthImpact(
    gains: any[],
    cognitiveLoad: number,
    performance: any
  ): number {
    let healthImpact = 0.1; // Base positive impact
    
    // Learning new things is good for brain health
    healthImpact += gains.length * 0.05;
    
    // Optimal cognitive load is healthiest (not too easy, not overwhelming)
    if (cognitiveLoad >= 4 && cognitiveLoad <= 7) {
      healthImpact += 0.1;
    }
    
    // Good performance indicates healthy brain function
    if (performance.confidenceLevel > 6 && performance.errorRate < 0.3) {
      healthImpact += 0.05;
    }
    
    return Math.min(1.0, healthImpact);
  }
  
  private static getPathwayFocus(pathway: string): 'working_memory' | 'attention' | 'processing_speed' | 'pattern_recognition' {
    const focusMap: { [key: string]: any } = {
      'problem_solving': 'working_memory',
      'analytical_thinking': 'working_memory',
      'creative_thinking': 'pattern_recognition',
      'attention_control': 'attention',
      'processing_speed': 'processing_speed',
      'pattern_recognition': 'pattern_recognition',
      'linguistic_processing': 'working_memory',
      'executive_function': 'attention',
      'strategic_thinking': 'working_memory'
    };
    
    return focusMap[pathway] || 'working_memory';
  }
  
  private static getSkillName(skillId: string): string {
    const nameMap: { [key: string]: string } = {
      'problem_solving': 'Problem Solving',
      'analytical_thinking': 'Analytical Thinking',
      'creative_thinking': 'Creative Thinking',
      'pattern_recognition': 'Pattern Recognition',
      'linguistic_processing': 'Language Processing',
      'executive_function': 'Executive Function',
      'strategic_thinking': 'Strategic Thinking',
      'working_memory': 'Working Memory',
      'attention_control': 'Attention Control'
    };
    
    return nameMap[skillId] || skillId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  private static calculateTaskAlignmentWithStrengths(task: any, strengths: string[]): number {
    const taskContent = (task.title + ' ' + (task.description || '')).toLowerCase();
    let alignment = 0;
    
    strengths.forEach(strength => {
      if (taskContent.includes(strength.toLowerCase())) {
        alignment += 0.2;
      }
    });
    
    return Math.min(1.0, alignment);
  }
}

// =====================================================
// 🧬 NEURAL ENHANCEMENT UTILITIES
// =====================================================

export class NeuralEnhancementUtilities {
  
  /**
   * 🎯 Generate brain training micro-games
   */
  static generateBrainTrainingMicrogames(
    targetPathway: string,
    currentStrength: number,
    timeAvailable: number // minutes
  ): {
    microgame: {
      name: string;
      description: string;
      duration: number;
      neuralTarget: string;
      difficultyLevel: number;
    };
    learningObjective: string;
    expectedGains: number;
  } {
    
    const microgames = {
      'working_memory': [
        {
          name: 'Pattern Hold',
          description: 'Remember and reproduce increasingly complex patterns',
          neuralTarget: 'Prefrontal cortex working memory circuits',
          learningObjective: 'Strengthen short-term memory capacity'
        },
        {
          name: 'Dual N-Back',
          description: 'Track visual and auditory sequences simultaneously',
          neuralTarget: 'Dorsolateral prefrontal cortex',
          learningObjective: 'Improve multi-modal working memory'
        }
      ],
      'attention_control': [
        {
          name: 'Focus Filter',
          description: 'Maintain attention on target while ignoring distractors',
          neuralTarget: 'Anterior cingulate cortex',
          learningObjective: 'Enhance selective attention control'
        },
        {
          name: 'Attention Switch',
          description: 'Rapidly shift focus between different task demands',
          neuralTarget: 'Frontoparietal attention network',
          learningObjective: 'Improve cognitive flexibility'
        }
      ],
      'pattern_recognition': [
        {
          name: 'Sequence Detective',
          description: 'Identify hidden patterns in complex sequences',
          neuralTarget: 'Visual cortex and hippocampus',
          learningObjective: 'Strengthen pattern detection abilities'
        },
        {
          name: 'Analogy Builder',
          description: 'Find connections between seemingly unrelated concepts',
          neuralTarget: 'Right hemisphere and corpus callosum',
          learningObjective: 'Enhance analogical reasoning'
        }
      ]
    };
    
    const availableGames = microgames[targetPathway as keyof typeof microgames] || microgames['working_memory'];
    const selectedGame = availableGames[Math.floor(Math.random() * availableGames.length)];
    
    // Adjust difficulty based on current pathway strength
    const difficultyLevel = Math.max(1, Math.min(10, 
      Math.round(currentStrength * 10) + 1
    ));
    
    // Fit duration to available time
    const duration = Math.min(timeAvailable, Math.max(3, timeAvailable * 0.7));
    
    // Calculate expected gains (more difficult = more potential gains)
    const expectedGains = (difficultyLevel / 10) * 0.1 * (duration / 10);
    
    return {
      microgame: {
        ...selectedGame,
        duration,
        difficultyLevel
      },
      learningObjective: selectedGame.learningObjective,
      expectedGains: Math.min(0.2, expectedGains)
    };
  }
  
  /**
   * 🧠 Assess cognitive fatigue and recovery needs
   */
  static assessCognitiveFatigue(
    recentCognitiveLoad: { timestamp: Date; load: number; duration: number }[],
    currentSession: { duration: number; averageLoad: number }
  ): {
    fatigueLevel: number; // 0-1 (1 = exhausted)
    cognitiveCapacity: number; // 0-1 remaining mental energy
    recommendedBreakType: 'micro' | 'short' | 'extended' | 'none';
    recoveryTime: number; // minutes needed for full recovery
    brainHealthWarnings: string[];
  } {
    
    // Calculate cumulative cognitive load over last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const recentLoad = recentCognitiveLoad
      .filter(session => session.timestamp > fourHoursAgo)
      .reduce((sum, session) => sum + (session.load * session.duration), 0);
    
    // Current session impact
    const currentLoad = currentSession.averageLoad * currentSession.duration;
    const totalLoad = recentLoad + currentLoad;
    
    // Calculate fatigue (based on total cognitive work)
    let fatigueLevel = Math.min(1.0, totalLoad / 1000); // Normalize
    
    // Session length fatigue (diminishing returns after 90 minutes)
    if (currentSession.duration > 90) {
      fatigueLevel += (currentSession.duration - 90) / 300;
    }
    
    fatigueLevel = Math.min(1.0, fatigueLevel);
    
    // Calculate remaining cognitive capacity
    const cognitiveCapacity = Math.max(0, 1 - fatigueLevel);
    
    // Recommend break type
    let recommendedBreakType: 'micro' | 'short' | 'extended' | 'none' = 'none';
    let recoveryTime = 0;
    
    if (fatigueLevel > 0.8) {
      recommendedBreakType = 'extended';
      recoveryTime = 60; // 1 hour for high fatigue
    } else if (fatigueLevel > 0.6) {
      recommendedBreakType = 'short';
      recoveryTime = 20; // 20 minutes for moderate fatigue
    } else if (fatigueLevel > 0.4) {
      recommendedBreakType = 'micro';
      recoveryTime = 5; // 5 minutes for mild fatigue
    }
    
    // Generate brain health warnings
    const brainHealthWarnings: string[] = [];
    if (fatigueLevel > 0.9) {
      brainHealthWarnings.push('🚨 Extreme cognitive fatigue - risk of impaired decision making');
    }
    if (currentSession.duration > 180) {
      brainHealthWarnings.push('⚠️ Extended session may impair memory consolidation');
    }
    if (recentLoad > 800) {
      brainHealthWarnings.push('🧠 High cognitive load period - ensure adequate rest');
    }
    
    return {
      fatigueLevel: Math.round(fatigueLevel * 100) / 100,
      cognitiveCapacity: Math.round(cognitiveCapacity * 100) / 100,
      recommendedBreakType,
      recoveryTime,
      brainHealthWarnings
    };
  }
  
  /**
   * 🎯 Optimize learning consolidation timing
   * Based on sleep and memory research
   */
  static optimizeConsolidationTiming(
    learningSession: {
      neuralGains: { pathway: string; strengthIncrease: number }[];
      cognitiveEffort: number;
      duration: number;
      completedAt: Date;
    },
    userSleepPattern: {
      typicalBedtime?: number; // Hour (24-hour format)
      sleepQuality?: number; // 0-1
      lastSleepDuration?: number; // Hours
    } = {}
  ): {
    consolidationWindows: { start: Date; end: Date; effectiveness: number }[];
    recommendedActivities: string[];
    sleepOptimization: string[];
    memoryStrengthPrediction: number;
  } {
    
    const completedAt = learningSession.completedAt;
    const bedtime = userSleepPattern.typicalBedtime || 22; // Default 10 PM
    
    // Memory consolidation windows (based on neuroscience research)
    const consolidationWindows = [
      {
        // Immediate consolidation (first hour)
        start: completedAt,
        end: new Date(completedAt.getTime() + 60 * 60 * 1000),
        effectiveness: 0.9
      },
      {
        // Sleep consolidation (during sleep)
        start: new Date(completedAt.getTime() + (bedtime - completedAt.getHours()) * 60 * 60 * 1000),
        end: new Date(completedAt.getTime() + (bedtime - completedAt.getHours() + 8) * 60 * 60 * 1000),
        effectiveness: 1.0 // Sleep is most effective for consolidation
      },
      {
        // Next-day consolidation (24 hours later)
        start: new Date(completedAt.getTime() + 23 * 60 * 60 * 1000),
        end: new Date(completedAt.getTime() + 25 * 60 * 60 * 1000),
        effectiveness: 0.7
      }
    ];
    
    // Activities that support consolidation
    const recommendedActivities = [
      '🧘 Light meditation or mindfulness (10 minutes)',
      '🚶 Gentle walk without distractions (15 minutes)',
      '🎵 Listen to instrumental music (avoid lyrics)',
      '💭 Reflect on what was learned (5 minutes)',
      '📱 Avoid intensive screen time for 30 minutes'
    ];
    
    // Sleep optimization for memory consolidation
    const sleepOptimization = [
      `💤 Aim for sleep within 4 hours (by ${bedtime + 4}:00)`,
      '🌙 Avoid caffeine 6 hours before intended sleep',
      '📱 Blue light reduction 2 hours before sleep',
      '🌡️ Cool room temperature (65-68°F) for optimal sleep',
      '⏰ Consistent sleep schedule supports memory formation'
    ];
    
    // Predict memory strength based on consolidation factors
    let memoryStrengthPrediction = 0.5; // Base prediction
    
    if (userSleepPattern.sleepQuality && userSleepPattern.sleepQuality > 0.7) {
      memoryStrengthPrediction += 0.2; // Good sleep improves consolidation
    }
    
    if (learningSession.cognitiveEffort >= 6 && learningSession.cognitiveEffort <= 8) {
      memoryStrengthPrediction += 0.15; // Optimal effort improves retention
    }
    
    const totalGains = learningSession.neuralGains.reduce((sum, gain) => sum + gain.strengthIncrease, 0);
    memoryStrengthPrediction += totalGains * 2; // Higher gains = stronger memories
    
    return {
      consolidationWindows,
      recommendedActivities,
      sleepOptimization,
      memoryStrengthPrediction: Math.min(1.0, memoryStrengthPrediction)
    };
  }
  
  private static getPathwayFocus(pathway: string): 'working_memory' | 'attention' | 'processing_speed' | 'pattern_recognition' {
    // Map pathways to cognitive functions for focused training
    const focusMap: { [key: string]: any } = {
      'problem_solving': 'working_memory',
      'analytical_thinking': 'working_memory', 
      'creative_thinking': 'pattern_recognition',
      'attention_control': 'attention',
      'linguistic_processing': 'working_memory',
      'executive_function': 'attention',
      'strategic_thinking': 'working_memory',
      'pattern_recognition': 'pattern_recognition'
    };
    
    return focusMap[pathway] || 'working_memory';
  }
}

export default {
  NeuroplasticityGameEngine,
  NeuralEnhancementUtilities
};