# 🚀 Local Development Setup - AI Planning Assistant

## **The Problem:**

The GLM AI SDK (`zhipuai-sdk-nodejs-v4`) uses Node.js modules that **cannot run in the browser**. When you try to use the Planning Assistant locally, you get this error:

```
SyntaxError: The requested module '/node_modules/jsonwebtoken/index.js'
does not provide an export named 'default'
```

## **The Solution:**

Run a **local API server** alongside Vite that handles the AI planning requests.

---

## **🎯 Quick Start (2 Steps):**

### **Step 1: Start the Local API Server**

Open a **new terminal** and run:

```bash
node api/local-server.js
```

You should see:

```
🚀 AI Planning API Server running!

   Local: http://localhost:3001/api/ai-planning

✅ Server ready to handle Planning Assistant requests!
```

### **Step 2: Start the Vite Dev Server (Another Terminal)**

```bash
npm run dev
```

---

## **🧪 Test It:**

1. Open your browser to: `http://localhost:4249/lifelock?section=timebox`
2. Click the **✨ sparkle button** (bottom-right)
3. Try these messages:
   - "What tasks do I have?"
   - "I'm free from 9am to 5pm"
   - "Schedule 2 hours of deep work"

---

## **📝 How It Works:**

```
┌─────────────────────────────────────────────────┐
│           Your Development Environment            │
├─────────────────────────────────────────────────┤
│                                                  │
│  Terminal 1:          Terminal 2:                │
│  ┌──────────────┐   ┌──────────────┐            │
│  │ Local API    │   │ Vite Dev     │            │
│  │ Server        │   │ Server       │            │
│  │ Port: 3001    │   │ Port: 4249    │            │
│  │              │   │              │            │
│  │ ✅ Running    │   │ ✅ Running    │            │
│  └──────────────┘   └──────────────┘            │
│         │                    │                  │
│         └────────┬───────────┘                  │
│                  ▼                              │
│         ┌────────────────┐                      │
│         │ Planning       │                      │
│         │ Assistant      │                      │
│         │ (Browser)      │                      │
│         └────────────────┘                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Flow:**
1. Planning Assistant calls `http://localhost:3001/api/ai-planning`
2. Local API server processes the request
3. Calls GLM API and Supabase
4. Returns response to browser
5. Timeblocks created automatically! ✅

---

## **🔧 Troubleshooting:**

### **"ECONNREFUSED" error**

→ Make sure the local API server is running on port 3001

Check: `http://localhost:3001/api/ai-planning` should return:
```json
{"error":"Method not allowed"} (with OPTIONS request)
```

### **"GLM_API_KEY not set"**

→ Make sure your `.env` file has:
```
GLM_API_KEY=531d930091214b2a985befa0210b9185.3Mb5KI1czB84IPUb
```

### **API server crashes**

→ Check the terminal where you ran `node api/local-server.js` for errors

---

## **🚀 Deploying to Vercel:**

When you deploy to Vercel, you **don't need** the local API server:

1. Add `GLM_API_KEY` to Vercel environment variables
2. Deploy normally
3. The Planning Assistant will automatically switch to using Vercel's serverless functions

---

## **📚 Summary:**

| Environment | API Endpoint | How to Run |
|-------------|---------------|------------|
| **Local Dev** | `localhost:3001/api/ai-planning` | `node api/local-server.js` |
| **Vercel** | `/api/ai-planning` | Automatic (serverless) |

---

## **✅ Checklist:**

- [ ] Terminal 1: `node api/local-server.js` ✅
- [ ] Terminal 2: `npm run dev` ✅
- [ ] Browser: `http://localhost:4249/lifelock?section=timebox`
- [ ] Click ✨ button
- [ ] Test: "What tasks do I have?"

---

**That's it! Two terminals and you're ready to develop! 🎉**
