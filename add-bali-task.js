#!/usr/bin/env node
/**
 * Add "Before Bali" Light Work Task with Subtasks
 * Adds the deleted Bali preparation task back to the database
 */

import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function addBaliTask() {
  try {
    console.log('🏝️ Adding "Before Bali" task...\n');

    // Get the user ID (assuming there's only one user for now)
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const userId = users[0].id;
    console.log(`👤 Using user: ${users[0].email} (${userId})\n`);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Create the main "Before Bali" task with subtasks
    const task = await prisma.lightWorkTask.create({
      data: {
        userId,
        title: 'Before Bali',
        description: 'Tasks to complete before Bali trip',
        priority: 'HIGH',
        originalDate: today,
        currentDate: today,
        category: 'Travel Preparation',
        tags: ['travel', 'bali', 'preparation'],
        subtasks: {
          create: [
            {
              title: 'Go Primark',
              text: 'Go Primark',
              priority: 'Med'
            },
            {
              title: 'Get jobs from GP',
              text: 'Get jobs from GP',
              priority: 'High'
            },
            {
              title: 'Complete community service online',
              text: 'Complete community service online',
              priority: 'Med'
            },
            {
              title: 'Buy Visa',
              text: 'Buy Visa',
              priority: 'High'
            },
            {
              title: 'Go Specsavers to get contact lenses',
              text: 'Go Specsavers to get contact lenses',
              priority: 'Med'
            }
          ]
        }
      },
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    console.log('✅ Successfully created "Before Bali" task!\n');
    console.log(`📋 Task Details:`);
    console.log(`   ID: ${task.id}`);
    console.log(`   Title: ${task.title}`);
    console.log(`   Description: ${task.description}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Category: ${task.category}`);
    console.log(`   Tags: [${task.tags.join(', ')}]`);
    console.log(`   Date: ${task.currentDate}\n`);

    console.log(`🎯 Subtasks (${task.subtasks.length} created):`);
    task.subtasks.forEach((subtask, index) => {
      console.log(`   ${index + 1}. ${subtask.title} (Priority: ${subtask.priority})`);
      console.log(`      ID: ${subtask.id}`);
    });

    console.log('\n🏝️ "Before Bali" task added successfully!');
    console.log('   This task should now appear in the Light Work section of your app.');

  } catch (error) {
    console.error('❌ Error adding Bali task:', error);
    console.error('Full error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addBaliTask();