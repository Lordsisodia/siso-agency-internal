/**
 * 🗄️ Personal Context API Endpoint - Vercel Serverless Function
 * 
 * CommonJS version to avoid ES module conflicts
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;

  try {
    // Import the database service using ES modules
    const { taskDatabaseService } = await import('../ai-first/services/task-database-service-js.js');

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
};