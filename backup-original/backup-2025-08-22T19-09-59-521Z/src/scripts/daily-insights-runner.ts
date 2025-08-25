#!/usr/bin/env tsx

import { collectAICodingContent } from '../youtube-scraper/youtube-collector';
import { YouTubeInsightsAnalyzer } from '../services/youtube-insights-analyzer';
import { TelegramInsightsDelivery } from '../services/telegram-insights-delivery';
import * as fs from 'fs/promises';
import * as path from 'path';

// Main orchestrator for daily insights workflow
class DailyInsightsRunner {
  private analyzer: YouTubeInsightsAnalyzer;
  private telegram: TelegramInsightsDelivery;
  private processedToday: Set<string> = new Set();

  constructor() {
    this.analyzer = new YouTubeInsightsAnalyzer();
    this.telegram = new TelegramInsightsDelivery();
  }

  async run(): Promise<void> {
    console.log('🚀 Starting daily insights extraction...');
    
    try {
      // Step 1: Collect latest YouTube content
      console.log('📺 Collecting YouTube content...');
      const collectionResult = await collectAICodingContent();
      
      // Step 2: Load existing processed videos to avoid duplicates
      await this.loadProcessedVideos();
      
      // Step 3: Filter for new/unprocessed videos
      const newVideos = collectionResult.videos.filter(video => 
        !this.processedToday.has(video.videoId) && 
        this.isRecentVideo(video.publishedTime)
      );
      
      console.log(`🔍 Found ${newVideos.length} new videos to analyze`);
      
      if (newVideos.length === 0) {
        console.log('✅ No new content found. Sending status update...');
        await this.telegram.sendMessage("📺 Daily scan complete - no new high-value content found today.");
        return;
      }

      // Step 4: Analyze transcripts with AI
      const insights = [];
      let processedCount = 0;
      
      for (const video of newVideos.slice(0, 50)) { // Limit to 50 videos daily
        try {
          console.log(`🧠 Analyzing: ${video.title}`);
          
          // Get transcript
          const transcriptPath = path.join(
            process.cwd(), 
            'data/youtube-content', 
            `transcript-${video.videoId}.json`
          );
          
          const transcriptData = await this.loadTranscript(transcriptPath);
          if (!transcriptData || !transcriptData.transcript) {
            console.log(`⏭️ Skipping ${video.videoId} - no transcript available`);
            continue;
          }

          // Analyze with AI
          const analysis = await this.analyzer.analyzeTranscript(
            transcriptData.transcript, 
            video
          );
          
          if (analysis.insights.length > 0) {
            insights.push(...analysis.insights.map(insight => ({
              ...insight,
              videoMetadata: video,
              extractedAt: new Date().toISOString()
            })));
            
            // Send breaking insights immediately for high-value content
            const breakingInsights = analysis.insights.filter(
              insight => insight.overallScore >= 8.5
            );
            
            for (const insight of breakingInsights) {
              await this.telegram.sendBreakingInsight(insight, video);
              await this.delay(2000); // Rate limiting
            }
          }
          
          this.processedToday.add(video.videoId);
          processedCount++;
          
          // Rate limiting to avoid overwhelming APIs
          await this.delay(1500);
          
        } catch (error) {
          console.error(`❌ Failed to analyze ${video.videoId}:`, error);
        }
      }

      // Step 5: Save processing state
      await this.saveProcessedVideos();
      
      // Step 6: Send daily digest
      console.log(`📊 Sending daily digest with ${insights.length} insights...`);
      await this.telegram.sendDailyDigest();
      
      // Step 7: Generate summary report
      await this.generateSummaryReport(processedCount, insights.length, newVideos.length);
      
      console.log('✅ Daily insights extraction complete!');
      
    } catch (error) {
      console.error('💥 Daily insights extraction failed:', error);
      await this.telegram.sendMessage(`❌ Daily insights extraction failed: ${error.message}`);
      throw error;
    }
  }

