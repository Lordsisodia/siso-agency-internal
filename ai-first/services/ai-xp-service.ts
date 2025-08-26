/**
 * 🎮 AI-Powered XP Allocation Service
 * 
 * Uses Groq API to intelligently analyze tasks and allocate XP based on:
 * - Task complexity and difficulty
 * - Time investment required
 * - Skill development potential
 * - Strategic value and priority
 * - Learning curve steepness
 */

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TaskAnalysis {
  difficulty: 'trivial' | 'easy' | 'moderate' | 'hard' | 'expert';
  complexity: number; // 1-10 scale
  learningValue: number; // 1-10 scale
  strategicImportance: number; // 1-10 scale
  timeInvestment: number; // estimated minutes
  skillsRequired: string[];
  xpReward: number;
  reasoning: string;
  confidence: number; // 0-1 scale
  priorityRank?: number; // 1-5 ranking within session context
  contextualBonus?: number; // Extra XP based on session context
  // Enhanced time estimation
  timeEstimate?: {
    min: number; // minimum minutes
    max: number; // maximum minutes
    most_likely: number; // most probable time
    confidence: number; // 0-1 confidence in estimate
    factors: string[]; // factors affecting time estimate
  };
}

export interface XPAllocation {
  baseXP: number;
  difficultyMultiplier: number;
  learningBonus: number;
  strategicBonus: number;
  totalXP: number;
  breakdown: string[];
}

