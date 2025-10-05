#!/usr/bin/env tsx

import { YoutubeTranscript } from 'youtube-transcript';
import * as fs from 'fs/promises';
import * as path from 'path';

// Manual tips collector - extract from individual videos with debugging
export class ManualTipsCollector {
  
  // Test with a single video first
  async testSingleVideo(videoId: string): Promise<void> {
    console.log(`🧪 Testing transcript extraction for: ${videoId}`);
    
    try {
      // Try multiple methods
      console.log('Method 1: Direct youtube-transcript');
      const transcript1 = await YoutubeTranscript.fetchTranscript(videoId);
      console.log(`Result 1: ${transcript1?.length || 0} segments`);
      
      if (transcript1 && transcript1.length > 0) {
        const fullText = transcript1.map(t => t.text).join(' ');
        console.log(`✅ Success! Transcript length: ${fullText.length} characters`);
        console.log(`First 200 chars: ${fullText.substring(0, 200)}...`);
        
        // Save the working transcript
        await this.saveWorkingTranscript(videoId, transcript1, fullText);
        return;
      }

      // Try with language parameters
      console.log('Method 2: With lang parameter');
      const transcript2 = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
      console.log(`Result 2: ${transcript2?.length || 0} segments`);
      
      if (transcript2 && transcript2.length > 0) {
        const fullText = transcript2.map(t => t.text).join(' ');
        console.log(`✅ Success with lang! Transcript length: ${fullText.length} characters`);
        await this.saveWorkingTranscript(videoId, transcript2, fullText);
        return;
      }

      console.log(`❌ No transcript available for ${videoId}`);
      
    } catch (error: any) {
      console.error(`💥 Error extracting transcript for ${videoId}:`, error.message);
      
      // Check if it's a specific error type
      if (error.message.includes('Transcript is disabled')) {
        console.log('🚫 Transcripts are disabled for this video');
      } else if (error.message.includes('No transcript found')) {
        console.log('📭 No transcript found for this video');
      } else {
        console.log('🔍 Unknown error, may be rate limiting or API issue');
      }
    }
  }

  // Test multiple videos to find working ones
  async findWorkingVideos(): Promise<string[]> {
    const testVideos = [
      'wsIb_EdhcY8', // Your Average Tech Bro - Claude Code workflow
      'jCUrp3S3hho', // Leonardo - Cursor vs Claude Code
      '6Rg5M69bMgQ', // AI LABS - Claude Engineer
      'rJmjdGiZJ3U', // Robin Ebers - Cursor update
      'tm94DULupNc', // Matt Maher - Claude Code tips
      'fkQrySWqUa0', // Matt Maher - Master Claude Code
      'U8bZwtp5PAQ', // Matt Maher - Ultimate guide
      'sy9uTzB8Y0w', // AI LABS - 3 tips
      'nWcEjZYeeVo', // Jessica Wang - Cursor tips
      'dVSM_1JNjog', // Robin Ebers - Cursor 1.2
      'liwXtF23f1w', // COTI Foundation - Windsurf vs Cursor
      'sYkJutvM090'  // Ray Fernando - Grok in Cursor
    ];

    const workingVideos: string[] = [];
    
    for (const videoId of testVideos) {
      console.log(`\n🧪 Testing ${videoId}...`);
      
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        
        if (transcript && transcript.length > 0) {
          const fullText = transcript.map(t => t.text).join(' ');
          console.log(`✅ WORKING! ${fullText.length} characters`);
          workingVideos.push(videoId);
          
          // Save this working transcript
          await this.saveWorkingTranscript(videoId, transcript, fullText);
        } else {
          console.log(`❌ Empty transcript`);
        }
        
        // Rate limiting
        await this.delay(1000);
        
      } catch (error: any) {
        console.log(`❌ Failed: ${error.message}`);
      }
    }

    console.log(`\n📊 Summary: ${workingVideos.length} working videos found`);
    console.log(`Working videos: ${workingVideos.join(', ')}`);
    
