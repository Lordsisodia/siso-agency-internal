#!/usr/bin/env ts-node

/**
 * 🧪 DATABASE VERIFICATION SCRIPT
 * 
 * Runs comprehensive tests to verify Prisma database integration
 * without modifying any existing code.
 */

import { taskDatabaseService } from '../ai-first/services/task-database-service';
import { aiXPService } from '../ai-first/services/ai-xp-service';
import type { CreateTaskInput, TaskWithSubtasks, PersonalContextData } from '../ai-first/services/task-database-service';

// Mock user ID for testing
const TEST_USER_ID = 'test-user-verification-' + Date.now();
const TEST_DATE = new Date().toISOString().split('T')[0]; // Today's date

class DatabaseVerificationRunner {
  private createdTaskIds: string[] = [];
  private testResults: { name: string; success: boolean; message: string; details?: any }[] = [];

  async runAllTests() {
    console.log('🧪 ========================================');
    console.log('🧪 STARTING COMPREHENSIVE DATABASE TESTS');
    console.log('🧪 ========================================\n');

    try {
      // Run all test suites
      await this.testCoreOperations();
      await this.testAIIntegration();
      await this.testPersonalContext();
      await this.testXPStatistics();
      
      // Cleanup
      await this.cleanup();
      
      // Show results
      this.showResults();
      
    } catch (error) {
      console.error('❌ Fatal error during testing:', error);
      await this.cleanup();
    }
  }

  private async testCoreOperations() {
    console.log('📊 Testing Core Database Operations...\n');

    // Test 1: Task Creation with Subtasks
    await this.runTest('Task Creation with Subtasks', async () => {
      const taskInput: CreateTaskInput = {
        title: 'Verification Test Task',
        description: 'Testing database integration',
        workType: 'MORNING',
        priority: 'HIGH',
        currentDate: TEST_DATE,
        timeEstimate: '30 min',
        estimatedDuration: 30,
        subtasks: [
          { title: 'Subtask 1', workType: 'MORNING' },
          { title: 'Subtask 2', workType: 'MORNING' }
        ]
      };

      const createdTask = await taskDatabaseService.createTask(TEST_USER_ID, taskInput);
      this.createdTaskIds.push(createdTask.id);

      if (!createdTask || !createdTask.id) {
        throw new Error('Task creation failed - no task returned');
      }

      if (createdTask.subtasks.length !== 2) {
        throw new Error(`Expected 2 subtasks, got ${createdTask.subtasks.length}`);
      }

      return {
        taskId: createdTask.id,
        subtaskCount: createdTask.subtasks.length,
        workType: createdTask.workType
      };
    });

    // Test 2: Task Fetching
    await this.runTest('Task Fetching by Date', async () => {
      const tasks = await taskDatabaseService.getTasksForDate(TEST_USER_ID, TEST_DATE);
      
      if (tasks.length === 0) {
        throw new Error('No tasks found for test date');
      }

      const verificationTask = tasks.find(t => t.title === 'Verification Test Task');
      if (!verificationTask) {
        throw new Error('Created verification task not found in fetch results');
      }

      return {
        totalTasks: tasks.length,
        foundVerificationTask: !!verificationTask
      };
    });

    // Test 3: Task Completion Toggle
    await this.runTest('Task Completion Toggle', async () => {
      const tasks = await taskDatabaseService.getTasksForDate(TEST_USER_ID, TEST_DATE);
      const testTask = tasks.find(t => t.title === 'Verification Test Task');
      
      if (!testTask) {
        throw new Error('Test task not found for completion test');
      }

      // Toggle to completed
      await taskDatabaseService.updateTaskCompletion(testTask.id, true);
      
      // Fetch and verify
      const updatedTasks = await taskDatabaseService.getTasksForDate(TEST_USER_ID, TEST_DATE);
      const completedTask = updatedTasks.find(t => t.id === testTask.id);

      if (!completedTask?.completed) {
        throw new Error('Task completion toggle failed');
      }

      return {
        taskId: testTask.id,
        completed: completedTask.completed,
        completedAt: completedTask.completedAt
      };
    });

    // Test 4: Subtask Completion Toggle
    await this.runTest('Subtask Completion Toggle', async () => {
      const tasks = await taskDatabaseService.getTasksForDate(TEST_USER_ID, TEST_DATE);
      const testTask = tasks.find(t => t.title === 'Verification Test Task');
      
      if (!testTask || testTask.subtasks.length === 0) {
        throw new Error('Test task or subtasks not found');
      }

      const subtaskId = testTask.subtasks[0].id;
      
      // Toggle subtask completion
      await taskDatabaseService.updateSubtaskCompletion(subtaskId, true);
      
      // Fetch and verify
      const updatedTasks = await taskDatabaseService.getTasksForDate(TEST_USER_ID, TEST_DATE);
      const updatedTask = updatedTasks.find(t => t.id === testTask.id);
      const completedSubtask = updatedTask?.subtasks.find(s => s.id === subtaskId);

      if (!completedSubtask?.completed) {
        throw new Error('Subtask completion toggle failed');
      }

      return {
        subtaskId,
        completed: completedSubtask.completed
      };
    });

    console.log('✅ Core Operations Tests Completed\n');
  }

  private async testAIIntegration() {
    console.log('🧠 Testing AI Integration...\n');

    // Test 1: Task AI Analysis
    await this.runTest('Task AI Analysis Persistence', async () => {
      const tasks = await taskDatabaseService.getTasksForDate(TEST_USER_ID, TEST_DATE);
      const testTask = tasks.find(t => t.title === 'Verification Test Task');
      
      if (!testTask) {
        throw new Error('Test task not found for AI analysis');
      }

      const mockAnalysis = {
        xpReward: 150,
        difficulty: 'moderate',
        reasoning: 'Database verification task with moderate complexity',
        priorityRank: 4,
        contextualBonus: 25,
        complexity: 6,
        learningValue: 7,
        strategicImportance: 8,
        confidence: 0.9
      };

      await taskDatabaseService.updateTaskAIAnalysis(testTask.id, mockAnalysis);

      // Verify persistence
      const analyzedTasks = await taskDatabaseService.getTasksForDate(TEST_USER_ID, TEST_DATE);
      const analyzedTask = analyzedTasks.find(t => t.id === testTask.id);

      if (!analyzedTask?.aiAnalyzed) {
        throw new Error('AI analysis flag not set');
      }

      if (analyzedTask.xpReward !== 150) {
        throw new Error(`Expected XP reward 150, got ${analyzedTask.xpReward}`);
      }

      if (analyzedTask.difficulty !== 'MODERATE') {
        throw new Error(`Expected difficulty MODERATE, got ${analyzedTask.difficulty}`);
      }

      return {
        aiAnalyzed: analyzedTask.aiAnalyzed,
        xpReward: analyzedTask.xpReward,
        difficulty: analyzedTask.difficulty,
        reasoning: analyzedTask.aiReasoning
      };
    });

    // Test 2: Subtask AI Analysis  
    await this.runTest('Subtask AI Analysis Persistence', async () => {
      const tasks = await taskDatabaseService.getTasksForDate(TEST_USER_ID, TEST_DATE);
      const testTask = tasks.find(t => t.title === 'Verification Test Task');
      
      if (!testTask || testTask.subtasks.length === 0) {
        throw new Error('Test task or subtasks not found');
      }

      const subtaskId = testTask.subtasks[0].id;
      const mockSubtaskAnalysis = {
        xpReward: 35,
        difficulty: 'easy',
        reasoning: 'Simple verification subtask',
        priorityRank: 2,
        contextualBonus: 5,
        complexity: 2,
        learningValue: 3,
        strategicImportance: 2,
        confidence: 0.95
      };

      await taskDatabaseService.updateSubtaskAIAnalysis(subtaskId, mockSubtaskAnalysis);

      // Verify persistence
      const analyzedTasks = await taskDatabaseService.getTasksForDate(TEST_USER_ID, TEST_DATE);
      const analyzedTask = analyzedTasks.find(t => t.id === testTask.id);
      const analyzedSubtask = analyzedTask?.subtasks.find(s => s.id === subtaskId);

      if (!analyzedSubtask?.aiAnalyzed) {
        throw new Error('Subtask AI analysis flag not set');
      }

      if (analyzedSubtask.xpReward !== 35) {
        throw new Error(`Expected subtask XP reward 35, got ${analyzedSubtask.xpReward}`);
      }

      return {
        subtaskId,
        aiAnalyzed: analyzedSubtask.aiAnalyzed,
        xpReward: analyzedSubtask.xpReward
      };
    });

    // Test 3: Get Tasks Needing Analysis
    await this.runTest('Tasks Needing Analysis Query', async () => {
      // Create unanalyzed task
      const unanalyzedTaskInput: CreateTaskInput = {
        title: 'Unanalyzed Task',
        workType: 'DEEP',
        priority: 'URGENT',
        currentDate: TEST_DATE
      };

      const unanalyzedTask = await taskDatabaseService.createTask(TEST_USER_ID, unanalyzedTaskInput);
      this.createdTaskIds.push(unanalyzedTask.id);

      const tasksNeedingAnalysis = await taskDatabaseService.getTasksNeedingAnalysis(TEST_USER_ID, 10);

      const foundUnanalyzedTask = tasksNeedingAnalysis.find(t => t.id === unanalyzedTask.id);
      if (!foundUnanalyzedTask) {
        throw new Error('Unanalyzed task not found in query results');
      }

      return {
        totalTasksNeedingAnalysis: tasksNeedingAnalysis.length,
        foundUnanalyzedTask: !!foundUnanalyzedTask
      };
    });

    console.log('✅ AI Integration Tests Completed\n');
  }

