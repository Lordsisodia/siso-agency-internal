/**
 * 🚀 BMAD Phase 2C: Test Complete Offline System
 * Quick test script to validate the offline system functionality
 */

// Test data for our offline system
const testData = {
  lightWorkTask: {
    id: 'test-light-task-1',
    user_id: '0e402267-17de-43a9-b54f-3756bcd24614',
    title: 'Test Light Work Task - BMAD Phase 2C',
    description: 'Testing universal offline system',
    priority: 'HIGH',
    completed: false,
    task_date: new Date().toISOString().split('T')[0],
    original_date: new Date().toISOString().split('T')[0],
    // Note: using task_date instead of current_task_date (schema alignment)
  },
  
  deepWorkSession: {
    id: 'test-deep-session-1',
    user_id: '0e402267-17de-43a9-b54f-3756bcd24614',
    title: 'Test Deep Work Session - BMAD Phase 2C',
    description: 'Testing universal offline system for deep work',
    priority: 'MEDIUM',
    completed: false,
    task_date: new Date().toISOString().split('T')[0],
    original_date: new Date().toISOString().split('T')[0],
    // Note: using task_date instead of current_task_date (schema alignment),
    duration_minutes: 45
  },
  
  dailyHealth: {
    id: 'test-health-1',
    user_id: '0e402267-17de-43a9-b54f-3756bcd24614',
    date: new Date().toISOString().split('T')[0],
    meals: {
      breakfast: "Oatmeal with berries",
      lunch: "Salad with grilled chicken",
      dinner: "Salmon with vegetables",
      snacks: "Almonds and apple"
    },
    macros: {
      calories: "2000",
      protein: "120g",
      carbs: "200g",
      fats: "80g"
    },
    health_checklist: ["8_hours_sleep", "30_min_exercise", "2L_water"]
  }
};

console.log('🚀 BMAD Phase 2C Test Data Ready:');
console.log('- Light Work Task:', testData.lightWorkTask.title);
console.log('- Deep Work Session:', testData.deepWorkSession.title);
console.log('- Daily Health Data:', testData.dailyHealth.date);
console.log('\nNext: Test these in browser console with offlineManager.saveUniversal()');