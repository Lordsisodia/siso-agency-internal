import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import * as fs from 'fs/promises';
import * as path from 'path';

// Simple YouTube search scraper - no API needed!
export async function searchYouTube(query: string, options: {
  uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year';
  sortBy?: 'relevance' | 'upload_date' | 'view_count' | 'rating';
} = {}) {
  // Build search URL with filters
  let searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  // Add upload date filter
  if (options.uploadDate) {
    const filters: { [key: string]: string } = {
      'hour': '&sp=EgIIAQ%253D%253D',
      'today': '&sp=EgIIAg%253D%253D',
      'week': '&sp=EgIIAw%253D%253D',
      'month': '&sp=EgIIBA%253D%253D',
      'year': '&sp=EgIIBQ%253D%253D'
    };
    searchUrl += filters[options.uploadDate] || '';
  }

  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    // Extract video data from the initial data object
    const dataMatch = response.data.match(/var ytInitialData = ({.+?});/s);
    if (!dataMatch) {
      throw new Error('Could not find YouTube initial data');
    }

    const ytData = JSON.parse(dataMatch[1]);
    
    // Navigate through YouTube's data structure
    const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    
    const videos = [];
    
    for (const section of contents) {
      const items = section?.itemSectionRenderer?.contents || [];
      
      for (const item of items) {
        if (item.videoRenderer) {
          const video = item.videoRenderer;
          videos.push({
            videoId: video.videoId,
            title: video.title?.runs?.[0]?.text || '',
            channel: video.ownerText?.runs?.[0]?.text || '',
            channelUrl: video.ownerText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url || '',
            publishedTime: video.publishedTimeText?.simpleText || '',
            viewCount: video.viewCountText?.simpleText || '',
            duration: video.lengthText?.simpleText || '',
            thumbnail: video.thumbnail?.thumbnails?.[0]?.url || '',
            description: video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join('') || '',
            url: `https://youtube.com/watch?v=${video.videoId}`
          });
        }
      }
    }
    
    return videos;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Automated AI coding content collector
export async function collectAICodingContent() {
  const searches = [
    { query: 'cursor ai coding tutorial', uploadDate: 'month' },
    { query: 'claude code programming', uploadDate: 'month' },
    { query: 'vibe coding ai', uploadDate: 'month' },
    { query: 'cursor ide 2024', uploadDate: 'month' },
    { query: 'ai pair programming cursor', uploadDate: 'month' },
    { query: 'claude artifacts coding', uploadDate: 'month' },
    { query: 'windsurf ide tutorial', uploadDate: 'month' },
    { query: 'bolt.new tutorial', uploadDate: 'month' }
  ];

  const allVideos = [];
  
  // Update output directory to be in data folder
  const outputDir = path.join(process.cwd(), 'data/youtube-content');
  await fs.mkdir(outputDir, { recursive: true });

  // Search for videos
  for (const search of searches) {
    console.log(`Searching: ${search.query}`);
    const videos = await searchYouTube(search.query, { uploadDate: search.uploadDate });
    allVideos.push(...videos);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Remove duplicates
  const uniqueVideos = Array.from(
    new Map(allVideos.map(v => [v.videoId, v])).values()
  );

  console.log(`Found ${uniqueVideos.length} unique videos`);

  // Save video list
  const timestamp = new Date().toISOString().split('T')[0];
  await fs.writeFile(
    path.join(outputDir, `videos-${timestamp}.json`),
    JSON.stringify(uniqueVideos, null, 2)
  );

  // Extract transcripts
  console.log('\nExtracting transcripts...');
  const transcripts = [];
  
  for (const video of uniqueVideos.slice(0, 30)) { // Limit to 30 for demo
    try {
      console.log(`Getting transcript: ${video.title}`);
      const transcript = await YoutubeTranscript.fetchTranscript(video.videoId);
      const fullText = transcript.map(t => t.text).join(' ');
      
      transcripts.push({
        ...video,
        transcript: fullText,
        segments: transcript,
        extractedAt: new Date().toISOString()
      });
      
      // Save individual transcript
      await fs.writeFile(
        path.join(outputDir, `transcript-${video.videoId}.json`),
        JSON.stringify({
          ...video,
          transcript: fullText,
          segments: transcript
        }, null, 2)
      );
      
    } catch (error: any) {
      console.error(`Failed transcript for ${video.videoId}:`, error.message);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Create master document
  const masterDoc = {
    searchDate: new Date().toISOString(),
    totalVideos: uniqueVideos.length,
    transcriptsExtracted: transcripts.length,
    searches: searches,
    videos: uniqueVideos,
    transcripts: transcripts
  };

  await fs.writeFile(
    path.join(outputDir, `master-document-${timestamp}.json`),
    JSON.stringify(masterDoc, null, 2)
  );

  // Create markdown summary
  const markdown = `# AI Coding Content - ${timestamp}

## Summary
- Total Videos Found: ${uniqueVideos.length}
- Transcripts Extracted: ${transcripts.length}
- Search Date: ${new Date().toLocaleDateString()}

## Search Queries
${searches.map(s => `- ${s.query} (${s.uploadDate})`).join('\n')}

## Videos

${uniqueVideos.map((v, i) => `### ${i + 1}. ${v.title}
- **Channel**: ${v.channel}
- **Published**: ${v.publishedTime}
- **Views**: ${v.viewCount}
- **Duration**: ${v.duration}
- **URL**: ${v.url}
- **Transcript**: ${transcripts.find(t => t.videoId === v.videoId) ? '✅ Extracted' : '❌ Not available'}
`).join('\n')}

## Extracted Transcripts

${transcripts.map((t, i) => `### ${i + 1}. ${t.title}
**Transcript Preview**: ${t.transcript.substring(0, 500)}...
`).join('\n')}
`;

  await fs.writeFile(
    path.join(outputDir, `summary-${timestamp}.md`),
    markdown
  );

  return {
    videos: uniqueVideos,
    transcripts: transcripts,
    summaryPath: path.join(outputDir, `summary-${timestamp}.md`)
  };
}

// Run collector if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  console.log('Starting AI coding content collection...');
  collectAICodingContent()
    .then(result => {
      console.log('\n✅ Collection complete!');
      console.log(`Summary saved to: ${result.summaryPath}`);
    })
    .catch(console.error);
}