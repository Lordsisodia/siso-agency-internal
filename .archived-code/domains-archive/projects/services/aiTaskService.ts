/**
 * AI Task Service - Intelligent task management with AI priority setting and time estimation
 * 
 * This service provides AI-powered features for:
 * - Automatic priority setting based on task content
 * - Time estimation based on historical data
 * - Task scheduling optimization
 * - Productivity pattern analysis
 */

export interface AITaskAnalysis {
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // minutes
  reasoning: string;
  confidence: number; // 0-1
}

export interface AITaskRecommendation {
  taskId: string;
  score: number; // 0-1, higher = more recommended
  reasoning: string;
  optimalTimeSlot?: string; // e.g., "morning", "afternoon", "evening"
}

export interface AIScheduleOptimization {
  recommendedTasks: AITaskRecommendation[];
  energyOptimal: boolean;
  timeOptimal: boolean;
  workloadBalanced: boolean;
}

/**
 * AI Task Service - Simulated AI capabilities for task management
 * 
 * In a production environment, this would connect to:
 * - OpenAI GPT API for natural language analysis
 * - Local ML models for pattern recognition
 * - User behavior analytics for personalization
 */
export class AITaskService {
  
  /**
   * Analyze task content and automatically set priority
   * 
   * @param taskTitle - The task title
   * @param taskDescription - Optional task description
   * @param userContext - Additional context about user's current workload
   * @returns AI analysis with suggested priority and reasoning
   */
  async analyzePriority(
    taskTitle: string, 
    taskDescription?: string,
    userContext?: {
      currentTaskCount: number;
      upcomingDeadlines: number;
      userStressLevel: 'low' | 'medium' | 'high';
    }
  ): Promise<AITaskAnalysis> {
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // AI Priority Analysis Logic (Simplified)
    const highPriorityKeywords = ['urgent', 'deadline', 'critical', 'important', 'asap', 'client', 'bug', 'emergency'];
    const mediumPriorityKeywords = ['review', 'update', 'meeting', 'plan', 'organize', 'prepare'];
    const lowPriorityKeywords = ['research', 'learn', 'explore', 'optional', 'someday', 'nice to have'];
    
    const text = `${taskTitle} ${taskDescription || ''}`.toLowerCase();
    
    let priority: 'low' | 'medium' | 'high' = 'medium';
    let reasoning = 'Standard priority assigned based on task type';
    let confidence = 0.7;
    
    // Check for high priority indicators
    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
      priority = 'high';
      reasoning = 'High priority due to urgency indicators (deadline, critical, client-related)';
      confidence = 0.9;
    }
    // Check for low priority indicators
    else if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
      priority = 'low';
      reasoning = 'Low priority - research/learning task with flexible timeline';
      confidence = 0.8;
    }
    
    // Adjust based on user context
    if (userContext) {
      if (userContext.currentTaskCount > 10 && priority === 'high') {
        reasoning += ' (High workload detected - consider delegating)';
      }
      if (userContext.userStressLevel === 'high' && priority === 'low') {
        priority = 'medium';
        reasoning = 'Elevated from low to medium due to high stress levels';
      }
    }
    
    // Estimate duration based on task type and keywords
    let estimatedDuration = 30; // default 30 minutes
    
    if (text.includes('meeting')) estimatedDuration = 60;
    else if (text.includes('review')) estimatedDuration = 45;
    else if (text.includes('quick') || text.includes('brief')) estimatedDuration = 15;
    else if (text.includes('deep') || text.includes('complex')) estimatedDuration = 120;
    else if (text.includes('email') || text.includes('message')) estimatedDuration = 10;
    
    return {
      priority,
      estimatedDuration,
      reasoning,
      confidence
    };
  }
  
  /**
   * Get AI recommendations for what tasks to work on next
   * 
   * @param availableTime - Available time in minutes
   * @param userContext - Current user state and preferences
   * @param tasks - Available tasks to choose from
   * @returns Ranked task recommendations
   */
  async recommendTasks(
    availableTime: number,
    userContext: {
      timeOfDay: number; // 0-23 hour
      energyLevel: 'low' | 'medium' | 'high';
      focusMode: boolean;
    },
    tasks: Array<{
      id: string;
      title: string;
      priority: 'low' | 'medium' | 'high';
      estimatedDuration: number;
      category: string;
      completed: boolean;
    }>
  ): Promise<AIScheduleOptimization> {
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    const recommendations: AITaskRecommendation[] = incompleteTasks
      .map(task => {
        let score = 0.5; // base score
        let reasoning = 'Standard recommendation';
        
        // Priority weighting
        if (task.priority === 'high') score += 0.3;
        else if (task.priority === 'low') score -= 0.2;
        
        // Time availability matching
        if (task.estimatedDuration <= availableTime) {
          score += 0.2;
          reasoning += ' (fits available time)';
        } else {
          score -= 0.3;
          reasoning += ' (exceeds available time)';
        }
        
        // Energy level matching
        if (userContext.energyLevel === 'high' && task.category === 'deep-work') {
          score += 0.2;
          reasoning += ' (high energy optimal for deep work)';
        } else if (userContext.energyLevel === 'low' && task.category === 'light-work') {
          score += 0.1;
          reasoning += ' (low energy suitable for light tasks)';
        }
        
        // Time of day optimization
        if (userContext.timeOfDay >= 6 && userContext.timeOfDay <= 10 && task.category === 'morning') {
          score += 0.2;
          reasoning += ' (optimal morning timing)';
        }
        
        // Focus mode considerations
        if (userContext.focusMode && task.category === 'deep-work') {
          score += 0.15;
          reasoning += ' (focus mode activated)';
        }
        
        return {
          taskId: task.id,
          score: Math.min(Math.max(score, 0), 1), // clamp between 0-1
          reasoning,
          optimalTimeSlot: this.getOptimalTimeSlot(task.category, userContext.timeOfDay)
        };
      })
      .sort((a, b) => b.score - a.score); // highest score first
    
    return {
      recommendedTasks: recommendations,
      energyOptimal: userContext.energyLevel === 'high',
      timeOptimal: availableTime >= 30,
      workloadBalanced: incompleteTasks.length <= 8
    };
  }
  
  /**
   * Determine optimal time slot for task category
   */
  private getOptimalTimeSlot(category: string, currentHour: number): string {
    if (category === 'morning') return 'morning';
    if (category === 'deep-work') return currentHour < 12 ? 'morning' : 'afternoon';
    if (category === 'light-work') return 'afternoon';
    if (category === 'wellness') return currentHour < 10 ? 'morning' : 'evening';
    return 'anytime';
  }
  
  /**
   * Learn from user behavior to improve recommendations
   * 
   * @param taskId - Completed task ID
   * @param actualDuration - How long it actually took
   * @param userSatisfaction - User feedback (1-5 scale)
   */
  async learnFromCompletion(
    taskId: string,
    actualDuration: number,
    userSatisfaction: number
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Store completion data in analytics database
    // 2. Update ML models with new training data
    // 3. Adjust future estimates based on patterns
    
    console.log('📚 AI Learning:', {
      taskId,
      actualDuration,
      userSatisfaction,
      message: 'Data logged for future model improvements'
    });
  }
}

// Singleton instance
export const aiTaskService = new AITaskService();