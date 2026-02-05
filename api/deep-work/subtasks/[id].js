/**
 * Deep Work Subtasks API - Stub Handler
 * Handles individual subtask operations
 */

export default async function handler(req, res) {
  const { method, query } = req;
  const subtaskId = query.id;

  try {
    switch (method) {
      case 'PUT':
        // Update subtask
        res.json({
          success: true,
          data: {
            id: subtaskId,
            updated: true,
            ...req.body
          }
        });
        break;

      case 'DELETE':
        // Delete subtask
        res.json({
          success: true,
          data: { deleted: true, id: subtaskId }
        });
        break;

      default:
        res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Deep Work Subtasks API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
