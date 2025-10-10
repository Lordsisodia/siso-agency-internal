# 🧠 AI Thought Dump Feature

**Voice-to-task AI assistant for morning routines**  
**Architecture**: Hybrid - Feature folder + Shared services

## 📁 Final Structure (Hybrid Approach)

```
📦 Shared Services (App-Level)
src/services/
└── voice/                          ✅ Truly shared infrastructure
    ├── voice.service.ts            (Used by 9+ components)
    └── index.ts

📦 Feature Folder (AI Thought Dump specific)
src/ecosystem/internal/lifelock/features/ai-thought-dump/
├── index.ts                        ✅ Public API
├── README.md                       ✅ Documentation
│
├── components/                     ✅ UI Components
│   ├── SimpleThoughtDumpPage.tsx
│   └── ThoughtDumpResults.tsx
│
├── services/                       ✅ Feature-specific services
│   ├── ai/
│   │   ├── gpt5Nano.service.ts
│   │   ├── conversationManager.service.ts
│   │   └── taskProcessor.service.ts
│   └── tools/
│       ├── taskQueryTools.ts
│       ├── taskUpdateTools.ts
│       ├── toolDefinitions.ts
│       └── toolExecutor.ts
│
├── types/                          ✅ Type definitions
│   └── index.ts
│
└── config/                         ✅ Configuration
    ├── prompts.ts
    └── constants.ts
```

### 🎯 Key Architecture Decisions

**Shared Services (`/services/voice/`):**
- ✅ Voice recognition service (used by Tasks, Admin, LifeLock, Shared UI)
- ✅ Pure infrastructure - no feature-specific logic
- ✅ Imported by: 9+ different components

**Feature Services (`features/ai-thought-dump/services/`):**
- ✅ AI conversation logic (specific to thought dump)
- ✅ Task processing (specific to LifeLock)
- ✅ Tool executors (specific to morning routine)
- ✅ Feature owns its domain logic

## 🚀 Usage

### Hybrid Import Strategy

```typescript
// ✅ SHARED INFRASTRUCTURE - Import from /services
import { voiceService } from '@/services/voice';

// ✅ FEATURE-SPECIFIC - Import from feature folder
import { 
  SimpleThoughtDumpPage, 
  ThoughtDumpResults,
  lifeLockVoiceTaskProcessor 
} from '@/ecosystem/internal/lifelock/features/ai-thought-dump';

import type { Message, ThoughtDumpResult } from '@/ecosystem/internal/lifelock/features/ai-thought-dump';

// ❌ WRONG - Don't import from internal feature folders
import { gpt5NanoService } from '@/ecosystem/internal/lifelock/features/ai-thought-dump/services/ai/...';
```

### Import Decision Tree

**When to import from `/services`:**
- ✅ Voice recognition (shared by 9+ components)
- ✅ Pure infrastructure services
- ✅ Used by multiple features

**When to import from feature folder:**
- ✅ UI components (SimpleThoughtDumpPage, ThoughtDumpResults)
- ✅ AI conversation logic
- ✅ Task processing
- ✅ Feature-specific types

### Using the Component

```typescript
import { SimpleThoughtDumpPage } from '@/ecosystem/internal/lifelock/features/ai-thought-dump';

function MyComponent() {
  const [selectedDate] = useState(new Date());

  return (
    <SimpleThoughtDumpPage
      selectedDate={selectedDate}
      onBack={() => console.log('Back pressed')}
      onComplete={(result) => console.log('Tasks:', result)}
    />
  );
}
```

## 🎯 Features

- **Voice Recognition**: Continuous speech-to-text with automatic accumulation
- **AI Conversation**: GPT-5 Nano powered task planning assistant
- **Tool Execution**: AI can query and update tasks directly
- **Text-to-Speech**: AI speaks responses back to user
- **Session Memory**: Conversation history persisted across sessions

## 🔧 Configuration

All prompts and constants are in `/config`:

```typescript
import { GREETING_MESSAGE, MORNING_ROUTINE_SYSTEM_PROMPT } from './config/prompts';
import { VOICE_CONFIG_DEFAULTS, AI_MODEL_NAME } from './config/constants';
```

## 📦 Services

### Voice Service
Handles speech recognition and TTS:
```typescript
voiceService.startListening(onResult, onError, config);
voiceService.speak(text, config);
```

### Task Processor
Converts voice input to structured tasks:
```typescript
const result = await lifeLockVoiceTaskProcessor.processThoughtDump(transcript);
```

## 🧪 Testing

```bash
npm run typecheck  # Verify no TypeScript errors
npm run dev        # Test in browser
```

## 📝 Adding New Features

1. Add service to appropriate folder (`/services/ai`, `/services/voice`, etc.)
2. Export from `/index.ts` if needed externally
3. Update types in `/types/index.ts`
4. Add config to `/config` if applicable

## 🔄 Migration from Old Structure

**Before (Scattered):**
```typescript
import { voiceService } from '@/services/voiceService';
import { lifeLockVoiceTaskProcessor } from '@/services/lifeLockVoiceTaskProcessor';
import { chatMemoryService } from '@/services/chatMemoryService';
import { SimpleThoughtDumpPage } from '@/ecosystem/internal/lifelock/components/SimpleThoughtDumpPage';
```

**After (Consolidated):**
```typescript
import { 
  SimpleThoughtDumpPage,
  voiceService,
  lifeLockVoiceTaskProcessor 
} from '@/ecosystem/internal/lifelock/features/ai-thought-dump';
```

---

**Last Updated**: 2025-10-10  
**Status**: ✅ Active and consolidated
