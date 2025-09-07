/**
 * 🧹 Clean Up Fake Light Work Tasks
 * 
 * Removes test/demo data while keeping real personal tasks
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Task IDs and patterns to remove (fake/test data)
const FAKE_TASK_PATTERNS = [
  'Research AI integration patterns',
  'Organize workspace and files', 
  'Schedule team check-in meetings',
  'Update project documentation',
  'Review and respond to emails',
  'Test UI Persistence Fix',
  'Test Auto User Creation', 
  'Test API Task',
  'Light Work: Update social media content calendar',
  'New light work task' // This will match all 3 generic ones
];

async function cleanupFakeTasks() {
  try {
    console.log('🧹 CLEANING UP FAKE LIGHT WORK TASKS\n');
    
    // 1. Find all light work tasks
    const allLightTasks = await prisma.personalTask.findMany({
      where: { workType: 'LIGHT' },
      include: {
        subtasks: true,
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📋 Found ${allLightTasks.length} light work tasks total\n`);
    
    // 2. Categorize tasks
    const realTasks = [];
    const fakeTasks = [];
    
    allLightTasks.forEach(task => {
      const isFake = FAKE_TASK_PATTERNS.some(pattern => 
        task.title.includes(pattern)
      );
      
      if (isFake) {
        fakeTasks.push(task);
      } else {
        realTasks.push(task);
      }
    });
    
    console.log('✅ REAL TASKS (KEEPING):');
    realTasks.forEach((task, i) => {
      console.log(`   ${i + 1}. "${task.title}" (${task.currentDate})`);
      if (task.subtasks.length > 0) {
        task.subtasks.forEach(sub => {
          console.log(`      • ${sub.title}`);
        });
      }
    });
    
    console.log(`\n🗑️  FAKE/TEST TASKS (REMOVING ${fakeTasks.length}):`);
    fakeTasks.forEach((task, i) => {
      console.log(`   ${i + 1}. "${task.title}" (${task.currentDate}) - ${task.user.email}`);
      if (task.subtasks.length > 0) {
        console.log(`      • ${task.subtasks.length} subtasks will also be deleted`);
      }
    });
    
    // 3. Confirm deletion
    if (fakeTasks.length === 0) {
      console.log('\n✅ No fake tasks found to delete!');
      return;
    }
    
    console.log(`\n⚠️  ABOUT TO DELETE ${fakeTasks.length} fake tasks and their subtasks...`);
    console.log('   This will clean up your database to show only real personal tasks.\n');
    
    // 4. Delete fake tasks (this will cascade delete subtasks)
    let deletedCount = 0;
    let deletedSubtasks = 0;
    
    for (const task of fakeTasks) {
      console.log(`🗑️  Deleting: "${task.title}"`);
      
      // Count subtasks before deletion
      deletedSubtasks += task.subtasks.length;
      
      await prisma.personalTask.delete({
        where: { id: task.id }
      });
      
      deletedCount++;
    }
    
    console.log(`\n✅ CLEANUP COMPLETED:`);
    console.log(`   • Deleted ${deletedCount} fake light work tasks`);
    console.log(`   • Deleted ${deletedSubtasks} associated subtasks`);
    console.log(`   • Kept ${realTasks.length} real personal tasks`);
    
    // 5. Show final state
    console.log(`\n📊 REMAINING LIGHT WORK TASKS:`);
    const remainingTasks = await prisma.personalTask.findMany({
      where: { workType: 'LIGHT' },
      include: { subtasks: true },
      orderBy: { currentDate: 'desc' }
    });
    
    remainingTasks.forEach((task, i) => {
      console.log(`   ${i + 1}. "${task.title}" (${task.currentDate})`);
      task.subtasks.forEach(sub => {
        console.log(`      • ${sub.completed ? '✅' : '❌'} ${sub.title}`);
      });
    });
    
    console.log('\n🎯 Your light work section now shows only real personal tasks!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
cleanupFakeTasks();