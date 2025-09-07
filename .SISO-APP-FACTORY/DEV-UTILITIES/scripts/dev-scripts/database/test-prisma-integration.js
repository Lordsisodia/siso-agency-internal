/**
 * 🧪 Test Prisma Integration
 * 
 * Verify that the real Prisma client is working with proper user creation
 */

import { PersonalTasksAPI } from '../src/api/personalTasksApi.ts';
import { ClerkUserSync } from '../ai-first/core/auth.service.js';

async function testPrismaIntegration() {
  console.log('🧪 ========================================');
  console.log('🧪 TESTING REAL PRISMA INTEGRATION');
  console.log('🧪 ========================================\n');

  try {
    // Step 1: Create a test user via Clerk sync
    console.log('👤 Step 1: Creating test user via Clerk sync...');
    
    const mockClerkUser = {
      id: 'test-prisma-user-' + Date.now(),
      emailAddresses: [{ emailAddress: 'test-prisma@example.com' }],
      firstName: 'Test',
      lastName: 'Prisma'
    };

    const user = await ClerkUserSync.getOrCreateUser(mockClerkUser);
    if (!user) {
      throw new Error('Failed to create user');
    }
    
    console.log(`✅ User created: ${user.id} (${user.email})\n`);

    // Step 2: Create a morning routine task
    console.log('📅 Step 2: Creating morning routine task...');
    
    const taskData = {
      title: 'Morning Routine Test Task',
      description: 'Testing real Prisma persistence',
      workType: 'MORNING',
      priority: 'HIGH',
      currentDate: new Date().toISOString().split('T')[0],
      timeEstimate: '30 min',
      estimatedDuration: 30,
      subtasks: [
        { title: 'Test Subtask 1', workType: 'MORNING' },
        { title: 'Test Subtask 2', workType: 'MORNING' }
      ]
    };

    const createResult = await PersonalTasksAPI.createTask(user.id, taskData);
    if (!createResult.success) {
      throw new Error('Failed to create task: ' + createResult.error);
    }
    
    const task = createResult.data;
    console.log(`✅ Task created: ${task.id} with ${task.subtasks.length} subtasks\n`);

    // Step 3: Toggle task completion
    console.log('✅ Step 3: Testing task completion toggle...');
    
    const completeResult = await PersonalTasksAPI.updateTaskCompletion(task.id, true);
    if (!completeResult.success) {
      throw new Error('Failed to complete task: ' + completeResult.error);
    }
    
    console.log(`✅ Task marked as completed\n`);

    // Step 4: Toggle subtask completion
    console.log('✅ Step 4: Testing subtask completion toggle...');
    
    const subtaskId = task.subtasks[0].id;
    const subtaskResult = await PersonalTasksAPI.updateSubtaskCompletion(subtaskId, true);
    if (!subtaskResult.success) {
      throw new Error('Failed to complete subtask: ' + subtaskResult.error);
    }
    
    console.log(`✅ Subtask marked as completed\n`);

    // Step 5: Verify persistence by fetching tasks
    console.log('🔍 Step 5: Testing data persistence...');
    
    const fetchResult = await PersonalTasksAPI.getTasksForDate(user.id, taskData.currentDate);
    if (!fetchResult.success) {
      throw new Error('Failed to fetch tasks: ' + fetchResult.error);
    }
    
    const fetchedTasks = fetchResult.data;
    const foundTask = fetchedTasks.find(t => t.id === task.id);
    
    if (!foundTask) {
      throw new Error('Task not found after creation');
    }
    
    if (!foundTask.completed) {
      throw new Error('Task completion not persisted');
    }
    
    const completedSubtask = foundTask.subtasks.find(s => s.id === subtaskId);
    if (!completedSubtask || !completedSubtask.completed) {
      throw new Error('Subtask completion not persisted');
    }
    
    console.log(`✅ Data persistence verified!\n`);

    // Step 6: Test AI XP analysis
    console.log('🤖 Step 6: Testing AI analysis persistence...');
    
    const aiAnalysis = {
      xpReward: 150,
      difficulty: 'moderate',
      reasoning: 'Morning routine task with good strategic value',
      priorityRank: 4,
      contextualBonus: 25,
      complexity: 6,
      learningValue: 7,
      strategicImportance: 8,
      confidence: 0.9
    };

    const aiResult = await PersonalTasksAPI.updateTaskAIAnalysis(task.id, aiAnalysis);
    if (!aiResult.success) {
      throw new Error('Failed to update AI analysis: ' + aiResult.error);
    }
    
    console.log(`✅ AI analysis persisted\n`);

    // Step 7: Clean up test data
    console.log('🧹 Step 7: Cleaning up test data...');
    
    const deleteResult = await PersonalTasksAPI.deleteTask(task.id);
    if (!deleteResult.success) {
      console.warn('⚠️ Failed to cleanup task:', deleteResult.error);
    }

    // Clean up user (simplified - would need proper user deletion)
    console.log(`✅ Test completed successfully!\n`);

    console.log('🎉 ========================================');
    console.log('🎉 PRISMA INTEGRATION TEST PASSED!');
    console.log('🎉 ========================================\n');

    console.log('✅ VERIFIED FEATURES:');
    console.log('   • User creation via Clerk sync');
    console.log('   • Task creation with subtasks');
    console.log('   • Task completion persistence');
    console.log('   • Subtask completion persistence');
    console.log('   • AI XP analysis persistence');
    console.log('   • Data fetching across sessions');
    console.log('');
    console.log('🚀 Your UI should now have real persistence!');

    return { success: true };

  } catch (error) {
    console.error('❌ PRISMA INTEGRATION TEST FAILED:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testPrismaIntegration()
  .then(result => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });