#!/usr/bin/env python3
"""
Free AI Breakthrough Detection System
Uses Groq API (14,400 free requests/day) with fallback to Hugging Face
"""

import requests
import json
import re
from typing import List, Dict, Optional
from datetime import datetime
import os

class FreeBreakthroughDetector:
    def __init__(self, groq_api_key: str, hf_api_key: str = None):
        self.groq_api_key = groq_api_key
        self.hf_api_key = hf_api_key
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"
        self.hf_url = "https://api-inference.huggingface.co/models"
        self.request_count = 0
        self.max_requests = 14000  # Leave buffer for Groq daily limit
        
    def analyze_transcript(self, transcript: str, video_metadata: Dict) -> List[Dict]:
        """Analyze transcript for breakthrough insights"""
        
        print(f"🧠 Analyzing: {video_metadata.get('title', 'Unknown')}")
        
        # Skip very short or very long transcripts
        word_count = len(transcript.split())
        if word_count < 50:
            print(f"  ⏭️ Skipping: too short ({word_count} words)")
            return []
        elif word_count > 3000:
            print(f"  ✂️ Truncating: very long ({word_count} words)")
            transcript = ' '.join(transcript.split()[:3000])
        
        # Try Groq first (faster and better)
        breakthroughs = self._analyze_with_groq(transcript, video_metadata)
        
        # Fallback to Hugging Face if needed
        if not breakthroughs and self.hf_api_key:
            print("  🔄 Falling back to Hugging Face...")
            breakthroughs = self._analyze_with_huggingface(transcript, video_metadata)
        
        # Add metadata and scoring
        for breakthrough in breakthroughs:
            breakthrough.update({
                'video_id': video_metadata.get('video_id', ''),
                'video_title': video_metadata.get('title', ''),
                'channel': video_metadata.get('channel', ''),
                'published_at': video_metadata.get('published_at', ''),
                'detected_at': datetime.now().isoformat(),
                'detection_method': 'groq' if self.request_count <= self.max_requests else 'huggingface'
            })
            
            # Calculate overall score
            breakthrough['overall_score'] = self._calculate_overall_score(breakthrough)
        
        # Filter for high-quality breakthroughs only
        quality_breakthroughs = [
            b for b in breakthroughs 
            if b.get('overall_score', 0) >= 6.0
        ]
        
        print(f"  ✅ Found {len(quality_breakthroughs)} quality breakthroughs")
        return quality_breakthroughs
    
    def _analyze_with_groq(self, transcript: str, video_metadata: Dict) -> List[Dict]:
        """Analyze with Groq API (fast and free)"""
        
        if self.request_count >= self.max_requests:
            print("  ⚠️ Groq daily limit reached")
            return []
        
        prompt = self._build_analysis_prompt(transcript, video_metadata)
        
        try:
            response = requests.post(
                self.groq_url,
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama3-8b-8192",  # Fast free model
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 1500,
                    "temperature": 0.1,
                    "top_p": 0.9
                },
                timeout=30
            )
            
            self.request_count += 1
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                breakthroughs = self._parse_breakthrough_response(content)
                print(f"  🚀 Groq analysis complete: {len(breakthroughs)} breakthroughs")
                return breakthroughs
            else:
                print(f"  ❌ Groq API error: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"  💥 Groq analysis failed: {e}")
            return []
    
    def _analyze_with_huggingface(self, transcript: str, video_metadata: Dict) -> List[Dict]:
        """Fallback analysis with Hugging Face"""
        
        if not self.hf_api_key:
            return []
        
        # Use a smaller, focused model for classification
        model_url = f"{self.hf_url}/microsoft/DialoGPT-medium"
        
        # Simplify prompt for HF model
        simple_prompt = f"""
Analyze this transcript for breakthrough AI/coding developments:

"{transcript[:1000]}"

Find: NEW tools, major improvements, game-changing features.
List top 3 breakthroughs with title and impact level.
"""
        
        try:
            response = requests.post(
                model_url,
                headers={"Authorization": f"Bearer {self.hf_api_key}"},
                json={"inputs": simple_prompt},
                timeout=20
            )
            
            if response.status_code == 200:
                # Parse HF response (format varies by model)
                result = response.json()
                breakthroughs = self._parse_hf_response(result, video_metadata)
                print(f"  🤗 HuggingFace analysis complete: {len(breakthroughs)} breakthroughs")
                return breakthroughs
            else:
                print(f"  ❌ HuggingFace API error: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"  💥 HuggingFace analysis failed: {e}")
            return []
    
    def _build_analysis_prompt(self, transcript: str, video_metadata: Dict) -> str:
        """Build optimized analysis prompt"""
        
        return f"""
Analyze this YouTube transcript for BREAKTHROUGH insights in AI coding and development.

VIDEO: "{video_metadata.get('title', 'Unknown')}" by {video_metadata.get('channel', 'Unknown')}

TRANSCRIPT:
{transcript}

BREAKTHROUGH CRITERIA:
🔥 NEW tools, frameworks, or AI models announced
⚡ MAJOR productivity or workflow improvements  
🚀 GAME-CHANGING features or capabilities
🛠️ NOVEL integration patterns or techniques
📢 INDUSTRY-CHANGING announcements or releases

SCORING GUIDELINES:
- Novelty: 1-10 (How new/unprecedented is this?)
- Impact: HIGH/MEDIUM/LOW (Potential to change workflows)
- Actionability: 1-10 (How easily can developers implement?)
- Category: TOOLS/WORKFLOW/INTEGRATION/ANNOUNCEMENT/TECHNIQUE

ONLY include insights scoring 7+ on novelty OR actionability.

OUTPUT FORMAT (JSON):
[
  {{
    "title": "Specific breakthrough name",
    "impact": "HIGH|MEDIUM|LOW",
    "novelty": 9,
    "actionability": 8,
    "description": "2-3 sentence explanation of the breakthrough",
    "category": "TOOLS|WORKFLOW|INTEGRATION|ANNOUNCEMENT|TECHNIQUE",
    "key_quote": "Relevant quote from transcript",
    "implementation_notes": "How developers can use this"
  }}
]

Focus on concrete, actionable breakthroughs that developers can immediately benefit from.
"""
    
    def _parse_breakthrough_response(self, content: str) -> List[Dict]:
        """Parse AI response and extract breakthrough data"""
        
        try:
            # Look for JSON array in the response
            json_pattern = r'\[[\s\S]*?\]'
            json_match = re.search(json_pattern, content)
            
            if json_match:
                json_str = json_match.group()
                breakthroughs = json.loads(json_str)
                
                # Validate and clean each breakthrough
                validated = []
                for breakthrough in breakthroughs:
                    if self._validate_breakthrough(breakthrough):
                        validated.append(self._clean_breakthrough(breakthrough))
                
                return validated
            
            # If no JSON, try to parse structured text
            return self._parse_text_response(content)
            
        except json.JSONDecodeError as e:
            print(f"  ⚠️ JSON parsing failed: {e}")
            return self._parse_text_response(content)
        except Exception as e:
            print(f"  💥 Response parsing failed: {e}")
            return []
    
    def _validate_breakthrough(self, breakthrough: Dict) -> bool:
        """Validate breakthrough data structure"""
        required_fields = ['title', 'impact', 'novelty', 'actionability', 'description', 'category']
        
        for field in required_fields:
            if field not in breakthrough:
                return False
        
        # Validate data types and ranges
        if not isinstance(breakthrough['novelty'], (int, float)) or not (1 <= breakthrough['novelty'] <= 10):
            return False
        
        if not isinstance(breakthrough['actionability'], (int, float)) or not (1 <= breakthrough['actionability'] <= 10):
            return False
        
        if breakthrough['impact'] not in ['HIGH', 'MEDIUM', 'LOW']:
            return False
        
        if breakthrough['category'] not in ['TOOLS', 'WORKFLOW', 'INTEGRATION', 'ANNOUNCEMENT', 'TECHNIQUE']:
            return False
        
        return True
    
    def _clean_breakthrough(self, breakthrough: Dict) -> Dict:
        """Clean and normalize breakthrough data"""
        
        # Ensure numeric values are properly typed
        breakthrough['novelty'] = float(breakthrough['novelty'])
        breakthrough['actionability'] = float(breakthrough['actionability'])
        
        # Clean text fields
        breakthrough['title'] = breakthrough['title'].strip()
        breakthrough['description'] = breakthrough['description'].strip()
        
        # Add default values for optional fields
        breakthrough.setdefault('key_quote', '')
        breakthrough.setdefault('implementation_notes', '')
        
        return breakthrough
    
    def _parse_text_response(self, content: str) -> List[Dict]:
        """Parse non-JSON text response as fallback"""
        
        breakthroughs = []
        
        # Look for breakthrough patterns in text
        patterns = [
            r'(?i)breakthrough:?\s*(.+?)(?=\n|$)',
            r'(?i)new tool:?\s*(.+?)(?=\n|$)',
            r'(?i)game[- ]changer:?\s*(.+?)(?=\n|$)',
            r'(?i)major improvement:?\s*(.+?)(?=\n|$)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if len(match.strip()) > 10:  # Reasonable length
                    breakthrough = {
                        'title': match.strip()[:100],  # Limit length
                        'impact': 'MEDIUM',  # Default
                        'novelty': 7,  # Default
                        'actionability': 6,  # Default
                        'description': f"Potential breakthrough: {match.strip()}",
                        'category': 'TOOLS',  # Default
                        'key_quote': '',
                        'implementation_notes': 'Further research needed'
                    }
                    breakthroughs.append(breakthrough)
        
        return breakthroughs[:3]  # Limit fallback results
    
    def _parse_hf_response(self, result: Dict, video_metadata: Dict) -> List[Dict]:
        """Parse Hugging Face model response"""
        
        # HF response format varies by model
        text = ""
        if isinstance(result, list) and result:
            text = result[0].get('generated_text', '')
        elif isinstance(result, dict):
            text = result.get('generated_text', '')
        
        if text:
            return self._parse_text_response(text)
        
        return []
    
    def _calculate_overall_score(self, breakthrough: Dict) -> float:
        """Calculate weighted overall score for ranking"""
        
        novelty = breakthrough.get('novelty', 5)
        actionability = breakthrough.get('actionability', 5)
        impact = breakthrough.get('impact', 'MEDIUM')
        
        # Impact scoring
        impact_scores = {'HIGH': 10, 'MEDIUM': 6, 'LOW': 3}
        impact_score = impact_scores.get(impact, 6)
        
        # Weighted average
        overall = (
            novelty * 0.35 +           # 35% novelty
            actionability * 0.40 +     # 40% actionability  
            impact_score * 0.25        # 25% impact
        )
        
        return round(overall, 1)
    
    def rank_daily_breakthroughs(self, all_breakthroughs: List[Dict]) -> List[Dict]:
        """Rank and select top breakthroughs for daily digest"""
        
        if not all_breakthroughs:
            return []
        
        print(f"🏆 Ranking {len(all_breakthroughs)} breakthroughs...")
        
        # Remove duplicates based on title similarity
        unique_breakthroughs = self._remove_duplicates(all_breakthroughs)
        print(f"  📋 After deduplication: {len(unique_breakthroughs)}")
        
        # Sort by overall score
        ranked = sorted(unique_breakthroughs, key=lambda x: x['overall_score'], reverse=True)
        
        # Apply category diversity (ensure variety)
        diverse_top = self._ensure_category_diversity(ranked)
        
        # Return top 10
        top_10 = diverse_top[:10]
        print(f"  🥇 Selected top {len(top_10)} for daily digest")
        
        return top_10
    
    def _remove_duplicates(self, breakthroughs: List[Dict]) -> List[Dict]:
        """Remove similar breakthroughs based on title similarity"""
        
        unique = []
        seen_titles = []
        
        for breakthrough in breakthroughs:
            title = breakthrough['title'].lower()
            title_words = set(title.split())
            
            # Check for similarity with existing titles
            is_duplicate = False
            for seen_title in seen_titles:
                seen_words = set(seen_title.split())
                
                # If 60%+ words match, consider it a duplicate
                if title_words and seen_words:
                    intersection = title_words.intersection(seen_words)
                    similarity = len(intersection) / min(len(title_words), len(seen_words))
                    
                    if similarity > 0.6:
                        is_duplicate = True
                        break
            
            if not is_duplicate:
                unique.append(breakthrough)
                seen_titles.append(title)
        
        return unique
    
    def _ensure_category_diversity(self, ranked_breakthroughs: List[Dict]) -> List[Dict]:
        """Ensure diversity across categories in top results"""
        
        categories_seen = {}
        diverse_list = []
        
        # First pass: one from each category
        for breakthrough in ranked_breakthroughs:
            category = breakthrough['category']
            if category not in categories_seen:
                diverse_list.append(breakthrough)
                categories_seen[category] = 1
        
        # Second pass: fill remaining slots
        for breakthrough in ranked_breakthroughs:
            if breakthrough not in diverse_list and len(diverse_list) < 15:
                category = breakthrough['category']
                # Limit per category to avoid oversaturation
                if categories_seen.get(category, 0) < 3:
                    diverse_list.append(breakthrough)
                    categories_seen[category] = categories_seen.get(category, 0) + 1
        
        return diverse_list

# Test the detector
if __name__ == "__main__":
    import sys
    
    groq_key = os.getenv('GROQ_API_KEY')
    hf_key = os.getenv('HF_API_KEY')
    
    if not groq_key:
        print("❌ GROQ_API_KEY environment variable not set")
        exit(1)
    
    detector = FreeBreakthroughDetector(groq_key, hf_key)
    
    # Test with sample transcript
    test_transcript = """
    Today I'm excited to announce Claude Code 2.0, which introduces revolutionary 
    auto-refactoring capabilities. This new feature can automatically refactor 
    entire codebases with 95% accuracy, making legacy code modernization effortless.
    
    The new voice-to-code functionality allows developers to speak natural language
    and have it converted directly into working code. This is a game-changer for
    accessibility and productivity.
    
    We've also integrated MCP servers directly into the IDE, allowing real-time
    collaboration between multiple AI agents working on the same codebase.
    """
    
    test_metadata = {
        'video_id': 'test123',
        'title': 'Claude Code 2.0 Launch Event',
        'channel': 'Anthropic',
        'published_at': '2024-07-13T10:00:00Z'
    }
    
    print("🧪 Testing breakthrough detection...")
    print("=" * 50)
    
    breakthroughs = detector.analyze_transcript(test_transcript, test_metadata)
    
    if breakthroughs:
        print(f"\n✅ Found {len(breakthroughs)} breakthroughs:")
        
        for i, breakthrough in enumerate(breakthroughs, 1):
            print(f"\n{i}. 🚀 {breakthrough['title']}")
            print(f"   Impact: {breakthrough['impact']} | Score: {breakthrough['overall_score']}/10")
            print(f"   Category: {breakthrough['category']}")
            print(f"   Description: {breakthrough['description']}")
    
    else:
        print("❌ No breakthroughs detected")
    
    print(f"\n📊 API requests used: {detector.request_count}")