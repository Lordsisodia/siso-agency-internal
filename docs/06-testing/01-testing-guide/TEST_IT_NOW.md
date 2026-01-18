# 🎯 Quick Start - AI Planning Assistant (Fixed!)

## ✅ **Ready to Test!**

The issue has been fixed! Here's how to test the Planning Assistant:

---

## **🚀 Option 1: Two-Terminal Setup (Recommended)**

### **Terminal 1 - Start the API Server:**

```bash
node api/local-server.js
```

You should see:
```
🚀 AI Planning API Server running!
   Local: http://localhost:3001/api/ai-planning
✅ Server ready to handle Planning Assistant requests!
```

### **Terminal 2 - Start Vite:**

```bash
npm run dev
```

### **Test in Browser:**

1. Go to: `http://localhost:4249/lifelock?section=timebox`
2. Click the **✨ sparkle button** (bottom-right)
3. Try these messages:
   - "What tasks do I have?"
   - "I'm free from 9am to 5pm today"
   - "Schedule 2 hours of deep work in the morning"

---

## **🚀 Option 2: One-Command Setup (Alternative)**

If you have `concurrently` installed, run:

```bash
npm run dev:full
```

This starts both the API server and Vite in one terminal!

---

## **📝 What Changed:**

**Before (Broken):**
- Client tried to use Node.js SDK in browser ❌
- Error: `jsonwebtoken` module not found ❌

**After (Fixed):**
- Local API server handles GLM calls ✅
- Browser just makes HTTP requests ✅
- Same as Vercel production setup ✅

---

## **🎨 Try These Commands:**

### **Task Planning:**
- "What tasks do I have?"
- "What should I work on today?"
- "Help me prioritize my tasks"

### **Scheduling:**
- "I'm free from 9am to 5pm"
- "Schedule 2 hours of deep work"
- "Add a meeting from 2pm to 3pm"
- "I'm sleeping from 11pm to 7am"

### **Timeblock Creation:**
- "Schedule deep work from 9am to 11am"
- "Add a lunch break from 12pm to 1pm"
- "Block out gym time from 5pm to 6pm"

---

## **🎨 Color-Coded Timeblocks:**

| Category | Color | Example Command |
|----------|-------|-----------------|
| **Deep Work** | 🔵 Light Blue | "Schedule 2 hours of deep work" |
| **Light Work** | 🟢 Light Green | "Add time for emails" |
| **Meetings** | 🔴 Red | "Add a meeting from 2pm to 3pm" |
| **Sleep** | ⚫ Black/Dark | "I'm sleeping from 11pm to 7am" |
| **Breaks** | 🟡 Yellow | "Add a lunch break" |
| **Availability** | ⚪ Gray | "I'm available from 9am to 5pm" |

---

## **🚀 Deploying to Vercel:**

When you're ready to deploy:

1. **Add environment variables to Vercel:**
   - `GLM_API_KEY=531d930091214b2a985befa0210b9185.3Mb5KI1czB84IPUb`
   - `SUPABASE_URL=https://avdgyrepwrvsvwgxrccr.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...`

2. **Deploy:**
   ```bash
   git add .
   git commit -m "feat: add AI Planning Assistant"
   git push
   ```

3. **Test on Vercel:**
   - Visit your Vercel URL
   - Planning Assistant automatically switches to serverless functions!
   - No local server needed ✅

---

## **📚 Documentation:**

- `LOCAL_DEV_SETUP.md` - Detailed local development guide
- `VERCEL_DEPLOYMENT_GUIDE.md` - Full Vercel deployment guide
- `IMPLEMENTATION_SUMMARY.md` - Complete feature overview
- `ENVIRONMENT_VARIABLES.md` - Environment variables reference

---

## **🆘 Troubleshooting:**

### **"ECONNREFUSED" when testing**
→ Make sure you ran `node api/local-server.js` in a separate terminal

### **"API error: 500"**
→ Check the API server terminal for errors

### **"What tasks do I have?" returns no tasks**
→ This is normal if you haven't created tasks yet. Try:
  - "I'm free from 9am to 5pm"
  - "Schedule 2 hours of deep work"

---

**That's it! Start the API server and test away! 🎉**

The Planning Assistant will:
- ✅ Read your tasks from Supabase
- ✅ Suggest optimal scheduling
- ✅ Create timeblocks automatically
- ✅ Remember conversation context
- ✅ Work with voice input (🎤 button)
