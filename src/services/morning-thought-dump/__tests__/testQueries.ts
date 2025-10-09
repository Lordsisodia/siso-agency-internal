/**
 * Test Tool Queries - Verify Supabase returns real data
 * Run this to test each function before using in AI
 */

import { TaskQueryTools } from '../tools/taskQueryTools';

export async function testAllQueries(userId: string, selectedDate: Date) {
  console.log('🧪 TESTING ALL TOOL QUERIES\n');

  const tools = new TaskQueryTools(userId, selectedDate);

  // Test 1
  console.log('━━━ TEST 1: get_todays_tasks ━━━');
  const todaysTasks = await tools.getTodaysTasks(false);
  console.log('Result:', todaysTasks);
  console.log(`✅ Returns ${todaysTasks.summary.totalDeepWork + todaysTasks.summary.totalLightWork} tasks\n`);

  // Test 2
  console.log('━━━ TEST 2: get_task_by_title ━━━');
  const taskByTitle = await tools.getTaskByTitle('login');
  console.log('Result:', taskByTitle);
  console.log(taskByTitle.error ? '❌ No match' : `✅ Found: ${taskByTitle.title}\n`);

  // Test 3
  console.log('━━━ TEST 3: get_urgent_tasks ━━━');
  const urgentTasks = await tools.getUrgentTasks();
  console.log('Result:', urgentTasks);
  console.log(`✅ Returns ${urgentTasks.count} urgent tasks\n`);

  // Test 4
  console.log('━━━ TEST 4: get_deep_work_tasks_only ━━━');
  const deepOnly = await tools.getDeepWorkTasksOnly();
  console.log('Result:', deepOnly);
  console.log(`✅ Returns ${deepOnly.deepWorkTasks.length} deep work tasks\n`);

  // Test 5
  console.log('━━━ TEST 5: get_light_work_tasks_only ━━━');
  const lightOnly = await tools.getLightWorkTasksOnly();
  console.log('Result:', lightOnly);
  console.log(`✅ Returns ${lightOnly.totalTasks} light work tasks\n`);

  // Test 6
  if (todaysTasks.deepWorkTasks.length > 0) {
    console.log('━━━ TEST 6: get_task_subtasks ━━━');
    const firstTaskId = todaysTasks.deepWorkTasks[0].id;
    const subtasks = await tools.getTaskSubtasks(firstTaskId);
    console.log('Result:', subtasks);
    console.log(`✅ Returns ${subtasks.totalCount} subtasks\n`);
  }

  // Test 7
  console.log('━━━ TEST 7: get_tasks_by_time (60 min) ━━━');
  const quickTasks = await tools.getTasksByTimeConstraint(60);
  console.log('Result:', quickTasks);
  console.log(`✅ Returns ${quickTasks.matchingTasks} tasks under 60 min\n`);

  // Test 8
  console.log('━━━ TEST 8: search_tasks("email") ━━━');
  const searchResults = await tools.searchTasksByKeyword('email');
  console.log('Result:', searchResults);
  console.log(`✅ Returns ${searchResults.resultsCount} matching tasks\n`);

  console.log('🎉 ALL TESTS COMPLETE');

  return {
    todaysTasks,
    urgentTasks,
    deepWork: deepOnly,
    lightWork: lightOnly
  };
}

// Usage in browser console:
// import { testAllQueries } from '@/services/morning-thought-dump/__tests__/testQueries';
// testAllQueries('your-user-id', new Date());
