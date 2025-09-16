export { searchYouTube, collectAICodingContent } from './youtube-collector';

// Re-export types
export interface VideoResult {
  videoId: string;
  title: string;
  channel: string;
  channelUrl: string;
  publishedTime: string;
  viewCount: string;
  duration: string;
  thumbnail: string;
  description: string;
  url: string;
}

export interface VideoTranscript extends VideoResult {
  transcript: string;
  segments: Array<{ text: string; duration: number; offset: number }>;
  extractedAt: string;
}

export interface CollectionResult {
  videos: VideoResult[];
  transcripts: VideoTranscript[];
  summaryPath: string;
}