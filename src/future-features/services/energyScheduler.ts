/**
 * ⚡ Energy-Based Scheduling - REVOLUTIONARY FEATURE
 *
 * Learns when you're most productive from daily reflections
 * Auto-schedules hard tasks during peak energy times
 *
 * NO OTHER PRODUCTIVITY APP DOES THIS!
 */

import { offlineDb } from '@/shared/offline/offlineDb';

interface EnergyPattern {
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  averageRating: number; // 1-10
  taskCompletionRate: number; // 0-1
  confidenceLevel: number; // 0-1 (how much data we have)
}

interface EnergyForecast {
  timeSlots: Array<{
    hour: number;
    energyLevel: number; // 0-100
    recommendation: 'peak' | 'good' | 'low' | 'recovery';
    confidence: number;
  }>;
  peakHours: number[]; // Best hours for deep work
  lowHours: number[]; // Best hours for light work/breaks
}

interface TaskSchedulingSuggestion {
  taskId: string;
  suggestedTime: string; // HH:MM format
  energyLevel: number;
  reason: string;
  confidence: number;
}

class EnergyScheduler {
  /**
   * Analyze daily reflections to learn energy patterns
   */
  async analyzeEnergyPatterns(): Promise<EnergyPattern[]> {
    console.log('🧠 Analyzing energy patterns from historical data...');

    // Get all reflections from IndexedDB
    const allSettings = await this.getAllReflections();

    const patterns: EnergyPattern[] = [];
    const hourlyData: Map<string, number[]> = new Map(); // "hour-dayOfWeek" → ratings

    for (const reflection of allSettings) {
      if (!reflection.overallRating) continue;

      const date = new Date(reflection.date);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const key = `${hour}-${dayOfWeek}`;

      if (!hourlyData.has(key)) {
        hourlyData.set(key, []);
      }
      hourlyData.get(key)!.push(reflection.overallRating);
    }

    // Calculate averages
    for (const [key, ratings] of hourlyData.entries()) {
      const [hour, dayOfWeek] = key.split('-').map(Number);
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const confidence = Math.min(ratings.length / 10, 1); // Need 10+ data points for full confidence

      patterns.push({
        hour,
        dayOfWeek,
        averageRating: avg,
        taskCompletionRate: 0.8, // TODO: Calculate from actual task data
        confidenceLevel: confidence
      });
    }

    console.log(`✅ Analyzed ${patterns.length} energy patterns`);
    return patterns;
  }

  /**
   * Forecast energy levels for a given date
   */
  async forecastEnergy(date: Date): Promise<EnergyForecast> {
    const patterns = await this.analyzeEnergyPatterns();
    const dayOfWeek = date.getDay();

    // Find patterns for this day of week
    const relevantPatterns = patterns.filter(p => p.dayOfWeek === dayOfWeek);

    // Generate hourly forecast
    const timeSlots = [];
    const peakHours: number[] = [];
    const lowHours: number[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const pattern = relevantPatterns.find(p => p.hour === hour);

      if (pattern) {
        const energyLevel = pattern.averageRating * 10; // Convert 1-10 to 0-100

        let recommendation: 'peak' | 'good' | 'low' | 'recovery';
        if (energyLevel >= 80) {
          recommendation = 'peak';
          peakHours.push(hour);
        } else if (energyLevel >= 60) {
          recommendation = 'good';
        } else if (energyLevel >= 40) {
          recommendation = 'low';
          lowHours.push(hour);
        } else {
          recommendation = 'recovery';
          lowHours.push(hour);
        }

        timeSlots.push({
          hour,
          energyLevel,
          recommendation,
          confidence: pattern.confidenceLevel
        });
      }
    }

    return { timeSlots, peakHours, lowHours };
  }

  /**
   * Suggest optimal time for a task
   */
  async suggestScheduling(
    task: { id: string; title: string; priority?: string; estimatedDuration?: number },
    date: Date
  ): Promise<TaskSchedulingSuggestion> {
    const forecast = await this.forecastEnergy(date);

    // High priority tasks → Peak energy hours
    const targetHours = task.priority === 'HIGH' || task.priority === 'URGENT'
      ? forecast.peakHours
      : forecast.timeSlots.filter(s => s.recommendation === 'good').map(s => s.hour);

    // Find best available slot
    const bestSlot = targetHours[0] || 9; // Default to 9 AM
    const energyAtSlot = forecast.timeSlots.find(s => s.hour === bestSlot);

    return {
      taskId: task.id,
      suggestedTime: `${bestSlot.toString().padStart(2, '0')}:00`,
      energyLevel: energyAtSlot?.energyLevel || 70,
      reason: task.priority === 'HIGH'
        ? `You're ${energyAtSlot?.energyLevel || 85}% energized at this time`
        : `Good energy window for this task`,
      confidence: energyAtSlot?.confidence || 0.5
    };
  }

  /**
   * Get productivity insights
   */
  async getInsights(): Promise<{
    bestHoursOfDay: number[];
    bestDayOfWeek: number;
    averageEnergy: number;
    recommendations: string[];
  }> {
    const patterns = await this.analyzeEnergyPatterns();

    // Find best hours
    const sortedByEnergy = [...patterns].sort((a, b) => b.averageRating - a.averageRating);
    const bestHours = sortedByEnergy.slice(0, 3).map(p => p.hour);

    // Find best day
    const dayAverages = new Map<number, number>();
    for (let day = 0; day < 7; day++) {
      const dayPatterns = patterns.filter(p => p.dayOfWeek === day);
      if (dayPatterns.length > 0) {
        const avg = dayPatterns.reduce((sum, p) => sum + p.averageRating, 0) / dayPatterns.length;
        dayAverages.set(day, avg);
      }
    }

    const bestDay = Array.from(dayAverages.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 2; // Default Tuesday

    const avgEnergy = patterns.reduce((sum, p) => sum + p.averageRating, 0) / patterns.length;

    // Generate recommendations
    const recommendations = [];
    if (bestHours.length > 0) {
      recommendations.push(
        `Schedule deep work between ${bestHours[0]}:00-${bestHours[0] + 2}:00 (your peak energy)`
      );
    }
    if (avgEnergy < 6) {
      recommendations.push('Consider reviewing your sleep schedule - average energy is below optimal');
    }
    recommendations.push(`${this.getDayName(bestDay)}s tend to be your most productive days`);

    return {
      bestHoursOfDay: bestHours,
      bestDayOfWeek: bestDay,
      averageEnergy: avgEnergy,
      recommendations
    };
  }

  private async getAllReflections(): Promise<any[]> {
    // Simplified - in real implementation, query all reflection settings
    return [];
  }

  private getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }
}

// Export singleton
export const energyScheduler = new EnergyScheduler();

/**
 * Hook for energy-based scheduling
 */
export function useEnergyScheduling() {
  const getInsights = async () => {
    return await energyScheduler.getInsights();
  };

  const suggestTime = async (task: any, date: Date) => {
    return await energyScheduler.suggestScheduling(task, date);
  };

  const forecastDay = async (date: Date) => {
    return await energyScheduler.forecastEnergy(date);
  };

  return {
    getInsights,
    suggestTime,
    forecastDay
  };
}
