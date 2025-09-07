import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('👥 Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        supabaseId: true,
        createdAt: true
      }
    });
    
    // Get task count separately
    const userTaskCounts = await Promise.all(users.map(async (user) => {
      const taskCount = await prisma.personalTask.count({
        where: { userId: user.id }
      });
      return { ...user, taskCount };
    }));
    
    console.log(`Found ${userTaskCounts.length} users:`);
    userTaskCounts.forEach(user => {
      console.log(`  • ID: ${user.id}`);
      console.log(`    Email: ${user.email}`);  
      console.log(`    Tasks: ${user.taskCount}`);
      console.log(`    Created: ${user.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();