  // Load transcript from saved file
  private async loadTranscript(transcriptPath: string): Promise<any> {
    try {
      const content = await fs.readFile(transcriptPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  // Check if video is recent (last 24-48 hours)
  private isRecentVideo(publishedTime: string): boolean {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
    
    // Parse relative time strings from YouTube
    if (publishedTime.includes('hour') || publishedTime.includes('day')) {
      return true;
    }
    
    if (publishedTime.includes('week')) {
      const weeks = parseInt(publishedTime.match(/\d+/)?.[0] || '1');
      return weeks <= 1;
    }
    
    return false;
  }

  // Load processed videos to avoid duplicates
  private async loadProcessedVideos(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const processedFile = path.join(
      process.cwd(), 
      'data/youtube-content', 
      `processed-${today}.json`
    );
    
    try {
      const content = await fs.readFile(processedFile, 'utf-8');
      const processed = JSON.parse(content);
      this.processedToday = new Set(processed);
    } catch (error) {
      // File doesn't exist, start fresh
      this.processedToday = new Set();
    }
  }

  // Save processed videos state
  private async saveProcessedVideos(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const processedFile = path.join(
      process.cwd(), 
      'data/youtube-content', 
      `processed-${today}.json`
    );
    
    await fs.writeFile(
      processedFile, 
      JSON.stringify(Array.from(this.processedToday), null, 2)
    );
  }

  // Generate summary report for logging
  private async generateSummaryReport(
    processedCount: number, 
    insightsCount: number, 
    totalNewVideos: number
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const report = {
      date: today,
      executedAt: new Date().toISOString(),
      statistics: {
        totalNewVideos,
        videosProcessed: processedCount,
        insightsExtracted: insightsCount,
        processingRate: processedCount / totalNewVideos,
        insightsPerVideo: insightsCount / Math.max(processedCount, 1)
      },
      performance: {
        executionTimeMs: Date.now(), // Would calculate actual time
        avgProcessingTimePerVideo: 'N/A', // Would calculate
        apiCallsUsed: processedCount,
        estimatedCost: `$${(processedCount * 0.02).toFixed(2)}`
      },
      status: 'SUCCESS'
    };

    const reportPath = path.join(
      process.cwd(), 
      'data/youtube-content', 
      `execution-report-${today}.json`
    );
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Execution report saved: ${reportPath}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Enhanced search queries for agency-specific content
export const ENHANCED_SEARCH_QUERIES = [
  // Core AI coding tools
  { query: 'claude code tutorial 2024', uploadDate: 'today' as const },
  { query: 'cursor ai development tips', uploadDate: 'today' as const },
  { query: 'ai coding productivity hacks', uploadDate: 'today' as const },
  
  // Agency business focus
  { query: 'software agency business model', uploadDate: 'week' as const },
  { query: 'client onboarding automation', uploadDate: 'week' as const },
  { query: 'agency workflow optimization', uploadDate: 'week' as const },
  
  // Technical trends
  { query: 'full stack development 2024', uploadDate: 'week' as const },
  { query: 'react typescript best practices', uploadDate: 'week' as const },
  { query: 'supabase development tips', uploadDate: 'week' as const },
  
  // Emerging tools
  { query: 'windsurf ide vs cursor', uploadDate: 'week' as const },
  { query: 'bolt.new tutorial', uploadDate: 'week' as const },
  { query: 'v0 by vercel tutorial', uploadDate: 'week' as const },
  
  // Business strategy
  { query: 'software agency pricing strategy', uploadDate: 'month' as const },
  { query: 'saas development timeline', uploadDate: 'month' as const },
  { query: 'client acquisition for agencies', uploadDate: 'month' as const }
];

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new DailyInsightsRunner();
  
  console.log('🎯 SISO Agency - Daily YouTube Insights System');
  console.log('⏰ Execution time:', new Date().toLocaleString());
  
  runner.run()
    .then(() => {
      console.log('✅ Execution completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Execution failed:', error);
      process.exit(1);
    });
}