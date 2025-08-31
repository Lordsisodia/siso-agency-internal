/**
 * 🗄️ Tasks API Endpoint
 * 
 * HTTP API for task operations with real database persistence
 */

import { taskDatabaseService } from '@/ai-first/services/task-database-service-fixed';
import { auth } from '@clerk/nextjs';

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/tasks?userId=xxx&date=2025-08-26
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        const tasks = await taskDatabaseService.getTasksForDate(userId, date);
        return res.status(200).json({ success: true, data: tasks });

      case 'POST':
        // POST /api/tasks - Create new task
        const { userId: createUserId, taskData } = body;
        if (!createUserId || !taskData) {
          return res.status(400).json({ error: 'userId and taskData are required' });
        }
        
        const newTask = await taskDatabaseService.createTask(createUserId, taskData);
        return res.status(201).json({ success: true, data: newTask });

      case 'PUT':
        // PUT /api/tasks - Update task
        const { taskId, completed, title } = body;
        if (!taskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }
        
        if (completed !== undefined) {
          await taskDatabaseService.updateTaskCompletion(taskId, completed);
          
          // Award XP when task is completed (not when uncompleted)
          if (completed === true) {
            try {
              const { userId } = auth();
              if (userId) {
                // Get full task data for intelligent XP calculation
                const taskData = await taskDatabaseService.getTaskById?.(taskId);
                
                // Import intelligent XP services
                const { IntelligentXPService, TaskImportanceDetector } = await import('@/services/intelligentXPService');
                const { GamificationEngine } = await import('@/services/gamificationSystem');
                
                // Get or analyze task importance if not already done
                let taskAnalysis = taskData?.aiAnalyzed ? {
                  priority: taskData.priority,
                  complexity: taskData.complexity || 5,
                  learningValue: taskData.learningValue || 5,
                  strategicImportance: taskData.strategicImportance || 5
                } : TaskImportanceDetector.analyzeImportance(
                  taskData?.title || 'Task',
                  taskData?.description
                );
                
                // Get user game stats (TODO: implement getUserGameStats)
                const userStats = {
                  totalXP: 0,
                  level: 1,
                  currentStreak: 1,
                  tasksCompletedToday: 1,
                  userLevel: 1,
                  activeAchievements: []
                };
                
                // Build intelligent task context
                const taskContext = {
                  title: taskData?.title || 'Task',
                  description: taskData?.description,
                  priority: taskAnalysis.priority,
                  workType: taskData?.workType || 'LIGHT',
                  difficulty: taskData?.difficulty || 'MODERATE',
                  estimatedDuration: taskData?.estimatedDuration,
                  complexity: taskAnalysis.complexity,
                  learningValue: taskAnalysis.learningValue,
                  strategicImportance: taskAnalysis.strategicImportance,
                  currentStreak: userStats.currentStreak,
                  tasksCompletedToday: userStats.tasksCompletedToday,
                  userLevel: userStats.level,
                  activeAchievements: [],
                  timeOfDay: new Date().getHours() < 12 ? 'morning' as const : 
                            new Date().getHours() < 18 ? 'afternoon' as const : 'evening' as const,
                  isWeekend: [0, 6].includes(new Date().getDay()),
                  completedInFocusSession: true
                };
                
                // Calculate intelligent XP
                const xpCalculation = IntelligentXPService.calculateIntelligentXP(taskContext);
                
                console.log('🧠 Intelligent XP calculation:', {
                  task: taskContext.title,
                  finalXP: xpCalculation.finalXP,
                  confidence: xpCalculation.confidenceScore,
                  breakdown: xpCalculation.breakdown
                });
                
                // Award XP using XP Store service
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/xp-store/award-xp`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization || '',
                  },
                  body: JSON.stringify({
                    source: 'INTELLIGENT_TASK_COMPLETION',
                    sourceId: taskId,
                    baseXP: xpCalculation.baseXP,
                    finalXP: xpCalculation.finalXP,
                    breakdown: xpCalculation.breakdown,
                    confidence: xpCalculation.confidenceScore,
                    multipliers: {
                      priority: xpCalculation.priorityMultiplier,
                      complexity: xpCalculation.complexityBonus,
                      learning: xpCalculation.learningBonus,
                      strategic: xpCalculation.strategicBonus,
                      level: xpCalculation.levelMultiplier,
                      combo: xpCalculation.comboMultiplier
                    }
                  })
                });
                
                if (response.ok) {
                  const result = await response.json();
                  console.log('✅ Intelligent XP awarded:', result.message);
                  console.log('🎯 XP breakdown:', xpCalculation.breakdown.join(' | '));
                  console.log(`🎮 Confidence: ${xpCalculation.confidenceScore}%`);
                } else {
                  console.warn('⚠️ Failed to award XP for task completion:', await response.text());
                }
              }
            } catch (xpError) {
              // Don't fail the task update if XP awarding fails
              console.error('❌ Intelligent XP award error:', xpError);
            }
          }
        }
        
        if (title !== undefined) {
          await taskDatabaseService.updateTaskTitle(taskId, title);
        }
        
        return res.status(200).json({ success: true });

      case 'DELETE':
        // DELETE /api/tasks?taskId=xxx
        const { taskId: deleteTaskId } = query;
        if (!deleteTaskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }
        
        await taskDatabaseService.deleteTask(deleteTaskId);
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Tasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}