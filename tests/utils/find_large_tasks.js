import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

console.log('🔍 Searching for tasks with many subtasks...');

try {
  const allTasks = await prisma.personalTask.findMany({
    where: { userId: "user_31c4PuaPdFf9abejhmzrN9kcill" },
    include: { subtasks: true }
  });
  
  console.log(`📊 Found ${allTasks.length} total tasks for user`);
  
  const largeTasks = allTasks.filter(task => task.subtasks.length > 10);
  console.log(`🎯 Tasks with >10 subtasks: ${largeTasks.length}`);
  
  allTasks.forEach(task => {
    if (task.subtasks.length > 5) {
      console.log(`📋 "${task.title}" (${task.workType}, completed: ${task.completed}) - ${task.subtasks.length} subtasks`);
    }
  });
  
  if (largeTasks.length > 0) {
    largeTasks.forEach(task => {
      console.log(`\n🔍 LARGE TASK: "${task.title}"`);
      console.log(`  - WorkType: ${task.workType}`);
      console.log(`  - Completed: ${task.completed}`);
      console.log(`  - Subtasks: ${task.subtasks.length}`);
      console.log(`  - Created: ${task.createdAt}`);
    });
  }
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await prisma.$disconnect();
}
