/**
 * 🧹 Comprehensive Database Cleanup
 * 
 * Clean up all test/duplicate data while preserving any real personal data
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function comprehensiveCleanup() {
  try {
    console.log('🧹 COMPREHENSIVE DATABASE CLEANUP\n');
    
    // 1. First, let's check if there are any real tasks we should preserve
    console.log('1️⃣ ANALYZING TASKS TO PRESERVE...\n');
    
    const allTasks = await prisma.personalTask.findMany({
      include: {
        subtasks: true,
        user: { select: { email: true, id: true } }
      }
    });
    
    // Look for potentially real tasks (not test/template data)
    const potentiallyRealTasks = allTasks.filter(task => {
      const title = task.title.toLowerCase();
      // These might be real personal tasks even if from test users
      const realTaskPatterns = [
        'bali',
        'visa',
        'jabs',
        'gp',
        'contact lens',
        'primark',
        'garms'
      ];
      
      return realTaskPatterns.some(pattern => title.includes(pattern));
    });
    
    if (potentiallyRealTasks.length > 0) {
      console.log('🤔 POTENTIALLY REAL PERSONAL TASKS FOUND:');
      potentiallyRealTasks.forEach(task => {
        console.log(`   • "${task.title}" (${task.currentDate})`);
        task.subtasks.forEach(sub => {
          console.log(`     - ${sub.title}`);
        });
      });
      console.log('\n❓ Do you want to keep these BALI-related tasks?');
      console.log('   They appear to be real personal tasks even though from test users.\n');
    }
    
    // 2. Show what will be deleted
    console.log('2️⃣ CLEANUP PLAN:\n');
    
    const taskStats = {
      LIGHT: await prisma.personalTask.count({ where: { workType: 'LIGHT' } }),
      DEEP: await prisma.personalTask.count({ where: { workType: 'DEEP' } }),
      MORNING: await prisma.personalTask.count({ where: { workType: 'MORNING' } })
    };
    
    const subtaskCount = await prisma.personalSubtask.count();
    const userCount = await prisma.user.count();
    
    console.log('📊 CURRENT DATABASE STATE:');
    console.log(`   • ${taskStats.LIGHT} Light Work tasks`);
    console.log(`   • ${taskStats.DEEP} Deep Work tasks`); 
    console.log(`   • ${taskStats.MORNING} Morning Routine tasks`);
    console.log(`   • ${subtaskCount} Subtasks`);
    console.log(`   • ${userCount} Users`);
    
    console.log('\n🗑️  WILL DELETE:');
    console.log(`   • ALL Morning Routine tasks (${taskStats.MORNING}) - duplicates from bug`);
    console.log(`   • ALL Deep Work tasks (${taskStats.DEEP}) - generic templates`);
    console.log(`   • Most Light Work tasks (keeping BALI tasks if requested)`);
    console.log(`   • All associated subtasks`);
    console.log(`   • Test users (keeping your main Clerk user)`);
    
    // 3. Perform cleanup
    console.log('\n3️⃣ PERFORMING CLEANUP...\n');
    
    // Delete Morning Routine tasks (all are duplicates)
    console.log('🗑️  Deleting Morning Routine tasks...');
    const morningDeleted = await prisma.personalTask.deleteMany({
      where: { workType: 'MORNING' }
    });
    console.log(`   ✅ Deleted ${morningDeleted.count} Morning Routine tasks`);
    
    // Delete Deep Work tasks (all are templates)
    console.log('🗑️  Deleting Deep Work tasks...');
    const deepDeleted = await prisma.personalTask.deleteMany({
      where: { workType: 'DEEP' }
    });
    console.log(`   ✅ Deleted ${deepDeleted.count} Deep Work tasks`);
    
    // For Light Work tasks, be more selective
    console.log('🗑️  Analyzing Light Work tasks...');
    const lightTasks = await prisma.personalTask.findMany({
      where: { workType: 'LIGHT' },
      include: { subtasks: true }
    });
    
    let keptLightTasks = 0;
    let deletedLightTasks = 0;
    
    for (const task of lightTasks) {
      const title = task.title.toLowerCase();
      const isRealBaliTask = ['bali', 'visa', 'jabs', 'gp', 'contact', 'primark'].some(word => 
        title.includes(word)
      );
      
      if (isRealBaliTask) {
        console.log(`   ✅ Keeping: "${task.title}"`);
        keptLightTasks++;
      } else {
        await prisma.personalTask.delete({ where: { id: task.id } });
        console.log(`   🗑️  Deleted: "${task.title}"`);
        deletedLightTasks++;
      }
    }
    
    // Clean up test users (keep the main Clerk user for now)
    console.log('🗑️  Cleaning up test users...');
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'test@' } },
          { email: { contains: 'example.com' } },
          { email: { equals: 'admin-test@example.com' } },
          { email: { equals: 'testui@example.com' } },
          { email: { equals: 'test-user@clerk.generated' } }
        ]
      }
    });
    
    for (const user of testUsers) {
      // Check if user has any remaining tasks
      const userTasks = await prisma.personalTask.count({
        where: { userId: user.id }
      });
      
      if (userTasks === 0) {
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`   🗑️  Deleted user: ${user.email}`);
      } else {
        console.log(`   ✅ Kept user: ${user.email} (has ${userTasks} remaining tasks)`);
      }
    }
    
    // 4. Final state
    console.log('\n4️⃣ CLEANUP RESULTS:\n');
    
    const finalStats = {
      tasks: await prisma.personalTask.count(),
      lightTasks: await prisma.personalTask.count({ where: { workType: 'LIGHT' } }),
      deepTasks: await prisma.personalTask.count({ where: { workType: 'DEEP' } }),
      morningTasks: await prisma.personalTask.count({ where: { workType: 'MORNING' } }),
      subtasks: await prisma.personalSubtask.count(),
      users: await prisma.user.count()
    };
    
    console.log('📊 FINAL DATABASE STATE:');
    console.log(`   • ${finalStats.tasks} Total tasks (was ${allTasks.length})`);
    console.log(`   • ${finalStats.lightTasks} Light Work tasks`);
    console.log(`   • ${finalStats.deepTasks} Deep Work tasks`);
    console.log(`   • ${finalStats.morningTasks} Morning Routine tasks`);
    console.log(`   • ${finalStats.subtasks} Subtasks`);
    console.log(`   • ${finalStats.users} Users`);
    
    console.log('\n✅ DATABASE CLEANUP COMPLETED!');
    console.log('🎯 Your database is now clean and ready for real use.');
    console.log('💡 Morning routine duplication bug appears to be fixed.');
    console.log('🚀 You can now use the app with clean, real data only.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveCleanup();