import { YoutubeTranscript } from 'youtube-transcript';
import * as fs from 'fs/promises';
import * as path from 'path';

// Enhanced Claude Tips Extractor - Actually get the transcripts and extract actionable tips
export class ClaudeTipsExtractor {
  private claudeApiKey: string;

  constructor() {
    this.claudeApiKey = process.env.CLAUDE_API_KEY!;
  }

  // High-value videos specifically for Claude agent optimization
  private static HIGH_VALUE_VIDEOS = [
    {
      videoId: 'wsIb_EdhcY8',
      title: 'My New AI Coding Workflow To Build Apps Fast (Goodbye Cursor, Hello Claude Code)',
      channel: 'Your Average Tech Bro',
      priority: 'CRITICAL'
    },
    {
      videoId: 'jCUrp3S3hho', 
      title: 'Cursor vs. Claude Code (Mid-2025): The Brutal, Honest Truth',
      channel: 'Leonardo Grigorio | AI Automation',
      priority: 'HIGH'
    },
    {
      videoId: '6Rg5M69bMgQ',
      title: 'Claude Engineer is INSANE... Upgrade Your Claude Code Workflow', 
      channel: 'AI LABS',
      priority: 'CRITICAL'
    },
    {
      videoId: 'rJmjdGiZJ3U',
      title: 'You Won\'t Believe What Cursor AI Just Did (NEW UPDATE)',
      channel: 'Robin Ebers', 
      priority: 'HIGH'
    },
    {
      videoId: 'tm94DULupNc',
      title: 'How I use Claude Code (+ my best tips)',
      channel: 'Matt Maher',
      priority: 'CRITICAL'
    },
    {
      videoId: 'fkQrySWqUa0',
      title: 'Master Claude Code in 14 Minutes (8 Steps)',
      channel: 'Matt Maher',
      priority: 'CRITICAL'
    },
    {
      videoId: 'U8bZwtp5PAQ',
      title: 'The ULTIMATE AI Coding Guide for Developers (Claude Code)',
      channel: 'Matt Maher', 
      priority: 'CRITICAL'
    },
    {
      videoId: 'sy9uTzB8Y0w',
      title: 'Claude Code is insane (3 tips how to use it)',
      channel: 'AI LABS',
      priority: 'HIGH'
    }
  ];

  // Extract transcripts and analyze for Claude agent tips
  async extractClaudeAgentTips(): Promise<ClaudeAgentTips> {
    console.log('🧠 Starting Claude Agent Tips Extraction...');
    
    const allTips: ExtractedTip[] = [];
    const failedExtractions: string[] = [];

    for (const video of ClaudeTipsExtractor.HIGH_VALUE_VIDEOS) {
      try {
        console.log(`📺 Processing: ${video.title}`);
        
        // Get actual transcript
        const transcript = await this.getActualTranscript(video.videoId);
        if (!transcript) {
          failedExtractions.push(video.videoId);
          continue;
        }

        // Analyze with Claude for agent optimization tips
        const tips = await this.analyzeForAgentTips(transcript, video);
        allTips.push(...tips);
        
        // Save individual analysis
        await this.saveVideoAnalysis(video.videoId, transcript, tips);
        
        // Rate limiting
        await this.delay(2000);
        
      } catch (error) {
        console.error(`❌ Failed to process ${video.videoId}:`, error);
        failedExtractions.push(video.videoId);
      }
    }

    // Consolidate and rank tips
    const consolidatedTips = await this.consolidateAndRankTips(allTips);
    
    // Save master tips document
    await this.saveMasterTipsDocument(consolidatedTips);
    
    return {
      totalVideosProcessed: ClaudeTipsExtractor.HIGH_VALUE_VIDEOS.length - failedExtractions.length,
      totalTipsExtracted: allTips.length,
      consolidatedTips,
      failedExtractions
    };
  }

  // Actually get the transcript using youtube-transcript
  private async getActualTranscript(videoId: string): Promise<string | null> {
    try {
      const transcriptSegments = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (!transcriptSegments || transcriptSegments.length === 0) {
        console.log(`⚠️ No transcript available for ${videoId}`);
        return null;
      }

      // Combine segments into full text
      const fullTranscript = transcriptSegments
        .map(segment => segment.text)
        .join(' ')
        .replace(/\[.*?\]/g, '') // Remove [Music], [Applause] etc
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      console.log(`✅ Extracted transcript for ${videoId}: ${fullTranscript.length} characters`);
      return fullTranscript;
      
    } catch (error) {
      console.error(`Failed to get transcript for ${videoId}:`, error);
      return null;
    }
  }

