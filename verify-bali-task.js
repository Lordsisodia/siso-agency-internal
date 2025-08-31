#!/usr/bin/env node
/**
 * Verify "Before Bali" Light Work Task Creation
 */

import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function verifyBaliTask() {
  try {
    console.log('🔍 Verifying "Before Bali" task creation...\n');

    // Get all Light Work tasks
    const lightWorkTasks = await prisma.lightWorkTask.findMany({
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: { id: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total Light Work tasks found: ${lightWorkTasks.length}\n`);

    if (lightWorkTasks.length === 0) {
      console.log('❌ No Light Work tasks found in database');
      return;
    }

    // Find the "Before Bali" task
    const baliTask = lightWorkTasks.find(task => task.title === 'Before Bali');

    if (!baliTask) {
      console.log('❌ "Before Bali" task not found');
      console.log('Available tasks:');
      lightWorkTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. "${task.title}" (${task.id})`);
      });
      return;
    }

    console.log('✅ "Before Bali" task found!\n');
    console.log('📋 Task Details:');
    console.log(`   ID: ${baliTask.id}`);
    console.log(`   Title: ${baliTask.title}`);
    console.log(`   Description: ${baliTask.description}`);
    console.log(`   Priority: ${baliTask.priority}`);
    console.log(`   Category: ${baliTask.category}`);
    console.log(`   Tags: [${baliTask.tags.join(', ')}]`);
    console.log(`   User: ${baliTask.user.email}`);
    console.log(`   Current Date: ${baliTask.currentDate}`);
    console.log(`   Completed: ${baliTask.completed ? '✅' : '❌'}\n`);

    console.log(`🎯 Subtasks (${baliTask.subtasks.length} found):`);
    baliTask.subtasks.forEach((subtask, index) => {
      console.log(`   ${index + 1}. ${subtask.title} (Priority: ${subtask.priority})`);
      console.log(`      ID: ${subtask.id}`);
      console.log(`      Completed: ${subtask.completed ? '✅' : '❌'}`);
      console.log(`      Created: ${subtask.createdAt.toISOString()}`);
    });

    console.log('\n🎉 "Before Bali" task verification completed successfully!');
    console.log('   The task and all subtasks are properly stored in the database.');
    console.log('   It should be visible in the Light Work section of your app.');

  } catch (error) {
    console.error('❌ Error verifying Bali task:', error);
    console.error('Full error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyBaliTask();