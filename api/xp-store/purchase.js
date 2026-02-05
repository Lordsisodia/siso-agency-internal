/**
 * XP Store Purchase API - Stub Handler
 */

export default async function handler(req, res) {
  try {
    res.json({
      success: true,
      data: {
        purchased: true,
        newBalance: 0
      }
    });
  } catch (error) {
    console.error('XP Store Purchase API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
