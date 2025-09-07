#!/usr/bin/env node

/**
 * Verification Script for Database Restoration
 * Checks that all data was restored correctly and relationships are intact
 */

import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifyBasicCounts() {
  log(`\n${colors.bold}📊 Basic Data Counts${colors.reset}`, 'blue');
  
  const counts = {
    users: await prisma.user.count(),
    personalTasks: await prisma.personalTask.count(),
    personalSubtasks: await prisma.personalSubtask.count(),
    morningRoutineTracking: await prisma.morningRoutineTracking.count(),
    personalContext: await prisma.personalContext.count()
  };
  
  Object.entries(counts).forEach(([table, count]) => {
    log(`  ${table}: ${count}`, 'cyan');
  });
  
  return counts;
}

async function verifyRelationships() {
  log(`\n${colors.bold}🔗 Verifying Relationships${colors.reset}`, 'blue');
  
  try {
    // Check if all personal tasks have valid users
    const tasksWithUsers = await prisma.personalTask.findMany({
      include: { user: true }
    });
    
    const validTasks = tasksWithUsers.filter(task => task.user !== null);
    log(`  ✅ Personal Tasks with valid users: ${validTasks.length}/${tasksWithUsers.length}`, 'green');
    
    // Check if all subtasks have valid parent tasks
    const subtasksWithTasks = await prisma.personalSubtask.findMany({
      include: { task: true }
    });
    
    const validSubtasks = subtasksWithTasks.filter(subtask => subtask.task !== null);
    log(`  ✅ Subtasks with valid parent tasks: ${validSubtasks.length}/${subtasksWithTasks.length}`, 'green');
    
    // Check if personal context has valid user
    const contextWithUser = await prisma.personalContext.findMany({
      include: { user: true }
    });
    
    const validContext = contextWithUser.filter(context => context.user !== null);
    log(`  ✅ Personal Context with valid users: ${validContext.length}/${contextWithUser.length}`, 'green');
    
    // Check if morning routines have valid users
    const routinesWithUsers = await prisma.morningRoutineTracking.findMany({
      include: { user: true }
    });
    
    const validRoutines = routinesWithUsers.filter(routine => routine.user !== null);
    log(`  ✅ Morning Routines with valid users: ${validRoutines.length}/${routinesWithUsers.length}`, 'green');
    
    return {
      allTasksValid: validTasks.length === tasksWithUsers.length,
      allSubtasksValid: validSubtasks.length === subtasksWithTasks.length,
      allContextValid: validContext.length === contextWithUser.length,
      allRoutinesValid: validRoutines.length === routinesWithUsers.length
    };
    
  } catch (error) {
    log(`  ❌ Error verifying relationships: ${error.message}`, 'red');
    return false;
  }
}

async function verifyDataIntegrity() {
  log(`\n${colors.bold}🔍 Data Integrity Checks${colors.reset}`, 'blue');
  
  try {
    // Check user data
    const users = await prisma.user.findMany();
    log(`  Users found: ${users.length}`, 'cyan');
    users.forEach(user => {
      log(`    - ${user.email} (ID: ${user.id})`, 'yellow');
    });
    
    // Check personal tasks summary
    const tasks = await prisma.personalTask.findMany({
      include: {
        subtasks: true,
        user: true
      }
    });
    
    log(`\n  Personal Tasks: ${tasks.length}`, 'cyan');
    tasks.forEach(task => {
      log(`    - "${task.title}" (${task.workType}, Priority: ${task.priority})`, 'yellow');
      log(`      Subtasks: ${task.subtasks.length}, Completed: ${task.completed}`, 'yellow');
    });
    
    // Check morning routines
    const routines = await prisma.morningRoutineTracking.findMany({
      orderBy: { date: 'desc' }
    });
    
    log(`\n  Morning Routines: ${routines.length}`, 'cyan');
    routines.forEach(routine => {
      const completedTasks = [
        routine.wakeUp,
        routine.getBloodFlowing,
        routine.freshenUp,
        routine.powerUpBrain,
        routine.planDay,
        routine.meditation
      ].filter(Boolean).length;
      
      log(`    - ${routine.date}: ${completedTasks}/6 main tasks completed`, 'yellow');
    });
    
    // Check personal context
    const contexts = await prisma.personalContext.findMany();
    log(`\n  Personal Context entries: ${contexts.length}`, 'cyan');
    contexts.forEach(context => {
      log(`    - Current Goals: ${context.currentGoals?.substring(0, 50)}...`, 'yellow');
      log(`    - Skill Priorities: ${context.skillPriorities?.substring(0, 50)}...`, 'yellow');
    });
    
    return true;
  } catch (error) {
    log(`  ❌ Error checking data integrity: ${error.message}`, 'red');
    return false;
  }
}

