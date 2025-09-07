/**
 * 🐛 DEBUG UI PERSISTENCE ISSUES
 * 
 * Test actual database operations that should happen when UI buttons are clicked
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function debugUIPersistence() {
  console.log('🐛 ========================================');
  console.log('🐛 DEBUGGING UI PERSISTENCE ISSUES');
  console.log('🐛 ========================================\n');

  try {
    // Test 1: Check if we can create a morning routine task like the UI should
    console.log('🔍 Testing Morning Routine Task Creation...');
    
    const testUserId = 'test-debug-user';
    const testDate = new Date().toISOString().split('T')[0];

    const morningTask = await prisma.personalTask.create({
      data: {
        userId: testUserId,
        title: 'Debug Morning Task',
        description: 'Testing if morning tasks save correctly',
        workType: 'MORNING',
        priority: 'HIGH',
        currentDate: testDate,
        originalDate: testDate,
        timeEstimate: '5 min',
        estimatedDuration: 5,
        subtasks: {
          create: [
            {
              title: 'Debug Subtask 1',
              workType: 'MORNING'
            },
            {
              title: 'Debug Subtask 2', 
              workType: 'MORNING'
            }
          ]
        }
      },
      include: {
        subtasks: true
      }
    });

    console.log(`✅ Created morning task: ${morningTask.title}`);
    console.log(`   Subtasks: ${morningTask.subtasks.length}`);
    console.log(`   Task ID: ${morningTask.id}\n`);

    // Test 2: Toggle task completion like the checkbox should
    console.log('🔍 Testing Task Completion Toggle...');
    
    await prisma.personalTask.update({
      where: { id: morningTask.id },
      data: { 
        completed: true,
        completedAt: new Date()
      }
    });

    const completedTask = await prisma.personalTask.findUnique({
      where: { id: morningTask.id },
      select: { id: true, title: true, completed: true, completedAt: true }
    });

    console.log(`✅ Task completion toggled:`);
    console.log(`   Completed: ${completedTask.completed}`);
    console.log(`   Completed At: ${completedTask.completedAt}\n`);

    // Test 3: Toggle subtask completion
    console.log('🔍 Testing Subtask Completion Toggle...');
    
    const subtaskId = morningTask.subtasks[0].id;
    await prisma.personalSubtask.update({
      where: { id: subtaskId },
      data: { 
        completed: true,
        completedAt: new Date()
      }
    });

    const completedSubtask = await prisma.personalSubtask.findUnique({
      where: { id: subtaskId },
      select: { id: true, title: true, completed: true, completedAt: true }
    });

    console.log(`✅ Subtask completion toggled:`);
    console.log(`   Completed: ${completedSubtask.completed}`);
    console.log(`   Completed At: ${completedSubtask.completedAt}\n`);

    // Test 4: Check if tasks persist across "page refreshes" (simulate fetching)
    console.log('🔍 Testing Data Persistence (Simulate Page Refresh)...');
    
    const persistedTasks = await prisma.personalTask.findMany({
      where: {
        userId: testUserId,
        currentDate: testDate
      },
      include: {
        subtasks: true
      }
    });

    console.log(`✅ Tasks found after refresh: ${persistedTasks.length}`);
    persistedTasks.forEach(task => {
      console.log(`   • ${task.title} - Completed: ${task.completed}`);
      task.subtasks.forEach(subtask => {
        console.log(`     ◦ ${subtask.title} - Completed: ${subtask.completed}`);
      });
    });
    console.log('');

    // Test 5: Create Light Work task to test that section
    console.log('🔍 Testing Light Work Task Creation...');
    
    const lightTask = await prisma.personalTask.create({
      data: {
        userId: testUserId,
        title: 'Debug Light Work Task',
        description: 'Testing if light work tasks save correctly',
        workType: 'LIGHT',
        priority: 'MEDIUM',
        currentDate: testDate,
        originalDate: testDate,
        timeEstimate: '30 min',
        estimatedDuration: 30
      }
    });

    console.log(`✅ Created light work task: ${lightTask.title}`);
    console.log(`   Task ID: ${lightTask.id}\n`);

    // Test 6: Check WorkType filtering
    console.log('🔍 Testing WorkType Filtering...');
    
    const morningTasks = await prisma.personalTask.findMany({
      where: {
        userId: testUserId,
        workType: 'MORNING'
      }
    });

    const lightTasks = await prisma.personalTask.findMany({
      where: {
        userId: testUserId,
        workType: 'LIGHT'
      }
    });

    console.log(`✅ WorkType filtering:`);
    console.log(`   MORNING tasks: ${morningTasks.length}`);
    console.log(`   LIGHT tasks: ${lightTasks.length}\n`);

    // Cleanup
    console.log('🧹 Cleaning up debug data...');
    await prisma.personalTask.deleteMany({
      where: { userId: testUserId }
    });
    console.log('✅ Cleanup completed\n');

    console.log('🎉 ========================================');
    console.log('🎉 DATABASE OPERATIONS ARE WORKING!');
    console.log('🎉 ========================================\n');

    console.log('💡 POSSIBLE ISSUES IN UI:');
    console.log('   1. User authentication not working');
    console.log('   2. useTaskDatabase hook not receiving authenticated user');
    console.log('   3. Error handling silently failing database operations');
    console.log('   4. ClerkProvider not wrapping the components properly');
    console.log('   5. Environment variables missing for database connection');

  } catch (error) {
    console.error('❌ Debug test failed:', error);
    
    if (error.code === 'P2002') {
      console.error('💡 Unique constraint violation - user/date combination exists');
    } else if (error.code === 'P1001') {
      console.error('💡 Database connection issue - check environment variables');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run debug test
debugUIPersistence()
  .then(() => {
    console.log('\n🔍 Debug test completed. If this passed, the issue is in the UI layer.');
  })
  .catch((error) => {
    console.error('\n❌ Debug test failed completely:', error);
  });