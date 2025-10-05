#!/usr/bin/env node
/**
 * 🧪 Vercel API Testing Script
 * 
 * Tests all API endpoints on the deployed Vercel site
 */

const BASE_URL = 'https://siso-internal.vercel.app'; // Your actual Vercel URL
const TEST_USER_ID = 'user_31c4PuaPdFf9abejhmzrN9kcill'; // From our restored database
const TEST_DATE = '2025-08-27'; // Date with tasks in our database

console.log('🚀 Testing Vercel API endpoints...\n');

async function testAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`📡 Testing: ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${response.status}: Success`);
      console.log(`📦 Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...\n');
      return data;
    } else {
      console.log(`❌ ${response.status}: Error`);
      console.log(`📦 Response:`, data);
      console.log('');
      return null;
    }
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}\n`);
    return null;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 VERCEL API ENDPOINT TESTING');
  console.log('='.repeat(60));
  
  // Test 1: Get Tasks
  console.log('\n1️⃣ Testing GET /api/tasks');
  await testAPI(`/api/tasks?userId=${TEST_USER_ID}&date=${TEST_DATE}`);
  
  // Test 2: Get Morning Routine
  console.log('2️⃣ Testing GET /api/morning-routine');
  await testAPI(`/api/morning-routine?userId=${TEST_USER_ID}&date=${TEST_DATE}`);
  
  // Test 3: Get Personal Context
  console.log('3️⃣ Testing GET /api/personal-context');
  await testAPI(`/api/personal-context?userId=${TEST_USER_ID}`);
  
  // Test 4: Update Morning Routine Habit
  console.log('4️⃣ Testing PATCH /api/morning-routine');
  await testAPI('/api/morning-routine', {
    method: 'PATCH',
    body: JSON.stringify({
      userId: TEST_USER_ID,
      date: TEST_DATE,
      habitName: 'wakeUp',
      completed: true
    })
  });
  
  // Test 5: Create a new task
  console.log('5️⃣ Testing POST /api/tasks');
  const newTask = await testAPI('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      userId: TEST_USER_ID,
      taskData: {
        title: 'Test API Integration',
        description: 'Testing Vercel API functionality',
        workType: 'LIGHT',
        priority: 'MEDIUM',
        currentDate: TEST_DATE
      }
    })
  });
  
  // Test 6: Update the created task
  if (newTask && newTask.data) {
    console.log('6️⃣ Testing PUT /api/tasks (update created task)');
    await testAPI('/api/tasks', {
      method: 'PUT',
      body: JSON.stringify({
        taskId: newTask.data.id,
        completed: true
      })
    });
  }
  
  console.log('='.repeat(60));
  console.log('✅ API Testing Complete!');
  console.log('='.repeat(60));
}

// Check if we're running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
}