#!/usr/bin/env python3
"""
Free YouTube Video Discovery System
Uses YouTube Data API v3 (10,000 free requests/day)
"""

import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict
import os

class FreeYouTubeDiscovery:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.googleapis.com/youtube/v3"
        self.daily_request_count = 0
        self.max_daily_requests = 9000  # Leave buffer for safety
    
    def search_latest_videos(self, queries: List[str], hours_back: int = 24) -> List[Dict]:
        """Search for videos uploaded in the last N hours"""
        all_videos = []
        published_after = (datetime.now() - timedelta(hours=hours_back)).isoformat() + 'Z'
        
        print(f"🔍 Searching for videos published after: {published_after}")
        
        for query in queries:
            if self.daily_request_count >= self.max_daily_requests:
                print(f"⚠️ Daily API limit reached ({self.max_daily_requests})")
                break
                
            print(f"📺 Searching: '{query}'")
            videos = self._search_query(query, published_after)
            all_videos.extend(videos)
            
            # Small delay to be respectful
            import time
            time.sleep(0.1)
        
        # Remove duplicates by video ID
        unique_videos = {}
        for video in all_videos:
            video_id = video['video_id']
            if video_id not in unique_videos:
                unique_videos[video_id] = video
        
        result = list(unique_videos.values())
        print(f"✅ Found {len(result)} unique videos")
        return result
    
    def _search_query(self, query: str, published_after: str) -> List[Dict]:
        """Search for a specific query"""
        url = f"{self.base_url}/search"
        params = {
            'key': self.api_key,
            'q': query,
            'type': 'video',
            'publishedAfter': published_after,
            'order': 'relevance',
            'maxResults': 8,  # Reasonable limit per query
            'videoDuration': 'medium',  # 4-20 minutes for quality content
            'videoDefinition': 'any',
            'videoCaption': 'any',  # Include videos with captions
            'relevanceLanguage': 'en',
            'safeSearch': 'none',
            'part': 'snippet'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            self.daily_request_count += 1
            
            data = response.json()
            videos = []
            
            for item in data.get('items', []):
                video = {
                    'video_id': item['id']['videoId'],
                    'title': item['snippet']['title'],
                    'channel': item['snippet']['channelTitle'],
                    'channel_id': item['snippet']['channelId'],
                    'published_at': item['snippet']['publishedAt'],
                    'description': item['snippet']['description'][:500],  # Truncate long descriptions
                    'thumbnail': item['snippet']['thumbnails'].get('medium', {}).get('url', ''),
                    'search_query': query,
                    'discovered_at': datetime.now().isoformat()
                }
                videos.append(video)
            
            print(f"  └─ Found {len(videos)} videos for '{query}'")
            return videos
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Search failed for '{query}': {e}")
            return []
        except Exception as e:
            print(f"💥 Unexpected error for '{query}': {e}")
            return []
    
    def get_video_details(self, video_ids: List[str]) -> Dict[str, Dict]:
        """Get detailed information for specific videos"""
        if not video_ids:
            return {}
            
        # Batch requests (up to 50 videos per request)
        details = {}
        batch_size = 50
        
        for i in range(0, len(video_ids), batch_size):
            if self.daily_request_count >= self.max_daily_requests:
                break
                
            batch = video_ids[i:i + batch_size]
            batch_details = self._get_video_details_batch(batch)
            details.update(batch_details)
        
        return details
    
    def _get_video_details_batch(self, video_ids: List[str]) -> Dict[str, Dict]:
        """Get details for a batch of videos"""
        url = f"{self.base_url}/videos"
        params = {
            'key': self.api_key,
            'id': ','.join(video_ids),
            'part': 'snippet,statistics,contentDetails',
            'maxResults': 50
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            self.daily_request_count += 1
            
            data = response.json()
            details = {}
            
            for item in data.get('items', []):
                video_id = item['id']
                
                # Parse duration (PT4M13S -> 253 seconds)
                duration_str = item['contentDetails']['duration']
                duration_seconds = self._parse_duration(duration_str)
                
                details[video_id] = {
                    'view_count': int(item['statistics'].get('viewCount', 0)),
                    'like_count': int(item['statistics'].get('likeCount', 0)),
                    'comment_count': int(item['statistics'].get('commentCount', 0)),
                    'duration_seconds': duration_seconds,
                    'duration_formatted': self._format_duration(duration_seconds),
                    'category_id': item['snippet'].get('categoryId', ''),
                    'tags': item['snippet'].get('tags', []),
                    'default_language': item['snippet'].get('defaultLanguage', ''),
                    'caption_available': item['contentDetails'].get('caption', 'false') == 'true'
                }
            
            return details
            
        except Exception as e:
            print(f"❌ Failed to get video details: {e}")
            return {}
    
    def _parse_duration(self, duration_str: str) -> int:
        """Parse YouTube duration format (PT4M13S) to seconds"""
        import re
        
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration_str)
        
        if not match:
            return 0
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        return hours * 3600 + minutes * 60 + seconds
    
    def _format_duration(self, seconds: int) -> str:
        """Format seconds to HH:MM:SS or MM:SS"""
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        
        if hours > 0:
            return f"{hours}:{minutes:02d}:{secs:02d}"
        else:
            return f"{minutes}:{secs:02d}"
    
    def search_channels(self, channel_names: List[str]) -> List[Dict]:
        """Search for specific channels and get their latest videos"""
        videos = []
        
        for channel_name in channel_names:
            if self.daily_request_count >= self.max_daily_requests:
                break
                
            channel_videos = self._search_channel_videos(channel_name)
            videos.extend(channel_videos)
        
        return videos
    
    def _search_channel_videos(self, channel_name: str) -> List[Dict]:
        """Get latest videos from a specific channel"""
        # First, find the channel ID
        search_url = f"{self.base_url}/search"
        search_params = {
            'key': self.api_key,
            'q': channel_name,
            'type': 'channel',
            'part': 'snippet',
            'maxResults': 1
        }
        
        try:
            response = requests.get(search_url, params=search_params, timeout=10)
            response.raise_for_status()
            self.daily_request_count += 1
            
            data = response.json()
            if not data.get('items'):
                return []
            
            channel_id = data['items'][0]['id']['channelId']
            
            # Get latest videos from this channel
            videos_url = f"{self.base_url}/search"
            videos_params = {
                'key': self.api_key,
                'channelId': channel_id,
                'type': 'video',
                'order': 'date',
                'publishedAfter': (datetime.now() - timedelta(days=7)).isoformat() + 'Z',
                'part': 'snippet',
                'maxResults': 5
            }
            
            response = requests.get(videos_url, params=videos_params, timeout=10)
            response.raise_for_status()
            self.daily_request_count += 1
            
            data = response.json()
            videos = []
            
            for item in data.get('items', []):
                video = {
                    'video_id': item['id']['videoId'],
                    'title': item['snippet']['title'],
                    'channel': item['snippet']['channelTitle'],
                    'channel_id': item['snippet']['channelId'],
                    'published_at': item['snippet']['publishedAt'],
                    'description': item['snippet']['description'][:500],
                    'thumbnail': item['snippet']['thumbnails'].get('medium', {}).get('url', ''),
                    'source': f'channel:{channel_name}',
                    'discovered_at': datetime.now().isoformat()
                }
                videos.append(video)
            
            print(f"📺 Found {len(videos)} videos from channel: {channel_name}")
            return videos
            
        except Exception as e:
            print(f"❌ Failed to get videos from channel '{channel_name}': {e}")
            return []

# Optimized search queries for breakthrough detection
BREAKTHROUGH_QUERIES = [
    # AI Coding Tools
    "claude code new feature 2024",
    "cursor ai breakthrough",
    "github copilot update",
    "ai coding tool released",
    
    # Development Breakthroughs  
    "programming breakthrough 2024",
    "coding productivity hack",
    "developer tool game changer",
    "ai development workflow",
    
    # Specific Tools & Platforms
    "windsurf ide new",
    "bolt.new update",
    "replit agent feature",
    "v0 vercel new",
    
    # Workflow & Techniques
    "ai pair programming",
    "voice to code",
    "automated refactoring",
    "code generation ai",
    
    # Industry & Announcements
    "openai coding model",
    "anthropic claude coding",
    "google gemini code",
    "microsoft copilot enterprise"
]

# High-value channels to monitor
PRIORITY_CHANNELS = [
    "Anthropic",
    "OpenAI", 
    "GitHub",
    "Cursor",
    "Vercel",
    "Replit",
    "ThePrimeTime",
    "Fireship",
    "AI LABS",
    "Matt Maher",
    "Your Average Tech Bro",
    "Leonardo Grigorio"
]

# Test the system
if __name__ == "__main__":
    api_key = os.getenv('YOUTUBE_API_KEY')
    if not api_key:
        print("❌ YOUTUBE_API_KEY environment variable not set")
        exit(1)
    
    discovery = FreeYouTubeDiscovery(api_key)
    
    print("🚀 Testing YouTube Discovery System")
    print("=" * 50)
    
    # Test search queries
    videos = discovery.search_latest_videos(BREAKTHROUGH_QUERIES[:5], hours_back=48)
    
    if videos:
        print(f"\n✅ Found {len(videos)} videos")
        
        # Get detailed info for first few videos
        video_ids = [v['video_id'] for v in videos[:5]]
        details = discovery.get_video_details(video_ids)
        
        print("\n📊 Sample Results:")
        for video in videos[:3]:
            vid_id = video['video_id']
            detail = details.get(vid_id, {})
            
            print(f"\n📺 {video['title']}")
            print(f"   Channel: {video['channel']}")
            print(f"   Published: {video['published_at']}")
            print(f"   Views: {detail.get('view_count', 'N/A'):,}")
            print(f"   Duration: {detail.get('duration_formatted', 'N/A')}")
            print(f"   URL: https://youtube.com/watch?v={vid_id}")
        
        # Save results
        output_file = f"/tmp/youtube_discovery_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump({
                'discovered_at': datetime.now().isoformat(),
                'total_videos': len(videos),
                'api_requests_used': discovery.daily_request_count,
                'videos': videos,
                'details': details
            }, f, indent=2)
        
        print(f"\n💾 Results saved to: {output_file}")
        print(f"📊 API requests used: {discovery.daily_request_count}")
        
    else:
        print("❌ No videos found")