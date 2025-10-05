// Migrate Personal Tasks to Supabase Cloud Storage
// Run this in browser console to move localStorage tasks to cloud

console.log('☁️ Starting Personal Tasks Migration to Supabase...');

async function migrateToSupabase() {
  try {
    console.log('1. 📋 Checking current localStorage tasks...');
    
    // Check current localStorage tasks
    const localTasks = localStorage.getItem('lifelock-personal-tasks');
    if (!localTasks) {
      console.log('❌ No tasks found in localStorage');
      return;
    }
    
    const tasks = JSON.parse(localTasks);
    console.log(`Found ${tasks.length} tasks in localStorage:`, tasks);
    
    console.log('2. 🔄 Setting up cloud service...');
    
    // Import the cloud service
    const { personalTaskCloudService } = await import('./src/services/personalTaskCloudService.ts');
    
    // Initialize the cloud service
    await personalTaskCloudService.initialize();
    
    console.log('3. ⬆️ Migrating tasks to Supabase...');
    
    // Save existing tasks to cloud
    await personalTaskCloudService.saveTasks(tasks);
    
    console.log('4. ✅ Migration completed successfully!');
    
    // Verify by loading from cloud
    const cloudTasks = await personalTaskCloudService.loadTasks();
    console.log(`Verified: ${cloudTasks.length} tasks now in cloud storage`);
    
    console.log(`
✅ Personal Tasks Migration Complete!

Your tasks are now stored in:
📊 Supabase Database: ${cloudTasks.length} tasks
💾 Local Cache: For offline access
🔄 Auto-sync: Across all your devices

Benefits:
- ✅ Access tasks on any device
- ✅ Never lose tasks (cloud backup)
- ✅ Real-time sync across browsers
- ✅ Offline support with local cache
- ✅ Automatic conflict resolution
    `);
    
    // Optional: Clear old localStorage after successful migration
    const clearOld = confirm('Migration successful! Clear old localStorage data?');
    if (clearOld) {
      localStorage.removeItem('lifelock-personal-tasks');
      console.log('🧹 Cleared old localStorage data');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('not authenticated')) {
      console.log('🔐 Please log in first, then run the migration again');
    } else if (error.message?.includes('RLS')) {
      console.log('🛡️ Database permissions need to be updated. Check Supabase RLS policies.');
    } else {
      console.log('💡 Migration failed but your local tasks are safe in localStorage');
    }
    
    return false;
  }
}

// Test cloud service without migrating
async function testCloudService() {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    const { personalTaskCloudService } = await import('./src/services/personalTaskCloudService.ts');
    await personalTaskCloudService.initialize();
    
    // Try to load tasks (will test authentication and permissions)
    const tasks = await personalTaskCloudService.getTasksForDate(new Date());
    console.log('✅ Supabase connection successful!', tasks);
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

// Make functions available globally
window.migrateToSupabase = migrateToSupabase;
window.testCloudService = testCloudService;

console.log(`
☁️ Personal Tasks Supabase Migration Ready!

Available functions:
- migrateToSupabase() - Move localStorage tasks to cloud
- testCloudService() - Test Supabase connection

Quick start:
1. First test: testCloudService()
2. If successful: migrateToSupabase()

Your tasks will be:
📊 Stored in Supabase (cloud)
💾 Cached locally (speed)
🔄 Synced across devices
`);

// Auto-test connection
console.log('⏳ Testing Supabase connection in 2 seconds...');
setTimeout(testCloudService, 2000);