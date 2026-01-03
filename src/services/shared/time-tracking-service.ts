/**
 * 📊 Time Tracking & Accuracy Feedback Service
 * 
 * Handles start/stop timing for tasks and calculates AI estimation accuracy
 * Provides feedback loop to improve future AI estimates
 */

import { createApiUrl } from '@/lib/utils/api-config';

export interface TimeAccuracyMetrics {
  taskId: string;
  actualDurationMin: number;
  aiEstimateMin?: number;
  aiEstimateMax?: number;
  aiEstimateMostLikely?: number;
  accuracy: number; // 0-1 score (1 = perfect, 0 = way off)
  isWithinRange: boolean;
  deviationPercent: number; // positive = over-estimate, negative = under-estimate
}

export interface AccuracyInsights {
  overallAccuracy: number;
  averageDeviation: number;
  commonPatterns: string[];
  improvementSuggestions: string[];
}

class TimeTrackingService {
  
  /**
   * Start timing a task - records the start time
   */
  async startTask(taskId: string): Promise<void> {
    try {
      // Update task with start time via our API
      const response = await fetch(createApiUrl(`/api/tasks/${taskId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start task timing: ${response.statusText}`);
      }
      
      console.log(`⏱️ Started timing task: ${taskId}`);
    } catch (error) {
      console.error('❌ Failed to start task timing:', error);
    }
  }

  /**
   * Start timing a subtask
   */
  async startSubtask(subtaskId: string): Promise<void> {
    try {
      const response = await fetch(createApiUrl(`/api/subtasks/${subtaskId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start subtask timing: ${response.statusText}`);
      }
      
      console.log(`⏱️ Started timing subtask: ${subtaskId}`);
    } catch (error) {
      console.error('❌ Failed to start subtask timing:', error);
    }
  }