class AIXPService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';
  private model = 'llama3-8b-8192'; // More reliable model
  
  private systemPrompt = `You are an expert XP analyst. Think deeply about each task's real value and impact.

ANALYSIS PROCESS:
1. What type of task is this? (revenue, development, admin, learning, etc.)
2. How does this align with user's stated values and goals?
3. What's the real difficulty and complexity?
4. How much strategic value does this create?
5. Calculate appropriate XP reward

XP GUIDELINES:
- Direct revenue/product features: 100-300 XP
- Core development/architecture: 80-200 XP
- Learning/skill building: 60-150 XP
- Automation/optimization: 50-120 XP
- Admin/documentation: 15-60 XP
- Meetings/email/busy work: 5-25 XP

THINK STEP BY STEP:
- Consider user's personal context and values
- Factor in real business/personal impact
- Don't give generic scores - be specific
- Reward high-impact work, penalize time-wasters

Respond in JSON:
{
  "difficulty": "easy/moderate/hard/expert",
  "complexity": 4,
  "learningValue": 7,
  "strategicImportance": 8,
  "timeInvestment": 30,
  "skillsRequired": ["specific-skills"],
  "xpReward": 120,
  "reasoning": "Detailed explanation of why this XP amount",
  "confidence": 0.9,
  "priorityRank": 4,
  "contextualBonus": 25,
  "timeEstimate": {
    "min": 15,
    "max": 45,
    "most_likely": 25,
    "confidence": 0.8,
    "factors": ["complexity", "unfamiliarity", "distractions"]
  }
}

IMPORTANT CONSTRAINTS:
- priorityRank: MUST be 1-5 (1=lowest, 5=highest priority)
- complexity: Scale 1-10
- learningValue: Scale 1-10  
- strategicImportance: Scale 1-10
- confidence: Scale 0.0-1.0

TIME ESTIMATION GUIDELINES:
- Consider task complexity, user skill level, potential blockers
- min: optimistic scenario (no interruptions)
- max: pessimistic scenario (with blockers/distractions)  
- most_likely: realistic middle estimate
- factors: list reasons affecting time (complexity, learning curve, etc.)`;

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Groq API key not found. AI XP allocation will use fallback method.');
    }
  }

  /**
   * Analyze a task/subtask and determine appropriate XP reward with full page context
   * Enhanced with historical accuracy feedback for better time estimates
   */
  async analyzeTaskForXP(
    taskTitle: string, 
    taskDescription?: string,
    timeEstimate?: string,
    context?: {
      parentTask?: string;
      userLevel?: number;
      subtasks?: Array<{title: string; completed: boolean; workType: string}>;
      allTasks?: Array<{title: string; completed: boolean; timeEstimate: string}>;
      completedTasksToday?: number;
      sessionType?: 'light-work' | 'deep-work' | 'wellness';
      personalContext?: any;
      userId?: string;
    }
  ): Promise<TaskAnalysis> {
    try {
      if (!this.apiKey) {
        return this.getFallbackAnalysis(taskTitle, timeEstimate);
      }

      // Get historical accuracy data for better time estimation
      let historicalData = null;
      if (context?.userId) {
        try {
          const { timeTrackingService } = await import('./time-tracking-service');
          historicalData = await timeTrackingService.getHistoricalAccuracy(context.userId);
        } catch (error) {
          console.log('📊 Could not fetch historical data, using defaults');
        }
      }

      const prompt = this.buildAnalysisPrompt(taskTitle, taskDescription, timeEstimate, context, historicalData);
      
      const messages: GroqMessage[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt }
      ];

      console.log('🔍 [AI-XP] Sending request to Groq API:', {
        model: this.model,
        messageCount: messages.length,
        systemPromptLength: this.systemPrompt.length,
        userPromptLength: prompt.length
      });

      const response = await this.callGroqAPI(messages);
      const analysis = this.parseAnalysisResponse(response);
      
      console.log(`🎮 [AI-XP] Analyzed "${taskTitle}": ${analysis.xpReward} XP (${analysis.difficulty})`);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ [AI-XP] Analysis failed, using fallback:', error);
      return this.getFallbackAnalysis(taskTitle, timeEstimate);
    }
  }

  /**
   * Batch analyze multiple tasks for efficiency
   */
  async analyzeBatchTasks(tasks: Array<{
    title: string;
    description?: string;
    timeEstimate?: string;
  }>): Promise<TaskAnalysis[]> {
    try {
      if (!this.apiKey || tasks.length === 0) {
        return tasks.map(task => this.getFallbackAnalysis(task.title, task.timeEstimate));
      }

      const batchPrompt = this.buildBatchAnalysisPrompt(tasks);
      
      const messages: GroqMessage[] = [
        { role: 'system', content: this.systemPrompt + "\n\nFor batch analysis, respond with a JSON array of task analyses." },
        { role: 'user', content: batchPrompt }
      ];

      const response = await this.callGroqAPI(messages);
      const analyses = this.parseBatchAnalysisResponse(response, tasks.length);
      
      console.log(`🎮 [AI-XP] Batch analyzed ${tasks.length} tasks`);
      
      return analyses;
      
    } catch (error) {
      console.error('❌ [AI-XP] Batch analysis failed, using fallback:', error);
      return tasks.map(task => this.getFallbackAnalysis(task.title, task.timeEstimate));
    }
  }

  /**
   * Calculate XP breakdown for transparency
   */
  calculateXPBreakdown(analysis: TaskAnalysis): XPAllocation {
    const baseXP = this.getBaseXPForDifficulty(analysis.difficulty);
    const difficultyMultiplier = 1 + (analysis.complexity - 5) * 0.1; // ±50% based on complexity
    const learningBonus = analysis.learningValue > 7 ? baseXP * 0.3 : 0;
    const strategicBonus = analysis.strategicImportance > 7 ? baseXP * 0.2 : 0;
    
    const totalXP = Math.round(baseXP * difficultyMultiplier + learningBonus + strategicBonus);
    
    const breakdown = [
      `Base XP (${analysis.difficulty}): ${baseXP}`,
      `Complexity modifier: ${difficultyMultiplier.toFixed(1)}x`,
    ];
    
    if (learningBonus > 0) breakdown.push(`Learning bonus: +${Math.round(learningBonus)}`);
    if (strategicBonus > 0) breakdown.push(`Strategic bonus: +${Math.round(strategicBonus)}`);
    
    return {
      baseXP,
      difficultyMultiplier,
      learningBonus: Math.round(learningBonus),
      strategicBonus: Math.round(strategicBonus),
      totalXP,
      breakdown
    };
  }

  private buildAnalysisPrompt(
    title: string, 
    description?: string, 
    timeEstimate?: string,
    context?: any,
    historicalData?: any
  ): string {
    let prompt = `TASK TO ANALYZE: "${title}"\nTime Estimate: ${timeEstimate || 'Unknown'}`;
    
    // Add subtasks if available
    if (context?.subtasks && context.subtasks.length > 0) {
      prompt += `\n\nSUBTASKS:`;
      context.subtasks.forEach((subtask: any, index: number) => {
        const status = subtask.completed ? '✅' : '⭕';
        prompt += `\n${index + 1}. ${status} ${subtask.title} (${subtask.workType})`;
      });
      prompt += `\n\nIMPORTANT: Analyze this as a complete task with ${context.subtasks.length} subtasks. Consider the full scope of work involved across all subtasks when determining XP reward.`;
    }
    
    // Add meaningful personal context
    if (context?.personalContext) {
      prompt += `\n\nUSER'S PERSONAL CONTEXT:`;
      if (context.personalContext.currentGoals) {
        prompt += `\nCurrent Goals: ${context.personalContext.currentGoals.substring(0, 120)}`;
      }
      if (context.personalContext.valuedTasks) {
        prompt += `\nValues (High XP): ${context.personalContext.valuedTasks.substring(0, 100)}`;
      }
      if (context.personalContext.hatedTasks) {
        prompt += `\nTime Wasters (Low XP): ${context.personalContext.hatedTasks.substring(0, 100)}`;
      }
      if (context.personalContext.skillPriorities) {
        prompt += `\nSkill Focus: ${context.personalContext.skillPriorities.substring(0, 80)}`;
      }
    }
    
    // Add session context
    if (context?.allTasks && context.allTasks.length > 0) {
      const completedCount = context.allTasks.filter((t: any) => t.completed).length;
      prompt += `\n\nSESSION CONTEXT: ${completedCount}/${context.allTasks.length} tasks completed`;
    }
    
    // Add historical accuracy feedback for better time estimation
    if (historicalData) {
      prompt += `\n\nHISTORICAL TIME ACCURACY DATA:`;
      prompt += `\nOverall Estimation Accuracy: ${Math.round(historicalData.averageAccuracy * 100)}%`;
      prompt += `\nUser Velocity: ~${historicalData.userVelocity} tasks/hour`;
      
      if (historicalData.taskTypePatterns) {
        prompt += `\nWork Type Patterns:`;
        Object.entries(historicalData.taskTypePatterns).forEach(([type, data]: [string, any]) => {
          const deviation = data.avgDeviation > 0 ? 'over-estimates' : 'under-estimates';
          prompt += `\n- ${type} work: ${Math.round(data.accuracy * 100)}% accuracy, typically ${deviation} by ${Math.abs(data.avgDeviation)}min`;
        });
      }
      
      prompt += `\n\nIMPORTANT: Use this historical data to adjust your time estimates. If user typically over/under-estimates certain work types, factor that in.`;
    }
    
    prompt += `\n\nTHINK CAREFULLY: What type of task is this? How valuable is it for this user's specific goals? Use historical patterns to make accurate time estimates. Calculate appropriate XP reward with detailed reasoning.`;
    
    return prompt;
  }

  private buildBatchAnalysisPrompt(tasks: Array<{title: string; description?: string; timeEstimate?: string}>): string {
    let prompt = 'Analyze these tasks for XP allocation:\n\n';
    
    tasks.forEach((task, index) => {
      prompt += `${index + 1}. "${task.title}"`;
      if (task.timeEstimate) prompt += ` (${task.timeEstimate})`;
      if (task.description) prompt += ` - ${task.description}`;
      prompt += '\n';
    });
    
    prompt += '\nRespond with a JSON array of analyses, one for each task in order.';
    
    return prompt;
  }

  private async callGroqAPI(messages: GroqMessage[]): Promise<GroqResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3, // Low temperature for consistent analysis
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error Response:', errorText);
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  private parseAnalysisResponse(response: GroqResponse): TaskAnalysis {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content in response');
      
      // Extract JSON from response (might have extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.difficulty || typeof parsed.xpReward !== 'number') {
        throw new Error('Invalid analysis format');
      }
      
      return {
        difficulty: parsed.difficulty,
        complexity: parsed.complexity || 5,
        learningValue: parsed.learningValue || 5,
        strategicImportance: parsed.strategicImportance || 5,
        timeInvestment: parsed.timeInvestment || 30,
        skillsRequired: parsed.skillsRequired || [],
        xpReward: parsed.xpReward,
        reasoning: parsed.reasoning || 'AI analysis completed',
        confidence: parsed.confidence || 0.7,
        priorityRank: Math.min(Math.max(parsed.priorityRank || 3, 1), 5),
        contextualBonus: parsed.contextualBonus || 0,
        timeEstimate: parsed.timeEstimate ? {
          min: Math.max(parsed.timeEstimate.min || 5, 1),
          max: Math.min(parsed.timeEstimate.max || 60, 240), // Max 4 hours
          most_likely: parsed.timeEstimate.most_likely || 15,
          confidence: Math.min(Math.max(parsed.timeEstimate.confidence || 0.7, 0.1), 1.0),
          factors: Array.isArray(parsed.timeEstimate.factors) ? parsed.timeEstimate.factors : ['complexity']
        } : undefined
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse AI analysis');
    }
  }

  private parseBatchAnalysisResponse(response: GroqResponse, expectedCount: number): TaskAnalysis[] {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content in response');
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(parsed) || parsed.length !== expectedCount) {
        throw new Error('Invalid batch response format');
      }
      
      return parsed.map(item => ({
        difficulty: item.difficulty || 'moderate',
        complexity: item.complexity || 5,
        learningValue: item.learningValue || 5,
        strategicImportance: item.strategicImportance || 5,
        timeInvestment: item.timeInvestment || 30,
        skillsRequired: item.skillsRequired || [],
        xpReward: item.xpReward || 30,
        reasoning: item.reasoning || 'AI analysis completed',
        confidence: item.confidence || 0.7
      }));
    } catch (error) {
      console.error('Failed to parse batch AI response:', error);
      throw new Error('Failed to parse batch AI analysis');
    }
  }

  private getFallbackAnalysis(title: string, timeEstimate?: string): TaskAnalysis {
    // Simple heuristic-based fallback
    const timeMinutes = this.parseTimeEstimate(timeEstimate || '20 min');
    const titleWords = title.toLowerCase().split(' ');
    
    // Determine difficulty based on keywords and time
    let difficulty: TaskAnalysis['difficulty'] = 'moderate';
    let baseXP = 30;
    
    if (timeMinutes <= 10 || titleWords.some(w => ['check', 'quick', 'simple', 'basic'].includes(w))) {
      difficulty = 'easy';
      baseXP = 20;
    } else if (timeMinutes >= 60 || titleWords.some(w => ['complex', 'develop', 'analyze', 'research'].includes(w))) {
      difficulty = 'hard';
      baseXP = 80;
    }
    
    return {
      difficulty,
      complexity: Math.min(10, Math.max(1, Math.round(timeMinutes / 10))),
      learningValue: titleWords.some(w => ['learn', 'new', 'study'].includes(w)) ? 8 : 5,
      strategicImportance: 5,
      timeInvestment: timeMinutes,
      skillsRequired: ['general'],
      xpReward: Math.round(baseXP + (timeMinutes * 0.5)),
      reasoning: 'Fallback heuristic analysis',
      confidence: 0.6
    };
  }

  private parseTimeEstimate(timeStr: string): number {
    const match = timeStr.match(/(\d+)\s*(min|hour|h)/i);
    if (!match) return 20;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    return unit.includes('h') ? value * 60 : value;
  }

  private getBaseXPForDifficulty(difficulty: TaskAnalysis['difficulty']): number {
    const xpMap = {
      trivial: 10,
      easy: 20,
      moderate: 40,
      hard: 80,
      expert: 150
    };
    return xpMap[difficulty] || 40;
  }
}

export const aiXPService = new AIXPService();
export default aiXPService;