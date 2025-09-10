# AI Chat Assistant - Technical Design
**Date:** January 9, 2025
**Focus:** Architecture, Tech Stack, and Implementation Strategy

## 🎯 Core Requirements Analysis

### User Journey:
1. **Morning Routine**: 23-minute structured conversation
2. **Mode Control**: Toggle between chat/voice/read modes
3. **Task Extraction**: AI identifies and creates actionable tasks
4. **Cross-Platform**: Works on phone, web, LifeLock page
5. **Learning**: Saves transcripts and improves over time

## 🏗️ Architecture Options

### Option A: Standalone AI Chat App (RECOMMENDED)
```
siso-ai-chat.vercel.app
├── Frontend: React + TypeScript
├── Voice: Web Speech API + Whisper
├── AI: OpenAI/Anthropic API
├── Backend: Next.js API routes
└── Database: Supabase/Firebase
```

**Benefits:**
✅ Independent deployment & scaling
✅ Focused development
✅ Easy integration with existing apps
✅ Can be embedded anywhere

### Option B: Integrated into Existing Apps
```
SISO-INTERNAL/ai-chat
SISO-CLIENT/ai-chat (embedded)
SISO-PARTNERSHIP/ai-chat (embedded)
```

**Benefits:**
✅ Single codebase
❌ Heavier bundle sizes
❌ Complex deployment coordination

## 🤖 AI & Voice Technology Stack

### 1. **AI Provider Options:**

#### OpenAI (Recommended for MVP)
```javascript
// Simple integration
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat completion with memory
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: conversationHistory,
  functions: [createTaskFunction]
});
```

**Pros:** 
- Easy function calling for task creation
- Great conversation quality
- Built-in memory management

#### Anthropic Claude (Alternative)
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.create({
  model: "claude-3-sonnet-20240229",
  messages: conversationHistory,
  tools: [taskCreationTool]
});
```

**Pros:**
- Better at following specific instructions
- More reliable function calling
- Better conversation analysis

### 2. **Voice Technology Stack:**

#### Web-Based Solution (Recommended)
```javascript
// Speech Recognition (Speech-to-Text)
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;

// Speech Synthesis (Text-to-Speech)
const synthesis = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance(text);
```

**Pros:** 
- Works on all devices
- No additional costs
- Real-time processing

#### Premium Solution: Whisper + ElevenLabs
```javascript
// Whisper for Speech-to-Text
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-1"
});

// ElevenLabs for high-quality TTS
const audio = await elevenLabs.generate({
  voice: "your-voice-id",
  text: response,
  model_id: "eleven_multilingual_v2"
});
```

**Pros:**
- Higher quality transcription
- Custom voice cloning
- Better accuracy

**Cons:**
- Additional costs (~$0.006/minute for Whisper)
- More complex setup

## 💾 Data Architecture

### Database Schema:
```sql
-- Conversations Table
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255),
  date DATE,
  type VARCHAR(50), -- 'morning_routine', 'casual', 'task_focused'
  duration_minutes INTEGER,
  mode VARCHAR(20), -- 'chat', 'voice', 'read'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20), -- 'user', 'assistant', 'system'
  content TEXT,
  audio_url VARCHAR(255), -- for voice messages
  timestamp TIMESTAMP,
  metadata JSONB -- for analysis data
);

-- Tasks Table
CREATE TABLE extracted_tasks (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  message_id UUID REFERENCES messages(id),
  title VARCHAR(255),
  description TEXT,
  priority VARCHAR(20),
  estimated_duration INTEGER,
  tags JSONB,
  sync_status VARCHAR(50), -- 'pending', 'synced', 'failed'
  external_task_id VARCHAR(255), -- ID in main system
  created_at TIMESTAMP
);

-- Learning Data Table
CREATE TABLE conversation_insights (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255),
  insight_type VARCHAR(100), -- 'preference', 'pattern', 'improvement'
  insight_data JSONB,
  confidence_score FLOAT,
  created_at TIMESTAMP
);
```

## 🎨 User Interface Design

### Mode Toggle Component:
```tsx
interface ChatMode {
  chat: boolean;    // Text input/output
  voice: boolean;   // Voice input/output  
  read: boolean;    // Listen only mode
}

