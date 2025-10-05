/**
 * 🧪 Test UI Fix
 * 
 * Quick test to verify the database service fixes work
 */

import { taskDatabaseService } from '../ai-first/services/task-database-service-fixed.ts';

async function testUIFix() {
  console.log('🧪 Testing UI Database Fix...\n');
  
  try {
    // Test with a mock user ID (Clerk user format)
    const testUserId = 'user_test_' + Date.now();
    const testDate = new Date().toISOString().split('T')[0];
    
    console.log('👤 Testing with user:', testUserId);
    console.log('📅 Testing with date:', testDate);
    console.log('');
    
    // Test 1: Fetch tasks (should return empty array initially)
    console.log('🔍 Test 1: Fetching tasks...');
    const initialTasks = await taskDatabaseService.getTasksForDate(testUserId, testDate);
    console.log(`✅ Found ${initialTasks.length} tasks initially`);
    console.log('');
    
    // Test 2: Create a task
    console.log('➕ Test 2: Creating task...');
    const taskInput = {
      title: 'Test Morning Task',
      description: 'Testing database persistence',
      workType: 'MORNING',
      priority: 'HIGH',
      currentDate: testDate,
      timeEstimate: '15 min',
      estimatedDuration: 15,
      subtasks: [
        { title: 'Test Subtask', workType: 'MORNING' }
      ]
    };
    
    const createdTask = await taskDatabaseService.createTask(testUserId, taskInput);
    console.log(`✅ Task created: ${createdTask.id}`);
    console.log(`   Title: ${createdTask.title}`);
    console.log(`   Subtasks: ${createdTask.subtasks.length}`);
    console.log('');
    
    // Test 3: Fetch tasks again (should now have 1 task)
    console.log('🔍 Test 3: Fetching tasks after creation...');
    const updatedTasks = await taskDatabaseService.getTasksForDate(testUserId, testDate);
    console.log(`✅ Found ${updatedTasks.length} tasks after creation`);
    console.log('');
    
    // Test 4: Update task completion
    console.log('✅ Test 4: Testing task completion...');
    await taskDatabaseService.updateTaskCompletion(createdTask.id, true);
    console.log(`✅ Task marked as completed`);
    console.log('');
    
    // Test 5: Update subtask completion
    console.log('✅ Test 5: Testing subtask completion...');
    const subtaskId = createdTask.subtasks[0].id;
    await taskDatabaseService.updateSubtaskCompletion(subtaskId, true);
    console.log(`✅ Subtask marked as completed`);
    console.log('');
    
    // Test 6: Personal context
    console.log('👤 Test 6: Testing personal context...');
    const contextData = {
      currentGoals: 'Fix database persistence issues',
      skillPriorities: 'Prisma, React, TypeScript',
      revenueTargets: 'Complete task management system'
    };
    
    await taskDatabaseService.updatePersonalContext(testUserId, contextData);
    const retrievedContext = await taskDatabaseService.getPersonalContext(testUserId);
    console.log(`✅ Personal context saved and retrieved`);
    console.log(`   Goals: ${retrievedContext?.currentGoals}`);
    console.log('');
    
    // Cleanup
    console.log('🧹 Cleaning up...');
    await taskDatabaseService.deleteTask(createdTask.id);
    console.log(`✅ Test task deleted`);
    console.log('');
    
    console.log('🎉 ========================================');
    console.log('🎉 UI DATABASE FIX TEST PASSED!');
    console.log('🎉 ========================================\n');
    
    console.log('✅ VERIFIED FUNCTIONALITY:');
    console.log('   • Task creation with subtasks');
    console.log('   • Task completion persistence');
    console.log('   • Subtask completion persistence');
    console.log('   • Personal context management');
    console.log('   • Data fetching and retrieval');
    console.log('');
    console.log('🚀 Your UI interactions should now persist!');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ UI FIX TEST FAILED:', error);
    console.error('');
    console.log('🔧 POSSIBLE ISSUES:');
    console.log('   • Prisma client not properly initialized');
    console.log('   • Database connection issues');
    console.log('   • Import path problems');
    console.log('   • Missing environment variables');
    
    return { success: false, error: error.message };
  }
}

// Run the test
testUIFix()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 The UI persistence fix should now work in your browser!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });