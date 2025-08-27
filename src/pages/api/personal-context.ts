/**
 * 🗄️ Personal Context API Endpoint
 * 
 * HTTP API for personal context operations with real database persistence
 */

import { taskDatabaseService } from '@/ai-first/services/task-database-service-fixed';

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/personal-context?userId=xxx
        const { userId } = query;
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }
        
        const context = await taskDatabaseService.getPersonalContext(userId);
        return res.status(200).json({ success: true, data: context });

      case 'PUT':
      case 'POST':
        // PUT/POST /api/personal-context - Update personal context
        const { userId: updateUserId, contextData } = body;
        if (!updateUserId) {
          return res.status(400).json({ error: 'userId is required' });
        }
        
        await taskDatabaseService.updatePersonalContext(updateUserId, contextData || {});
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Personal Context API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}