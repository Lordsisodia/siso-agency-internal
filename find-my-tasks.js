/**
 * Find Lost Tasks Script - SISO Internal Recovery
 * Looking for tasks created recently, especially focus tasks with feedback
 */

import { PrismaClient } from './generated/prisma/index.js';

function formatDate(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
}

function subDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

const prisma = new PrismaClient();

async function findYourTasks() {
  console.log('🔍 SEARCHING FOR YOUR LOST TASKS');
  console.log('=================================\n');

  try {
    // Check PersonalTask table for recent tasks
    const recentDate = subDays(new Date(), 7);
    
    console.log('📱 Searching PersonalTask table...');
    const personalTasks = await prisma.personalTask.findMany({
      where: {
        createdAt: {
          gte: recentDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        subtasks: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (personalTasks.length > 0) {
      console.log(`✅ FOUND ${personalTasks.length} RECENT PERSONAL TASKS:\n`);
      
      personalTasks.forEach((task, index) => {
        console.log(`[${index + 1}] "${task.title}" ${task.completed ? '✅' : '❌'}`);
        console.log(`    User: ${task.user.email || 'Unknown'}`);
        console.log(`    Created: ${formatDate(task.createdAt)}`);
        console.log(`    Work Type: ${task.workType} | Priority: ${task.priority}`);
        if (task.description) {
          console.log(`    Description: "${task.description}"`);
        }
        if (task.subtasks && task.subtasks.length > 0) {
          console.log(`    Subtasks (${task.subtasks.length}):`);
          task.subtasks.forEach(subtask => {
            console.log(`      - "${subtask.title}" ${subtask.completed ? '✅' : '❌'}`);
          });
        }
        if (task.tags && task.tags.length > 0) {
          console.log(`    Tags: ${task.tags.join(', ')}`);
        }
        console.log(`    Original Date: ${task.originalDate} | Current: ${task.currentDate}`);
        console.log('');
      });
    } else {
      console.log('❌ No personal tasks found in database');
    }

    // Check for any users in the system
    console.log('\n👥 Checking users in system...');
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email || user.clerkId} (${user.firstName || 'Unknown'}) - Last active: ${formatDate(user.updatedAt)}`);
    });

    // Check TimeBlock table if it exists
    console.log('\n⏰ Checking TimeBlock table...');
    try {
      const timeBlocks = await prisma.timeBlock.findMany({
        where: {
          createdAt: {
            gte: recentDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      });

      if (timeBlocks.length > 0) {
        console.log(`✅ FOUND ${timeBlocks.length} RECENT TIME BLOCKS:\n`);
        timeBlocks.forEach((block, index) => {
          console.log(`[${index + 1}] "${block.title}" - ${formatDate(block.createdAt)}`);
          console.log(`    User: ${block.user.email}`);
          console.log(`    Time: ${block.startTime} - ${block.endTime}`);
          if (block.description) {
            console.log(`    Description: "${block.description}"`);
          }
          console.log('');
        });
      } else {
        console.log('❌ No recent time blocks found');
      }
    } catch (e) {
      console.log('⚠️  TimeBlock table not accessible or doesn\'t exist');
    }

    console.log('\n🔧 RECOVERY RECOMMENDATIONS:');
    console.log('=====================================');
    console.log('1. Check browser localStorage in DevTools');
    console.log('   - Go to Application tab → Local Storage → siso-internal.vercel.app');
    console.log('   - Look for keys: lifelock-personal-tasks, focus-tasks, etc.');
    console.log('');
    console.log('2. Check your browser cache');
    console.log('   - Hard refresh (Ctrl+Shift+R) to clear cache');
    console.log('   - Check Network tab for failed API calls');
    console.log('');
    console.log('3. Authentication issue possible');
    console.log('   - Tasks might be saved under different user account');
    console.log('   - Check if you were properly logged in when creating tasks');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    console.log('\n💡 ALTERNATIVE RECOVERY METHODS:');
    console.log('1. Open browser DevTools → Application → Local Storage');
    console.log('2. Look for keys containing "task", "focus", "lifelock"');
    console.log('3. Check browser history for form submissions');
    console.log('4. Check if tasks were created in different date range');
    
    if (error.message.includes('connect')) {
      console.log('\n⚠️  Database connection failed - tasks might be in localStorage only');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the search
findYourTasks().catch(console.error);