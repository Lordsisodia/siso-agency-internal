import * as fs from 'fs/promises';
import * as path from 'path';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Types for our knowledge base system
export interface Insight {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: {
    type: 'youtube' | 'document' | 'manual';
    url?: string;
    videoId?: string;
    title?: string;
    channel?: string;
  };
  extractedAt: string;
  confidence: number; // 0-1 rating of how valuable this insight is
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
}

export interface WorkflowStep {
  step: number;
  action: string;
  description: string;
  tools?: string[];
  keyPoints?: string[];
}

export interface Tool {
  name: string;
  category: string;
  purpose: string;
  pros: string[];
  cons: string[];
  useCase: string;
  alternatives?: string[];
}

export interface BestPractice {
  title: string;
  description: string;
  category: string;
  doThis: string[];
  avoidThis: string[];
  examples?: string[];
}

export class InsightExtractor {
  private knowledgeBasePath = path.join(process.cwd(), 'data/knowledge-base');

  async extractInsightsFromTranscripts() {
    console.log('🧠 Starting insight extraction from YouTube transcripts...');

    // Load all transcripts
    const masterDoc = await this.loadMasterDocument();
    const transcripts = masterDoc.transcripts.filter((t: any) => t.transcript && t.transcript.length > 100);
    
    console.log(`Found ${transcripts.length} transcripts with content`);

    const allInsights: Insight[] = [];
    let processedCount = 0;

    for (const transcript of transcripts) {
      try {
        console.log(`Processing: ${transcript.title}`);
        const insights = await this.extractInsightsFromTranscript(transcript);
        allInsights.push(...insights);
        processedCount++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to process ${transcript.title}:`, error);
      }
    }

    console.log(`✅ Extracted ${allInsights.length} insights from ${processedCount} videos`);

    // Save insights
    await this.saveInsights(allInsights);
    await this.categorizeInsights(allInsights);
    await this.generateSummaryReport(allInsights);

    return allInsights;
  }

  private async extractInsightsFromTranscript(transcript: any): Promise<Insight[]> {
    const prompt = `
Analyze this AI coding tutorial transcript and extract key insights for developers using AI coding tools like Cursor, Claude Code, etc.

Video: "${transcript.title}"
Channel: ${transcript.channel}
Transcript: ${transcript.transcript}

Extract the following types of insights:

1. WORKFLOWS - Step-by-step processes or methodologies
2. TOOLS - Specific tools, features, or configurations mentioned
3. BEST_PRACTICES - Tips, tricks, and recommended approaches  
4. TECHNIQUES - Specific coding techniques or strategies
5. PITFALLS - Common mistakes or things to avoid
6. TRENDS - Industry trends or emerging patterns

For each insight, provide:
- Title (concise, descriptive)
- Content (detailed explanation)
- Category (one of the types above)
- Key points (3-5 bullet points)
- Confidence (0.1-1.0 based on how actionable/valuable it is)

Format as JSON array with this structure:
[{
  "title": "string",
  "content": "string", 
  "category": "WORKFLOWS|TOOLS|BEST_PRACTICES|TECHNIQUES|PITFALLS|TRENDS",
  "keyPoints": ["point1", "point2", "point3"],
  "confidence": 0.8
}]

Only extract insights that are:
- Actionable for developers
- Specific to AI coding tools
- Not basic/obvious information
- Clearly explained in the transcript

Return valid JSON only.`;

    try {
      const result = await generateText({
        model: openai('gpt-4-turbo'),
        prompt,
        maxTokens: 2000,
      });

      const extractedInsights = JSON.parse(result.text);
      
      // Transform to our format
      return extractedInsights.map((insight: any, index: number) => ({
        id: `${transcript.videoId}-${index}`,
        title: insight.title,
        content: insight.content,
        category: insight.category.toLowerCase().replace('_', '-'),
        tags: this.generateTags(insight),
        source: {
          type: 'youtube' as const,
          url: transcript.url,
          videoId: transcript.videoId,
          title: transcript.title,
          channel: transcript.channel
        },
        extractedAt: new Date().toISOString(),
        confidence: insight.confidence || 0.5,
        status: 'pending' as const
      }));
    } catch (error) {
      console.error('Failed to extract insights:', error);
      return [];
    }
  }

  private generateTags(insight: any): string[] {
    const tags = new Set<string>();
    
    // Add category as tag
    tags.add(insight.category.toLowerCase());
    
    // Extract tags from content
    const content = (insight.title + ' ' + insight.content).toLowerCase();
    
    // Tool tags
    if (content.includes('cursor')) tags.add('cursor');
    if (content.includes('claude')) tags.add('claude');
    if (content.includes('copilot')) tags.add('copilot');
    if (content.includes('vscode')) tags.add('vscode');
    if (content.includes('ai')) tags.add('ai');
    if (content.includes('workflow')) tags.add('workflow');
    if (content.includes('productivity')) tags.add('productivity');
    
    return Array.from(tags);
  }

  private async loadMasterDocument() {
    const files = await fs.readdir(path.join(process.cwd(), 'data/youtube-content'));
    const masterFile = files.find(f => f.startsWith('master-document-'));
    
    if (!masterFile) {
      throw new Error('No master document found');
    }
    
    const content = await fs.readFile(
      path.join(process.cwd(), 'data/youtube-content', masterFile),
      'utf-8'
    );
    
    return JSON.parse(content);
  }

  private async saveInsights(insights: Insight[]) {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Save all insights
    await fs.writeFile(
      path.join(this.knowledgeBasePath, 'insights', `extracted-${timestamp}.json`),
      JSON.stringify(insights, null, 2)
    );

    // Save by category
    const categories = ['workflows', 'tools', 'best-practices', 'techniques', 'pitfalls', 'trends'];
    
    for (const category of categories) {
      const categoryInsights = insights.filter(i => i.category === category);
      if (categoryInsights.length > 0) {
        await fs.writeFile(
          path.join(this.knowledgeBasePath, 'categories', `${category}-${timestamp}.json`),
          JSON.stringify(categoryInsights, null, 2)
        );
      }
    }
  }

  private async categorizeInsights(insights: Insight[]) {
    const categories = {
      workflows: insights.filter(i => i.category === 'workflows'),
      tools: insights.filter(i => i.category === 'tools'),
      bestPractices: insights.filter(i => i.category === 'best-practices'),
      techniques: insights.filter(i => i.category === 'techniques'),
      pitfalls: insights.filter(i => i.category === 'pitfalls'),
      trends: insights.filter(i => i.category === 'trends')
    };

    // Create category summaries
    for (const [category, items] of Object.entries(categories)) {
      if (items.length > 0) {
        const summary = {
          category,
          count: items.length,
          highConfidence: items.filter(i => i.confidence > 0.7).length,
          topInsights: items
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5)
            .map(i => ({ title: i.title, confidence: i.confidence })),
          commonTags: this.getTopTags(items)
        };

        await fs.writeFile(
          path.join(this.knowledgeBasePath, 'categories', `${category}-summary.json`),
          JSON.stringify(summary, null, 2)
        );
      }
    }
  }

  private getTopTags(insights: Insight[]): string[] {
    const tagCounts = new Map<string, number>();
    
    insights.forEach(insight => {
      insight.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private async generateSummaryReport(insights: Insight[]) {
    const timestamp = new Date().toISOString().split('T')[0];
    
    const report = `# AI Coding Knowledge Base - ${timestamp}

## Summary
- **Total Insights**: ${insights.length}
- **High Confidence**: ${insights.filter(i => i.confidence > 0.7).length}
- **Categories**: ${new Set(insights.map(i => i.category)).size}
- **Sources**: ${new Set(insights.map(i => i.source.videoId)).size} videos

## Top Categories
${Object.entries(this.groupByCategory(insights))
  .sort((a, b) => b[1].length - a[1].length)
  .map(([category, items]) => `- **${category}**: ${items.length} insights`)
  .join('\n')}

## High-Value Insights (Confidence > 0.8)
${insights
  .filter(i => i.confidence > 0.8)
  .sort((a, b) => b.confidence - a.confidence)
  .slice(0, 10)
  .map((insight, i) => `### ${i + 1}. ${insight.title}
**Category**: ${insight.category}  
**Confidence**: ${insight.confidence}  
**Source**: [${insight.source.title}](${insight.source.url})

${insight.content}
`)
  .join('\n')}

## Most Common Tags
${this.getTopTags(insights).map(tag => `- ${tag}`).join('\n')}

## Next Steps
1. Review high-confidence insights for implementation
2. Create workflow templates from workflow insights
3. Build tool comparison matrix from tool insights
4. Document best practices for team adoption
`;

    await fs.writeFile(
      path.join(this.knowledgeBasePath, `knowledge-base-report-${timestamp}.md`),
      report
    );
  }

  private groupByCategory(insights: Insight[]): Record<string, Insight[]> {
    return insights.reduce((acc, insight) => {
      if (!acc[insight.category]) acc[insight.category] = [];
      acc[insight.category].push(insight);
      return acc;
    }, {} as Record<string, Insight[]>);
  }
}

// CLI function to run extraction
export async function runInsightExtraction() {
  const extractor = new InsightExtractor();
  
  try {
    console.log('🚀 Starting AI coding insight extraction...');
    const insights = await extractor.extractInsightsFromTranscripts();
    
    console.log(`\n✅ Extraction complete!`);
    console.log(`📊 Results:`);
    console.log(`   - ${insights.length} total insights extracted`);
    console.log(`   - ${insights.filter(i => i.confidence > 0.7).length} high-confidence insights`);
    console.log(`   - ${new Set(insights.map(i => i.category)).size} different categories`);
    console.log(`\n📁 Check data/knowledge-base/ for organized insights`);
    
  } catch (error) {
    console.error('❌ Extraction failed:', error);
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runInsightExtraction();
}