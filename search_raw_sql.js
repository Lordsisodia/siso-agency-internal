// Search database with raw SQL queries to find all tasks
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function searchWithRawSQL() {
  console.log('🔍 Searching database with raw SQL queries...');
  console.log('👤 User: user_31c4PuaPdFf9abejhmzrN9kcill');
  
  try {
    // Query 1: Get all PersonalTask entries with subtask counts
    console.log('\n📋 PersonalTask table with subtask counts:');
    const personalTasksWithCounts = await prisma.$queryRaw`
      SELECT pt.id, pt.title, pt."workType", pt."createdAt", pt.completed,
             COUNT(ps.id) as subtask_count
      FROM "PersonalTask" pt
      LEFT JOIN "PersonalSubtask" ps ON pt.id = ps."taskId"
      WHERE pt."userId" = 'user_31c4PuaPdFf9abejhmzrN9kcill'
      GROUP BY pt.id, pt.title, pt."workType", pt."createdAt", pt.completed
      ORDER BY subtask_count DESC, pt."createdAt" DESC
    `;
    
    personalTasksWithCounts.forEach(task => {
      const date = new Date(task.createdAt).toDateString();
      console.log(`  📋 "${task.title}" (${task.workType}, completed: ${task.completed}) - ${task.subtask_count} subtasks (${date})`);
    });

    // Query 2: Look for tasks with >10 subtasks specifically
    console.log('\n🎯 Tasks with more than 10 subtasks:');
    const largeTasks = await prisma.$queryRaw`
      SELECT pt.id, pt.title, pt."workType", pt."createdAt", pt.completed,
             COUNT(ps.id) as subtask_count
      FROM "PersonalTask" pt
      LEFT JOIN "PersonalSubtask" ps ON pt.id = ps."taskId"
      WHERE pt."userId" = 'user_31c4PuaPdFf9abejhmzrN9kcill'
      GROUP BY pt.id, pt.title, pt."workType", pt."createdAt", pt.completed
      HAVING COUNT(ps.id) > 10
      ORDER BY subtask_count DESC
    `;
    
    if (largeTasks.length > 0) {
      largeTasks.forEach(task => {
        console.log(`  🔍 FOUND: "${task.title}" - ${task.subtask_count} subtasks (${new Date(task.createdAt).toDateString()})`);
      });
    } else {
      console.log('  ❌ No tasks found with >10 subtasks');
    }

    // Query 3: Check AutomationTask table
    console.log('\n📋 AutomationTask table:');
    const automationTasks = await prisma.$queryRaw`
      SELECT id, title, description, "createdAt"
      FROM "AutomationTask" 
      WHERE "userId" = 'user_31c4PuaPdFf9abejhmzrN9kcill'
      ORDER BY "createdAt" DESC
    `;
    
    if (automationTasks.length > 0) {
      automationTasks.forEach(task => {
        console.log(`  📋 "${task.title || task.description}" (${new Date(task.createdAt).toDateString()})`);
      });
    } else {
      console.log('  📋 No AutomationTask entries found');
    }

    // Query 4: Look for old tasks (5 months ago would be around March 2025, but let's check all old dates)
    console.log('\n📅 Looking for older tasks (before August 2025):');
    const oldTasks = await prisma.$queryRaw`
      SELECT pt.id, pt.title, pt."workType", pt."createdAt", pt.completed,
             COUNT(ps.id) as subtask_count
      FROM "PersonalTask" pt
      LEFT JOIN "PersonalSubtask" ps ON pt.id = ps."taskId"
      WHERE pt."userId" = 'user_31c4PuaPdFf9abejhmzrN9kcill'
        AND pt."createdAt" < '2025-08-01'
      GROUP BY pt.id, pt.title, pt."workType", pt."createdAt", pt.completed
      ORDER BY pt."createdAt" DESC
    `;
    
    if (oldTasks.length > 0) {
      console.log(`  🔍 Found ${oldTasks.length} older tasks:`);
      oldTasks.forEach(task => {
        console.log(`    📋 "${task.title}" - ${task.subtask_count} subtasks (${new Date(task.createdAt).toDateString()})`);
      });
    } else {
      console.log('  ❌ No older tasks found');
    }

    // Query 5: Get total counts
    console.log('\n📊 Summary:');
    const totalTasks = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "PersonalTask" WHERE "userId" = 'user_31c4PuaPdFf9abejhmzrN9kcill'
    `;
    const totalSubtasks = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "PersonalSubtask" ps
      JOIN "PersonalTask" pt ON ps."taskId" = pt.id
      WHERE pt."userId" = 'user_31c4PuaPdFf9abejhmzrN9kcill'
    `;
    
    console.log(`  📋 Total PersonalTask entries: ${totalTasks[0].count}`);
    console.log(`  📋 Total PersonalSubtask entries: ${totalSubtasks[0].count}`);

  } catch (error) {
    console.error('❌ Error running queries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

searchWithRawSQL();