async function runTestQueries() {
  log(`\n${colors.bold}🧪 Running Test Queries${colors.reset}`, 'blue');
  
  try {
    // Test complex query with joins
    const userWithAllData = await prisma.user.findFirst({
      include: {
        personalTasks: {
          include: {
            subtasks: true
          }
        },
        personalContext: true,
        morningRoutineTracking: true
      }
    });
    
    if (userWithAllData) {
      log(`  ✅ Complex join query successful`, 'green');
      log(`    User: ${userWithAllData.email}`, 'yellow');
      log(`    Tasks: ${userWithAllData.personalTasks.length}`, 'yellow');
      log(`    Subtasks total: ${userWithAllData.personalTasks.reduce((sum, task) => sum + task.subtasks.length, 0)}`, 'yellow');
      log(`    Morning routines: ${userWithAllData.morningRoutineTracking.length}`, 'yellow');
      log(`    Has personal context: ${userWithAllData.personalContext ? 'Yes' : 'No'}`, 'yellow');
    } else {
      log(`  ❌ No user found with data`, 'red');
    }
    
    // Test filtering and sorting
    const highPriorityTasks = await prisma.personalTask.findMany({
      where: {
        priority: 'HIGH',
        completed: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    log(`\n  ✅ High priority incomplete tasks: ${highPriorityTasks.length}`, 'green');
    
    // Test aggregation
    const taskStats = await prisma.personalTask.groupBy({
      by: ['workType', 'priority'],
      _count: {
        id: true
      }
    });
    
    log(`\n  ✅ Task statistics by work type and priority:`, 'green');
    taskStats.forEach(stat => {
      log(`    ${stat.workType} - ${stat.priority}: ${stat._count.id} tasks`, 'yellow');
    });
    
    return true;
  } catch (error) {
    log(`  ❌ Error running test queries: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  try {
    log(`${colors.bold}🔍 Database Restoration Verification${colors.reset}`, 'magenta');
    log(`${colors.bold}=====================================${colors.reset}`, 'magenta');
    
    // Run all verification steps
    const counts = await verifyBasicCounts();
    const relationships = await verifyRelationships();
    const dataIntegrity = await verifyDataIntegrity();
    const testQueries = await runTestQueries();
    
    // Summary
    log(`\n${colors.bold}📋 Verification Summary${colors.reset}`, 'magenta');
    
    const allChecksPass = (
      relationships.allTasksValid &&
      relationships.allSubtasksValid &&
      relationships.allContextValid &&
      relationships.allRoutinesValid &&
      dataIntegrity &&
      testQueries
    );
    
    if (allChecksPass) {
      log(`✅ All verification checks passed!`, 'green');
      log(`✅ Database restoration was successful`, 'green');
      log(`✅ All relationships are intact`, 'green');
      log(`✅ Data integrity is maintained`, 'green');
      log(`✅ Complex queries work correctly`, 'green');
    } else {
      log(`❌ Some verification checks failed`, 'red');
      log(`Please review the detailed output above`, 'yellow');
    }
    
    // Expected data summary
    log(`\n${colors.bold}📊 Expected vs Actual Data${colors.reset}`, 'blue');
    log(`  Users: ${counts.users} (expected: 1)`, counts.users === 1 ? 'green' : 'red');
    log(`  Personal Tasks: ${counts.personalTasks} (expected: 10)`, counts.personalTasks === 10 ? 'green' : 'red');
    log(`  Personal Subtasks: ${counts.personalSubtasks} (expected: ~27)`, counts.personalSubtasks >= 20 ? 'green' : 'yellow');
    log(`  Morning Routines: ${counts.morningRoutineTracking} (expected: 3)`, counts.morningRoutineTracking === 3 ? 'green' : 'red');
    log(`  Personal Context: ${counts.personalContext} (expected: 1)`, counts.personalContext === 1 ? 'green' : 'red');
    
  } catch (error) {
    log(`\n${colors.bold}💥 Verification failed!${colors.reset}`, 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
main().catch(async (error) => {
  console.error('Unhandled error:', error);
  await prisma.$disconnect();
  process.exit(1);
});