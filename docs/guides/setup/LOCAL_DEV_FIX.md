# 🔧 Development vs Production Setup

## **The Problem:**

Vite (local dev server) doesn't support serverless API routes like Vercel does. When running locally, `/api/ai-planning` returns 404.

## **The Solution:**

The PlanningAssistant now **automatically detects** the environment and uses the appropriate method:

### **📍 Local Development (localhost)**
```
PlanningAssistant → planning.service.ts → GLM API + Supabase
                  (Client-side)
```

### **📍 Production (Vercel)**
```
PlanningAssistant → /api/ai-planning → GLM API + Supabase
                  (Serverless function)
```

---

## **How It Works:**

```typescript
// In PlanningAssistant.tsx
const isLocal = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

if (isLocal) {
  // Use client-side service (direct API calls from browser)
  const { getPlanningService } = await import('@/services/ai/planning.service');
  result = await planningService.plan(message, context);
} else {
  // Use Vercel serverless function (secure, server-side)
  const response = await fetch('/api/ai-planning', {...});
  result = await response.json();
}
```

---

## **⚠️ Security Note for Local Development:**

When running **locally**, the client-side service:
- ✅ Works fine for development
- ⚠️ Exposes `GLM_API_KEY` in browser (acceptable for local dev)
- ❌ Should NOT be used in production

When deployed to **Vercel**:
- ✅ API keys stay server-side (secure)
- ✅ No exposure to browser
- ✅ Production-ready

---

## **🚀 How to Deploy:**

### **Step 1: Test Locally First**

```bash
npm run dev
```

1. Go to `http://localhost:4249/lifelock?section=timebox`
2. Click the ✨ sparkle button
3. Try: "What tasks do I have?"
4. Should work! ✅

### **Step 2: Add Environment Variables to Vercel**

Go to **Vercel Dashboard → Settings → Environment Variables**:

```bash
GLM_API_KEY=b212e1592f9d401582181fc4bedfd34d.3UUZYyTqBF5tPDqK
SUPABASE_URL=https://avdgyrepwrvsvvwxrcc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (get from your .env file)
```

### **Step 3: Deploy**

```bash
git add .
git commit -m "feat: add AI Planning Assistant with local/prod modes"
git push
```

### **Step 4: Test on Production**

Visit your Vercel URL and test the Planning Assistant - it should work exactly the same!

---

## **🔍 Troubleshooting:**

### **Local dev not working?**

Check browser console for errors. Common issues:
- `GLM_API_KEY` not set in `.env` file
- Supabase credentials missing
- CORS errors (if calling APIs directly)

### **Production not working?**

Check Vercel logs:
1. Go to Vercel Dashboard → Your Project
2. Click "Logs"
3. Look for API errors

Common issues:
- Environment variables not set on Vercel
- Serverless function timeout
- Supabase connection issues

---

## **📊 Architecture Comparison:**

| Aspect | Local Dev | Production (Vercel) |
|--------|-----------|---------------------|
| **API Calls** | Browser → GLM API | Server → GLM API |
| **Security** | ⚠️ Keys in browser | ✅ Keys server-side |
| **Performance** | ✅ Fast (direct) | ✅ Fast (serverless) |
| **CORS** | ⚠️ May need config | ✅ Handled by Vercel |
| **Debugging** | ✅ Easy (console) | ⚠️ Check Vercel logs |

---

## **✅ Summary:**

- **Works locally** - Yes, using client-side service
- **Works on Vercel** - Yes, using serverless functions
- **Automatic detection** - No code changes needed
- **Secure in production** - API keys stay server-side
- **Easy to develop** - Just run `npm run dev`

**Just test locally, add env vars to Vercel, and deploy!** 🚀
