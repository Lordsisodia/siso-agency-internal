import * as fs from 'fs/promises';
import * as path from 'path';
import { Insight } from './insight-extractor';

export class KnowledgeBaseManager {
  private basePath = path.join(process.cwd(), 'data/knowledge-base');

  async searchInsights(query: string, filters?: {
    category?: string;
    minConfidence?: number;
    tags?: string[];
  }): Promise<Insight[]> {
    const allInsights = await this.getAllInsights();
    
    return allInsights.filter(insight => {
      // Text search
      const searchText = `${insight.title} ${insight.content}`.toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase());
      
      // Category filter
      const matchesCategory = !filters?.category || insight.category === filters.category;
      
      // Confidence filter
      const matchesConfidence = !filters?.minConfidence || insight.confidence >= filters.minConfidence;
      
      // Tags filter
      const matchesTags = !filters?.tags || filters.tags.some(tag => insight.tags.includes(tag));
      
      return matchesQuery && matchesCategory && matchesConfidence && matchesTags;
    });
  }

  async getInsightsByCategory(category: string): Promise<Insight[]> {
    const allInsights = await this.getAllInsights();
    return allInsights
      .filter(insight => insight.category === category)
      .sort((a, b) => b.confidence - a.confidence);
  }

  async getTopInsights(limit: number = 10): Promise<Insight[]> {
    const allInsights = await this.getAllInsights();
    return allInsights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  async getAllInsights(): Promise<Insight[]> {
    try {
      const insightsDir = path.join(this.basePath, 'insights');
      const files = await fs.readdir(insightsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const allInsights: Insight[] = [];
      
      for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(insightsDir, file), 'utf-8');
        const insights = JSON.parse(content);
        allInsights.push(...insights);
      }
      
      return allInsights;
    } catch (error) {
      console.error('Error loading insights:', error);
      return [];
    }
  }

  async getStats() {
    const insights = await this.getAllInsights();
    
    const categories = new Map<string, number>();
    const tags = new Map<string, number>();
    const sources = new Map<string, number>();
    
    insights.forEach(insight => {
      // Count categories
      categories.set(insight.category, (categories.get(insight.category) || 0) + 1);
      
      // Count tags
      insight.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
      
      // Count sources
      const sourceType = insight.source.type;
      sources.set(sourceType, (sources.get(sourceType) || 0) + 1);
    });
    
    return {
      total: insights.length,
      highConfidence: insights.filter(i => i.confidence > 0.8).length,
      mediumConfidence: insights.filter(i => i.confidence > 0.6 && i.confidence <= 0.8).length,
      lowConfidence: insights.filter(i => i.confidence <= 0.6).length,
      approved: insights.filter(i => i.status === 'approved').length,
      pending: insights.filter(i => i.status === 'pending').length,
      categories: Object.fromEntries(
        Array.from(categories.entries()).sort((a, b) => b[1] - a[1])
      ),
      topTags: Object.fromEntries(
        Array.from(tags.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
      ),
      sources: Object.fromEntries(sources.entries())
    };
  }

  async approveInsight(insightId: string): Promise<boolean> {
    return this.updateInsightStatus(insightId, 'approved');
  }

  async rejectInsight(insightId: string): Promise<boolean> {
    return this.updateInsightStatus(insightId, 'rejected');
  }

  private async updateInsightStatus(insightId: string, status: 'approved' | 'rejected'): Promise<boolean> {
    try {
      const insightsDir = path.join(this.basePath, 'insights');
      const files = await fs.readdir(insightsDir);
      
      for (const file of files.filter(f => f.endsWith('.json'))) {
        const filePath = path.join(insightsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const insights = JSON.parse(content);
        
        const updated = insights.map((insight: Insight) => {
          if (insight.id === insightId) {
            return { ...insight, status };
          }
          return insight;
        });
        
        if (JSON.stringify(updated) !== JSON.stringify(insights)) {
          await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error updating insight status:', error);
      return false;
    }
  }

  async exportKnowledgeBase(format: 'json' | 'markdown' = 'json') {
    const insights = await this.getAllInsights();
    const stats = await this.getStats();
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'json') {
      const exportData = {
        exportDate: new Date().toISOString(),
        stats,
        insights: insights.filter(i => i.status === 'approved' || i.confidence > 0.7)
      };
      
      const exportPath = path.join(this.basePath, `export-${timestamp}.json`);
      await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
      return exportPath;
    } else {
      // Markdown export
      const markdown = this.generateMarkdownReport(insights, stats);
      const exportPath = path.join(this.basePath, `knowledge-base-${timestamp}.md`);
      await fs.writeFile(exportPath, markdown);
      return exportPath;
    }
  }

  private generateMarkdownReport(insights: Insight[], stats: any): string {
    const highValueInsights = insights
      .filter(i => i.confidence > 0.8)
      .sort((a, b) => b.confidence - a.confidence);

    return `# AI Coding Knowledge Base

## Statistics
- **Total Insights**: ${stats.total}
- **High Confidence**: ${stats.highConfidence}
- **Approved**: ${stats.approved}
- **Pending Review**: ${stats.pending}

## Categories
${Object.entries(stats.categories)
  .map(([category, count]) => `- **${category}**: ${count} insights`)
  .join('\n')}

## Top Tags
${Object.entries(stats.topTags)
  .map(([tag, count]) => `- ${tag} (${count})`)
  .join('\n')}

## High-Value Insights

${highValueInsights.slice(0, 20).map((insight, i) => `
### ${i + 1}. ${insight.title}

**Category**: ${insight.category}  
**Confidence**: ${insight.confidence}  
**Tags**: ${insight.tags.join(', ')}  
**Source**: [${insight.source.title}](${insight.source.url})

${insight.content}

---
`).join('\n')}

## All Insights by Category

${Object.keys(stats.categories).map(category => `
## ${category.toUpperCase()}

${insights
  .filter(i => i.category === category)
  .sort((a, b) => b.confidence - a.confidence)
  .map(insight => `### ${insight.title}
**Confidence**: ${insight.confidence}  
**Tags**: ${insight.tags.join(', ')}

${insight.content}

**Source**: [${insight.source.title}](${insight.source.url})
`)
  .join('\n')}
`).join('\n')}
`;
  }
}

// CLI interface
export async function runKnowledgeBaseCommand(command: string, ...args: string[]) {
  const manager = new KnowledgeBaseManager();
  
  switch (command) {
    case 'stats':
      const stats = await manager.getStats();
      console.log('📊 Knowledge Base Statistics:');
      console.log(`Total Insights: ${stats.total}`);
      console.log(`High Confidence: ${stats.highConfidence}`);
      console.log(`Categories:`, stats.categories);
      break;
      
    case 'search':
      const query = args[0];
      if (!query) {
        console.log('Usage: search <query>');
        return;
      }
      const results = await manager.searchInsights(query);
      console.log(`Found ${results.length} insights matching "${query}"`);
      results.slice(0, 5).forEach(insight => {
        console.log(`- ${insight.title} (${insight.confidence})`);
      });
      break;
      
    case 'export':
      const format = (args[0] as 'json' | 'markdown') || 'markdown';
      const exportPath = await manager.exportKnowledgeBase(format);
      console.log(`📄 Exported to: ${exportPath}`);
      break;
      
    case 'top':
      const limit = parseInt(args[0]) || 10;
      const topInsights = await manager.getTopInsights(limit);
      console.log(`🏆 Top ${limit} Insights:`);
      topInsights.forEach((insight, i) => {
        console.log(`${i + 1}. ${insight.title} (${insight.confidence})`);
      });
      break;
      
    default:
      console.log(`
Available commands:
  stats              - Show knowledge base statistics
  search <query>     - Search insights
  export [format]    - Export knowledge base (json|markdown)
  top [limit]        - Show top insights
      `);
  }
}

// Run CLI if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  runKnowledgeBaseCommand(command, ...args);
}