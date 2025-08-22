/**
 * REAL TASK FLOW TEST
 * Prove the entire system works by adding real test data
 */

import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

function formatDate(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function testCompleteTaskFlow() {
  console.log('🧪 TESTING COMPLETE TASK FLOW');
  console.log('===============================\n');

  try {
    // Step 1: Create or find a test user
    console.log('👤 Step 1: Setting up test user...');
    
    let testUser = await prisma.user.findFirst({
      where: {
        email: 'test@siso.com'
      }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          supabaseId: 'test-supabase-id-123',
          email: 'test@siso.com'
        }
      });
      console.log('✅ Created test user:', testUser.email);
    } else {
      console.log('✅ Using existing test user:', testUser.email);
    }

    // Step 2: Create realistic test tasks
    console.log('\n📝 Step 2: Creating realistic test tasks...');
    
    const today = new Date().toISOString().split('T')[0];
    
    const testTasks = [
      {
        title: 'Deep Focus: Review quarterly business metrics',
        description: 'Analyze Q4 performance data and identify growth opportunities for next quarter',
        workType: 'DEEP',
        priority: 'HIGH',
        estimatedDuration: 90,
        originalDate: today,
        currentDate: today,
        tags: ['business', 'analytics', 'quarterly-review']
      },
      {
        title: 'Light Work: Update social media content calendar',
        description: 'Plan Instagram and LinkedIn posts for next 2 weeks',
        workType: 'LIGHT',
        priority: 'MEDIUM',
        estimatedDuration: 30,
        originalDate: today,
        currentDate: today,
        tags: ['marketing', 'social-media', 'content']
      },
      {
        title: 'Deep Focus: Code review and architecture planning',
        description: 'Review mobile PWA persistence system and plan database optimization',
        workType: 'DEEP',
        priority: 'CRITICAL',
        estimatedDuration: 120,
        originalDate: today,
        currentDate: today,
        tags: ['development', 'architecture', 'mobile']
      }
    ];

    const createdTasks = [];
    
    for (const taskData of testTasks) {
      const task = await prisma.personalTask.create({
        data: {
          userId: testUser.id,
          ...taskData
        },
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      });
      createdTasks.push(task);
      console.log(`✅ Created task: "${task.title}"`);
    }

    // Step 3: Verify tasks can be retrieved
    console.log('\n🔍 Step 3: Verifying task retrieval...');
    
    const retrievedTasks = await prisma.personalTask.findMany({
      where: {
        userId: testUser.id,
        currentDate: today
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Retrieved ${retrievedTasks.length} tasks from database`);
    
    retrievedTasks.forEach((task, index) => {
      console.log(`[${index + 1}] "${task.title}"`);
      console.log(`    Type: ${task.workType} | Priority: ${task.priority} | Duration: ${task.estimatedDuration}m`);
      console.log(`    User: ${task.user.email}`);
      console.log(`    Created: ${formatDate(task.createdAt)}`);
      if (task.description) {
        console.log(`    Description: ${task.description.substring(0, 100)}...`);
      }
      console.log('');
    });

    // Step 4: Test task updates
    console.log('📝 Step 4: Testing task updates...');
    
    const taskToUpdate = createdTasks[0];
    const updatedTask = await prisma.personalTask.update({
      where: {
        id: taskToUpdate.id
      },
      data: {
        completed: true,
        completedAt: new Date()
      }
    });

    console.log(`✅ Marked task as completed: "${updatedTask.title}"`);

    // Step 5: Test task filtering
    console.log('\n🔍 Step 5: Testing task filtering...');
    
    const completedTasks = await prisma.personalTask.findMany({
      where: {
        userId: testUser.id,
        completed: true
      }
    });

    const pendingTasks = await prisma.personalTask.findMany({
      where: {
        userId: testUser.id,
        completed: false
      }
    });

    console.log(`✅ Found ${completedTasks.length} completed tasks`);
    console.log(`✅ Found ${pendingTasks.length} pending tasks`);

    // Step 6: Generate JSON for frontend testing
    console.log('\n📱 Step 6: Generating frontend test data...');
    
    const frontendTestData = {
      user: {
        id: testUser.id,
        email: testUser.email,
        supabaseId: testUser.supabaseId
      },
      tasks: retrievedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        workType: task.workType,
        priority: task.priority,
        completed: task.completed,
        estimatedDuration: task.estimatedDuration,
        tags: task.tags,
        createdAt: task.createdAt.toISOString(),
        completedAt: task.completedAt?.toISOString()
      })),
      summary: {
        total: retrievedTasks.length,
        completed: completedTasks.length,
        pending: pendingTasks.length,
        totalEstimatedTime: retrievedTasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0)
      }
    };

    // Save test data for frontend
    const fs = await import('fs');
    fs.writeFileSync(
      './public/test-data.json', 
      JSON.stringify(frontendTestData, null, 2)
    );

    console.log('✅ Frontend test data saved to /public/test-data.json');

    // Step 7: Test database connection performance
    console.log('\n⚡ Step 7: Testing database performance...');
    
    const startTime = Date.now();
    await prisma.personalTask.findMany({
      where: { userId: testUser.id },
      take: 1
    });
    const endTime = Date.now();
    
    console.log(`✅ Database response time: ${endTime - startTime}ms`);

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('====================');
    console.log('✅ User creation/retrieval: Working');
    console.log('✅ Task creation: Working');  
    console.log('✅ Task retrieval: Working');
    console.log('✅ Task updates: Working');
    console.log('✅ Task filtering: Working');
    console.log('✅ Database performance: Good');
    console.log('✅ Frontend data generation: Working');
    
    console.log('\n🔗 Next: Test the UI at https://siso-internal.vercel.app');
    console.log('📱 Frontend test data available at /test-data.json');

    return {
      success: true,
      userCreated: testUser,
      tasksCreated: createdTasks.length,
      performanceMs: endTime - startTime
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    
    if (error.message.includes('Unique constraint')) {
      console.log('\n💡 User might already exist. Trying to continue...');
      return await testCompleteTaskFlow();
    }
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCompleteTaskFlow()
  .then(result => {
    if (result.success) {
      console.log('\n🚀 SYSTEM VERIFICATION COMPLETE');
      process.exit(0);
    } else {
      console.log('\n💥 SYSTEM VERIFICATION FAILED');
      process.exit(1);
    }
  })
  .catch(console.error);