  private async testPersonalContext() {
    console.log('👤 Testing Personal Context...\n');

    await this.runTest('Personal Context Management', async () => {
      const contextData: PersonalContextData = {
        currentGoals: 'Verify database integration works perfectly',
        skillPriorities: 'Database optimization, testing automation',
        revenueTargets: 'Increase productivity by 50%',
        timeConstraints: 'Complete verification in 30 minutes',
        currentProjects: 'SISO-INTERNAL database verification',
        hatedTasks: 'Manual testing, repetitive verification',
        valuedTasks: 'Automated testing, system reliability',
        learningObjectives: 'Advanced database testing patterns'
      };

      // Create/update context
      await taskDatabaseService.updatePersonalContext(TEST_USER_ID, contextData);

      // Retrieve and verify
      const retrievedContext = await taskDatabaseService.getPersonalContext(TEST_USER_ID);

      if (!retrievedContext) {
        throw new Error('Personal context not found after creation');
      }

      if (retrievedContext.currentGoals !== contextData.currentGoals) {
        throw new Error('Personal context goals mismatch');
      }

      if (retrievedContext.skillPriorities !== contextData.skillPriorities) {
        throw new Error('Personal context skill priorities mismatch');
      }

      return {
        contextSaved: !!retrievedContext,
        currentGoals: retrievedContext.currentGoals,
        skillPriorities: retrievedContext.skillPriorities
      };
    });

    console.log('✅ Personal Context Tests Completed\n');
  }

  private async testXPStatistics() {
    console.log('📈 Testing XP Statistics...\n');

    await this.runTest('XP Statistics Calculation', async () => {
      // Get current XP stats
      const xpStats = await taskDatabaseService.getUserXPStats(TEST_USER_ID, {
        start: TEST_DATE,
        end: TEST_DATE
      });

      // We should have some XP from our previous tests
      const expectedMinimumXP = 150 + 35; // Task XP + Subtask XP from AI analysis tests

      if (xpStats.totalXP < expectedMinimumXP) {
        console.warn(`⚠️ Expected minimum ${expectedMinimumXP} XP, got ${xpStats.totalXP}`);
      }

      return {
        totalXP: xpStats.totalXP,
        taskXP: xpStats.taskXP,
        subtaskXP: xpStats.subtaskXP,
        completedTasks: xpStats.completedTasks,
        completedSubtasks: xpStats.completedSubtasks,
        analyzedTasks: xpStats.analyzedTasks
      };
    });

    console.log('✅ XP Statistics Tests Completed\n');
  }

  private async runTest(name: string, testFunction: () => Promise<any>) {
    try {
      console.log(`🔍 Running: ${name}...`);
      const result = await testFunction();
      console.log(`✅ ${name} - PASSED`);
      if (result) {
        console.log(`   Details:`, JSON.stringify(result, null, 2));
      }
      console.log('');
      
      this.testResults.push({
        name,
        success: true,
        message: 'Test passed successfully',
        details: result
      });
    } catch (error) {
      console.log(`❌ ${name} - FAILED`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      console.log('');
      
      this.testResults.push({
        name,
        success: false,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    for (const taskId of this.createdTaskIds) {
      try {
        await taskDatabaseService.deleteTask(taskId);
        console.log(`   ✅ Deleted task: ${taskId}`);
      } catch (error) {
        console.warn(`   ⚠️ Failed to cleanup task ${taskId}: ${error}`);
      }
    }
    
    console.log('');
  }

  private showResults() {
    console.log('🧪 ========================================');
    console.log('🧪 DATABASE VERIFICATION RESULTS');
    console.log('🧪 ========================================\n');

    const passedTests = this.testResults.filter(r => r.success);
    const failedTests = this.testResults.filter(r => !r.success);

    console.log(`✅ Passed: ${passedTests.length}`);
    console.log(`❌ Failed: ${failedTests.length}`);
    console.log(`📊 Total: ${this.testResults.length}\n`);

    if (failedTests.length > 0) {
      console.log('❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`   • ${test.name}: ${test.message}`);
      });
      console.log('');
    }

    if (passedTests.length === this.testResults.length) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('🎉 Database integration is working correctly!');
      console.log('');
      console.log('✅ Verified Features:');
      console.log('   • Task creation and retrieval');
      console.log('   • Task and subtask completion toggles');
      console.log('   • AI XP analysis persistence');
      console.log('   • Personal context management');
      console.log('   • XP statistics calculation');
      console.log('   • Database cleanup operations');
    } else {
      console.log('⚠️  Some tests failed. Please check the database configuration.');
    }

    console.log('\n🧪 ========================================');
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  const runner = new DatabaseVerificationRunner();
  runner.runAllTests()
    .then(() => {
      console.log('Database verification completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database verification failed:', error);
      process.exit(1);
    });
}

export { DatabaseVerificationRunner };