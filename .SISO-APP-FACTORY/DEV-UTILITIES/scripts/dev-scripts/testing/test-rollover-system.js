// Test script for Personal Task Rollover System
// Run this in browser console to test the rollover functionality

console.log('🧪 Testing Personal Task Rollover System...');

// Test function to create sample tasks for testing
async function createTestTasks() {
  console.log('\n📝 Creating test tasks...');
  
  try {
    // Import the personal task service
    const { personalTaskService } = await import('./src/services/personalTaskService.ts');
    
    // Clear existing tasks for clean testing
    personalTaskService.clearAllTasks();
    console.log('🧹 Cleared existing tasks for testing');
    
    // Create tasks for yesterday (these should roll over)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayTasks = [
      {
        title: 'Fix SISO Agency login bug',
        description: 'Debug authentication issue in production',
        workType: 'deep',
        priority: 'high',
        estimatedDuration: 120
      },
      {
        title: 'Send email to client Sarah',
        description: 'Update on project progress',
        workType: 'light', 
        priority: 'medium',
        estimatedDuration: 15
      },
      {
        title: 'Review code pull request',
        description: 'Check team member\'s code changes',
        workType: 'deep',
        priority: 'medium',
        estimatedDuration: 45
      }
    ];
    
    personalTaskService.addTasks(yesterdayTasks, yesterday);
    console.log(`✅ Added ${yesterdayTasks.length} tasks for yesterday`);
    
    // Create one completed task for yesterday (should NOT roll over)
    const completedTask = [
      {
        title: 'Daily standup meeting',
        description: 'Team check-in call',
        workType: 'light',
        priority: 'low',
        estimatedDuration: 30
      }
    ];
    
    personalTaskService.addTasks(completedTask, yesterday);
    // Mark it as completed
    const allTasks = personalTaskService.getAllTasks();
    const standupTask = allTasks.find(t => t.title.includes('standup'));
    if (standupTask) {
      personalTaskService.toggleTask(standupTask.id);
      console.log('✅ Marked standup task as completed (should not roll over)');
    }
    
    // Create tasks for day before yesterday (should roll over with higher rollover count)
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    
    const olderTasks = [
      {
        title: 'Update project documentation',
        description: 'Write comprehensive docs for new features',
        workType: 'light',
        priority: 'low',
        estimatedDuration: 60
      }
    ];
    
    personalTaskService.addTasks(olderTasks, dayBefore);
    console.log('✅ Added older task from 2 days ago (should get rollover count of 2)');
    
    return true;
  } catch (error) {
    console.error('❌ Error creating test tasks:', error);
    return false;
  }
}

// Test rollover functionality
async function testRollover() {
  console.log('\n🔄 Testing rollover functionality...');
  
  try {
    const { personalTaskService } = await import('./src/services/personalTaskService.ts');
    
    // Get today's tasks (should trigger rollover)
    const todayTasks = personalTaskService.getTasksForDate(new Date());
    
    console.log('\n📊 Today\'s Tasks (after rollover):');
    console.log(`Total tasks: ${todayTasks.tasks.length}`);
    
    todayTasks.tasks.forEach(task => {
      console.log(`📋 ${task.title}`);
      console.log(`   - Work Type: ${task.workType}`);
      console.log(`   - Priority: ${task.priority}`);
      console.log(`   - Original Date: ${task.originalDate}`);
      console.log(`   - Current Date: ${task.currentDate}`);
      console.log(`   - Rollovers: ${task.rollovers}`);
      console.log(`   - Completed: ${task.completed}`);
      console.log('');
    });
    
    // Verify rollover logic
    const deepTasks = todayTasks.tasks.filter(t => t.workType === 'deep');
    const lightTasks = todayTasks.tasks.filter(t => t.workType === 'light');
    const rolledOverTasks = todayTasks.tasks.filter(t => t.rollovers > 0);
    const completedTasks = todayTasks.tasks.filter(t => t.completed);
    
    console.log('📈 Statistics:');
    console.log(`🔥 Deep Work Tasks: ${deepTasks.length}`);
    console.log(`⚡ Light Work Tasks: ${lightTasks.length}`);
    console.log(`🔄 Rolled Over Tasks: ${rolledOverTasks.length}`);
    console.log(`✅ Completed Tasks: ${completedTasks.length}`);
    
    // Expected results:
    console.log('\n🎯 Expected Results:');
    console.log('- Should have 4 tasks total (3 from yesterday + 1 from 2 days ago)');
    console.log('- Should have 0 completed tasks (completed ones don\'t roll over)');
    console.log('- Should have 4 rolled over tasks');
    console.log('- Task from 2 days ago should have rollovers: 2');
    console.log('- Tasks from yesterday should have rollovers: 1');
    
    return todayTasks;
  } catch (error) {
    console.error('❌ Error testing rollover:', error);
    return null;
  }
}

// Test task completion and re-rollover
async function testTaskCompletion() {
  console.log('\n✅ Testing task completion...');
  
  try {
    const { personalTaskService } = await import('./src/services/personalTaskService.ts');
    
    // Complete one task
    const todayTasks = personalTaskService.getTasksForDate(new Date());
    if (todayTasks.tasks.length > 0) {
      const taskToComplete = todayTasks.tasks[0];
      personalTaskService.toggleTask(taskToComplete.id);
      console.log(`✅ Completed task: "${taskToComplete.title}"`);
      
      // Get tomorrow's tasks (should not include the completed task)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const tomorrowTasks = personalTaskService.getTasksForDate(tomorrow);
      console.log(`📅 Tomorrow will have ${tomorrowTasks.tasks.length} tasks (should be 1 less than today)`);
      
      const completedTaskInTomorrow = tomorrowTasks.tasks.find(t => t.id === taskToComplete.id);
      if (!completedTaskInTomorrow) {
        console.log('✅ Completed task correctly excluded from tomorrow');
      } else {
        console.error('❌ Completed task incorrectly rolled over to tomorrow');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing task completion:', error);
    return false;
  }
}

// Main test runner
async function runAllRolloverTests() {
  console.log('🚀 Starting Personal Task Rollover Tests...\n');
  
  try {
    // Test 1: Create test data
    const setupSuccess = await createTestTasks();
    if (!setupSuccess) {
      console.error('❌ Setup failed, aborting tests');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 2: Test rollover logic
    const rolloverResult = await testRollover();
    if (!rolloverResult) {
      console.error('❌ Rollover test failed, aborting');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 3: Test task completion
    const completionResult = await testTaskCompletion();
    if (!completionResult) {
      console.error('❌ Completion test failed');
      return;
    }
    
    console.log('\n🏁 All rollover tests completed!');
    console.log('\n💡 Try these manual tests:');
    console.log('1. Reload the LifeLock page - you should see your rolled over tasks');
    console.log('2. Complete some tasks and check tomorrow - they shouldn\'t roll over');
    console.log('3. Create new tasks with the voice system - they should appear immediately');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Make functions available globally
window.runAllRolloverTests = runAllRolloverTests;
window.testRollover = testRollover;
window.createTestTasks = createTestTasks;

console.log(`
📋 Rollover Test Functions Available:
- runAllRolloverTests() - Run complete test suite
- createTestTasks() - Create sample tasks for testing  
- testRollover() - Test the rollover logic
- personalTaskService.clearAllTasks() - Clear all tasks for fresh start

Example usage:
runAllRolloverTests();
`);

// Auto-run tests if this script is executed
if (typeof window !== 'undefined') {
  console.log('⏳ Running rollover tests in 2 seconds... (or call runAllRolloverTests() manually)');
  setTimeout(runAllRolloverTests, 2000);
}