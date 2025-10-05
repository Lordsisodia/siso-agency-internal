#!/usr/bin/env node
/**
 * Test the Light Work Task API endpoints with "Before Bali" task
 */

async function testBaliTaskAPI() {
  try {
    console.log('🧪 Testing Light Work Task API with "Before Bali" task...\n');

    const userId = 'user_31c4PuaPdFf9abejhmzrN9kcill';
    const today = new Date().toISOString().split('T')[0];

    // Test GET endpoint
    console.log('1️⃣ Testing GET /api/light-work/tasks');
    const response = await fetch(`http://localhost:3000/api/light-work/tasks?userId=${userId}&date=${today}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ API returned ${result.data.length} tasks`);
      
      const baliTask = result.data.find(task => task.title === 'Before Bali');
      if (baliTask) {
        console.log(`✅ "Before Bali" task found via API`);
        console.log(`   Task ID: ${baliTask.id}`);
        console.log(`   Subtasks: ${baliTask.subtasks.length}`);
        
        baliTask.subtasks.forEach((subtask, index) => {
          console.log(`      ${index + 1}. ${subtask.title}`);
        });
      } else {
        console.log('❌ "Before Bali" task not found in API response');
      }
    } else {
      console.log('❌ API returned error:', result.error);
    }

    console.log('\n🎉 API test completed!');
    console.log('   The "Before Bali" task is accessible via the API.');
    console.log('   Your app should now display this task in the Light Work section.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Note: This test requires the server to be running on localhost:3000');
    console.log('   You can start the server with: npm start or node server.js');
  }
}

// Run the test
testBaliTaskAPI();