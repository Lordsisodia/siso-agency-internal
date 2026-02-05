/**
 * Deep Work Tasks API - Stub Handler
 * Returns empty data to prevent console errors
 */

export default async function handler(req, res) {
  const { method, url, query } = req;

  // Parse URL path to handle nested routes like /api/deep-work/tasks/123/toggle
  const pathParts = url?.split('?')[0]?.split('/').filter(Boolean) || [];
  const taskId = pathParts[2]; // /api/deep-work/tasks/{taskId}/...
  const subAction = pathParts[3]; // toggle, subtasks, etc.

  try {
    // Handle nested routes first
    if (taskId) {
      switch (method) {
        case 'PUT':
          if (subAction === 'toggle') {
            res.json({
              success: true,
              data: {
                id: taskId,
                completed: true,
                toggled: true
              }
            });
            return;
          }
          // Regular task update
          res.json({
            success: true,
            data: {
              id: taskId,
              updated: true,
              ...req.body
            }
          });
          return;

        case 'POST':
          if (subAction === 'subtasks') {
            res.json({
              success: true,
              data: {
                id: `subtask-${Date.now()}`,
                taskId: taskId,
                title: req.body?.title || 'New Subtask',
                completed: false
              }
            });
            return;
          }
          break;

        case 'DELETE':
          res.json({
            success: true,
            data: { deleted: true, id: taskId }
          });
          return;
      }
    }

    // Handle base routes
    switch (method) {
      case 'GET':
        // Return empty tasks array
        res.json({
          success: true,
          data: []
        });
        break;

      case 'POST':
        // Return success for task creation
        res.json({
          success: true,
          data: {
            id: `deep-${Date.now()}`,
            ...req.body.taskData,
            workType: 'DEEP'
          }
        });
        break;

      case 'PUT':
        // Return success for task update (by query param)
        res.json({
          success: true,
          data: {
            id: query.taskId,
            updated: true,
            ...req.body
          }
        });
        break;

      case 'DELETE':
        // Return success for task deletion (by query param)
        res.json({
          success: true,
          data: { deleted: true, id: query.taskId }
        });
        break;

      default:
        res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Deep Work API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
