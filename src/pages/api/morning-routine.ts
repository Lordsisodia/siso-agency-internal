/**
 * 🌅 Morning Routine API Endpoint
 * 
 * HTTP API for morning routine operations with real database persistence
 */

import path from 'path';
import { pathToFileURL } from 'url';

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

  try {
    // Dynamic import of database service
    const servicePath = path.resolve(process.cwd(), 'ai-first/services/task-database-service-js.js');
    const serviceUrl = pathToFileURL(servicePath).href;
    const { taskDatabaseService } = await import(serviceUrl + '?t=' + Date.now());

    switch (method) {
      case 'GET':
        // GET /api/morning-routine?userId=xxx&date=2025-08-26
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Get morning routine data for the specific date
        const morningRoutine = await taskDatabaseService.getMorningRoutineForDate(userId, date);
        return res.status(200).json({ success: true, data: morningRoutine });

      case 'PATCH':
        // PATCH /api/morning-routine - Update morning routine habit completion
        const { userId: patchUserId, date: patchDate, habitName, completed } = body;
        if (!patchUserId || !patchDate || !habitName || typeof completed !== 'boolean') {
          return res.status(400).json({ error: 'userId, date, habitName, and completed are required' });
        }
        
        const updatedRoutine = await taskDatabaseService.updateMorningRoutineHabit(
          patchUserId, 
          patchDate, 
          habitName, 
          completed
        );
        return res.status(200).json({ success: true, data: updatedRoutine });

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Morning Routine API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}