/**
 * 🎯 XP Preview API Endpoint
 * 
 * GET /api/xp-preview?taskId=xxx - Preview XP for existing task
 * POST /api/xp-preview - Preview XP for new task data
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@clerk/nextjs';
import { taskDatabaseService } from '@/shared/services/task-database-service-fixed';
import { XPPreviewService } from '@/services/xpPreviewService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;

  try {
    const { userId } = auth();
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    switch (method) {
      case 'GET':
        // GET /api/xp-preview?taskId=xxx&includeContextual=true
        const { taskId, includeContextual } = query;
        
        if (!taskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }
        
        // Get task data (we'll need to add getTaskById method)
        // For now, get from tasks for today and find by ID
        const today = new Date().toISOString().split('T')[0];
        const todaysTasks = await taskDatabaseService.getTasksForDate(userId, today);
        const task = todaysTasks.find(t => t.id === taskId);
        
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        
        // Get user context (TODO: implement getUserXPStats)
        const userContext = {
          currentStreak: 1, // TODO: Get from user stats
          tasksCompletedToday: todaysTasks.filter(t => t.completed).length,
          userLevel: 1, // TODO: Get from user XP stats
          recentTaskCompletions: 0 // TODO: Calculate recent completions
        };
        
        // Generate preview
        const preview = XPPreviewService.generateTaskPreview(task, userContext);
        
        // Optionally include contextual previews
        let contextualPreviews = undefined;
        if (includeContextual === 'true') {
          contextualPreviews = XPPreviewService.getContextualPreviews(task, userContext);
        }
        
        return res.status(200).json({
          success: true,
          data: {
            taskId: task.id,
            taskTitle: task.title,
            preview,
            contextualPreviews
          }
        });

      case 'POST':
        // POST /api/xp-preview - Preview XP for new task
        const { 
          title, 
          description, 
          workType = 'LIGHT', 
          estimatedMinutes,
          includeMultipleScenarios = false 
        } = body;
        
        if (!title) {
          return res.status(400).json({ error: 'title is required' });
        }
        
        // Get user context
        const userStatsForNew = {
          currentStreak: 1, // TODO: Get actual stats
          tasksCompletedToday: 0, // TODO: Get actual count
          userLevel: 1, // TODO: Get actual level
          recentTaskCompletions: 0
        };
        
        // Generate preview for new task
        const newTaskPreview = XPPreviewService.estimateNewTaskXP(
          title,
          description,
          workType,
          estimatedMinutes,
          userStatsForNew
        );
        
        let scenarios = undefined;
        if (includeMultipleScenarios) {
          const taskData = { title, description, workType, estimatedDuration: estimatedMinutes };
          scenarios = XPPreviewService.getContextualPreviews(taskData, userStatsForNew);
        }
        
        return res.status(200).json({
          success: true,
          data: {
            preview: newTaskPreview,
            scenarios
          }
        });

      case 'PUT':
        // PUT /api/xp-preview - Bulk preview for multiple tasks (prioritization view)
        const { taskIds } = body;
        
        if (!Array.isArray(taskIds) || taskIds.length === 0) {
          return res.status(400).json({ error: 'taskIds array is required' });
        }
        
        // Get all tasks for today
        const todayForBulk = new Date().toISOString().split('T')[0];
        const allTasks = await taskDatabaseService.getTasksForDate(userId, todayForBulk);
        const requestedTasks = allTasks.filter(task => taskIds.includes(task.id));
        
        if (requestedTasks.length === 0) {
          return res.status(404).json({ error: 'No matching tasks found' });
        }
        
        // Get user context
        const userContextBulk = {
          currentStreak: 1,
          tasksCompletedToday: allTasks.filter(t => t.completed).length,
          userLevel: 1,
          recentTaskCompletions: 0
        };
        
        // Generate previews for all requested tasks
        const bulkPreviews = XPPreviewService.generateTaskListPreview(
          requestedTasks,
          userContextBulk
        );
        
        // Sort by estimated XP (highest first) for prioritization
        const sortedPreviews = bulkPreviews.sort((a, b) => b.estimatedXP - a.estimatedXP);
        
        return res.status(200).json({
          success: true,
          data: {
            totalTasks: sortedPreviews.length,
            totalEstimatedXP: sortedPreviews.reduce((sum, preview) => sum + preview.estimatedXP, 0),
            previews: sortedPreviews,
            prioritizationSummary: {
              highValue: sortedPreviews.filter(p => p.estimatedXP >= 100).length,
              mediumValue: sortedPreviews.filter(p => p.estimatedXP >= 50 && p.estimatedXP < 100).length,
              quickWins: sortedPreviews.filter(p => p.estimatedXP < 50).length
            }
          }
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ XP Preview API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}