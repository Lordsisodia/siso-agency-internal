// Quick offline manager test
async function testOfflineManager() {
  try {
    console.log('🧪 Testing offline manager...');
    
    // Test data
    const testTask = {
      id: 'test-123',
      user_id: 'test-user',
      date: '2025-09-18',
      habit_key: 'wakeUp',
      completed: true,
      updated_at: new Date().toISOString()
    };
    
    // Import the offline manager
    const { offlineManager } = await import('./src/shared/services/offlineManager.ts');
    
    console.log('✅ Offline manager imported successfully');
    
    // Check initial status
    const status = await offlineManager.checkStatus();
    console.log('📊 Initial status:', status);
    
    // Test save operation
    console.log('💾 Testing save operation...');
    const saveResult = await offlineManager.saveTask('morning_routine_habits', testTask, true); // Force offline
    console.log('✅ Save result:', saveResult);
    
    // Test stats
    const stats = await offlineManager.getOfflineStats();
    console.log('📈 Offline stats:', stats);
    
    console.log('🎉 Offline manager test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testOfflineManager().then(success => {
  console.log(success ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED');
});