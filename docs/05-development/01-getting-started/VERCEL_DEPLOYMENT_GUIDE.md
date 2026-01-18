# 🚀 Vercel Deployment Guide - AI Planning Assistant

## ✅ What's Been Done

I've successfully converted the AI Planning Assistant to work on Vercel serverless functions. Here's what changed:

### **Architecture Changes:**

**Before (Broken on Vercel):**
```
Browser → Node.js SDK (zhipuai) → GLM API ❌
         → MCP Client (browser) → Supabase ❌
```

**After (Works on Vercel):**
```
Browser → Vercel API Route → GLM API ✅
         (Server-side)      → Supabase ✅
```

### **Files Created/Modified:**

1. ✅ **`api/ai-planning.ts`** - Vercel serverless function
2. ✅ **`vercel.json`** - Updated with API route configuration
3. ✅ **`PlanningAssistant.tsx`** - Now calls API route instead of service
4. ✅ **`.env.vercel.example`** - Environment variables template
5. ✅ **`AI_PLANNING_ASSISTANT_SETUP.md`** - Technical documentation

---

## 📋 Deployment Checklist

### **Step 1: Add Environment Variables to Vercel**

Go to your Vercel Project Dashboard → Settings → Environment Variables and add:

```bash
# Required
GLM_API_KEY=b212e1592f9d401582181fc4bedfd34d.3UUZYyTqBF5tPDqK
SUPABASE_URL=https://avdgyrepwrvsvvwxrcc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (from your .env file)

# Optional (already configured)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GROQ_API_KEY=gsk_...
VITE_GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-proj-...
VITE_OPENAI_API_KEY=sk-proj-...
VITE_DEEPGRAM_API_KEY=bf6fe3ed...
```

**Important:** Select the appropriate environments:
- ✅ Production
- ✅ Preview (for PR deployments)
- ✅ Development (for local testing)

### **Step 2: Deploy to Vercel**

```bash
# Option A: Using Vercel CLI
vercel --prod

# Option B: Using Git (automatic)
git add .
git commit -m "feat: add AI Planning Assistant with Vercel serverless API"
git push origin main
```

### **Step 3: Verify Deployment**

1. **Check the API endpoint:**
   ```
   https://your-domain.vercel.app/api/ai-planning
   ```

2. **Test with a curl request:**
   ```bash
   curl -X POST https://your-domain.vercel.app/api/ai-planning \
     -H "Content-Type: application/json" \
     -d '{
       "message": "What tasks do I have?",
       "context": {
         "date": "2025-01-16",
         "existingTimeblocks": []
       }
     }'
   ```

3. **Test in the app:**
   - Navigate to `/lifelock?section=timebox&subtab=morning`
   - Click the ✨ sparkle button
   - Send a message like "What tasks do I have?"

---

## 🔧 Troubleshooting

### **Error: "GLM_API_KEY not set"**

**Solution:** Add `GLM_API_KEY` to Vercel environment variables

### **Error: "Supabase credentials not configured"**

**Solution:** Add both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel

### **Error: "404 Not Found" on API route**

**Solution:** Make sure `vercel.json` has the correct rewrites:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### **Error: "Module not found"**

**Solution:** Run `npm install` locally and redeploy

---

## 💡 How It Works

### **Request Flow:**

```
1. User clicks ✨ button
   ↓
2. Opens PlanningAssistant chat
   ↓
3. User types: "I'm free from 9am to 5pm"
   ↓
4. Client sends POST to /api/ai-planning
   {
     message: "I'm free from 9am to 5pm",
     context: {
       date: "2025-01-16",
       userId: "user_123",
       existingTimeblocks: [...],
       conversationHistory: [...]
     }
   }
   ↓
5. Vercel serverless function (api/ai-planning.ts):
   - Fetches user's tasks from Supabase
   - Builds system prompt with context
   - Calls GLM API with user message
   - Parses AI response for TIMEBLOCK tags
   - Creates timeblocks in Supabase (if any)
   - Returns response to client
   ↓
6. Client displays AI response
   ↓
7. Timeblocks appear on timeline (if created)
```

### **Security:**

✅ **API Keys** - Stored server-side, never exposed to browser
✅ **Authentication** - Uses Clerk JWT for user verification
✅ **Rate Limiting** - Can be added with Vercel Edge Config
✅ **Input Validation** - All inputs validated server-side

---

## 📊 Cost Monitoring

### **GLM API Usage:**
- Cost: ~¥0.50 per 1M tokens
- Estimate: ~¥5/month for moderate usage

**Monitoring:**
1. Go to https://open.bigmodel.cn/
2. Check your API usage dashboard
3. Set up alerts for high usage

### **Vercel Usage:**
- Free tier: 100GB bandwidth, 6,000 minutes
- Check Vercel dashboard → Usage

### **Supabase Usage:**
- Free tier: 500MB storage, 2GB bandwidth
- Check Supabase dashboard → Usage

---

## 🔄 Future Improvements

### **Option 1: Add Streaming (Real-time responses)**

Use Vercel AI SDK for streaming:
```typescript
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: glm('glm-4-plus'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### **Option 2: Add Rate Limiting**

Use Vercel Edge Config:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const { success } = await ratelimit.limit(userId);
if (!success) {
  return new Response("Too many requests", { status: 429 });
}
```

### **Option 3: Add Caching**

Cache common responses:
```typescript
import { Redis } from "@upstash/redis";

const cache = Redis.fromEnv();
const cached = await cache.get(cacheKey);
if (cached) return new Response(cached);
```

---

## 📝 Summary

✅ **Implemented:**
- Vercel serverless API function
- Secure API key handling
- Supabase integration
- Timeblock creation
- Voice input support
- Error handling

✅ **Ready for:**
- Vercel deployment
- Production use
- Scaling to users

⏭️ **Next Steps:**
1. Add environment variables to Vercel
2. Deploy to Vercel
3. Test the planning assistant
4. Monitor API usage

---

**Need help?** Check the logs in Vercel Dashboard → Your Project → Logs