  /**
   * Complete a task and calculate time accuracy
   */
  async completeTask(
    taskId: string, 
    aiTimeEstimate?: { min: number; max: number; most_likely: number }
  ): Promise<TimeAccuracyMetrics | null> {
    try {
      const completedAt = new Date();
      
      // Get current task data to find start time
      const taskResponse = await fetch(createApiUrl(`/api/tasks/${taskId}/details`));
      let task = null;
      
      if (taskResponse.ok) {
        const result = await taskResponse.json();
        task = result.data;
      }
      
      // Calculate actual duration
      let actualDurationMin = 0;
      if (task?.startedAt) {
        const startTime = new Date(task.startedAt);
        actualDurationMin = Math.round((completedAt.getTime() - startTime.getTime()) / 60000);
      }
      
      // Calculate accuracy metrics
      let metrics: TimeAccuracyMetrics | null = null;
      if (aiTimeEstimate && actualDurationMin > 0) {
        metrics = this.calculateAccuracy(
          taskId,
          actualDurationMin,
          aiTimeEstimate.min,
          aiTimeEstimate.max,
          aiTimeEstimate.most_likely
        );
      }
      
      // Update task with completion data and accuracy metrics
      const updateData = {
        completed: true,
        completedAt: completedAt.toISOString(),
        actualDurationMin: actualDurationMin > 0 ? actualDurationMin : null,
        aiTimeEstimateMin: aiTimeEstimate?.min || null,
        aiTimeEstimateMax: aiTimeEstimate?.max || null,
        aiTimeEstimateML: aiTimeEstimate?.most_likely || null,
        timeAccuracy: metrics?.accuracy || null
      };
      
      await fetch(createApiUrl(`/api/tasks/${taskId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (metrics) {
        console.log(`📊 Task completed with ${Math.round(metrics.accuracy * 100)}% accuracy`);
        console.log(`⏱️ Actual: ${actualDurationMin}min, AI Estimate: ${aiTimeEstimate?.most_likely}min`);
        console.log(`📈 Deviation: ${metrics.deviationPercent > 0 ? '+' : ''}${Math.round(metrics.deviationPercent)}%`);
      }
      
      return metrics;
    } catch (error) {
      console.error('❌ Failed to complete task timing:', error);
      return null;
    }
  }

  /**
   * Complete a subtask and calculate time accuracy
   */
  async completeSubtask(
    subtaskId: string, 
    aiTimeEstimate?: { min: number; max: number; most_likely: number }
  ): Promise<TimeAccuracyMetrics | null> {
    try {
      const completedAt = new Date();
      
      // Similar logic for subtasks
      const subtaskResponse = await fetch(createApiUrl(`/api/subtasks/${subtaskId}/details`));
      let subtask = null;
      
      if (subtaskResponse.ok) {
        const result = await subtaskResponse.json();
        subtask = result.data;
      }
      
      let actualDurationMin = 0;
      if (subtask?.startedAt) {
        const startTime = new Date(subtask.startedAt);
        actualDurationMin = Math.round((completedAt.getTime() - startTime.getTime()) / 60000);
      }
      
      let metrics: TimeAccuracyMetrics | null = null;
      if (aiTimeEstimate && actualDurationMin > 0) {
        metrics = this.calculateAccuracy(
          subtaskId,
          actualDurationMin,
          aiTimeEstimate.min,
          aiTimeEstimate.max,
          aiTimeEstimate.most_likely
        );
      }
      
      const updateData = {
        completed: true,
        completedAt: completedAt.toISOString(),
        actualDurationMin: actualDurationMin > 0 ? actualDurationMin : null,
        aiTimeEstimateMin: aiTimeEstimate?.min || null,
        aiTimeEstimateMax: aiTimeEstimate?.max || null,
        aiTimeEstimateML: aiTimeEstimate?.most_likely || null,
        timeAccuracy: metrics?.accuracy || null
      };
      
      await fetch(createApiUrl(`/api/subtasks/${subtaskId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      return metrics;
    } catch (error) {
      console.error('❌ Failed to complete subtask timing:', error);
      return null;
    }
  }

  /**
   * Calculate accuracy score for time estimation
   */
  private calculateAccuracy(
    itemId: string,
    actualDurationMin: number,
    aiEstimateMin: number,
    aiEstimateMax: number,
    aiEstimateMostLikely: number
  ): TimeAccuracyMetrics {
    
    // Check if actual time is within the AI's predicted range
    const isWithinRange = actualDurationMin >= aiEstimateMin && actualDurationMin <= aiEstimateMax;
    
    // Calculate deviation from most likely estimate
    const deviationPercent = ((actualDurationMin - aiEstimateMostLikely) / aiEstimateMostLikely) * 100;
    
    // Calculate accuracy score (1 = perfect, 0 = way off)
    let accuracy = 0;
    
    if (isWithinRange) {
      // If within range, accuracy is high (0.7-1.0)
      const rangeSize = aiEstimateMax - aiEstimateMin;
      const distanceFromCenter = Math.abs(actualDurationMin - aiEstimateMostLikely);
      accuracy = Math.max(0.7, 1 - (distanceFromCenter / rangeSize));
    } else {
      // If outside range, accuracy decreases with distance
      const distanceFromRange = actualDurationMin < aiEstimateMin 
        ? aiEstimateMin - actualDurationMin 
        : actualDurationMin - aiEstimateMax;
      
      // Accuracy decreases rapidly as we get further from the range
      accuracy = Math.max(0, 0.6 - (distanceFromRange / aiEstimateMostLikely) * 0.5);
    }
    
    return {
      taskId: itemId,
      actualDurationMin,
      aiEstimateMin,
      aiEstimateMax,
      aiEstimateMostLikely,
      accuracy,
      isWithinRange,
      deviationPercent
    };
  }

  /**
   * Analyze accuracy patterns for a user to improve future estimates
   */
  async getAccuracyInsights(userId: string): Promise<AccuracyInsights> {
    try {
      const response = await fetch(createApiUrl(`/api/users/${userId}/time-accuracy`));
      
      if (!response.ok) {
        // Return default insights if API doesn't have the endpoint yet
        return {
          overallAccuracy: 0.7,
          averageDeviation: 0,
          commonPatterns: ['More data needed for pattern analysis'],
          improvementSuggestions: [
            'Track more tasks to build accuracy insights',
            'Be consistent with task timing',
            'Review estimates vs actual times regularly'
          ]
        };
      }
      
      const result = await response.json();
      return result.data;
      
    } catch (error) {
      console.error('❌ Failed to get accuracy insights:', error);
      return {
        overallAccuracy: 0.7,
        averageDeviation: 0,
        commonPatterns: ['Analysis unavailable'],
        improvementSuggestions: ['Check connection and try again']
      };
    }
  }

  /**
   * Get historical accuracy data for improving AI estimates
   */
  async getHistoricalAccuracy(userId: string): Promise<{
    averageAccuracy: number;
    taskTypePatterns: Record<string, { accuracy: number; avgDeviation: number }>;
    userVelocity: number; // Tasks per hour
  }> {
    try {
      // This would query the database for historical accuracy data
      // For now, return mock data structure that the AI service can use
      
      return {
        averageAccuracy: 0.75,
        taskTypePatterns: {
          'DEEP': { accuracy: 0.65, avgDeviation: 15 }, // Deep work often takes longer
          'LIGHT': { accuracy: 0.85, avgDeviation: -5 }, // Light work often faster
          'MORNING': { accuracy: 0.80, avgDeviation: 0 } // Morning tasks are most accurate
        },
        userVelocity: 2.5 // Average tasks per hour
      };
    } catch (error) {
      console.error('❌ Failed to get historical accuracy:', error);
      return {
        averageAccuracy: 0.7,
        taskTypePatterns: {},
        userVelocity: 2.0
      };
    }
  }
}

export const timeTrackingService = new TimeTrackingService();
export default timeTrackingService;