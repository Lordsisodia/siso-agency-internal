/**
 * Task Recovery Debug Script
 * Checks localStorage, database records, and recovery options
 */

console.log('🔍 SISO Internal Task Recovery Analysis');
console.log('=====================================');

// Check localStorage for personal tasks
function checkLocalStorage() {
  const STORAGE_KEYS = [
    'lifelock-personal-tasks',
    'siso-tasks',
    'personal-tasks',
    'daily-tasks',
    'focus-tasks',
    'deep-focus-tasks'
  ];

  console.log('\n📱 Checking localStorage for task data...');
  
  for (const key of STORAGE_KEYS) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`✅ Found data in '${key}':`, parsed);
        
        if (Array.isArray(parsed)) {
          console.log(`   → ${parsed.length} items found`);
          parsed.forEach((item, index) => {
            if (item.title) {
              console.log(`   [${index}] ${item.title} ${item.completed ? '✓' : '○'}`);
            }
          });
        }
      } catch (e) {
        console.log(`❌ Invalid JSON in '${key}':`, data.substring(0, 100));
      }
    }
  }
}

// Check all localStorage keys for anything task-related
function scanAllLocalStorage() {
  console.log('\n🔍 Scanning all localStorage keys...');
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('task') || key.includes('focus') || key.includes('life'))) {
      const data = localStorage.getItem(key);
      console.log(`📝 Found task-related key '${key}':`, data?.substring(0, 200));
    }
  }
}

// Run recovery analysis
checkLocalStorage();
scanAllLocalStorage();

console.log('\n🎯 Task Recovery Recommendations:');
console.log('1. Check browser cache/history for API calls');
console.log('2. Look for backup data in indexedDB');
console.log('3. Check if tasks were saved to different date keys');
console.log('4. Implement better persistence with automatic backups');