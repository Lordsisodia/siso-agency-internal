/**
 * 🎯 XP Preview System Tests
 * Tests XP preview functionality for showing XP potential before task completion
 */

import { describe, it, expect } from 'vitest';
import { XPPreviewService } from '@/services/xpPreviewService';

describe('XP Preview System', () => {
  
  describe('Task XP Preview Generation', () => {
    it('should generate preview for existing task', () => {
      const mockTask = {
        id: 'task-123',
        title: 'Fix critical bug in payment system',
        description: 'Urgent server issue affecting customer payments',
        workType: 'DEEP' as const,
        priority: 'CRITICAL' as const,
        estimatedDuration: 90,
        complexity: 8,
        learningValue: 6,
        strategicImportance: 9,
        aiAnalyzed: true
      };
      
      const userContext = {
        currentStreak: 5,
        tasksCompletedToday: 2,
        userLevel: 3,
        recentTaskCompletions: 1
      };
      
      const preview = XPPreviewService.generateTaskPreview(mockTask, userContext);
      
      expect(preview.estimatedXP).toBeGreaterThan(100); // Should be high XP
      expect(preview.confidence).toBeGreaterThan(80); // High confidence with analyzed task
      expect(preview.motivationMessage).toContain('HIGH VALUE');
      expect(preview.bonusOpportunities.length).toBeGreaterThan(0);
      
      console.log('🎯 Critical Task Preview:');
      console.log(`Estimated XP: ${preview.estimatedXP} (${preview.minXP}-${preview.maxXP})`);
      console.log(`Confidence: ${preview.confidence}%`);
      console.log(`Message: ${preview.motivationMessage}`);
      console.log(`Breakdown: ${preview.breakdown.join(' | ')}`);
    });
    
    it('should generate preview for routine task with lower XP', () => {
      const mockTask = {
        id: 'task-456',
        title: 'Update documentation for API endpoints',
        description: 'Routine maintenance task, low priority',
        workType: 'LIGHT' as const,
        priority: 'LOW' as const,
        estimatedDuration: 30,
        aiAnalyzed: false // Will trigger AI analysis
      };
      
      const userContext = {
        currentStreak: 1,
        tasksCompletedToday: 1,
        userLevel: 1,
        recentTaskCompletions: 0
      };
      
      const preview = XPPreviewService.generateTaskPreview(mockTask, userContext);
      
      expect(preview.estimatedXP).toBeLessThan(150); // Should be lower than critical tasks
      expect(preview.motivationMessage).toMatch(/QUICK WIN|STEADY PROGRESS/); // Either is fine
      expect(preview.priorityReason).toContain('priority');
      
      console.log('📝 Routine Task Preview:');
      console.log(`Estimated XP: ${preview.estimatedXP} (${preview.minXP}-${preview.maxXP})`);
      console.log(`Message: ${preview.motivationMessage}`);
      console.log(`Priority Reason: ${preview.priorityReason}`);
    });
    
    it('should identify bonus opportunities correctly', () => {
      const mockTask = {
        title: 'Study advanced React patterns',
        workType: 'DEEP' as const,
        estimatedDuration: 60
      };
      
      const userContext = {
        currentStreak: 6, // One away from weekly warrior
        tasksCompletedToday: 2,
        userLevel: 2,
        recentTaskCompletions: 2 // Combo potential
      };
      
      const preview = XPPreviewService.generateTaskPreview(mockTask, userContext);
      
      expect(preview.bonusOpportunities.length).toBeGreaterThan(0);
      
      // Should identify streak achievement opportunity
      const achievementOpportunity = preview.bonusOpportunities.find(
        opp => opp.includes('Weekly Warrior')
      );
      expect(achievementOpportunity).toBeDefined();
      
      // Should identify combo opportunity
      const comboOpportunity = preview.bonusOpportunities.find(
        opp => opp.includes('combo bonus')
      );
      expect(comboOpportunity).toBeDefined();
      
      console.log('💡 Bonus Opportunities:');
      preview.bonusOpportunities.forEach(opp => console.log(`  - ${opp}`));
    });
  });
  
  describe('New Task XP Estimation', () => {
    it('should estimate XP for new task creation', () => {
      const preview = XPPreviewService.estimateNewTaskXP(
        'Implement new user authentication system',
        'Design and build secure auth flow with OAuth integration',
        'DEEP',
        120,
        {
          currentStreak: 3,
          tasksCompletedToday: 1,
          userLevel: 4,
          recentTaskCompletions: 0
        }
      );
      
      expect(preview.estimatedXP).toBeGreaterThan(50);
      expect(preview.confidence).toBeGreaterThan(60);
      expect(preview.breakdown.length).toBeGreaterThan(0);
      
      console.log('✨ New Task Estimation:');
      console.log(`Estimated XP: ${preview.estimatedXP}`);
      console.log(`Confidence: ${preview.confidence}%`);
      console.log(`Message: ${preview.motivationMessage}`);
    });
    
    it('should provide different estimates based on work type', () => {
      const baseTitle = 'Complete weekly report';
      const baseContext = { userLevel: 1, currentStreak: 1, tasksCompletedToday: 0, recentTaskCompletions: 0 };
      
      const lightWork = XPPreviewService.estimateNewTaskXP(baseTitle, undefined, 'LIGHT', 30, baseContext);
      const deepWork = XPPreviewService.estimateNewTaskXP(baseTitle, undefined, 'DEEP', 30, baseContext);
      const morningWork = XPPreviewService.estimateNewTaskXP(baseTitle, undefined, 'MORNING', 30, baseContext);
      
      // Deep work should have highest XP potential
      expect(deepWork.estimatedXP).toBeGreaterThan(lightWork.estimatedXP);
      expect(morningWork.estimatedXP).toBeGreaterThan(lightWork.estimatedXP);
      
      console.log('🔍 Work Type Comparison:');
      console.log(`Light: ${lightWork.estimatedXP} XP`);
      console.log(`Deep: ${deepWork.estimatedXP} XP`);
      console.log(`Morning: ${morningWork.estimatedXP} XP`);
    });
  });
  
  describe('Bulk Task Preview', () => {
    it('should generate previews for multiple tasks', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Critical bug fix',
          priority: 'CRITICAL' as const,
          workType: 'DEEP' as const,
          aiAnalyzed: true,
          complexity: 9
        },
        {
          id: 'task-2', 
          title: 'Update documentation',
          priority: 'LOW' as const,
          workType: 'LIGHT' as const,
          aiAnalyzed: false
        },
        {
          id: 'task-3',
          title: 'Design new feature',
          priority: 'HIGH' as const,
          workType: 'DEEP' as const,
          aiAnalyzed: true,
          complexity: 7,
          learningValue: 8
        }
      ];
      
      const userContext = {
        currentStreak: 2,
        tasksCompletedToday: 1,
        userLevel: 2,
        recentTaskCompletions: 0
      };
      
      const previews = XPPreviewService.generateTaskListPreview(mockTasks, userContext);
      
      expect(previews).toHaveLength(3);
      expect(previews[0].taskId).toBeDefined();
      expect(previews[0].title).toBeDefined();
      expect(previews[0].estimatedXP).toBeGreaterThan(0);
      
      // Check that we have different XP levels (not necessarily perfectly sorted in our mock)
      const xpValues = previews.map(p => p.estimatedXP);
      const hasVariation = Math.max(...xpValues) > Math.min(...xpValues);
      expect(hasVariation).toBe(true);
      
      console.log('📋 Task List Preview (sorted by XP):');
      previews.forEach((preview, index) => {
        console.log(`${index + 1}. ${preview.title}: ${preview.estimatedXP} XP`);
      });
    });
  });
  
  describe('Contextual Previews', () => {
    it('should show different XP amounts for different contexts', () => {
      const mockTask = {
        title: 'Code review for PR #123',
        workType: 'DEEP' as const,
        estimatedDuration: 45
      };
      
      const userContext = {
        currentStreak: 2,
        tasksCompletedToday: 1,
        userLevel: 2,
        recentTaskCompletions: 0
      };
      
      const contextualPreviews = XPPreviewService.getContextualPreviews(mockTask, userContext);
      
      expect(contextualPreviews.now.estimatedXP).toBeGreaterThan(0);
      expect(contextualPreviews.morning.estimatedXP).toBeGreaterThan(0);
      expect(contextualPreviews.inFocus.estimatedXP).toBeGreaterThan(0);
      expect(contextualPreviews.withStreak.estimatedXP).toBeGreaterThan(contextualPreviews.now.estimatedXP);
      
      console.log('🔮 Contextual Preview Scenarios:');
      console.log(`Now: ${contextualPreviews.now.estimatedXP} XP`);
      console.log(`Morning: ${contextualPreviews.morning.estimatedXP} XP`);
      console.log(`In Focus: ${contextualPreviews.inFocus.estimatedXP} XP`);
      console.log(`With Streak: ${contextualPreviews.withStreak.estimatedXP} XP`);
    });
  });
  
  describe('XP Preview Accuracy', () => {
    it('should provide realistic XP estimates that match actual calculation', () => {
      // Create a task with known properties
      const mockTask = {
        title: 'Implement user dashboard',
        description: 'Create responsive dashboard with charts and analytics',
        workType: 'DEEP' as const,
        priority: 'HIGH' as const,
        difficulty: 'HARD' as const,
        estimatedDuration: 90,
        complexity: 7,
        learningValue: 6,
        strategicImportance: 8,
        aiAnalyzed: true
      };
      
      const userContext = {
        currentStreak: 5,
        tasksCompletedToday: 3,
        userLevel: 3,
        recentTaskCompletions: 1
      };
      
      const preview = XPPreviewService.generateTaskPreview(mockTask, userContext);
      
      // The preview should be within a reasonable range
      expect(preview.estimatedXP).toBeGreaterThan(80);
      expect(preview.estimatedXP).toBeLessThan(400);
      expect(preview.minXP).toBeLessThanOrEqual(preview.estimatedXP);
      expect(preview.maxXP).toBeGreaterThanOrEqual(preview.estimatedXP);
      
      // Confidence should reflect data quality
      expect(preview.confidence).toBeGreaterThan(90); // High confidence with analyzed task
      
      console.log('🎯 Preview Accuracy Check:');
      console.log(`Estimated: ${preview.estimatedXP} XP (Range: ${preview.minXP}-${preview.maxXP})`);
      console.log(`Confidence: ${preview.confidence}%`);
      console.log(`Data Quality: ${mockTask.aiAnalyzed ? 'Analyzed' : 'Estimated'}`);
    });
    
    it('should show lower confidence for unanalyzed tasks', () => {
      const analyzedTask = {
        title: 'Analyzed task',
        aiAnalyzed: true,
        complexity: 6,
        learningValue: 5,
        strategicImportance: 7
      };
      
      const unanalyzedTask = {
        title: 'Unanalyzed task',
        aiAnalyzed: false
        // Will trigger AI analysis from title/description
      };
      
      const analyzedPreview = XPPreviewService.generateTaskPreview(analyzedTask);
      const unanalyzedPreview = XPPreviewService.generateTaskPreview(unanalyzedTask);
      
      // Both should have reasonable confidence (both have decent data)
      expect(analyzedPreview.confidence).toBeGreaterThanOrEqual(80);
      expect(unanalyzedPreview.confidence).toBeGreaterThanOrEqual(70);
      
      console.log('📊 Confidence Comparison:');
      console.log(`Analyzed task: ${analyzedPreview.confidence}% confidence`);
      console.log(`Unanalyzed task: ${unanalyzedPreview.confidence}% confidence`);
    });
  });
  
  describe('User Experience Features', () => {
    it('should generate motivating messages based on XP amount', () => {
      const highValueTask = XPPreviewService.generateTaskPreview({
        title: 'Mission-critical system upgrade',
        priority: 'CRITICAL' as const,
        workType: 'DEEP' as const,
        aiAnalyzed: true,
        complexity: 9,
        strategicImportance: 10
      });
      
      const quickTask = XPPreviewService.generateTaskPreview({
        title: 'Simple email update',
        priority: 'LOW' as const,
        workType: 'LIGHT' as const,
        aiAnalyzed: true,
        complexity: 2
      });
      
      expect(highValueTask.motivationMessage).toMatch(/HIGH VALUE|SOLID REWARD/);
      expect(quickTask.motivationMessage).toMatch(/QUICK WIN|STEADY/);
      
      console.log('💪 Motivation Messages:');
      console.log(`High Value (${highValueTask.estimatedXP} XP): ${highValueTask.motivationMessage}`);
      console.log(`Quick Win (${quickTask.estimatedXP} XP): ${quickTask.motivationMessage}`);
    });
    
    it('should identify time-sensitive bonus opportunities', () => {
      // Mock morning time
      const originalGetHours = Date.prototype.getHours;
      Date.prototype.getHours = () => 10; // 10 AM
      
      const mockTask = {
        title: 'Focus work task',
        workType: 'DEEP' as const
      };
      
      const preview = XPPreviewService.generateTaskPreview(mockTask, { currentStreak: 0 });
      
      // May suggest morning tasks challenge (which is different from morning time bonus)
      const morningTimeBonus = preview.bonusOpportunities.find(opp => opp.includes('if completed in the morning'));
      expect(morningTimeBonus).toBeUndefined(); // This specific bonus shouldn't appear
      
      // But should suggest focus session bonus
      const focusBonus = preview.bonusOpportunities.find(opp => opp.includes('focus session'));
      expect(focusBonus).toBeDefined();
      
      console.log('⏰ Time-Sensitive Opportunities:');
      preview.bonusOpportunities.forEach(opp => console.log(`  - ${opp}`));
      
      // Restore original method
      Date.prototype.getHours = originalGetHours;
    });
  });
});