    return workingVideos;
  }

  // Save working transcript for analysis
  private async saveWorkingTranscript(videoId: string, segments: any[], fullText: string): Promise<void> {
    const outputDir = path.join(process.cwd(), 'data/claude-tips');
    await fs.mkdir(outputDir, { recursive: true });
    
    const transcript = {
      videoId,
      extractedAt: new Date().toISOString(),
      segmentCount: segments.length,
      fullTextLength: fullText.length,
      segments,
      fullText
    };
    
    await fs.writeFile(
      path.join(outputDir, `working-transcript-${videoId}.json`),
      JSON.stringify(transcript, null, 2)
    );
    
    console.log(`💾 Saved working transcript for ${videoId}`);
  }

  // Analyze working transcripts for tips
  async analyzeWorkingTranscripts(): Promise<void> {
    const outputDir = path.join(process.cwd(), 'data/claude-tips');
    
    try {
      const files = await fs.readdir(outputDir);
      const transcriptFiles = files.filter(f => f.startsWith('working-transcript-'));
      
      console.log(`📋 Found ${transcriptFiles.length} working transcripts to analyze`);
      
      for (const file of transcriptFiles) {
        const filePath = path.join(outputDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const transcript = JSON.parse(content);
        
        console.log(`\n🧠 Analyzing ${transcript.videoId}...`);
        console.log(`Text length: ${transcript.fullTextLength} characters`);
        
        // Extract manual tips from content
        const tips = await this.extractManualTips(transcript.fullText, transcript.videoId);
        
        // Save analysis
        const analysis = {
          videoId: transcript.videoId,
          analyzedAt: new Date().toISOString(),
          tipsFound: tips.length,
          tips
        };
        
        await fs.writeFile(
          path.join(outputDir, `tips-analysis-${transcript.videoId}.json`),
          JSON.stringify(analysis, null, 2)
        );
        
        console.log(`✅ Found ${tips.length} tips from ${transcript.videoId}`);
      }
      
    } catch (error) {
      console.error('Failed to analyze working transcripts:', error);
    }
  }

  // Extract manual tips using keyword analysis and patterns
  private async extractManualTips(transcript: string, videoId: string): Promise<ManualTip[]> {
    const tips: ManualTip[] = [];
    
    // Look for specific patterns and keywords
    const tipPatterns = [
      // Prompting strategies
      { keywords: ['prompt', 'ask claude', 'tell claude', 'context'], category: 'PROMPTING_STRATEGIES' },
      // Workflow patterns  
      { keywords: ['workflow', 'process', 'step by step', 'method'], category: 'WORKFLOW_OPTIMIZATION' },
      // Claude features
      { keywords: ['claude code', 'artifacts', 'mcp', 'hooks'], category: 'CLAUDE_SPECIFIC_FEATURES' },
      // Productivity
      { keywords: ['faster', 'productivity', 'efficiency', 'time saving'], category: 'PRODUCTIVITY_HACKS' },
      // Error handling
      { keywords: ['error', 'debug', 'fix', 'problem', 'issue'], category: 'ERROR_HANDLING_DEBUGGING' }
    ];

    // Split transcript into sentences
    const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      for (const pattern of tipPatterns) {
        const hasKeyword = pattern.keywords.some(keyword => lowerSentence.includes(keyword));
        
        if (hasKeyword) {
          // Look for actionable phrases
          const actionWords = ['use', 'try', 'do', 'make', 'create', 'build', 'set', 'add', 'write'];
          const hasAction = actionWords.some(action => lowerSentence.includes(action));
          
          if (hasAction && sentence.length > 30 && sentence.length < 200) {
            tips.push({
              category: pattern.category,
              content: sentence,
              confidence: this.calculateConfidence(sentence, pattern.keywords),
              videoId,
              extractedAt: new Date().toISOString()
            });
          }
        }
      }
    }

    // Remove duplicates and low confidence tips
    const uniqueTips = tips
      .filter(tip => tip.confidence > 0.3)
      .filter((tip, index, arr) => 
        arr.findIndex(t => t.content.toLowerCase() === tip.content.toLowerCase()) === index
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Top 10 tips per video

    return uniqueTips;
  }

  private calculateConfidence(sentence: string, keywords: string[]): number {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // Keyword match score
    const keywordMatches = keywords.filter(k => lowerSentence.includes(k)).length;
    score += keywordMatches * 0.2;
    
    // Action word bonus
    const actionWords = ['use', 'try', 'do', 'make', 'create', 'build', 'set', 'add'];
    const hasAction = actionWords.some(action => lowerSentence.includes(action));
    if (hasAction) score += 0.3;
    
    // Specificity bonus (mentions specific tools or techniques)
    const specificTerms = ['claude', 'cursor', 'mcp', 'artifacts', 'prompt', 'context'];
    const specificMatches = specificTerms.filter(term => lowerSentence.includes(term)).length;
    score += specificMatches * 0.1;
    
    // Length penalty for very long sentences
    if (sentence.length > 150) score -= 0.2;
    
    return Math.min(score, 1.0);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface ManualTip {
  category: string;
  content: string;
  confidence: number;
  videoId: string;
  extractedAt: string;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const collector = new ManualTipsCollector();
  
  async function main() {
    console.log('🔍 Manual Tips Collector - Finding Working Videos');
    
    // Find videos with working transcripts
    const workingVideos = await collector.findWorkingVideos();
    
    if (workingVideos.length > 0) {
      console.log('\n🧠 Analyzing working transcripts for tips...');
      await collector.analyzeWorkingTranscripts();
      console.log('\n✅ Analysis complete! Check data/claude-tips/ for results');
    } else {
      console.log('\n❌ No working transcripts found. May need different approach.');
    }
  }
  
  main().catch(console.error);
}