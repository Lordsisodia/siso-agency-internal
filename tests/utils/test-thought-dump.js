// Quick test script for the LifeLock Voice Task Processor
// Run this in the browser console to test the thought dump processing

console.log('🧪 Testing LifeLock Voice Task Processor...');

// Test cases for different types of thought dumps
const testCases = [
  // Simple single task
  "I need to fix the login bug on the SISO agency app",
  
  // Multiple tasks in one dump
  "I need to design the new landing page, then code the user authentication, and also update the database schema, plus send an email to the client about the progress",
  
  // Mixed complexity tasks
  "Quick call with Sarah about the project timeline, then deep dive into the algorithm optimization for crypto trading, and also organize my desk",
  
  // Complex project breakdown
  "Build the entire partnership program feature including the dashboard, API endpoints, database migrations, testing, and deployment to production"
];

// Function to test a single case
async function testThoughtDump(input) {
  console.log(`\n📝 Testing: "${input}"`);
  
  try {
    // Import the processor (adjust path as needed)
    const { lifeLockVoiceTaskProcessor } = await import('./src/services/lifeLockVoiceTaskProcessor.ts');
    
    const result = await lifeLockVoiceTaskProcessor.processThoughtDump(input);
    
    console.log('✅ Result:', {
      success: result.success,
      message: result.message,
      totalTasks: result.totalTasks,
      deepTasks: result.deepTasks.length,
      lightTasks: result.lightTasks.length,
      processingNotes: result.processingNotes
    });
    
    if (result.deepTasks.length > 0) {
      console.log('🔥 Deep Work Tasks:');
      result.deepTasks.forEach(task => {
        console.log(`  - ${task.title} (${task.priority}, ${task.estimatedDuration}min)`);
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            console.log(`    • ${subtask.title} (${subtask.workType})`);
          });
        }
      });
    }
    
    if (result.lightTasks.length > 0) {
      console.log('⚡ Light Work Tasks:');
      result.lightTasks.forEach(task => {
        console.log(`  - ${task.title} (${task.priority}, ${task.estimatedDuration}min)`);
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            console.log(`    • ${subtask.title} (${subtask.workType})`);
          });
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Run all test cases
async function runAllTests() {
  console.log('🚀 Starting comprehensive thought dump tests...\n');
  
  for (let i = 0; i < testCases.length; i++) {
    await testThoughtDump(testCases[i]);
    
    // Wait a bit between tests to avoid rate limiting
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n🏁 All tests completed!');
}

// Make functions available globally for manual testing
window.testThoughtDump = testThoughtDump;
window.runAllTests = runAllTests;

console.log(`
📋 Test functions available:
- testThoughtDump("your text here") - Test a single thought dump
- runAllTests() - Run all predefined test cases

Example usage:
testThoughtDump("I need to build a user dashboard and fix the payment bug");
`);

// Auto-run tests if this script is executed
if (typeof window !== 'undefined') {
  console.log('⏳ Running tests in 3 seconds... (or call runAllTests() manually)');
  setTimeout(runAllTests, 3000);
}