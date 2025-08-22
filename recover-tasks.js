/**
 * SISO Internal Task Recovery Script
 * Attempts to recover lost mobile tasks from various sources
 */

import { PrismaClient } from './generated/prisma/index.js';

// Simple date formatting function to replace date-fns
function formatDate(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function subDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

const prisma = new PrismaClient();

async function recoverRecentTasks() {
  console.log('🔍 SISO Internal Task Recovery');
  console.log('=============================\n');

  try {
    // Check for recent tasks in database (last 7 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    
    console.log('📅 Checking database for recent tasks...');
    
    // Check LifeLockDailyTasks table
    const dailyTasks = await prisma.lifeLockDailyTask.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    console.log(`Found ${dailyTasks.length} daily tasks in last 7 days:`);
    dailyTasks.forEach((task, index) => {
      console.log(`[${index + 1}] ${task.title} - ${formatDate(task.createdAt)}`);
      if (task.description) {
        console.log(`    Description: ${task.description}`);
      }
      console.log(`    Type: ${task.workType}, Priority: ${task.priority}, Completed: ${task.completed ? '✅' : '❌'}`);
      console.log('');
    });

    // Check for focus sessions
    console.log('\n🧠 Checking for focus sessions...');
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        startTime: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    console.log(`Found ${focusSessions.length} focus sessions:`);
    focusSessions.forEach((session, index) => {
      console.log(`[${index + 1}] ${session.taskTitle || 'Unnamed Task'} - ${formatDate(session.startTime)}`);
      if (session.notes) {
        console.log(`    Notes: ${session.notes}`);
      }
      console.log(`    Duration: ${session.actualDuration || 'N/A'} minutes, Completed: ${session.completed ? '✅' : '❌'}`);
      console.log('');
    });

    // Check user activity logs
    console.log('\n📊 Checking user activity...');
    const users = await prisma.user.findMany({
      take: 5,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`Recent user activity:`);
    users.forEach((user) => {
      console.log(`- ${user.email || user.id} last active: ${formatDate(user.updatedAt)}`);
    });

    console.log('\n🔧 Recovery Recommendations:');
    console.log('1. Check if tasks were saved under a different user ID');
    console.log('2. Look for data in browser localStorage/sessionStorage');
    console.log('3. Check if network issues prevented saving');
    console.log('4. Implement better offline persistence');

  } catch (error) {
    console.error('❌ Error during recovery:', error);
    
    console.log('\n💡 Alternative recovery methods:');
    console.log('1. Check browser DevTools Application tab for localStorage');
    console.log('2. Look in Network tab for recent API calls');
    console.log('3. Check browser history for form data');
  } finally {
    await prisma.$disconnect();
  }
}

// Run recovery
recoverRecentTasks();