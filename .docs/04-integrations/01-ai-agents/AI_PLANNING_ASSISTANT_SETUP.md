# AI Planning Assistant - Technical Stack & Setup Guide

## 📋 Current Stack Overview

### **API Keys & Services Used:**

| Service | API Key | Purpose | Status |
|---------|---------|---------|--------|
| **GLM (Zhipu AI)** | `GLM_API_KEY` ✅ | AI chat completions for planning | ✅ Configured |
| **Supabase** | `VITE_SUPABASE_ANON_KEY` ✅ | Read tasks from database | ✅ Configured |
| **Clerk** | `VITE_CLERK_PUBLISHABLE_KEY` ✅ | User authentication | ✅ Configured |

### **Current Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PlanningAssistant.tsx                                      │
│  ├─ Chat UI with Framer Motion                              │
│  ├─ Voice Input (VoiceService)                              │
│  └─ Calls PlanningService                                    │
│         │                                                    │
│         ▼                                                    │
│  PlanningService.ts                                         │
│  ├─ GLMMCPClient (zhipuai-sdk-nodejs-v4)                   │
│  │   └─ GLM API for AI chat                                 │
│  └─ SupabaseMCPClient (@supabase/supabase-js)              │
│      └─ Read tasks from Supabase                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
              │                    │
              ▼                    ▼
    ┌──────────────┐      ┌──────────────┐
    │  GLM API     │      │  Supabase    │
    │  (Zhipu AI)  │      │  Database    │
    └──────────────┘      └──────────────┘
```

## ⚠️ **CRITICAL ISSUE FOR VERCEL DEPLOYMENT**

### **Problem:**
The current implementation uses **server-side Node.js packages** that **cannot run in Vercel serverless functions or the browser**:

1. **`zhipuai-sdk-nodejs-v4`** - Uses Node.js built-ins (`crypto`, `stream`, `util`, `buffer`)
2. **Direct MCP clients in browser** - Security risk (exposes API keys)
3. **No serverless API routes** - Currently running entirely client-side

### **Why This Breaks on Vercel:**

- Vercel serverless functions run in Edge/Node environments
- The `zhipuai-sdk-nodejs-v4` package requires Node.js runtime
- Browser cannot use Node.js packages (see build warnings about externalized modules)
- API keys would be exposed in client-side code

## ✅ **Recommended Solution for Vercel**

### **Option 1: Vercel AI SDK + GLM API (RECOMMENDED)**

**Why:**
- ✅ Built specifically for Vercel/serverless
- ✅ Supports streaming responses
- ✅ Handles API edge cases
- ✅ Works with any AI provider (including GLM)

**Architecture:**
```
Browser → Vercel API Route → Vercel AI SDK → GLM API
                ↓
          Supabase (tasks)
```

**Implementation:**
```typescript
// app/api/planning/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Configure GLM as OpenAI-compatible
const glm = openai({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.GLM_API_KEY,
});

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = streamText({
    model: glm.chat('glm-4-plus'),
    messages,
    system: buildSystemPrompt(context),
  });

  return result.toDataStreamResponse();
}
```

**Pros:**
- ✅ Works perfectly on Vercel
- ✅ No client-side API key exposure
- ✅ Streaming responses
- ✅ Automatic retries/error handling

**Cons:**
- ❌ Need to refactor current code
- ❌ Need to add API route

---

### **Option 2: Custom Vercel API Route with HTTP Fetch**

**Why:**
- ✅ No additional dependencies
- ✅ Full control over implementation
- ✅ Can keep existing code structure

**Implementation:**
```typescript
// app/api/ai/planning/route.ts (Next.js App Router)
// OR pages/api/ai/planning.ts (Pages Router)

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // or 'edge'

export async function POST(req: NextRequest) {
  const { message, context } = await req.json();

  // Call GLM API directly
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'glm-4-plus',
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  const result = parseAIResponse(data);

  // Create timeblocks if needed
  if (result.createdTimeblocks.length > 0) {
    // Save to Supabase using service role key
    await saveTimeblocks(result.createdTimeblocks, context.userId);
  }

  return NextResponse.json(result);
}
```

**Pros:**
- ✅ Works on Vercel
- ✅ Keeps existing logic
- ✅ No new dependencies

**Cons:**
- ❌ No streaming (unless you implement it)
- ❌ More manual error handling

---

### **Option 3: Keep Current Architecture + Browser Polyfills (NOT RECOMMENDED)**

**Why not:**
- ❌ Exposes `GLM_API_KEY` in browser code
- ❌ Node.js packages don't work in browser (see build warnings)
- ❌ Security vulnerability
- ❌ Larger bundle size

---

## 🚀 **Recommended Implementation Plan**

### **Step 1: Add Vercel AI SDK**
```bash
npm install ai @ai-sdk/openai
```

### **Step 2: Create API Route**
```typescript
// src/app/api/ai/planning/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const glm = openai({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.GLM_API_KEY!,
});

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = streamText({
    model: glm.chat('glm-4-plus'),
    messages,
    system: buildSystemPrompt(context),
  });

  return result.toDataStreamResponse();
}
```

### **Step 3: Update Client Component**
```typescript
// Use Vercel AI SDK useChat hook
import { useChat } from 'ai/react';

function PlanningAssistant() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/ai/planning',
    body: {
      context: {
        date: selectedDate,
        userId: user?.id,
        existingTimeblocks: timeBlocks,
      },
    },
  });

  // ... rest of component
}
```

### **Step 4: Update Vercel Environment Variables**
```bash
# In Vercel Dashboard → Settings → Environment Variables
GLM_API_KEY=b212e1592f9d401582181fc4bedfd34d.3UUZYyTqBF5tPDqK
SUPABASE_URL=https://avdgyrepwrvsvvwxrcc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # Use service role for server-side writes
```

---

## 📊 **Cost Analysis**

| Service | Cost | Notes |
|---------|------|-------|
| GLM API | ¥0.50/1M tokens | Very affordable |
| Supabase | Free tier | 500MB storage, 2GB bandwidth |
| Vercel | Free tier | 100GB bandwidth, 6,000 minutes |
| **Total** | **~¥5/month** | For moderate usage |

---

## 🔐 **Security Best Practices**

1. ✅ **Never expose API keys in client code**
2. ✅ **Use environment variables on Vercel**
3. ✅ **Use Supabase Service Role Key for server operations**
4. ✅ **Validate user authentication (Clerk JWT)**
5. ✅ **Rate limit API calls**

---

## 📝 **Next Steps**

1. **Choose implementation option** (I recommend Option 1)
2. **Install dependencies**
3. **Create API route**
4. **Update client component**
5. **Test locally**
6. **Deploy to Vercel**
7. **Monitor API usage and costs**

Would you like me to implement Option 1 (Vercel AI SDK) or Option 2 (Custom API Route)?
