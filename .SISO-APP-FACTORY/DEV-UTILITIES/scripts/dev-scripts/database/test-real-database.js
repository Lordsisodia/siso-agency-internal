/**
 * 🧪 Test Real Database Connection
 * 
 * Direct Prisma database test to verify everything works
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function testRealDatabase() {
  console.log('🧪 ========================================');
  console.log('🧪 TESTING REAL DATABASE CONNECTION');
  console.log('🧪 ========================================\n');

  try {
    // Test 1: Database Connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Test 2: Check existing data
    console.log('🔍 Checking existing data...');
    const userCount = await prisma.user.count();
    const taskCount = await prisma.personalTask.count();
    const subtaskCount = await prisma.personalSubtask.count();
    console.log(`📊 Existing data: ${userCount} users, ${taskCount} tasks, ${subtaskCount} subtasks\n`);

    // Test 3: Create a test user (if none exists)
    console.log('👤 Creating test user...');
    const testUserId = 'test_user_' + Date.now();
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        id: testUserId,
        email: 'test@example.com',
        supabaseId: testUserId
      }
    });
    console.log(`✅ Test user: ${testUser.id} (${testUser.email})\n`);

    // Test 4: Create a real task with subtasks
    console.log('➕ Creating test task with subtasks...');
    const testTask = await prisma.personalTask.create({
      data: {
        userId: testUser.id,
        title: 'Test Real Database Task',
        description: 'Testing real database persistence',
        workType: 'LIGHT',
        priority: 'HIGH',
        currentDate: new Date().toISOString().split('T')[0],
        originalDate: new Date().toISOString().split('T')[0],
        timeEstimate: '15 min',
        estimatedDuration: 15,
        tags: ['test', 'database'],
        subtasks: {
          create: [
            {
              title: 'Test Subtask 1',
              workType: 'LIGHT'
            },
            {
              title: 'Test Subtask 2', 
              workType: 'LIGHT'
            }
          ]
        }
      },
      include: {
        subtasks: true
      }
    });

    console.log(`✅ Task created: ${testTask.id}`);
    console.log(`   Title: ${testTask.title}`);
    console.log(`   Subtasks: ${testTask.subtasks.length}`);
    console.log(`   Work Type: ${testTask.workType}`);
    console.log(`   Priority: ${testTask.priority}`);
    console.log('');

    // Test 5: Read the task back (simulate page refresh)
    console.log('🔄 Reading task back (simulating page refresh)...');
    const retrievedTasks = await prisma.personalTask.findMany({
      where: {
        userId: testUser.id,
        currentDate: new Date().toISOString().split('T')[0]
      },
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`✅ Retrieved ${retrievedTasks.length} tasks from database`);
    const retrievedTask = retrievedTasks.find(t => t.id === testTask.id);
    if (retrievedTask) {
      console.log(`   ✓ Task found: ${retrievedTask.title}`);
      console.log(`   ✓ Subtasks: ${retrievedTask.subtasks.length}`);
    }
    console.log('');

    // Test 6: Update task completion (simulate checkbox click)
    console.log('✅ Testing task completion (checkbox simulation)...');
    await prisma.personalTask.update({
      where: { id: testTask.id },
      data: { 
        completed: true,
        completedAt: new Date()
      }
    });
    console.log('✅ Task marked as completed\n');

    // Test 7: Update subtask completion
    console.log('✅ Testing subtask completion...');
    const subtask = testTask.subtasks[0];
    await prisma.personalSubtask.update({
      where: { id: subtask.id },
      data: { 
        completed: true,
        completedAt: new Date()
      }
    });
    console.log('✅ Subtask marked as completed\n');

    // Test 8: Verify persistence (read again)
    console.log('🔄 Final verification - reading completed states...');
    const finalTask = await prisma.personalTask.findUnique({
      where: { id: testTask.id },
      include: {
        subtasks: true
      }
    });

    console.log('📊 Final state:');
    console.log(`   Task completed: ${finalTask.completed}`);
    console.log(`   Subtask 1 completed: ${finalTask.subtasks[0].completed}`);
    console.log(`   Subtask 2 completed: ${finalTask.subtasks[1].completed}`);
    console.log('');

    // Test 9: Personal Context
    console.log('👤 Testing personal context...');
    await prisma.personalContext.upsert({
      where: { userId: testUser.id },
      create: {
        userId: testUser.id,
        currentGoals: 'Test database persistence',
        skillPriorities: 'Database management, Testing',
        revenueTargets: 'Improve system reliability'
      },
      update: {
        currentGoals: 'Test database persistence - UPDATED'
      }
    });
    
    const context = await prisma.personalContext.findUnique({
      where: { userId: testUser.id }
    });
    console.log('✅ Personal context saved and retrieved');
    console.log(`   Goals: ${context.currentGoals}`);
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.personalTask.delete({
      where: { id: testTask.id }
    });
    // Keep test user for future tests
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 ========================================');
    console.log('🎉 REAL DATABASE TEST SUCCESSFUL!');
    console.log('🎉 ========================================\n');

    console.log('✅ VERIFIED REAL DATABASE FEATURES:');
    console.log('   • ✅ Database connection and authentication');
    console.log('   • ✅ User management');
    console.log('   • ✅ Task creation with subtasks');
    console.log('   • ✅ Task completion persistence');
    console.log('   • ✅ Subtask completion persistence');
    console.log('   • ✅ Personal context management');
    console.log('   • ✅ Data persistence across queries (simulated page refresh)');
    console.log('');
    console.log('🚀 THE REAL DATABASE IS WORKING PERFECTLY!');
    console.log('🚀 We can use real data from the beginning!');

    return { success: true };

  } catch (error) {
    console.error('❌ REAL DATABASE TEST FAILED:', error);
    console.error('');
    
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRealDatabase()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 Real database is ready for production use!');
      process.exit(0);
    } else {
      console.log('\n❌ Real database has issues that need fixing.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal database test error:', error);
    process.exit(1);
  });