  // Analyze transcript with Claude for agent optimization tips
  private async analyzeForAgentTips(transcript: string, videoMetadata: any): Promise<ExtractedTip[]> {
    const prompt = `
Analyze this YouTube transcript to extract SPECIFIC, ACTIONABLE tips for optimizing Claude AI agents and coding workflows.

VIDEO: "${videoMetadata.title}" by ${videoMetadata.channel}

TRANSCRIPT:
${transcript}

Extract tips in these categories:

1. PROMPTING STRATEGIES
   - Specific prompt templates or patterns
   - Context setup techniques
   - How to structure requests for better results

2. WORKFLOW OPTIMIZATION  
   - Step-by-step processes mentioned
   - Integration patterns with other tools
   - Efficiency techniques

3. CLAUDE-SPECIFIC FEATURES
   - Mentions of Claude Code features
   - Artifacts usage patterns
   - MCP server integration

4. ERROR HANDLING & DEBUGGING
   - How to handle AI mistakes
   - Debugging strategies
   - Recovery techniques

5. PRODUCTIVITY HACKS
   - Time-saving techniques
   - Automation strategies
   - Multi-tasking approaches

For each tip, provide:
- Category (one of the 5 above)
- Tip title (specific and actionable)
- Description (2-3 sentences)
- Implementation steps (bullet points)
- Difficulty level (Beginner/Intermediate/Advanced)
- Impact level (High/Medium/Low)
- Quote from transcript (if available)

Format as JSON:
{
  "tips": [
    {
      "category": "PROMPTING_STRATEGIES",
      "title": "Specific tip title",
      "description": "Clear description of the technique",
      "implementation": ["Step 1", "Step 2", "Step 3"],
      "difficulty": "Intermediate",
      "impact": "High",
      "quote": "Exact quote from transcript",
      "timestamp": "Approximate time in video if mentioned"
    }
  ],
  "keyInsights": ["Main insight 1", "Main insight 2"],
  "overallValue": "High/Medium/Low"
}

ONLY extract tips that are SPECIFIC and ACTIONABLE. Ignore general statements.
Focus on techniques that can be immediately implemented to improve Claude agent performance.
`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      const data = await response.json();
      const analysis = data.content[0].text;
      
      // Extract JSON from response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in Claude response');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.tips.map((tip: any) => ({
        ...tip,
        videoSource: videoMetadata,
        extractedAt: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Failed to analyze transcript with Claude:', error);
      return [];
    }
  }

  // Consolidate and rank tips by importance and uniqueness
  private async consolidateAndRankTips(allTips: ExtractedTip[]): Promise<ConsolidatedTips> {
    // Group by category
    const categories: { [key: string]: ExtractedTip[] } = {};
    
    allTips.forEach(tip => {
      if (!categories[tip.category]) {
        categories[tip.category] = [];
      }
      categories[tip.category].push(tip);
    });

    // Rank tips within each category
    const rankedCategories: { [key: string]: ExtractedTip[] } = {};
    
    for (const [category, tips] of Object.entries(categories)) {
      rankedCategories[category] = tips
        .sort((a, b) => {
          // Sort by impact first, then difficulty (easier first for same impact)
          const impactScore = { 'High': 3, 'Medium': 2, 'Low': 1 };
          const difficultyScore = { 'Beginner': 3, 'Intermediate': 2, 'Advanced': 1 };
          
          const aScore = impactScore[a.impact] * 10 + difficultyScore[a.difficulty];
          const bScore = impactScore[b.impact] * 10 + difficultyScore[b.difficulty];
          
          return bScore - aScore;
        })
        .slice(0, 8); // Top 8 per category
    }

    // Create top overall tips
    const topOverallTips = allTips
      .filter(tip => tip.impact === 'High')
      .sort((a, b) => {
        const difficultyScore = { 'Beginner': 3, 'Intermediate': 2, 'Advanced': 1 };
        return difficultyScore[b.difficulty] - difficultyScore[a.difficulty];
      })
      .slice(0, 15);

    return {
      byCategory: rankedCategories,
      topOverall: topOverallTips,
      statistics: {
        totalTips: allTips.length,
        highImpactTips: allTips.filter(t => t.impact === 'High').length,
        beginnerFriendly: allTips.filter(t => t.difficulty === 'Beginner').length,
        categoryCounts: Object.entries(categories).map(([cat, tips]) => ({
          category: cat,
          count: tips.length
        }))
      }
    };
  }

  // Save individual video analysis
  private async saveVideoAnalysis(videoId: string, transcript: string, tips: ExtractedTip[]): Promise<void> {
    const analysis = {
      videoId,
      extractedAt: new Date().toISOString(),
      transcriptLength: transcript.length,
      tipsExtracted: tips.length,
      transcript: transcript.substring(0, 5000) + '...', // First 5k chars
      tips
    };

    const outputDir = path.join(process.cwd(), 'data/claude-tips');
    await fs.mkdir(outputDir, { recursive: true });
    
    await fs.writeFile(
      path.join(outputDir, `analysis-${videoId}.json`),
      JSON.stringify(analysis, null, 2)
    );
  }

  // Save master tips document
  private async saveMasterTipsDocument(consolidatedTips: ConsolidatedTips): Promise<void> {
    const outputDir = path.join(process.cwd(), 'data/claude-tips');
    await fs.mkdir(outputDir, { recursive: true });

    // JSON format
    await fs.writeFile(
      path.join(outputDir, 'claude-agent-tips-master.json'),
      JSON.stringify(consolidatedTips, null, 2)
    );

    // Markdown format for easy reading
    const markdown = this.generateTipsMarkdown(consolidatedTips);
    await fs.writeFile(
      path.join(outputDir, 'claude-agent-tips-master.md'),
      markdown
    );

    console.log(`📋 Master tips document saved to: ${outputDir}`);
  }

  // Generate readable markdown from tips
  private generateTipsMarkdown(tips: ConsolidatedTips): string {
    const categoryEmojis: { [key: string]: string } = {
      'PROMPTING_STRATEGIES': '🎯',
      'WORKFLOW_OPTIMIZATION': '⚡',
      'CLAUDE_SPECIFIC_FEATURES': '🤖',
      'ERROR_HANDLING_DEBUGGING': '🐛',
      'PRODUCTIVITY_HACKS': '🚀'
    };

    let markdown = `# Claude Agent Optimization Tips\n\n`;
    markdown += `*Extracted from ${tips.statistics.totalTips} tips across high-value YouTube content*\n\n`;
    
    markdown += `## 📊 Statistics\n`;
    markdown += `- **Total Tips Extracted**: ${tips.statistics.totalTips}\n`;
    markdown += `- **High Impact Tips**: ${tips.statistics.highImpactTips}\n`;
    markdown += `- **Beginner Friendly**: ${tips.statistics.beginnerFriendly}\n\n`;

    markdown += `## 🏆 Top Overall Tips\n\n`;
    tips.topOverall.slice(0, 10).forEach((tip, index) => {
      const emoji = categoryEmojis[tip.category] || '💡';
      markdown += `### ${index + 1}. ${emoji} ${tip.title}\n\n`;
      markdown += `**Category**: ${tip.category.replace(/_/g, ' ')}\n`;
      markdown += `**Impact**: ${tip.impact} | **Difficulty**: ${tip.difficulty}\n\n`;
      markdown += `${tip.description}\n\n`;
      markdown += `**Implementation**:\n`;
      tip.implementation.forEach(step => {
        markdown += `- ${step}\n`;
      });
      if (tip.quote) {
        markdown += `\n*"${tip.quote}"*\n`;
      }
      markdown += `\n---\n\n`;
    });

    // Category sections
    Object.entries(tips.byCategory).forEach(([category, categoryTips]) => {
      const emoji = categoryEmojis[category] || '📋';
      markdown += `## ${emoji} ${category.replace(/_/g, ' ')}\n\n`;
      
      categoryTips.slice(0, 5).forEach((tip, index) => {
        markdown += `### ${index + 1}. ${tip.title}\n\n`;
        markdown += `**Impact**: ${tip.impact} | **Difficulty**: ${tip.difficulty}\n\n`;
        markdown += `${tip.description}\n\n`;
        markdown += `**Steps**:\n`;
        tip.implementation.forEach(step => {
          markdown += `- ${step}\n`;
        });
        if (tip.quote) {
          markdown += `\n*"${tip.quote}"*\n`;
        }
        markdown += `\n`;
      });
      markdown += `\n`;
    });

    return markdown;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Type definitions
interface ExtractedTip {
  category: string;
  title: string;
  description: string;
  implementation: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  impact: 'High' | 'Medium' | 'Low';
  quote?: string;
  timestamp?: string;
  videoSource: any;
  extractedAt: string;
}

interface ConsolidatedTips {
  byCategory: { [key: string]: ExtractedTip[] };
  topOverall: ExtractedTip[];
  statistics: {
    totalTips: number;
    highImpactTips: number;
    beginnerFriendly: number;
    categoryCounts: { category: string; count: number }[];
  };
}

interface ClaudeAgentTips {
  totalVideosProcessed: number;
  totalTipsExtracted: number;
  consolidatedTips: ConsolidatedTips;
  failedExtractions: string[];
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎯 Claude Agent Tips Extractor');
  console.log('🧠 Extracting actionable tips from YouTube content...');
  
  const extractor = new ClaudeTipsExtractor();
  
  extractor.extractClaudeAgentTips()
    .then(result => {
      console.log('\n✅ Extraction Complete!');
      console.log(`📊 Videos Processed: ${result.totalVideosProcessed}`);
      console.log(`💡 Tips Extracted: ${result.totalTipsExtracted}`);
      console.log(`🏆 High Impact Tips: ${result.consolidatedTips.statistics.highImpactTips}`);
      console.log(`📋 Tips saved to: data/claude-tips/`);
    })
    .catch(error => {
      console.error('💥 Extraction failed:', error);
      process.exit(1);
    });
}