const ModeToggle: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>({
    chat: true,
    voice: false,
    read: false
  });

  return (
    <div className="mode-toggle">
      <Button 
        variant={mode.chat ? "default" : "outline"}
        onClick={() => setMode({chat: true, voice: false, read: false})}
      >
        💬 Chat
      </Button>
      <Button 
        variant={mode.voice ? "default" : "outline"}
        onClick={() => setMode({chat: false, voice: true, read: false})}
      >
        🎤 Voice
      </Button>
      <Button 
        variant={mode.read ? "default" : "outline"}
        onClick={() => setMode({chat: false, voice: false, read: true})}
      >
        👂 Listen
      </Button>
    </div>
  );
};
```

### 23-Minute Morning Routine Interface:
```tsx
const MorningRoutine: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState(23 * 60); // 23 minutes
  const [currentPhase, setCurrentPhase] = useState<'planning' | 'priorities' | 'timeboxing'>('planning');
  
  const phases = {
    planning: "Let's plan your day. What's on your mind?",
    priorities: "What are your top 3 priorities today?",
    timeboxing: "Let's schedule these tasks in your calendar."
  };

  return (
    <div className="morning-routine">
      <div className="timer">
        ⏰ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
      </div>
      <div className="phase-indicator">
        📋 {phases[currentPhase]}
      </div>
      <ChatInterface mode="voice" />
      <TaskExtraction conversation={currentConversation} />
    </div>
  );
};
```

## 🔗 Integration with Existing System

### Task Creation API:
```typescript
// API endpoint for creating tasks in main system
export interface TaskCreationPayload {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration?: number; // minutes
  dueDate?: Date;
  tags?: string[];
  projectId?: string;
  workType: 'deep' | 'light';
}

// Integration service
class TaskIntegrationService {
  async createTask(task: TaskCreationPayload): Promise<string> {
    const response = await fetch('/api/tasks/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    
    const result = await response.json();
    return result.taskId;
  }

  async syncToMainSystem(tasks: TaskCreationPayload[]): Promise<void> {
    // Batch sync to your existing task system
    await Promise.all(tasks.map(task => this.createTask(task)));
  }
}
```

## 📱 Cross-Platform Strategy

### 1. **Web Component (Primary)**
- React component that can be embedded anywhere
- Responsive design for mobile/desktop
- PWA capabilities for mobile app feel

### 2. **Embedding Strategy:**
```tsx
// Embeddable in any app
<AIChattAssistant 
  mode="voice"
  onTaskCreated={(task) => syncToLocalSystem(task)}
  userContext={{
    timezone: 'America/New_York',
    preferences: userPreferences
  }}
/>
```

### 3. **Mobile Integration:**
```javascript
// PWA manifest for mobile app experience
{
  "name": "SISO AI Assistant",
  "short_name": "SISO AI",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

## 🧠 Learning & Improvement System

### Conversation Analysis:
```typescript
class ConversationAnalyzer {
  async analyzeConversation(conversation: Message[]): Promise<Insights> {
    // Extract patterns, preferences, and improvements
    const insights = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze this conversation for:
          1. User preferences and patterns
          2. Task creation accuracy
          3. Areas for improvement
          4. Time management insights`
        },
        {
          role: "user", 
          content: JSON.stringify(conversation)
        }
      ]
    });

    return JSON.parse(insights.choices[0].message.content);
  }

  async updateUserProfile(insights: Insights): Promise<void> {
    // Update user preferences and AI behavior
  }
}
```

## 💰 Cost Analysis

### MVP Version (Web Speech API + OpenAI):
- **OpenAI API**: ~$0.03 per 1k tokens (~$1-2 per 23-min session)
- **Hosting**: Free (Vercel)
- **Database**: Free tier (Supabase)
- **Total**: ~$50-100/month for daily use

### Premium Version (Whisper + ElevenLabs):
- **Whisper**: ~$0.006/minute (~$0.14 per session)
- **ElevenLabs**: ~$0.30 per 1k characters (~$2-3 per session)
- **OpenAI**: Same as above
- **Total**: ~$150-200/month for daily use

## 🚀 Implementation Phases

### Phase 1: MVP (2-3 weeks)
- Basic chat interface
- Web Speech API integration
- OpenAI conversation
- Simple task extraction
- Local storage for transcripts

### Phase 2: Integration (1-2 weeks)
- Database setup (Supabase)
- Task sync with main system
- 23-minute timer functionality
- Mode toggles

### Phase 3: Intelligence (2-3 weeks)
- Conversation analysis
- Learning system
- Improved task extraction
- Performance optimization

### Phase 4: Cross-Platform (1-2 weeks)
- PWA setup
- Embedding components
- Mobile optimization
- iPhone dictation improvements

## 🎯 Recommended Approach

**Start with:** Standalone AI chat app using web technologies

**Tech Stack:**
- **Frontend**: Next.js + React + TypeScript
- **Voice**: Web Speech API (upgrade to Whisper later)
- **AI**: OpenAI GPT-4 with function calling
- **Database**: Supabase
- **Hosting**: Vercel (free plan)

This gives you:
✅ Fastest development
✅ Lowest initial cost
✅ Easy integration 
✅ Room to upgrade

Want me to start building the MVP architecture?