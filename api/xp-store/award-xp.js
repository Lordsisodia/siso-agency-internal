/**
 * XP Store Award XP API - Stub Handler
 */

export default async function handler(req, res) {
  try {
    res.json({
      success: true,
      data: {
        awarded: true,
        amount: req.body?.amount || 0,
        newBalance: 0
      }
    });
  } catch (error) {
    console.error('XP Store Award XP API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
