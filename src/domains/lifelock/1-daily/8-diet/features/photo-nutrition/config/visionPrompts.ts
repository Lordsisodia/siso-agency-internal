/**
 * Vision API Prompts for Food Analysis
 */

export const FOOD_ANALYSIS_PROMPT = `You are a professional nutritionist analyzing food photos.

Analyze this food image and provide accurate macro estimates:

Instructions:
- Identify all food items visible in the image
- Estimate realistic portion sizes (small/medium/large/weight)
- Calculate total macros for the entire meal
- Be conservative with estimates (slightly underestimate rather than overestimate)
- Consider cooking methods (fried adds fats, grilled doesn't)
- Account for visible oils, sauces, and condiments

Provide your response in this exact JSON format (no other text):
{
  "calories": <total calories as integer>,
  "protein": <total protein in grams as integer>,
  "carbs": <total carbs in grams as integer>,
  "fats": <total fats in grams as integer>,
  "description": "<detailed description: list main items, portion sizes, and cooking method. Example: 'Grilled chicken breast (6oz) with steamed broccoli (1 cup), brown rice (1/2 cup), and olive oil drizzle'>"
}

Only return valid JSON. No markdown, no explanations, just the JSON object.`;

export const VISION_MODEL = 'openai/gpt-4o-mini'; // Cheap and effective for food analysis

export const VISION_CONFIG = {
  temperature: 0.3, // Lower temperature for more consistent estimates
  max_tokens: 300, // Enough for detailed description + JSON
};
