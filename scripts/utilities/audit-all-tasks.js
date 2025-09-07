/**
 * 🔍 Audit All Tasks in Database
 * 
 * Check all task types (LIGHT, DEEP, MORNING) to identify test/fake data
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function auditAllTasks() {
  try {
    console.log('🔍 AUDITING ALL TASKS IN DATABASE\n');
    
    // Get all tasks by type
    const allTasks = await prisma.personalTask.findMany({
      include: {
        subtasks: true,
        user: { select: { email: true, id: true } }
      },
      orderBy: [
        { workType: 'asc' },
        { currentDate: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    console.log(`📊 TOTAL TASKS: ${allTasks.length}\n`);
    
    // Group by work type
    const tasksByType = {
      LIGHT: [],
      DEEP: [],
      MORNING: []
    };
    
    allTasks.forEach(task => {
      if (tasksByType[task.workType]) {
        tasksByType[task.workType].push(task);
      }
    });
    
    // Analyze each type
    for (const [workType, tasks] of Object.entries(tasksByType)) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📋 ${workType} WORK TASKS (${tasks.length})`);
      console.log(`${'='.repeat(50)}`);
      
      if (tasks.length === 0) {
        console.log('   No tasks found.');
        continue;
      }
      
      // Group by user and date for better analysis
      const tasksByDate = {};
      const testPatterns = [];
      const realTasks = [];
      
      tasks.forEach(task => {
        const date = task.currentDate;
        if (!tasksByDate[date]) tasksByDate[date] = [];
        tasksByDate[date].push(task);
        
        // Identify test/fake patterns
        const title = task.title.toLowerCase();
        const isTestData = 
          title.includes('test') ||
          title.includes('demo') ||
          title.includes('example') ||
          title.includes('sample') ||
          title.includes('placeholder') ||
          title.includes('default') ||
          title.startsWith('new ') ||
          task.user.email.includes('test') ||
          task.user.email.includes('example.com') ||
          task.user.email.includes('@clerk.generated') ||
          // Generic task patterns
          title.includes('update documentation') ||
          title.includes('review code') ||
          title.includes('check email') ||
          title.includes('schedule meeting') ||
          title.includes('organize files') ||
          // Morning routine test patterns
          (workType === 'MORNING' && title.includes('routine'));
          
        if (isTestData) {
          testPatterns.push(task);
        } else {
          realTasks.push(task);
        }
      });
      
      // Show by date
      Object.keys(tasksByDate)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 5) // Show last 5 dates only
        .forEach(date => {
          const dateTasks = tasksByDate[date];
          console.log(`\n   📅 ${date} (${dateTasks.length} tasks):`);
          
          dateTasks.forEach(task => {
            const isTest = testPatterns.includes(task);
            const status = task.completed ? '✅' : '❌';
            const testFlag = isTest ? '🔴 TEST' : '✅ REAL';
            const userFlag = task.user.email.includes('@clerk.generated') ? '(Clerk)' : 
                            task.user.email.includes('test') ? '(Test User)' : '';
            
            console.log(`      ${status} ${testFlag} "${task.title}" ${userFlag}`);
            
            if (task.subtasks.length > 0) {
              console.log(`         └─ ${task.subtasks.length} subtasks`);
            }
          });
        });
      
      // Summary for this work type
      console.log(`\n   📊 SUMMARY:`);
      console.log(`      Total: ${tasks.length} tasks`);
      console.log(`      🔴 Test/Fake: ${testPatterns.length}`);
      console.log(`      ✅ Real: ${realTasks.length}`);
      
      if (testPatterns.length > 0) {
        console.log(`\n   🗑️  RECOMMENDED FOR DELETION:`);
        testPatterns.slice(0, 10).forEach((task, i) => { // Show first 10
          console.log(`      ${i + 1}. "${task.title}" (${task.currentDate}) - ${task.user.email}`);
        });
        if (testPatterns.length > 10) {
          console.log(`      ... and ${testPatterns.length - 10} more`);
        }
      }
    }
    
    // Overall summary
    const totalTestTasks = Object.values(tasksByType).flat()
      .filter(task => {
        const title = task.title.toLowerCase();
        return title.includes('test') ||
               title.includes('demo') ||
               title.includes('example') ||
               title.includes('sample') ||
               task.user.email.includes('test') ||
               task.user.email.includes('example.com');
      });
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 OVERALL DATABASE CLEANUP RECOMMENDATIONS`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Total tasks in database: ${allTasks.length}`);
    console.log(`🔴 Test/Demo tasks to delete: ${totalTestTasks.length}`);
    console.log(`✅ Real tasks to keep: ${allTasks.length - totalTestTasks.length}`);
    
    // Check for test users that can be deleted
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: 'example.com' } },
          { email: { endsWith: '@clerk.generated' } }
        ]
      }
    });
    
    console.log(`\n👤 TEST USERS TO CONSIDER REMOVING:`);
    testUsers.forEach(user => {
      console.log(`   • ${user.email} (ID: ${user.id})`);
    });
    
    console.log('\n✅ Audit completed!');
    
  } catch (error) {
    console.error('❌ Error during audit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditAllTasks();