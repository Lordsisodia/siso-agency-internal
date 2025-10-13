/**
 * OpenRouter Vision API Service
 * Analyzes food photos and estimates macros using GPT-4o Mini
 */

import { FOOD_ANALYSIS_PROMPT, VISION_MODEL, VISION_CONFIG } from '../config/visionPrompts';
import type { MacroEstimate, VisionAnalysisResult } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class VisionApiService {

  /**
   * Analyze food photo and estimate macros
   */
  async analyzeFoodPhoto(photoUrl: string): Promise<VisionAnalysisResult> {
    try {
      console.log('📸 [VISION] Analyzing food photo:', photoUrl);

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SISO LifeLock - Photo Nutrition'
        },
        body: JSON.stringify({
          model: VISION_MODEL,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: photoUrl
                  }
                },
                {
                  type: 'text',
                  text: FOOD_ANALYSIS_PROMPT
                }
              ]
            }
          ],
          temperature: VISION_CONFIG.temperature,
          max_tokens: VISION_CONFIG.max_tokens
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ [VISION] API error:', error);
        throw new Error(`Vision API failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from vision API');
      }

      // Parse JSON response
      const macros: MacroEstimate = JSON.parse(content);

      console.log('✅ [VISION] Analysis complete:', macros);

      return {
        success: true,
        macros
      };

    } catch (error) {
      console.error('❌ [VISION] Error analyzing photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate macro estimate (sanity checks)
   */
  validateEstimate(macros: MacroEstimate): boolean {
    // Basic sanity checks
    if (macros.calories < 0 || macros.calories > 5000) return false;
    if (macros.protein < 0 || macros.protein > 300) return false;
    if (macros.carbs < 0 || macros.carbs > 500) return false;
    if (macros.fats < 0 || macros.fats > 200) return false;

    return true;
  }
}

export const visionApiService = new VisionApiService();
