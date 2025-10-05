
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// [Analysis] Define the shape of our summary data
interface ArticleSummary {
  summary: string;
  keyPoints?: string[];
  applications?: string[];
  sentiment?: string;
}

export function useAiArticleSummary() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<ArticleSummary | null>(null);
  const { toast } = useToast();

  // [Framework] Reuse existing edge function for consistency
  const generateSummary = useCallback(async (title: string, content: string) => {
    if (!title || !content) {
      toast({
        title: "Cannot generate summary",
        description: "Article content or title is missing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSummary(null);

    try {
      // [Analysis] Use our existing chat-with-assistant edge function to generate the summary
      const systemPrompt = `You are an AI specialized in summarizing AI news articles. 
      Analyze the provided article and create a concise summary with these components:
      1. A 2-3 sentence summary of the key information
      2. 3-5 bullet points of the most important details
      3. 2-3 potential applications or implications for AI agencies
      4. A sentiment assessment (positive, negative, or neutral)
      
      Format your response as valid JSON with these keys: summary, keyPoints (array), applications (array), sentiment (string)`;

      const message = `Here is an AI news article to summarize:
      
      Title: ${title}
      
      Content: ${content}`;

      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: { 
          message, 
          systemPrompt,
          model: 'gpt-4o-mini' // [Plan] Use smaller model for faster response and lower cost
        }
      });

      if (error) throw new Error(error.message);

      // Try to parse the response as JSON
      try {
        const jsonResponse = JSON.parse(data.response);
        setSummary(jsonResponse);
      } catch (parseError) {
        // If parsing fails, use the raw response as the summary
        console.error('Failed to parse AI response as JSON:', parseError);
        setSummary({
          summary: data.response,
        });
      }
    } catch (error) {
      console.error('Error generating article summary:', error);
      toast({
        title: "Error generating summary",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    summary,
    generateSummary,
    resetSummary: () => setSummary(null)
  };
}
