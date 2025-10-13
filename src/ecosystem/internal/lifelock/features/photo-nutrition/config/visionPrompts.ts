/**
 * Vision API Prompts for Food Analysis
 */

export const FOOD_ANALYSIS_PROMPT = `Analyze this food photo and estimate the nutritional content.

Be realistic and conservative in your estimates. Consider portion sizes carefully.

Provide your response in the following JSON format:
{
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fats": <number in grams>,
  "description": "<brief description of the food>"
}

Only return the JSON, no other text.`;

export const VISION_MODEL = 'openai/gpt-4o-mini'; // Cheap and effective

export const VISION_CONFIG = {
  temperature: 0.3, // Lower temperature for more consistent estimates
  max_tokens: 200, // Short response (just JSON)
};
