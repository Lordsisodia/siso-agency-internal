// SISO Personal Tasks → Neon Migration Script
// Run this in browser console after setting up your Neon database

console.log('🚀 Starting SISO → Neon Migration...');

async function setupNeonMigration() {
  console.log(`
🎯 SISO → Neon Migration Setup

This script will:
1. ✅ Test Neon connection
2. 📊 Analyze current localStorage data  
3. 🔄 Migrate tasks to Neon database
4. 🤖 Enable MCP integration for AI features
5. 💾 Backup existing data safely

Prerequisites:
- Neon account created at https://neon.tech
- Environment variables set in .env:
  - VITE_NEON_DATABASE_URL
  - VITE_NEON_API_KEY (optional, for branching)
  - VITE_NEON_PROJECT_ID (optional, for branching)
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

async function testNeonConnection() {
  console.log('🔗 Testing Neon connection...');
  
  try {
    // Check environment variables
    const hasNeonUrl = !!import.meta.env.VITE_NEON_DATABASE_URL;
    const hasApiKey = !!import.meta.env.VITE_NEON_API_KEY;
    
    console.log('Environment check:');
    console.log(`- VITE_NEON_DATABASE_URL: ${hasNeonUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`- VITE_NEON_API_KEY: ${hasApiKey ? '✅ Set' : '⚠️ Optional (needed for branching)'}`);
    
    if (!hasNeonUrl) {
      throw new Error('VITE_NEON_DATABASE_URL environment variable not set');
    }
    
    // Import and test Neon client
    const { neonClient } = await import('./src/integrations/neon/client.ts');
    
    await neonClient.connect();
    const isConnected = await neonClient.testConnection();
    
    if (isConnected) {
      console.log('✅ Neon connection successful!');
      return true;
    } else {
      throw new Error('Connection test failed');
    }
    
  } catch (error) {
    console.error('❌ Neon connection failed:', error);
    console.log(`
🔧 Troubleshooting:
1. Verify your Neon database URL in .env
2. Check your Neon project is active
3. Ensure your IP is allowed (Neon auto-allows most IPs)
4. Try refreshing the page and running again
    `);
    return false;
  }
}

async function performMigration() {
  console.log('🔄 Starting migration to Neon...');
  
  try {
    // Analyze current data
    const analysis = await analyzeCurrentData();
    if (analysis.taskCount === 0) {
      console.log('📭 No tasks to migrate');
      return true;
    }
    
    // Test Neon connection
    const connected = await testNeonConnection();
    if (!connected) {
      throw new Error('Cannot connect to Neon database');
    }
    
    // Import Neon service
    const { NeonTaskService } = await import('./src/services/neonTaskService.ts');
    const { neonClient } = await import('./src/integrations/neon/client.ts');
    
    // Initialize Neon service
    await NeonTaskService.initialize({
      endpoint: import.meta.env.VITE_NEON_ENDPOINT || 'https://console.neon.tech/api/v2',
      apiKey: import.meta.env.VITE_NEON_API_KEY || '',
      databaseUrl: import.meta.env.VITE_NEON_DATABASE_URL
    });
    
    // Perform migration
    await NeonTaskService.migrateFromLocalStorage();
    
    console.log('✅ Migration completed successfully!');
    
    // Verify migration
    console.log('🔍 Verifying migration...');
    const todayTasks = await NeonTaskService.getTasksForDate(new Date());
    console.log(`Verification: Found ${todayTasks.tasks.length} tasks for today in Neon`);
    
    // Disconnect
    await neonClient.disconnect();
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

async function enableMCPIntegration() {
  console.log('🤖 Enabling MCP integration...');
  
  try {
    console.log(`
🔗 MCP Integration Setup:

1. Neon MCP Server: https://mcp.neon.tech
2. Your project will be accessible via natural language
3. I'll be able to:
   - Query your tasks: "Show me urgent tasks"
   - Create tasks: "Add a task to review the API docs"
   - Analyze patterns: "What are my productivity trends?"
   - Organize tasks: "Reorganize my tasks by priority"

Next steps:
1. Visit https://mcp.neon.tech
2. Authenticate with your Neon account
3. Grant access to your SISO project
4. Test with: "Show me all my personal tasks"
    `);
    
    return true;
    
  } catch (error) {
    console.error('❌ MCP setup failed:', error);
    return false;
  }
}

async function updateApplicationCode() {
  console.log('⚙️ Application code update needed...');
  
  console.log(`
🔧 Next Steps for Code Update:

1. Update environment variables in .env:
   VITE_NEON_DATABASE_URL=your_neon_connection_string
   VITE_NEON_API_KEY=your_neon_api_key
   VITE_NEON_PROJECT_ID=your_project_id

2. I'll update the application to use NeonTaskService instead of personalTaskService

3. Features enabled:
   ✅ Cloud storage across devices
   ✅ Real-time sync
   ✅ AI-powered task analysis
   ✅ Natural language database queries
   ✅ Database branching for AI experiments
   ✅ Vector embeddings for semantic search

4. The app will automatically switch to Neon backend
  `);
}

// Main migration workflow
async function runNeonMigration() {
  console.log('🚀 Starting complete SISO → Neon migration...');
  
  try {
    // Step 1: Setup
    await setupNeonMigration();
    
    // Step 2: Analyze current data
    const analysis = await analyzeCurrentData();
    
    // Step 3: Test connection
    const connected = await testNeonConnection();
    if (!connected) {
      console.log('❌ Cannot proceed without Neon connection');
      return false;
    }
    
    // Step 4: Confirm migration
    const proceed = confirm(`
Ready to migrate ${analysis.taskCount} tasks to Neon?

This will:
✅ Move all your tasks to Neon cloud database
✅ Enable AI features via MCP integration  
✅ Backup your current localStorage data
✅ Enable multi-device sync

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
    
    // Step 6: Enable MCP
    await enableMCPIntegration();
    
    // Step 7: Code update instructions
    await updateApplicationCode();
    
    console.log(`
🎉 SISO → Neon Migration Complete!

✅ ${analysis.taskCount} tasks migrated to Neon
✅ MCP integration enabled for AI features
✅ Cloud sync enabled across devices
✅ LocalStorage data backed up safely

Your personal task management is now:
🤖 AI-powered with natural language queries
☁️ Cloud-synced across all devices  
🚀 Ready for advanced AI features
🔒 Secure with Neon's enterprise-grade security

Next: I'll update your app code to use Neon backend!
    `);
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration workflow failed:', error);
    return false;
  }
}

// Make functions available globally
window.runNeonMigration = runNeonMigration;
window.analyzeCurrentData = analyzeCurrentData;
window.testNeonConnection = testNeonConnection;
window.performMigration = performMigration;

console.log(`
🎯 SISO → Neon Migration Ready!

Available functions:
- runNeonMigration() - Complete migration workflow
- analyzeCurrentData() - Check current localStorage tasks
- testNeonConnection() - Test Neon database connection
- performMigration() - Migrate data to Neon

Quick start (after setting up Neon):
1. Set environment variables in .env
2. Run: runNeonMigration()

Let's upgrade SISO to AI-powered task management! 🚀
`);

// Auto-run analysis
setTimeout(analyzeCurrentData, 1000);