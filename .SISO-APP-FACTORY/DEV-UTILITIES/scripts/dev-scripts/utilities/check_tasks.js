import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTasks() {
  try {
    const tasks = await prisma.personalTask.findMany({
      where: {
        userId: "user_31c4PuaPdFf9abejhmzrN9kcill",
        completed: false
      },
      include: {
        subtasks: true
      }
    });
    
    console.log('🔍 All uncompleted tasks in database:');
    console.log(`📊 Total tasks found: ${tasks.length}`);
    
    tasks.forEach((task, index) => {
      console.log(`\n📋 Task ${index + 1}:`);
      console.log(`  - ID: ${task.id}`);
      console.log(`  - Title: ${task.title}`);
      console.log(`  - WorkType: ${task.workType}`);
      console.log(`  - Created: ${task.createdAt}`);
      console.log(`  - Subtasks: ${task.subtasks.length}`);
      
      if (task.subtasks.length > 0) {
        console.log(`  - First subtask: "${task.subtasks[0].text}"`);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTasks();