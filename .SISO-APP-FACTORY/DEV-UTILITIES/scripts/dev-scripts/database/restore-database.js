#!/usr/bin/env node

/**
 * Database Restoration Script
 * Restores data from backup file "database-backup-1756416095341.json"
 * Handles relationships and data integrity properly
 */

import fs from 'fs';
import path from 'path';
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

function logProgress(step, total, entity) {
  const percentage = ((step / total) * 100).toFixed(1);
  log(`  Progress: ${step}/${total} (${percentage}%) ${entity}`, 'cyan');
}

async function loadBackupFile(filePath) {
  try {
    log(`\n${colors.bold}📁 Loading backup file...${colors.reset}`, 'blue');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file not found: ${filePath}`);
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const backup = JSON.parse(fileContent);
    
    log(`✅ Backup file loaded successfully`, 'green');
    log(`📊 Backup created: ${new Date(backup.timestamp).toLocaleString()}`, 'blue');
    
    // Display backup summary
    log(`\n${colors.bold}📋 Backup Summary:${colors.reset}`, 'magenta');
    if (backup.counts) {
      Object.entries(backup.counts).forEach(([entity, count]) => {
        log(`  ${entity}: ${count}`, 'yellow');
      });
    }
    
    return backup;
  } catch (error) {
    log(`❌ Failed to load backup file: ${error.message}`, 'red');
    throw error;
  }
}

async function clearExistingData() {
  try {
    log(`\n${colors.bold}🧹 Clearing existing data...${colors.reset}`, 'yellow');
    
    // Delete in reverse order of dependencies to avoid foreign key constraints
    const deletions = [
      { model: 'personalSubtask', name: 'Personal Subtasks' },
      { model: 'personalTask', name: 'Personal Tasks' },
      { model: 'morningRoutineTracking', name: 'Morning Routine Tracking' },
      { model: 'personalContext', name: 'Personal Context' },
      { model: 'user', name: 'Users' }
    ];
    
    for (const { model, name } of deletions) {
      const count = await prisma[model].count();
      if (count > 0) {
        await prisma[model].deleteMany({});
        log(`  ✅ Deleted ${count} ${name}`, 'yellow');
      }
    }
    
    log(`✅ Database cleared successfully`, 'green');
  } catch (error) {
    log(`❌ Failed to clear existing data: ${error.message}`, 'red');
    throw error;
  }
}

async function restoreUsers(users) {
  if (!users || users.length === 0) {
    log(`⚠️  No users to restore`, 'yellow');
    return;
  }
  
  log(`\n${colors.bold}👥 Restoring Users...${colors.reset}`, 'blue');
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    logProgress(i + 1, users.length, 'users');
    
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      
      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: user.id,
            supabaseId: user.supabaseId,
            email: user.email,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
        log(`  ✅ Created user: ${user.email}`, 'green');
      } else {
        log(`  ⚠️  User already exists: ${user.email}`, 'yellow');
      }
    } catch (error) {
      log(`  ❌ Failed to create user ${user.email}: ${error.message}`, 'red');
      throw error;
    }
  }
  
  log(`✅ Users restoration completed`, 'green');
}

async function restorePersonalContext(personalContexts) {
  if (!personalContexts || personalContexts.length === 0) {
    log(`⚠️  No personal contexts to restore`, 'yellow');
    return;
  }
  
  log(`\n${colors.bold}🎯 Restoring Personal Context...${colors.reset}`, 'blue');
  
  for (let i = 0; i < personalContexts.length; i++) {
    const context = personalContexts[i];
    logProgress(i + 1, personalContexts.length, 'personal contexts');
    
    try {
      // Check if context already exists for this user
      const existingContext = await prisma.personalContext.findUnique({
        where: { userId: context.userId }
      });
      
      if (!existingContext) {
        await prisma.personalContext.create({
          data: {
            id: context.id,
            userId: context.userId,
            currentGoals: context.currentGoals,
            skillPriorities: context.skillPriorities,
            revenueTargets: context.revenueTargets,
            timeConstraints: context.timeConstraints,
            currentProjects: context.currentProjects,
            hatedTasks: context.hatedTasks,
            valuedTasks: context.valuedTasks,
            learningObjectives: context.learningObjectives,
            createdAt: new Date(context.createdAt),
            updatedAt: new Date(context.updatedAt)
          }
        });
        log(`  ✅ Created personal context for user: ${context.userId}`, 'green');
      } else {
        log(`  ⚠️  Personal context already exists for user: ${context.userId}`, 'yellow');
      }
    } catch (error) {
      log(`  ❌ Failed to create personal context: ${error.message}`, 'red');
      throw error;
    }
  }
  
  log(`✅ Personal Context restoration completed`, 'green');
}

async function restorePersonalTasks(personalTasks) {
  if (!personalTasks || personalTasks.length === 0) {
    log(`⚠️  No personal tasks to restore`, 'yellow');
    return;
  }
  
  log(`\n${colors.bold}📝 Restoring Personal Tasks...${colors.reset}`, 'blue');
  
  for (let i = 0; i < personalTasks.length; i++) {
    const task = personalTasks[i];
    logProgress(i + 1, personalTasks.length, 'personal tasks');
    
    try {
      // Extract subtasks before creating main task
      const { subtasks, ...taskData } = task;
      
      // Check if task already exists
      const existingTask = await prisma.personalTask.findUnique({
        where: { id: task.id }
      });
      
      if (!existingTask) {
        // Create the main task
        await prisma.personalTask.create({
          data: {
            id: taskData.id,
            userId: taskData.userId,
            title: taskData.title,
            description: taskData.description,
            workType: taskData.workType,
            priority: taskData.priority,
            completed: taskData.completed,
            originalDate: taskData.originalDate,
            currentDate: taskData.currentDate,
            estimatedDuration: taskData.estimatedDuration,
            rollovers: taskData.rollovers,
            tags: taskData.tags || [],
            category: taskData.category,
            createdAt: new Date(taskData.createdAt),
            updatedAt: new Date(taskData.updatedAt),
            completedAt: taskData.completedAt ? new Date(taskData.completedAt) : null,
            startedAt: taskData.startedAt ? new Date(taskData.startedAt) : null,
            actualDurationMin: taskData.actualDurationMin,
            aiTimeEstimateMin: taskData.aiTimeEstimateMin,
            aiTimeEstimateMax: taskData.aiTimeEstimateMax,
            aiTimeEstimateML: taskData.aiTimeEstimateML,
            timeAccuracy: taskData.timeAccuracy,
            aiAnalyzed: taskData.aiAnalyzed,
            aiReasoning: taskData.aiReasoning,
            analyzedAt: taskData.analyzedAt ? new Date(taskData.analyzedAt) : null,
            complexity: taskData.complexity,
            confidence: taskData.confidence,
            contextualBonus: taskData.contextualBonus,
            difficulty: taskData.difficulty,
            learningValue: taskData.learningValue,
            priorityRank: taskData.priorityRank,
            strategicImportance: taskData.strategicImportance,
            timeEstimate: taskData.timeEstimate,
            xpReward: taskData.xpReward
          }
        });
        
        log(`  ✅ Created task: ${taskData.title}`, 'green');
        
        // Create subtasks if they exist
        if (subtasks && subtasks.length > 0) {
          for (const subtask of subtasks) {
            await prisma.personalSubtask.create({
              data: {
                id: subtask.id,
                taskId: subtask.taskId,
                title: subtask.title,
                completed: subtask.completed,
                workType: subtask.workType,
                createdAt: new Date(subtask.createdAt),
                updatedAt: new Date(subtask.updatedAt),
                startedAt: subtask.startedAt ? new Date(subtask.startedAt) : null,
                actualDurationMin: subtask.actualDurationMin,
                aiTimeEstimateMin: subtask.aiTimeEstimateMin,
                aiTimeEstimateMax: subtask.aiTimeEstimateMax,
                aiTimeEstimateML: subtask.aiTimeEstimateML,
                timeAccuracy: subtask.timeAccuracy,
                aiAnalyzed: subtask.aiAnalyzed,
                aiReasoning: subtask.aiReasoning,
                analyzedAt: subtask.analyzedAt ? new Date(subtask.analyzedAt) : null,
                completedAt: subtask.completedAt ? new Date(subtask.completedAt) : null,
                complexity: subtask.complexity,
                confidence: subtask.confidence,
                contextualBonus: subtask.contextualBonus,
                difficulty: subtask.difficulty,
                learningValue: subtask.learningValue,
                priorityRank: subtask.priorityRank,
                strategicImportance: subtask.strategicImportance,
                xpReward: subtask.xpReward
              }
            });
          }
          log(`    ✅ Created ${subtasks.length} subtasks for: ${taskData.title}`, 'green');
        }
      } else {
        log(`  ⚠️  Task already exists: ${task.title}`, 'yellow');
      }
    } catch (error) {
      log(`  ❌ Failed to create task ${task.title}: ${error.message}`, 'red');
      throw error;
    }
  }
  
  log(`✅ Personal Tasks restoration completed`, 'green');
}

async function restoreMorningRoutines(morningRoutines) {
  if (!morningRoutines || morningRoutines.length === 0) {
    log(`⚠️  No morning routines to restore`, 'yellow');
    return;
  }
  
  log(`\n${colors.bold}🌅 Restoring Morning Routines...${colors.reset}`, 'blue');
  
  for (let i = 0; i < morningRoutines.length; i++) {
    const routine = morningRoutines[i];
    logProgress(i + 1, morningRoutines.length, 'morning routines');
    
    try {
      // Check if routine already exists
      const existingRoutine = await prisma.morningRoutineTracking.findUnique({
        where: { 
          userId_date: { 
            userId: routine.userId, 
            date: routine.date 
          } 
        }
      });
      
      if (!existingRoutine) {
        await prisma.morningRoutineTracking.create({
          data: {
            id: routine.id,
            userId: routine.userId,
            date: routine.date,
            wakeUp: routine.wakeUp,
            getBloodFlowing: routine.getBloodFlowing,
            freshenUp: routine.freshenUp,
            powerUpBrain: routine.powerUpBrain,
            planDay: routine.planDay,
            meditation: routine.meditation,
            pushups: routine.pushups,
            situps: routine.situps,
            pullups: routine.pullups,
            bathroom: routine.bathroom,
            brushTeeth: routine.brushTeeth,
            coldShower: routine.coldShower,
            water: routine.water,
            supplements: routine.supplements,
            preworkout: routine.preworkout,
            thoughtDump: routine.thoughtDump,
            planDeepWork: routine.planDeepWork,
            planLightWork: routine.planLightWork,
            setTimebox: routine.setTimebox,
            createdAt: new Date(routine.createdAt),
            updatedAt: new Date(routine.updatedAt)
          }
        });
        log(`  ✅ Created morning routine for ${routine.date}`, 'green');
      } else {
        log(`  ⚠️  Morning routine already exists for ${routine.date}`, 'yellow');
      }
    } catch (error) {
      log(`  ❌ Failed to create morning routine for ${routine.date}: ${error.message}`, 'red');
      throw error;
    }
  }
  
  log(`✅ Morning Routines restoration completed`, 'green');
}

async function verifyRestoration(expectedCounts) {
  log(`\n${colors.bold}🔍 Verifying restoration...${colors.reset}`, 'blue');
  
  const actualCounts = {
    users: await prisma.user.count(),
    personalTasks: await prisma.personalTask.count(),
    personalSubtasks: await prisma.personalSubtask.count(),
    morningRoutineTracking: await prisma.morningRoutineTracking.count(),
    personalContext: await prisma.personalContext.count()
  };
  
  log(`\n${colors.bold}📊 Restoration Results:${colors.reset}`, 'magenta');
  
  let allValid = true;
  
  Object.entries(expectedCounts).forEach(([entity, expected]) => {
    const actual = actualCounts[entity] || 0;
    const status = expected === actual ? '✅' : '❌';
    const color = expected === actual ? 'green' : 'red';
    
    log(`  ${status} ${entity}: ${actual}/${expected}`, color);
    
    if (expected !== actual) {
      allValid = false;
    }
  });
  
  // Count subtasks separately (not in original counts)
  const subtaskCount = await prisma.personalSubtask.count();
  log(`  ℹ️  personalSubtasks: ${subtaskCount} (additional)`, 'blue');
  
  return allValid;
}

async function main() {
  const backupFilePath = './database-backup-1756416095341.json';
  
  try {
    log(`${colors.bold}🚀 Starting Database Restoration${colors.reset}`, 'magenta');
    log(`${colors.bold}===============================================${colors.reset}`, 'magenta');
    
    // Load backup file
    const backup = await loadBackupFile(backupFilePath);
    
    // Clear existing data
    await clearExistingData();
    
    // Restore data in proper dependency order
    await restoreUsers(backup.data.users);
    await restorePersonalContext(backup.data.personalContext);
    await restorePersonalTasks(backup.data.personalTasks);
    await restoreMorningRoutines(backup.data.morningRoutineTracking);
    
    // Verify restoration
    const isValid = await verifyRestoration(backup.counts);
    
    if (isValid) {
      log(`\n${colors.bold}🎉 Database restoration completed successfully!${colors.reset}`, 'green');
    } else {
      log(`\n${colors.bold}⚠️  Database restoration completed with some discrepancies${colors.reset}`, 'yellow');
      log(`Please check the verification results above.`, 'yellow');
    }
    
  } catch (error) {
    log(`\n${colors.bold}💥 Database restoration failed!${colors.reset}`, 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (error.stack) {
      log(`\nStack trace:`, 'red');
      log(error.stack, 'red');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  log(`\n${colors.yellow}⚠️  Process interrupted. Disconnecting from database...${colors.reset}`);
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log(`\n${colors.yellow}⚠️  Process terminated. Disconnecting from database...${colors.reset}`);
  await prisma.$disconnect();
  process.exit(0);
});

// Run the restoration
main().catch(async (error) => {
  log(`\n${colors.bold}💥 Unhandled error during restoration!${colors.reset}`, 'red');
  log(`Error: ${error.message}`, 'red');
  
  await prisma.$disconnect();
  process.exit(1);
});