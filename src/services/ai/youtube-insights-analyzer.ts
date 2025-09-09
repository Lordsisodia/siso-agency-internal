import { createClient } from '@supabase/supabase-js';

// AI Analysis Service for YouTube Insights
export class YouTubeInsightsAnalyzer {
  private supabase;
  private claudeApiKey: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    this.claudeApiKey = process.env.CLAUDE_API_KEY!;
  }

  // Main analysis function
  async analyzeTranscript(transcript: string, videoMetadata: VideoMetadata): Promise<AnalysisResult> {
    try {
      const analysis = await this.callClaudeAPI(transcript);
      const insights = this.extractInsights(analysis);
      const scoredInsights = this.scoreInsights(insights);
      
      await this.saveToDatabase(videoMetadata, transcript, analysis, scoredInsights);
      
      return {
        insights: scoredInsights,
        analysis: analysis,
        relevanceScore: this.calculateOverallRelevance(scoredInsights)
      };
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  // Claude API integration
  private async callClaudeAPI(transcript: string): Promise<string> {
    const prompt = this.buildAnalysisPrompt(transcript);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    const data = await response.json();
    return data.content[0].text;
  }

  // Build analysis prompt
  private buildAnalysisPrompt(transcript: string): string {
    return `
Analyze this YouTube transcript for a software development agency. Extract actionable insights that could help grow the business or improve operations.

TRANSCRIPT:
${transcript}

Please analyze and extract insights in these categories:

1. BUSINESS STRATEGY
   - Pricing models, service offerings
   - Client acquisition techniques
   - Revenue optimization
   - Market positioning

2. TECHNICAL TOOLS
   - New frameworks, libraries, platforms
   - AI/automation tools
   - Development workflows
   - Infrastructure solutions

3. PRODUCTIVITY HACKS
   - Time-saving techniques
   - Process improvements
   - Team efficiency methods
   - Workflow optimizations

4. INDUSTRY TRENDS
   - Market shifts and opportunities
   - Emerging technologies
   - Future predictions
   - Competitive landscape

5. EDUCATIONAL CONTENT
   - Tutorials and how-tos
   - Best practices
   - Case studies
   - Learning resources

For each insight, provide:
- Category (one of the 5 above)
- Title (concise, actionable)
- Summary (2-3 sentences)
- Importance score (1-10 for agency relevance)
- Implementation difficulty (Easy/Medium/Hard)
- Estimated impact (Low/Medium/High)
- Specific action items
- Timeline to implement

Format as JSON:
{
  "insights": [
    {
      "category": "BUSINESS_STRATEGY",
      "title": "Insight title",
      "summary": "Brief description",
      "importanceScore": 8,
      "difficulty": "Medium",
      "impact": "High",
      "actionItems": ["Step 1", "Step 2"],
      "timeline": "2-4 weeks"
    }
  ],
  "overallValue": "High/Medium/Low",
  "keyTakeaway": "Main lesson for agencies"
}

Only include insights with importance score 6 or higher.
`;
  }

  // Extract structured insights from Claude response
  private extractInsights(analysis: string): Insight[] {
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in analysis');
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.insights || [];
    } catch (error) {
      console.error('Failed to parse insights:', error);
      return [];
    }
  }

  // Score insights for relevance and quality
  private scoreInsights(insights: Insight[]): ScoredInsight[] {
    return insights.map(insight => ({
      ...insight,
      relevanceScore: this.calculateRelevanceScore(insight),
      noveltyScore: this.calculateNoveltyScore(insight),
      actionabilityScore: this.calculateActionabilityScore(insight),
      overallScore: this.calculateOverallScore(insight)
    }));
  }

  private calculateRelevanceScore(insight: Insight): number {
    let score = insight.importanceScore;
    
    // Boost business and technical insights
    if (insight.category === 'BUSINESS_STRATEGY') score += 1;
    if (insight.category === 'TECHNICAL_TOOLS') score += 0.5;
    
    // Boost high-impact insights
    if (insight.impact === 'High') score += 1;
    if (insight.impact === 'Medium') score += 0.5;
    
    return Math.min(score, 10);
  }

  private calculateNoveltyScore(insight: Insight): number {
    // Check against recently processed insights for novelty
    // This would require database lookup in real implementation
    return 7; // Placeholder
  }

  private calculateActionabilityScore(insight: Insight): number {
    let score = 5;
    
    // Easy implementation gets higher score
    if (insight.difficulty === 'Easy') score += 3;
    if (insight.difficulty === 'Medium') score += 1;
    if (insight.difficulty === 'Hard') score -= 1;
    
    // More action items = more actionable
    score += Math.min(insight.actionItems.length, 3);
    
    return Math.min(score, 10);
  }

  private calculateOverallScore(insight: Insight): number {
    const relevance = this.calculateRelevanceScore(insight);
    const novelty = this.calculateNoveltyScore(insight);
    const actionability = this.calculateActionabilityScore(insight);
    
    // Weighted average
    return Math.round((relevance * 0.4 + novelty * 0.3 + actionability * 0.3) * 10) / 10;
  }

  private calculateOverallRelevance(insights: ScoredInsight[]): number {
    if (insights.length === 0) return 0;
    
    const totalScore = insights.reduce((sum, insight) => sum + insight.overallScore, 0);
    return Math.round((totalScore / insights.length) * 10) / 10;
  }

  // Save analysis results to database
  private async saveToDatabase(
    videoMetadata: VideoMetadata,
    transcript: string,
    analysis: string,
    insights: ScoredInsight[]
  ): Promise<void> {
    const { error } = await this.supabase
      .from('youtube_insights')
      .insert({
        video_id: videoMetadata.videoId,
        video_title: videoMetadata.title,
        channel_name: videoMetadata.channel,
        published_at: new Date(videoMetadata.publishedTime),
        transcript_text: transcript,
        ai_analysis: analysis,
        insights: insights,
        relevance_score: this.calculateOverallRelevance(insights),
        category: this.getPrimaryCategory(insights)
      });

    if (error) {
      console.error('Database save failed:', error);
      throw error;
    }
  }

  private getPrimaryCategory(insights: ScoredInsight[]): string {
    if (insights.length === 0) return 'UNKNOWN';
    
    const categoryScores: { [key: string]: number } = {};
    
    insights.forEach(insight => {
      if (!categoryScores[insight.category]) {
        categoryScores[insight.category] = 0;
      }
      categoryScores[insight.category] += insight.overallScore;
    });

    return Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  // Get daily insights for Telegram delivery
  async getDailyInsights(date: string): Promise<DailyDigest> {
    const { data: insights, error } = await this.supabase
      .from('youtube_insights')
      .select('*')
      .gte('processed_at', `${date}T00:00:00Z`)
      .lt('processed_at', `${date}T23:59:59Z`)
      .order('relevance_score', { ascending: false });

    if (error) throw error;

    const topInsights = insights
      .flatMap(record => record.insights)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5);

    return {
      date,
      totalVideos: insights.length,
      totalInsights: insights.reduce((sum, record) => sum + record.insights.length, 0),
      topInsights,
      categories: this.groupByCategory(topInsights),
      avgRelevanceScore: insights.reduce((sum, record) => sum + record.relevance_score, 0) / insights.length
    };
  }

  private groupByCategory(insights: ScoredInsight[]): { [category: string]: ScoredInsight[] } {
    return insights.reduce((groups, insight) => {
      if (!groups[insight.category]) {
        groups[insight.category] = [];
      }
      groups[insight.category].push(insight);
      return groups;
    }, {} as { [category: string]: ScoredInsight[] });
  }
}

// Type definitions
interface VideoMetadata {
  videoId: string;
  title: string;
  channel: string;
  publishedTime: string;
  viewCount: string;
  duration: string;
  url: string;
}

interface Insight {
  category: string;
  title: string;
  summary: string;
  importanceScore: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  impact: 'Low' | 'Medium' | 'High';
  actionItems: string[];
  timeline: string;
}

interface ScoredInsight extends Insight {
  relevanceScore: number;
  noveltyScore: number;
  actionabilityScore: number;
  overallScore: number;
}

interface AnalysisResult {
  insights: ScoredInsight[];
  analysis: string;
  relevanceScore: number;
}

interface DailyDigest {
  date: string;
  totalVideos: number;
  totalInsights: number;
  topInsights: ScoredInsight[];
  categories: { [category: string]: ScoredInsight[] };
  avgRelevanceScore: number;
}