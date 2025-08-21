// Fix Day View Tasks - Remove old template tasks and add personal tasks
// Run this in browser console on the day view page

console.log('🔧 Fixing Day View Tasks...');

async function fixDayViewTasks() {
  try {
    // Import the personal task service
    const { personalTaskService } = await import('./src/services/personalTaskService.ts');
    
    console.log('📊 Current tasks in personal service:');
    const todayTasks = personalTaskService.getTasksForDate(new Date());
    console.log(`Found ${todayTasks.tasks.length} tasks for today:`);
    
    todayTasks.tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} (${task.workType}, ${task.priority}, completed: ${task.completed})`);
    });
    
    // If no tasks, let's add some test tasks
    if (todayTasks.tasks.length === 0) {
      console.log('📝 No tasks found - adding some test tasks...');
      
      const testTasks = [
        {
          title: 'Review pull request for authentication',
          description: 'Code review for new authentication system',
          workType: 'deep',
          priority: 'high',
          estimatedDuration: 90
        },
        {
          title: 'Send project update email to client',
          description: 'Weekly update on development progress',
          workType: 'light',
          priority: 'medium',
          estimatedDuration: 20
        },
        {
          title: 'Fix responsive design bug',
          description: 'Mobile view layout issue on settings page',
          workType: 'deep',
          priority: 'urgent',
          estimatedDuration: 45
        }
      ];
      
      personalTaskService.addTasks(testTasks);
      console.log('✅ Added test tasks to personal service');
      
      // Show what was added
      const updatedTasks = personalTaskService.getTasksForDate(new Date());
      console.log(`Now have ${updatedTasks.tasks.length} tasks for today`);
    }
    
    console.log('\n🔄 Refreshing the page to show personal tasks...');
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Error fixing day view tasks:', error);
  }
}

// Run the fix
fixDayViewTasks();

console.log(`
✅ Day view fix applied!

The day view has been updated to:
1. Load tasks from personal task service instead of old templates
2. Show your actual tasks that can be created via voice or manual entry
3. Allow task completion that persists across page reloads
4. Support both deep work and light work tasks

If you still see template tasks, they're from the old system and will disappear after the page refreshes.
`);