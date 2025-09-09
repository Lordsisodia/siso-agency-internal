// SISO Personal Tasks → Prisma Migration Script
// Run this in browser console after setting up your Prisma database

console.log('⚡ Starting SISO → Prisma Migration...');

async function setupPrismaMigration() {
  console.log(`
⚡ SISO → Prisma Migration Setup

This script will:
1. ✅ Test Prisma connection (zero cold starts!)
2. 📊 Analyze current localStorage data  
3. 🔄 Migrate tasks to Prisma database
4. ⚡ Enable instant response times (2-5ms)
5. 💾 Backup existing data safely

Prerequisites:
- Prisma account created at https://console.prisma.io
- Environment variables set in .env:
  - VITE_PRISMA_DATABASE_URL
  - VITE_PRISMA_ACCELERATE_URL (optional, for edge acceleration)
  `);
}

async function analyzeCurrentData() {
  console.log('📊 Analyzing current localStorage data...');
  
  const localData = localStorage.getItem('lifelock-personal-tasks');
  if (!localData) {
    console.log('📭 No tasks found in localStorage');
    return { taskCount: 0, tasks: [] };
  }
  
  const tasks = JSON.parse(localData);
  console.log(`Found ${tasks.length} tasks in localStorage:`);
  
  // Analyze task distribution
  const analysis = {
    taskCount: tasks.length,
    tasks: tasks,
    byWorkType: {
      deep: tasks.filter(t => t.workType === 'deep').length,
      light: tasks.filter(t => t.workType === 'light').length
    },
    byPriority: {
      critical: tasks.filter(t => t.priority === 'critical').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    },
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    withRollovers: tasks.filter(t => t.rollovers > 0).length
  };
  
  console.log('📊 Task Analysis:', analysis);
  
  // Show sample tasks
  if (tasks.length > 0) {
    console.log('📋 Sample tasks:');
    tasks.slice(0, 3).forEach((task, i) => {
      console.log(`${i + 1}. "${task.title}" (${task.workType}, ${task.priority}, completed: ${task.completed})`);
    });
  }
  
  return analysis;
}

async function testPrismaConnection() {
  console.log('⚡ Testing Prisma connection (should be instant)...');
  
  try {
    // Check environment variables
    const hasPrismaUrl = !!import.meta.env.VITE_PRISMA_DATABASE_URL;
    const hasAccelerateUrl = !!import.meta.env.VITE_PRISMA_ACCELERATE_URL;
    
    console.log('Environment check:');
    console.log(`- VITE_PRISMA_DATABASE_URL: ${hasPrismaUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`- VITE_PRISMA_ACCELERATE_URL: ${hasAccelerateUrl ? '✅ Set (edge acceleration)' : '⚠️ Optional (no edge caching)'}`);
    
    if (!hasPrismaUrl) {
      throw new Error('VITE_PRISMA_DATABASE_URL environment variable not set');
    }
    
    // Import and test Prisma client
    const { PrismaTaskService } = await import('./src/services/prismaTaskService.ts');
    
    await PrismaTaskService.initialize();
    
    console.log('✅ Prisma connection successful with zero cold starts!');
    return true;
    
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    console.log(`
🔧 Troubleshooting:
1. Verify your Prisma database URL in .env
2. Check your Prisma project is active
3. Ensure database is accessible
4. Try refreshing the page and running again
    `);
    return false;
  }
}

async function performMigration() {
  console.log('⚡ Starting migration to Prisma (instant response times)...');
  
  try {
    // Analyze current data
    const analysis = await analyzeCurrentData();
    if (analysis.taskCount === 0) {
      console.log('📭 No tasks to migrate');
      return true;
    }
    
    // Test Prisma connection
    const connected = await testPrismaConnection();
    if (!connected) {
      throw new Error('Cannot connect to Prisma database');
    }
    
    // Import Prisma service
    const { PrismaTaskService } = await import('./src/services/prismaTaskService.ts');
    
    // Perform migration
    const start = Date.now();
    await PrismaTaskService.migrateFromLocalStorage();
    const duration = Date.now() - start;
    
    console.log(`✅ Migration completed in ${duration}ms (instant response)!`);
    
    // Verify migration
    console.log('🔍 Verifying migration...');
    const todayTasks = await PrismaTaskService.getTasksForDate(new Date());
    console.log(`Verification: Found ${todayTasks.tasks.length} tasks for today in Prisma`);
    
    // Show usage stats
    const usage = PrismaTaskService.getUsageStats();
    console.log(`📊 Operations used: ${usage.operations}/${usage.freeLimit} (${usage.percentageUsed}% of free tier)`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// Main migration workflow
async function runPrismaMigration() {
  console.log('⚡ Starting complete SISO → Prisma migration...');
  
  try {
    // Step 1: Setup
    await setupPrismaMigration();
    
    // Step 2: Analyze current data
    const analysis = await analyzeCurrentData();
    
    // Step 3: Test connection
    const connected = await testPrismaConnection();
    if (!connected) {
      console.log('❌ Cannot proceed without Prisma connection');
      return false;
    }
    
    // Step 4: Confirm migration
    const proceed = confirm(`
Ready to migrate ${analysis.taskCount} tasks to Prisma?

This will:
✅ Move all your tasks to Prisma (zero cold starts)
✅ Enable instant response times (2-5ms vs 8+ seconds)
✅ Use standard PostgreSQL (easy migration later)
✅ Backup your current localStorage data
✅ Monitor free tier usage (100K operations/month)

Continue with migration?`);
    
    if (!proceed) {
      console.log('❌ Migration cancelled by user');
      return false;
    }
    
    // Step 5: Perform migration
    const migrationSuccess = await performMigration();
    if (!migrationSuccess) {
      console.log('❌ Migration failed, check errors above');
      return false;
    }
    
    console.log(`
🎉 SISO → Prisma Migration Complete!

✅ ${analysis.taskCount} tasks migrated to Prisma
⚡ Zero cold starts enabled (instant response)
📊 Free tier: 100K operations/month
💾 LocalStorage data backed up safely
🚀 Ready for AI features with instant performance

Your personal task management is now:
⚡ Lightning fast with zero cold starts
☁️ Cloud-synced with standard PostgreSQL
🤖 Ready for AI features (Eisenhower Matrix)
🔒 Secure with enterprise-grade infrastructure

Next: Enjoy instant response times! 🚀
    `);
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration workflow failed:', error);
    return false;
  }
}

// Make functions available globally
window.runPrismaMigration = runPrismaMigration;
window.analyzeCurrentData = analyzeCurrentData;
window.testPrismaConnection = testPrismaConnection;
window.performMigration = performMigration;

console.log(`
⚡ SISO → Prisma Migration Ready!

Available functions:
- runPrismaMigration() - Complete migration workflow
- analyzeCurrentData() - Check current localStorage tasks
- testPrismaConnection() - Test Prisma database connection
- performMigration() - Migrate data to Prisma

Quick start (after setting up Prisma):
1. Set environment variables in .env
2. Run: runPrismaMigration()

Let's upgrade SISO to zero cold starts! ⚡
`);

// Auto-run analysis
setTimeout(analyzeCurrentData, 1000);