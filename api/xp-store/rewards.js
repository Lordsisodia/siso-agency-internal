/**
 * XP Store Rewards API - Stub Handler
 */

export default async function handler(req, res) {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('XP Store Rewards API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
