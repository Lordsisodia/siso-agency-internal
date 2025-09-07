// Search all database tables for tasks with many subtasks
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function searchAllTables() {
  console.log('🔍 Searching ALL database tables for tasks with many subtasks...');
  console.log('📅 Looking for tasks from ~5 months ago (around March 2025)');

  try {
    // Check what tables exist by looking at the Prisma schema
    console.log('\n📋 Checking PersonalTask table...');
    const personalTasks = await prisma.personalTask.findMany({
      where: { userId: "user_31c4PuaPdFf9abejhmzrN9kcill" },
      include: { subtasks: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${personalTasks.length} PersonalTask entries`);
    
    personalTasks.forEach(task => {
      const created = new Date(task.createdAt);
      if (task.subtasks.length > 5) {
        console.log(`  📋 "${task.title}" - ${task.subtasks.length} subtasks (${created.toDateString()})`);
      }
    });

    // Check if there are other task-related tables
    console.log('\n🔍 Checking for other potential task tables...');
    
    // Try AutomationTask table
    try {
      const automationTasks = await prisma.automationTask.findMany({
        where: { userId: "user_31c4PuaPdFf9abejhmzrN9kcill" }
      });
      console.log(`📋 AutomationTask: ${automationTasks.length} entries`);
      automationTasks.forEach(task => {
        console.log(`  - "${task.title || task.description}" (${new Date(task.createdAt).toDateString()})`);
      });
    } catch (e) {
      console.log('📋 AutomationTask table not accessible or does not exist');
    }

    // Check for old task data in other possible tables
    console.log('\n🔍 Checking all available tables...');
    
    // Let's also check the raw database for any table that might contain tasks
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%task%'
    `;
    
    console.log('📊 Task-related tables found:');
    console.log(result);

  } catch (error) {
    console.error('❌ Error searching tables:', error);
    
    // If Prisma fails, let's try a direct database query
    console.log('\n🔍 Trying direct database queries...');
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND (column_name LIKE '%task%' OR column_name LIKE '%subtask%' OR table_name LIKE '%task%')
        ORDER BY table_name, column_name
      `;
      console.log('📊 All task-related tables and columns:');
      console.log(tables);
    } catch (e2) {
      console.error('❌ Direct query also failed:', e2.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

searchAllTables();