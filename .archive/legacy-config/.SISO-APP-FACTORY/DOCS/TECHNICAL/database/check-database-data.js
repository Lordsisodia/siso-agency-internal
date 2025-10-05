import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking database data...\n');

    // Check Users
    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      });
      console.log('   Sample users:', users);
    }

    // Check Personal Tasks
    const taskCount = await prisma.personalTask.count();
    console.log(`📋 Personal Tasks: ${taskCount}`);
    
    if (taskCount > 0) {
      const tasks = await prisma.personalTask.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          workType: true,
          priority: true,
          completed: true,
          currentDate: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      console.log('   Recent tasks:', tasks);
    }

    // Check Personal Context
    const contextCount = await prisma.personalContext.count();
    console.log(`🎯 Personal Contexts: ${contextCount}`);

    // Check Eisenhower Analysis
    const eisenhowerCount = await prisma.eisenhowerAnalysis.count();
    console.log(`📊 Eisenhower Analyses: ${eisenhowerCount}`);

    // Check Voice Processing History
    const voiceCount = await prisma.voiceProcessingHistory.count();
    console.log(`🎤 Voice Processing Records: ${voiceCount}`);

    // Check User Progress (Gamification)
    const progressCount = await prisma.userProgress.count();
    console.log(`🎮 User Progress Records: ${progressCount}`);
    
    if (progressCount > 0) {
      const progress = await prisma.userProgress.findMany({
        take: 3,
        select: {
          userId: true,
          currentLevel: true,
          totalXP: true,
          dailyXP: true,
          currentStreak: true
        }
      });
      console.log('   Sample progress:', progress);
    }

    // Check Daily Stats
    const statsCount = await prisma.dailyStats.count();
    console.log(`📈 Daily Stats: ${statsCount}`);

    // Check Automation Tasks
    const automationCount = await prisma.automationTask.count();
    console.log(`🤖 Automation Tasks: ${automationCount}`);

    // Check Time Blocks
    const timeBlockCount = await prisma.timeBlock.count();
    console.log(`⏰ Time Blocks: ${timeBlockCount}`);

    // Check Daily Routines
    const routineCount = await prisma.dailyRoutine.count();
    console.log(`🌅 Daily Routines: ${routineCount}`);

    // Check Daily Health
    const healthCount = await prisma.dailyHealth.count();
    console.log(`💪 Daily Health Records: ${healthCount}`);

    // Check Daily Workouts
    const workoutCount = await prisma.dailyWorkout.count();
    console.log(`🏋️ Daily Workouts: ${workoutCount}`);

    // Check Daily Habits
    const habitCount = await prisma.dailyHabits.count();
    console.log(`✅ Daily Habits: ${habitCount}`);

    // Check Daily Reflections
    const reflectionCount = await prisma.dailyReflections.count();
    console.log(`💭 Daily Reflections: ${reflectionCount}`);

    console.log('\n✨ Database check complete!');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();