/**
 * 🧪 SIMPLE DATABASE VERIFICATION
 * 
 * Basic JavaScript test to verify database connection and functionality
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🧪 ========================================');
  console.log('🧪 STARTING SIMPLE DATABASE CONNECTION TEST');
  console.log('🧪 ========================================\n');

  try {
    // Test 1: Database Connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Test 2: Check if tables exist by trying to count records
    console.log('🔍 Testing PersonalTask table...');
    const taskCount = await prisma.personalTask.count();
    console.log(`✅ PersonalTask table accessible - ${taskCount} tasks found\n`);

    console.log('🔍 Testing PersonalSubtask table...');
    const subtaskCount = await prisma.personalSubtask.count();
    console.log(`✅ PersonalSubtask table accessible - ${subtaskCount} subtasks found\n`);

    console.log('🔍 Testing PersonalContext table...');
    const contextCount = await prisma.personalContext.count();
    console.log(`✅ PersonalContext table accessible - ${contextCount} contexts found\n`);

    // Test 3: Check if we can query with relationships
    console.log('🔍 Testing relationships - fetching tasks with subtasks...');
    const tasksWithSubtasks = await prisma.personalTask.findMany({
      include: {
        subtasks: true
      },
      take: 3 // Just get first 3 for testing
    });
    console.log(`✅ Relationships working - found ${tasksWithSubtasks.length} tasks with subtasks\n`);

    // Test 4: Check WorkType enum values
    console.log('🔍 Testing WorkType enum values...');
    const workTypes = await prisma.personalTask.groupBy({
      by: ['workType'],
      _count: {
        workType: true
      }
    });
    console.log('✅ WorkType enum values found:');
    workTypes.forEach(wt => {
      console.log(`   • ${wt.workType}: ${wt._count.workType} tasks`);
    });
    console.log('');

    // Test 5: Test AI XP fields exist
    console.log('🔍 Testing AI XP fields...');
    const analyzedTasks = await prisma.personalTask.findMany({
      where: {
        aiAnalyzed: true
      },
      select: {
        id: true,
        title: true,
        xpReward: true,
        difficulty: true,
        aiReasoning: true
      },
      take: 3
    });
    console.log(`✅ AI XP fields accessible - found ${analyzedTasks.length} analyzed tasks\n`);

    console.log('🎉 ========================================');
    console.log('🎉 DATABASE VERIFICATION SUCCESSFUL!');
    console.log('🎉 ========================================\n');

    console.log('✅ Verified Components:');
    console.log('   • Database connection');
    console.log('   • PersonalTask table structure');
    console.log('   • PersonalSubtask table structure');
    console.log('   • PersonalContext table structure');
    console.log('   • Task-Subtask relationships');
    console.log('   • WorkType enum values');
    console.log('   • AI XP analysis fields');

    return {
      success: true,
      taskCount,
      subtaskCount,
      contextCount,
      workTypes: workTypes.map(wt => wt.workType),
      analyzedTasksCount: analyzedTasks.length
    };

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    
    if (error.code === 'P1001') {
      console.error('💡 Database connection issue - check VITE_PRISMA_DATABASE_URL');
    } else if (error.code === 'P2021') {
      console.error('💡 Table does not exist - run: npx prisma migrate dev');
    } else if (error.code === 'P2025') {
      console.error('💡 Record not found - this is normal for empty database');
    }

    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabase()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Database is ready for use!');
        process.exit(0);
      } else {
        console.log('\n❌ Database needs attention.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default testDatabase;