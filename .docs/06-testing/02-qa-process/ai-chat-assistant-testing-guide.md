# AI Chat Assistant Testing Guide
*Complete testing strategy for enhanced AI chat features with API integrations*

## 🚀 Quick Start Testing

### 1. Environment Setup
```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Add required API keys to .env.local
GROQ_API_KEY=gsk_your_groq_key_here
OPENAI_API_KEY=sk_your_openai_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

### 2. Enable Testing Features
```typescript
// In your test environment, override feature flags
const testFeatureFlags = {
  enableChatThreads: true,
  enableConversationHistory: true,
  enablePersonalChatMode: true,
  enableMorningRoutineTimer: true,
  enableVoiceToText: true,
  enableAIProcessing: true,
  enableTaskCreation: true,
  enableInsightGeneration: true
};
```

## 🧪 Testing Levels

### Level 1: Component Testing (No API Keys Required)
Test UI components with mock data and disabled features.

### Level 2: Service Testing (API Keys Required)
Test backend services with real API integrations.

### Level 3: Integration Testing (Full Setup Required)
Test complete user workflows with all systems connected.

### Level 4: Production Testing (Staged Rollout)
Test with real users using feature flags.

## 📋 Pre-Testing Checklist

### API Keys Setup
- [ ] Groq API key (free tier: 30 requests/minute)
- [ ] OpenAI API key (optional, for comparison)
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database tables created (run schema)

### Development Environment
- [ ] Node.js 18+ installed
- [ ] npm dependencies installed
- [ ] Development server running
- [ ] Browser dev tools open
- [ ] Network tab monitoring API calls

## 🔧 Testing Implementation

### Quick Testing Setup

1. **Access Testing Interface**
   ```bash
   # Start development server
   npm run dev
   
   # Navigate to testing page
   http://localhost:3000/test/ai-assistant
   ```

2. **Environment Configuration**
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   
   # Add your API keys:
   GROQ_API_KEY=gsk_your_groq_key_here
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=sk_your_openai_key_here  # Optional
   ```

3. **Database Setup (Supabase)**
   ```sql
   -- Run this SQL in your Supabase SQL editor
   -- Copy from: ai-first/shared/database/ai-chat-schema.sql
   
   CREATE TABLE IF NOT EXISTS ai_chat_threads (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     mode TEXT NOT NULL DEFAULT 'general',
     personality TEXT NOT NULL DEFAULT 'helpful',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     message_count INTEGER DEFAULT 0,
     is_active BOOLEAN DEFAULT true,
     tags TEXT[] DEFAULT '{}',
     summary TEXT
   );
   
   -- Add other tables from schema file...
   ```

## 🎯 Testing Workflow

### Phase 1: Environment Setup
1. Open testing interface at `/test/ai-assistant`
2. Click "API Tests" button in bottom-left
3. Run "Test All APIs" to verify connections
4. Fix any API key issues before proceeding

### Phase 2: Feature Testing
1. Click "Feature Tests" button in bottom-right
2. Enable "Core Features Only" for basic testing
3. Test individual components (Morning Routine Timer)
4. Gradually enable more features

### Phase 3: Integration Testing
1. Navigate to "Integration Testing" tab
2. Test enhanced AIAssistantTab component
3. Verify backward compatibility
4. Check browser console for errors

### Phase 4: End-to-End Testing
1. Enable all features in feature flag tester
2. Test complete voice → AI → task workflow
3. Verify all systems work together
4. Check performance and responsiveness

## 🚨 Common Issues & Solutions

### API Connection Issues
```bash
# Groq API Issues
- Verify API key format: gsk_...
- Check rate limits (30 requests/minute free tier)
- Ensure environment variables are loaded

# Supabase Issues  
- Verify project URL format: https://xxx.supabase.co
- Check anon key permissions
- Ensure database tables are created

# Browser Issues
- Clear browser cache and localStorage
- Check browser console for CORS errors
- Verify HTTPS in production
```

### Component Integration Issues
```bash
# Import Errors
- Check file paths in imports
- Verify component exports
- Ensure dependencies are installed

# Feature Flag Issues
- Verify feature flags are properly passed to components
- Check default values in getDefaultFeatureFlags()
- Ensure backward compatibility is maintained

# Voice Input Issues
- Test in Chrome/Safari (better Web Speech API support)
- Check microphone permissions
- Test in quiet environment first
```

## 📊 Success Criteria

### ✅ Environment Setup Complete
- [ ] All API tests pass (Groq, Supabase, Web Speech)
- [ ] No console errors on page load
- [ ] Feature flag tester loads successfully
- [ ] Database connections work

### ✅ Feature Testing Complete
- [ ] Morning routine timer starts/stops correctly
- [ ] Chat threads can be created and managed
- [ ] Voice input records and provides feedback
- [ ] AI processing returns responses

### ✅ Integration Testing Complete
- [ ] Enhanced AIAssistantTab loads without errors
- [ ] All existing functionality preserved
- [ ] New features work when enabled
- [ ] Feature flags toggle properly

### ✅ End-to-End Testing Complete
- [ ] Voice input → AI processing pipeline works
- [ ] Tasks are created from AI responses
- [ ] Morning routine session completes successfully
- [ ] All data persists correctly
- [ ] Performance is acceptable (<2s response times)

## 🎮 Testing Commands

Add these to your package.json scripts:
```json
{
  "scripts": {
    "test:ai": "npm run dev & open http://localhost:3000/test/ai-assistant",
    "test:api": "node -e \"require('./ai-first/shared/utils/api-testing.utils.ts').runAllAPITests()\"",
    "setup:env": "cp .env.example .env.local && echo 'Add your API keys to .env.local'"
  }
}
```