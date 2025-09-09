#!/usr/bin/env python3
"""
Free Transcript Extraction System
Uses yt-dlp (completely free, no rate limits)
"""

import subprocess
import json
import tempfile
import os
import re
from typing import Dict, List, Optional
from datetime import datetime

class FreeTranscriptExtractor:
    def __init__(self):
        self.yt_dlp_path = "yt-dlp"
        self.temp_dir = tempfile.gettempdir()
        self.extracted_count = 0
        
    def extract_transcript(self, video_id: str, max_retries: int = 2) -> Optional[Dict]:
        """Extract transcript using yt-dlp with multiple fallback methods"""
        
        print(f"📝 Extracting transcript for: {video_id}")
        
        # Try multiple extraction methods
        methods = [
            self._extract_auto_subtitles,
            self._extract_manual_subtitles,
            self._extract_any_subtitles
        ]
        
        for attempt, method in enumerate(methods, 1):
            try:
                result = method(video_id)
                if result:
                    print(f"  ✅ Success with method {attempt}")
                    self.extracted_count += 1
                    return result
                else:
                    print(f"  ❌ Method {attempt} failed")
            except Exception as e:
                print(f"  💥 Method {attempt} error: {e}")
                continue
        
        print(f"  ❌ All extraction methods failed for {video_id}")
        return None
    
    def _extract_auto_subtitles(self, video_id: str) -> Optional[Dict]:
        """Extract auto-generated subtitles (most common)"""
        output_template = os.path.join(self.temp_dir, f"{video_id}_auto")
        
        cmd = [
            self.yt_dlp_path,
            f"https://youtube.com/watch?v={video_id}",
            "--write-auto-subs",
            "--sub-langs", "en",
            "--sub-format", "json3",
            "--skip-download",
            "--no-warnings",
            "--output", output_template
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        # Look for subtitle files
        subtitle_files = [
            f"{output_template}.en.json3",
            f"{output_template}.a.en.json3",
            f"{output_template}.en-US.json3"
        ]
        
        for subtitle_file in subtitle_files:
            if os.path.exists(subtitle_file):
                return self._parse_json3_subtitles(subtitle_file, video_id)
        
        return None
    
    def _extract_manual_subtitles(self, video_id: str) -> Optional[Dict]:
        """Extract manually created subtitles"""
        output_template = os.path.join(self.temp_dir, f"{video_id}_manual")
        
        cmd = [
            self.yt_dlp_path,
            f"https://youtube.com/watch?v={video_id}",
            "--write-subs",
            "--sub-langs", "en",
            "--sub-format", "json3",
            "--skip-download",
            "--no-warnings",
            "--output", output_template
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        subtitle_file = f"{output_template}.en.json3"
        if os.path.exists(subtitle_file):
            return self._parse_json3_subtitles(subtitle_file, video_id)
        
        return None
    
    def _extract_any_subtitles(self, video_id: str) -> Optional[Dict]:
        """Extract any available subtitles"""
        output_template = os.path.join(self.temp_dir, f"{video_id}_any")
        
        cmd = [
            self.yt_dlp_path,
            f"https://youtube.com/watch?v={video_id}",
            "--write-subs",
            "--write-auto-subs", 
            "--sub-langs", "en,en-US,en-GB",
            "--sub-format", "json3/best",
            "--skip-download",
            "--no-warnings",
            "--output", output_template
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
        
        # Check for any subtitle files
        for file in os.listdir(self.temp_dir):
            if file.startswith(f"{video_id}_any") and file.endswith('.json3'):
                subtitle_file = os.path.join(self.temp_dir, file)
                return self._parse_json3_subtitles(subtitle_file, video_id)
        
        return None
    
    def _parse_json3_subtitles(self, subtitle_file: str, video_id: str) -> Dict:
        """Parse JSON3 subtitle format and extract clean transcript"""
        try:
            with open(subtitle_file, 'r', encoding='utf-8') as f:
                subtitle_data = json.load(f)
            
            # Extract text from events
            transcript_segments = []
            full_text = ""
            
            for event in subtitle_data.get('events', []):
                if 'segs' in event:
                    segment_text = ""
                    start_time = event.get('tStartMs', 0) / 1000  # Convert to seconds
                    
                    for seg in event['segs']:
                        if 'utf8' in seg:
                            segment_text += seg['utf8']
                    
                    if segment_text.strip():
                        cleaned_text = self._clean_transcript_text(segment_text)
                        transcript_segments.append({
                            'start': start_time,
                            'text': cleaned_text
                        })
                        full_text += cleaned_text + " "
            
            # Clean up the file
            os.remove(subtitle_file)
            
            # Clean and process full transcript
            full_text = self._clean_transcript_text(full_text)
            
            result = {
                'video_id': video_id,
                'transcript_text': full_text,
                'segments': transcript_segments,
                'segment_count': len(transcript_segments),
                'word_count': len(full_text.split()),
                'character_count': len(full_text),
                'extracted_at': datetime.now().isoformat(),
                'extraction_method': 'yt-dlp',
                'source_file': os.path.basename(subtitle_file)
            }
            
            print(f"  📊 Extracted: {len(transcript_segments)} segments, {len(full_text.split())} words")
            return result
            
        except Exception as e:
            print(f"  💥 Failed to parse subtitle file: {e}")
            # Clean up on error
            if os.path.exists(subtitle_file):
                os.remove(subtitle_file)
            return None
    
    def _clean_transcript_text(self, text: str) -> str:
        """Clean and normalize transcript text"""
        if not text:
            return ""
        
        # Remove common subtitle artifacts
        text = re.sub(r'\[.*?\]', '', text)  # Remove [Music], [Applause], etc.
        text = re.sub(r'\(.*?\)', '', text)  # Remove (Music), (Laughter), etc.
        text = re.sub(r'<.*?>', '', text)   # Remove HTML-like tags
        
        # Fix common transcription issues
        text = re.sub(r'\s+', ' ', text)    # Normalize whitespace
        text = re.sub(r'\.{2,}', '.', text) # Fix multiple periods
        text = re.sub(r',{2,}', ',', text)  # Fix multiple commas
        
        # Remove speaker labels if present
        text = re.sub(r'^[A-Z][a-z]+:\s*', '', text, flags=re.MULTILINE)
        
        # Clean up punctuation
        text = text.replace(' ,', ',')
        text = text.replace(' .', '.')
        text = text.replace(' !', '!')
        text = text.replace(' ?', '?')
        
        return text.strip()
    
    def batch_extract(self, video_ids: List[str], max_workers: int = 3) -> Dict[str, Dict]:
        """Extract transcripts for multiple videos with parallel processing"""
        print(f"📝 Starting batch extraction for {len(video_ids)} videos")
        
        results = {}
        processed = 0
        
        # Process in small batches to avoid overwhelming the system
        batch_size = max_workers
        
        for i in range(0, len(video_ids), batch_size):
            batch = video_ids[i:i + batch_size]
            print(f"\n🔄 Processing batch {i//batch_size + 1}: {len(batch)} videos")
            
            # Process each video in the batch
            for video_id in batch:
                transcript = self.extract_transcript(video_id)
                if transcript:
                    results[video_id] = transcript
                    processed += 1
                
                # Small delay between extractions
                import time
                time.sleep(0.5)
            
            print(f"  ✅ Batch complete: {len([v for v in batch if v in results])}/{len(batch)} successful")
        
        success_rate = (processed / len(video_ids)) * 100 if video_ids else 0
        print(f"\n📊 Batch extraction complete:")
        print(f"  Total processed: {processed}/{len(video_ids)} ({success_rate:.1f}%)")
        
        return results
    
    def extract_with_metadata(self, video_id: str) -> Optional[Dict]:
        """Extract transcript along with video metadata"""
        transcript_result = self.extract_transcript(video_id)
        
        if not transcript_result:
            return None
        
        # Get basic video info using yt-dlp
        metadata = self._get_video_metadata(video_id)
        
        # Combine transcript and metadata
        result = {
            **transcript_result,
            'metadata': metadata
        }
        
        return result
    
    def _get_video_metadata(self, video_id: str) -> Dict:
        """Get basic video metadata using yt-dlp"""
        cmd = [
            self.yt_dlp_path,
            f"https://youtube.com/watch?v={video_id}",
            "--dump-json",
            "--no-warnings"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                metadata = json.loads(result.stdout)
                
                return {
                    'title': metadata.get('title', ''),
                    'uploader': metadata.get('uploader', ''),
                    'duration': metadata.get('duration', 0),
                    'view_count': metadata.get('view_count', 0),
                    'like_count': metadata.get('like_count', 0),
                    'upload_date': metadata.get('upload_date', ''),
                    'description': metadata.get('description', '')[:500],  # Truncate
                    'tags': metadata.get('tags', []),
                    'categories': metadata.get('categories', [])
                }
            
        except Exception as e:
            print(f"  ⚠️ Failed to get metadata: {e}")
        
        return {}
    
    def get_available_subtitles(self, video_id: str) -> List[Dict]:
        """Check what subtitle languages are available"""
        cmd = [
            self.yt_dlp_path,
            f"https://youtube.com/watch?v={video_id}",
            "--list-subs",
            "--no-warnings"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            # Parse the output to find available subtitles
            available = []
            lines = result.stdout.split('\n')
            
            for line in lines:
                if 'en' in line.lower() and ('auto' in line or 'manual' in line):
                    available.append({
                        'language': 'en',
                        'type': 'auto' if 'auto' in line else 'manual',
                        'raw_line': line.strip()
                    })
            
            return available
            
        except Exception as e:
            print(f"  ⚠️ Failed to list subtitles: {e}")
            return []
    
    def cleanup_temp_files(self):
        """Clean up any leftover temporary files"""
        try:
            for file in os.listdir(self.temp_dir):
                if file.endswith('.json3') or file.endswith('.vtt'):
                    file_path = os.path.join(self.temp_dir, file)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")

# Test the extractor
if __name__ == "__main__":
    import sys
    
    extractor = FreeTranscriptExtractor()
    
    # Test video IDs (replace with actual working ones)
    test_videos = [
        "dQw4w9WgXcQ",  # Rick Roll (has captions)
        "jNQXAC9IVRw",  # Me at the zoo (first YouTube video)
    ]
    
    if len(sys.argv) > 1:
        # Use video ID from command line
        video_id = sys.argv[1]
        print(f"🧪 Testing transcript extraction for: {video_id}")
        
        # Check available subtitles first
        available = extractor.get_available_subtitles(video_id)
        if available:
            print(f"📋 Available subtitles: {available}")
        
        # Extract transcript
        result = extractor.extract_with_metadata(video_id)
        
        if result:
            print("\n✅ Extraction successful!")
            print(f"📊 Stats:")
            print(f"  Words: {result.get('word_count', 0)}")
            print(f"  Segments: {result.get('segment_count', 0)}")
            print(f"  Duration: {result.get('metadata', {}).get('duration', 0)}s")
            
            print(f"\n📝 First 500 characters:")
            print(result['transcript_text'][:500] + "...")
            
            # Save to file
            output_file = f"/tmp/transcript_{video_id}.json"
            with open(output_file, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\n💾 Full result saved to: {output_file}")
            
        else:
            print("❌ Extraction failed")
    
    else:
        print("🧪 Testing batch extraction...")
        results = extractor.batch_extract(test_videos)
        
        print(f"\n📊 Results: {len(results)}/{len(test_videos)} successful")
        for video_id, transcript in results.items():
            print(f"  ✅ {video_id}: {transcript['word_count']} words")
    
    # Cleanup
    extractor.cleanup_temp_files()