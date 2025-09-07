import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function getFeedbackTasks() {
  try {
    console.log('🔍 Fetching all tasks for feedback analysis...\n');

    // Get all Personal Tasks with full details
    const tasks = await prisma.personalTask.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        workType: true,
        priority: true,
        completed: true,
        originalDate: true,
        currentDate: true,
        estimatedDuration: true,
        rollovers: true,
        tags: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        startedAt: true,
        actualDurationMin: true,
        aiTimeEstimateMin: true,
        aiTimeEstimateMax: true,
        aiTimeEstimateML: true,
        timeAccuracy: true,
        aiAnalyzed: true,
        aiReasoning: true,
        analyzedAt: true,
        complexity: true,
        confidence: true,
        contextualBonus: true,
        difficulty: true,
        learningValue: true,
        priorityRank: true,
        strategicImportance: true,
        timeEstimate: true,
        xpReward: true,
        subtasks: {
          select: {
            id: true,
            title: true,
            completed: true,
            workType: true,
            createdAt: true,
            aiReasoning: true,
            xpReward: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 Found ${tasks.length} total tasks\n`);
    
    tasks.forEach((task, index) => {
      console.log(`\n=== TASK ${index + 1} ===`);
      console.log(`ID: ${task.id}`);
      console.log(`Title: ${task.title}`);
      console.log(`Description: ${task.description || 'No description'}`);
      console.log(`Work Type: ${task.workType}`);
      console.log(`Priority: ${task.priority}`);
      console.log(`Completed: ${task.completed}`);
      console.log(`Date: ${task.currentDate} (original: ${task.originalDate})`);
      console.log(`Created: ${task.createdAt}`);
      console.log(`Tags: ${task.tags?.join(', ') || 'None'}`);
      console.log(`Category: ${task.category || 'None'}`);
      console.log(`Estimated Duration: ${task.estimatedDuration || 'None'} min`);
      console.log(`Rollovers: ${task.rollovers}`);
      
      if (task.aiAnalyzed) {
        console.log(`\n🧠 AI ANALYSIS:`);
        console.log(`Reasoning: ${task.aiReasoning || 'None'}`);
        console.log(`XP Reward: ${task.xpReward || 'None'}`);
        console.log(`Difficulty: ${task.difficulty || 'None'}`);
        console.log(`Complexity: ${task.complexity || 'None'}`);
        console.log(`Priority Rank: ${task.priorityRank || 'None'}`);
      }
      
      if (task.subtasks && task.subtasks.length > 0) {
        console.log(`\n📝 SUBTASKS (${task.subtasks.length}):`);
        task.subtasks.forEach((subtask, subIndex) => {
          console.log(`  ${subIndex + 1}. ${subtask.title} (${subtask.completed ? 'DONE' : 'PENDING'}) - XP: ${subtask.xpReward || 'None'}`);
        });
      }
      
      console.log('\n' + '='.repeat(50));
    });

    // Also get personal context for additional insights
    const personalContext = await prisma.personalContext.findMany({
      select: {
        currentGoals: true,
        skillPriorities: true,
        revenueTargets: true,
        timeConstraints: true,
        currentProjects: true,
        hatedTasks: true,
        valuedTasks: true,
        learningObjectives: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (personalContext.length > 0) {
      console.log('\n🎯 PERSONAL CONTEXT:');
      personalContext.forEach((context, index) => {
        console.log(`\nContext ${index + 1}:`);
        console.log(`Goals: ${context.currentGoals || 'None'}`);
        console.log(`Skill Priorities: ${context.skillPriorities || 'None'}`);
        console.log(`Revenue Targets: ${context.revenueTargets || 'None'}`);
        console.log(`Time Constraints: ${context.timeConstraints || 'None'}`);
        console.log(`Current Projects: ${context.currentProjects || 'None'}`);
        console.log(`Hated Tasks: ${context.hatedTasks || 'None'}`);
        console.log(`Valued Tasks: ${context.valuedTasks || 'None'}`);
        console.log(`Learning Objectives: ${context.learningObjectives || 'None'}`);
      });
    }

    console.log('\n✨ Feedback extraction complete!');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getFeedbackTasks();