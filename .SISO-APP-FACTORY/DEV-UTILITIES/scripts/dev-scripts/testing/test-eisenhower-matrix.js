// Test script for Eisenhower Matrix AI Task Organizer
// Run this in browser console to test the functionality

console.log('🎯 Testing Eisenhower Matrix AI Task Organizer...');

// Test function to create sample tasks for AI analysis
async function createTestTasksForMatrix() {
  console.log('\n📝 Creating sample tasks for Eisenhower Matrix analysis...');
  
  try {
    // Import the personal task service
    const { personalTaskService } = await import('./src/services/personalTaskService.ts');
    
    // Clear existing tasks for clean testing
    personalTaskService.clearAllTasks();
    console.log('🧹 Cleared existing tasks for testing');
    
    // Create diverse tasks that will fall into different quadrants
    const testTasks = [
      // Quadrant 1: Do First (Urgent + Important)
      {
        title: 'Fix critical production bug affecting user login',
        description: 'Users cannot log in, revenue impact, needs immediate fix',
        workType: 'deep',
        priority: 'critical',
        estimatedDuration: 180
      },
      {
        title: 'Client presentation deadline today',
        description: 'Major client presentation due today at 3 PM',
        workType: 'deep', 
        priority: 'urgent',
        estimatedDuration: 120
      },
      
      // Quadrant 2: Schedule (Important + Not Urgent)
      {
        title: 'Design system architecture for new feature',
        description: 'Plan scalable architecture for upcoming partnership program',
        workType: 'deep',
        priority: 'high',
        estimatedDuration: 240
      },
      {
        title: 'Research competitor analysis for product strategy',
        description: 'Comprehensive analysis to inform strategic decisions',
        workType: 'deep',
        priority: 'high', 
        estimatedDuration: 150
      },
      {
        title: 'Learn new React performance optimization techniques',
        description: 'Study advanced React patterns for better performance',
        workType: 'light',
        priority: 'medium',
        estimatedDuration: 90
      },
      
      // Quadrant 3: Delegate (Urgent + Not Important)
      {
        title: 'Update team on urgent project status',
        description: 'Send quick status update to team, deadline today',
        workType: 'light',
        priority: 'medium',
        estimatedDuration: 15
      },
      {
        title: 'Respond to urgent but routine email from vendor',
        description: 'Quick response needed for vendor inquiry today',
        workType: 'light',
        priority: 'low',
        estimatedDuration: 10
      },
      
      // Quadrant 4: Eliminate (Not Urgent + Not Important)
      {
        title: 'Organize desktop files and cleanup',
        description: 'General housekeeping and file organization',
        workType: 'light',
        priority: 'low',
        estimatedDuration: 30
      },
      {
        title: 'Browse through optional industry newsletters',
        description: 'Reading optional industry updates when time permits',
        workType: 'light',
        priority: 'low',
        estimatedDuration: 20
      }
    ];
    
    personalTaskService.addTasks(testTasks);
    console.log(`✅ Added ${testTasks.length} diverse test tasks for AI analysis`);
    
    // Show what was created
    const todayTasks = personalTaskService.getTasksForDate(new Date());
    console.log('\n📊 Test tasks created:');
    todayTasks.tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} (${task.workType} work, ${task.priority} priority)`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error creating test tasks:', error);
    return false;
  }
}

// Test the AI analysis functionality
async function testMatrixAnalysis() {
  console.log('\n🧠 Testing AI-powered Eisenhower Matrix analysis...');
  
  try {
    const { eisenhowerMatrixOrganizer } = await import('./src/services/eisenhowerMatrixOrganizer.ts');
    
    // Run the AI analysis
    const result = await eisenhowerMatrixOrganizer.organizeTasks(new Date());
    
    console.log('\n🎯 Eisenhower Matrix Analysis Results:');
    console.log(`Total tasks analyzed: ${result.totalTasks}`);
    console.log(`Analysis completed at: ${result.analysisTimestamp.toLocaleTimeString()}`);
    
    // Show quadrant breakdown
    console.log('\n📊 Quadrant Distribution:');
    console.log(`🔴 DO FIRST (Urgent + Important): ${result.doFirst.length} tasks`);
    result.doFirst.forEach(task => {
      console.log(`   • ${task.title} (U:${task.eisenhowerAnalysis.urgentScore}, I:${task.eisenhowerAnalysis.importanceScore})`);
    });
    
    console.log(`🔵 SCHEDULE (Important + Not Urgent): ${result.schedule.length} tasks`);
    result.schedule.forEach(task => {
      console.log(`   • ${task.title} (U:${task.eisenhowerAnalysis.urgentScore}, I:${task.eisenhowerAnalysis.importanceScore})`);
    });
    
    console.log(`🟡 DELEGATE (Urgent + Not Important): ${result.delegate.length} tasks`);
    result.delegate.forEach(task => {
      console.log(`   • ${task.title} (U:${task.eisenhowerAnalysis.urgentScore}, I:${task.eisenhowerAnalysis.importanceScore})`);
    });
    
    console.log(`⚪ ELIMINATE (Not Urgent + Not Important): ${result.eliminate.length} tasks`);
    result.eliminate.forEach(task => {
      console.log(`   • ${task.title} (U:${task.eisenhowerAnalysis.urgentScore}, I:${task.eisenhowerAnalysis.importanceScore})`);
    });
    
    // Show AI insights
    console.log('\n🤖 AI Summary & Recommendations:');
    console.log(`Average Urgency Score: ${result.summary.averageUrgency}/10`);
    console.log(`Average Importance Score: ${result.summary.averageImportance}/10`);
    
    console.log('\n💡 AI Recommendations:');
    result.summary.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    // Test applying the organization
    console.log('\n🔄 Testing task organization application...');
    await eisenhowerMatrixOrganizer.applyOrganizedOrder(result, new Date());
    
    // Verify the new order
    const { personalTaskService } = await import('./src/services/personalTaskService.ts');
    const organizedTasks = personalTaskService.getTasksForDate(new Date());
    
    console.log('\n✅ Tasks have been reorganized by priority:');
    organizedTasks.tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} (Priority: ${task.priority})`);
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error during matrix analysis:', error);
    return null;
  }
}

// Test quick preview functionality
async function testQuickPreview() {
  console.log('\n⚡ Testing quick preview functionality...');
  
  try {
    const { eisenhowerMatrixOrganizer } = await import('./src/services/eisenhowerMatrixOrganizer.ts');
    
    const preview = eisenhowerMatrixOrganizer.getQuickPreview(new Date());
    
    console.log(`📊 Quick Preview - ${preview.taskCount} tasks:`);
    console.log(`   🔴 Estimated Do First: ${preview.estimatedQuadrants['do-first']}`);
    console.log(`   🔵 Estimated Schedule: ${preview.estimatedQuadrants['schedule']}`);
    console.log(`   🟡 Estimated Delegate: ${preview.estimatedQuadrants['delegate']}`);
    console.log(`   ⚪ Estimated Eliminate: ${preview.estimatedQuadrants['eliminate']}`);
    
    return preview;
  } catch (error) {
    console.error('❌ Error during quick preview:', error);
    return null;
  }
}

// Main test runner
async function runEisenhowerMatrixTests() {
  console.log('🚀 Starting Eisenhower Matrix AI Tests...\n');
  
  try {
    // Test 1: Create diverse test data
    const setupSuccess = await createTestTasksForMatrix();
    if (!setupSuccess) {
      console.error('❌ Setup failed, aborting tests');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 2: Quick preview
    const previewResult = await testQuickPreview();
    if (!previewResult) {
      console.error('❌ Quick preview test failed');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 3: Full AI analysis
    const analysisResult = await testMatrixAnalysis();
    if (!analysisResult) {
      console.error('❌ Matrix analysis failed');
      return;
    }
    
    console.log('\n🏁 All Eisenhower Matrix tests completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Open the LifeLock page in your browser');
    console.log('2. Click the "Organize Tasks" button to see the AI analysis');
    console.log('3. Review the quadrant categorization and apply the organization');
    console.log('4. Add more tasks with voice input and re-organize to see AI adaptation');
    
    return analysisResult;
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Make functions available globally
window.runEisenhowerMatrixTests = runEisenhowerMatrixTests;
window.createTestTasksForMatrix = createTestTasksForMatrix;
window.testMatrixAnalysis = testMatrixAnalysis;
window.testQuickPreview = testQuickPreview;

console.log(`
🎯 Eisenhower Matrix Test Functions Available:
- runEisenhowerMatrixTests() - Run complete test suite with sample tasks
- createTestTasksForMatrix() - Create sample tasks spanning all 4 quadrants
- testMatrixAnalysis() - Test AI analysis and task organization
- testQuickPreview() - Test quick preview functionality

Example usage:
runEisenhowerMatrixTests();
`);

// Auto-run tests if this script is executed
if (typeof window !== 'undefined') {
  console.log('⏳ Running Eisenhower Matrix tests in 3 seconds... (or call runEisenhowerMatrixTests() manually)');
  setTimeout(runEisenhowerMatrixTests, 3000);
}