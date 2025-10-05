/**
 * 🔍 Check Light Work Tasks in Database
 * 
 * This script queries the database to see what light work tasks are actually saved
 * and provides insights into how the database works for this feature.
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkLightWorkTasks() {
  try {
    console.log('🔍 CHECKING LIGHT WORK TASKS IN DATABASE\n');
    
    // 1. Get all users in the database
    console.log('1️⃣ USERS IN DATABASE:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        supabaseId: true,
        createdAt: true
      }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ID: ${user.id}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Supabase ID: ${user.supabaseId}`);
      console.log(`      Created: ${user.createdAt.toISOString().split('T')[0]}\n`);
    });
    
    // 2. Get all light work tasks
    console.log('2️⃣ LIGHT WORK TASKS:');
    const lightWorkTasks = await prisma.personalTask.findMany({
      where: {
        workType: 'LIGHT'
      },
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: [
        { currentDate: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    if (lightWorkTasks.length === 0) {
      console.log('❌ No light work tasks found in database');
      return;
    }
    
    console.log(`✅ Found ${lightWorkTasks.length} light work tasks:\n`);
    
    lightWorkTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. "${task.title}"`);
      console.log(`      Task ID: ${task.id}`);
      console.log(`      User: ${task.user.email} (${task.user.id})`);
      console.log(`      Work Type: ${task.workType}`);
      console.log(`      Priority: ${task.priority}`);
      console.log(`      Completed: ${task.completed ? '✅' : '❌'}`);
      console.log(`      Current Date: ${task.currentDate}`);
      console.log(`      Original Date: ${task.originalDate}`);
      console.log(`      Time Estimate: ${task.timeEstimate || 'Not set'}`);
      console.log(`      Estimated Duration: ${task.estimatedDuration || 'Not set'} min`);
      console.log(`      Rollovers: ${task.rollovers}`);
      console.log(`      Tags: [${task.tags.join(', ')}]`);
      console.log(`      Created: ${task.createdAt.toISOString()}`);
      console.log(`      Updated: ${task.updatedAt.toISOString()}`);
      
      // Show subtasks
      if (task.subtasks.length > 0) {
        console.log(`      Subtasks (${task.subtasks.length}):`);
        task.subtasks.forEach((subtask, subIndex) => {
          console.log(`         ${subIndex + 1}. "${subtask.title}" - ${subtask.completed ? '✅' : '❌'} (${subtask.workType})`);
        });
      } else {
        console.log(`      Subtasks: None`);
      }
      console.log('');
    });
    
    // 3. Show database statistics
    console.log('3️⃣ DATABASE STATISTICS:');
    const stats = await Promise.all([
      prisma.personalTask.count(),
      prisma.personalTask.count({ where: { workType: 'LIGHT' } }),
      prisma.personalTask.count({ where: { workType: 'DEEP' } }),
      prisma.personalTask.count({ where: { workType: 'MORNING' } }),
      prisma.personalTask.count({ where: { completed: true } }),
      prisma.personalTask.count({ where: { completed: false } }),
      prisma.personalSubtask.count()
    ]);
    
    console.log(`   Total Tasks: ${stats[0]}`);
    console.log(`   Light Work Tasks: ${stats[1]}`);
    console.log(`   Deep Work Tasks: ${stats[2]}`);
    console.log(`   Morning Tasks: ${stats[3]}`);
    console.log(`   Completed Tasks: ${stats[4]}`);
    console.log(`   Pending Tasks: ${stats[5]}`);
    console.log(`   Total Subtasks: ${stats[6]}\n`);
    
    // 4. Show recent activity by date
    console.log('4️⃣ LIGHT WORK TASKS BY DATE:');
    const tasksByDate = lightWorkTasks.reduce((acc, task) => {
      const date = task.currentDate;
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    }, {});
    
    Object.keys(tasksByDate)
      .sort((a, b) => b.localeCompare(a))
      .forEach(date => {
        const tasks = tasksByDate[date];
        const completedCount = tasks.filter(t => t.completed).length;
        console.log(`   📅 ${date}: ${tasks.length} tasks (${completedCount} completed)`);
        tasks.forEach(task => {
          console.log(`      • ${task.completed ? '✅' : '❌'} ${task.title}`);
        });
        console.log('');
      });
    
    console.log('✅ Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking light work tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkLightWorkTasks();